import React, { useState } from 'react';
import './App.css';
import InputImageBrowser from './components/InputImageBrowser';
import NumberInput from './components/NumberInput';
import Viewport from './components/Viewport';

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
            <button className="generate-mesh-button button">Generate Mesh</button>
          </>
        }
      </div>
      <div className="viewport-container">
        <Viewport imageDataUrl={imageDataUrl} />
      </div>
    </div>
  );
}

export default App;
