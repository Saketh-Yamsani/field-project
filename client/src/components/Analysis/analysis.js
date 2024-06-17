import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import './analysis.css'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Register necessary components and scales
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Analysis() {
  const [studentsData, setStudentsData] = useState([]);
  const [top5Stipend, setTop5Stipend] = useState([]);
  const [least5Stipend, setLeast5Stipend] = useState([]);
  const [topCompaniesByStipend, setTopCompaniesByStipend] = useState([]);
  const [companyHighStipend, setCompanyHighStipend] = useState(null);
  const [companyLowStipend, setCompanyLowStipend] = useState(null);
  const [top5Duration, setTop5Duration] = useState([]);
  const [least5Duration, setLeast5Duration] = useState([]);
  const [companyHighDuration, setCompanyHighDuration] = useState(null);
  const [companyLowDuration, setCompanyLowDuration] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const componentRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/faculty-api/fetch");
        const students = response.data;
        console.log("Fetched data:", students);
        setStudentsData(students);

        calculateTop5Stipend(students);
        calculateLeast5Stipend(students);
        calculateTopCompaniesByStipend(students);
        calculateTop5Duration(students);
        calculateLeast5Duration(students);
        calculateTopCompaniesByDuration(students);
        calculateTrendData(students);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const calculateTop5Stipend = (data) => {
    const sortedByStipend = data.slice().sort((a, b) => b["Monthly Stipend"] - a["Monthly Stipend"]);
    const top5 = sortedByStipend.slice(0, 5);
    console.log("Top 5 Stipend:", top5);
    setTop5Stipend(top5);
  };

  const calculateLeast5Stipend = (data) => {
    const sortedByStipend = data.slice().sort((a, b) => a["Monthly Stipend"] - b["Monthly Stipend"]);
    const least5 = sortedByStipend.slice(0, 5);
    console.log("Least 5 Stipend:", least5);
    setLeast5Stipend(least5);
  };

  const calculateTopCompaniesByStipend = (data) => {
    const companies = {};
    data.forEach((item) => {
      const company = item["Internship Offered Company Name"];
      if (!companies[company]) {
        companies[company] = {
          company,
          totalStipend: 0,
          count: 0,
        };
      }
      companies[company].totalStipend += item["Monthly Stipend"] || 0;
      companies[company].count++;
    });

    const topCompanies = Object.values(companies)
      .sort((a, b) => (b.totalStipend / b.count) - (a.totalStipend / a.count))
      .slice(0, 5);
    console.log("Top Companies by Stipend:", topCompanies);
    setTopCompaniesByStipend(topCompanies);

    const companyHigh = Object.values(companies).sort((a, b) => (b.totalStipend / b.count) - (a.totalStipend / a.count))[0];
    const companyLow = Object.values(companies).sort((a, b) => (a.totalStipend / a.count) - (b.totalStipend / b.count))[0];
    console.log("Company with Highest Stipend:", companyHigh);
    console.log("Company with Lowest Stipend:", companyLow);
    setCompanyHighStipend(companyHigh);
    setCompanyLowStipend(companyLow);
  };

  const calculateTop5Duration = (data) => {
    const sortedByDuration = data.slice().sort((a, b) => b["Duration"] - a["Duration"]);
    const top5 = sortedByDuration.slice(0, 5);
    console.log("Top 5 Duration:", top5);
    setTop5Duration(top5);
  };

  const calculateLeast5Duration = (data) => {
    const sortedByDuration = data.slice().sort((a, b) => a["Duration"] - b["Duration"]);
    const least5 = sortedByDuration.slice(0, 5);
    console.log("Least 5 Duration:", least5);
    setLeast5Duration(least5);
  };

  const calculateTopCompaniesByDuration = (data) => {
    const companies = {};
  
    // Accumulate total duration for each company
    data.forEach((item) => {
      const company = item["Internship Offered Company Name"];
      const duration = parseFloat(item["Duration"]);
  
      if (!companies[company]) {
        companies[company] = {
          company,
          totalDuration: 0,
        };
      }
  
      // Check if duration is a valid number
      if (!isNaN(duration)) {
        companies[company].totalDuration += duration;
      }
    });
  
    // Convert companies object to an array
    const companiesArray = Object.values(companies);
  
    // Sort companies based on total duration
    companiesArray.sort((a, b) => b.totalDuration - a.totalDuration);
  
    // Get company with highest and lowest total duration
    const companyHigh = companiesArray[0];
    const companyLow = companiesArray[companiesArray.length - 1];
  
    console.log("Company with Highest Duration:", companyHigh);
    console.log("Company with Lowest Duration:", companyLow);
  
    // Assuming setCompanyHighDuration and setCompanyLowDuration are functions to set state or perform some action
    setCompanyHighDuration(companyHigh);
    setCompanyLowDuration(companyLow);
  };
  
  
  

  const calculateTrendData = (data) => {
    const trends = {};
    data.forEach((item) => {
      const date = new Date(item["Starting Date"]);
      const year = date.getFullYear();
      if (!trends[year]) {
        trends[year] = {
          year,
          totalStipend: 0,
          totalDuration: 0,
          count: 0,
        };
      }
      trends[year].totalStipend += item["Monthly Stipend"] || 0;
      trends[year].totalDuration += item["Duration"] || 0;
      trends[year].count++;
    });
    const trendValues = Object.values(trends)
      .map((entry) => ({
        year: entry.year,
        averageStipend: entry.totalStipend / entry.count,
        averageDuration: entry.totalDuration / entry.count,
      }))
      .sort((a, b) => a.year - b.year);
    console.log("Trend Data:", trendValues);
    setTrendData(trendValues);
  };

  const getTrendChartDatasets = () => {
    const years = trendData.map((entry) => entry.year);
    const avgStipendData = trendData.map((entry) => entry.averageStipend);
    const avgDurationData = trendData.map((entry) => entry.averageDuration);

    return {
      labels: years,
      datasets: [
        {
          label: "Average Stipend",
          data: avgStipendData,
          fill: false,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
        },
        {
          label: "Average Duration",
          data: avgDurationData,
          fill: false,
          borderColor: "rgba(153, 102, 255, 1)",
          backgroundColor: "rgba(153, 102, 255, 0.2)",
        },
      ],
    };
  };

  const handleDownload = () => {
    const input = document.getElementById('analysis-pdf');
    html2canvas(input)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const width = pdf.internal.pageSize.getWidth();
        const height = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, 'PNG', 0, 0, width, height);
        pdf.save('analysis.pdf');
      });
  };

  return (
    <div className="container">
      <h2 className="mb-4">Internship Analysis</h2>

      <button className="btn btn-primary mb-3" onClick={handleDownload}>
        Download Analysis
      </button>
      <div ref={componentRef} id="analysis-pdf">
      {/* Top 5 Stipends */}
      <div className="analysis-sections">
        <div className="analysis-section mb-4">
          <h3>Top 5 Stipends</h3>
          <ul>
            {top5Stipend.map((student, index) => (
              <li key={index}>
                {student.Name} - {student["Monthly Stipend"]}
              </li>
            ))}
          </ul>
        </div>

        {/* Least 5 Stipends */}
        <div className="analysis-section mb-4">
          <h3>Least 5 Stipends</h3>
          <ul>
            {least5Stipend.map((student, index) => (
              <li key={index}>
                {student.Name} - {student["Monthly Stipend"]}
              </li>
            ))}
          </ul>
        </div>

        {/* Top Companies by Average Stipend */}
        <div className="analysis-section mb-4">
          <h3>Top Companies by Average Stipend</h3>
          <ul>
            {topCompaniesByStipend.map((company, index) => (
              <li key={index}>
                {company.company} - Average Stipend: {company.totalStipend / company.count}
              </li>
            ))}
          </ul>
        </div>

        {/* Company with Highest and Lowest Stipend */}
        <div className="analysis-section mb-4">
          <h3>Company with Highest Stipend</h3>
          {companyHighStipend && (
            <p>
              {companyHighStipend.company} - Average Stipend: {companyHighStipend.totalStipend / companyHighStipend.count}
            </p>
          )}
          <h3>Company with Lowest Stipend</h3>
          {companyLowStipend && (
            <p>
              {companyLowStipend.company} - Average Stipend: {companyLowStipend.totalStipend / companyLowStipend.count}
            </p>
          )}
        </div>

        {/* Top 5 Durations */}
        <div className="analysis-section mb-4">
          <h3>Top 5 Durations</h3>
          <ul>
            {top5Duration.map((student, index) => (
              <li key={index}>
                {student.Name} - {student.Duration} months
              </li>
            ))}
          </ul>
        </div>

        {/* Least 5 Durations */}
        <div className="analysis-section mb-4">
          <h3>Least 5 Durations</h3>
          <ul>
            {least5Duration.map((student, index) => (
              <li key={index}>
                {student.Name} - {student.Duration} months
              </li>
            ))}
          </ul>
        </div>

        {/* Company with Highest and Lowest Duration */}
        <div className="analysis-section mb-4">
          <h3>Company with Highest Duration</h3>
          {companyHighDuration && (
            <p>
              {companyHighDuration.company} - Average Duration: {companyHighDuration.totalDuration / companyHighDuration.count} months
            </p>
          )}
          <h3>Company with Lowest Duration</h3>
          {companyLowDuration && (
            <p>
              {companyLowDuration.company} - Average Duration: {companyLowDuration.totalDuration / companyLowDuration.count} months
            </p>
          )}
        </div>

        {/* Trends Over Time */}
        <div className="analysis-section mb-4 chart-container">
          <h3>Trends Over Time</h3>
          <Line data={getTrendChartDatasets()} />
        </div>
      </div>
    </div>
    </div>
  );
}

export default Analysis;
