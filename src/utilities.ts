import { useEffect } from 'react';

export const clamp = (min: number, max: number, value: number) => Math.max(min, Math.min(max, value));

export const useWindowResizeEvent = (callback: (width: number, height: number) => void) => {
    useEffect(() => {
        const wrappedCallback = () => {
            callback(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', wrappedCallback);

        return () => {
            window.removeEventListener('resize', wrappedCallback);
        };
    }, [callback]);
};