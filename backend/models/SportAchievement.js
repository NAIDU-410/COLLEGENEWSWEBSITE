import mongoose from 'mongoose';

const sportAchievementSchema = new mongoose.Schema({
    sportType: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const SportAchievement = mongoose.model('SportAchievement', sportAchievementSchema);
export default SportAchievement;
