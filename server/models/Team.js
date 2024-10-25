import mongoose from 'mongoose';

const { Schema } = mongoose;
const Team = new Schema(
    {
        _team_title: {
            type: String,
            required: [true, 'Please provide a team title'],
            unique: true,
            trim: true,
        },
        _team_description: {
            type: String,
        },
        Department: {
            type: Schema.Types.ObjectId,
            required: false,
            ref: 'Department',
        },
        Project: [
            {
                type: Schema.Types.ObjectId,
                required: false,
                ref: 'Project',
            },
        ],
    },
    { timestamps: true },
);

export default mongoose.models.Team || mongoose.model('Team', Team);
