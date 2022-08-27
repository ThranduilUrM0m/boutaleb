import mongoose from 'mongoose';
import passwordHash from 'password-hash';
import jwt from 'jwt-simple';

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
    _user_passwordResetToken: {
        type: String
    },
    _user_passwordResetExpires: {
        type: Date
    },
    _user_fingerprint: {
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
    authenticate: (_userPasswordValue, findUser) => {
        return passwordHash.verify(_userPasswordValue, findUser._user_password);
    },
    getToken: (findUser) => {
        return jwt.encode(findUser, '_boutaleb');
    }
}

User.index({ updatedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7, partialFilterExpression: { _user_toDelete: { $eq: true } } })
export default mongoose.model("User", User);