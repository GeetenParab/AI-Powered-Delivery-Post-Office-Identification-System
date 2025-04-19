import Address from "../Model/address.js";

export const sortpost = async (req, res) => {
  try {
    // Fetch all addresses from the database
    const addresses = await Address.find({});
    
    // Initialize separate arrays for each status
    const unverified = [];
    const verified = [];
    const markForReview = [];
    
    // Initialize separate arrays for each label type
    const samePO = [];
    const local = [];
    const intraState = [];
    const interState = [];

    // Helper function to transform address objects
    const transformAddress = (address, keepExtractedText = false) => {
      const transformed = { ...address.toObject() };
      delete transformed.fullText;
      if (!keepExtractedText) {
        delete transformed.extractedText;
      }
      return transformed;
    };

    // Categorize each address
    addresses.forEach(address => {
      const status = address.status.toLowerCase();
      const label = address.label;
      
      // Sort by status (special handling for markForReview)
      if (status === 'unverified') {
        unverified.push(transformAddress(address));
      } else if (status === 'verified') {
        verified.push(transformAddress(address));
      } else if (status === 'markforreview') {
        markForReview.push(transformAddress(address, true)); // Keep extractedText
      }
      
      // Sort by label (use same transformation rules as status)
      const transformForLabel = status === 'markforreview' 
        ? transformAddress(address, true) 
        : transformAddress(address);
      
      if (label === 'Same PO') samePO.push(transformForLabel);
      else if (label === 'Local') local.push(transformForLabel);
      else if (label === 'Outstation (Intra-state)') intraState.push(transformForLabel);
      else if (label === 'Outstation (Inter-state)') interState.push(transformForLabel);
    });

    // Prepare the final response object
    const response = {
      // Status categories
      unverified,
      verified,
      markForReview,
      
      // Label categories
      samePO,
      local,
      intraState,
      interState
    };

    // Send the sorted response
    res.status(200).json(response);
    
  } catch (error) {
    console.log("Error in sort controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};