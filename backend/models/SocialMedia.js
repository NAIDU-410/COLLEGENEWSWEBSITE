import mongoose from 'mongoose';

const socialMediaSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Platform Name
  link: { type: String, required: true },
  icon: { type: String, required: true }  // Image path or icon identifier
}, { timestamps: true });

const SocialMedia = mongoose.model('SocialMedia', socialMediaSchema);
export default SocialMedia;
