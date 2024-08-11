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
    }
});


const createlink = mongoose.models.createlink || mongoose.model('createlink', createlinkSchema);


export default createlink; 