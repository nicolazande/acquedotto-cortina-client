import React from 'react';
import { editorViews } from '../../config/editorViews';
import EntityEditor from './EntityEditor';

const ScadenzaEditor = ({ scadenza, onSave, onCancel, mode }) => (
    <EntityEditor
        config={editorViews.scadenza}
        record={scadenza}
        onSave={onSave}
        onCancel={onCancel}
        mode={mode}
    />
);

export default ScadenzaEditor;
