"""Check chunk structure in Firestore."""
from google.cloud import firestore
import json

PROJECT_ID = "sunlit-adviser-471323-p0"
db = firestore.Client(project=PROJECT_ID)

print("=" * 80)
print("CHUNKS STRUCTURE CHECK")
print("=" * 80)

# Get a few sample chunks
chunks = list(db.collection("chunks").limit(3).stream())

print(f"\nFound {len(chunks)} sample chunks\n")

for chunk in chunks:
    chunk_data = chunk.to_dict()
    print(f"Chunk ID: {chunk.id}")
    print(f"Fields in chunk:")
    for key, value in chunk_data.items():
        if isinstance(value, str) and len(value) > 100:
            print(f"  - {key}: {value[:100]}... (truncated)")
        else:
            print(f"  - {key}: {value}")
    print("-" * 80)

# Check if chunks have user_id and document_id
print("\nField verification:")
if chunks:
    sample = chunks[0].to_dict()
    print(f"Has 'user_id': {'user_id' in sample}")
    print(f"Has 'document_id': {'document_id' in sample}")
    
    if 'document_id' in sample:
        doc_id = sample['document_id']
        print(f"\nChecking document: {doc_id}")
        doc = db.collection("documents").document(doc_id).get()
        if doc.exists:
            doc_data = doc.to_dict()
            print(f"Document user_id: {doc_data.get('user_id')}")
            print(f"Chunk user_id: {sample.get('user_id')}")
            print(f"Match: {doc_data.get('user_id') == sample.get('user_id')}")

print("\n" + "=" * 80)
print("VECTOR INDEX ID CHECK")
print("=" * 80)
print("\nThe Firestore document ID (chunk.id) is used as the")
print("datapoint_id in Vertex AI Vector Search.")
if chunks:
    print(f"\nExample: Firestore chunk ID = {chunks[0].id}")
    print(f"This is passed to: index.remove_datapoints(['{chunks[0].id}'])")
