import React, { Suspense, useMemo, useState } from 'react';
import { HeightData, LithophaneMesh, LithophaneProperties } from '../lithophaneMesh';

import './css/Viewport.css';
import ImageCanvasDisplay from './ImageCanvasDisplay';
import MeshViewer from './MeshViewer';

const Viewport: React.FC<ViewportProperties> = props => {
    const [mode, setMode] = useState(ViewportMode.image);
    const [heightData, setHeightData] = useState<HeightData>();

    const { surfaceThickness, backThickness, sideLength } = props;

    const lithphaneProps = useMemo<LithophaneProperties | undefined>(() => {
        if (!heightData) return undefined;

        const aspectRatio = heightData.width / heightData.height;
        let widthMm = sideLength;
        let heightMm = sideLength;

        if (aspectRatio > 1)
            heightMm = sideLength / aspectRatio;
        else if (aspectRatio < 1)
            widthMm = sideLength * aspectRatio;

        return {
            heightData,
            surfaceThickness: surfaceThickness,
            backThickness: backThickness,
            widthMm,
            heightMm
        };
    }, [heightData, surfaceThickness, backThickness, sideLength]);

    return (
        <div className="Viewport">
            <div className="mode-buttons">
                <button className="button mode-button" onClick={() => setMode(ViewportMode.image)}>Image</button>
                <button className="button mode-button" onClick={() => setMode(ViewportMode.mesh)}>Mesh</button>
            </div>
            <div style={{ width: '100%', height: '100%', display: mode === ViewportMode.image ? 'block' : 'none' }}>
                <ImageCanvasDisplay imageDataUrl={props.imageDataUrl} brightnessModifier={props.imageBrightnessModifier} sampleCount={props.imageSampleCount} onHeightDataChanged={props.onHeightDataUpdated} />
            </div>
            <div style={{ width: '100%', height: '100%', display: mode === ViewportMode.mesh ? 'block' : 'none' }}>
                <Suspense fallback={<>Loading mesh...</>}>
                    <MeshViewer mesh={props.mesh} />
                </Suspense>
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
    surfaceThickness: number;
    backThickness: number;
    sideLength: number;
    mesh?: LithophaneMesh;
    // onMeshUpdated: (mesh: LithophaneMesh) => void;
    onHeightDataUpdated: (heightData: HeightData) => void;
}

export default Viewport;