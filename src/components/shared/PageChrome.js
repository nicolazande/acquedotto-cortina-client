import React, { useEffect, useState } from 'react';
import Button from './Button';

const DEFAULT_SLOT_SIZE = 10;

const getSlotStartForPage = (page, slotSize) => (
    Math.floor((Math.max(page, 1) - 1) / slotSize) * slotSize + 1
);

export const PageHeader = ({ eyebrow, title, description, countLabel, actions, className }) => (
    <div className={className}>
        <div>
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            <h2>{title}</h2>
            {description && <p className="page-description">{description}</p>}
        </div>
        {countLabel && <span className="list-page-count">{countLabel}</span>}
        {actions && <div className="detail-page-actions">{actions}</div>}
    </div>
);

export const SearchToolbar = ({
    createClassName,
    createLabel,
    onCreate,
    onSearch,
    placeholder,
    searchLabel,
    value,
    onChange,
}) => (
    <form
        className="search-container"
        onSubmit={(event) => {
            event.preventDefault();
            onSearch();
        }}
    >
        <div className="search-bar">
            <input
                type="text"
                aria-label={searchLabel}
                placeholder={placeholder}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
            <Button type="submit" variant="search" icon="search">
                Cerca
            </Button>
            <Button type="button" className={createClassName} variant={null} icon="plus" onClick={onCreate}>
                {createLabel}
            </Button>
        </div>
    </form>
);

export const SortableHeader = ({ align, field, label, sortField, sortOrder, onSort }) => {
    const isActive = sortField === field;
    const indicator = isActive ? (sortOrder === 'asc' ? '▲' : '▼') : '';

    return (
        <th className={align === 'right' ? 'cell-right' : undefined} onClick={() => onSort(field)}>
            {label} {indicator}
        </th>
    );
};

export const TableStateRow = ({ children, colSpan }) => (
    <tr className="table-state-row">
        <td colSpan={colSpan}>{children}</td>
    </tr>
);

export const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    slotSize = DEFAULT_SLOT_SIZE,
}) => {
    const [slotStart, setSlotStart] = useState(() => getSlotStartForPage(currentPage, slotSize));
    const lastSlotStart = getSlotStartForPage(totalPages, slotSize);

    useEffect(() => {
        setSlotStart((currentStart) => {
            if (currentPage < currentStart || currentPage >= currentStart + slotSize) {
                return getSlotStartForPage(currentPage, slotSize);
            }

            return Math.min(currentStart, lastSlotStart);
        });
    }, [currentPage, lastSlotStart, slotSize]);

    const pages = [];
    for (let page = slotStart; page < slotStart + slotSize && page <= totalPages; page += 1) {
        pages.push(page);
    }

    return (
        <div className="pagination">
            <Button
                type="button"
                variant="prev"
                icon="arrowLeft"
                onClick={() => setSlotStart((start) => Math.max(start - slotSize, 1))}
                disabled={slotStart === 1}
            />
            {pages.map((page) => (
                <button
                    type="button"
                    key={page}
                    className={`page-button ${currentPage === page ? 'active' : ''}`}
                    onClick={() => onPageChange(page)}
                >
                    {page}
                </button>
            ))}
            <Button
                type="button"
                variant="next"
                icon="arrowRight"
                onClick={() => setSlotStart((start) => Math.min(start + slotSize, lastSlotStart))}
                disabled={slotStart >= lastSlotStart}
            />
        </div>
    );
};

// Filtri predefiniti della lista: poche scelte, quelle che si usano davvero.
// La vista attiva vive nell'indirizzo, quindi il collegamento e condivisibile e
// il tasto "indietro" del browser funziona come ci si aspetta.
export const ViewFilters = ({ views = [], activeView = '', onChange, allLabel = 'Tutte' }) => {
    if (!views.length) {
        return null;
    }

    const opzioni = [{ value: '', label: allLabel }, ...views];

    return (
        <div className="view-filters" role="group" aria-label="Filtri">
            {opzioni.map((opzione) => {
                const attiva = opzione.value === activeView;

                return (
                    <button
                        type="button"
                        key={opzione.value || 'tutte'}
                        className={`view-filter${attiva ? ' is-active' : ''}`}
                        aria-pressed={attiva}
                        onClick={() => onChange(opzione.value)}
                    >
                        {opzione.label}
                    </button>
                );
            })}
        </div>
    );
};
