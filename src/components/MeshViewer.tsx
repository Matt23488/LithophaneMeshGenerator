import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';

import './css/MeshViewer.css';
import { useMesh, HeightData, LithophaneProperties, LithophaneMesh } from '../lithophaneMesh';

const MeshViewer: React.FC<MeshViewerProperties> = props => {
    // const vertices = new Float32Array([
    //     -50, 0, -50,
    //     -50, 0, 50,
    //     50, 0, 50,
    //     50, 0, 50,
    //     50, 0, -50,
    //     -50, 0, -50,
    // ]);

    // const normals = new Float32Array([
    //     0, 1, 0,
    //     0, 1, 0,
    //     0, 1, 0,
    //     0, 1, 0,
    //     0, 1, 0,
    //     0, 1, 0,
    // ]);

    const { mesh } = props;
    // useEffect(() => {
    //     console.log('mesh', mesh?.toThreeMesh());
    // }, [mesh]);

    const geomRef = useRef<THREE.BufferGeometry>(null);
    const threeMesh = useMemo(() => mesh?.toThreeMesh(), [mesh]);

    useEffect(() => {
        if (!geomRef.current || !threeMesh) return;

        // console.log('threemesh', threeMesh);
        geomRef.current.setAttribute('position', new THREE.BufferAttribute(new Float32Array(threeMesh.position.array), threeMesh.position.itemSize));
        geomRef.current.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(threeMesh.normal.array), threeMesh.normal.itemSize));
        if (threeMesh.color)
            geomRef.current.setAttribute('color', new THREE.BufferAttribute(new Float32Array(threeMesh.color.array), threeMesh.color.itemSize));

    }, [geomRef, threeMesh]);
    // const { lithophaneProps, onMeshUpdated } = props;

    // const lithophaneMesh = useMemo(() => lithophaneProps && useMesh(lithophaneProps).toThreeMesh(), [lithophaneProps]);
    // const lithophaneMesh = useMesh(lithophaneProps);

    // useEffect(() => {
    //     if (!lithophaneMesh.threeMesh) return;

    //     console.log('Mesh updated');
    //     onMeshUpdated(lithophaneMesh);
        
    // }, [lithophaneMesh, onMeshUpdated]);

    return (
        <div className="MeshViewer">
            <Canvas camera={{ position: [0, 50, 50], rotation: [-Math.PI / 4, 0, 0] }}>
                {/* <pointLight position={[0, 10, 0]} /> */}
                {/* <mesh>
                    <bufferGeometry attach="geometry">
                        <bufferAttribute attachObject={['attributes', 'position']} count={vertices.length / 3} array={vertices} itemSize={3} />
                        <bufferAttribute attachObject={['attributes', 'normal']} count={normals.length / 3} array={normals} itemSize={3} />
                    </bufferGeometry>
                </mesh> */}
                {threeMesh &&
                    <mesh>
                        <bufferGeometry ref={geomRef} attach="geometry">
                            <bufferAttribute attachObject={['attributes', 'position']} {...threeMesh.position} />
                            <bufferAttribute attachObject={['attributes', 'normal']} {...threeMesh.normal} />
                        </bufferGeometry>
                        <meshBasicMaterial vertexColors={true} />
                    </mesh>
                }
                {/* {lithophaneMesh.threeMesh} */}
            </Canvas>
        </div>
    );
};

export interface MeshViewerProperties {
    // lithophaneProps?: LithophaneProperties;
    // onMeshUpdated: (mesh: LithophaneMesh) => void;
    mesh?: LithophaneMesh;
}

export default MeshViewer;