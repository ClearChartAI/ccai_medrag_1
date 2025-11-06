"""Debug script to check user and document issues."""
from google.cloud import firestore

PROJECT_ID = "sunlit-adviser-471323-p0"

db = firestore.Client(project=PROJECT_ID)

print("=" * 80)
print("FIREBASE USERS CHECK")
print("=" * 80)

# Get all users from Firestore
users_ref = db.collection("users").limit(10).stream()
users = list(users_ref)

print(f"\nFound {len(users)} users in Firestore 'users' collection:\n")

for user_doc in users:
    user_data = user_doc.to_dict()
    print(f"User ID: {user_data.get('user_id')}")
    print(f"Email: {user_data.get('email')}")
    print(f"Display Name: {user_data.get('display_name')}")
    print(f"Created: {user_data.get('created_at')}")
    print(f"Document Count: {user_data.get('document_count', 0)}")
    print("-" * 40)

print("\n" + "=" * 80)
print("DOCUMENTS CHECK")
print("=" * 80)

# Get all documents
docs_ref = db.collection("documents").limit(20).stream()
docs = list(docs_ref)

print(f"\nFound {len(docs)} documents in Firestore:\n")

# Group by user_id
user_docs = {}
for doc in docs:
    doc_data = doc.to_dict()
    user_id = doc_data.get('user_id', 'unknown')
    if user_id not in user_docs:
        user_docs[user_id] = []
    user_docs[user_id].append(doc_data)

for user_id, documents in user_docs.items():
    print(f"\nUser ID: {user_id}")
    print(f"Number of documents: {len(documents)}")
    for doc in documents:
        print(f"  - {doc.get('filename')} (Status: {doc.get('processing_status')})")
    print("-" * 40)

print("\n" + "=" * 80)
print("INSTRUCTIONS")
print("=" * 80)
print("\n1. Check if your Firebase Auth user ID matches any user_id above")
print("2. If user_id is different, that's why you can't see documents!")
print("3. Login to frontend and check browser console for user ID")
print("4. Compare with the user IDs printed above")
