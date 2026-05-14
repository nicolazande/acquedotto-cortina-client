import { useCallback, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

const RETURN_TO_PARAM = 'returnTo';
const RETURN_LABEL_PARAM = 'returnLabel';

export const createContextBackSearch = (returnTo, returnLabel) => {
    const params = new URLSearchParams();

    if (returnTo) {
        params.set(RETURN_TO_PARAM, returnTo);
    }

    if (returnLabel) {
        params.set(RETURN_LABEL_PARAM, returnLabel);
    }

    const query = params.toString();
    return query ? `?${query}` : '';
};

const getBackLabel = (returnLabel, defaultLabel) => (
    returnLabel ? `Torna alla scheda ${returnLabel}` : defaultLabel
);

export const useContextBack = (fallbackPath, defaultLabel = 'Indietro') => {
    const history = useHistory();
    const location = useLocation();
    const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const returnTo = params.get(RETURN_TO_PARAM);
    const returnLabel = params.get(RETURN_LABEL_PARAM);

    const goBack = useCallback(() => {
        if (returnTo) {
            history.push(returnTo);
            return;
        }

        if (fallbackPath) {
            history.push(fallbackPath);
            return;
        }

        history.goBack();
    }, [fallbackPath, history, returnTo]);

    return {
        backLabel: getBackLabel(returnLabel, defaultLabel),
        goBack,
        returnTo,
    };
};
