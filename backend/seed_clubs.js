import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import ClubType from './models/ClubType.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const clubs = [
    { name: "Coding Club", description: "Learn and build together." },
    { name: "Dance Club", description: "Express yourself through movement." },
    { name: "Music Club", description: "Harmonize with fellow musicians." },
    { name: "Photography Club", description: "Capture the world through your lens." }
];

async function seedClubs() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing types to avoid duplicates if necessary, or just insert
        // await ClubType.deleteMany({});
        
        for (const club of clubs) {
            await ClubType.findOneAndUpdate(
                { name: club.name },
                club,
                { upsert: true, new: true }
            );
            console.log(`Seeded/Updated club: ${club.name}`);
        }

        console.log('Seed completed successfully');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error seeding clubs:', error);
        process.exit(1);
    }
}

seedClubs();
