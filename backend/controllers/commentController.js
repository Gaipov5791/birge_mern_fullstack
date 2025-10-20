import Post from "../models/Post.js";
import Comment from "../models/Comment.js";

// @desc    Добавить комментарий к посту
// @route   POST /api/comments/:postId
// @access  Приватный
export const addCommentToPost = async (req, res) => { 
    const { text } = req.body;
    const postId = req.params.postId;
    const userId = req.user._id;

    console.log('Вызван addCommentToPost контроллер');
    console.log('req.params:', req.params);
    console.log('req.body:', req.body);
    console.log('req.user:', req.user);

    if (!text) {
        return res.status(400).json({ message: "Пожалуйста, добавьте текст комментария!" });
    }

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Пост не найден" });
        }

        const newComment = new Comment({
            user: userId,
            post: postId,
            text,
        });

        const createdComment = await newComment.save();

        post.comments.push(createdComment._id);
        post.commentsCount += 1;
        const savedPost = await post.save();

        const populatedComment = await Comment.findById(createdComment._id).populate("user", "username profilePicture");

        // ⭐ ИСПРАВЛЕНИЕ: Используем сохраненный объект поста (savedPost) и популируем его.
        const updatedPost = await savedPost.populate({ 
            path: 'author', 
            select: 'username profilePicture' 
        });

        return res.status(201).json({
            message: "Комментарий успешно добавлен",
            comment: populatedComment,
            updatedPost: updatedPost,
        });
    } catch (error) {
        console.error(error);
        // Обработка ошибок для try...catch
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: "Неверный ID поста" });
        }
        return res.status(500).json({ message: "Ошибка сервера при добавлении комментария" });
    }
};

// @desc    Получить комментарии для поста
// @route   GET /api/comments/:postId
// @access  Приватный
export const getCommentsForPost = async (req, res) => {
    const postId = req.params.postId;

    try {
        const comments = await Comment.find({ post: postId })
                                     .populate('user', 'username profilePicture')
                                     .sort({ createdAt: 1 });

        return res.status(200).json({
            message: "Комментарии успешно получены",
            comments,
        });
    } catch (error) {
        console.error(error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: "Неверный ID поста" });
        }
        return res.status(500).json({ message: "Ошибка сервера при получении комментариев" });
    }
};

// @desc    Удалить комментарий
// @route   DELETE /api/comments/:id
// @access  Приватный
export const deleteComment = async (req, res) => {
    const commentId = req.params.id;
    const userId = req.user._id;

    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Комментарий не найден" });
        }

        const post = await Post.findById(comment.post);

        // Проверка прав
        if (comment.user.toString() !== userId.toString()) {
            if (!post || post.author.toString() !== userId.toString()) { // Использовал author вместо user
                return res.status(401).json({ message: 'Не авторизован для удаления этого комментария' });
            }
        }

        let updatedPost = null;
        if (post) {
            post.comments.pull(commentId);
            if (post.commentsCount > 0) {
                post.commentsCount -= 1;
            }
            await post.save();
            
            // ⭐ КРИТИЧЕСКОЕ ИЗМЕНЕНИЕ: Перезагружаем пост с популизацией 
            // Это безопаснее, чем использовать .populate() на объекте, возвращенном .save().
            updatedPost = await Post.findById(post._id).populate('author', 'username profilePicture');
        }

        // Удаляем сам комментарий
        await Comment.deleteOne({ _id: commentId });

        return res.status(200).json({ 
            id: commentId, 
            message: 'Комментарий успешно удален',
            updatedPost: updatedPost // Возвращаем обновленный и популированный пост
        });
    } catch (error) {
        console.error(error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: "Неверный ID комментария" });
        }
        return res.status(500).json({ message: 'Ошибка сервера при удалении комментария' });
    }
};

// @desc    Обновить комментарий
// @route   PUT /api/comments/:id
// @access  Приватный
export const updateComment = async (req, res) => {
    const commentId = req.params.id;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text) {
        return res.status(400).json({ message: "Пожалуйста, добавьте текст комментария!" });
    }

    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Комментарий не найден" });
        }

        if (comment.user.toString() !== userId.toString()) {
            return res.status(401).json({ message: 'Не авторизован для обновления этого комментария' });
        }

        comment.text = text;
        const updatedComment = await comment.save();

        const populatedComment = await Comment.findById(updatedComment._id).populate("user", "username profilePicture");

        return res.status(200).json({
            message: "Комментарий успешно обновлен",
            comment: populatedComment,
        });
    } catch (error) {
        console.error(error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: "Неверный ID комментария" });
        }
        return res.status(500).json({ message: 'Ошибка сервера при обновлении комментария' });
    }
};