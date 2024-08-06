import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    subscribedToChannel: {
        type: String,
        required: true
    },
    subscribeDate: {
        type: Date,
        required: true,
        default: Date.now
    }
});

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

export default Subscriber; // Ensure this line is present to export the Subscriber model as default