import mongoose from 'mongoose';

const { Schema } = mongoose;
const Loan = new Schema(
    {
        _loan_goalAmount: {
            type: Number,
            required: [true, 'Please provide a loan goalAmount'],
        },
        _loan_currentAmount: {
            type: Number,
            required: [true, 'Please provide a loan currentAmount'],
        },
        _loan_interestRate: {
            type: Number,
            required: [true, 'Please provide a loan interestRate'],
        },
        _loan_paymentFrequency: {
            type: Number,
            required: [true, 'Please provide a loan paymentFrequency'],
        },
        _loan_goalDate: {
            type: Date,
            required: [false, 'Please provide a loan goalDate'],
        },
        _loan_startDate: {
            type: Date,
            required: [true, 'Please provide a loan startDate'],
        },
        _loan_type: {
            type: String,
            required: [true, 'Please provide a loan type'],
        },
        _loan_term: {
            type: Number,
            required: [true, 'Please provide a loan term'],
        },
        _loan_description: {
            type: String,
        },
        _isPersonal: {
            type: Boolean,
            default: false,
        },
        Priority: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Priority',
        },
    },
    { timestamps: true },
);

export default mongoose.models.Loan || mongoose.model('Loan', Loan);
