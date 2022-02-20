import React, { useState } from 'react';

import './css/Viewport.css';
import ImageCanvasDisplay from './ImageCanvasDisplay';
import MeshViewer from './MeshViewer';

const Viewport: React.FC<ViewportProperties> = props => {
    const [mode, setMode] = useState(ViewportMode.mesh);

    return (
        <div className="Viewport">
            <div className="mode-buttons">
                <button className="button mode-button" onClick={() => setMode(ViewportMode.image)}>Image</button>
                <button className="button mode-button" onClick={() => setMode(ViewportMode.mesh)}>Mesh</button>
            </div>
            <div style={{ width: '100%', height: '100%', display: mode === ViewportMode.image ? 'block' : 'none' }}>
                <ImageCanvasDisplay imageDataUrl={props.imageDataUrl} brightnessModifier={props.imageBrightnessModifier} sampleCount={props.imageSampleCount} />
            </div>
            <div style={{ width: '100%', height: '100%', display: mode === ViewportMode.mesh ? 'block' : 'none' }}>
                <MeshViewer />
            </div>
        </div>
    );
};

enum ViewportMode {
    image,
    mesh
}

export interface ViewportProperties {
    imageDataUrl: string;
    imageBrightnessModifier: number;
    imageSampleCount: number;
}

export default Viewport;