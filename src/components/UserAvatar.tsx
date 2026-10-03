import React, { useState } from 'react';

interface UserAvatarProps {
  user: {
    name?: string;
    avatar_url?: string;
    photoURL?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 'sm', className = '' }) => {
  const [hasError, setHasError] = useState(false);
  const avatarUrl = user?.avatar_url || user?.photoURL;
  const initial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U';

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base'
  }[size];

  if (avatarUrl && !hasError) {
    return (
      <img
        src={avatarUrl}
        alt=""
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={() => setHasError(true)}
        className={`${sizeClasses.split(' ')[0]} ${sizeClasses.split(' ')[1]} rounded-lg object-cover shrink-0 border border-cyan-500/40 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-bold flex items-center justify-center shrink-0 shadow-sm ${className}`}
    >
      {initial}
    </div>
  );
};
