import mongoose from 'mongoose';
import ExamSchedule from './models/ExamSchedule.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/college-news';

async function listExams() {
    try {
        await mongoose.connect(dbUri);
        const exams = await ExamSchedule.find();
        console.log(JSON.stringify(exams, null, 2));
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listExams();
