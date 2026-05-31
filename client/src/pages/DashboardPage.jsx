import React, { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { getPosts, deletePost } from '../redux/features/posts/postThunks';

import { logoutUser as logoutUserThunk } from '../redux/features/auth/authThunks';
import { reset as resetAuth } from '../redux/features/auth/authSlice';
import Sidebar from '../components/common/Sidebar';
import RightSidebar from '../components/common/RightSidebar';

import { 
    reset,
    clearPostIdToDelete,
    clearPostIdToEdit,
    clearNewlyCreatedPostId,
} from '../redux/features/posts/postSlice'; 

import PostForm from '../components/PostForm';
import PostItem from '../components/PostItem';
import LoadingModal from '../components/common/LoadingModal'; 
import ConfirmationModal from '../components/common/ConfirmationModal';
import PostEditModal from '../components/common/PostEditModal'; 
import PostSkeleton from '../components/posts/PostSkeleton';

import { FaSpinner, FaCloudShowersHeavy } from 'react-icons/fa';
import { toastSuccess, toastError } from '../redux/features/notifications/notificationSlice';

function DashboardPage() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user } = useSelector((state) => state.auth);
    const { 
        timelinePosts, 
        isLoading, 
        isError, 
        message, 
        nextCursor,
        isLoadingMore,
        isPostOperationLoading,
        postIdToDelete,
        postIdToEdit,
        newlyCreatedPostId,
    } = useSelector(
        (state) => state.posts
    );

    const postRefs = useRef({});
    const loadMoreRef = useRef(null);
    const hasFetchedPostsRef = useRef(false);

    const onLogout = useCallback(() => {
        dispatch(logoutUserThunk());
        dispatch(resetAuth());
        navigate("/login");
    }, [dispatch, navigate]);

    useEffect(() => {
        if (newlyCreatedPostId && postRefs.current[newlyCreatedPostId]) {
            postRefs.current[newlyCreatedPostId].scrollIntoView({ behavior: 'smooth', block: 'center' });
            dispatch(clearNewlyCreatedPostId());
        }
    }, [newlyCreatedPostId, dispatch]);

    useEffect(() => {

    }, [isPostOperationLoading]);

    const postToEdit = timelinePosts.find(p => p._id === postIdToEdit);
    const loadingMessage = isPostOperationLoading ? message : t('common.loading');


    const handleLoadMore = useCallback(() => {
        if (!nextCursor || isLoadingMore) return;
        dispatch(getPosts({ cursor: nextCursor }));
    }, [dispatch, nextCursor, isLoadingMore]);

    useEffect(() => {
        if (!loadMoreRef.current || !nextCursor || isLoadingMore) return undefined;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && nextCursor && !isLoadingMore) {
                    handleLoadMore();
                }
            },
            { rootMargin: '200px' }
        );

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [handleLoadMore, nextCursor, isLoadingMore]);

    const userId = user?._id;

    useEffect(() => {
        if (!userId) {
            hasFetchedPostsRef.current = false;
            return undefined;
        }

        if (!hasFetchedPostsRef.current) {
            hasFetchedPostsRef.current = true;
            dispatch(getPosts());
        }

        return () => {
            hasFetchedPostsRef.current = false;
            dispatch(reset());
        };
    }, [dispatch, userId]);

    useEffect(() => {
        if (isError) {
            dispatch(toastError(message));
            dispatch(clearPostIdToDelete());
            dispatch(clearPostIdToEdit());
        }
    }, [isError, message, dispatch]);

    
    const handleCloseModals = () => {
        dispatch(clearPostIdToDelete());
        dispatch(clearPostIdToEdit());
    };

    const handleDeleteConfirm = () => {
        if (postIdToDelete) {

            handleCloseModals();

            dispatch(deletePost(postIdToDelete))
                .unwrap()
                .then(() => {
                    dispatch(toastSuccess(t('dashboard.postDeleted')));
                     
                })
                .catch((error) => {
                    dispatch(toastError(t('dashboard.deleteError', { error })));
                    handleCloseModals();
                });
        }
    };
    
    if (isLoading) {
        return (
            <PostSkeleton />
        );
    }
    
    if (isError && !isPostOperationLoading) {
        return (
            <div className='min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-8'>
                <FaCloudShowersHeavy className='text-6xl text-red-500 mb-4' />
                <h1 className='text-2xl text-gray-100 bg-neutral-800 p-6 rounded-xl shadow-xl border border-red-500'>
                    {t('common.error')}: <span className="font-light text-red-400">{message || t('dashboard.loadError')}</span>
                </h1>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto flex">

                <div className="hidden lg:block w-72 flex-shrink-0">
                    <Sidebar onLogout={onLogout} />
                </div>

                <main className="flex-grow min-w-0 overflow-hidden mx-auto lg:mx-8"> 
                    
                    <h1 className='mt-5 text-xl sm:text-3xl font-extrabold text-center mb-10 text-gray-100 uppercase tracking-wider'>
                        <Trans i18nKey="dashboard.title" components={{ 1: <span className="text-blue-400" /> }} />
                    </h1>

                    {user && <PostForm />}
                    
                    {timelinePosts && timelinePosts.length > 0 ? (
                        <div className='posts-container mt-8 space-y-6'>
                            {timelinePosts.map((post) => (
                                <div 
                                    key={post._id}
                                    ref={el => postRefs.current[post._id] = el}
                                >
                                    <PostItem post={post} />
                                </div>
                            ))}
                            {(nextCursor || isLoadingMore) && (
                                <div ref={loadMoreRef} className="flex flex-col items-center py-8 gap-4">
                                    {isLoadingMore ? (
                                        <FaSpinner className="animate-spin text-3xl text-blue-400" />
                                    ) : nextCursor ? (
                                        <button
                                            type="button"
                                            onClick={handleLoadMore}
                                            className="px-6 py-2 bg-neutral-800 border border-neutral-700 rounded-full text-gray-300 hover:text-blue-400 hover:border-blue-600 transition-colors"
                                        >
                                            {t('common.showMore')}
                                        </button>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    ) : (
                        user && !isLoading && (
                            <h3 className='text-center text-xl text-gray-500 p-10 border border-neutral-800 bg-neutral-800 rounded-xl mt-8 shadow-inner shadow-neutral-900/50'>
                                {t('dashboard.emptyFeed')}
                            </h3>
                        )
                    )}

                </main>

                <div className="hidden lg:block w-72 flex-shrink-0">
                    <RightSidebar />
                </div>
            </div>
            
            <LoadingModal 
                isOpen={isPostOperationLoading} 
                message={loadingMessage}
            />

            <ConfirmationModal
                isOpen={!!postIdToDelete}
                onClose={handleCloseModals}
                onConfirm={handleDeleteConfirm}
                title={t('dashboard.deletePostTitle')}
                message={t('dashboard.deletePostMessage')}
            />

            <PostEditModal
                isOpen={!!postIdToEdit}
                onClose={handleCloseModals}
                post={postToEdit}
            />
            
        </div>
    );
}

export default DashboardPage;
