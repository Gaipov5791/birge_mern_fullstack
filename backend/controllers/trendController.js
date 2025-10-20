import Post from "../models/Post.js";

// @desc    Получить список актуальных трендов
// @route   GET /api/trends
// @access  Public
export const getTrends = async (req, res) => {
    try {
        // Агрегация для получения популярных хэштегов
        const trends = await Post.aggregate([
            { $unwind: "$hashtags" }, // Разворачиваем массив хэштегов
            { $group: { _id: "$hashtags", count: { $sum: 1 } } }, // Группируем по хэштегу и считаем количество
            {$project: { topic: "$_id", count: 1, _id: 0 }}, // Проецируем в нужный формат
            { $sort: { count: -1 } }, // Сортируем по убыванию количества
            { $limit: 10 } // Ограничиваем до топ-10 трендов
        ]);
        res.status(200).json(trends);
    } catch (error) {
        console.error("Ошибка при получении трендов:", error);
        res.status(500).json({ message: "Ошибка сервера при получении трендов" });
    }
};