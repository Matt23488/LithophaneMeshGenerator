import React from 'react';

import './css/Viewport.css';
import ImageCanvasDisplay from './ImageCanvasDisplay';

const Viewport: React.FC<ViewportProperties> = props => {
    return (
        <div className="Viewport">
            <ImageCanvasDisplay imageDataUrl={props.imageDataUrl} />
        </div>
    );
};

export interface ViewportProperties {
    imageDataUrl: string;
}

export default Viewport;