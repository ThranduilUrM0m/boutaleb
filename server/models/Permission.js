import mongoose from 'mongoose';

const { Schema } = mongoose;
const Permission = new Schema({
    _permission_titre: {
        type: String,
        required: [true, 'Please provide a permission title']
    }
}, { timestamps: true });

export default mongoose.models.Permission || mongoose.model("Permission", Permission);