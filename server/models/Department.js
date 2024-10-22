import mongoose from 'mongoose';

const { Schema } = mongoose;
const Department = new Schema({
    _department_title: {
        type: String,
        required: [true, 'Please provide a department title'],
        unique: true,
        trim: true,
    },
    _department_description: {
        type: String
    }
}, { timestamps: true });

export default mongoose.models.Department || mongoose.model('Department', Department);