import mongoose from 'mongoose';

const { Schema } = mongoose;
const Project = new Schema({
    _project_title: {
        type: String,
        unique: true,
        required: [true, 'Please provide a title']
    },
    _project_image: {
        type: String,
        required: [true, 'Please provide an image']
    },
    _project_link: {
        type: String,
        unique: true,
        required: [true, 'Please provide a link']
    },
    _project_author: {
        type: String,
        required: [true, 'Please provide an author']
    },
    _project_hide: {
        type: Boolean
    },
    _project_tag: {
        type: [String]
    },
    _project_comment: [{
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
            required: [true, 'Please provide a title']
        },
        _fingerprint: {
            type: String,
            required: [true, 'Please provide a fingerprint']
        },
        _createdAt: {
            type: Date
        },
        _upvotes: [{
            upvoter: {
                type: String
            },
        }],
        _downvotes: [{
            downvoter: {
                type: String
            },
        }]
    }],
    _project_upvotes: [{
        _upvoter: {
            type: String
        }
    }],
    _project_downvotes: [{
        _downvoter: {
            type: String
        }
    }],
    _project_view: [{
        _viewer: {
            type: String
        },
        _createdAt: {
            type: Date
        }
    }],
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model('Project', Project);