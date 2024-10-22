import mongoose from 'mongoose';

const { Schema } = mongoose;
const View = new Schema({
    _viewer: {
        type: String
    },
}, { timestamps: true });

export default mongoose.models.View || mongoose.model('View', View);