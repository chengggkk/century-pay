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
        type: [[String]], // 如果需要雙維陣列，每個元素為字串
        default: [] 
    },
    channelId: {
        type: String,
        required: true
    },
    transactionHash: {
        type: String,
    },
    network: {
        type: String,
    },
    topic: {
        type: String,
        required: true
    },
    voteId: {
        type: String,
        required: false
    },
    finished: {
        type: Boolean,
        required: false
    }
});

const createlink = mongoose.model('createlink', createlinkSchema);

export default createlink; // Ensure this line is present to export the userlink model as default