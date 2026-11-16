import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import SignIn from './pages/auth/SignIn';
import Dashboard from './pages/dashboard/Dashboard';
import Integrations from './pages/integrations/Integrations';
import BuildList from './pages/builds/BuildList';
import BuildDetail from './pages/builds/BuildDetail';
import Analysis from './pages/analysis/Analysis';
import Layout from './components/Layout';
import { AuthProvider } from './contexts/AuthContext';
import SetupWelcome from './pages/setup/SetupWelcome';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/setup" element={<Layout><SetupWelcome /></Layout>} />
          <Route path="/integrations" element={<Layout><Integrations /></Layout>} />
          <Route path="/builds" element={<Layout><BuildList /></Layout>} />
          <Route path="/builds/:id" element={<Layout><BuildDetail /></Layout>} />
          <Route path="/analysis" element={<Layout><Analysis /></Layout>} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
