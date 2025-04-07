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
                    text: `You are given text extracted from an envelope image. Your task is to identify and extract **only the recipient's address** from the content.

                - If there are **two addresses** (sender and receiver), identify and extract the one written in the **typical recipient location** (usually center-right, below stamps).
                - If there is **only one address**, assume it's the **recipient’s address**.
                - Ignore the sender’s address completely.

                Return the output in the following JSON structure:

                originalAddress: {
                fullText: String, // the complete recipient address as written
                structured: {
                    name: String,
                    street: String,
                    city: String,
                    state: String,
                    pinCode: String
                }
                }

                If any part (like state or pinCode) is missing, leave it as an empty string.
                Do not add any explanation or extra text.
                `,
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
