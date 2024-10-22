import mongoose from 'mongoose';

const { Schema } = mongoose;
const Client = new Schema({
    _client_email: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true,
        required: [true, 'Please provide a _client_email']
    },
    _client_title: {
        type: String,
        unique: true,
        required: [true, 'Please provide a _client_title']
    },
    _client_picture: {
        type: String
    },
    _client_city: {
        type: String,
        trim: true
    },
    _client_country: {
        _code: {
            type: String,
            trim: true
        },
        _country: {
            type: String,
            trim: true
        }
    },
    _client_phone: {
        type: String
    },
    _client_toDelete: {
        type: Boolean,
        default: false
    },
    _client_isActive: {
        type: Boolean,
        default: false
    },
    Invoice: [{
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'Invoice'
    }],
    Payment: [{
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'Payment'
    }],
    Project: [{
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'Project'
    }]
}, { timestamps: true });

Client.index({ updatedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7, partialFilterExpression: { _client_toDelete: { $eq: true } } })
export default mongoose.models.Client || mongoose.model('Client', Client);