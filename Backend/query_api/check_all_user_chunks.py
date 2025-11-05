"""Check all chunks for a user's document."""
from google.cloud import firestore
from collections import Counter

PROJECT_ID = "sunlit-adviser-471323-p0"
USER_ID = "vUVZUYrbkHg0J52iyq3ttE08Vmd2"
DOCUMENT_ID = "83add688-72f9-4e0f-bf63-1d6e65375ef8"

db = firestore.Client(project=PROJECT_ID)

print(f"Checking ALL chunks for:")
print(f"  User: {USER_ID}")
print(f"  Document: {DOCUMENT_ID}\n")
print("=" * 80)

chunks_ref = db.collection("chunks").where("user_id", "==", USER_ID).where("document_id", "==", DOCUMENT_ID)
chunks = list(chunks_ref.stream())

print(f"\nFound {len(chunks)} total chunks\n")

text_samples = []
text_lengths = []

for i, chunk_doc in enumerate(chunks[:10], 1):  # Show first 10
    data = chunk_doc.to_dict()
    text = data.get('text', '')
    text_lengths.append(len(text))
    text_samples.append(text)

    print(f"[Chunk {i}]")
    print(f"  Length: {len(text)} chars")
    print(f"  Text: {text[:200]}")
    print()

# Statistics
print("\n" + "=" * 80)
print("STATISTICS:")
print(f"  Total chunks: {len(chunks)}")
print(f"  Avg length: {sum(text_lengths) / len(text_lengths) if text_lengths else 0:.0f} chars")
print(f"  Min length: {min(text_lengths) if text_lengths else 0}")
print(f"  Max length: {max(text_lengths) if text_lengths else 0}")

# Count unique texts
unique_texts = Counter(text_samples)
print(f"\n  Unique texts in sample: {len(unique_texts)}")
if len(unique_texts) <= 5:
    print("\n  All unique texts:")
    for text, count in unique_texts.most_common():
        print(f"    '{text}' (appears {count} times)")
