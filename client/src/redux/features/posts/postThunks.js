import { createAsyncThunk } from "@reduxjs/toolkit";
import postService from "../../../api/postService";

// Создать пост
export const createPost = createAsyncThunk(
    'posts/createPost',
    async (postData, thunkAPI) => {
        try {
            return await postService.createPost(postData);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
});

// Получить все посты
export const getPosts = createAsyncThunk(
    'posts/getPosts',
    async (_, thunkAPI) => {
        try {
            const response = await postService.getPosts();
            return response.posts;
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Получить посты конкретного пользователя
export const getUserPosts = createAsyncThunk(
    'posts/getUserPosts',
    async (userId, thunkAPI) => {
        try {
            return await postService.getUserPosts(userId);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Поставить/убрать лайк посту
export const likePost = createAsyncThunk(
    'posts/likePost',
    async (postId, thunkAPI) => {
        try {
            return await postService.likePost(postId);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);


// Обновление поста
export const updatePost = createAsyncThunk(
    'posts/updatePost',
    async ({ postId, postData }, thunkAPI) => {
    try {
        return await postService.updatePost(postId, postData);
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();    

        return thunkAPI.rejectWithValue(message);
    }
    }
);

// Удаление поста
export const deletePost = createAsyncThunk(
    'posts/deletePost',
    async (postId, thunkAPI) => {
    try {
        return await postService.deletePost(postId);
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();    
        return thunkAPI.rejectWithValue(message);
    }
    }
);

// Получение поста по ID
export const getPostById = createAsyncThunk(
    'posts/getPostById',
    async (postId, thunkAPI) => {
    try {
        return await postService.getPostById(postId);
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
    }
);

// Получение постов по хэштегу
export const getPostsByHashtag = createAsyncThunk(
    'posts/getPostsByHashtag',
    async (tagName, thunkAPI) => {
    try {
        return await postService.getPostsByHashtag(tagName);
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
    }
);