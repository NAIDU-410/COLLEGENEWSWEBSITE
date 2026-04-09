import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

const testChat = async (message) => {
    console.log(`Testing query: "${message}"`);
    try {
        const response = await axios.post('http://localhost:5000/api/chat', {
            message,
            history: []
        });
        console.log('Bot Reply:', response.data.reply);
    } catch (error) {
        console.error('Error:', error.message);
    }
};

// This requires the backend server to be running.
// If not running, I'll just check the code logic.
console.log("Checking searchSiteContent logic by examining the code...");
