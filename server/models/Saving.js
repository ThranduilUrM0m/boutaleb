import mongoose from 'mongoose';

const { Schema } = mongoose;
const Saving = new Schema(
    {
        _saving_goalAmount: {
            type: Number,
            required: [true, 'Please provide an saving goalAmount'],
        },
        _saving_currentAmount: {
            type: Number,
            required: [true, 'Please provide an saving currentAmount'],
        },
        _saving_goalDate: {
            type: Date,
            required: [true, 'Please provide an saving goalDate'],
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

export default mongoose.models.Saving || mongoose.model('Saving', Saving);
