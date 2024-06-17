import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function Home() {
  const [file, setFile] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]); // State for columns
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first.");

    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      let jsonData = XLSX.utils.sheet_to_json(sheet);

      // Generate unique ids for each row
      jsonData = jsonData.map((entry, index) => ({
        id: index + 1, // Assuming index starts from 1
        ...entry,
      }));

      console.log(jsonData);

      try {
        const res = await axios.post("http://localhost:5000/faculty-api/upload", jsonData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log(res.data);
        setIsUploaded(true);
        // Redirect to dashboard after successful upload
        navigate('/dashboard');
      } catch (error) {
        console.error("Error uploading data:", error);
        alert("Failed to upload data.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="container mt-5">
      <h2>Home</h2>
      {!isUploaded ? (
        <div className="mb-4">
          <input type="file" className="form-control" onChange={handleFileChange} />
          <div className="text-end mb-3 mt-3">
            <button className="btn btn-primary" onClick={handleUpload}>Upload</button>
          </div>
        </div>
      ) : (
        // Render nothing if uploaded successfully and redirected
        null
      )}
    </div>
  );
}

export default Home;
