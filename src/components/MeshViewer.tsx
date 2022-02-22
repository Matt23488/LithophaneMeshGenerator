import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

import './css/MeshViewer.css';
import { LithophaneMesh } from '../lithophaneMesh';

const MeshViewer: React.FC<MeshViewerProperties> = props => {
    const { mesh } = props;
    const threeMesh = useMemo(() => mesh.toThreeMesh(), [mesh]);
    const meshRef = useRef<THREE.Mesh>(null);

    const [controlType, setControlType] = useState(MouseControlType.None);

    const onMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (e.button === 0)
            setControlType(MouseControlType.Rotate);
        else if (e.button === 2)
            setControlType(MouseControlType.Translate);

        console.log('mouse down');
        console.log('button', e.button);
        console.log('buttons', e.buttons);
    };

    const onMouseUp = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        console.log('mouse up');
        console.log('button', e.button);
        console.log('buttons', e.buttons);
        setControlType(MouseControlType.None);
    };

    const onMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (controlType === MouseControlType.None || !meshRef.current) return;

        if (controlType === MouseControlType.Rotate) {
            meshRef.current.rotateY(e.movementX / 100);
            meshRef.current.rotateX(e.movementY / 100);
            return;
        }

        if (controlType === MouseControlType.Translate) {
            // Kind of works but I need to convert to world coords
            meshRef.current.translateX(e.movementX / 100);
            meshRef.current.translateY(e.movementY / 100);
        }
    };

    return (
        <div className="MeshViewer" onMouseDown={onMouseDown} onMouseUp={onMouseUp} onMouseMove={onMouseMove} onContextMenu={e => e.preventDefault()}>
            <Canvas camera={{ position: [0, 50, 50], rotation: [-Math.PI / 4, 0, 0] }}>
                {/* <pointLight position={[0, 10, 0]} /> */}
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

enum MouseControlType { None, Rotate, Translate }

export interface MeshViewerProperties {
    mesh: LithophaneMesh;
}

export default MeshViewer;