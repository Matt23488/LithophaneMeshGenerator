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

    if (!undefinedProps)
        ({ heightData, surfaceThickness, backThickness, widthMm, heightMm } = lithophaneProps);

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

    let offsetX = -widthMm / 2;
    let offsetZ = -heightMm / 2;
    for (let z = 0; z < heightData.height; z++) {
        for (let x = 0; x < heightData.width; x++) {
            const i = z * heightData.width + x;
            const cellY = map(0, 1, surfaceMin, surfaceMax, heightData.data[i]);
            vertices.push([offsetX, cellY, offsetZ]);
            vertices.push([offsetX, cellY, offsetZ + deltaZ]);
            vertices.push([offsetX + deltaX, cellY, offsetZ + deltaZ]);
            vertices.push([offsetX + deltaX, cellY, offsetZ]);

            if (z > 0) {
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
                ], calculateNormal(
                    vertices[indices[0]],
                    vertices[indices[1]],
                    vertices[indices[2]]
                )]);
                facets.push([[
                    indices[2],
                    indices[3],
                    indices[0]
                ], calculateNormal(
                    vertices[indices[2]],
                    vertices[indices[3]],
                    vertices[indices[0]]
                )]);
            }

            if (x > 0) {
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
                ], calculateNormal(
                    vertices[indices[0]],
                    vertices[indices[1]],
                    vertices[indices[2]]
                )]);
                facets.push([[
                    indices[2],
                    indices[3],
                    indices[0]
                ], calculateNormal(
                    vertices[indices[2]],
                    vertices[indices[3]],
                    vertices[indices[0]]
                )]);
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

    return {
        vertices,
        facets,
        toObj: () => {
            let objStr = '';
            for (let [x, y, z] of vertices)
                objStr += `v ${x} ${-y} ${z}\n`;
            for (let [[v1, v2, v3]] of facets)
                objStr += `f ${v1 + 1} ${v2 + 1} ${v3 + 1}\n`;
            return objStr;
        },
        toStlAscii: () => {
            let stlStr = 'solid \n';
            for (let [[v1, v2, v3], normal] of facets) {
                stlStr += `facet normal ${normal[0].toExponential()} ${(-normal[1]).toExponential()} ${(normal[2]).toExponential()}\n`;
                stlStr += '  outer loop\n';
                stlStr += `    vertex ${vertices[v1][0].toExponential()} ${(-vertices[v1][1]).toExponential()} ${(vertices[v1][2]).toExponential()}\n`;
                stlStr += `    vertex ${vertices[v2][0].toExponential()} ${(-vertices[v2][1]).toExponential()} ${(vertices[v2][2]).toExponential()}\n`;
                stlStr += `    vertex ${vertices[v3][0].toExponential()} ${(-vertices[v3][1]).toExponential()} ${(vertices[v3][2]).toExponential()}\n`;
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

            const headerStr = "Generated by https://github.com/Matt23488/LithophaneMeshGenerator";
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
                byteDataView.setFloat32(byteOffset + 4, -normal[1], true);
                byteDataView.setFloat32(byteOffset + 8, normal[2], true);

                byteDataView.setFloat32(byteOffset + 12, vertices[v1][0], true);
                byteDataView.setFloat32(byteOffset + 16, -vertices[v1][1], true);
                byteDataView.setFloat32(byteOffset + 20, vertices[v1][2], true);

                byteDataView.setFloat32(byteOffset + 24, vertices[v2][0], true);
                byteDataView.setFloat32(byteOffset + 28, -vertices[v2][1], true);
                byteDataView.setFloat32(byteOffset + 32, vertices[v2][2], true);

                byteDataView.setFloat32(byteOffset + 36, vertices[v3][0], true);
                byteDataView.setFloat32(byteOffset + 40, -vertices[v3][1], true);
                byteDataView.setFloat32(byteOffset + 44, vertices[v3][2], true);
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