import React from 'react';

import './css/Viewport.css';
import ImageCanvasDisplay from './ImageCanvasDisplay';

const Viewport: React.FC<ViewportProperties> = props => {
    return (
        <div className="Viewport">
            <ImageCanvasDisplay imageDataUrl={props.imageDataUrl} brightnessModifier={props.imageBrightnessModifier} sampleCount={props.imageSampleCount} />
        </div>
    );
};

export interface ViewportProperties {
    imageDataUrl: string;
    imageBrightnessModifier: number;
    imageSampleCount: number;
}

export default Viewport;