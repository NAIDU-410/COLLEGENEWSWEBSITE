import mongoose from 'mongoose';

const clubTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    image: {
        type: String // Category poster
    },
    description: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ClubType = mongoose.model('ClubType', clubTypeSchema);
export default ClubType;
