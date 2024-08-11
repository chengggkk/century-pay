import mongoose from 'mongoose';

const tallylinkSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
    },
    tallylink: {
        type: String,
        required: true,
    },
    generateTIME: {
        type: Date,
        required: true,
        default: Date.now,
    },
    voteId: {
        type: String,
        required: false
    },
    transactionHash: {
        type: String,
    },
    network: {
        type: String,
    },
});


const tallylink = mongoose.models.tallylink || mongoose.model('tallylink', tallylinkSchema);


export default tallylink; 