import mongoose from 'mongoose';

const userlinkSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    autolink: {
        type: String,
        required: true
    },
    generateTIME: {
        type: Date,
        required: true,
        default: Date.now
    },
    address: {
        type: String,
        required: true,
        default: "0x"
    }
});

const userlink = mongoose.model('userlink', userlinkSchema);

export default userlink; // Ensure this line is present to export the userlink model as default