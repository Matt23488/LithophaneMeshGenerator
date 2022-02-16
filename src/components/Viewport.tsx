import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useWindowResizeEvent } from '../utilities';

import './css/Viewport.css';

const Viewport: React.FC<ViewportProperties> = props => {
    const [canvasWidth, setCanvasWidth] = useState(0);
    const [canvasHeight, setCanvasHeight] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const hiddenImgRef = useRef<HTMLImageElement>(null);

    const onWindowResized = useCallback((width: number, height: number) => {
        if (!containerRef.current) return;

        // this is a hack, since I know the ui will be 400px.
        // but if I use clientWidth and clientHeight, it can only grow with this logic, never shrink.
        const size = Math.min(width - 400, height);
        setCanvasWidth(size);
        setCanvasHeight(size);
    }, [containerRef]);

    useWindowResizeEvent(onWindowResized);
    useEffect(() => onWindowResized(window.innerWidth, window.innerHeight), []);

    const onImageLoaded = useCallback(() => {
        if (!hiddenImgRef.current || !canvasRef.current) return;

        const aspectRatio = hiddenImgRef.current.width / hiddenImgRef.current.height;
        let x = 0;
        let y = 0;
        let width = canvasWidth;
        let height = canvasHeight;

        if (aspectRatio > 1) {
            height = canvasHeight / aspectRatio;
            y = Math.floor((canvasHeight - height) / 2);
        } else if (aspectRatio < 1) {
            width = canvasWidth * aspectRatio;
            x = Math.floor((canvasWidth - width) / 2);
        }

        const context = canvasRef.current.getContext('2d');
        context?.drawImage(hiddenImgRef.current, x, y, width, height);
    }, [hiddenImgRef, canvasRef, canvasWidth, canvasHeight]);

    useEffect(() => onImageLoaded(), [canvasWidth, canvasHeight]);

    return (
        <div ref={containerRef} className="Viewport">
            <img ref={hiddenImgRef} src={props.imageDataUrl} style={{ display: 'none' }} onLoad={onImageLoaded} />
            <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} />
        </div>
    );
};

export interface ViewportProperties {
    imageDataUrl?: string;
}

export default Viewport;