import mongoose from 'mongoose';

const { Schema } = mongoose;
const Insurance = new Schema(
    {
        _insurance_type: {
            type: String,
            required: [true, 'Please provide an insurance type'],
        },
        _insurance_amount: {
            type: Number,
            required: [true, 'Please provide an insurance amount'],
        },
        _insurance_provider: {
            type: String,
            required: [true, 'Please provide an insurance provider'],
        },
        _insurance_policyNumber: {
            type: String,
            required: [true, 'Please provide an insurance policyNumber'],
        },
        _insurance_startDate: {
            type: Date,
            required: [true, 'Please provide an insurance startDate'],
        },
        _insurance_endDate: {
            type: Date,
            required: [true, 'Please provide an insurance endDate'],
        },
        _isPersonal: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

export default mongoose.models.Insurance ||
    mongoose.model('Insurance', Insurance);
