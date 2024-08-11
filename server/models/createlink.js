import mongoose from 'mongoose';

const createlinkSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    createlink: {
        type: String,
        required: true
    },
    generateTIME: {
        type: Date,
        required: true,
        default: Date.now
    },
    option: {
        type: [String], 
        default: [] 
    },
    channelId: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    }
});

const createlink = mongoose.model('createlink', createlinkSchema);

export default createlink; // Ensure this line is present to export the userlink model as default