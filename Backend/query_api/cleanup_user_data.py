"""
Script to clean up all user data from Firestore and Cloud Storage.
Usage: python cleanup_user_data.py <user_id> <document_id>
"""

import sys
import io
from google.cloud import firestore
from google.cloud import storage

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

PROJECT_ID = "sunlit-adviser-471323-p0"
BUCKET_NAME = "ccai-medrag-patient-uploads"


def delete_user_documents(db, user_id):
    """Delete all documents for a user."""
    docs_ref = db.collection("documents").where("user_id", "==", user_id)
    deleted_count = 0

    for doc in docs_ref.stream():
        print(f"  Deleting document: {doc.id}")
        doc.reference.delete()
        deleted_count += 1

    print(f"✓ Deleted {deleted_count} documents")
    return deleted_count


def delete_user_chats(db, user_id):
    """Delete all chats for a user."""
    chats_ref = db.collection("chats").where("user_id", "==", user_id)
    deleted_count = 0

    for chat in chats_ref.stream():
        print(f"  Deleting chat: {chat.id}")
        chat.reference.delete()
        deleted_count += 1

    print(f"✓ Deleted {deleted_count} chats")
    return deleted_count


def delete_user_messages(db, user_id):
    """Delete all messages for a user."""
    messages_ref = db.collection("messages").where("user_id", "==", user_id)
    deleted_count = 0

    for message in messages_ref.stream():
        print(f"  Deleting message: {message.id}")
        message.reference.delete()
        deleted_count += 1

    print(f"✓ Deleted {deleted_count} messages")
    return deleted_count


def delete_document_chunks(db, document_id):
    """Delete all chunks for a specific document."""
    chunks_ref = db.collection("chunks").where("document_id", "==", document_id)
    deleted_count = 0

    for chunk in chunks_ref.stream():
        print(f"  Deleting chunk: {chunk.id}")
        chunk.reference.delete()
        deleted_count += 1

    print(f"✓ Deleted {deleted_count} chunks for document {document_id}")
    return deleted_count


def delete_user_storage_files(user_id):
    """Delete all PDFs for a user from Cloud Storage."""
    storage_client = storage.Client(project=PROJECT_ID)
    bucket = storage_client.bucket(BUCKET_NAME)

    # List all blobs with user_id prefix
    prefix = f"{user_id}/"
    blobs = bucket.list_blobs(prefix=prefix)

    deleted_count = 0
    for blob in blobs:
        print(f"  Deleting file: {blob.name}")
        blob.delete()
        deleted_count += 1

    print(f"✓ Deleted {deleted_count} files from Cloud Storage")
    return deleted_count


def main():
    if len(sys.argv) != 3:
        print("Usage: python cleanup_user_data.py <user_id> <document_id>")
        print("\nExample:")
        print("  python cleanup_user_data.py vUVZUYrbkHg0J52iyq3ttE08Vmd2 4a86896d-3483-4e5f-9eec-82f92381d255")
        sys.exit(1)

    user_id = sys.argv[1]
    document_id = sys.argv[2]

    print(f"\n🗑️  Starting cleanup for:")
    print(f"   User ID: {user_id}")
    print(f"   Document ID: {document_id}")
    print(f"   Project: {PROJECT_ID}")
    print(f"   Bucket: {BUCKET_NAME}\n")

    confirmation = input("Are you sure you want to delete ALL data for this user? (yes/no): ")
    if confirmation.lower() != "yes":
        print("❌ Cleanup cancelled")
        sys.exit(0)

    # Initialize Firestore
    db = firestore.Client(project=PROJECT_ID)

    print("\n1️⃣  Deleting Firestore documents...")
    delete_user_documents(db, user_id)

    print("\n2️⃣  Deleting Firestore chats...")
    delete_user_chats(db, user_id)

    print("\n3️⃣  Deleting Firestore messages...")
    delete_user_messages(db, user_id)

    print("\n4️⃣  Deleting document chunks...")
    delete_document_chunks(db, document_id)

    print("\n5️⃣  Deleting Cloud Storage files...")
    delete_user_storage_files(user_id)

    print("\n✅ Cleanup completed successfully!")
    print("\nSummary:")
    print(f"  - User {user_id}: All documents, chats, and messages deleted")
    print(f"  - Document {document_id}: All chunks deleted")
    print(f"  - Cloud Storage: All files for user {user_id} deleted")


if __name__ == "__main__":
    main()
