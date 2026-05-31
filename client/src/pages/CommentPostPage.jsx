import React, { useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getPostById } from '../redux/features/posts/postThunks';
import { getComments, addComment } from '../redux/features/comments/commentThunks';
import { reset as resetPosts } from '../redux/features/posts/postSlice';
import { 
    clearNewlyCommentId,
    reset as resetComments
} from '../redux/features/comments/commentSlice';

import CommentForm from '../components/CommentForm';
import CommentHeader from '../components/comments/CommentsHeader';
import CommentActions from '../components/comments/CommentsActions';
import CommentSkeleton from '../components/comments/CommentSkeleton';

import { toastError } from '../redux/features/notifications/notificationSlice';
import { FaSpinner } from 'react-icons/fa';


function CommentPostPage() {
    const { t } = useTranslation();
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

    const commentsEndRef = useRef(null);

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

    useEffect(() => {
        if (postError) {
            dispatch(toastError(postMessage || t('comment.loadPostError')));
            dispatch(resetPosts());
            navigate('/');
        }
    }, [postError, postMessage, dispatch, navigate, t]);

    useEffect(() => {
        if (commentsError) {
            dispatch(toastError(commentsMessage || t('comment.loadCommentsError')));
            dispatch(resetComments());
        }
    }, [commentsError, commentsMessage, dispatch, t]);
    
    useEffect(() => {
        if (newlyCreatedCommentId && commentsEndRef.current) {
            commentsEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            dispatch(clearNewlyCommentId());
        }
    }, [newlyCreatedCommentId, dispatch]);

    if (postLoading) {
        return (
            <CommentSkeleton />
        );
    }

    if (!currentPost) {
        return <h2 className="text-center text-xl mt-10 text-red-500">{t('post.notFound')}</h2>;
    }

    return (
        <div className='min-h-screen bg-neutral-950 text-gray-100 p-4 sm:p-6 lg:p-8'>
            <div className="container mx-auto p-4 mt-8 max-w-2xl">
                <Link to="/dashboard" className="text-blue-500 hover:underline mb-4 block">
                    {t('post.backToFeed')}
                </Link>

                <CommentHeader post={currentPost} commentsCount={comments?.length || 0} />

                {currentUser ? (
                    <CommentForm 
                        isPublishing={isPublishing}
                        onSubmit={(text) => dispatch(addComment({ postId: currentPost._id, text }))} 
                    />
                ) : (
                    <p className="text-center text-gray-600 mb-4">{t('comment.loginToComment')}</p>
                )}

                <h2 className="text-2xl font-bold text-gray-400 mb-4 mt-8">{t('comment.sectionTitle')}</h2>
                
                <CommentActions 
                    comments={comments} 
                    currentUserId={currentUser?._id}
                    commentsEndRef={commentsEndRef}
                />

            </div>
        </div>
    );
}

export default CommentPostPage;
