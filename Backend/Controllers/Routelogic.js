import axios from 'axios';
import Address from '../Model/address.js'; 

export const routelogic = async (req, res) => {
  const { id } = req.params;
//   console.log(id)

  try {

    const addressDoc = await Address.findById(id);

    if (!addressDoc) {
      return res.status(404).json({ error: "Address not found" });
    }

 
    const { destinationpostid } = addressDoc;
    const parseDestinationpostid = JSON.stringify(destinationpostid)
   console.log(parseDestinationpostid)


    const pythonApi = "http://localhost:8000/route";
    const { data } = await axios.post(pythonApi,parseDestinationpostid);
  
  
    
    addressDoc.label = data.label;
      // console.log(correctedAddress)
    //   console.log(addressDoc)
    await addressDoc.save();
 
    // res.json({ matches: data.matches });
    res.json(data);

  } catch (error) {
    console.error("Error in routelogic controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


