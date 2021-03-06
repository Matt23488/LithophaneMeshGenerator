import React, { Suspense, useCallback, useMemo, useState } from 'react';
import { FaDownload, FaTimesCircle, FaUnity } from 'react-icons/fa';
import './App.css';
import ImageCanvasDisplay from './components/ImageCanvasDisplay';
import InputImageBrowser from './components/InputImageBrowser';
import MeshViewer from './components/MeshViewer';
import NumberInput from './components/NumberInput';
import { generateMesh, HeightData, LithophaneMesh } from './lithophaneMesh';

function App() {
    const [imageDataUrl, setImageDataUrl] = useState('');

    const [file, setFile] = useState<File>();
    const [brightnessModifier, setBrightnessModifier] = useState(1);
    const [contrast, setContrast] = useState(0);
    const [backThickness, setBackThickness] = useState(0.4);
    const [surfaceThickness, setSurfaceThickness] = useState(1.6);
    const [sideLength, setSideLength] = useState(100);
    const [sampleCount, setSampleCount] = useState(300);
    const [layerHeight, setLayerHeight] = useState(0.16);
    const [mesh, setMesh] = useState<LithophaneMesh>();
    const [heightData, setHeightData] = useState<HeightData>();

    const lithophaneProps = useMemo(() => {
        if (!heightData) return undefined;

        const aspectRatio = heightData.width / heightData.height;
            let widthMm = sideLength;
            let heightMm = sideLength;

            if (aspectRatio > 1)
                    heightMm = sideLength / aspectRatio;
            else if (aspectRatio < 1)
                    widthMm = sideLength * aspectRatio;

            return {
                    heightData,
                    surfaceThickness: surfaceThickness,
                    backThickness: backThickness,
                    widthMm,
                    heightMm,
                    layerHeight
            };
    }, [heightData, sideLength, surfaceThickness, backThickness, layerHeight]);

    const [downloadType, setDownloadType] = useState(0);

    const downloadMesh = () => new Promise(() => {
        if (!mesh || !file) return;

        let href = '';
        let extension = '';
        if (downloadType === 0) {
            const stlBytes = mesh.toStlBinary();
            const blob = new Blob([stlBytes], { type: 'model/stl' });
            href = window.URL.createObjectURL(blob);
            extension = 'stl';
        } else if (downloadType === 1) {
            const stlStr = mesh.toStlAscii();
            href = `data:model/stl;charset=utf-8,${encodeURIComponent(stlStr)}`;
            extension = 'stl';
        } else {
            const objStr = mesh.toObj();
            href = `data:text/plain;charset=utf-8,${encodeURIComponent(objStr)}`;
            extension = 'obj';
        }

        const link = document.createElement('a');
        link.href = href;
        link.download = `${file.name}.${extension}`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        link.remove();

        if (downloadType === 0)
            window.URL.revokeObjectURL(href);

    });

    if (mesh)
        return (
            <div className="App">
                <button className="button top-right" onClick={() => setMesh(undefined)} style={{ fontSize: '1.5em'}}>
                    <FaTimesCircle />
                </button>
                <div className="top-left" style={{ display: 'flex' }}>
                    <select className="button" value={downloadType} onChange={e => setDownloadType(parseInt(e.target.value))}>
                        <option value={0}>STL (Binary)</option>
                        <option value={1}>STL (ASCII)</option>
                        <option value={2}>OBJ</option>
                    </select>
                    <button className="button" onClick={downloadMesh} style={{ marginLeft: '1px' }}>
                        <FaDownload />
                    </button>
                </div>
                <Suspense fallback={<>Loading Mesh...</>}>
                    <MeshViewer mesh={mesh} />
                </Suspense>
            </div>
        );

    return (
        <div className="App">
            <div className="ui">
                <InputImageBrowser file={file} onChange={setFile} onImageLoaded={setImageDataUrl} />
                {file &&
                    <>
                        <NumberInput name="Brightness Modifier" suffix="x" min={0} max={2} step={0.1} value={brightnessModifier} onValueChanged={setBrightnessModifier} />
                        <NumberInput name="Contrast" min={-128} max={128} value={contrast} onValueChanged={setContrast} />
                        <NumberInput name="Back Thickness" suffix="mm" min={0} step={0.1} value={backThickness} onValueChanged={setBackThickness} />
                        <NumberInput name="Surface Thickness" suffix="mm" min={1} step={0.1} value={surfaceThickness} onValueChanged={setSurfaceThickness} />
                        <NumberInput name="Side Length" suffix="mm" min={10} step={1} value={sideLength} onValueChanged={setSideLength} />
                        <NumberInput name="1D Samples" min={2} step={1} value={sampleCount} onValueChanged={setSampleCount} />
                        <NumberInput name="Layer Height" suffix="mm" min={0.08} step={0.04} max={0.28} value={layerHeight} onValueChanged={setLayerHeight} />
                        <button className="button" onClick={() => setMesh(generateMesh(lithophaneProps))}>
                            <FaUnity />
                            <div style={{ marginLeft: '5px' }}>Generate Mesh</div>
                        </button>
                    </>
                }
            </div>
            <div className="viewport-container">
                <ImageCanvasDisplay
                    brightnessModifier={brightnessModifier}
                    contrast={contrast}
                    imageDataUrl={imageDataUrl}
                    sampleCount={sampleCount}
                    onHeightDataChanged={setHeightData}
                />
            </div>
        </div>
    );
}

export default App;
