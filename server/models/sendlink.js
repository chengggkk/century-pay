import mongoose from "mongoose";

const sendlinkSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
    },
    sendautolink: {
        type: String,
        required: true,
    },
    generateTIME: {
        type: Date,
        required: true,
        default: Date.now,
    },
    amount: {
        type: Number,
        required: true,
    },
    to_address: {
        type: String,
        required: true,
    },
    transactionHash: {
        type: String,
        required: false,
    },
    network: {
        type: String,
        required: false,
    },
});

const sendlink = mongoose.model("sendlink", sendlinkSchema);

export default sendlink; // Ensure this line is present to export the userlink model as default
