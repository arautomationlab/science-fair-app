import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ProjectSubmit from './pages/ProjectSubmit';
import JudgePanel from './pages/JudgePanel';
import AdminDashboard from './pages/AdminDashboard';
import Winners from './pages/Winners';
import PublicProject from './pages/PublicProject';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HeroBanner from './components/HeroBanner';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        
        <main className="flex-grow">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          
          <Routes>
            {/* Homepage with Hero Banner Only */}
            <Route path="/" element={
              <>
                <HeroBanner />
                <div className="max-w-7xl mx-auto px-4 py-12">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-700 mb-4">
                      🚀 Welcome to Spark 4.0
                    </h2>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                      Register your team, submit innovative projects, 
                      and compete for the top position in the Science Fair!
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                      <div className="bg-blue-50 p-6 rounded-lg max-w-xs flex-1">
                        <span className="text-4xl">📝</span>
                        <h3 className="font-bold text-gray-700 mt-2">Register</h3>
                        <p className="text-sm text-gray-500">Create your team</p>
                      </div>
                      <div className="bg-green-50 p-6 rounded-lg max-w-xs flex-1">
                        <span className="text-4xl">💡</span>
                        <h3 className="font-bold text-gray-700 mt-2">Submit</h3>
                        <p className="text-sm text-gray-500">Upload your project</p>
                      </div>
                      <div className="bg-purple-50 p-6 rounded-lg max-w-xs flex-1">
                        <span className="text-4xl">🏆</span>
                        <h3 className="font-bold text-gray-700 mt-2">Win</h3>
                        <p className="text-sm text-gray-500">Get recognized!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            } />
            
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/project/:code" element={<PublicProject />} />
            <Route path="/judge/:code" element={<JudgePanel />} />
            
            {/* Student Routes */}
            <Route path="/dashboard" element={
              <RoleRoute allowedRoles={['student']}>
                <Dashboard />
              </RoleRoute>
            } />
            
            <Route path="/submit-project" element={
              <RoleRoute allowedRoles={['student']}>
                <ProjectSubmit />
              </RoleRoute>
            } />
            
            {/* Teacher Routes */}
            <Route path="/teacher-dashboard" element={
              <RoleRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </RoleRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <RoleRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </RoleRoute>
            } />
            
            <Route path="/admin/winners/:grade" element={
              <RoleRoute allowedRoles={['admin']}>
                <Winners />
              </RoleRoute>
            } />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;