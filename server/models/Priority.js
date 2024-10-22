import mongoose from 'mongoose';

const { Schema } = mongoose;
const Priority = new Schema({
    _priority_level: {
        type: Number,
        required: [true, 'Please provide a priority level'],
    },
    _priority_description: {
        type: String
    },
}, { timestamps: true });

export default mongoose.models.Priority || mongoose.model('Priority', Priority);