import { map } from './utilities';

const grayscaleConversionWeights = {
    r: 0.2989,
    g: 0.5870,
    b: 0.1140
};

export const toGrayscale = (pixels: ImageData) => {
    const grayscalePixels = new ImageData(pixels.width, pixels.height);

    for (let i = 0; i < pixels.data.byteLength; i += 4) {
        const r = pixels.data[i + 0];
        const g = pixels.data[i + 1];
        const b = pixels.data[i + 2];
        
        const grayscaleValue =
            r * grayscaleConversionWeights.r +
            g * grayscaleConversionWeights.g +
            b * grayscaleConversionWeights.b;

        grayscalePixels.data[i + 0] = grayscaleValue;
        grayscalePixels.data[i + 1] = grayscaleValue;
        grayscalePixels.data[i + 2] = grayscaleValue;
        grayscalePixels.data[i + 3] = 255;
    }

    return grayscalePixels;
};

export const adjustBrightness = (pixels: ImageData, brightnessModifier: number) => {
    const newPixels = new ImageData(pixels.width, pixels.height);

    for (let i = 0; i < pixels.data.byteLength; i += 4) {
        newPixels.data[i + 0] = pixels.data[i + 0] * brightnessModifier;
        newPixels.data[i + 1] = pixels.data[i + 1] * brightnessModifier;
        newPixels.data[i + 2] = pixels.data[i + 2] * brightnessModifier;
        newPixels.data[i + 3] = pixels.data[i + 3];
    }

    return newPixels;
};

export const adjustSampleCount = (pixels: ImageData, sampleCount: number) => {
    const newPixels = new ImageData(pixels.width, pixels.height);

    let widthSamples = sampleCount;
    let heightSamples = sampleCount;
    const aspectRatio = pixels.width / pixels.height;
    
    if (aspectRatio > 1)
        heightSamples = Math.max(2, Math.round(sampleCount / aspectRatio));
    else if (aspectRatio < 1)
        widthSamples = Math.max(2, Math.round(sampleCount * aspectRatio));

    const xThreshold = pixels.width / widthSamples;
    const yThreshold = pixels.height / heightSamples;

    const xSamples: number[] = [];
    for (let i = 0; i < widthSamples; i++) {
        const multiplier = i + 0.5;
        xSamples.push(Math.round(xThreshold * multiplier));
    }

    const ySamples: number[] = [];
    for (let i = 0; i < heightSamples; i++) {
        const multiplier = i + 0.5;
        ySamples.push(Math.round(yThreshold * multiplier));
    }

    for (let i = 0; i < pixels.data.byteLength; i += 4) {
        const xyIndex = Math.floor(i / 4);
        const x = xyIndex % pixels.width;
        const y = Math.floor(xyIndex / pixels.width);

        const xSampleIndex = Math.floor(x / xThreshold);
        const ySampleIndex = Math.floor(y / yThreshold);

        const xSample = xSamples[xSampleIndex];
        const ySample = ySamples[ySampleIndex];
        const iSample = 4 * (ySample * pixels.width + xSample);

        newPixels.data[i + 0] = pixels.data[iSample + 0];
        newPixels.data[i + 1] = pixels.data[iSample + 1];
        newPixels.data[i + 2] = pixels.data[iSample + 2];
        newPixels.data[i + 3] = pixels.data[iSample + 3];
    }

    return newPixels;
};