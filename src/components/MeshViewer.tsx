import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';

import './css/MeshViewer.css';
import { LithophaneMesh } from '../lithophaneMesh';

const MeshViewer: React.FC<MeshViewerProperties> = props => {
    const { mesh } = props;
    const threeMesh = useMemo(() => mesh.toThreeMesh(), [mesh]);

    return (
        <div className="MeshViewer">
            <Canvas camera={{ position: [0, 50, 50], rotation: [-Math.PI / 4, 0, 0] }}>
                {/* <pointLight position={[0, 10, 0]} /> */}
                <mesh>
                    <bufferGeometry attach="geometry">
                        <bufferAttribute attachObject={['attributes', 'position']} {...threeMesh.position} />
                        <bufferAttribute attachObject={['attributes', 'normal']} {...threeMesh.normal} />
                        {threeMesh.color && <bufferAttribute attachObject={['attributes', 'color']} {...threeMesh.color} />}
                    </bufferGeometry>
                    <meshBasicMaterial vertexColors={true} />
                </mesh>
            </Canvas>
        </div>
    );
};

export interface MeshViewerProperties {
    mesh: LithophaneMesh;
}

export default MeshViewer;