import React from 'react';
import { editorViews } from '../../config/editorViews';
import EntityEditor from './EntityEditor';

const LetturaEditor = ({ lettura, onSave, onCancel, mode }) => (
    <EntityEditor
        config={editorViews.lettura}
        record={lettura}
        onSave={onSave}
        onCancel={onCancel}
        mode={mode}
    />
);

export default LetturaEditor;
