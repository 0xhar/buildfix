import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Types
interface User {
  id: number;
  email: string;
  full_name: string;
  is_superuser: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasConfiguredIntegration: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkIntegrationStatus: () => Promise<boolean>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasConfiguredIntegration, setHasConfiguredIntegration] = useState(false);
  const navigate = useNavigate();

  // Check if the user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Fetch user data
  const fetchUser = async () => {
    try {
      const response = await api.get('/api/v1/users/me');
      setUser(response.data);
      
      // Check if user has configured integrations
      checkIntegrationStatus();
    } catch (error) {
      console.error("Failed to fetch user", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has configured any integrations
  const checkIntegrationStatus = async (): Promise<boolean> => {
    try {
      const response = await api.get('/api/v1/integrations');
      const hasIntegrations = response.data && response.data.length > 0;
      setHasConfiguredIntegration(hasIntegrations);
      return hasIntegrations;
    } catch (error) {
      console.error("Failed to check integrations", error);
      setHasConfiguredIntegration(false);
      return false;
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await api.post('/api/v1/auth/login/access-token', formData);
      const { access_token } = response.data;
      
      // Save token and update API headers
      localStorage.setItem('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Get user data
      await fetchUser();
      
      // Check if user needs to set up integrations
      const hasIntegrations = await checkIntegrationStatus();
      
      // Redirect based on integration status
      if (hasIntegrations) {
        navigate('/');
      } else {
        navigate('/setup');
      }
    } catch (error) {
      console.error("Login failed", error);
      throw new Error("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setHasConfiguredIntegration(false);
    navigate('/signin');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    hasConfiguredIntegration,
    login,
    logout,
    checkIntegrationStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create a hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
