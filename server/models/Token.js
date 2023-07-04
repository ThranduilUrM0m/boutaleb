import mongoose from 'mongoose';

const { Schema } = mongoose;
const Token = new Schema({
    _userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    _token_body: {
        type: String,
        required: true
    }
}, { timestamps: true });

Token.index({ updatedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 })
export default mongoose.models.Token || mongoose.model("Token", Token);