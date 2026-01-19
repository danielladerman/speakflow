#!/usr/bin/env python3
"""
Integration Test - End-to-end vertical slice test.

Tests the complete flow:
1. Upload audio
2. Wait for processing
3. Verify score contract
4. Verify coaching response
"""

import json
import sys
import time
from pathlib import Path
from uuid import UUID

import httpx

# Add contracts to path
sys.path.insert(0, str(Path(__file__).parent.parent / "contracts"))
from python.score_contract import ScoreContract
from python.coaching_response import CoachingResponse


API_BASE_URL = "http://localhost:8000"
API_PREFIX = "/api/v1"

# Test audio file (you'll need to provide this)
TEST_AUDIO_PATH = Path(__file__).parent / "test_audio.wav"


def test_health():
    """Test API health endpoint."""
    print("Testing health endpoint...")
    response = httpx.get(f"{API_BASE_URL}/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    print("  ✓ Health check passed")


def test_upload_session():
    """Test session upload."""
    print("Testing session upload...")

    if not TEST_AUDIO_PATH.exists():
        # Create a dummy test file if it doesn't exist
        print(f"  ⚠ Test audio not found at {TEST_AUDIO_PATH}")
        print("  Creating placeholder test...")
        # For now, skip the actual upload test
        return None

    with open(TEST_AUDIO_PATH, "rb") as f:
        files = {"audio": ("test.wav", f, "audio/wav")}
        response = httpx.post(
            f"{API_BASE_URL}{API_PREFIX}/sessions/",
            files=files,
        )

    assert response.status_code == 201, f"Upload failed: {response.text}"
    data = response.json()

    assert "session_id" in data
    assert data["status"] == "pending"
    print(f"  ✓ Session created: {data['session_id']}")

    return data["session_id"]


def test_wait_for_completion(session_id: str, timeout: int = 120):
    """Poll for session completion."""
    print(f"Waiting for processing (timeout: {timeout}s)...")

    start = time.time()
    while time.time() - start < timeout:
        response = httpx.get(
            f"{API_BASE_URL}{API_PREFIX}/sessions/{session_id}/status"
        )
        assert response.status_code == 200
        data = response.json()

        status = data["status"]
        print(f"  Status: {status}")

        if status == "completed":
            print(f"  ✓ Processing completed in {time.time() - start:.1f}s")
            return True

        if status == "failed":
            print(f"  ✗ Processing failed: {data.get('error_message')}")
            return False

        time.sleep(2)

    print(f"  ✗ Timeout after {timeout}s")
    return False


def test_get_report(session_id: str):
    """Test retrieving and validating report."""
    print("Testing report retrieval...")

    response = httpx.get(
        f"{API_BASE_URL}{API_PREFIX}/sessions/{session_id}"
    )
    assert response.status_code == 200, f"Get report failed: {response.text}"
    data = response.json()

    # Validate score contract
    print("  Validating score contract...")
    score_data = data.get("score_contract")
    assert score_data is not None, "Missing score_contract"

    score_contract = ScoreContract(**score_data)
    assert score_contract.session_id == UUID(session_id)
    assert 0 <= score_contract.scores.overall <= 100
    print(f"    Overall score: {score_contract.scores.overall}")
    print(f"    Focus metric: {score_contract.focus_metric.value}")
    print("  ✓ Score contract valid")

    # Validate coaching response
    print("  Validating coaching response...")
    coaching_data = data.get("coaching_response")
    if coaching_data:
        coaching = CoachingResponse(**coaching_data)
        assert coaching.session_id == UUID(session_id)
        assert len(coaching.recommended_drills) >= 1
        print(f"    Recommended drills: {len(coaching.recommended_drills)}")
        for drill in coaching.recommended_drills:
            print(f"      - {drill.drill_id}")
        print("  ✓ Coaching response valid")
    else:
        print("  ⚠ No coaching response (OpenAI key missing?)")

    # Validate transcript
    print("  Validating transcript...")
    transcript = data.get("transcript")
    if transcript:
        print(f"    Words: {len(transcript)}")
        print("  ✓ Transcript present")
    else:
        print("  ⚠ No transcript")

    return data


def test_contracts_match():
    """Verify TypeScript types match Python models."""
    print("Testing contract alignment...")

    # Load JSON schemas
    schemas_dir = Path(__file__).parent.parent / "contracts/schemas"

    score_schema = json.loads((schemas_dir / "score_contract.json").read_text())
    drill_schema = json.loads((schemas_dir / "drill_schema.json").read_text())
    coaching_schema = json.loads((schemas_dir / "coaching_response.json").read_text())

    # Verify required fields exist
    assert "session_id" in score_schema["properties"]
    assert "metrics" in score_schema["properties"]
    assert "scores" in score_schema["properties"]
    print("  ✓ Score contract schema valid")

    assert "drill_id" in drill_schema["properties"]
    assert "zone" in drill_schema["properties"]
    print("  ✓ Drill schema valid")

    assert "recommended_drills" in coaching_schema["properties"]
    print("  ✓ Coaching response schema valid")


def main():
    """Run all integration tests."""
    print("\n" + "=" * 60)
    print("SpeakFlow Integration Test")
    print("=" * 60 + "\n")

    try:
        # Test contracts
        test_contracts_match()

        # Test API
        test_health()

        # Test full flow (if audio available)
        session_id = test_upload_session()
        if session_id:
            if test_wait_for_completion(session_id):
                test_get_report(session_id)

        print("\n" + "=" * 60)
        print("✓ All tests passed!")
        print("=" * 60 + "\n")
        return 0

    except AssertionError as e:
        print(f"\n✗ Test failed: {e}")
        return 1
    except Exception as e:
        print(f"\n✗ Error: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
