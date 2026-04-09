import HomeCarousel from '../models/HomeCarousel.js';
import { fileToBase64 } from '../utils/fileUtils.js';

// Get all carousel items
export const getCarousels = async (req, res) => {
  try {
    const items = await HomeCarousel.find().sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching carousels:", error);
    res.status(500).json({ message: "Server error fetching carousels", error: error.message });
  }
};

// Create a new carousel item
export const createCarousel = async (req, res) => {
  try {
    const { link, title, description, type } = req.body;
    let image = req.body.image;

    if (req.file) {
      // Use the Base64 conversion utility
      image = await fileToBase64(req.file.path);
    }

    if (!image || !link) {
      return res.status(400).json({ message: "Image and Link are required." });
    }

    const newCarousel = new HomeCarousel({
      image,
      link,
      title: title || '',
      description: description || '',
      type: type || 'main'
    });

    const savedCarousel = await newCarousel.save();
    res.status(201).json(savedCarousel);
  } catch (error) {
    console.error("Error creating carousel:", error);
    res.status(500).json({ message: "Server error creating carousel", error: error.message });
  }
};

// Update an existing carousel item
export const updateCarousel = async (req, res) => {
  try {
    const { id } = req.params;
    const { link, title, description, type } = req.body;
    let image = req.body.image;

    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const updateData = { link, title, description, type };
    if (image) {
      updateData.image = image;
    }

    const updatedItem = await HomeCarousel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Carousel item not found" });
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Error updating carousel:", error);
    res.status(500).json({ message: "Server error updating carousel", error: error.message });
  }
};

// Delete a carousel item
export const deleteCarousel = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await HomeCarousel.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ message: "Carousel item not found" });
    }

    res.status(200).json({ message: "Carousel item deleted successfully" });
  } catch (error) {
    console.error("Error deleting carousel:", error);
    res.status(500).json({ message: "Server error deleting carousel", error: error.message });
  }
};
