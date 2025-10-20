// controllers/feedbackController.js
import nodemailer from 'nodemailer';

// @desc    Отправить отзыв разработчику
// @route   POST /api/feedback
// @access  Public
export const sendFeedback = async (req, res) => {
    const { subject, message, userEmail } = req.body;
    
    // 1. Проверка обязательных полей
    if (!subject || !message) {
        return res.status(400).json({ message: 'Тема и сообщение обязательны.' });
    }

    // ⭐ НОВЫЙ ШАГ: Логируем переменные ПЕРЕД попыткой соединения
    console.log('--- NODEMAILER CONFIG CHECK ---');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('DEVELOPER_EMAIL (TO):', process.env.DEVELOPER_EMAIL);
    // Проверяем длину App Password (должно быть 16 символов)
    console.log('EMAIL_PASS Length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'N/A'); 
    console.log('-------------------------------');


    // 2. Создаем объект-транспортер Nodemailer ВНУТРИ функции
    const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST, 
    port: process.env.MAIL_PORT, 
    auth: {
        user: process.env.MAIL_USER, 
        pass: process.env.MAIL_PASS,  
    },
});


    try {
        // 3. Проверяем, что соединение с SMTP работает, до отправки письма
        await transporter.verify();
        console.log("SMTP-сервер готов к приему сообщений.");


        // 4. Настраиваем и отправляем письмо
        const mailOptions = {
            to: process.env.DEVELOPER_EMAIL, 
            from: process.env.EMAIL_USER, 
            subject: `[FEEDBACK] ${subject} (${userEmail})`,
            html: `
                <h3>Сообщение от пользователя:</h3>
                <p><strong>Отправитель:</strong> ${userEmail}</p>
                <p><strong>Тема:</strong> ${subject}</p>
                <hr/>
                <p>${message.replace(/\n/g, '<br>')}</p>
                <hr/>
                <small>Отправлено через форму обратной связи на живом приложении.</small>
            `,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Спасибо за ваш отзыв!' });

    } catch (error) {
        // ⭐ ВАЖНО: Если ошибка не с SMTP, то это может быть ваша ошибка 535
        console.error('CRITICAL NODEMAILER ERROR:', error.message);
        console.error('FULL ERROR OBJECT:', error); // Выводим весь объект ошибки
        
        // Отправляем универсальный ответ
        res.status(500).json({ message: 'Не удалось отправить отзыв. Внутренняя ошибка сервера.' });
    }
};

// Вам не нужно экспортировать transporter, только sendFeedback
// export const sendFeedback;