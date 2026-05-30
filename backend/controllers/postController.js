import Post from "../models/Post.js";
import User from "../models/User.js";
import cloudinary, { IMAGE_UPLOAD_TRANSFORMATION } from "../config/cloudinaryConfig.js";
import { createNotification } from "../utils/createNotification.js";

const PAGE_SIZE = 20;

const uploadToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        const resourceType = file.mimetype.startsWith('video/') ? 'video' : 'image';

        const uploadOptions = {
            folder: "birge_posts",
            resource_type: resourceType,
        };

        if (resourceType === 'image') {
            uploadOptions.transformation = IMAGE_UPLOAD_TRANSFORMATION;
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    console.error("Cloudinary Error:", error);
                    return reject(error);
                }
                console.log(`Cloudinary Success: ${result.secure_url}`);
                resolve(result);
            }
        ).end(file.buffer);
    });
};

/**
 * Вспомогательная функция для извлечения хэштегов из текста.
 * Находит слова, начинающиеся с #, и возвращает их в виде массива строк в нижнем регистре.
 * @param {string} postText 
 * @returns {string[]} Массив хэштегов.
 */
const extractHashtags = (postText) => {
    if (!postText) return [];
    
    // ⭐ НОВОЕ РЕГУЛЯРНОЕ ВЫРАЖЕНИЕ:
    // Ищет '#' за которым следуют буквы, цифры или _
    // Флаг 'u' (unicode) для лучшей работы с нелатинскими символами.
    const regex = /#([a-zA-Z0-9_а-яА-Я]+)/gu; 
    
    // Используем `matchAll` для итерации по всем совпадениям и группам
    const matches = Array.from(postText.matchAll(regex)) || [];
    
    // Мы извлекаем группу захвата [1] (то, что внутри скобок), которая не содержит #
    return matches.map(match => match[1].toLowerCase()); 
};

// @desc      Создать новый пост
// @route     POST /api/posts/create
// @access    Приватный (требуется аутентификация)
export const createPost = async (req, res) => {
    const textTrimmed = req.body.text ? req.body.text.trim() : '';
    const files = req.files || [];

    console.log("--- 4. Вход в createPost контроллер ---"); // ⭐ ЛОГ
    console.log("req.body:", req.body);

    if (files.length > 0) {
        console.log(`Файлы получены: ${files.length}`);
        // ⭐ КРИТИЧЕСКИЙ ЛОГ
        console.log("ПЕРВЫЙ ФАЙЛ: ", { 
            fieldname: files[0].fieldname,
            originalname: files[0].originalname,
            encoding: files[0].encoding,
            mimetype: files[0].mimetype,
            // Если есть, то будет LOG (если диск), если нет, то undefined/ошибка (если память)
            path_property: files[0].path, 
            // Если есть, то будет LOG (если память), если нет, то undefined/ошибка (если диск)
            buffer_size: files[0].buffer ? files[0].buffer.length : 'НЕТ БУФЕРА'
        }); 
    } else {
        console.log("Файлы: НЕТ");
    }

    if (!textTrimmed && files.length === 0) {
        return res.status(400).json({ message: "Пожалуйста, добавьте текст или файл(ы)!" });
    }

    try {
        // ⭐ 1. ИЗВЛЕЧЕНИЕ ХЭШТЕГОВ ИЗ ТЕКСТА
        const extractedTags = extractHashtags(textTrimmed);

        let postData = {
            author: req.user._id,
            text: textTrimmed,
            hashtags: extractedTags,
            // ⭐ НОВЫЕ ПОЛЯ: Массивы для хранения путей всех медиа
            media: [], 
        };

        // 🌟 ИСПРАВЛЕНИЕ ЛОГИКИ: ЗАГРУЗКА В CLOUDINARY
        if (files.length > 0) {
            try {
                const uploadPromises = files.map(file => uploadToCloudinary(file));
                const uploadResults = await Promise.all(uploadPromises);

                postData.media = uploadResults.map(result => ({
                    type: result.resource_type, 
                    url: result.secure_url, // Убедитесь, что это не undefined
                }));
            } catch (uploadError) {
                console.error("FATAL UPLOAD ERROR: ", uploadError);
                // Если загрузка падает, лучше вернуть ошибку 500
                return res.status(500).json({ message: "Ошибка загрузки файла на сервер Cloudinary." });
            }
        }
        
        // ⭐ 3. СОЗДАНИЕ И СОХРАНЕНИЕ ПОСТА
        const post = new Post(postData);
        const createdPost = await post.save();

        // Заполняем поле автора, чтобы вернуть полные данные
        const populatedPost = await Post.findById(createdPost._id).populate("author", "username profilePicture");

        return res.status(201).json({
            message: "Пост успешно создан",
            post: populatedPost,
        });
    } catch (error) {
        console.error("Ошибка при создании поста:", error);

        console.error("--- 5. ОШИБКА CATCH В КОНТРОЛЛЕРЕ: ---", error); // ⭐ ЛОГ
        
        return res.status(500).json({ message: "Ошибка сервера" });
    }
};

// @desc    Получить посты с cursor-based пагинацией
// @route   GET /api/posts?cursor=<ISO-date>
// @access  Приватный
export const getPosts = async (req, res) => {
    try {
        const { cursor } = req.query;
        const query = {};

        if (cursor) {
            const cursorDate = new Date(cursor);
            if (Number.isNaN(cursorDate.getTime())) {
                return res.status(400).json({ message: 'Неверный формат cursor' });
            }
            query.createdAt = { $lt: cursorDate };
        }

        const results = await Post.find(query)
            .sort({ createdAt: -1 })
            .limit(PAGE_SIZE + 1)
            .populate('author', 'username profilePicture')
            .lean();

        const hasMore = results.length > PAGE_SIZE;
        const posts = hasMore ? results.slice(0, PAGE_SIZE) : results;

        const nextCursor = hasMore
            ? new Date(posts[posts.length - 1].createdAt).toISOString()
            : null;

        return res.status(200).json({
            message: "Посты успешно получены",
            posts,
            nextCursor,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Ошибка сервера" });
    }
};

// @desc    Получить пост по ID
// @route   GET /api/posts/:id
// @access  Публичный
export const getPostById = async (req, res) => {
    try {
        const postId = req.params.id; // Получаем ID поста из параметров запроса
        console.log("Получение поста с ID:", postId);
        const post = await Post.findById(postId)
            .populate("author", "username profilePicture")
            .populate({
                path: 'comments', // Путь к массиву комментариев
                populate: { // Вложенный populate для автора каждого комментария
                    path: 'user',
                    select: 'username profilePicture' // Какие поля автора комментария нужны
                }
            });
            
            if (!post) {
                return res.status(404).json({ message: "Пост не найден" });
            }

            return res.status(200).json({
                message: "Пост успешно получен",
                post,
            });
    } catch (error) {
        console.error(error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: "Неверный ID поста" });
        }
        return res.status(500).json({ message: "Ошибка сервера при получении поста" });
        
    }
};

// @desc    Получить пост по ID
// @route   GET /api/posts/user/:userId
// @access  Публичный
export const getUserPosts = async (req, res) => {
    try {
        const userId = req.params.userId; // Получаем ID пользователя из параметров запроса
        console.log("Получение поста для пользователя с ID:", userId);
        
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        const posts = await Post.find({ author: userId })
            .populate("author", "username profilePicture")
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Ошибка сервера при получении постов пользователя" });
        
    }
};

// @desc    Поставить/убрать лайк посту
// @route   PUT /api/posts/like/:id
// @access  Приватный
export const likePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;
        console.log("Пользователь с ID:", userId, "пытается лайкнуть пост с ID:", postId);

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Пост не найден" });
        }

        const alreadyLiked = post.likes.includes(userId);

        if (alreadyLiked) {
            post.likes.pull(userId);
        } else {
            post.likes.push(userId);

            if (String(post.author) !== String(userId)) {
                await createNotification({
                    receiverId: post.author,
                    senderId: userId,
                    type: 'like',
                    postId,
                });
            }
        }

        await post.save();

        const populatedPost = await Post.findById(post._id)
                                      .populate('author', 'username profilePicture'); //

        const message = alreadyLiked ? "Лайк убран" : "Пост лайкнут";
        return res.status(200).json({ message, post: populatedPost }); //

    } catch (error) {
        console.error(error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: "Неверный ID поста" });
        }
        return res.status(500).json({ message: "Ошибка сервера при обработке лайка" });
    }
};

// @desc    Удалить пост
// @route   DELETE /api/posts/:id
// @access  Приватный (требуется аутентификация)
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id); // Получаем ID поста из параметров запроса
        console.log("Удаление поста с ID:", req.params.id, "пользователем с ID:", req.user._id);
        if (!post) {
            return res.status(404).json({ message: "Пост не найден" });
        }

        // Проверяем, является ли пользователь владельцем поста
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Вы не можете удалить этот пост" });
        }

        await post.deleteOne();
        return res.status(200).json({ message: "Пост успешно удален", id: req.params.id });
    } catch (error) {
        console.error(error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: "Неверный ID поста" });
        }
        return res.status(500).json({ message: "Ошибка сервера при удалении поста" });
    }
};

// @desc    Обновить пост
// @route   PUT /api/posts/:id
// @access  Приватный (требуется аутентификация)
export const updatePost = async (req, res) => {
    const { text, image } = req.body;
    const postId = req.params.id; // Получаем ID поста из параметров запроса
    const userId = req.user._id; // Получаем ID пользователя из запроса
    console.log("Обновление поста с ID:", postId, "пользователем с ID:", userId);

    if (!text) {
        return res.status(400).json({ message: "Пожалуйста, добавьте текст!" });
    }

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Пост не найден" });
        }

        // Проверяем, является ли пользователь владельцем поста
        if (post.author.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Вы не можете обновить этот пост" });
        }

        post.text = text;
        post.image = image || post.image; // Если новое изображение не передано, оставляем старое
        const updatedPost = await post.save();

        // Заполняем информацию о пользователе, чтобы вернуть данные пользователя вместе с постом
        const populatedPost = await Post.findById(updatedPost._id).populate("author", "username profilePicture");

        return res.status(200).json({
            message: "Пост успешно обновлен",
            post: populatedPost,
        });
    } catch (error) {
        console.error(error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: "Неверный ID поста" });
        }
        return res.status(500).json({ message: "Ошибка сервера при обновлении поста" });
    }
};

// @desc    Получить посты для ленты новостей (посты пользователей, на которых подписан текущий пользователь)
// @route   GET /api/posts/timeline
// @access  Private
export const getTimelinePosts = async (req, res) => { 
    try {
        // req.user.id - это ID текущего авторизованного пользователя,
        // который доступен благодаря middleware 'protect'
        console.log('--- Начинаем getTimelinePosts ---');
        console.log('ID текущего пользователя (req.user.id):', req.user ? req.user.id : 'Недоступен');

        if (!req.user || !req.user.id) {
            res.status(401).json({ message: 'Пользователь не авторизован' });
            return;
        }

        const currentUser = await User.findById(req.user.id);
        console.log('Найден текущий пользователь:', currentUser ? currentUser.username : 'Не найден');

        if (!currentUser) {
            res.status(404).json({ message: 'Пользователь не найден' });
            return; // Важно выйти из функции после отправки ответа
        }

        // Получаем ID пользователей, на которых подписан текущий пользователь
        // Эти ID хранятся в массиве 'following' пользователя.
        const followedUsersIds = currentUser.following;
        console.log('ID пользователей, на которых подписан (currentUser.following):', followedUsersIds);

        // Добавляем ID самого текущего пользователя, чтобы видеть и свои посты в ленте
        // (если это желаемое поведение)
        const allRelevantUserIds = [...followedUsersIds, currentUser._id];
        console.log('Все релевантные ID пользователей (включая текущего):', allRelevantUserIds);

        // Преобразуем ObjectId в строки для более надежного сравнения/лога
        const stringRelevantUserIds = allRelevantUserIds.map(id => id.toString());
        console.log('Все релевантные ID пользователей (как строки):', stringRelevantUserIds);

        // Находим все посты, где author._id находится в списке allRelevantUserIds
        // Сортируем посты по дате создания в убывающем порядке (самые новые сверху)
        // Используем populate для получения информации об авторе поста
        const timelinePosts = await Post.find({
            author: { $in: allRelevantUserIds }
        })
        .sort({ createdAt: -1 }) // Сортировка от новых к старым
        .populate('author', 'username profilePicture') // Загружаем username и profilePicture автора
        .populate({
            path: 'comments.author',
            select: 'username profilePicture' // Загружаем username и profilePicture автора комментария
        });
        console.log('Количество найденных постов для ленты:', timelinePosts.length);
        console.log('Найденные посты для ленты (первые 3):', timelinePosts.slice(0, 3)); // Логируем только первые несколько для краткости

        res.status(200).json(timelinePosts);
        console.log('--- getTimelinePosts завершен успешно ---');

    } catch (error) {
        console.error(error); // Для отладки на сервере
        res.status(500).json({ message: 'Ошибка сервера при получении ленты новостей' });
    }
};

// @desc    Получить посты по определенному хэштегу
// @route   GET /api/posts/hashtag/:tag_name
// @access  Приватный (требуется аутентификация)
export const getPostsByHashtag = async (req, res) => {
    try {
        const tagName = req.params.tag_name.toLowerCase(); // Получаем имя хэштега из параметров запроса и приводим к нижнему регистру
        console.log("Получение постов с хэштегом:", tagName);

        const posts = await Post.find({ hashtags: tagName }) // Ищем посты, где массив hashtags содержит указанный тег
            .populate("author", "username profilePicture")
            .sort({ createdAt: -1 })
            .limit(50); // Ограничиваем количество постов для производительности

        if (posts.length === 0) {
            return res.status(404).json({ message: `Посты с хэштегом #${tagName} не найдены` });
        }

        return res.status(200).json({
            message: `Посты с хэштегом #${tagName} успешно получены`,
            posts,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Ошибка сервера при получении постов по хэштегу" });
    }
};