import mongoose from 'mongoose';

const votelinkSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    votelink: {
        type: String,
        required: true
    },
    generateTIME: {
        type: Date,
        required: true,
        default: Date.now
    },
    option: {
        type: String,
        required: true
    }
});

const votelink = mongoose.model('votelink', votelinkSchema);

export default votelink; // Ensure this line is present to export the userlink model as default