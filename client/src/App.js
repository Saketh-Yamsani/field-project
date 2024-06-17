import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signin from './components/signin/signin';
import Signup from './components/signup/signup';
import Dashboard from './components/dashboard/dashboard';
import Analysis from './components/Analysis/analysis';
import Home from './components/home/home';
import RootLayout from './components/layout/RootLayout';
import StudentAnalysis from './components/studentanalysis/studentanalysis';

function App() {
  return (
    <div className="App">
      <Router>
        <RootLayout>
          <Routes>
            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/home" element={<Home />} />
            <Route path="/student/:studentId" element={<StudentAnalysis />} />
            <Route path="/" element={<Signin />} />
          </Routes>
        </RootLayout>
      </Router>
    </div>
  );
}

export default App;
