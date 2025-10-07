// components/UserAvatar.jsx
import { useState } from 'react';
import { User } from 'lucide-react';

// components/UserAvatar.jsx
const UserAvatar = ({ user, senderType, size = 10, className = '' }) => {
    const [imageError, setImageError] = useState(false);

    // DEBUG CHI TIẾT
    console.log('🔄 UserAvatar received:', { 
        user, 
        senderType, 
        hasImage: !!user?.image,
        image: user?.image,
        isAdmin: user?.is_admin
    });

    const getDisplayInfo = () => {
        // Guest user
        if (!user || user.is_guest) {
            return {
                initials: 'GU',
                name: 'Khách',
                bgColor: 'from-gray-500 to-gray-600',
                isGuest: true
            };
        }

        // Admin - ƯU TIÊN XỬ LÝ ADMIN TRƯỚC
        if (user.is_admin || senderType === 'admin') {
            console.log('🎯 Processing admin user:', user); // DEBUG ADMIN
            return {
                initials: 'AD',
                name: 'Admin',
                bgColor: 'from-green-500 to-green-600',
                isAdmin: true,
                image: user.image // 👈 QUAN TRỌNG: vẫn trả về image nếu có
            };
        }

        // Authenticated user
        const first = user.first_name?.[0] || '';
        const last = user.last_name?.[0] || '';
        const initials = `${first}${last}`.toUpperCase() || 'US';
        
        return {
            initials,
            name: user.first_name && user.last_name 
                ? `${user.first_name} ${user.last_name}`
                : 'Người dùng',
            bgColor: 'from-blue-500 to-purple-600',
            image: user.image
        };
    };

    const { initials, name, bgColor, image, isGuest, isAdmin } = getDisplayInfo();
    
    const getAvatarUrl = () => {
        if (!image) {
            console.log('❌ No image available for:', name); // DEBUG
            return null;
        }
        
        let imageUrl = image;
        
        console.log('🖼️ Original image path:', image); // DEBUG
        
        // Xử lý URL ảnh
        if (image.startsWith('uploads/')) {
            imageUrl = `http://localhost:4000/${image}`;
        } else if (image.startsWith('/uploads/')) {
            imageUrl = `http://localhost:4000${image}`;
        } else if (!image.startsWith('http')) {
            // Nếu là relative path không có prefix
            imageUrl = `http://localhost:4000/uploads/${image}`;
        }
        
        console.log('🖼️ Processed image URL:', imageUrl); // DEBUG
        return imageUrl;
    };

    const avatarUrl = getAvatarUrl();

    // Class cố định
    const sizeClass = size === 8 ? 'w-8 h-8' : 'w-10 h-10';
    const textClass = size === 8 ? 'text-xs' : 'text-sm';

    console.log('🎨 Final avatar props:', { // DEBUG FINAL
        name,
        avatarUrl, 
        hasUrl: !!avatarUrl,
        isAdmin,
        isGuest
    });

    return (
        <div className={`
            ${sizeClass}
            bg-gradient-to-br ${bgColor}
            rounded-full flex items-center justify-center 
            text-white font-semibold flex-shrink-0 
            overflow-hidden shadow-md
            ${className}
        `}>
            {avatarUrl && !imageError && !isGuest ? (
                <img 
                    src={avatarUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        setImageError(true);
                    }}
                    onLoad={() => console.log('✅ Image loaded successfully:', avatarUrl)} // DEBUG SUCCESS
                />
            ) : (
                <span className={`${textClass} font-bold`}>
                    {initials}
                </span>
            )}
        </div>
    );
};

export default UserAvatar;