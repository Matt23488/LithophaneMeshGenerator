import React, { useCallback, useEffect, useState } from 'react';

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

export const useFlag = () => {
    const [value, setValue] = useState(0);

    const updateFlag = useCallback(() => setValue(value => value + 1), []);
    return [value, updateFlag] as [number, typeof updateFlag];
};

export const useCanvasContext2d = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

    useEffect(() => {
        if (canvasRef.current)
            setContext(canvasRef.current.getContext('2d'));
        else
            setContext(null);
    }, [canvasRef]);

    return context;
}