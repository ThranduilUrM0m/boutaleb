import mongoose from 'mongoose';

const { Schema } = mongoose;
const Testimony = new Schema({
    _parentId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    _testimony_author: {
        type: String,
        required: true,
        trim: true
    },
    _testimony_email: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true,
        required: true
    },
    _testimony_body: {
        type: String,
        required: true
    },
    _testimony_isPrivate: {
        type: Boolean,
        default: false
    },
    _testimony_fingerprint: {
        type: String
    },
    _testimony_upvotes: [{
        _upvoter: {
            type: String
        }
    }],
    _testimony_downvotes: [{
        _downvoter: {
            type: String
        }
    }],
}, { timestamps: true });

export default mongoose.models.Testimony || mongoose.model('Testimony', Testimony);