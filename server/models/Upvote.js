import mongoose from 'mongoose';

const { Schema } = mongoose;
const Upvote = new Schema(
    {
        _upvoter: {
            type: String,
        },
    },
    { timestamps: true },
);

export default mongoose.models.Upvote || mongoose.model('Upvote', Upvote);
