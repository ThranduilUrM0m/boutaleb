import mongoose from 'mongoose';

const { Schema } = mongoose;
const Downvote = new Schema(
    {
        _downvoter: {
            type: String,
        },
    },
    { timestamps: true },
);

export default mongoose.models.Downvote || mongoose.model('Downvote', Downvote);
