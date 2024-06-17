import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function RootLayout({ children }) {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('token'); // Remove token from local storage or clear authentication state
    navigate('/signin'); // Redirect to sign-in page
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container">
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/home">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/analysis">Analysis</Link>
              </li>
              {/* Add more navigation links as needed */}
            </ul>
            <div>
              <button className="btn btn-danger" onClick={handleSignOut}>Sign Out</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="container mt-3">
        {children}
      </div>
    </div>
  );
}

export default RootLayout;
