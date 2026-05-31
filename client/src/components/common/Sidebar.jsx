import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { 
    FaHome, 
    FaUserCircle, 
    FaSignOutAlt,
    FaPlusSquare,
} from 'react-icons/fa';

const SidebarLink = ({ to, icon: Icon, label, onClick }) => (
    <Link
        to={to}
        onClick={onClick}
        className="flex items-center p-3 rounded-xl transition-colors duration-200 hover:bg-neutral-700 text-gray-300 hover:text-blue-400"
    >
        <Icon className="text-xl mr-4" />
        <span className="font-medium text-lg">{label}</span>
    </Link>
);

function Sidebar({ onLogout }) {
    const { t } = useTranslation();
    const { user } = useSelector((state) => state.auth);
    
    if (!user) return null;

    const userPhoto = user?.profilePicture || "https://placehold.co/40x40/1f2937/FFFFFF?text=P";
    const userId = user?._id; 
    const userName = user?.username;

    return (
        <div className="hidden lg:block w-72 sm:h-[90vh] p-4 sticky top-[80px] self-start space-y-6
                        border border-neutral-700 hover:border-blue-600 
                        transform transition-all duration-700 ease-out rounded-xl">
            
            <Link
                to={`/profile/${userId}`}
                className="flex items-center p-3 rounded-xl bg-neutral-800 transition-all duration-200 hover:bg-neutral-700 shadow-md hover:shadow-lg hover:shadow-blue-900/50"
            >
                {userPhoto ? (
                    <img
                        src={userPhoto}
                        alt={t('common.profile')}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/50"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/40x40/1f2937/FFFFFF?text=P"; }}
                    />
                ) : (
                    <FaUserCircle className="w-12 h-12 text-blue-400" />
                )}
                
                <div className="ml-3">
                    <span className="font-bold text-gray-100 block">{userName}</span>
                    <span className="text-sm text-blue-400 hover:underline">{t('nav.goToProfile')}</span>
                </div>
            </Link>

            <nav className="space-y-2">
                <SidebarLink to="/dashboard" icon={FaHome} label={t('nav.feed')} />
                <SidebarLink to={`/profile/${userId}`} icon={FaUserCircle} label={t('common.profile')} />
            </nav>

            <Link
                to="/dashboard"
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 rounded-full text-white font-bold text-lg transition-all duration-200 hover:bg-blue-700 shadow-xl hover:shadow-blue-700/50"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
                <FaPlusSquare className="mr-2" />
                {t('nav.createPost')}
            </Link>

            <button
                onClick={onLogout}
                className="w-full flex items-center justify-center p-3 mt-4 rounded-xl transition-colors duration-200 bg-neutral-800 hover:bg-red-700 text-gray-300 hover:text-white"
            >
                <FaSignOutAlt className="text-xl mr-4" />
                <span className="font-medium text-lg">{t('nav.logout')}</span>
            </button>
        </div>
    );
}

export default Sidebar;
