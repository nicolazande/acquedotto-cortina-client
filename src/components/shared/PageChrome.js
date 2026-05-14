import React, { useEffect, useState } from 'react';
import Icon from './Icon';

const DEFAULT_SLOT_SIZE = 10;

const getSlotStartForPage = (page, slotSize) => (
    Math.floor((Math.max(page, 1) - 1) / slotSize) * slotSize + 1
);

export const PageHeader = ({ eyebrow, title, countLabel, actions, className }) => (
    <div className={className}>
        <div>
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            <h2>{title}</h2>
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
            <button type="submit" className="btn btn-search">
                <Icon name="search" />
                Cerca
            </button>
            <button type="button" className={createClassName} onClick={onCreate}>
                <Icon name="plus" />
                {createLabel}
            </button>
        </div>
    </form>
);

export const SortableHeader = ({ field, label, sortField, sortOrder, onSort }) => {
    const isActive = sortField === field;
    const indicator = isActive ? (sortOrder === 'asc' ? '▲' : '▼') : '';

    return (
        <th onClick={() => onSort(field)}>
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
            <button
                type="button"
                className="btn btn-prev"
                onClick={() => setSlotStart((start) => Math.max(start - slotSize, 1))}
                disabled={slotStart === 1}
            >
                <Icon name="arrowLeft" />
            </button>
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
            <button
                type="button"
                className="btn btn-next"
                onClick={() => setSlotStart((start) => Math.min(start + slotSize, lastSlotStart))}
                disabled={slotStart >= lastSlotStart}
            >
                <Icon name="arrowRight" />
            </button>
        </div>
    );
};
