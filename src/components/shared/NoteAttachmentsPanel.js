import React, { useCallback, useEffect, useRef, useState } from 'react';
import attachmentApi from '../../api/attachmentApi';
import { formatDate } from '../../utils/formatters';
import { useFeedback } from './FeedbackProvider';

const MAX_IMAGE_SIDE = 1600;
const IMAGE_QUALITY = 0.84;
const OUTPUT_TYPE = 'image/jpeg';

const getOutputName = (filename = 'immagine') => {
    const baseName = filename.replace(/\.[^.]+$/, '') || 'immagine';
    return `${baseName}.jpg`;
};

const readImageFile = (file) => new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
        reject(new Error('File non supportato'));
        return;
    }

    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
        const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, 0, 0, width, height);
        URL.revokeObjectURL(objectUrl);

        resolve({
            contentType: OUTPUT_TYPE,
            data: canvas.toDataURL(OUTPUT_TYPE, IMAGE_QUALITY),
            filename: getOutputName(file.name),
        });
    };

    image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Immagine non leggibile'));
    };

    image.src = objectUrl;
});

const AttachmentCard = ({ attachment, onDelete }) => {
    const fileUrl = attachmentApi.fileUrl(attachment._id);

    return (
        <article className="note-attachment-card">
            <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="note-attachment-preview"
            >
                <img
                    src={fileUrl}
                    alt={attachment.filename}
                    loading="lazy"
                />
            </a>
            <div className="note-attachment-meta">
                <strong>{attachment.filename}</strong>
                <span>{formatDate(attachment.createdAt)}</span>
            </div>
            <button
                type="button"
                className="btn btn-delete"
                onClick={() => onDelete(attachment)}
            >
                Elimina
            </button>
        </article>
    );
};

const NoteAttachmentsPanel = ({ resource, recordId }) => {
    const { confirm, notify } = useFeedback();
    const fileInputRef = useRef(null);
    const [attachments, setAttachments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    const loadAttachments = useCallback(async () => {
        setIsLoading(true);

        try {
            const response = await attachmentApi.list(resource, recordId);
            setAttachments(response.data);
        } catch (error) {
            notify('Errore durante il recupero degli allegati', 'error');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [notify, recordId, resource]);

    useEffect(() => {
        loadAttachments();
    }, [loadAttachments]);

    const resetInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFiles = async (event) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        setIsUploading(true);

        try {
            for (const file of files) {
                const payload = await readImageFile(file);
                await attachmentApi.upload(resource, recordId, payload);
            }

            notify(files.length === 1 ? 'Immagine allegata' : 'Immagini allegate', 'success');
            await loadAttachments();
        } catch (error) {
            notify('Errore durante il caricamento dell\'immagine', 'error');
            console.error(error);
        } finally {
            setIsUploading(false);
            resetInput();
        }
    };

    const handleDelete = async (attachment) => {
        const confirmed = await confirm({
            title: 'Elimina immagine',
            message: 'Vuoi eliminare questa immagine dagli allegati note?',
            confirmLabel: 'Elimina',
            variant: 'danger',
        });

        if (!confirmed) return;

        try {
            await attachmentApi.remove(attachment._id);
            notify('Immagine eliminata', 'success');
            await loadAttachments();
        } catch (error) {
            notify('Errore durante l\'eliminazione dell\'immagine', 'error');
            console.error(error);
        }
    };

    return (
        <section className="note-attachments-panel" aria-label="Allegati note">
            <div className="note-attachments-header">
                <div>
                    <span className="eyebrow">Note</span>
                    <h3>Allegati immagini</h3>
                </div>
                <label className={`btn btn-primary note-attachment-upload ${isUploading ? 'is-disabled' : ''}`}>
                    {isUploading ? 'Caricamento...' : 'Aggiungi immagini'}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={isUploading}
                        onChange={handleFiles}
                    />
                </label>
            </div>

            {isLoading && <div className="note-attachments-empty">Caricamento...</div>}

            {!isLoading && attachments.length === 0 && (
                <div className="note-attachments-empty">Nessuna immagine allegata</div>
            )}

            {!isLoading && attachments.length > 0 && (
                <div className="note-attachments-grid">
                    {attachments.map((attachment) => (
                        <AttachmentCard
                            attachment={attachment}
                            key={attachment._id}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default NoteAttachmentsPanel;
