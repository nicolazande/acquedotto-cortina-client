import React from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';

const classes = (...items) => items.filter(Boolean).join(' ');
const hasClass = (className, name) => className.split(/\s+/).includes(name);

const buttonClasses = (variant, className) => classes(
    hasClass(className, 'btn') ? null : 'btn',
    variant ? `btn-${variant}` : null,
    className
);

const ButtonContent = ({ children, icon }) => (
    <>
        {icon && <Icon name={icon} />}
        {children}
    </>
);

const Button = ({
    as,
    children,
    className = '',
    href,
    icon,
    to,
    type = 'button',
    variant = 'primary',
    ...props
}) => {
    const resolvedClassName = buttonClasses(variant, className);
    const content = <ButtonContent icon={icon}>{children}</ButtonContent>;

    if (to) {
        return (
            <Link className={resolvedClassName} to={to} {...props}>
                {content}
            </Link>
        );
    }

    if (href) {
        return (
            <a className={resolvedClassName} href={href} {...props}>
                {content}
            </a>
        );
    }

    if (as === 'label') {
        return (
            <label className={resolvedClassName} {...props}>
                {content}
            </label>
        );
    }

    return (
        <button type={type} className={resolvedClassName} {...props}>
            {content}
        </button>
    );
};

export const ActionBar = ({ children, className = 'btn-container' }) => (
    <div className={className}>{children}</div>
);

export default Button;
