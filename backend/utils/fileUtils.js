import fs from 'fs';
import path from 'path';

/**
 * Converts a file to a Base64 string.
 * @param {string} filePath - The path to the file.
 * @returns {Promise<string>} - The Base64 encoded string.
 */
export const fileToBase64 = async (filePath) => {
  try {
    const fullPath = path.resolve(filePath);
    const fileBuffer = fs.readFileSync(fullPath);
    const mimeType = path.extname(fullPath).slice(1) === 'png' ? 'image/png' : 'image/jpeg';
    const base64String = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
    
    // Clean up: delete the temporary file from disk
    fs.unlink(fullPath, (err) => {
      if (err) console.error("Error deleting temp file:", err);
    });

    return base64String;
  } catch (error) {
    console.error("Error converting file to Base64:", error);
    throw error;
  }
};

/**
 * Handle multiple files at once.
 */
export const filesToBase64 = async (files) => {
  if (!files || files.length === 0) return [];
  const base64Promises = files.map(file => fileToBase64(file.path));
  return Promise.all(base64Promises);
};
