import React, { useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getPostById } from '../redux/features/posts/postThunks';
import { getComments, addComment } from '../redux/features/comments/commentThunks';
import { reset as resetPosts } from '../redux/features/posts/postSlice';
import { 
    clearNewlyCommentId,
    reset as resetComments
} from '../redux/features/comments/commentSlice';

import CommentForm from '../components/CommentForm';
import CommentHeader from '../components/comments/CommentsHeader'; // ⭐ НОВЫЙ ИМПОРТ
import CommentActions from '../components/comments/CommentsActions'; // ⭐ НОВЫЙ ИМПОРТ
import CommentSkeleton from '../components/comments/CommentSkeleton';

import { toastError } from '../redux/features/notifications/notificationSlice';
import { FaSpinner } from 'react-icons/fa';


function CommentPostPage() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user: currentUser } = useSelector((state) => state.auth);

    const {
        currentPost,
        isLoading: postLoading,
        isError: postError,
        message: postMessage
    } = useSelector((state) => state.posts);
    
    const {
        comments,
        isPublishing,
        isError: commentsError,
        message: commentsMessage,
        newlyCreatedCommentId,
    } = useSelector((state) => state.comments);

    // Ref для прокрутки к новому комментарию
    const commentsEndRef = useRef(null);

    // --- ЛОГИКА ЗАГРУЗКИ ДАННЫХ ---
    useEffect(() => {
        if (id) {
            dispatch(getPostById(id));
            dispatch(getComments(id));
        }
        return () => {
            dispatch(resetPosts());
            dispatch(resetComments());
        };
    }, [id, dispatch]);

    // --- ОБРАБОТКА ОШИБОК ---
    useEffect(() => {
        if (postError) {
            dispatch(toastError(postMessage || 'Произошла ошибка при загрузке поста.'));
            dispatch(resetPosts());
            navigate('/'); // Перенаправление в случае критической ошибки загрузки поста
        }
    }, [postError, postMessage, dispatch, navigate]);

    useEffect(() => {
        if (commentsError) {
            dispatch(toastError(commentsMessage || 'Произошла ошибка при загрузке комментариев.'));
            dispatch(resetComments());
        }
    }, [commentsError, commentsMessage, dispatch]);
    
    // --- СКРОЛЛ К НОВОМУ КОММЕНТАРИЮ ---
    useEffect(() => {
        if (newlyCreatedCommentId && commentsEndRef.current) {
            // Условие для скролла в CommentActions будет использовать этот же ID
            commentsEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            dispatch(clearNewlyCommentId());
        }
    }, [newlyCreatedCommentId, dispatch]);

    // --- ПРОВЕРКА ЗАГРУЗКИ ---
    if (postLoading) {
        return (
            <CommentSkeleton />
        );
    }

    if (!currentPost) {
        return <h2 className="text-center text-xl mt-10 text-red-500">Пост не найден.</h2>;
    }

    // --- ОТОБРАЖЕНИЕ КОМПОНЕНТОВ ---
    return (
        <div className='min-h-screen bg-neutral-950 text-gray-100 p-4 sm:p-6 lg:p-8'>
            <div className="container mx-auto p-4 mt-8 max-w-2xl">
                <Link to="/dashboard" className="text-blue-500 hover:underline mb-4 block">
                    &larr; Назад к ленте
                </Link>

                {/* 1. Блок отображения поста */}
                <CommentHeader post={currentPost} commentsCount={comments?.length || 0} />

                {/* 2. Форма для добавления комментария */}
                {currentUser ? (
                    <CommentForm 
                        isPublishing={isPublishing}
                        // Thunk будет вызван через пропс
                        onSubmit={(text) => dispatch(addComment({ postId: currentPost._id, text }))} 
                    />
                ) : (
                    <p className="text-center text-gray-600 mb-4">Войдите, чтобы оставить комментарий.</p>
                )}

                {/* 3. Список комментариев и действия (удаление/редактирование) */}
                <h2 className="text-2xl font-bold text-gray-400 mb-4 mt-8">Комментарии</h2>
                
                <CommentActions 
                    comments={comments} 
                    currentUserId={currentUser?._id}
                    commentsEndRef={commentsEndRef} // Передаем Ref для скролла
                />

            </div>
        </div>
    );
}

export default CommentPostPage;