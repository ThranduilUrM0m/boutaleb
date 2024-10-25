import mongoose from 'mongoose';

const { Schema } = mongoose;
const Revenue = new Schema(
    {
        _revenue_type: {
            type: String,
            unique: true,
            required: [true, 'Please provide a type'],
        },
        _revenue_amount: {
            type: String,
            required: [true, 'Please provide an image'],
        },
        Investment: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Investment',
        },
    },
    { timestamps: true },
);

export default mongoose.models.Revenue || mongoose.model('Revenue', Revenue);
