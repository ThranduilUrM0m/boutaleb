import mongoose from 'mongoose';

const { Schema } = mongoose;
const Article = new Schema({
    _article_title: {
        type: String,
        required: [true, 'Please provide a title']
    },
    _article_body: {
        type: String,
        required: [true, 'Please provide a content']
    },
    _article_author: {
        type: String,
        required: [true, 'Please provide an author']
    },
    _article_category: {
        type: String,
        required: [true, 'Please choose a category']
    },
    _article_hide: {
        type: Boolean
    },
    _article_tag: {
        type: [String]
    },
    _article_comment: [{
        _parent_id: {
            type: mongoose.Types.ObjectId,
            required: [true, 'Please provide a parent id']
        },
        _author: {
            type: String,
            required: [true, 'Please provide a title']
        },
        _body: {
            type: String,
            required: [true, 'Please provide a content']
        },
        _fingerprint: {
            type: String,
            required: [true, 'Please provide a fingerprint']
        },
        _createdAt: {
            type: Date
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
    }],
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
    _article_view: [{
        _viewer: {
            type: String
        },
        _createdAt: {
            type: Date
        }
    }],
}, { timestamps: true });

export default mongoose.models.Article || mongoose.model('Article', Article);