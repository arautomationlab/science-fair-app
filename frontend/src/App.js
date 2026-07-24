// frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import PublicLayout from './components/PublicLayout'; // ✅ NEW
import HeroBanner from './components/HeroBanner';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      
      <Routes>
        {/* ✅ PUBLIC ROUTES - Use PublicLayout (NO DASHBOARD LINKS) */}
        <Route 
          path="/project/:code" 
          element={
            <PublicLayout>
              <PublicProject />
            </PublicLayout>
          } 
        />
        
        <Route 
          path="/judge/:code" 
          element={
            <PublicLayout>
              <JudgePanel />
            </PublicLayout>
          } 
        />

        {/* ✅ HOME PAGE */}
        <Route 
          path="/" 
          element={
            <>
              <Navbar />
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
              <Footer />
            </>
          } 
        />
        
        {/* ✅ AUTH PAGES */}
        <Route 
          path="/register" 
          element={
            <>
              <Navbar />
              <Register />
              <Footer />
            </>
          } 
        />
        
        <Route 
          path="/login" 
          element={
            <>
              <Navbar />
              <Login />
              <Footer />
            </>
          } 
        />
        
        <Route 
          path="/reset-password" 
          element={
            <>
              <Navbar />
              <ResetPassword />
              <Footer />
            </>
          } 
        />
        
        {/* ✅ STUDENT ROUTES */}
        <Route 
          path="/dashboard" 
          element={
            <>
              <Navbar />
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
              <Footer />
            </>
          } 
        />
        
        <Route 
          path="/submit-project" 
          element={
            <>
              <Navbar />
              <PrivateRoute>
                <ProjectSubmit />
              </PrivateRoute>
              <Footer />
            </>
          } 
        />
        
        {/* ✅ TEACHER ROUTES */}
        <Route 
          path="/teacher-dashboard" 
          element={
            <>
              <Navbar />
              <RoleRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </RoleRoute>
              <Footer />
            </>
          } 
        />
        
        {/* ✅ ADMIN ROUTES */}
        <Route 
          path="/admin" 
          element={
            <>
              <Navbar />
              <RoleRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </RoleRoute>
              <Footer />
            </>
          } 
        />
        
        <Route 
          path="/admin/winners/:grade" 
          element={
            <>
              <Navbar />
              <RoleRoute allowedRoles={['admin']}>
                <Winners />
              </RoleRoute>
              <Footer />
            </>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;