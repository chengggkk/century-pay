import mongoose from "mongoose";

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
});

const tallylink = mongoose.model("tallylink", tallylinkSchema);

export default tallylink; // Ensure this line is present to export the userlink model as default
