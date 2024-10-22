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
    _project_toDisplay: {
        type: Boolean,
        default: false
    },
    _project_tags: {
        type: [String]
    },
    _project_description: {
        type: String
    },
    _project_startDate: {
        type: Date
    },
    _project_deadline: {
        type: Date
    },
    _project_milestones: [{
        __title: {
            type: String,
            required: [true, 'Please provide a __title']
        },
        __description: {
            type: String
        },
        __completed: {
            type: Boolean
        },
    }],
    _project_teams: [{
        Team: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Team'
        },
        assignedTasks: [{
            __title: {
                type: String,
                required: [true, 'Please provide a __title']
            },
            __description: {
                type: String
            },
            __deadline: {
                type: Date,
                required: [true, 'Please provide a start __deadline'],
            },
            __status: {
                type: String,
                required: [true, 'Please provide a __status']
            },
            __assignedTo: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: 'User'
            }
        }],
    }],
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model('Project', Project);