import Notification from './models/Notification.js';
import { createNotificationMessage } from './notificationMiddleware.js';
import { NOTIFICATION_TYPES } from '../shared/notificationTypes.js';

export const socketHandler = (io, db) => {
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        // Join a room for the connected user
        socket.on('joinRoom', (userId) => {
            // Join a room for the connected user
            socket.join(userId); // Call join without capturing the return value
            console.log(`User ${userId} joined their room`);
        });

        // Function to send a notification
        const sendNotification = async (recipientId, message, type) => {
            const notification = new Notification({
                recipient: recipientId,
                message,
                type,
            });
            await notification.save();
            io.to(recipientId).emit('notification', {
                message,
                createdAt: notification.createdAt,
                type,
            });
        };

        // Handle actions with a generic notification system
        socket.on('action', async (action) => {
            const { type, recipientId, payload } = action;

            // Validate the notification type
            if (!Object.values(NOTIFICATION_TYPES).includes(type)) {
                console.error('Invalid notification type:', type);
                return; // Optionally, you could emit an error back to the client
            }

            const message = createNotificationMessage(type, payload);

            if (recipientId) {
                await sendNotification(recipientId, message, type);
            }
        });

        // Handle user disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};
