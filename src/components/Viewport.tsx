import React, { useState } from 'react';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import * as THREE from 'three';
import { Canvas, useLoader } from '@react-three/fiber';

import './css/Viewport.css';
import ImageCanvasDisplay from './ImageCanvasDisplay';

const objUrl = 'test.obj';
const Viewport: React.FC<ViewportProperties> = props => {
    const [mode, setMode] = useState(ViewportMode.image);

    const vertices = new Float32Array([
        -1, -1,
        1, -1,
        1, 1,
        -1, -1,
        1, 1,
        -1, 1,
    ]);

    const normals = new Float32Array([
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
    ]);
    // const obj = useLoader(OBJLoader, objUrl);
    // console.log('obj', obj);

    return (
        <div className="Viewport">
            <div className="mode-buttons">
                <button className="button mode-button" onClick={() => setMode(ViewportMode.image)}>Image</button>
                <button className="button mode-button" onClick={() => setMode(ViewportMode.mesh)}>Mesh</button>
            </div>
            <div style={{ width: '100%', height: '100%', display: mode === ViewportMode.image ? 'block' : 'none' }}>
                <ImageCanvasDisplay imageDataUrl={props.imageDataUrl} brightnessModifier={props.imageBrightnessModifier} sampleCount={props.imageSampleCount} />
            </div>
            <Canvas style={{ display: mode === ViewportMode.mesh ? 'block' : 'none', width: '100%', height: '100%' }}>
                <pointLight position={[0, 10, 0]} />
                {/* <primitive object={obj} scale={0.4} rotation={[-45, 0, 0]} position={[-15, 0, -50]} /> */}
                <mesh rotation={[-45, 0, 0]}>
                    <bufferGeometry attach="geometry">
                        <bufferAttribute attachObject={['attributes', 'position']} count={vertices.length / 2} array={vertices} itemSize={2} />
                        <bufferAttribute attachObject={['attributes', 'normal']} count={normals.length / 3} array={normals} itemSize={3} />
                    </bufferGeometry>
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