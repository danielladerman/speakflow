"""
Object storage abstraction for Worker.

Supports S3 and local filesystem backends.
"""

import os
from abc import ABC, abstractmethod
from pathlib import Path
from typing import BinaryIO

import boto3
from botocore.exceptions import ClientError

from ..config import settings


class StorageClient(ABC):
    """Abstract storage client interface."""

    @abstractmethod
    async def upload(self, key: str, file: BinaryIO, content_type: str) -> str:
        """Upload a file to storage."""
        pass

    @abstractmethod
    async def download(self, key: str) -> bytes:
        """Download a file from storage."""
        pass

    @abstractmethod
    async def exists(self, key: str) -> bool:
        """Check if a file exists in storage."""
        pass


class S3StorageClient(StorageClient):
    """S3-compatible storage client."""

    def __init__(self):
        self._client = boto3.client(
            "s3",
            region_name=settings.s3_region,
            endpoint_url=settings.s3_endpoint_url,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
        )
        self._bucket = settings.s3_bucket

    async def upload(self, key: str, file: BinaryIO, content_type: str) -> str:
        """Upload file to S3."""
        self._client.upload_fileobj(
            file,
            self._bucket,
            key,
            ExtraArgs={"ContentType": content_type},
        )
        return f"s3://{self._bucket}/{key}"

    async def download(self, key: str) -> bytes:
        """Download file from S3."""
        response = self._client.get_object(Bucket=self._bucket, Key=key)
        return response["Body"].read()

    async def exists(self, key: str) -> bool:
        """Check if file exists in S3."""
        try:
            self._client.head_object(Bucket=self._bucket, Key=key)
            return True
        except ClientError:
            return False


class LocalStorageClient(StorageClient):
    """Local filesystem storage client for development."""

    def __init__(self):
        self._base_path = Path(settings.local_storage_path)
        self._base_path.mkdir(parents=True, exist_ok=True)

    async def upload(self, key: str, file: BinaryIO, content_type: str) -> str:
        """Upload file to local filesystem."""
        file_path = self._base_path / key
        file_path.parent.mkdir(parents=True, exist_ok=True)
        with open(file_path, "wb") as f:
            f.write(file.read())
        return str(file_path)

    async def download(self, key: str) -> bytes:
        """Download file from local filesystem."""
        file_path = self._base_path / key
        with open(file_path, "rb") as f:
            return f.read()

    async def exists(self, key: str) -> bool:
        """Check if file exists locally."""
        return (self._base_path / key).exists()


def get_storage() -> StorageClient:
    """Get storage client based on configuration."""
    if settings.storage_backend == "s3":
        return S3StorageClient()
    return LocalStorageClient()
