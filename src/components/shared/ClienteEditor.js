import React from 'react';
import { editorViews } from '../../config/editorViews';
import EntityEditor from './EntityEditor';

const ClienteEditor = ({ cliente, onSave, onCancel, mode }) => (
    <EntityEditor
        config={editorViews.cliente}
        record={cliente}
        onSave={onSave}
        onCancel={onCancel}
        mode={mode}
    />
);

export default ClienteEditor;
