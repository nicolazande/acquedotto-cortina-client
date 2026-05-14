import React from 'react';
import { editorViews } from '../../config/editorViews';
import EntityEditor from './EntityEditor';

const FasciaEditor = ({ fascia, onSave, onCancel, mode }) => (
    <EntityEditor
        config={editorViews.fascia}
        record={fascia}
        onSave={onSave}
        onCancel={onCancel}
        mode={mode}
    />
);

export default FasciaEditor;
