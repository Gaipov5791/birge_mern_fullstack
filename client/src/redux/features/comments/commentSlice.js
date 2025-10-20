import { createSlice } from "@reduxjs/toolkit";
import { addComment, getComments, deleteComment, updateComment } from "./commentThunks";


const initialState = {
    comments: [],
    newlyCreatedCommentId: null, // Для хранения ID только что созданного поста
    isLoading: false,
    isPublishing: false,
    isCommentOperationLoading: false,
    isError: false,
    isSuccess: false,
    loadingMessage: "",
};

const commentSlice = createSlice({
    name: "comments",
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isPublishing = false;
            state.isCommentOperationLoading = false;
            state.isError = false;
            state.isSuccess = false;
            state.loadingMessage = "";
        },
        clearComments: (state) => {
            state.comments = [];
        },
        clearNewlyCommentId: (state) => {
            state.newlyCreatedCommentId = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ADD COMMENT
            .addCase(addComment.pending, (state) => {
                state.isPublishing = true;
                state.isCommentOperationLoading = false;
                state.isLoading = true;
                state.loadingMessage = 'Добавление комментария...';
            })
            .addCase(addComment.fulfilled, (state, action) => {
                state.isPublishing = false;
                state.isCommentOperationLoading = false;
                state.isLoading = false;
                state.isSuccess = true;
                state.loadingMessage = "Комментарий успешно добавлен";
                console.log('addComment.fulfilled - action.payload:', action.payload);

                state.newlyCreatedCommentId = action.payload ? action.payload._id : null; // Сохраняем ID нового комментария

                if (action.payload) {
                    if (Array.isArray(state.comments)) {
                        state.comments.push(action.payload); // Добавляем новый комментарий в массив
                    } else {
                        state.comments = [action.payload];
                    }
                }
            })
            .addCase(addComment.rejected, (state, action) => {
                state.isPublishing = false;
                state.isCommentOperationLoading = false;
                state.isLoading = false;
                state.isError = true;
                state.loadingMessage = action.payload;
            })
            // GET COMMENTS
            .addCase(getComments.pending, (state) => {
                state.isLoading = true;
                state.comments = []; 
            })
            .addCase(getComments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                console.log('getComments.fulfilled - action.payload:', action.payload); 

                if (action.payload && Array.isArray(action.payload.comments)) {
                    state.comments = action.payload.comments; 
                } else {
                    state.comments = []; 
                    console.error('getComments.fulfilled: action.payload.comments не является массивом или отсутствует. Payload:', action.payload);
                }
            })
            .addCase(getComments.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.comments = [];
            })
            // DELETE COMMENT
            .addCase(deleteComment.pending, (state) => {
                state.isCommentOperationLoading = true;
                state.isLoading = false;
                state.loadingMessage = 'Удаление комментария...';
            })
            .addCase(deleteComment.fulfilled, (state, action) => {
                state.isCommentOperationLoading = false;
                state.isLoading = false;
                state.isSuccess = true;
                state.loadingMessage = "Комментарий успешно удален";

                if (Array.isArray(state.comments)) {
                    // action.payload - это ID удаленного комментария
                    state.comments = state.comments.filter(comment => String(comment._id) !== String(action.payload)); 
                }
            })
            .addCase(deleteComment.rejected, (state, action) => {
                state.isCommentOperationLoading = false;
                state.isLoading = false;
                state.isError = true;
                state.loadingMessage = action.payload;
            })
            // UPDATE COMMENT
            .addCase(updateComment.pending, (state) => {
                state.isCommentOperationLoading = true;
                state.isLoading = false;
                state.loadingMessage = 'Обновление комментария...';
            })
            .addCase(updateComment.fulfilled, (state, action) => {
                state.isCommentOperationLoading = false;
                state.isLoading = false;
                state.isSuccess = true;
                const index = state.comments.findIndex(comment => String(comment._id) === String(action.payload._id));
                if (Array.isArray(state.comments) && index !== -1) {
                    state.comments[index] = action.payload;
                } else {
                    console.error('Comment not found in state.comments:', action.payload);
                }
                state.loadingMessage = "Комментарий успешно обновлен";
            })
            .addCase(updateComment.rejected, (state, action) => {
                state.isCommentOperationLoading = false;
                state.isLoading = false;
                state.isError = true;
                state.loadingMessage = action.payload;
            });
    }
});
export const { reset, clearComments, clearNewlyCommentId } = commentSlice.actions;
export default commentSlice.reducer;
