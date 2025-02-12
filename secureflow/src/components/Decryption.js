import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Form.css';
import Navbar from './Navbar';

function Decryption() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('No file selected');
  const [isLoading, setIsLoading] = useState(false); // Manage spinner visibility

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setFileName(e.target.files[0] ? e.target.files[0].name : 'No file selected');
  };

  const handleDecrypt = async () => {
    if (!file) {
      toast.error('Please select a file.');
      return;
    }

    setIsLoading(true); // Show spinner

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/decrypt', {
          method: 'POST',
          body: formData,
      });
      //const data = await response.json();
      if (response.ok) {
          const contentDisposition = response.headers.get('Content-Disposition');
          const contentType = response.headers.get('Content-Type');
          //console.log(data);
          // Extract filename from Content-Disposition header
          const filename = contentDisposition
              ? contentDisposition.split('filename=')[1].replace(/"/g, '')
              : 'decrypted_file';
  
          // Determine the file type based on the Content-Type header
          let downloadFileName = filename;
          // if (contentType === 'application/pdf') {
          //   const blob = await response.blob();
          //   const url = URL.createObjectURL(blob);
          //   const a = document.createElement('a');
          //   a.href = url;
          //   a.download = downloadFileName;
          //   document.body.appendChild(a);
          //   a.click();
          //   document.body.removeChild(a);
          //   URL.revokeObjectURL(url);
          //   toast.success('File decrypted successfully!');
          // }
        //  } else if (data.file_type==='xlsx') {
        //     const plaintext = data.plaintext;
        //     downloadFileName = data.output_file;
        //     let blobType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        //     const textBlob = new Blob([plaintext], { type: blobType });
        //     const url = URL.createObjectURL(textBlob);
        //     const a = document.createElement('a');
        //     a.href = url;
        //     a.download = downloadFileName + '.xlsx';
        //     document.body.appendChild(a);
        //     a.click();
        //     document.body.removeChild(a);
        //     URL.revokeObjectURL(url);
        //     toast.success('File decrypted successfully!');  
          // const blob = await response.blob();
            // downloadFileName += '.xlsx';
            // const url = URL.createObjectURL(blob);
            // const a = document.createElement('a');
            // a.href = url;
            // a.download = downloadFileName;
            // document.body.appendChild(a);
            // a.click();
            // document.body.removeChild(a);
            // URL.revokeObjectURL(url);
            // toast.success('File decrypted successfully!');

        // } else if (contentType === 'application/json') {
        //     const fileType = data.file_type;
        //     const plaintext = data.plaintext;
        //     downloadFileName = data.output_file;
        //     let blobType = 'text/plain;charset=utf-8';
            
        //     if (fileType === 'txt') {
        //         const textBlob = new Blob([plaintext], { type: blobType });
        //         const url = URL.createObjectURL(textBlob);
        //         const a = document.createElement('a');
        //         a.href = url;
        //         a.download = downloadFileName + '.txt';
        //         document.body.appendChild(a);
        //         a.click();
        //         document.body.removeChild(a);
        //         URL.revokeObjectURL(url);
        //         toast.success('File decrypted successfully!');
        //     }
        // }
          if (contentType === 'application/json') {
              // Handle JSON response for text files
              const data = await response.json();
              const fileType = data.file_type;
              downloadFileName = data.output_file;
  
              const blobType = fileType === 'txt' ? 'text/plain' : 'application/octet-stream';
              const textBlob = new Blob([data.plaintext], { type: blobType });
  
              const url = URL.createObjectURL(textBlob);
              const a = document.createElement('a');
              a.href = url;
              a.download = downloadFileName;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              toast.success('File decrypted successfully!');
          } else {
              // Handle other file types
              if (contentType.includes('application/pdf')) {
                  downloadFileName += '.pdf';
              } else if (contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
                  downloadFileName += '.xlsx';
              } 
              const blob = await response.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = downloadFileName;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              toast.success('File decrypted successfully!');
          }
      } else {
          toast.error('Error decrypting file.');
      }
  } catch (error) {
      toast.error('Error decrypting file.');
  } finally {
      setIsLoading(false); // Hide spinner
  }
  
  };

  return (
    <div className="back">
      <Navbar/>
      <h1>SecureFlow</h1>
      <p className="subtitle">Your data, encrypted and secure.</p>
      <div className="form">
        <div className="file-input-container" data-file-name={fileName}>
          <input type="file" onChange={handleFileChange} />
        </div>
        <button id="b12" onClick={handleDecrypt}>
          DECRYPT
        </button>
        {isLoading && <div className="spinner"></div>} {/* Show spinner */}
      </div>
      <div className="info-panel">
        <h2>How It Works</h2>
        <p>1. Select a file to decrypt.</p>
        <p>2. Click the "DECRYPT" button.</p>
        <p>3. Download the decrypted file when the process completes.</p>
        <p>4. Ensure your file is in a supported format (e.g., .pdf, .xlsx, .txt).</p>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Decryption;
