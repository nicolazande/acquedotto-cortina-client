import React from 'react';
import { editorViews } from '../../config/editorViews';
import EntityEditor from './EntityEditor';

const ContatoreEditor = ({ contatore, onSave, onCancel, mode }) => (
    <EntityEditor
        config={editorViews.contatore}
        record={contatore}
        onSave={onSave}
        onCancel={onCancel}
        mode={mode}
    />
);

export default ContatoreEditor;
