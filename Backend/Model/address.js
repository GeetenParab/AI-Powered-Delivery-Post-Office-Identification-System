import mongoose from 'mongoose';

const structuredSubSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pinCode: { type: String, required: true }
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
