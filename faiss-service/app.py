from fastapi import FastAPI, Request
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import json
import os
import google.generativeai as genai
import pandas as pd
from dotenv import load_dotenv
from math import radians, cos, sin, asin, sqrt

app = FastAPI()

load_dotenv()

# Load CSV data into DataFrame
csv_path = "pincode.csv"
ho_csv_path = "ho_offices.csv"

if not os.path.exists(csv_path):
    raise FileNotFoundError(f"CSV not found at {csv_path}")
df = pd.read_csv(csv_path)

if not os.path.exists(ho_csv_path):
    raise FileNotFoundError(f"HO CSV not found at {ho_csv_path}")
ho_df = pd.read_csv(ho_csv_path)

# Load Gemini API key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
gmodel = genai.GenerativeModel("gemini-1.5-flash")

# Fixed sender PO Pincode
SENDER_PIN = 400708
sender_po = df[df["Pincode"] == SENDER_PIN].iloc[0].to_dict()

# Haversine formula to calculate distance between two points
def haversine_distance(lat1, lon1, lat2, lon2):
    # Convert latitude and longitude from degrees to radians
    lat1, lon1, lat2, lon2 = map(radians, [float(lat1), float(lon1), float(lat2), float(lon2)])
    
    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    r = 6371  # Radius of Earth in kilometers
    
    return c * r

# Gemini helper
def get_nearest_rms(po_details):
    prompt = f"""
You are a postal route expert. Given the following post office details:
RegionName: {po_details['RegionName']}
DivisionName: {po_details['DivisionName']}
OfficeName: {po_details['OfficeName']}
Pincode: {po_details['Pincode']}
OfficeType: {po_details['OfficeType']}
Delivery: {po_details['Delivery']}
District: {po_details['District']}
StateName: {po_details['StateName']}
Latitude: {po_details['Latitude']}
Longitude: {po_details['Longitude']}

Identify the nearest RMS (Railway Mail Service) center that would typically handle mail for this office.
Reply with a JSON object with similar fields (RegionName, DivisionName, OfficeName, Pincode, OfficeType, Delivery, District, StateName, Latitude, Longitude).
dont give explanation.
"""
    response = gmodel.generate_content(prompt)
    return response.text.strip()



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

# Search endpoint (unchanged)
@app.post("/search")
async def search_address(request: Request):
    data = await request.json()
    query = data["address"]

    # Generate embedding for input query
    vector = model.encode([query])

    # Search top 3 closest matches
    D, I = index.search(np.array(vector), k=3)

    results = []
    for i in I[0]:
        results.append(metadata[i])

    return {"matches": results}

# Route endpoint with enhanced HO logic
@app.post("/route")
async def get_route(request: Request):
    data = await request.json()
    destination_po_name = data["OfficeName"]

    # Destination PO info
    destination_po = df[df["OfficeName"] == destination_po_name].iloc[0].to_dict()

    def find_nearest_ho(po_details):
        potential_matches = []
        
        # 1. First check for Division matches
        div_matches = ho_df[ho_df["DivisionName"] == po_details["DivisionName"]]
        if not div_matches.empty:
            for _, match in div_matches.iterrows():
                potential_matches.append(match.to_dict())
        
        # 2. Also check Region match (whether or not we found Division matches)
        # This ensures we include all Region matches in our potential matches
        region_matches = ho_df[ho_df["RegionName"] == po_details["RegionName"]]
        if not region_matches.empty:
            for _, match in region_matches.iterrows():
                # Check if this match isn't already in potential_matches
                if not any(m["OfficeName"] == match["OfficeName"] for m in potential_matches):
                    potential_matches.append(match.to_dict())
        
        # Print for debugging
        print(f"Found {len(potential_matches)} potential matches")
        for match in potential_matches:
            print(f"Match: {match['OfficeName']}, Division: {match['DivisionName']}, Region: {match['RegionName']}")
        
        # 3. If we have matches, find the closest one using Haversine distance
        if potential_matches:
            closest_match = None
            min_distance = float('inf')
            
            for match in potential_matches:
                try:
                    distance = haversine_distance(
                        po_details["Latitude"], po_details["Longitude"],
                        match["Latitude"], match["Longitude"]
                    )
                    
                    if distance < min_distance:
                        min_distance = distance
                        closest_match = match
                except (ValueError, TypeError):
                    # Skip entries with invalid coordinates
                    continue
            
            # If we found a valid match with distance calculation
            if closest_match:
                return closest_match
        
        # 4. Fallback to Gemini if no matches found or all had invalid coordinates
        return json.loads(get_nearest_rms(po_details))

    # Short-circuit for same PO
    if sender_po['Pincode'] == destination_po['Pincode']:
        return {
            "senderPostOffice": sender_po,
            "rms1": {},
            "rms2": {},
            "destinationPostOffice": destination_po,
            "label": "Same PO"
        }

    rms1 = find_nearest_ho(sender_po)
    rms2 = find_nearest_ho(destination_po)

    # Route category
    if sender_po['DivisionName'] == destination_po['DivisionName']:
        label = "Local"
    elif sender_po['StateName'] == destination_po['StateName']:
        label = "Outstation (Intra-state)"
    else:
        label = "Outstation (Inter-state)"

    return {
        "senderPostOffice": sender_po,
        "rms1": rms1,
        "rms2": rms2,
        "destinationPostOffice": destination_po,
        "label": label
    }