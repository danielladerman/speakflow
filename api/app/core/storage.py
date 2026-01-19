"""
Object storage abstraction.

Supports S3 and local filesystem backends.
"""

import os
from abc import ABC, abstractmethod
from pathlib import Path
from typing import BinaryIO

import boto3
from botocore.exceptions import ClientError

from .config import settings


class StorageClient(ABC):
    """Abstract storage client interface."""

    @abstractmethod
    async def upload(self, key: str, file: BinaryIO, content_type: str) -> str:
        """
        Upload a file to storage.

        Args:
            key: Storage key (path within bucket)
            file: File-like object to upload
            content_type: MIME type of the file

        Returns:
            URL/path to the uploaded file
        """
        pass

    @abstractmethod
    async def download(self, key: str) -> bytes:
        """
        Download a file from storage.

        Args:
            key: Storage key

        Returns:
            File contents as bytes
        """
        pass

    @abstractmethod
    async def exists(self, key: str) -> bool:
        """Check if a file exists in storage."""
        pass

    @abstractmethod
    async def delete(self, key: str) -> bool:
        """Delete a file from storage."""
        pass

    @abstractmethod
    def get_url(self, key: str) -> str:
        """Get URL for a stored file."""
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
        return self.get_url(key)

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

    async def delete(self, key: str) -> bool:
        """Delete file from S3."""
        try:
            self._client.delete_object(Bucket=self._bucket, Key=key)
            return True
        except ClientError:
            return False

    def get_url(self, key: str) -> str:
        """Get S3 URL for file."""
        if settings.s3_endpoint_url:
            return f"{settings.s3_endpoint_url}/{self._bucket}/{key}"
        return f"https://{self._bucket}.s3.{settings.s3_region}.amazonaws.com/{key}"


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
        return self.get_url(key)

    async def download(self, key: str) -> bytes:
        """Download file from local filesystem."""
        file_path = self._base_path / key
        with open(file_path, "rb") as f:
            return f.read()

    async def exists(self, key: str) -> bool:
        """Check if file exists locally."""
        return (self._base_path / key).exists()

    async def delete(self, key: str) -> bool:
        """Delete file from local filesystem."""
        file_path = self._base_path / key
        if file_path.exists():
            os.remove(file_path)
            return True
        return False

    def get_url(self, key: str) -> str:
        """Get local path as URL."""
        return f"file://{self._base_path / key}"


# Global storage instance
_storage_client: StorageClient | None = None


def get_storage() -> StorageClient:
    """Get or create storage client based on configuration."""
    global _storage_client
    if _storage_client is None:
        if settings.storage_backend == "s3":
            _storage_client = S3StorageClient()
        else:
            _storage_client = LocalStorageClient()
    return _storage_client
