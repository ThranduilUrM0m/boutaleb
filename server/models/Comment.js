import mongoose from 'mongoose';

const { Schema } = mongoose;
const Comment = new Schema({
    Parent : {
        type: Schema.Types.ObjectId,
        required: false,
        default: null,
        ref: 'Comment',
    },
    _comment_author: {
        type: String,
        required: true,
        trim: true
    },
    _comment_email: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true
    },
    _comment_body: {
        type: String,
        required: [true, 'Please provide content']
    },
    _comment_isPrivate: {
        type: Boolean,
        default: false
    },
    _comment_fingerprint: {
        type: String,
        required: [true, 'Please provide a fingerprint']
    },
    _comment_upvotes: [{
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'Upvote'
    }],
    _comment_downvotes: [{
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'Downvote'
    }]
}, { timestamps: true });

export default mongoose.models.Comment || mongoose.model('Comment', Comment);