import mongoose from 'mongoose';

const { Schema } = mongoose;
const Income = new Schema(
    {
        _income_type: {
            type: String,
            required: [true, 'Please provide an income type'],
        },
        _income_amount: {
            type: Number,
            required: [true, 'Please provide an income amount'],
        },
        _income_date: {
            type: Date,
            required: [true, 'Please provide an income date'],
        },
        _income_source: {
            type: String,
            required: [true, 'Please provide an income source'],
        },
        _isPersonal: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

export default mongoose.models.Income || mongoose.model('Income', Income);
