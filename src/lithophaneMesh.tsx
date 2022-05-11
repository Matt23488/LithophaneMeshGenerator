import { map } from './utilities';

export const generateMesh = (lithophaneProps?: LithophaneProperties): LithophaneMesh => {
    const vertices: VertexArray = [];
    const facets: FacetArray = [];

    const undefinedProps = !lithophaneProps;
        
    let heightData = {} as HeightData;
    let surfaceThickness = 0;
    let backThickness = 0;
    let widthMm = 0;
    let heightMm = 0;
    let layerHeight = 0;

    if (!undefinedProps)
        ({ heightData, surfaceThickness, backThickness, widthMm, heightMm, layerHeight } = lithophaneProps);

    if (undefinedProps) return {
        vertices,
        facets,
        toObj: () => '',
        toStlAscii: () => '',
        toStlBinary: () => new Uint8Array(),
        toThreeMesh: () => ({} as ThreeMeshData),
    };

    
    const surfaceMin = backThickness;
    const surfaceMax = backThickness + surfaceThickness;
    const deltaX = widthMm / heightData.width;
    const deltaZ = heightMm / heightData.height;
    const baselineOffset = 4 * heightData.width * heightData.height;

    { // surface
        let offsetX = -widthMm / 2;
        let offsetZ = -heightMm / 2;
        for (let z = 0; z < heightData.height; z++) {
            for (let x = 0; x < heightData.width; x++) {
                const i = z * heightData.width + x;
                const preciseCellY = map(0, 1, surfaceMin, surfaceMax, heightData.data[i]);
                const yStep = Math.round(preciseCellY / layerHeight);
                const cellY = yStep * layerHeight;
                vertices.push([offsetX, cellY, offsetZ]);
                vertices.push([offsetX, cellY, offsetZ + deltaZ]);
                vertices.push([offsetX + deltaX, cellY, offsetZ + deltaZ]);
                vertices.push([offsetX + deltaX, cellY, offsetZ]);

                if (z > 0) {
                    const normal: Vector3 = vertices[4 * (i - heightData.width)][1] > vertices[4 * i][1]
                        ? [0, 0, 1]
                        : [0, 0, -1];
                    const indices = [
                        vertices.length - 4*heightData.width - 3,
                        vertices.length - 4,
                        vertices.length - 1,
                        vertices.length - 4*heightData.width - 2,
                    ];
                    facets.push([[
                        indices[0],
                        indices[1],
                        indices[2]
                    ], normal]);
                    facets.push([[
                        indices[2],
                        indices[3],
                        indices[0]
                    ], normal]);
                }

                if (x > 0) {
                    const normal: Vector3 = vertices[4 * (i - 1)][1] > vertices[4 * i][1]
                        ? [1, 0, 0]
                        : [-1, 0, 0];
                    const indices = [
                        vertices.length - 6,
                        vertices.length - 3,
                        vertices.length - 4,
                        vertices.length - 5,
                    ];
                    facets.push([[
                        indices[0],
                        indices[1],
                        indices[2]
                    ], normal]);
                    facets.push([[
                        indices[2],
                        indices[3],
                        indices[0]
                    ], normal]);
                }

                facets.push([[
                    vertices.length - 4,
                    vertices.length - 3,
                    vertices.length - 2
                ], [ 0, 1, 0 ]]);
                facets.push([[
                    vertices.length - 2,
                    vertices.length - 1,
                    vertices.length - 4
                ], [0, 1, 0]]);

                offsetX += deltaX;
            }
            offsetX = -widthMm / 2;
            offsetZ += deltaZ;
        }
    }

    { // edges
        // left
        let currentOffset = baselineOffset;
        for (let z = 0; z < heightData.height; z++) {
            const surfaceOffset = z * 4 * heightData.width;
            vertices.push([-widthMm / 2, backThickness, vertices[surfaceOffset + 0][2]]);

            if (z > 0) {
                facets.push([[
                    surfaceOffset - 4 * heightData.width,
                    currentOffset + z - 1,
                    currentOffset + z
                ], [-1, 0, 0]]);

                facets.push([[
                    currentOffset + z,
                    surfaceOffset - 4 * heightData.width + 1,
                    surfaceOffset - 4 * heightData.width
                ], [-1, 0, 0]]);
            }
        }
        facets.push([[
            4 * (heightData.height - 1) * heightData.width,
            currentOffset + heightData.height - 1,
            currentOffset + heightData.height
        ], [-1, 0, 0]]);
        facets.push([[
            currentOffset + heightData.height,
            4 * (heightData.height - 1) * heightData.width + 1,
            4 * (heightData.height - 1) * heightData.width
        ], [-1, 0, 0]]);

        // bottom
        currentOffset += heightData.height;
        for (let x = 0; x < heightData.width; x++) {
            const surfaceOffset = 4 * ((heightData.height - 1) * heightData.width + x);
            vertices.push([vertices[surfaceOffset + 1][0], backThickness, heightMm / 2]);

            if (x > 0) {
                facets.push([[
                    surfaceOffset - 3,
                    currentOffset + x - 1,
                    currentOffset + x
                ], [0, 0, 1]]);

                facets.push([[
                    currentOffset + x,
                    surfaceOffset - 2,
                    surfaceOffset - 3
                ], [0, 0, 1]]);
            }
        }
        facets.push([[
            4 * (heightData.height * heightData.width - 1) + 1,
            currentOffset + heightData.width - 1,
            currentOffset + heightData.width
        ], [0, 0, 1]]);
        facets.push([[
            currentOffset + heightData.width,
            4 * (heightData.height * heightData.width - 1) + 2,
            4 * (heightData.height * heightData.width - 1) + 1
        ], [0, 0, 1]]);

        // right
        currentOffset += heightData.width;
        for (let z = heightData.height - 1; z >= 0; z--) {
            const surfaceOffset = 4 * ((z + 1) * heightData.width - 1);
            vertices.push([widthMm / 2, backThickness, vertices[surfaceOffset + 2][2]]);

            if (z < heightData.height - 1) {
                const invertedZ = heightData.height - z - 1;
                facets.push([[
                    surfaceOffset + 4 * heightData.width + 2,
                    currentOffset + invertedZ - 1,
                    currentOffset + invertedZ
                ], [1, 0, 0]]);
                
                facets.push([[
                    currentOffset + invertedZ,
                    surfaceOffset + 4 * heightData.width + 3,
                    surfaceOffset + 4 * heightData.width + 2
                ], [1, 0, 0]]);
            }
        }
        facets.push([[
            4 * (heightData.width - 1) + 2,
            currentOffset + heightData.height - 1,
            currentOffset + heightData.height
        ], [1, 0, 0]]);
        facets.push([[
            currentOffset + heightData.height,
            4 * (heightData.width - 1) + 3,
            4 * (heightData.width - 1) + 2
        ], [1, 0, 0]]);

        // top
        currentOffset += heightData.height;
        for (let x = heightData.width - 1; x >= 0; x--) {
            const surfaceOffset = 4 * x;
            vertices.push([vertices[surfaceOffset + 3][0], backThickness, -heightMm / 2]);

            if (x < heightData.width - 1) {
                const invertedX = heightData.width - x - 1;
                facets.push([[
                    surfaceOffset + 7,
                    currentOffset + invertedX - 1,
                    currentOffset + invertedX
                ], [0, 0, -1]]);
                
                facets.push([[
                    currentOffset + invertedX,
                    surfaceOffset + 4,
                    surfaceOffset + 7
                ], [0, 0, -1]]);
            }
        }
        facets.push([[
            3,
            currentOffset + heightData.width - 1,
            baselineOffset
        ], [0, 0, -1]]);
        facets.push([[
            baselineOffset,
            0,
            3
        ], [0, 0, -1]]);
    }

    { // back
        const backOffset = vertices.length;
        vertices.push([-widthMm / 2, 0, -heightMm / 2]);
        vertices.push([-widthMm / 2, 0, heightMm / 2]);
        vertices.push([widthMm / 2, 0, heightMm / 2]);
        vertices.push([widthMm / 2, 0, -heightMm / 2]);
        facets.push([[
            baselineOffset,
            backOffset,
            backOffset + 1
        ], [-1, 0, 0]]);
        facets.push([[
            backOffset + 1,
            baselineOffset + heightData.height,
            baselineOffset
        ], [-1, 0, 0]]);
        facets.push([[
            baselineOffset + heightData.height,
            backOffset + 1,
            backOffset + 2
        ], [0, 0, 1]]);
        facets.push([[
            backOffset + 2,
            baselineOffset + heightData.height + heightData.width,
            baselineOffset + heightData.height
        ], [0, 0, 1]]);
        facets.push([[
            baselineOffset + heightData.height + heightData.width,
            backOffset + 2,
            backOffset + 3
        ], [1, 0, 0]]);
        facets.push([[
            backOffset + 3,
            baselineOffset + 2 * heightData.height + heightData.width,
            baselineOffset + heightData.height + heightData.width
        ], [1, 0, 0]]);
        facets.push([[
            baselineOffset + 2 * heightData.height + heightData.width,
            backOffset + 3,
            backOffset
        ], [0, 0, -1]]);
        facets.push([[
            backOffset,
            baselineOffset,
            baselineOffset + 2 * heightData.height + heightData.width
        ], [0, 0, -1]]);

        facets.push([[
            backOffset + 3,
            backOffset + 2,
            backOffset + 1
        ], [0, -1, 0]]);
        
        facets.push([[
            backOffset + 1,
            backOffset,
            backOffset + 3
        ], [0, -1, 0]]);
    }

    return {
        vertices,
        facets,
        toObj: () => {
            let objStr = '';
            for (let [x, y, z] of vertices)
                objStr += `v ${x} ${-z} ${y}\n`;
            for (let [[v1, v2, v3]] of facets)
                objStr += `f ${v1 + 1} ${v2 + 1} ${v3 + 1}\n`;
            return objStr;
        },
        toStlAscii: () => {
            let stlStr = 'solid \n';
            for (let [[v1, v2, v3], normal] of facets) {
                stlStr += `facet normal ${normal[0].toExponential()} ${(-normal[2]).toExponential()} ${(normal[1]).toExponential()}\n`;
                stlStr += '  outer loop\n';
                stlStr += `    vertex ${vertices[v1][0].toExponential()} ${(-vertices[v1][2]).toExponential()} ${(vertices[v1][1]).toExponential()}\n`;
                stlStr += `    vertex ${vertices[v2][0].toExponential()} ${(-vertices[v2][2]).toExponential()} ${(vertices[v2][1]).toExponential()}\n`;
                stlStr += `    vertex ${vertices[v3][0].toExponential()} ${(-vertices[v3][2]).toExponential()} ${(vertices[v3][1]).toExponential()}\n`;
                stlStr += '  endloop\n';
                stlStr += 'endfacet\n';
            }
            stlStr += 'endsolid \n';
            return stlStr;
        },
        toStlBinary: () => {
            const totalByteCount = 80 + 4 + 50 * facets.length;
            const bytes = new ArrayBuffer(totalByteCount);
            const byteDataView = new DataView(bytes);

            const headerStr = "Generated by https://matt23488.github.io/LithophaneMeshGenerator";
            const utf8Encoder = new TextEncoder();
            const headerStrBytes = utf8Encoder.encode(headerStr);
            for (let i = 0; i < headerStrBytes.length; i++) {
                byteDataView.setUint8(i, headerStrBytes[i]);
            }

            byteDataView.setUint32(80, facets.length);

            for (let i = 0; i < facets.length; i++) {
                let [[v1, v2, v3], normal] = facets[i];
                let byteOffset = i * 50 + 84;
                byteDataView.setFloat32(byteOffset + 0, normal[0], true);
                byteDataView.setFloat32(byteOffset + 4, -normal[2], true);
                byteDataView.setFloat32(byteOffset + 8, normal[1], true);

                byteDataView.setFloat32(byteOffset + 12, vertices[v1][0], true);
                byteDataView.setFloat32(byteOffset + 16, -vertices[v1][2], true);
                byteDataView.setFloat32(byteOffset + 20, vertices[v1][1], true);

                byteDataView.setFloat32(byteOffset + 24, vertices[v2][0], true);
                byteDataView.setFloat32(byteOffset + 28, -vertices[v2][2], true);
                byteDataView.setFloat32(byteOffset + 32, vertices[v2][1], true);

                byteDataView.setFloat32(byteOffset + 36, vertices[v3][0], true);
                byteDataView.setFloat32(byteOffset + 40, -vertices[v3][2], true);
                byteDataView.setFloat32(byteOffset + 44, vertices[v3][1], true);
            }

            return bytes;
        },
        toThreeMesh: () => {
            const threeVertices: number[] = [];
            const normals: number[] = [];
            const colors: number[] = [];
            for (let [[v1, v2, v3], normal] of facets) {
                threeVertices.push(...vertices[v1]);
                threeVertices.push(...vertices[v2]);
                threeVertices.push(...vertices[v3]);

                normals.push(...normal);
                normals.push(...normal);
                normals.push(...normal);

                colors.push(map(surfaceMin, surfaceMax, 1, 0, vertices[v1][1]));
                colors.push(map(surfaceMin, surfaceMax, 1, 0, vertices[v1][1]));
                colors.push(map(surfaceMin, surfaceMax, 1, 0, vertices[v1][1]));

                colors.push(map(surfaceMin, surfaceMax, 1, 0, vertices[v2][1]));
                colors.push(map(surfaceMin, surfaceMax, 1, 0, vertices[v2][1]));
                colors.push(map(surfaceMin, surfaceMax, 1, 0, vertices[v2][1]));

                colors.push(map(surfaceMin, surfaceMax, 1, 0, vertices[v3][1]));
                colors.push(map(surfaceMin, surfaceMax, 1, 0, vertices[v3][1]));
                colors.push(map(surfaceMin, surfaceMax, 1, 0, vertices[v3][1]));

                // for (let i = 0; i < 9; i++)
                //     colors.push(1, 1, 1);
            }

            return {
                position: { array: new Float32Array(threeVertices), count: threeVertices.length / 3, itemSize: 3 },
                normal: { array: new Float32Array(normals), count: normals.length / 3, itemSize: 3 },
                color: { array: new Float32Array(colors), count: colors.length / 3, itemSize: 3 }
            };
        }
    };
};

const calculateNormal = (v1: Vector3, v2: Vector3, v3: Vector3): Vector3 => {
    const u = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
    const v = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]];

    return normalize([
        u[1]*v[2] - u[2]*v[1],
        u[2]*v[0] - u[0]*v[2],
        u[0]*v[1] - u[1]*v[0]
    ]);
}

const normalize = (v: Vector3): Vector3 => {
    const vLen = length(v);
    const [x, y, z] = v;
    return [
        x / vLen,
        y / vLen,
        z / vLen
    ];
};

const length = ([x, y, z]: Vector3) => Math.sqrt(x*x + y*y + z*z);

export interface LithophaneProperties {
    heightData: HeightData;
    surfaceThickness: number;
    backThickness: number;
    widthMm: number;
    heightMm: number;
    layerHeight: number;
}

export interface LithophaneMesh {
    vertices: VertexArray;
    facets: FacetArray;
    toObj: () => string;
    toStlAscii: () => string;
    toStlBinary: () => ArrayBuffer;
    toThreeMesh: () => ThreeMeshData;
}

export interface HeightData {
    width: number;
    height: number;
    data: number[];
}

export interface ThreeMeshData {
    position: ThreeGeometryData;
    normal: ThreeGeometryData;
    color?: ThreeGeometryData;
}

export interface ThreeGeometryData {
    array: Float32Array;
    itemSize: number;
    count: number;
}

export type Vector3 = [number, number, number];
export type VertexArray = Vector3[];
export type FacetArray = [Vector3, Vector3][];