import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Form.css';
import Navbar from './Navbar';

function Encryption() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('No file selected');
  const [isLoading, setIsLoading] = useState(false);
  const [info, setInfo] = useState({}); // To store encryption info

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setFileName(e.target.files[0] ? e.target.files[0].name : 'No file selected');
  };

  const handleEncrypt = async () => {
    if (!file) {
      toast.error('Please select a file.');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5000/encrypt', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName.replace(/\.[^/.]+$/, "") + '_encrypted.png';
        a.click();
        URL.revokeObjectURL(url);

        // Fetch performance metrics
        const metricsResponse = await fetch('http://localhost:5000/performance-metrics');
        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json();
          setInfo({
            totalTime: metricsData.totalTime,
            memoryUsage: metricsData.memoryUsage
          });
          setTimeout(() => setInfo({}), 10000); // Hide info after 10 seconds
        } else {
          toast.error('Error fetching performance metrics.');
        }

        toast.success('File encrypted successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error);
      }
    } catch (error) {
      toast.error('Error encrypting file.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="back">
      <Navbar />
      <h1>SecureFlow</h1>
      <p className="subtitle">Your data, encrypted and secure.</p>
      <div className="form">
        <div className="file-input-container" data-file-name={fileName}>
          <input type="file" onChange={handleFileChange} />
        </div>
        <button onClick={handleEncrypt}>
          ENCRYPT
        </button>
        {isLoading && <div className="spinner"></div>}
      </div>
      <div className="info-panel">
        <h2>How It Works</h2>
        <p>1. Select a file to encrypt.</p>
        <p>2. Click the "ENCRYPT" button.</p>
        <p>3. Download the encrypted file when the process completes.</p>
        <p>4. Ensure your file is in a supported format.</p>
      </div>
      {info.totalTime && (
        <div className="info">
          <h2>Encryption Info</h2>
          <p>Total Time: {info.totalTime.toFixed(2)} seconds</p>
          <p>Memory Usage: {(info.memoryUsage[1] / 1024).toFixed(2)} KB</p>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

export default Encryption;
