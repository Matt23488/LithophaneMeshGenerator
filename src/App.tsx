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
  const [brightnessModifer, setBrightnessModifier] = useState(1);
  const [backThickness, setBackThickness] = useState(0.4);
  const [surfaceThickness, setSurfaceThickness] = useState(1.6);
  const [sideLength, setSideLength] = useState(100);
  const [sampleCount, setSampleCount] = useState(300);
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
          heightMm
      };
  }, [heightData, sideLength, surfaceThickness, backThickness]);

  const [downloadType, setDownloadType] = useState(0);

  const downloadMesh = () => new Promise(() => {
    if (!mesh) return;

    if (downloadType === 0) {
      const stlBytes = mesh.toStlBinary();

      const blob = new Blob([stlBytes], { type: 'model/stl' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'mesh.bin.stl';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(link.href);
    } else if (downloadType === 1) {
      const stlStr = mesh.toStlAscii();

      const link = document.createElement('a');
      link.href = `data:model/stl;charset=utf-8,${encodeURIComponent(stlStr)}`;
      link.download = 'mesh.ascii.stl';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } else {
      const objStr = mesh.toObj();
  
      const link = document.createElement('a');
      link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(objStr)}`;
      link.download = 'mesh.obj';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      link.remove();
    }

  });

  if (mesh)
    return (
      <div className="App">
        <button className="button top-right" onClick={() => setMesh(undefined)}>
          <FaTimesCircle />
        </button>
        <div className="top-left" style={{ display: 'flex' }}>
          <select className="button" value={downloadType} onChange={e => setDownloadType(parseInt(e.target.value))}>
            <option value={0}>STL (Binary)</option>
            <option value={1}>STL (ASCII)</option>
            <option value={2}>OBJ</option>
          </select>
          <button className="button" onClick={downloadMesh}>
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
        {imageDataUrl.length > 0 &&
          <>
            <NumberInput name="Brightness Modifier" suffix="x" min={0} max={2} step={0.1} value={brightnessModifer} onValueChanged={setBrightnessModifier} />
            <NumberInput name="Back Thickness" suffix="mm" min={0} step={0.1} value={backThickness} onValueChanged={setBackThickness} />
            <NumberInput name="Surface Thickness" suffix="mm" min={1} step={0.1} value={surfaceThickness} onValueChanged={setSurfaceThickness} />
            <NumberInput name="Side Length" suffix="mm" min={10} step={1} value={sideLength} onValueChanged={setSideLength} />
            <NumberInput name="1D Samples" min={2} step={1} value={sampleCount} onValueChanged={setSampleCount} />
            <button className="button" onClick={() => setMesh(generateMesh(lithophaneProps))}>
              <FaUnity />
              <div style={{ marginLeft: '5px' }}>Generate Mesh</div>
            </button>
          </>
        }
      </div>
      <div className="viewport-container">
        <ImageCanvasDisplay
          brightnessModifier={brightnessModifer}
          imageDataUrl={imageDataUrl}
          sampleCount={sampleCount}
          onHeightDataChanged={setHeightData}
        />
      </div>
    </div>
  );
}

export default App;
