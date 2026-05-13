const normalizeApiBaseUrl = (value) => {
    if (!value) {
        return '';
    }

    return value.replace(/\/+$/, '').replace(/\/api$/, '');
};

export const API_BASE_URL = normalizeApiBaseUrl(process.env.REACT_APP_API_URL);

export const apiUrl = (resourcePath) => {
    const normalizedPath = resourcePath.replace(/^\/+/, '');
    return `${API_BASE_URL}/api/${normalizedPath}`;
};
