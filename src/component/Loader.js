import React from 'react';
import './Loader.css';

const Loader = () => {
    return (
        <div className="loader-container">
            <div className="cricket-ball">
                <div className="seam"></div>
            </div>
            <div className="loader-shadow"></div>
            <div className="loader-text">Loading Box Cricket...</div>
        </div>
    );
};

export default Loader;
