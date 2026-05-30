import Notification from '../models/Notification.js';

// @desc    Количество непрочитанных уведомлений
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            receiver: req.user._id,
            isRead: false,
        });

        return res.status(200).json({ count });
    } catch (error) {
        console.error('Ошибка при получении счётчика уведомлений:', error);
        return res.status(500).json({ message: 'Ошибка сервера при получении уведомлений.' });
    }
};

// @desc    Список уведомлений текущего пользователя
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ receiver: req.user._id })
            .sort({ createdAt: -1 })
            .limit(30)
            .populate('sender', 'username profilePicture')
            .populate('postId', 'text')
            .lean();

        return res.status(200).json({ notifications });
    } catch (error) {
        console.error('Ошибка при получении списка уведомлений:', error);
        return res.status(500).json({ message: 'Ошибка сервера при получении уведомлений.' });
    }
};

// @desc    Отметить все уведомления как прочитанные
// @route   PUT /api/notifications/mark-as-read
// @access  Private
export const markAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { receiver: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );

        return res.status(200).json({ message: 'Уведомления отмечены как прочитанные' });
    } catch (error) {
        console.error('Ошибка при обновлении статуса уведомлений:', error);
        return res.status(500).json({ message: 'Ошибка сервера при обновлении уведомлений.' });
    }
};
