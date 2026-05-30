import Notification from '../models/Notification.js';

export const createNotification = async ({ receiverId, senderId, type, postId }) => {
    if (String(receiverId) === String(senderId)) {
        return null;
    }

    return Notification.create({
        receiver: receiverId,
        sender: senderId,
        type,
        postId,
    });
};
