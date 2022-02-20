export const generateMesh = (lithophaneProps: LithophaneProperties): LithophaneMesh => {
    return {
        toThreeMesh: () => <></>
    } as LithophaneMesh;
};

export interface LithophaneProperties {
    heightData: HeightData;
    surfaceThickness: number;
    backThickness: number;
    widthMm: number;
    heightMm: number;
}

export interface LithophaneMesh {
    toObjStr: () => string;
    // toThreeMeshData: () => ThreeMeshData;
    toThreeMesh: () => React.ReactNode;
}

export interface HeightData {
    width: number;
    height: number;
    data: number[];
}

export interface ThreeMeshData {
    position: ThreeGeometryData;
    normal: ThreeGeometryData;
}

export interface ThreeGeometryData {
    array: number[];
    size: number;
    count: number;
}