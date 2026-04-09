import mongoose from 'mongoose';

const sportTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    image: {
        type: String
    },
    description: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const SportType = mongoose.model('SportType', sportTypeSchema);
export default SportType;
