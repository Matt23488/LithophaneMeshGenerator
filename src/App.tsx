import React, { useCallback, useMemo, useState } from 'react';
import { FaDownload, FaUnity } from 'react-icons/fa';
import './App.css';
import InputImageBrowser from './components/InputImageBrowser';
import NumberInput from './components/NumberInput';
import Viewport from './components/Viewport';
import { generateMesh, HeightData, LithophaneMesh } from './lithophaneMesh';

function App() {
  // const onImageSelected = useCallback((dataUrl) => {
  //   alert(dataUrl);
  // }, []);

  const [imageDataUrl, setImageDataUrl] = useState('');

  const [brightnessModifer, setBrightnessModifier] = useState(1);
  const [backThickness, setBackThickness] = useState(0.4);
  const [surfaceThickness, setSurfaceThickness] = useState(1.6);
  const [sideLength, setSideLength] = useState(100);
  const [sampleCount, setSampleCount] = useState(300);
  const [mesh, setMesh] = useState<LithophaneMesh>();
  const [heightData, setHeightData] = useState<HeightData>();
  // const [meshHref, setMeshHref] = useState('');

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

  // const onMeshUpdated = useCallback((mesh: LithophaneMesh) => {
  //   let objStr = '';
  //   for (let vertex of mesh.vertices)
  //     objStr += `v ${vertex[0]} ${vertex[1]} ${vertex[2]}\n`;
  //   for (let face of mesh.faces)
  //     objStr += `f ${face[0] + 1} ${face[1] + 1} ${face[2] + 2}\n`;
  //   setMeshHref(`data:text/plain;charset=utf-8,${encodeURIComponent(objStr)}`);
  // }, []);

  const [downloadType, setDownloadType] = useState(0);

  const downloadMesh = () => new Promise(() => {
    if (!mesh) return;
    // const mesh = generateMesh(lithophaneProps);

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

  return (
    <div className="App">
      <div className="ui">
        <InputImageBrowser onImageLoaded={setImageDataUrl} />
        {imageDataUrl.length > 0 &&
          <>
            <NumberInput name="Brightness Modifier" suffix="x" min={0} max={2} step={0.1} value={brightnessModifer} onValueChanged={setBrightnessModifier} />
            <NumberInput name="Back Thickness" suffix="mm" min={0} step={0.1} value={backThickness} onValueChanged={setBackThickness} />
            <NumberInput name="Surface Thickness" suffix="mm" min={1} step={0.1} value={surfaceThickness} onValueChanged={setSurfaceThickness} />
            <NumberInput name="Side Length" suffix="mm" min={10} step={1} value={sideLength} onValueChanged={setSideLength} />
            <NumberInput name="1D Samples" min={2} step={1} value={sampleCount} onValueChanged={setSampleCount} />
            {/* TODO: Don't regenerate mesh on every ui change. Invalidate a cached mesh and regenerate when this is clicked. */}
            {/*       This will require moving the mesh generation logic higher in the render tree and passing it down to the Viewport, etc. */}
            <button className="button" onClick={() => setMesh(generateMesh(lithophaneProps))}>
              <FaUnity />
              <div style={{ marginLeft: '5px' }}>Generate Mesh</div>
            </button>
            <select
              value={downloadType}
              onChange={e => {
                setDownloadType(parseInt(e.target.value));
              }}
            >
              <option value={0}>STL (Binary)</option>
              <option value={1}>STL (ASCII)</option>
              <option value={2}>OBJ</option>
            </select>
            <button className="generate-mesh-button button" onClick={downloadMesh}>
              <FaDownload />
              <div style={{ marginLeft: '5px' }}>Download Mesh</div>
            </button>
          </>
        }
      </div>
      <div className="viewport-container">
        <Viewport
          imageDataUrl={imageDataUrl}
          imageBrightnessModifier={brightnessModifer}
          imageSampleCount={sampleCount}
          surfaceThickness={surfaceThickness}
          backThickness={backThickness}
          sideLength={sideLength}
          // onMeshUpdated={setMesh}
          mesh={mesh}
          onHeightDataUpdated={setHeightData}
        />
      </div>
    </div>
  );
}

export default App;
