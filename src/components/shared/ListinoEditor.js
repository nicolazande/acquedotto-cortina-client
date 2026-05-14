import React from 'react';
import { editorViews } from '../../config/editorViews';
import EntityEditor from './EntityEditor';

const ListinoEditor = ({ listino, onSave, onCancel, mode }) => (
    <EntityEditor
        config={editorViews.listino}
        record={listino}
        onSave={onSave}
        onCancel={onCancel}
        mode={mode}
    />
);

export default ListinoEditor;
