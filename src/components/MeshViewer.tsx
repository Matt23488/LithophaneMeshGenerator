import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

import './css/MeshViewer.css';
import { LithophaneMesh } from '../lithophaneMesh';

const MeshViewer: React.FC<MeshViewerProperties> = props => {
    const { mesh } = props;
    const threeMesh = useMemo(() => mesh.toThreeMesh(), [mesh]);
    const meshRef = useRef<THREE.Mesh>(null);

    const [mouseButtons, setMouseButtons] = useState(mouseButtonsEnum.none);

    const onMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!meshRef.current) return;
        
        switch (mouseButtons) {
            case mouseButtonsEnum.left:
                meshRef.current.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), e.movementX / 100);
                meshRef.current.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), e.movementY / 100);
                break;

            case mouseButtonsEnum.right:
            case mouseButtonsEnum.middle:
                meshRef.current.translateX(e.movementX / 10);
                meshRef.current.translateY(-e.movementY / 10);
                break;
        }
    };

    console.log('matrix', meshRef.current?.matrix);

    return (
        <div className="MeshViewer" onMouseDown={e => setMouseButtons(e.buttons)} onMouseUp={e => setMouseButtons(e.buttons)} onMouseMove={onMouseMove} onContextMenu={e => e.preventDefault()}>
            <Canvas camera={{ position: [0, 50, 50], rotation: [-Math.PI / 4, 0, 0] }}>
                <pointLight position={[0, 10, 0]} />
                <mesh ref={meshRef}>
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

const mouseButtonsEnum = {
    none: 0,
    left: 1,
    right: 2,
    middle: 4
};

export interface MeshViewerProperties {
    mesh: LithophaneMesh;
}

export default MeshViewer;