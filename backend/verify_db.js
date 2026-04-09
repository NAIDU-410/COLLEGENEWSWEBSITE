import mongoose from 'mongoose';
import ExamSchedule from './models/ExamSchedule.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/college-news';

async function verifyDatabase() {
    try {
        await mongoose.connect(dbUri);
        console.log('--- Database Verification ---');

        // Check collection
        const collections = await mongoose.connection.db.listCollections().toArray();
        const hasExamCollection = collections.some(col => col.name === 'examschedules');
        console.log(`Collection 'examschedules' exists: ${hasExamCollection}`);

        if (!hasExamCollection) {
            console.error('CRITICAL: examschedules collection not found!');
            process.exit(1);
        }

        const sampleDoc = await ExamSchedule.findOne();
        if (sampleDoc) {
            console.log('Sample Document Found:');
            console.log(JSON.stringify(sampleDoc, null, 2));

            // Verify Fields
            if (sampleDoc.mode === 'manual') {
                console.log('Manual Mode Check: Subjects array length =', sampleDoc.subjects.length);
                const hasTrackingFields = sampleDoc.subjects.every(s => 
                    'isUpdated' in s && 
                    'oldDate' in s && 
                    'oldTime' in s
                );
                console.log('Subjects have tracking fields (isUpdated, oldDate, oldTime):', hasTrackingFields);
            } else if (sampleDoc.mode === 'image') {
                console.log('Image Mode Check: imageUrl =', sampleDoc.imageUrl);
            }
        } else {
            console.log('No documents found in examschedules. Creating a test one...');
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error('Database Verification Failed:', err);
        process.exit(1);
    }
}

verifyDatabase();
