import mongoose from 'mongoose';

const { Schema } = mongoose;
const Article = new Schema(
    {
        _article_title: {
            type: String,
            unique: true,
            required: true,
        },
        _article_body: {
            type: String,
            required: true,
        },
        _article_author: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        _article_category: {
            type: String,
            required: true,
        },
        _article_isPrivate: {
            type: Boolean,
            default: false,
        },
        _article_tags: {
            type: [String],
        },
        _article_comments: [
            {
                type: Schema.Types.ObjectId,
                required: false,
                ref: 'Comment',
            },
        ],
        _article_views: [
            {
                type: Schema.Types.ObjectId,
                required: false,
                ref: 'View',
            },
        ],
        _article_upvotes: [
            {
                type: Schema.Types.ObjectId,
                required: false,
                ref: 'Upvote',
            },
        ],
        _article_downvotes: [
            {
                type: Schema.Types.ObjectId,
                required: false,
                ref: 'Downvote',
            },
        ],
    },
    { timestamps: true },
);

export default mongoose.models.Article || mongoose.model('Article', Article);
