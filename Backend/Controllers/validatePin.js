import axios from 'axios';
import Address from '../Model/address.js'; 

export const validatePin = async (req, res) => {
  const { id } = req.params;
  console.log(id)

  try {

    const addressDoc = await Address.findById(id);

    if (!addressDoc) {
      return res.status(404).json({ error: "Address not found" });
    }

 
    const { city, state ,street} = addressDoc.extractedText;
    const address = `${city} ${state}`;


    const pythonApi = "http://localhost:8000/search";
    const { data } = await axios.post(pythonApi, { address });
    // console.log(data)
    // console.log(data.matches[0].Pincode)
    const correctedAddress = {
      street,
      city,
      state,
      pinCode: data.matches[0].Pincode,
    };

    addressDoc.correctedAddress = correctedAddress;
    addressDoc.status = "verified";
      // console.log(correctedAddress)
    await addressDoc.save();
 
    res.json({ matches: data.matches });

  } catch (error) {
    console.error("Error in validatePin controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


//   app.post("/validate-pin", async (req, res) => {
//     const address = req.body.fullAddress; // from structured fields
//     const pythonApi = "http://localhost:8000/search";
  
//     try {
//       const { data } = await axios.post(pythonApi, { address });
//       res.json({ matches: data.matches }); // contains pin + similarity
//     } catch (err) {
//       res.status(500).json({ error: "FAISS server error", details: err.message });
//     }
//   });