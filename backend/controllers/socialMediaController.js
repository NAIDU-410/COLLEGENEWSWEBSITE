import SocialMedia from '../models/SocialMedia.js';

// Get all social media links
export const getSocialMedia = async (req, res) => {
  try {
    const socials = await SocialMedia.find();
    res.status(200).json(socials);
  } catch (error) {
    res.status(500).json({ message: "Error fetching social links", error: error.message });
  }
};

// Create a new social media link
export const createSocialMedia = async (req, res) => {
  try {
    const { name, link, icon } = req.body;
    const newLink = new SocialMedia({ name, link, icon });
    const savedLink = await newLink.save();
    res.status(201).json(savedLink);
  } catch (error) {
    res.status(500).json({ message: "Error creating social link", error: error.message });
  }
};

// Update a social media link
export const updateSocialMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, link, icon } = req.body;
    
    const updatedLink = await SocialMedia.findByIdAndUpdate(
      id,
      { name, link, icon },
      { new: true, runValidators: true }
    );
    
    if (!updatedLink) return res.status(404).json({ message: "Social Link not found" });
    res.status(200).json(updatedLink);
  } catch (error) {
    res.status(500).json({ message: "Error updating social link", error: error.message });
  }
};

// Delete a social media link
export const deleteSocialMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedLink = await SocialMedia.findByIdAndDelete(id);
    if (!deletedLink) return res.status(404).json({ message: "Social link not found" });
    res.status(200).json({ message: "Social link deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting social link", error: error.message });
  }
};
