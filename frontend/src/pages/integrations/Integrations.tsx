import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface Integration {
  id: number;
  name: string;
  integration_type: string;
  config: Record<string, any>;
}

interface IntegrationFormData {
  name: string;
  integration_type: string;
  config: {
    api_url: string;
    access_token: string;
    [key: string]: any;
  };
}

const Integrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [testResult, setTestResult] = useState<{ status: string; message: string } | null>(null);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState<IntegrationFormData>({
    name: '',
    integration_type: 'github',
    config: {
      api_url: '',
      access_token: '',
    },
  });

  // Load integrations
  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/api/v1/integrations');
        setIntegrations(response.data);
      } catch (err) {
        console.error('Error fetching integrations:', err);
        setError('Failed to load integrations. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchIntegrations();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('config.')) {
      const configField = name.replace('config.', '');
      setFormData({
        ...formData,
        config: {
          ...formData.config,
          [configField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle integration type change
  const handleIntegrationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const integrationType = e.target.value;
    
    // Reset config fields based on integration type
    let defaultConfig: Record<string, string> = {
      api_url: '',
      access_token: '',
    };

    if (integrationType === 'jenkins') {
      defaultConfig = {
        ...defaultConfig,
        username: '',
        api_token: '',
      };
    } else if (integrationType === 'gitlab') {
      defaultConfig = {
        ...defaultConfig,
        project_id: '',
      };
    }

    setFormData({
      ...formData,
      integration_type: integrationType,
      config: defaultConfig,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const response = await api.post('/api/v1/integrations', formData);
      
      // Add the new integration to the list
      setIntegrations([...integrations, response.data]);
      
      // Reset form and hide it
      setFormData({
        name: '',
        integration_type: 'github',
        config: {
          api_url: '',
          access_token: '',
        },
      });
      setIsAddingNew(false);
      
      // Show success message
      setTestResult({ status: 'success', message: 'Integration added successfully!' });
      setTimeout(() => setTestResult(null), 3000);
    } catch (err) {
      console.error('Error adding integration:', err);
      setError('Failed to add integration. Please check your inputs and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Test an integration connection
  const testIntegration = async (integrationId: number) => {
    try {
      setIsLoading(true);
      const response = await api.post(`/api/v1/integrations/${integrationId}/test`);
      setTestResult(response.data);
      setTimeout(() => setTestResult(null), 3000);
    } catch (err) {
      console.error('Error testing integration:', err);
      setTestResult({ status: 'error', message: 'Failed to test integration. Please check your configuration.' });
      setTimeout(() => setTestResult(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an integration
  const deleteIntegration = async (integrationId: number) => {
    if (!window.confirm('Are you sure you want to delete this integration?')) {
      return;
    }

    try {
      setIsLoading(true);
      await api.delete(`/api/v1/integrations/${integrationId}`);
      
      // Remove the deleted integration from the list
      setIntegrations(integrations.filter(integration => integration.id !== integrationId));
      
      // Show success message
      setTestResult({ status: 'success', message: 'Integration deleted successfully!' });
      setTimeout(() => setTestResult(null), 3000);
    } catch (err) {
      console.error('Error deleting integration:', err);
      setError('Failed to delete integration.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render config fields based on integration type
  const renderConfigFields = () => {
    const fields = [];

    // Common fields for all integration types
    fields.push(
      <div key="api_url" className="col-span-6 sm:col-span-3">
        <label htmlFor="config.api_url" className="block text-sm font-medium text-gray-700">
          API URL
        </label>
        <input
          type="text"
          name="config.api_url"
          id="config.api_url"
          value={formData.config.api_url}
          onChange={handleInputChange}
          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>
    );

    fields.push(
      <div key="access_token" className="col-span-6 sm:col-span-3">
        <label htmlFor="config.access_token" className="block text-sm font-medium text-gray-700">
          Access Token
        </label>
        <input
          type="password"
          name="config.access_token"
          id="config.access_token"
          value={formData.config.access_token}
          onChange={handleInputChange}
          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>
    );

    // Additional fields based on integration type
    if (formData.integration_type === 'jenkins') {
      fields.push(
        <div key="username" className="col-span-6 sm:col-span-3">
          <label htmlFor="config.username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            name="config.username"
            id="config.username"
            value={formData.config.username || ''}
            onChange={handleInputChange}
            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      );
    } else if (formData.integration_type === 'gitlab') {
      fields.push(
        <div key="project_id" className="col-span-6 sm:col-span-3">
          <label htmlFor="config.project_id" className="block text-sm font-medium text-gray-700">
            Project ID
          </label>
          <input
            type="text"
            name="config.project_id"
            id="config.project_id"
            value={formData.config.project_id || ''}
            onChange={handleInputChange}
            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      );
    }

    return fields;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Integrations</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure your CI/CD and monitoring integrations
          </p>
        </div>
        <button
          onClick={() => setIsAddingNew(!isAddingNew)}
          className="btn btn-primary"
        >
          {isAddingNew ? 'Cancel' : 'Add Integration'}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Test result message */}
      {testResult && (
        <div className={`rounded-md p-4 ${
          testResult.status === 'success' ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <div className="flex">
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                testResult.status === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.message}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Add new integration form */}
      {isAddingNew && (
        <form onSubmit={handleSubmit} className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Integration Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="integration_type" className="block text-sm font-medium text-gray-700">
                  Integration Type
                </label>
                <select
                  id="integration_type"
                  name="integration_type"
                  value={formData.integration_type}
                  onChange={handleIntegrationTypeChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="github">GitHub</option>
                  <option value="gitlab">GitLab</option>
                  <option value="jenkins">Jenkins</option>
                  <option value="circle-ci">CircleCI</option>
                  <option value="travis-ci">Travis CI</option>
                </select>
              </div>

              {renderConfigFields()}
            </div>
          </div>
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              type="submit"
              disabled={isLoading}
              className={`btn btn-primary ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Saving...' : 'Save Integration'}
            </button>
          </div>
        </form>
      )}

      {/* Integrations list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {isLoading && !integrations.length ? (
            <li className="px-4 py-4 sm:px-6 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </li>
          ) : integrations.length === 0 ? (
            <li className="px-4 py-4 sm:px-6">
              <p className="text-sm text-gray-500">No integrations configured yet</p>
            </li>
          ) : (
            integrations.map((integration) => (
              <li key={integration.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="sm:flex sm:justify-between w-full">
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {integration.name}
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Type: {integration.integration_type}
                      </p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex space-x-2">
                      <button
                        onClick={() => testIntegration(integration.id)}
                        disabled={isLoading}
                        className="btn btn-secondary"
                      >
                        Test Connection
                      </button>
                      <button
                        onClick={() => deleteIntegration(integration.id)}
                        disabled={isLoading}
                        className="btn btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default Integrations;
