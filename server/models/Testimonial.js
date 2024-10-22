import mongoose from 'mongoose';

const { Schema } = mongoose;
const Testimonial = new Schema({
    Parent : {
        type: Schema.Types.ObjectId,
        required: false,
        default: null,
        ref: 'Testimonial',
    },
    _testimonial_author: {
        type: String,
        required: true,
        trim: true
    },
    // Instead of _testimonial_email, maybe do profession, cause emails are not a good idea to display publicly
    _testimonial_email: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true,
        required: true
    },
    _testimonial_body: {
        type: String,
        required: true
    },
    _testimonial_isPrivate: {
        type: Boolean,
        default: false
    },
    _testimonial_fingerprint: {
        type: String
    },
    _testimonial_upvotes: [{
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'Upvote'
    }],
    _testimonial_downvotes: [{
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'Downvote'
    }]
}, { timestamps: true });

export default mongoose.models.Testimonial || mongoose.model('Testimonial', Testimonial);