import React from 'react';
import { editorViews } from '../../config/editorViews';
import EntityEditor from './EntityEditor';

const FatturaEditor = ({ fattura, onSave, onCancel, mode }) => (
    <EntityEditor
        config={editorViews.fattura}
        record={fattura}
        onSave={onSave}
        onCancel={onCancel}
        mode={mode}
    />
);

export default FatturaEditor;
