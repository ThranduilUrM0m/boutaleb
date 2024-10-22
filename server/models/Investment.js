import mongoose from 'mongoose';

const { Schema } = mongoose;
const Investment = new Schema({
    _investment_goalAmount: {
        type: Number,
        required: [true, 'Please provide an investment goalAmount'],
    },
    _investment_currentAmount: {
        type: Number,
        required: [true, 'Please provide an investment currentAmount'],
    },
    _investment_goalDate: {
        type: Date,
        required: [true, 'Please provide an investment goalDate'],
    },
    _investment_startDate: {
        type: Date,
        required: [true, 'Please provide an investment startDate'],
    },
    _investment_type: {
        type: String,
        required: [true, 'Please provide an investment type'],
    },
    _investment_description: {
        type: String
    },
    _investment_revenu: [{
        Revenu: {
            type: Schema.Types.ObjectId,
            required: false,
            ref: 'Revenu'
        },
        __frequency: {
            type: String,
            required: [false, 'Please provide a __title']
        },
        _endedAt: {
            type: Date,
            required: false
        }
    }],
    _isPersonal: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

export default mongoose.models.Investment || mongoose.model('Investment', Investment);