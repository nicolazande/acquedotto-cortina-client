import React, { useCallback, useEffect, useRef, useState } from 'react';
import attachmentApi from '../../api/attachmentApi';
import { formatDate } from '../../utils/formatters';
import { useFeedback } from './FeedbackProvider';
import Icon from './Icon';

const MAX_IMAGE_SIDE = 1600;
const IMAGE_QUALITY = 0.84;
const OUTPUT_TYPE = 'image/jpeg';
const ACCEPTED_ATTACHMENT_TYPES = [
    'image/*',
    'application/pdf',
    'text/plain',
    'text/csv',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.odt',
    '.ods',
].join(',');

const typeLabelByContentType = {
    'application/msword': 'DOC',
    'application/pdf': 'PDF',
    'application/vnd.ms-excel': 'XLS',
    'application/vnd.oasis.opendocument.spreadsheet': 'ODS',
    'application/vnd.oasis.opendocument.text': 'ODT',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'text/csv': 'CSV',
    'text/plain': 'TXT',
};

const contentTypeByExtension = {
    csv: 'text/csv',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    gif: 'image/gif',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    ods: 'application/vnd.oasis.opendocument.spreadsheet',
    odt: 'application/vnd.oasis.opendocument.text',
    pdf: 'application/pdf',
    png: 'image/png',
    txt: 'text/plain',
    webp: 'image/webp',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

const formatFileSize = (bytes = 0) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getOutputName = (filename = 'immagine') => {
    const baseName = filename.replace(/\.[^.]+$/, '') || 'immagine';
    return `${baseName}.jpg`;
};

const getFileContentType = (file) => {
    if (file.type && file.type !== 'application/octet-stream') {
        return file.type;
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    return extension ? contentTypeByExtension[extension] || file.type : file.type;
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

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
        contentType: getFileContentType(file) || 'application/octet-stream',
        data: reader.result,
        filename: file.name || 'allegato',
    });
    reader.onerror = () => reject(new Error('File non leggibile'));
    reader.readAsDataURL(file);
});

const shouldCompressImage = (file) => {
    const contentType = getFileContentType(file);
    return contentType.startsWith('image/') && contentType !== 'image/gif';
};

const readAttachmentFile = (file) => (
    shouldCompressImage(file) ? readImageFile(file) : readFileAsDataUrl(file)
);

const getAttachmentKind = (attachment) => {
    if (attachment.contentType.startsWith('image/')) return 'IMG';
    return typeLabelByContentType[attachment.contentType] || 'FILE';
};

const AttachmentCard = ({ attachment, onDelete }) => {
    const fileUrl = attachmentApi.fileUrl(attachment._id);
    const isImage = attachment.contentType.startsWith('image/');
    const attachmentKind = getAttachmentKind(attachment);

    return (
        <article className="note-attachment-card">
            <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="note-attachment-preview"
            >
                {isImage ? (
                    <img
                        src={fileUrl}
                        alt={attachment.filename}
                        loading="lazy"
                    />
                ) : (
                    <span className="note-attachment-filetype">{attachmentKind}</span>
                )}
            </a>
            <div className="note-attachment-meta">
                <strong>{attachment.filename}</strong>
                <span>{attachmentKind} - {formatFileSize(attachment.size)} - {formatDate(attachment.createdAt)}</span>
            </div>
            <div className="note-attachment-actions">
                <a className="btn btn-secondary" href={fileUrl} target="_blank" rel="noopener noreferrer">
                    <Icon name="eye" />
                    Apri
                </a>
                <button
                    type="button"
                    className="btn btn-delete"
                    onClick={() => onDelete(attachment)}
                >
                    <Icon name="trash" />
                    Elimina
                </button>
            </div>
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
                const payload = await readAttachmentFile(file);
                await attachmentApi.upload(resource, recordId, payload);
            }

            notify(files.length === 1 ? 'Allegato caricato' : 'Allegati caricati', 'success');
            await loadAttachments();
        } catch (error) {
            notify('Errore durante il caricamento dell\'allegato', 'error');
            console.error(error);
        } finally {
            setIsUploading(false);
            resetInput();
        }
    };

    const handleDelete = async (attachment) => {
        const confirmed = await confirm({
            title: 'Elimina allegato',
            message: 'Vuoi eliminare questo allegato dalle note?',
            confirmLabel: 'Elimina',
            variant: 'danger',
        });

        if (!confirmed) return;

        try {
            await attachmentApi.remove(attachment._id);
            notify('Allegato eliminato', 'success');
            await loadAttachments();
        } catch (error) {
            notify('Errore durante l\'eliminazione dell\'allegato', 'error');
            console.error(error);
        }
    };

    return (
        <section className="note-attachments-panel" aria-label="Allegati note">
            <div className="note-attachments-header">
                <div>
                    <span className="eyebrow">Note</span>
                    <h3>Allegati</h3>
                </div>
                <label className={`btn btn-primary note-attachment-upload ${isUploading ? 'is-disabled' : ''}`}>
                    <Icon name="plus" />
                    {isUploading ? 'Caricamento...' : 'Aggiungi allegati'}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={ACCEPTED_ATTACHMENT_TYPES}
                        multiple
                        disabled={isUploading}
                        onChange={handleFiles}
                    />
                </label>
            </div>

            {isLoading && <div className="note-attachments-empty">Caricamento...</div>}

            {!isLoading && attachments.length === 0 && (
                <div className="note-attachments-empty">Nessun allegato</div>
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
