import mongoose from 'mongoose';

const { Schema } = mongoose;
const Expense = new Schema({
    _expense_category: {
        type: String,
        required: [true, 'Please provide an expense category'],
    },
    _expense_amount: {
        type: Number,
        required: [true, 'Please provide an expense amount'],
    },
    _expense_date: {
        type: Date,
        required: [true, 'Please provide an expense date'],
    },
    _isPersonal: {
        type: Boolean,
        default: false,
    },
    Priority: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Priority',
    }
}, { timestamps: true });

export default mongoose.models.Expense || mongoose.model('Expense', Expense);