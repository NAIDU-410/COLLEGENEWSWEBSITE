import mongoose from 'mongoose';

const placementSchema = mongoose.Schema({
  type: {
    type: String,
    enum: ['Internship', 'Placement'],
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  duration: {
    type: String
  },
  stipendOrSalary: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  skills: {
    type: [String],
    default: []
  },
  deadline: {
    type: Date
  },
  experience: {
    type: String
  },
  cgpa: {
    type: String
  },
  mode: {
    type: String,
    enum: ['Remote', 'Online', 'Offline'],
    default: 'Offline'
  },
  companyUrl: {
    type: String
  },
  applyLink: {
    type: String
  },
  socialLinks: {
    linkedin: String,
    twitter: String,
    website: String,
    instagram: String
  },
  logo: {
    type: String
  },
  eligibleBatches: {
    type: [String],
    default: []
  },
  eligibleBranches: {
    type: [String],
    default: []
  },
  processDescription: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Placement = mongoose.model('Placement', placementSchema);

export default Placement;
