import axios from 'axios';
import fs from 'fs';

async function testImage() {
    try {
        const url = 'http://localhost:5000/uploads/image-1773755035916.png';
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        console.log('Successfully fetched image. Size:', response.data.byteLength);
    } catch (err) {
        console.error('Failed to fetch image:', err.message);
        if (err.response) {
            console.error('Status:', err.response.status);
        }
    }
}

testImage();
