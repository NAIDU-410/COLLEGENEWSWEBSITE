import mongoose from 'mongoose';

const footerSchema = new mongoose.Schema({
  brandName: { type: String, default: 'College News' },
  description: { type: String, default: '' },
  sections: [{
    title: { type: String, default: '' },
    links: [{
      label: { type: String, default: '' },
      url: { type: String, default: '' }
    }]
  }],
  copyright: { type: String, default: '' }
}, { timestamps: true });

const Footer = mongoose.model('Footer', footerSchema);
export default Footer;
