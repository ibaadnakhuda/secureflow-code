import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
    return (
        <div className="home">
            <div className="main-content">
                <h1>SecureFlow</h1>
                <p className="subtitle">Your data, encrypted and secure.</p>
                <div className='frame'>
                    <div className="buttons">
                        <Link to="/encryption">
                            <button id='b1'>ENCRYPTION</button>
                        </Link>
                        <Link to="/decryption">
                            <button id='b2'>DECRYPTION</button>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="info-panel">
                <h2>Welcome to SecureFlow</h2>
                <p>SecureFlow is your go-to solution for data encryption and decryption. Choose an option to either encrypt your sensitive data or decrypt previously encrypted files.</p>
                <p>Ensure to upload files in the correct format for smooth processing.</p>
                <p>For more details, visit our <a href="#">documentation</a> or contact support.</p>
            </div>
        </div>
    );
}

export default Home;
