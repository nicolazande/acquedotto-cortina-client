import React, { useState } from 'react';
import ListinoList from '../components/Listino/ListinoList';
import '../styles/Listino/ListinoPage.css';

const ListinoPage = () => {
    const [, setSelectedListinoId] = useState(null);

    const handleListinoSelect = (listinoId) => {
        setSelectedListinoId(listinoId);
    };

    return (
        <div className="listino-page">
            <ListinoList
                onSelectListino={handleListinoSelect}
            />
        </div>
    );
};

export default ListinoPage;
