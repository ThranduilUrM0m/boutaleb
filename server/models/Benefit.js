import mongoose from 'mongoose';

const { Schema } = mongoose;
const Benefit = new Schema(
    {
        /* Such as paid time off, retirement plans, and employee assistance programs. */
        _benefit_type: {
            type: String,
            required: [true, 'Please provide a benefit type'],
        },
        _benefit_amount: {
            type: Number,
            required: [true, 'Please provide an benefit amount'],
        },
        _benefit_date: {
            type: Date,
            required: [true, 'Please provide an benefit date'],
        },
        _benefit_frequency: {
            type: Number,
            required: [true, 'Please provide a benefit frequency'],
        },
        _benefit_description: {
            type: String,
        },
        _isPersonal: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

export default mongoose.models.Benefit || mongoose.model('Benefit', Benefit);
