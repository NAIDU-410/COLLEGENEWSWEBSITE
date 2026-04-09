import mongoose from 'mongoose';

const clubEventSchema = new mongoose.Schema({
    clubName: {
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
        type: String // Gallery/Carousel
    }],
    activities: [{
        name: String,
        description: String,
        time: String,
        participants: String
    }],
    achievements: [{
        year: String,
        title: String,
        recipient: String,
        description: String
    }],
    socialLinks: {
        instagram: String,
        website: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ClubEvent = mongoose.model('ClubEvent', clubEventSchema);
export default ClubEvent;
