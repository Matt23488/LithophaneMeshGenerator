import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { Canvas, useLoader } from '@react-three/fiber';

import './css/Viewport.css';
import ImageCanvasDisplay from './ImageCanvasDisplay';

const Viewport: React.FC<ViewportProperties> = props => {
    const [mode, setMode] = useState(ViewportMode.mesh);

    const vertices = new Float32Array([
        -1, -1, 1,
        1, -1, 1,
        1, 1, -1,
        -1, -1, 1,
        1, 1, -1,
        -1, 1, -1,
    ]);

    return (
        <div className="Viewport">
            <div className="mode-buttons">
                <button className="button mode-button" onClick={() => setMode(ViewportMode.image)}>Image</button>
                <button className="button mode-button" onClick={() => setMode(ViewportMode.mesh)}>Mesh</button>
            </div>
            <div style={{ display: mode === ViewportMode.image ? 'block' : 'none' }}>
                <ImageCanvasDisplay imageDataUrl={props.imageDataUrl} brightnessModifier={props.imageBrightnessModifier} sampleCount={props.imageSampleCount} />
            </div>
            <Canvas style={{ display: mode === ViewportMode.mesh ? 'block' : 'none' }}>
                <pointLight position={[0, 10, 0]} />
                {/* <ambientLight /> */}
                <mesh>
                    {/* <sphereBufferGeometry /> */}
                    <bufferGeometry attach="geometry" >
                        <bufferAttribute attachObject={['attributes', 'position']} count={vertices.length / 3} array={vertices} itemSize={3} />
                    </bufferGeometry>
                    <meshStandardMaterial attach="material" color="hotpink" />
                </mesh>
            </Canvas>
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