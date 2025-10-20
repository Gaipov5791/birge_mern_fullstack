import { createAsyncThunk } from "@reduxjs/toolkit";
import commentService from "../../../api/commentService";
import { updateSinglePostInState } from '../posts/postSlice'; // Импортируем именованный экспорт

// Добавить комментарий к посту
export const addComment = createAsyncThunk(
    'comments/add',
    async ({ postId, text }, thunkAPI) => {
        try {
            const response = await commentService.addComment(postId, { text });
            console.log('addComment thunk response from service:', response);
            
            // ⭐ ИСПРАВЛЕНИЕ 2: Гибкая проверка ключа: ищем updatedPost или post.
            const postToUpdate = response.updatedPost || response.post;

            if (postToUpdate) {
                thunkAPI.dispatch(updateSinglePostInState(postToUpdate));
            } else {
                // Предупреждение теперь срабатывает только если нет НИКАКОГО обновленного поста.
                console.warn('addComment: Backend did not return an updated post object (key: updatedPost or post). Post state might be out of sync.');
            }

            return response.comment; // Возвращаем добавленный комментарий для commentSlice
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Получить комментарии для поста
export const getComments = createAsyncThunk(
    'comments/getAll',
    async (postId, thunkAPI) => {
        try {
            const response = await commentService.getCommentsForPost(postId);
            console.log('getComments thunk response from service:', response); 
            // Предполагаем, что response.comments - это массив комментариев,
            // или response - это сам массив, если сервис возвращает прямо массив.
            // Исходя из вашего `getComments.fulfilled`, похоже, что `response` имеет поле `comments`.
            return response; 
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Удалить комментарий
export const deleteComment = createAsyncThunk(
    'comments/delete',
    async (commentId, thunkAPI) => {
        try {
            const response = await commentService.deleteComment(commentId);
            
            // ⭐ ИСПРАВЛЕНИЕ 3: Гибкая проверка ключа: ищем updatedPost или post.
            const postToUpdate = response.updatedPost || response.post;

            if (postToUpdate) {
                thunkAPI.dispatch(updateSinglePostInState(postToUpdate));
            } else {
                console.warn('deleteComment: Backend did not return an updated post object (key: updatedPost or post). Post state might be out of sync.');
            }

            // Возвращаем ID, который должен быть в ответе бэкенда для фильтрации в extraReducer
            // Если бэкенд возвращает только ID, то return response.id, иначе возвращаем объект
            return response.id || commentId; 
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Обновить комментарий
export const updateComment = createAsyncThunk(
    'comments/update',
    async ({ commentId, text }, thunkAPI) => {
        try {
            const response = await commentService.updateComment(commentId, { text });
            
            // ⭐ ИСПРАВЛЕНИЕ 4: Аналогичная проверка для обновления
            const postToUpdate = response.updatedPost || response.post;

            if (postToUpdate) {
                thunkAPI.dispatch(updateSinglePostInState(postToUpdate));
            } 

            return response.comment; // Возвращаем обновленный комментарий
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);