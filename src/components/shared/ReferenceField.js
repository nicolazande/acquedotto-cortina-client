import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    getReferenceLabel,
    getReferencePlaceholder,
    getReferenceRecordId,
    loadReferenceOptions,
} from '../../config/referenceResources';
import Button from './Button';

const mergeReferenceOptions = (...recordGroups) => {
    const options = [];
    const seenIds = new Set();

    recordGroups.forEach((records) => {
        const group = Array.isArray(records) ? records : [records];

        group.forEach((record) => {
            const id = getReferenceRecordId(record);

            if (!id || seenIds.has(id)) {
                return;
            }

            seenIds.add(id);
            options.push(record);
        });
    });

    return options;
};

const ReferenceField = ({
    field,
    isReadOnly,
    onReferenceChange,
    selectedReference,
    value,
}) => {
    const resultListRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [options, setOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [activeSearch, setActiveSearch] = useState('');

    const fetchOptions = useCallback(async ({
        openPicker = false,
        page = 1,
        search = '',
    } = {}) => {
        if (openPicker) {
            setIsPickerOpen(true);
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await loadReferenceOptions(field.resource, search, page);
            setOptions(result.records);
            setCurrentPage(result.currentPage);
            setTotalItems(result.totalItems);
            setTotalPages(result.totalPages);
            setActiveSearch(search);
        } catch (loadError) {
            setError('Impossibile caricare i record collegabili.');
            console.error(loadError);
        } finally {
            setIsLoading(false);
        }
    }, [field.resource]);

    useEffect(() => {
        fetchOptions();
    }, [fetchOptions]);

    useEffect(() => {
        if (isPickerOpen && resultListRef.current) {
            resultListRef.current.scrollTo({ top: 0 });
        }
    }, [currentPage, isPickerOpen]);

    const fieldOptions = mergeReferenceOptions(selectedReference, options);
    const selectedOption = fieldOptions.find((record) => getReferenceRecordId(record) === value);
    const selectedLabel = selectedOption ? getReferenceLabel(field.resource, selectedOption) : '';
    const hasPreviousResults = currentPage > 1;
    const hasMoreResults = currentPage < totalPages;
    const resultCountLabel = isLoading
        ? 'Caricamento...'
        : `${totalItems} risultati - pagina ${currentPage} di ${totalPages}`;

    const handleSearch = () => {
        fetchOptions({ search: searchTerm, openPicker: true });
    };

    const handleSearchKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSearch();
        }
    };

    const handleSelect = (record) => {
        onReferenceChange(field, getReferenceRecordId(record), record);
        setIsPickerOpen(false);
    };

    const handleClear = () => {
        onReferenceChange(field, '', null);
        setIsPickerOpen(false);
    };

    const handlePageChange = (page) => {
        fetchOptions({
            openPicker: true,
            page,
            search: activeSearch,
        });
    };

    return (
        <div className="reference-field">
            <input type="hidden" name={field.name} value={value || ''} readOnly />
            <div className="reference-selected">
                <span className={selectedLabel ? 'reference-selected-label' : 'reference-selected-empty'}>
                    {selectedLabel || (value ? 'Record selezionato' : 'Nessun collegamento')}
                </span>
                {!isReadOnly && value && (
                    <button
                        type="button"
                        className="reference-clear"
                        onClick={handleClear}
                    >
                        Svuota
                    </button>
                )}
            </div>
            {!isReadOnly && (
                <div className="reference-search-row">
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        placeholder={getReferencePlaceholder(field.resource)}
                    />
                    <Button
                        type="button"
                        variant="search"
                        icon="search"
                        onClick={handleSearch}
                        disabled={isLoading}
                    >
                        Cerca
                    </Button>
                </div>
            )}
            {isPickerOpen && !isReadOnly && (
                <div className="reference-results">
                    <div className="reference-results-header">
                        <span>{resultCountLabel}</span>
                        <button type="button" onClick={() => setIsPickerOpen(false)}>
                            Chiudi
                        </button>
                    </div>
                    {!isLoading && options.length === 0 && (
                        <div className="reference-result-empty">Nessun record trovato</div>
                    )}
                    {!isLoading && options.length > 0 && (
                        <div className="reference-result-list" ref={resultListRef}>
                            {options.map((option) => {
                                const optionId = getReferenceRecordId(option);
                                const isSelected = optionId === value;

                                return (
                                    <button
                                        type="button"
                                        className={`reference-result-option ${isSelected ? 'is-selected' : ''}`}
                                        onClick={() => handleSelect(option)}
                                        key={optionId}
                                    >
                                        {getReferenceLabel(field.resource, option)}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    {!isLoading && totalPages > 1 && (
                        <div className="reference-results-footer">
                            <button
                                type="button"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={!hasPreviousResults}
                            >
                                Precedenti
                            </button>
                            <span>Pagina {currentPage} / {totalPages}</span>
                            <button
                                type="button"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={!hasMoreResults}
                            >
                                Successivi
                            </button>
                        </div>
                    )}
                </div>
            )}
            {error && <span className="reference-field-error">{error}</span>}
        </div>
    );
};

export default ReferenceField;
