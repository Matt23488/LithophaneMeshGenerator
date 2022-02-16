import React, { useCallback, useEffect, useRef, useState } from 'react';
import { adjustBrightness, adjustSampleCount, toGrayscale } from '../imageProcessing';
import { useCanvasContext2d, useFlag, useWindowResizeEvent } from '../utilities';

import './css/ImageCanvasDisplay.css';

const ImageCanvasDisplay: React.FC<ImageCanvasDisplayProperties> = props => {

    const { hiddenImageRef, hiddenCanvasRef, originalImageWidth, originalImageHeight, onImageLoad, drawImageFlag } = useHiddenImageData(props.brightnessModifier, props.sampleCount);
    const { visibleCanvasRef, canvasWidth, canvasHeight, canvasContext } = useCanvasData(hiddenCanvasRef, drawImageFlag);

    

    return (
        <div className="ImageCanvasDisplay">
            <div style={{ display: 'none' }}>
                <img ref={hiddenImageRef} alt="" src={props.imageDataUrl} onLoad={onImageLoad} />
                <canvas ref={hiddenCanvasRef} width={originalImageWidth} height={originalImageHeight} />
            </div>
            <canvas ref={visibleCanvasRef} width={canvasWidth} height={canvasHeight} />
        </div>
    );
};

const useCanvasData = (hiddenCanvasRef: React.RefObject<HTMLCanvasElement>, drawImageFlag: number) => {
    const visibleCanvasRef = useRef<HTMLCanvasElement>(null);
    const canvasContext = useCanvasContext2d(visibleCanvasRef);

    const [canvasWidth, setCanvasWidth] = useState(0);
    const [canvasHeight, setCanvasHeight] = useState(0);

    const onWindowResized = useCallback((width: number, height: number) => {
        // this is a hack, since I know the ui will be 400px.
        // but if I use clientWidth and clientHeight, it can only grow with this logic, never shrink.
        const size = Math.min(width - 400, height);
        setCanvasWidth(size);
        setCanvasHeight(size);
    }, []);

    useWindowResizeEvent(onWindowResized);
    useEffect(() => onWindowResized(window.innerWidth, window.innerHeight), [onWindowResized]);

    useEffect(() => {
        if (!canvasContext || !hiddenCanvasRef.current || hiddenCanvasRef.current.width === 0 || hiddenCanvasRef.current.height === 0) return;

        const aspectRatio = hiddenCanvasRef.current.width / hiddenCanvasRef.current.height;
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

        // draw image to canvas
        canvasContext.fillStyle = '#333';
        canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);
        canvasContext.drawImage(hiddenCanvasRef.current, x, y, width, height);
    }, [drawImageFlag, canvasWidth, canvasHeight, canvasContext, hiddenCanvasRef]);

    return {
        visibleCanvasRef,
        canvasWidth,
        canvasHeight,
        canvasContext
    };
};

const useHiddenImageData = (brightnessModifier: number, sampleCount: number) => {
    const hiddenImageRef = useRef<HTMLImageElement>(null);
    const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
    const hiddenCanvasContext = useCanvasContext2d(hiddenCanvasRef);

    const [originalImageWidth, setImageWidth] = useState(0);
    const [originalImageHeight, setImageHeight] = useState(0);
    
    const [drawNewImageFlag, raiseDrawNewImageFlag] = useFlag();

    const onImageLoad = useCallback(() => {
        if (!hiddenCanvasRef.current || !hiddenImageRef.current) return;

        setImageWidth(hiddenImageRef.current.width);
        setImageHeight(hiddenImageRef.current.height);
        raiseDrawNewImageFlag();
    }, [hiddenCanvasRef, hiddenImageRef, raiseDrawNewImageFlag]);

    const [drawImageFlag, raiseDrawImageFlag] = useFlag();

    useEffect(() => {
        if (!hiddenCanvasContext || !hiddenImageRef.current || originalImageWidth === 0 || originalImageHeight === 0) return;

        hiddenCanvasContext.drawImage(hiddenImageRef.current, 0, 0, originalImageWidth, originalImageHeight);

        let pixels = hiddenCanvasContext.getImageData(0, 0, originalImageWidth, originalImageHeight);
        pixels = toGrayscale(pixels);
        pixels = adjustBrightness(pixels, brightnessModifier);
        pixels = adjustSampleCount(pixels, sampleCount);
        hiddenCanvasContext.putImageData(pixels, 0, 0);

        raiseDrawImageFlag();

    }, [drawNewImageFlag, hiddenImageRef, hiddenCanvasContext, originalImageWidth, originalImageHeight, brightnessModifier, sampleCount, raiseDrawImageFlag]);

    return {
        hiddenImageRef,
        hiddenCanvasRef,
        originalImageWidth,
        originalImageHeight,
        onImageLoad,
        drawImageFlag
    };
};

export interface ImageCanvasDisplayProperties {
    imageDataUrl: string;
    brightnessModifier: number;
    sampleCount: number;
}

export default ImageCanvasDisplay;