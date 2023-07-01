import mongoose from 'mongoose';

const { Schema } = mongoose;
const Comment = new Schema({
    _parentId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    _author: {
        type: String,
        required: true,
        trim: true
    },
    _email: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true,
        required: true
    },
    _body: {
        type: String,
        required: [true, 'Please provide content']
    },
    _isPrivate: {
        type: Boolean,
        default: false
    },
    _fingerprint: {
        type: String,
        required: [true, 'Please provide a fingerprint']
    },
    _upvotes: [{
        _upvoter: {
            type: String
        }
    }],
    _downvotes: [{
        _downvoter: {
            type: String
        }
    }]
}, { timestamps: true });

const View = new Schema({
    _viewer: {
        type: String
    },
}, { timestamps: true });

const Article = new Schema({
    _article_title: {
        type: String,
        unique: true,
        required: true
    },
    _article_body: {
        type: String,
        required: true
    },
    _article_author: {
        type: String,
        required: true,
        trim: true
    },
    _article_category: {
        type: String,
        required: true
    },
    _article_isPrivate: {
        type: Boolean,
        default: false
    },
    _article_tags: {
        type: [String]
    },
    _article_comments: [Comment],
    _article_views: [View],
    _article_upvotes: [{
        _upvoter: {
            type: String
        }
    }],
    _article_downvotes: [{
        _downvoter: {
            type: String
        }
    }],
}, { timestamps: true });

export default mongoose.models.Article || mongoose.model('Article', Article);