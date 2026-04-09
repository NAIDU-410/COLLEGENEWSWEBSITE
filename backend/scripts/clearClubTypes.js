/**
 * Deletes ALL documents in the ClubType collection (MongoDB: usually `clubtypes`).
 * Run this when old seed/demo club categories should be removed so the site + chatbot show no clubs.
 *
 * Usage (from backend folder, with MONGO_URI in .env):
 *   npm run clear-clubs
 *
 * Safety: set CONFIRM=1 or you will be prompted to abort (non-interactive: CONFIRM=1 npm run clear-clubs)
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import ClubType from '../models/ClubType.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function main() {
    if (!process.env.MONGO_URI) {
        console.error('Missing MONGO_URI in backend/.env');
        process.exit(1);
    }

    const confirm = process.env.CONFIRM === '1' || process.env.CONFIRM === 'yes';
    if (!confirm) {
        console.error(
            'Refusing to run without CONFIRM=1 (deletes all club categories).\n' +
                'Run: CONFIRM=1 npm run clear-clubs\n' +
                'On Windows PowerShell: $env:CONFIRM=1; npm run clear-clubs'
        );
        process.exit(1);
    }

    await connectDB();

    const before = await ClubType.countDocuments();
    console.log(`ClubType documents before: ${before}`);

    if (before === 0) {
        console.log('Nothing to delete.');
        await mongoose.disconnect();
        process.exit(0);
    }

    const result = await ClubType.deleteMany({});
    console.log(`Deleted ${result.deletedCount} club type(s).`);

    const after = await ClubType.countDocuments();
    console.log(`ClubType documents after: ${after}`);

    await mongoose.disconnect();
    console.log('Done. Restart your API; chatbot CMS block will show no clubs until you add new categories in admin.');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
