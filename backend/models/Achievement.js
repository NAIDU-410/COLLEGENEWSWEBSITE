import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['sports', 'clubs', 'placements', 'others'],
        default: 'sports'
    },
    subcategory: {
        type: String,
        required: function() {
            // Require subcategory for sports and clubs
            return this.type === 'sports' || this.type === 'clubs';
        },
        trim: true
    },
    year: {
        type: Number,
        required: true
    },
    cardImage: {
        type: String,
        required: true // Required for the list view
    },
    detailImage: {
        type: String // Optional, but good for the detail view
    },
    socialLinks: {
        instagram: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        facebook: { type: String, default: '' }
    }
}, {
    timestamps: true
});

// Add indexes for performance optimization
achievementSchema.index({ type: 1 });
achievementSchema.index({ subcategory: 1 });

const Achievement = mongoose.model('Achievement', achievementSchema);

export default Achievement;
