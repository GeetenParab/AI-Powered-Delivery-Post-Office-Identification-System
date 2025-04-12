from sentence_transformers import SentenceTransformer
import numpy as np
import pandas as pd
import json

# Load dataset
df = pd.read_csv("pincode.csv")

# Drop rows with missing critical data
df = df.dropna(subset=["DivisionName", "OfficeName", "District", "StateName", "Pincode"])

# Create searchable strings
texts = (
    df["StateName"].astype(str).str.strip() + ", " +
    df["District"].astype(str).str.strip() + ", " +
    df["DivisionName"].astype(str).str.strip() + ", " +
    df["OfficeName"].astype(str).str.strip()
).tolist()

# Create metadata for lookup
metadata = df[["OfficeName", "DivisionName", "District", "StateName", "Pincode"]].to_dict(orient="records")

# Load embedding model
model = SentenceTransformer("paraphrase-MiniLM-L6-v2")

# Generate embeddings
embeddings = model.encode(texts, show_progress_bar=True)

# Save to files
np.save("pin_embeddings.npy", embeddings)
with open("pin_metadata.json", "w") as f:
    json.dump(metadata, f)

print("Saved embeddings and metadata!")
