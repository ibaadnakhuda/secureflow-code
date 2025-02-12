import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    return (
        <nav className="navbar">
            <ul>
                <li>
                    <Link to='/'>Home</Link>
                </li>
                <li>
                    <Link to="/encryption">Encryption</Link>
                </li>
                <li>
                    <Link to="/decryption">Decryption</Link>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;
