import React, { useCallback, useRef, useState } from 'react';
import { FaImage } from 'react-icons/fa';

import './css/InputImageBrowser.css';

const noFileSelectedText = "No Image Selected";
const InputImageBrowser: React.FC<InputImageBrowserProperties> = props => {
    const hiddenInputRef = useRef<HTMLInputElement>(null);

    const { file, onChange, onImageLoaded } = props;

    const onImageSelected = useCallback<React.ChangeEventHandler<HTMLInputElement>>(e => {
        const newFile = e.target.files?.[0];
        onChange(newFile);

        if (!newFile) {
            onImageLoaded('');
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(newFile);

        reader.onload = evt => {
            onImageLoaded(evt.target!.result as string);
        };

        reader.onerror = err => {
            console.error('Error reading file. Details:', err);
        };
    }, [onImageLoaded]);

    return (
        <div className="InputImageBrowser">
            <input ref={hiddenInputRef} type="file" onChange={onImageSelected} />
            <button className="button button-secondary" onClick={() => hiddenInputRef.current?.click()}>
                <FaImage />
                <div style={{ marginLeft: '5px' }}>Browse</div>
            </button>
            <div className="file-name">
                <em>{file?.name ?? noFileSelectedText}</em>
            </div>
        </div>
    );
};

export interface InputImageBrowserProperties {
    file?: File;
    onChange: (file?: File) => void;
    onImageLoaded: (dataUrl: string) => void;
}

export default InputImageBrowser;