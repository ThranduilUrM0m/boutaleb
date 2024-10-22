import mongoose from 'mongoose';

const { Schema } = mongoose;
const Salary = new Schema({
    _salary_type: {
        type: String,
        required: [true, 'Please provide an income type'],
    },
    _salary_amount: {
        type: Number,
        required: [true, 'Please provide a salary amount'],
    },
    _salary_date: {
        type: Date,
        required: [true, 'Please provide a salary date'],
    },
    _salary_frequency: {
        type: Number,
        required: [true, 'Please provide a salary frequency'],
    },
    _isPersonal: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

export default mongoose.models.Salary || mongoose.model('Salary', Salary);