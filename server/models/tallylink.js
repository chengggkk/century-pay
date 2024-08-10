import mongoose from 'mongoose';

const tallylinkSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    tallylink: {
        type: String,
        required: true
    },
    generateTIME: {
        type: Date,
        required: true,
        default: Date.now
    },

});

const votelink = mongoose.model('votelink', votelinkSchema);

export default votelink; // Ensure this line is present to export the userlink model as default