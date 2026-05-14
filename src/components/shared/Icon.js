import React from 'react';

const iconPaths = {
    admin: ['M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z', 'M4 21a8 8 0 0 1 16 0', 'M18 8h3', 'M19.5 6.5v3'],
    arrowLeft: ['M15 18 9 12l6-6'],
    arrowRight: ['m9 18 6-6-6-6'],
    article: ['M4 7h16', 'M4 12h11', 'M4 17h8'],
    building: ['M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16', 'M9 7h1', 'M14 7h1', 'M9 11h1', 'M14 11h1', 'M9 21v-5h6v5'],
    calendar: ['M7 3v3', 'M17 3v3', 'M4 8h16', 'M5 5h14a1 1 0 0 1 1 1v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1Z'],
    check: ['m5 12 4 4L19 6'],
    dashboard: ['M4 4h7v7H4Z', 'M13 4h7v5h-7Z', 'M13 11h7v9h-7Z', 'M4 13h7v7H4Z'],
    edit: ['M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16Z', 'm13 7 4 4'],
    eye: ['M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'],
    gauge: ['M4 14a8 8 0 1 1 16 0', 'm12 14 4-4', 'M6 18h12'],
    invoice: ['M6 3h12v18l-3-2-3 2-3-2-3 2Z', 'M9 8h6', 'M9 12h6', 'M9 16h4'],
    layers: ['m12 3 9 5-9 5-9-5Z', 'm3 12 9 5 9-5', 'm3 16 9 5 9-5'],
    list: ['M8 6h12', 'M8 12h12', 'M8 18h12', 'M4 6h.01', 'M4 12h.01', 'M4 18h.01'],
    plus: ['M12 5v14', 'M5 12h14'],
    reading: ['M5 4h14v16H5Z', 'M9 8h6', 'M9 12h6', 'M9 16h3'],
    search: ['M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z', 'm16 16 4 4'],
    service: ['M14 7 7 14', 'm8 6 2-2 4 4-2 2Z', 'm16 14 2 2-4 4-2-2Z'],
    tag: ['M20 13 13 20 4 11V4h7Z', 'M8 8h.01'],
    trash: ['M4 7h16', 'M10 11v6', 'M14 11v6', 'M6 7l1 14h10l1-14', 'M9 7V4h6v3'],
    users: ['M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M2 21a7 7 0 0 1 14 0', 'M17 11a3 3 0 1 0 0-6', 'M19 21a5 5 0 0 0-4-4.9'],
};

const Icon = ({ name, className = '', size = 16 }) => (
    <svg
        aria-hidden="true"
        className={`icon ${className}`.trim()}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        focusable="false"
    >
        {(iconPaths[name] || iconPaths.dashboard).map((path) => <path d={path} key={path} />)}
    </svg>
);

export default Icon;
