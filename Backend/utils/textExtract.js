import axios from "axios";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

export const extractWithGemini = async (photoPath) => {
  try {
    const imageBytes = fs.readFileSync(photoPath).toString("base64");

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: imageBytes,
                },
              },
              {
                text: `
                Extract only the recipient's address from this envelope image. 
                If there are two addresses, choose the one in the recipient's typical location (center-right or below stamps).
                If there's only one address, assume it's the recipient's.
                
                Your task:
                1. Extract the full address.
                2. Split into street, city, state, and pincode.
                3. In the city field, format it as "Town City". 
                   - Town = locality or neighborhood (e.g., Bandra West)
                   - City = main city (e.g., Mumbai)
                   - Final result: "Bandra-West Mumbai"
                
                Output must be in this strict JSON format:
                {
                  "originalAddress": {
                    "fullText": "full address as seen",
                    "structured": {
                      "street": "....",
                      "city": "Town City format",
                      "state": "Full State Name",
                      "pinCode": "......"
                    }
                  }
                }
                
                Only return JSON. Do not explain anything.
                If any part is missing, leave it as an empty string.
                `
                ,
              },
            ],
          },
        ],
      }
    );
  
    const extractedText = response.data.candidates[0].content.parts[0].text;
    const cleanedText = extractedText.replace(/```json|```/g, '').trim();
    // console.log(cleanedText);

    const parsed = JSON.parse(cleanedText);
    return parsed;

        
  } catch (error) {
    console.error("Error in extractWithGemini:", error.message);
    throw new Error("Gemini OCR failed");
  }
};
