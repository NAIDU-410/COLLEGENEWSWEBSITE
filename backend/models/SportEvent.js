import mongoose from 'mongoose';

const sportEventSchema = new mongoose.Schema({
    sportType: {
        type: String,
        required: true
    },
    eventTitle: {
        type: String,
        required: true
    },
    eventDate: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    eventImage: {
        type: String // Main banner
    },
    images: [{
        type: String // Carousel/Gallery
    }],
    matches: [{
        teamA: String,
        teamB: String,
        matchDate: Date,
        result: String,
        score: String
    }],
    teams: [{
        name: String,
        image: String,
        description: String
    }],
    socialLinks: {
        instagram: String,
        twitter: String,
        website: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Add indexes for performance optimization
sportEventSchema.index({ sportType: 1 });
sportEventSchema.index({ eventDate: -1 });

const SportEvent = mongoose.model('SportEvent', sportEventSchema);
export default SportEvent;
