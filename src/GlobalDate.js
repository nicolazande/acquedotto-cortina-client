// src/setupGlobalDate.js

const originalToLocaleDateString = Date.prototype.toLocaleDateString;

Date.prototype.toLocaleDateString = function (locale, options) {
    const defaultLocale = locale || 'it-IT';
    const defaultOptions = options || {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    };

    return originalToLocaleDateString.call(this, defaultLocale, defaultOptions);
};
