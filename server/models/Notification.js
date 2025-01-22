// models/Notification.js
import mongoose from 'mongoose';

/* How to handle the component */
/* 
    // Function to fetch notifications based on the user’s roles and permissions
const fetchAccessibleNotifications = async (userRoles, userPermissions) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { accessRoles: { $in: userRoles } },
        { accessPermissions: { $in: userPermissions } },
      ],
    });
    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

// Example usage
const userRoles = user.Role.map((role) => role.name); // Assuming roles are available as objects
const userPermissions = _userPermissions.map((perm) => perm._permission_titre);

fetchAccessibleNotifications(userRoles, userPermissions).then((notifications) => {
  // Display notifications
  console.log("Accessible Notifications:", notifications);
});
*/

const { Schema } = mongoose;
const Notification = new Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true, // e.g., 'user', 'testimonial', 'article', etc.
        },
        relatedDocument: {
            itemId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Refers to related entity's ID
            itemType: { type: String, required: true }, // e.g., 'article', 'testimonial'
        },
        read: {
            type: Boolean,
            default: false,
        },
        visibility: {
            roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
            permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
        },
    },
    { timestamps: true },
);

export default mongoose.models.Notification ||
    mongoose.model('Notification', Notification);
