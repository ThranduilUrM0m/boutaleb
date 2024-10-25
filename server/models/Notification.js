// models/Notification.js
import mongoose from 'mongoose';

const { Schema } = mongoose;
const Notification = new Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        message: { type: String, required: true },
        type: { type: String, required: true }, // e.g., 'user', 'testimonial', 'article', etc.
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true },
);

export default mongoose.models.Notification ||
    mongoose.model('Notification', Notification);
