import React from 'react';
import EntityEditor from './EntityEditor';
import { editorViews } from '../../config/editorViews';

// Ogni vista di modifica ha il suo componente, e sono tutti uguali: cambia solo
// quale configurazione leggono e sotto quale prop arriva il record - che e lo
// stesso nome della vista. Elencarli a mano voleva dire dieci righe identiche.
const createEditorComponent = (nome) => {
    const EditorComponent = ({ onSave, onCancel, mode, ...props }) => (
        <EntityEditor
            config={editorViews[nome]}
            record={props[nome]}
            onSave={onSave}
            onCancel={onCancel}
            mode={mode}
        />
    );

    EditorComponent.displayName = `${nome}Editor`;
    return EditorComponent;
};

export const editorComponents = Object.fromEntries(
    Object.keys(editorViews).map((nome) => [nome, createEditorComponent(nome)]),
);
