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
import ResetPassword from './pages/ResetPassword';

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
          <Toaster position="top-right" />
          
          <Routes>
            {/* Public Routes */}
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
                  </div>
                </div>
              </>
            } />
            
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Public Project Page - No Login Required */}
            <Route path="/project/:code" element={<PublicProject />} />
            
            {/* Judge Panel - accessed via QR code */}
            <Route path="/judge/:code" element={<JudgePanel />} />
            
            {/* Student Routes */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            
            <Route path="/submit-project" element={
              <PrivateRoute>
                <ProjectSubmit />
              </PrivateRoute>
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