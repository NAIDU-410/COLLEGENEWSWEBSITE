import mongoose from 'mongoose';

const homeCarouselSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: ['main', 'logo', 'navbar'],
    default: 'main',
  },
}, { timestamps: true });

export default mongoose.model('HomeCarousel', homeCarouselSchema);
