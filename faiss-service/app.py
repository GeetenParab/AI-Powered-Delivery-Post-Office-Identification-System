from fastapi import FastAPI, Request
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import json
import os

app = FastAPI()

if os.path.exists("pin_metadata.json"):
    with open("pin_metadata.json", "r") as f:
        data = json.load(f)
else:
    raise FileNotFoundError("pin_metadata.json not found!")
# Load prebuilt index
embeddings = np.load("pin_embeddings.npy")
with open("pin_metadata.json", "r") as f:
    metadata = json.load(f)

# Load model and FAISS index
model = SentenceTransformer("paraphrase-MiniLM-L6-v2")
index = faiss.IndexFlatL2(embeddings.shape[1])
index.add(embeddings)

@app.post("/search")
async def search_address(request: Request):
    data = await request.json()
    query = data["address"]

    # Generate embedding for input query
    vector = model.encode([query])

    # Search top 5 closest matches
    D, I = index.search(np.array(vector), k=5)

    results = []
    for i in I[0]:
        results.append(metadata[i])

    return {"matches": results}
