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
    choice: {
        type: String,
        required: true
    },
    voteId: {
        type: String,
        required: true
    },
    transactionHash: {
        type: String,
    },
    network: {
        type: String,
    },
});


const votelink = mongoose.models.votelink || mongoose.model('votelink', votelinkSchema);


export default votelink; 