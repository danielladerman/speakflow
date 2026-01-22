/**
 * API Service - Communication with SpeakFlow backend.
 */

import {
  SessionCreateResponse,
  SessionStatusResponse,
  SessionReport,
} from '../types/contracts';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
const API_PREFIX = '/api/v1';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new ApiError(response.status, error.detail || response.statusText);
  }
  return response.json();
}

export const api = {
  /**
   * Upload audio and create a new session.
   */
  async createSession(audioUri: string, contentType: string): Promise<SessionCreateResponse> {
    const formData = new FormData();

    // Create file blob from URI
    const filename = `recording.${contentType === 'audio/wav' ? 'wav' : 'm4a'}`;
    formData.append('audio', {
      uri: audioUri,
      type: contentType,
      name: filename,
    } as any);

    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/sessions/`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    return handleResponse<SessionCreateResponse>(response);
  },

  /**
   * Get session processing status.
   */
  async getSessionStatus(sessionId: string): Promise<SessionStatusResponse> {
    const response = await fetch(
      `${API_BASE_URL}${API_PREFIX}/sessions/${sessionId}/status`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      },
    );

    return handleResponse<SessionStatusResponse>(response);
  },

  /**
   * Get full session report with scores and coaching.
   */
  async getSessionReport(sessionId: string): Promise<SessionReport> {
    const response = await fetch(
      `${API_BASE_URL}${API_PREFIX}/sessions/${sessionId}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      },
    );

    return handleResponse<SessionReport>(response);
  },

  /**
   * Poll for session completion.
   */
  async waitForCompletion(
    sessionId: string,
    onProgress?: (status: SessionStatusResponse) => void,
    maxAttempts: number = 60,
    intervalMs: number = 2000,
  ): Promise<SessionReport> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getSessionStatus(sessionId);

      if (onProgress) {
        onProgress(status);
      }

      if (status.status === 'completed') {
        return this.getSessionReport(sessionId);
      }

      if (status.status === 'failed') {
        throw new ApiError(500, status.error_message || 'Processing failed');
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    throw new ApiError(408, 'Timeout waiting for processing to complete');
  },
};

export { ApiError };
