const grayscaleConversionWeights = {
    r: 0.2989,
    g: 0.5870,
    b: 0.1140
};

// TODO: mutate instead to save on performance.
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