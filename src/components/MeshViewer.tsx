import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import './css/MeshViewer.css';
import { LithophaneMesh, ThreeMeshData } from '../lithophaneMesh';

const MeshViewer: React.FC<MeshViewerProperties> = props => {
    const { mesh } = props;
    const threeMesh = useMemo(() => mesh.toThreeMesh(), [mesh]);
    const meshRef = useRef<THREE.Mesh>(null);

    const { dispatch, registerCallback, unregisterCallback } = useDescendantCallbacks();

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
                meshRef.current.position.add(new THREE.Vector3(e.movementX / 10, -e.movementY / 10, 0));
                break;
        }
    };

    const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        // e.preventDefault();
        dispatch('zoom', e.deltaY);
    };

    return (
        <div className="MeshViewer" onWheel={onWheel} onMouseDown={e => setMouseButtons(e.buttons)} onMouseUp={e => setMouseButtons(e.buttons)} onMouseMove={onMouseMove} onContextMenu={e => e.preventDefault()}>
            <Canvas camera={{ position: [0, 0, 50], rotation: [0, 0, 0] }}>
                <pointLight position={[0, 10, 0]} />
                <ThreeMesh threeMesh={threeMesh} meshRef={meshRef} registerCallback={registerCallback} unregisterCallback={unregisterCallback} />
            </Canvas>
        </div>
    );
};

const ThreeMesh: React.FC<ThreeMeshProperties> = props => {
    const { threeMesh, meshRef, registerCallback, unregisterCallback } = props;
    const { camera } = useThree();

    const zoomCallback = useCallback((deltaY: number) => {
        console.log('on zoom', deltaY);

        camera.translateZ(deltaY / 10);
    }, []);

    useEffect(() => {
        console.log('registered zoom callback');
        registerCallback('zoom', zoomCallback);

        return () => unregisterCallback('zoom', zoomCallback);
    }, [zoomCallback, registerCallback, unregisterCallback]);

    return (
        <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
            <bufferGeometry attach="geometry">
                <bufferAttribute attachObject={['attributes', 'position']} {...threeMesh.position} />
                <bufferAttribute attachObject={['attributes', 'normal']} {...threeMesh.normal} />
                {threeMesh.color && <bufferAttribute attachObject={['attributes', 'color']} {...threeMesh.color} />}
            </bufferGeometry>
            <meshBasicMaterial vertexColors={true} />
        </mesh>
    )
};

interface ThreeMeshProperties {
    threeMesh: ThreeMeshData;
    meshRef: React.RefObject<THREE.Mesh>;
    registerCallback: (name: string, callback: (deltaY: number) => void) => void;
    unregisterCallback: (name: string, callback: (deltaY: number) => void) => void;
}

// For some reason I did this to let me translate the camera instead of just translating the mesh. I'll fix that in my next commit.
// I'm tired lol
const useDescendantCallbacks = () => {
    const callbacks = useMemo(() => new Map<string, Array<(deltaY: number) => void>>(), []);

    const registerCallback = useCallback((name: string, callback: (deltaY: number) => void) => {
        const callbackList = getCallbackList(name);
        callbackList.push(callback);
    }, [callbacks]);

    const unregisterCallback = useCallback((name: string, callback: (deltaY: number) => void) => {
        let callbackList = getCallbackList(name);
        callbackList = callbackList.filter(c => c !== callback);
        callbacks.set(name, callbackList);
    }, [callbacks]);

    const dispatch = useCallback((name: string, deltaY: number) => {
        const callbackList = getCallbackList(name);
        for (let callback of callbackList)
            callback(deltaY);
    }, [callbacks]);

    const getCallbackList = (name: string) => {
        let callbackList = callbacks.get(name);
        if (!callbackList) {
            callbackList = [];
            callbacks.set(name, callbackList);
        }

        return callbackList;
    };

    return {
        registerCallback,
        unregisterCallback,
        dispatch
    };
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