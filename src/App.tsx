import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex space-x-4 items-center">
                <Link to="/" className="text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium">
                  Recipe Manager
                </Link>
                <Link to="/ingredients" className="text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium">
                  Ingredients
                </Link>
                <Link to="/recipes" className="text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium">
                  Recipes
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<div>Welcome to Recipe Manager</div>} />
            <Route path="/ingredients" element={<div>Ingredients Management</div>} />
            <Route path="/recipes" element={<div>Recipes Management</div>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;