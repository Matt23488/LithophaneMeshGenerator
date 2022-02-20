import React, { useCallback, useEffect, useRef } from 'react';
import { toGrayscale } from '../imageProcessing';
import { HeightData } from '../lithophaneMesh';
import { useWindowResizeEvent } from '../utilities';

import './css/ImageCanvasDisplay.css';

const ImageCanvasDisplay: React.FC<ImageCanvasDisplayProperties> = props => {

    const { sampleCount, brightnessModifier, imageDataUrl, onHeightDataChanged } = props;

    const hiddenImageRef = useRef<HTMLImageElement>(null);
    const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
    const visibleCanvasRef = useRef<HTMLCanvasElement>(null);

    const onImageLoad = useCallback(() => {
        if (!hiddenCanvasRef.current || !hiddenImageRef.current) return;

        const aspectRatio = hiddenImageRef.current.width / hiddenImageRef.current.height;
        let widthSamples = sampleCount;
        let heightSamples = sampleCount;

        if (aspectRatio < 1)
            widthSamples = Math.max(2, Math.round(sampleCount * aspectRatio));
        else if (aspectRatio > 1)
            heightSamples = Math.max(2, Math.round(sampleCount / aspectRatio));

        const canvas = hiddenCanvasRef.current;
        canvas.width = widthSamples;
        canvas.height = heightSamples;

        const context = canvas.getContext('2d');
        if (!context) return;

        context.drawImage(hiddenImageRef.current, 0, 0, widthSamples, heightSamples);

        let pixels = context.getImageData(0, 0, widthSamples, heightSamples);
        pixels = toGrayscale(pixels);
        for (let i = 0; i < pixels.data.length; i += 4) {
            pixels.data[i + 0] *= brightnessModifier;
            pixels.data[i + 1] *= brightnessModifier;
            pixels.data[i + 2] *= brightnessModifier;
        }
        context.putImageData(pixels, 0, 0);

        redrawImage();
    }, [hiddenCanvasRef, hiddenImageRef, brightnessModifier, sampleCount]);
    
    const redrawImage = useCallback(() => {
        if (!hiddenCanvasRef.current || !visibleCanvasRef.current) return;

        const resizedAspectRatio = hiddenCanvasRef.current.width / hiddenCanvasRef.current.height;
        let x = 0;
        let y = 0;
        let { width: resizedWidth, height: resizedHeight } = visibleCanvasRef.current;

        if (resizedAspectRatio > 1) {
            resizedHeight /= resizedAspectRatio;
            y = Math.floor((visibleCanvasRef.current.height - resizedHeight) / 2);
        } else if (resizedAspectRatio < 1) {
            resizedWidth *= resizedAspectRatio;
            x = Math.floor((visibleCanvasRef.current.width - resizedWidth) / 2);
        }

        const visibleCanvasContext = visibleCanvasRef.current.getContext('2d');
        if (!visibleCanvasContext) return;

        visibleCanvasContext.fillStyle = '#333';
        visibleCanvasContext.imageSmoothingEnabled = false;
        visibleCanvasContext.fillRect(0, 0, visibleCanvasRef.current.width, visibleCanvasRef.current.height);
        visibleCanvasContext.drawImage(hiddenCanvasRef.current, x, y, resizedWidth, resizedHeight);

        const hiddenCanvasContext = hiddenCanvasRef.current.getContext('2d');
        if (!hiddenCanvasContext) return;

        const pixels = hiddenCanvasContext.getImageData(0, 0, hiddenCanvasRef.current.width, hiddenCanvasRef.current.height);


        const heightData: HeightData = {
            data: [...pixels.data.filter((_, i) => i % 4 === 0)].map(val => val / 255),
            width: hiddenCanvasRef.current.width,
            height: hiddenCanvasRef.current.height
        };

        onHeightDataChanged(heightData);
    }, [brightnessModifier, sampleCount, hiddenCanvasRef, visibleCanvasRef, onHeightDataChanged]);

    useEffect(onImageLoad, [brightnessModifier, sampleCount, hiddenCanvasRef, visibleCanvasRef]);

    const onWindowResized = useCallback((width: number, height: number) => {
        if (!visibleCanvasRef.current) return;

        // this is a hack, since I know the ui will be 400px.
        // but if I use clientWidth and clientHeight, it can only grow with this logic, never shrink.
        const size = Math.min(width - 400, height);
        // const { clientWidth, clientHeight } = visibleCanvasRef.current.parentElement!;
        // const size = Math.min(clientWidth, clientHeight);
        visibleCanvasRef.current.width = size;
        visibleCanvasRef.current.height = size;
        redrawImage();
    }, [visibleCanvasRef]);

    useWindowResizeEvent(onWindowResized);
    useEffect(() => onWindowResized(window.innerWidth, window.innerHeight), [onWindowResized]);

    return (
        <div className="ImageCanvasDisplay">
            <canvas ref={visibleCanvasRef} />
            <div style={{ display: 'none' }}>
                <img ref={hiddenImageRef} alt="" src={imageDataUrl} onLoad={onImageLoad} />
                <canvas ref={hiddenCanvasRef} />
            </div>
        </div>
    );
};

export interface ImageCanvasDisplayProperties {
    imageDataUrl: string;
    brightnessModifier: number;
    sampleCount: number;
    onHeightDataChanged: (heightData: HeightData) => void;
}

export default ImageCanvasDisplay;