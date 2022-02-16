import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useWindowResizeEvent } from '../utilities';

import './css/ImageCanvasDisplay.css';

const ImageCanvasDisplay: React.FC<ImageCanvasDisplayProperties> = props => {
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
    useEffect(() => onWindowResized(window.innerWidth, window.innerHeight), [onWindowResized]);

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

        const context = canvasRef.current.getContext('2d')!;

        // draw image to canvas
        context.fillStyle = '#333';
        context.fillRect(0, 0, canvasWidth, canvasHeight);
        context.drawImage(hiddenImgRef.current, x, y, width, height);

        // TODO: Need another canvas that's hidden, and sized to the image.
        // I'll do all the manipulations on that canvas, then draw it on top
        // of the visible canvas for display.
    }, [hiddenImgRef, canvasRef, canvasWidth, canvasHeight]);

    useEffect(() => onImageLoaded(), [canvasWidth, canvasHeight, onImageLoaded]);

    return (
        <div ref={containerRef} className="ImageCanvasDisplay">
            <img ref={hiddenImgRef} alt="" src={props.imageDataUrl} style={{ display: 'none' }} onLoad={onImageLoaded} />
            <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} />
        </div>
    );
};

export interface ImageCanvasDisplayProperties {
    imageDataUrl: string;
}

export default ImageCanvasDisplay;