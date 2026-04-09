import mongoose from 'mongoose';
import ExamSchedule from './models/ExamSchedule.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkImages() {
    await mongoose.connect(process.env.MONGO_URI);
    const imageExams = await ExamSchedule.find({ mode: 'image' });
    console.log('Image Mode Exams:', imageExams.length);
    imageExams.forEach(e => {
        console.log({
            id: e._id,
            branch: e.branch,
            academicYear: e.academicYear,
            imageUrl: e.imageUrl
        });
    });
    await mongoose.connection.close();
}
checkImages();
