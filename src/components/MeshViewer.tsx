import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';

import './css/MeshViewer.css';
import { generateMesh, HeightData, LithophaneProperties } from '../lithophaneMesh';

const MeshViewer: React.FC<MeshViewerProperties> = props => {
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

    const { lithophaneProps } = props;

    const lithophaneMesh = useMemo(() => lithophaneProps && generateMesh(lithophaneProps).toThreeMesh(), [lithophaneProps]);

    return (
        <div className="MeshViewer">
            <Canvas camera={{ position: [0, 5, 5], rotation: [-45, 0, 0] }}>
                <pointLight position={[0, 10, 0]} />
                <mesh rotation={[-90, 0, 0]}>
                    <bufferGeometry attach="geometry">
                        <bufferAttribute attachObject={['attributes', 'position']} count={vertices.length / 2} array={vertices} itemSize={2} />
                        <bufferAttribute attachObject={['attributes', 'normal']} count={normals.length / 3} array={normals} itemSize={3} />
                    </bufferGeometry>
                </mesh>
                {lithophaneMesh}
            </Canvas>
        </div>
    );
};

export interface MeshViewerProperties {
    lithophaneProps?: LithophaneProperties;
}

export default MeshViewer;