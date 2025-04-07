import { extractWithGemini } from "../utils/textExtract.js";

export const extract = async (req, res) => {
  try {
    if (!req.files || !req.files.photo || req.files.photo.length === 0) {
      return res.status(400).json({ error: "Photo is required" });
    }

    const photoPath = req.files.photo[0].path;

    const text = await extractWithGemini(photoPath);

    res.status(201).json({
      message: "Image uploaded successfully",
      extractedText: text,
    });
  } catch (error) {
    console.log("Error in extract controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
