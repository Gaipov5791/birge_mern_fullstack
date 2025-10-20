import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cloudinary } from '../config/cloudinaryConfig.js';

const generateToken = (id) => {
    console.log('Generating token for ID:', id); // Логируем ID для отладки
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '24h',
    });
};


// @desc    Регистрация нового пользователя
// @route   POST /api/users/register
// @access  Публичный
export const registerUser = async (req, res) => {
    const { username, email, password} = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Пожалуйста, заполните все поля.' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует.' });
        }

        user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: 'Пользователь с таким именем уже существует.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username,
            email,
            password: hashedPassword,
        });
        await user.save();
        const token = generateToken(user._id);
        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован.',
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                bio: user.bio,
                following: user.following,
                followers: user.followers,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера. Попробуйте позже.' });
        
    }
};

// @desc    Вход пользователя
// @route   POST /api/users/login
// @access  Публичный
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Пожалуйста, заполните все поля.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Неверный email или пароль.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Неверный email или пароль.' });
        }

        const token = generateToken(user._id);
        res.status(200).json({
            message: 'Вход успешно выполнен',
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                bio: user.bio,
                following: user.following,
                followers: user.followers,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера. Попробуйте позже.' });
    }
};

// @desc    Подписаться на пользователя
// @route   PUT /api/users/follow/:id
// @access  Приватный
export const followUser = async (req, res) => {
    const userToFollowId = req.params.id; // ID пользователя, на которого подписываемся
    const currentUserId = req.user._id;   // ID текущего авторизованного пользователя (кто подписывается)

    // Проверяем, чтобы пользователь не мог подписаться на самого себя
    if (userToFollowId === String(currentUserId)) { // String() для сравнения ObjectId с String
        return res.status(400).json({ message: "Вы не можете подписаться на самого себя." });
    }

    try {
        // 1. Находим пользователя, на которого хотим подписаться (userToFollow)
        const userToFollow = await User.findById(userToFollowId);
        if (!userToFollow) {
            return res.status(404).json({ message: "Пользователь для подписки не найден." });
        }

        // 2. Находим текущего авторизованного пользователя (currentUser)
        const currentUser = await User.findById(currentUserId);
        if (!currentUser) { // Эта проверка по идее не нужна, т.к. protect уже гарантирует, что user существует
            return res.status(404).json({ message: "Текущий пользователь не найден." });
        }

        // Проверяем, подписан ли текущий пользователь уже на userToFollow
        if (currentUser.following.includes(userToFollowId)) {
            return res.status(400).json({ message: "Вы уже подписаны на этого пользователя." });
        }

        // Добавляем ID userToFollow в массив 'following' у текущего пользователя
        currentUser.following.push(userToFollowId);
        // Добавляем ID currentUser в массив 'followers' у userToFollow
        userToFollow.followers.push(currentUserId);

        await currentUser.save();
        await userToFollow.save();

        // Возвращаем обновленные данные текущего пользователя
        const updatedCurrentUser = await User.findById(currentUserId).select('-password'); // Исключаем пароль
        const updatedUserToFollow = await User.findById(userToFollowId).select('-password');

        res.status(200).json({
            message: `Вы подписались на ${userToFollow.username}.`,
            currentUser: updatedCurrentUser, // Обновленные данные текущего пользователя
            userToFollow: updatedUserToFollow // Обновленные данные пользователя, на которого подписались
        });

    } catch (error) {
        console.error(error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: "Неверный ID пользователя." });
        }
        res.status(500).json({ message: "Ошибка сервера при подписке." });
    }
};

// @desc    Отписаться от пользователя
// @route   PUT /api/users/unfollow/:id
// @access  Приватный
export const unfollowUser = async (req, res) => {
    const userToUnfollowId = req.params.id;
    const currentUserId = req.user._id;

    // Проверяем, чтобы пользователь не мог отписаться от самого себя
    if (userToUnfollowId === String(currentUserId)) {
        return res.status(400).json({ message: 'Вы не можете отписаться от себя.' });
    }

    try {
        // 1. Находим пользователя, от которого хотим отписаться (userToUnfollow)
        const userToUnfollow = await User.findById(userToUnfollowId);
        if (!userToUnfollow) {
            return res.status(404).json({ message: "Пользователь для отписки не найден." });
        }

        // 2. Находим текущего авторизованного пользователя (currentUser)
        const currentUser = await User.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).json({ message: "Текущий пользователь не найден." });
        }

        // Проверяем, подписан ли текущий пользователь уже на userToUnfollow
        if (!currentUser.following.includes(userToUnfollowId)) {
            return res.status(400).json({ message: 'Вы не подписаны на этого пользователя.' });
        }

        // Удаляем ID userToUnfollow из массива 'following' у текущего пользователя
        currentUser.following.pull(userToUnfollowId);
        // Удаляем ID currentUser из массива 'followers' у userToUnfollow
        userToUnfollow.followers.pull(currentUserId);

        // Сохраняем изменения в базе данных
        await currentUser.save();
        await userToUnfollow.save();

        // Возвращаем обновленные данные текущего пользователя
        const updateCurrentUser = await User.findById(currentUserId)
            .select('-password')

        const updateUserToUnfollow = await User.findById(userToUnfollowId)
            .select('-password')

        // Возвращаем ответ с обновленными данными
        res.status(200).json({
            message: `Вы успешно отписались от пользователя ${userToUnfollow.username}.`,
            currentUser: updateCurrentUser,
            userToUnfollow: updateUserToUnfollow,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера. Попробуйте позже.' });
    }
};

// @desc    Получить профиль пользователя
// @route   GET /api/users/:id
// @access  Публичный
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const requestingUserId = req.user ? req.user._id : null; // ID текущего авторизованного пользователя, если есть
        const user = await User.findById(userId)
            .select('-password') // Исключаем пароль из ответа
            .populate('followers', 'username profilePicture') // Заполняем массив подписчиков
            .populate('following', 'username profilePicture'); // Заполняем массив подписок

         if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден.' });
        }
        // Проверяем, подписан ли текущий пользователь на этого пользователя
        let isFollowing = false;
        if (requestingUserId && user.followers.some(follower => String(follower._id) === String(requestingUserId))) {
            isFollowing = true;
        }

        // Возвращаем объект пользователя, включая followers и following
        res.status(200).json({ 
            user, 
            isFollowing, 
            message: 'Профиль пользователя успешно получен.'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера. Попробуйте позже.' });
        
    }
}; 


// @desc    Получить список рекомендованных пользователей
// @route   GET /api/users/recommended
// @access  Приватный
export const getRecommendedUsers = async (req, res) => {
    
    // ⭐ ВАЖНАЯ ПРОВЕРКА ДЛЯ ИСКЛЮЧЕНИЯ ПОВТОРНОГО ВЫЗОВА:
    // Если req.user не был установлен middleware, завершаем работу, 
    // хотя этого не должно происходить после успешного protect
    if (!req.user || !req.user._id) {
         return res.status(401).json({ message: "Не авторизован: данные пользователя отсутствуют." });
    }
    
    const currentUserId = req.user._id; 
    
    // Определяем параметры для пагинации (для улучшения производительности в будущем)
    const limit = parseInt(req.query.limit) || 5; 
    const skip = parseInt(req.query.skip) || 0;

    try {
        // 1. Находим текущего пользователя... (Остальной код верен)
        const currentUser = await User.findById(currentUserId).select('following');
        
        if (!currentUser) {
            return res.status(404).json({ message: "Текущий пользователь не найден." });
        }

        // 2. Определяем список ID, которые нужно исключить
        const excludedIds = [currentUserId, ...currentUser.following];

        // 3. Выполняем запрос к базе данных
        const recommendedUsers = await User.find({
            _id: { $nin: excludedIds }
        })
        .select('_id username profilePicture bio followers') 
        .sort({ followers: -1, createdAt: 1 }) 
        .limit(limit)
        .skip(skip);

        // 4. Форматируем результат для клиента
        const formattedUsers = recommendedUsers.map(user => ({
            _id: user._id,
            username: user.username,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followersCount: user.followers.length, 
            isFollowing: false 
        }));

        // ⭐ УСПЕШНОЕ ЗАВЕРШЕНИЕ
        res.status(200).json({
            message: 'Список рекомендованных пользователей получен.',
            users: formattedUsers,
            count: formattedUsers.length 
        });

    } catch (error) {
        console.error('Ошибка при получении рекомендованных пользователей:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении рекомендаций.' });
    }
};

// @desc    Получить данные текущего пользователя
// @route   GET /api/users/me
// @access  Приватный
export const getUserMe = async (req, res) => {
    try {
        if (req.user) {
            return res.status(200).json(req.user);
        } else {
            return res.status(404).json({ message: 'Пользователь не найден.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера. Попробуйте позже.' });
    }
};
            

// @desc    Обновить профиль текущего пользователя
// @route   PUT /api/users/profile
// @access  Приватный
export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user._id; // ID текущего авторизованного пользователя
        const { username, email, bio, profilePicture } = req.body;
        // if (!username || !email) {
        //     return res.status(400).json({ message: 'Пожалуйста, заполните все обязательные поля.' });
        // }
        // Находим текущего пользователя
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден.' });
        }
        // Проверяем, изменился ли email и есть ли уже пользователь с таким email
        if (user.email !== email) {
            const existingUser = await User.find({ email });
            if (existingUser.length > 0) {
                return res.status(400).json({ message: 'Пользователь с таким email уже существует.' });
            }
        }
        // Обновляем профиль пользователя
        // user.username = username;
        // user.email = email;
        user.bio = bio || user.bio; // Если bio не передано, оставляем текущее значение
        // user.profilePicture = profilePicture || user.profilePicture; // Если profilePicture не передано
        await user.save();
        // Возвращаем обновленные данные пользователя
        const updatedUser = await User.findById(userId).select('-password'); // Исключаем пароль из ответа
        res.status(200).json({
            message: 'Профиль успешно обновлен.',
            user: updatedUser,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера. Попробуйте позже.' });
        
    }
}

// @desc    Загрузить/обновить фотографию профиля
// @route   PUT /api/users/upload-profile-picture/:id
// @access  Приватный
export const uploadProfilePicture = async (req, res) => {
    try {
        const userIdFromParams = req.params.id; // ID пользователя из URL
        const requestingUserId = req.user._id;   // ID авторизованного пользователя из токена

        // Проверка безопасности: пользователь может обновлять только СВОЙ профиль
        if (String(userIdFromParams) !== String(requestingUserId)) {
            return res.status(403).json({ message: 'Вы не авторизованы для изменения этого профиля.' });
        }

        const user = await User.findById(userIdFromParams);

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден.' });
        }

        if (!req.file) { // Проверяем, был ли файл загружен Multer'ом
            return res.status(400).json({ message: 'Файл изображения не найден.' });
        }

        // Загружаем файл в Cloudinary
        // `req.file.buffer` содержит бинарные данные файла из `memoryStorage` Multer'а
        const result = await cloudinary.uploader.upload(
            `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
            {
                folder: 'profile_pictures', // Папка в Cloudinary для ваших аватарок
                width: 200, // Например, уменьшаем ширину для аватара
                height: 200, // Высота
                crop: 'fill' // Обрезать и заполнить, чтобы получить квадрат
            }
        );

        // Обновляем URL фотографии профиля пользователя
        user.profilePicture = result.secure_url; // secure_url - это HTTPS ссылка на изображение

        // Сохраняем пользователя в базе данных
        const updatedUser = await user.save();

        // Отправляем обновленный профиль обратно
        res.status(200).json({
            message: 'Фотография профиля успешно обновлена!',
            user: {
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                profilePicture: updatedUser.profilePicture,
                bio: updatedUser.bio,
                followers: updatedUser.followers,
                following: updatedUser.following,
                // Добавьте другие поля, если нужно
            }
        });

    } catch (error) {
        console.error('Ошибка при загрузке фотографии профиля:', error);
        if (error.message === 'Разрешены только файлы изображений!') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Ошибка сервера при загрузке фотографии. Попробуйте позже.' });
    }
};

/**
 * @desc    Обработка успешного входа через Google
 * @route   GET /api/auth/google/callback (Финальная стадия)
 * @access  Public
 */
export const googleAuthSuccess = (req, res) => {
    // Passport.js уже добавил объект пользователя в req.user
    if (!req.user) {
        // Если что-то пошло не так на этапе Passport, перенаправляем на ошибку
        return res.redirect(`${process.env.CLIENT_URL}/login?error=GoogleAuthFailed`);
    }

    // Генерируем наш собственный JWT
    const token = generateToken(req.user._id);
    
    // Перенаправляем пользователя обратно на фронтенд, передавая токен
    const redirectUrl = `${process.env.CLIENT_URL}?token=${token}`;
    
    // Успешный вход
    res.redirect(redirectUrl);
};

