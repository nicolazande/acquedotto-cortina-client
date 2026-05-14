import React from 'react';
import { editorViews } from '../../config/editorViews';
import EntityEditor from './EntityEditor';

const ArticoloEditor = ({ articolo, onSave, onCancel, mode }) => (
    <EntityEditor
        config={editorViews.articolo}
        record={articolo}
        onSave={onSave}
        onCancel={onCancel}
        mode={mode}
    />
);

export default ArticoloEditor;
