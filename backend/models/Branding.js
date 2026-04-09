import mongoose from 'mongoose';

const brandingSchema = new mongoose.Schema({
  collegeName: { type: String, default: 'RGUKT Ongole' },
  logo: { type: String, default: '' },
  navbarLogo: { type: String, default: '' },
  heroLogo: { type: String, default: '' },
  heroTitle: { type: String, default: 'Rajiv Gandhi University of Knowledge Technologies' },
  heroSubtitle: { type: String, default: 'Catering to the Educational Needs of Gifted Rural Youth' },
  ctaText: { type: String, default: 'More Details' },
  ctaLink: { type: String, default: '/about' }
}, { timestamps: true });

const Branding = mongoose.model('Branding', brandingSchema);
export default Branding;
