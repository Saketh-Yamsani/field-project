import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function StudentAnalysis() {
  const { studentId } = useParams();
  const [studentData, setStudentData] = useState(null);
  const [allStudentsData, setAllStudentsData] = useState([]);
  const [stipendRank, setStipendRank] = useState('N/A');
  const [companyRank, setCompanyRank] = useState('N/A');
  const [durationRank, setDurationRank] = useState('N/A');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/faculty-api/student/${studentId}`);
        const student = response.data;
    
        console.log("Fetched student data:", JSON.stringify(student)); // Log stringified student data
    
        setStudentData(student);
        calculateRanks(student); // Calculate ranks on student data fetch
        calculateProgress(student); // Calculate progress on student data fetch
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };
    
    const fetchAllStudentsData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/faculty-api/fetch`);
        setAllStudentsData(response.data);
      } catch (error) {
        console.error("Error fetching all students data:", error);
      }
    };

    fetchStudentData();
    fetchAllStudentsData();
  }, [studentId]);

  const calculateRanks = (studentData) => {
    if (!studentData || !allStudentsData.length) return;

    const { "Monthly Stipend": stipend, Duration, "Internship Offered Company Name": company } = studentData;

    // Calculate Stipend Rank
    const allStipends = allStudentsData.map(student => parseInt(student["Monthly Stipend"], 10));
    const sortedStipends = allStipends.sort((a, b) => b - a); // Sort in descending order
    const stipendRank = sortedStipends.indexOf(parseInt(stipend, 10)) + 1;
    setStipendRank(stipendRank !== 0 ? stipendRank : 'N/A');

    // Calculate Company Rank
    const filteredStudentsByCompany = allStudentsData.filter(student => student["Internship Offered Company Name"] === company);
    const sortedCompanyStipends = filteredStudentsByCompany.map(student => parseInt(student["Monthly Stipend"], 10)).sort((a, b) => b - a);
    const companyRank = sortedCompanyStipends.indexOf(parseInt(stipend, 10)) + 1;
    setCompanyRank(companyRank !== 0 ? companyRank : 'N/A');

    // Calculate Duration Rank
    const allDurations = allStudentsData.map(student => parseInt(student.Duration, 10));
    const sortedDurations = allDurations.sort((a, b) => b - a); // Sort in descending order
    const durationRank = sortedDurations.indexOf(parseInt(Duration, 10)) + 1;
    setDurationRank(durationRank !== 0 ? durationRank : 'N/A');
  };

  const calculateProgress = async (studentData) => {
    try {
      const { "Monthly Stipend": stipend, Duration } = studentData;
      const maxStipend = 500000; // Assuming max stipend value for progress calculation
      const maxDuration = 12; // Assuming max duration value for progress calculation
      const stipendProgress = (parseInt(stipend, 10) / maxStipend) * 50; // Stipend contributes 50% to progress
      const durationProgress = (parseInt(Duration, 10) / maxDuration) * 50; // Duration contributes 50% to progress
      const totalProgress = stipendProgress + durationProgress;
      setProgress(totalProgress); // Assuming setProgress is a function to update state
    } catch (error) {
      console.error('Error calculating progress:', error);
    }
  };

  if (!studentData || !allStudentsData.length) {
    return <div>Loading...</div>;
  }

  const { Name, "Monthly Stipend": stipend, Duration, "Internship Offered Company Name": company } = studentData;

  const downloadPDF = async () => {
    try {
      const doc = new jsPDF();
      const element = document.getElementById('analysis-report');
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 size page width in mm
      const pageHeight = 295; // A4 size page height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      doc.save(`${Name}-analysis-report.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Student Analysis: {Name}</h2>
      <div id="analysis-report" className="row">
        <div className="col-md-6">
          <div className="analysis-section">
            <p><strong>Stipend:</strong> {stipend}</p>
            <p><strong>Stipend Rank:</strong> {stipendRank}</p>
            <p><strong>Company:</strong> {company}</p>
            <p><strong>Company Stipend Rank:</strong> {companyRank}</p>
            <p><strong>Duration:</strong> {Duration} months</p>
            <p><strong>Duration Rank:</strong> {durationRank}</p>
          </div>
        </div>
        <div className="col-md-6">
          <div className="progress mt-3">
            <div className="progress-bar" role="progressbar" style={{ width: `${progress}%` }} aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">{progress.toFixed(2)}%</div>
          </div>
          <button onClick={downloadPDF} className="btn btn-primary mt-3">Download Report as PDF</button>
        </div>
      </div>
    </div>
  );
}

export default StudentAnalysis;
