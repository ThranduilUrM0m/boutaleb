import mongoose from 'mongoose';
import passwordHash from 'password-hash';
import jwt from 'jsonwebtoken';

const { Schema } = mongoose;
const User = new Schema({
    _user_email: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true,
        required: true
    },
    _user_username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    _user_password: {
        type: String,
        required: true
    },
    _user_fingerprint: {
        type: String
    },
    _user_picture: {
        type: String,
    },
    _user_firstname: {
        type: String,
        trim: true
    },
    _user_lastname: {
        type: String,
        trim: true
    },
    _user_city: {
        type: String,
        trim: true
    },
    _user_country: {
        _code: {
            type: String,
            trim: true
        },
        _country: {
            type: String,
            trim: true
        }
    },
    _user_phone: {
        type: String
    },
    _user_isVerified: {
        type: Boolean,
        default: false
    },
    _user_toDelete: {
        type: Boolean,
        default: false
    },
    _user_isActive: {
        type: Boolean,
        default: false
    },
    _user_logindate: [{
        type: Date
    }],
    Permission: [{
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'Permission',
    }]
}, { timestamps: true });

User.methods = {
    authenticate: async (_userPasswordValue, findUser) => {
        return await passwordHash.verify(_userPasswordValue, findUser._user_password);
    },
    getToken: () => {
        return jwt.sign({ sub: this._id }, '_boutaleb'); // Replace with your actual secret key
    },
}

User.index({ updatedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7, partialFilterExpression: { _user_toDelete: { $eq: true } } })
export default mongoose.models.User || mongoose.model("User", User);