import React from 'react';
import { editorViews } from '../../config/editorViews';
import EntityEditor from './EntityEditor';

const ServizioEditor = ({ servizio, onSave, onCancel, mode }) => (
    <EntityEditor
        config={editorViews.servizio}
        record={servizio}
        onSave={onSave}
        onCancel={onCancel}
        mode={mode}
    />
);

export default ServizioEditor;
