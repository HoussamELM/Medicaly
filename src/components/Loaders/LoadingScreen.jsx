import React from 'react';
import { Favorite as HeartIcon } from '@mui/icons-material';

const LoadingScreen = () => {
    return (
        <div className="flex items-center justify-center w-screen h-screen fixed top-0 left-0 z-50">
            <HeartIcon className="text-pink-500 animate-pulse" style={{ fontSize: '80px' }} />
        </div>
    );
};

export default LoadingScreen;
