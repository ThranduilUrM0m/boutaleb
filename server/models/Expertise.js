import mongoose from 'mongoose';

const { Schema } = mongoose;
const Expertise = new Schema({
    _expertise_title: {
        type: String,
        required: [true, 'Please provide a expertise title'],
        unique: true,
        trim: true,
    },
    _expertise_description: {
        type: String
    }
}, { timestamps: true });

export default mongoose.models.Expertise || mongoose.model('Expertise', Expertise);