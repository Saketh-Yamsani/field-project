import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import SearchBar from "../search/search";
import './dashboard.css';
import { useHistory, useNavigate } from "react-router-dom";

function Dashboard() {
    const [file, setFile] = useState(null);
    const [studentsData, setStudentsData] = useState([]);
    const [token, setToken] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [minSalary, setMinSalary] = useState('');
    const [maxSalary, setMaxSalary] = useState('');
    const [duration, setDuration] = useState('');
    const [isUploaded, setIsUploaded] = useState(false);

    const history = useNavigate();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return alert("Please select a file first.");

        const reader = new FileReader();
        reader.onload = async (e) => {
            const arrayBuffer = e.target.result;
            const data = new Uint8Array(arrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            let jsonData = XLSX.utils.sheet_to_json(sheet);

            jsonData = jsonData.map(entry => {
                delete entry.Timestamp;
                return entry;
            });

            console.log(jsonData);

            try {
                await axios.post("http://localhost:5000/faculty-api/upload", jsonData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                alert("Data uploaded successfully.");
                setIsUploaded(true);
                fetchData();
            } catch (error) {
                console.error("Error uploading data:", error);
                alert("Failed to upload data.");
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const fetchData = async () => {
        try {
            const response = await axios.get("http://localhost:5000/faculty-api/fetch", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setStudentsData(response.data);
            console.log("Students data:", response.data);
        } catch (error) {
            console.error("Error getting student details:", error);
            alert("Failed to get student details.");
        }
    };

    const fetchFilteredData = async () => {
        try {
            const response = await axios.get("http://localhost:5000/faculty-api/fetch-filtered", {
                params: {
                    sortField,
                    sortOrder,
                    minSalary,
                    maxSalary,
                    duration,
                    search: searchTerm
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setStudentsData(response.data);
            console.log("Filtered students data:", response.data);
        } catch (error) {
            console.error("Error getting filtered student details:", error);
            alert("Failed to get filtered student details.");
        }
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        if (term === "") {
            fetchData(); // Fetch all data if search term is empty
        } else {
            fetchFilteredData(); // Fetch filtered data if search term is not empty
        }
    };

    const handleSort = (field) => {
        setSortField(field);
    };

    const handleSortOrder = (order) => {
        setSortOrder(order);
    };

    const handleFilterMinSalary = (min) => {
        setMinSalary(min);
    };

    const handleFilterMaxSalary = (max) => {
        setMaxSalary(max);
    };

    const handleFilterDuration = (duration) => {
        setDuration(duration);
    };

    const handleSignOut = () => {
        localStorage.removeItem('token');
        history('/signin'); // Adjust the path to your sign-in page
    };

    return (
        <div className="container">
            <div className="row justify-content-between mt-3">
                <div className="col-lg-10">
                    <h2>Dashboard</h2>
                </div>
                <div className="col-lg-2 text-end">
                    <button className="btn btn-danger" onClick={handleSignOut}>Sign Out</button>
                </div>
            </div>
            <div className="row justify-content-center mt-5">
                <div className="col-lg-10">
                    <div className="card shadow">
                        <div className="card-body">
                            {!isUploaded ? (
                                <div className="mb-4">
                                    <input type="file" className="form-control" onChange={handleFileChange} />
                                    <div className="text-end mb-3 mt-3">
                                        <button className="btn btn-primary" onClick={handleUpload}>Upload</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* SearchBar component */}
                                    <SearchBar searchTerm={searchTerm} setSearchTerm={handleSearch} />
                                    <div className="mb-3">
                                        <select className="form-control" value={sortField} onChange={(e) => handleSort(e.target.value)}>
                                            <option value="">Sort By</option>
                                            <option value="Name">Name</option>
                                            <option value="Stipend">Stipend</option>
                                            <option value="Duration">Duration</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <select className="form-control" value={sortOrder} onChange={(e) => handleSortOrder(e.target.value)}>
                                            <option value="asc">Ascending</option>
                                            <option value="desc">Descending</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <input type="text" className="form-control" placeholder="Enter min salary" value={minSalary} onChange={(e) => handleFilterMinSalary(e.target.value)} />
                                    </div>
                                    <div className="mb-3">
                                        <input type="text" className="form-control" placeholder="Enter max salary" value={maxSalary} onChange={(e) => handleFilterMaxSalary(e.target.value)} />
                                    </div>
                                    <div className="mb-3">
                                        <input type="text" className="form-control" placeholder="Enter duration" value={duration} onChange={(e) => handleFilterDuration(e.target.value)} />
                                    </div>
                                    <div className="d-flex justify-content-between mb-3">
                                        <button className="btn btn-primary" onClick={fetchFilteredData}>Apply Filters</button>
                                        <button className="btn btn-secondary" onClick={fetchData}>Get All Details</button>
                                    </div>
                                    <div>
                                        <h4>Students Data</h4>
                                        <table className="table table-striped">
                                            <thead>
                                                <tr>
                                                    {studentsData.length > 0 && Object.keys(studentsData[0]).map((key) => (
                                                        <th key={key}>{key}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {studentsData.length > 0 ? (
                                                    studentsData.map((student, index) => (
                                                        <tr key={index}>
                                                            {Object.values(student).map((value, idx) => (
                                                                <td key={idx}>{value}</td>
                                                            ))}
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={Object.keys(studentsData[0] || {}).length}>No data found</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
