import mongoose from 'mongoose';

const structuredSubSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pinCode: { type: String, required: true }
}, { _id: false });

const destinationPostSchema = new mongoose.Schema({
  OfficeName: { type: String, required: true },
  DivisionName: { type: String, required: true },
  District: { type: String, required: true },
  StateName: { type: String, required: true },
  Pincode: { type: Number, required: true }
}, { _id: false });

const addressSchema = new mongoose.Schema({
  fullText: { type: String, required: true },
  
  extractedText: {
    type: structuredSubSchema,
    required: true
  },
  
  correctedAddress: {
    type: structuredSubSchema,
    required: false
  },
  
  label: {
    type: String,
    enum: ['Same PO', 'Local', 'Outstation (Intra-state)', 'Outstation (Inter-state)'],
    required: false
  },
  
  destinationpostid: {
    type: destinationPostSchema,
    required:false
  },
  
  status: {
    type: String,
    enum: ['unverified', 'verified', 'markforreview'],
    default: 'unverified'
  }
}, {
  timestamps: true
});

const Address = mongoose.model('Address', addressSchema);

export default Address;