import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import SearchBar from '../search/search';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import debounce from 'lodash/debounce';

function Dashboard() {
  const [studentsData, setStudentsData] = useState([]);
  const [token, setToken] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [columns, setColumns] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
    fetchStudentsData(); // Fetch initial data
  }, []);

  useEffect(() => {
    // Debounced search effect
    const debouncedFetchFilteredData = debounce(() => {
      if (searchTerm !== '') {
        fetchFilteredData();
      } else {
        fetchStudentsData();
      }
    }, 300);

    debouncedFetchFilteredData();

    return () => {
      debouncedFetchFilteredData.cancel();
    };
  }, [searchTerm]); // Re-run effect when searchTerm changes

  const fetchStudentsData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/faculty-api/fetch", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const filteredData = response.data.map(student => {
        const { _id, Timestamp, ...rest } = student;
        return rest;
      });

      setStudentsData(filteredData);

      if (filteredData.length > 0) {
        const firstRow = filteredData[0];
        const cols = Object.keys(firstRow).map((key) => ({
          field: key,
          headerName: key.toUpperCase(),
          width: 150,
          sortable: true,
          filterable: true,
        })).filter(col => col.field !== 'Timestamp' && col.field !== '_id');

        setColumns(cols);
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
      alert("Failed to fetch student details.");
    }
  };

  const fetchFilteredData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/faculty-api/fetch-filtered", {
        params: {
          search: searchTerm
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const filteredData = response.data.map(student => {
        const { _id, Timestamp, ...rest } = student;
        return rest;
      });

      setStudentsData(filteredData);

      if (filteredData.length > 0) {
        const firstRow = filteredData[0];
        const cols = Object.keys(firstRow).map((key) => ({
          field: key,
          headerName: key.toUpperCase(),
          width: 150,
          sortable: true,
          filterable: true,
        })).filter(col => col.field !== 'Timestamp' && col.field !== '_id');

        setColumns(cols);
      }
    } catch (error) {
      console.error("Error getting filtered student details:", error);
      alert("Failed to get filtered student details.");
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleRowClick = (params) => {
    navigate(`/student/${params.row.id}`); // Redirect to analysis page
  };

  return (
    <div className="container mt-5">
      <h2>Dashboard</h2>
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={studentsData}
          columns={columns}
          pageSize={10}
          onRowClick={handleRowClick} // Redirect on row click
        />
      </div>
    </div>
  );
}

export default Dashboard;
