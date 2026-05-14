import React from 'react';
import { editorViews } from '../../config/editorViews';
import EntityEditor from './EntityEditor';

const EdificioEditor = ({ edificio, onSave, onCancel, mode }) => (
    <EntityEditor
        config={editorViews.edificio}
        record={edificio}
        onSave={onSave}
        onCancel={onCancel}
        mode={mode}
    />
);

export default EdificioEditor;
