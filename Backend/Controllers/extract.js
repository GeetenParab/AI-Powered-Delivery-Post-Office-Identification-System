import Address from "../Model/address.js";
import { extractWithGemini } from "../utils/textExtract.js";

export const extract = async (req, res) => {
  try {
    if (!req.files || !req.files.photo || req.files.photo.length === 0) {
      return res.status(400).json({ error: "Photo is required" });
    }

    const photoPath = req.files.photo[0].path;

    const text = await extractWithGemini(photoPath);
    // originalAddress: {
    //   fullText: String, // the complete recipient address as written
    //   structured: {
    //       street: String,
    //       city: String,
    //       state: String,
    //       pinCode: String
    //   }
    //   }
    const address = new Address({
      fullText: text.originalAddress.fullText,
      extractedText:text.originalAddress.structured,
    });
    await address.save();
    res.status(201).json({
      address
    });
  } catch (error) {
    console.log("Error in extract controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
