export const EMPTY_VALUE = '-';

export const isEmptyValue = (value) => value === undefined || value === null || value === '';

export const text = (value) => (isEmptyValue(value) ? EMPTY_VALUE : value);

export const formatDate = (value) => (
    value ? new Date(value).toLocaleDateString('it-IT') : EMPTY_VALUE
);

export const formatMoney = (value) => (
    Number.isFinite(Number(value)) ? `${Number(value).toFixed(2)} \u20ac` : EMPTY_VALUE
);

export const boolText = (value) => (value ? 'Si' : 'No');

export const fullName = (record) => (
    record && typeof record === 'object'
        ? [record.nome, record.cognome].filter(Boolean).join(' ').trim()
        : EMPTY_VALUE
);

export const join = (...parts) => parts.filter((part) => !isEmptyValue(part)).join(' - ') || EMPTY_VALUE;

export const getPathValue = (record, path) => (
    path.split('.').reduce((value, key) => (value == null ? value : value[key]), record)
);

export const formatFieldValue = (record, field) => {
    const rawValue = typeof field.value === 'function'
        ? field.value(record) || EMPTY_VALUE
        : getPathValue(record, field.value);

    if (field.format) {
        return field.format(rawValue, record);
    }

    if (typeof rawValue === 'boolean') {
        return boolText(rawValue);
    }

    return text(rawValue);
};
