import { createSlice } from "@reduxjs/toolkit";
import {
    createPost,
    getPosts,
    getUserPosts,
    getPostById,
    getPostsByHashtag,
    likePost,
    updatePost,
    deletePost
} from '../posts/postThunks';

const initialState = {
    timelinePosts: [], // Для хранения постов в ленте новостей
    userPosts: [], // ⭐ ДОБАВЛЕНО: Массив для постов, отображаемых в профиле
    hashtagFeed: [], // Для хранения постов по хэштегу
    currentPost: null, // Для хранения текущего поста при его получении по ID
    newlyCreatedPostId: null, // Для хранения ID только что созданного поста
    isPosting: false, // Флаг для состояния публикации поста
    isLoading: false,
    isLiking: false,
    isHashtagLoading: false,
    hashtagErrorMessage: "",
    postsLoaded: false, 
    // ⭐ Поля для модальных окон
    isPostOperationLoading: false,
    postIdToEdit: null,
    postIdToDelete: null,
    isError: false,
    isSuccess: false,
    message: "",
};


const postSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        reset: (state) => {
            state.isPosting = false;
            state.isLoading = false;
            state.isLiking = false;
            state.isPostOperationLoading = false;
            state.postIdToEdit = null;
            state.postIdToDelete = null;
            state.isError = false;
            state.isSuccess = false;
            state.message = "";
        },
        updateSinglePostInState: (state, action) => {
            const updatedPost = action.payload;
            if (state.currentPost && String(state.currentPost._id) === String(updatedPost._id)) {
                state.currentPost = updatedPost;
            }
            const indexInTimeline = state.timelinePosts.findIndex(post => String(post._id) === String(updatedPost._id));
            if (indexInTimeline !== -1) {
                state.timelinePosts[indexInTimeline] = updatedPost;
            }
            // ⭐ Обновляем и userPosts на всякий случай
            const indexInUserPosts = state.userPosts.findIndex(post => String(post._id) === String(updatedPost._id));
            if (indexInUserPosts !== -1) {
                state.userPosts[indexInUserPosts] = updatedPost;
            }
        },
        updatePostAuthorFollowData: (state, action) => {
            const { userId, followers, following } = action.payload; 

            state.isLoading = false;
            state.isLiking = false;
            state.isError = false;
            state.isSuccess = false;
            state.message = "";

            const mapFunc = (post) => {
                if (post.author && String(post.author._id) === String(userId)) {
                    return {
                        ...post,
                        author: {
                            ...post.author,
                            followers: followers,
                            following: following,
                        }
                    };
                }
                return post;
            };

            state.timelinePosts = state.timelinePosts.map(mapFunc);
            state.userPosts = state.userPosts.map(mapFunc); // ⭐ Обновляем userPosts
        },
        setPostIdToEdit: (state, action) => {
            state.postIdToEdit = action.payload;
        },
        clearPostIdToEdit: (state) => {
            state.postIdToEdit = null;
        },
        setPostIdToDelete: (state, action) => {
            state.postIdToDelete = action.payload;
        },
        clearPostIdToDelete: (state) => {
            state.postIdToDelete = null;
        },
        clearNewlyCreatedPostId: (state) => {
            state.newlyCreatedPostId = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // CREATE POST
            .addCase(createPost.pending, (state) => {
                state.isPosting = true;
            })
            .addCase(createPost.fulfilled, (state, action) => {
                state.isPosting = false;
                state.isSuccess = true;
                state.isError = false;
                state.message = action.payload.message || 'Пост успешно создан!';
                state.newlyCreatedPostId = action.payload.post._id;

                if (action.payload && action.payload.post) {
                    state.timelinePosts.unshift(action.payload.post);
                    // ⭐ Если создается пост в профиле, нужно обновить и userPosts
                    // (Предполагая, что профиль текущего пользователя)
                    // Эта логика может быть сложной, но добавим базовое обновление:
                    // Если пользователь находится в своем профиле, новый пост добавится:
                    // state.userPosts.unshift(action.payload.post); 
                }
            })
            .addCase(createPost.rejected, (state, action) => {
                state.isPosting = false;
                state.isError = true;
                state.message = action.payload;
                state.isSuccess = false;
            })
            // GET ALL POSTS
            .addCase(getPosts.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.message = "";
            })
            .addCase(getPosts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.postsLoaded = true;
                state.timelinePosts = action.payload;
            })
            .addCase(getPosts.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.timelinePosts = [];
            })
            // GET USER POSTS
            .addCase(getUserPosts.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getUserPosts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.userPosts = action.payload; // ✅ Сохраняем посты профиля
            })
            .addCase(getUserPosts.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.userPosts = [];
            })
            // LIKE POST
            .addCase(likePost.pending, (state) => {
                state.isLiking = true;
                state.isLoading = false;
            })
            .addCase(likePost.fulfilled, (state, action) => {
                state.isLiking = false;
                state.isSuccess = true; 
                const likedPostPayload = action.payload.post; 
                if (likedPostPayload) {
                    const mapFunc = (post) => String(post._id) === String(likedPostPayload._id) ? likedPostPayload : post;
                    
                    state.timelinePosts = state.timelinePosts.map(mapFunc);
                    state.userPosts = state.userPosts.map(mapFunc); // ⭐ ОБНОВЛЕНИЕ userPosts
                    
                    if (state.currentPost && String(state.currentPost._id) === String(likedPostPayload._id)) {
                        state.currentPost = likedPostPayload;
                    }
                }
                state.message = action.payload.message || "";
            })
            .addCase(likePost.rejected, (state, action) => {
                state.isLiking = false;
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // UPDATE POST
            .addCase(updatePost.pending, (state) => {
                state.isPostOperationLoading = true;
                state.message = 'Обновление поста...';
            })
            .addCase(updatePost.fulfilled, (state, action) => {
                state.isPostOperationLoading = false;
                state.isLoading = false;
                state.isSuccess = true; 
                state.postIdToEdit = null;

                const updatedPostPayload = action.payload.post;
                if (updatedPostPayload) {
                    const mapFunc = (post) => String(post._id) === String(updatedPostPayload._id) ? updatedPostPayload : post;
                    
                    // ✅ ОБНОВЛЕНИЕ TIMELINE
                    state.timelinePosts = state.timelinePosts.map(mapFunc);
                    
                    // ⭐ ИСПРАВЛЕНИЕ: ОБНОВЛЕНИЕ USER POSTS
                    state.userPosts = state.userPosts.map(mapFunc);

                    if (state.currentPost && String(state.currentPost._id) === String(updatedPostPayload._id)) {
                        state.currentPost = updatedPostPayload;
                    }
                }
                state.message = "Пост успешно обновлен";
            })
            .addCase(updatePost.rejected, (state, action) => {
                state.isPostOperationLoading = false;
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.postIdToEdit = null;
            })
            // DELETE POST
            .addCase(deletePost.pending, (state) => {
                state.isPostOperationLoading = true;
                state.message = 'Удаление поста...';
            })
            .addCase(deletePost.fulfilled, (state, action) => {
                state.isPostOperationLoading = false;
                state.isLoading = false;
                state.isSuccess = true;
                state.postIdToDelete = null; 
                
                let deletedId = action.payload;
                if (action.payload && typeof action.payload === 'object' && (action.payload.id || action.payload._id)) {
                    deletedId = action.payload.id || action.payload._id;
                }
                
                const filterFunc = (post) => String(post._id) !== String(deletedId);

                // ✅ ОБНОВЛЕНИЕ TIMELINE
                state.timelinePosts = state.timelinePosts.filter(filterFunc);
                
                // ⭐ ИСПРАВЛЕНИЕ: ОБНОВЛЕНИЕ USER POSTS
                state.userPosts = state.userPosts.filter(filterFunc);

                state.message = "Пост успешно удален";
            })
            .addCase(deletePost.rejected, (state, action) => {
                state.isPostOperationLoading = false;
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.postIdToDelete = null;
            })
            // GET POST BY ID
            .addCase(getPostById.pending, (state) => {
                state.isLoading = true;
                state.currentPost = null;
            })
            .addCase(getPostById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true; 
                state.message = action.payload.message || "";
                state.currentPost = action.payload.post;
            })
            .addCase(getPostById.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.currentPost = null;
            })
            // --- getPostsByHashtag ---
            .addCase(getPostsByHashtag.pending, (state) => {
                state.isHashtagLoading = true;
                state.hashtagFeed = [];
                state.hashtagErrorMessage = '';
            })
            .addCase(getPostsByHashtag.fulfilled, (state, action) => {
                state.isHashtagLoading = false;
                // В action.payload - массив постов
                state.hashtagFeed = action.payload; 
            })
            .addCase(getPostsByHashtag.rejected, (state, action) => {
                state.isHashtagLoading = false;
                state.hashtagErrorMessage = action.payload;
                state.hashtagFeed = [];
            });
    }
});

export const { 
    reset, 
    updateSinglePostInState, 
    updatePostAuthorFollowData,
    setPostIdToEdit,
    clearPostIdToEdit,
    setPostIdToDelete,
    clearPostIdToDelete,
    clearNewlyCreatedPostId
} = postSlice.actions;
export default postSlice.reducer;
