import React from 'react';
import EntityEditor from './EntityEditor';
import { editorViews } from '../../config/editorViews';

const createEditorComponent = (configKey, propName) => {
    const EditorComponent = ({ onSave, onCancel, mode, ...props }) => (
        <EntityEditor
            config={editorViews[configKey]}
            record={props[propName]}
            onSave={onSave}
            onCancel={onCancel}
            mode={mode}
        />
    );

    EditorComponent.displayName = `${configKey}Editor`;
    return EditorComponent;
};

export const editorComponents = {
    articolo: createEditorComponent('articolo', 'articolo'),
    cliente: createEditorComponent('cliente', 'cliente'),
    contatore: createEditorComponent('contatore', 'contatore'),
    edificio: createEditorComponent('edificio', 'edificio'),
    fascia: createEditorComponent('fascia', 'fascia'),
    fattura: createEditorComponent('fattura', 'fattura'),
    lettura: createEditorComponent('lettura', 'lettura'),
    listino: createEditorComponent('listino', 'listino'),
    scadenza: createEditorComponent('scadenza', 'scadenza'),
    servizio: createEditorComponent('servizio', 'servizio'),
};
