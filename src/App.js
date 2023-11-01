import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import FormComponent from './FormComponent';
import ResultsPage from './ResultsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FormComponent />} />
        <Route path="/results" element={<ResultsPage />} />
        {/* Redirect to the results page after submitting the form */}
        <Route path="/submit" element={<Navigate to="/results" />} />
      </Routes>
    </Router>
  );
}

export default App;
