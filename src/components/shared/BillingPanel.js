import React from 'react';
import { delayFeeHelp, fixedChargeSelectionHelp } from '../../utils/billingPreview';

export const BillingActions = ({ children }) => (
    <div className="billing-preview-actions">{children}</div>
);

export const BillingState = ({ children }) => (
    <p className="billing-preview-state">{children}</p>
);

export const BillingOption = ({
    checked,
    disabled,
    help,
    label,
    onChange = () => {},
    readOnly = false,
}) => (
    <label className={`billing-preview-option ${disabled ? 'is-disabled' : ''} ${readOnly ? 'is-readonly' : ''}`}>
        <input
            type="checkbox"
            checked={checked}
            disabled={disabled}
            readOnly={readOnly}
            onChange={readOnly ? undefined : (event) => onChange(event.target.checked)}
        />
        <span>
            <strong>{label}</strong>
            {help && <small>{help}</small>}
        </span>
    </label>
);

// L'interruttore della quota fissa annuale. Compare nella generazione massiva e
// nella scheda del cliente con le stesse etichette e la stessa regola: e un solo
// concetto, non due caselle che si somigliano.
export const AnnualFixedChargeOption = ({ checked, onChange, rows = [], total }) => (
    <BillingOption
        checked={checked}
        disabled={rows.length === 0}
        help={fixedChargeSelectionHelp({ includeFixedCharge: checked, total })}
        label="Quota fissa annuale"
        onChange={onChange}
    />
);

// L'interruttore della mora, accanto a quello della quota fissa e con la stessa
// logica: dice a quanti clienti andrebbe e quanto vale, inclusa o no.
export const DelayFeeOption = ({ checked, clienti = 0, importo = 0, onChange }) => (
    <BillingOption
        checked={checked}
        disabled={clienti === 0}
        help={delayFeeHelp({ checked, clienti, importo })}
        label="Mora per i ritardi"
        onChange={onChange}
    />
);

// Un elenco di cose con il loro motivo: i clienti non fatturati, le bozze non
// confermate, le letture da guardare. Senza il motivo accanto resterebbero
// invisibili in mezzo a centinaia di righe. Ogni voce ha `titolo` e `motivo`, e
// un `tono` facoltativo (danger, warning, info).
export const BillingReasons = ({ items = [] }) => (
    items.length > 0 ? (
        <ul className="billing-reasons">
            {items.map((item, indice) => (
                <li className={item.tono ? `is-${item.tono}` : undefined} key={item.key || indice}>
                    <strong>{item.titolo}</strong>
                    <span>{item.motivo}</span>
                </li>
            ))}
        </ul>
    ) : null
);

export const BillingSummary = ({ items }) => (
    <div className="billing-preview-summary">
        {items.filter(Boolean).map((item) => (
            <span className={item.className} key={item.label}>
                <strong>{item.value}</strong>
                <small>{item.label}</small>
            </span>
        ))}
    </div>
);

export const BillingMeta = ({ items }) => {
    const visibleItems = items.filter(Boolean);

    if (visibleItems.length === 0) {
        return null;
    }

    return (
        <div className="billing-preview-meta">
            {visibleItems.map((item) => <span key={item}>{item}</span>)}
        </div>
    );
};

const BillingPanel = ({
    actions,
    children,
    className = '',
    error,
    eyebrow,
    isLoading,
    loadingText,
    title,
}) => (
    <section className={`billing-preview ${className}`.trim()}>
        <div className="billing-preview-heading">
            <div>
                <span className="eyebrow">{eyebrow}</span>
                <h3>{title}</h3>
            </div>
            {actions}
        </div>

        {isLoading && <BillingState>{loadingText}</BillingState>}
        {!isLoading && error && <BillingState>{error}</BillingState>}
        {!isLoading && !error && children}
    </section>
);

export default BillingPanel;
