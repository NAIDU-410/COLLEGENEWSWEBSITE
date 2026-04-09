import Branding from '../models/Branding.js';

// Get Branding Settings
export const getBranding = async (req, res) => {
  try {
    let branding = await Branding.findOne();
    if (!branding) {
      branding = await Branding.create({
        collegeName: 'RGUKT Ongole',
        logo: '',
        navbarLogo: '',
        heroLogo: '',
        heroTitle: 'Rajiv Gandhi University of Knowledge Technologies',
        heroSubtitle: 'Catering to the Educational Needs of Gifted Rural Youth',
        ctaText: 'More Details',
        ctaLink: '/about'
      });
    }
    res.status(200).json(branding);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Branding Settings
export const updateBranding = async (req, res) => {
  try {
    const updateData = req.body;
    let branding = await Branding.findOne();
    
    if (branding) {
      branding = await Branding.findByIdAndUpdate(branding._id, updateData, { new: true });
    } else {
      branding = await Branding.create(updateData);
    }
    
    res.status(200).json(branding);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
