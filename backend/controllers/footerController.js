import Footer from '../models/Footer.js';

// Get Footer Configuration (singleton)
export const getFooter = async (req, res) => {
  try {
    let footer = await Footer.findOne();
    if (!footer) {
      footer = await Footer.create({
        brandName: 'College News',
        description: 'Empowering students with real-time news and campus updates.',
        sections: [
          { title: 'Campus Life', links: [{ label: 'Clubs', url: '/clubs' }, { label: 'Sports', url: '/sports' }] },
          { title: 'Support', links: [{ label: 'Official Website', url: 'https://rgukt.in' }] }
        ],
        copyright: `© ${new Date().getFullYear()} College News. All Rights Reserved.`
      });
    }
    res.status(200).json(footer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Footer Configuration (singleton)
export const updateFooter = async (req, res) => {
  try {
    const { brandName, description, sections, copyright } = req.body;

    // Build a clean update object - filter out empty sections/links
    const cleanSections = (sections || [])
      .filter(s => s && s.title && s.title.trim())
      .map(s => ({
        title: s.title.trim(),
        links: (s.links || [])
          .filter(l => l && l.label && l.label.trim() && l.url && l.url.trim())
          .map(l => ({ label: l.label.trim(), url: l.url.trim() }))
      }));

    const updateData = {
      brandName: brandName || 'College News',
      description: description || '',
      sections: cleanSections,
      copyright: copyright || ''
    };

    let footer = await Footer.findOne();
    if (footer) {
      // Use $set to replace the entire document
      footer = await Footer.findByIdAndUpdate(
        footer._id,
        { $set: updateData },
        { new: true }
      );
    } else {
      footer = await Footer.create(updateData);
    }

    res.status(200).json(footer);
  } catch (error) {
    console.error('Footer update error:', error.message);
    res.status(400).json({ message: error.message });
  }
};
