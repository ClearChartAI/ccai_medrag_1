"""Quick script to check chunk content in Firestore."""
from google.cloud import firestore

PROJECT_ID = "sunlit-adviser-471323-p0"
USER_ID = "vUVZUYrbkHg0J52iyq3ttE08Vmd2"

# Chunk IDs that matched from the logs
CHUNK_IDS = [
    "f754c80d-ae8c-4743-8a85-f88d21ec5010",
    "b9c9fe36-2aa3-4bba-b628-ff374ec60a8a",
    "e47df270-8142-4178-aa78-cfb1fa6c8082",
    "d39f6a9c-658c-4d1f-837b-29b5a6a6fe1c",
]

db = firestore.Client(project=PROJECT_ID)

print(f"Checking chunks for user: {USER_ID}\n")
print("=" * 80)

for i, chunk_id in enumerate(CHUNK_IDS, 1):
    doc = db.collection("chunks").document(chunk_id).get()
    if doc.exists:
        data = doc.to_dict()
        print(f"\n[Chunk {i}] ID: {chunk_id}")
        print(f"User ID: {data.get('user_id')}")
        print(f"Document ID: {data.get('document_id')}")
        print(f"Text Length: {len(data.get('text', ''))} characters")
        print(f"Text Preview (first 500 chars):")
        print("-" * 80)
        print(data.get('text', '')[:500])
        print("-" * 80)
    else:
        print(f"\n[Chunk {i}] ID: {chunk_id} - NOT FOUND")

print("\n" + "=" * 80)
