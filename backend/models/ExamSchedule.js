import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
    subjectCode: {
        type: String,
        trim: true
    },
    subjectName: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    month: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    oldDate: String,
    oldTime: String,
    isUpdated: {
        type: Boolean,
        default: false
    }
});

const examScheduleSchema = new mongoose.Schema({
    branch: {
        type: String,
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        required: true
    },
    examType: {
        type: String,
        required: true
    },
    mode: {
        type: String,
        enum: ['image', 'manual'],
        required: true
    },
    imageUrl: String,
    subjects: [subjectSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const ExamSchedule = mongoose.model('ExamSchedule', examScheduleSchema);

export default ExamSchedule;
