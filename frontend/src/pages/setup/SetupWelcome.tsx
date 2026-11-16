import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface SetupFormData {
  name: string;
  integration_type: string;
  config: {
    api_url: string;
    access_token: string;
    [key: string]: any;
  };
}

const SetupWelcome: React.FC = () => {
  const { checkIntegrationStatus } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SetupFormData>({
    name: '',
    integration_type: 'github',
    config: {
      api_url: '',
      access_token: '',
    },
  });

  // Step 1: Welcome screen
  const renderStepOne = () => (
    <div className="text-center">
      <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome to BuildFix!</h2>
      <p className="mt-2 text-sm text-gray-600">
        Let's get you set up with your first integration so you can start tracking and fixing build failures.
      </p>
      <div className="mt-8">
        <button
          onClick={() => setCurrentStep(2)}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Let's Get Started
        </button>
      </div>
    </div>
  );

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

  // Render config fields based on integration type
  const renderConfigFields = () => {
    const fields = [];

    // Common fields for all integration types
    fields.push(
      <div key="api_url" className="col-span-6">
        <label htmlFor="config.api_url" className="block text-sm font-medium text-gray-700">
          API URL
        </label>
        <input
          type="text"
          name="config.api_url"
          id="config.api_url"
          placeholder={formData.integration_type === 'github' ? 'https://api.github.com' : ''}
          value={formData.config.api_url}
          onChange={handleInputChange}
          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
        <p className="mt-1 text-xs text-gray-500">
          {formData.integration_type === 'github' 
            ? 'For GitHub, use https://api.github.com or your GitHub Enterprise instance URL.' 
            : 'Enter the base API URL for your CI/CD system.'}
        </p>
      </div>
    );

    fields.push(
      <div key="access_token" className="col-span-6">
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
        <p className="mt-1 text-xs text-gray-500">
          {formData.integration_type === 'github'
            ? 'Generate a Personal Access Token with repo and workflow permissions.'
            : 'Enter the access token for authentication.'}
        </p>
      </div>
    );

    // Additional fields based on integration type
    if (formData.integration_type === 'jenkins') {
      fields.push(
        <div key="username" className="col-span-6">
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
        <div key="project_id" className="col-span-6">
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

  // Step 2: Choose CI/CD system
  const renderStepTwo = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-900">Choose your CI/CD system</h2>
      <p className="mt-1 text-sm text-gray-600">
        Select the CI/CD system you'd like to connect to BuildFix.
      </p>

      <div className="mt-6">
        <label htmlFor="integration_type" className="block text-sm font-medium text-gray-700">
          CI/CD System
        </label>
        <select
          id="integration_type"
          name="integration_type"
          value={formData.integration_type}
          onChange={handleIntegrationTypeChange}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        >
          <option value="github">GitHub Actions</option>
          <option value="gitlab">GitLab CI</option>
          <option value="jenkins">Jenkins</option>
          <option value="circle-ci">CircleCI</option>
          <option value="travis-ci">Travis CI</option>
        </select>
      </div>

      <div className="mt-6">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Integration Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          placeholder="e.g., My GitHub Projects"
          value={formData.name}
          onChange={handleInputChange}
          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setCurrentStep(1)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Back
        </button>
        <button
          onClick={() => setCurrentStep(3)}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Next
        </button>
      </div>
    </div>
  );

  // Step 3: Configure integration
  const renderStepThree = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-900">Configure {formData.integration_type} Integration</h2>
      <p className="mt-1 text-sm text-gray-600">
        Enter your {formData.integration_type} credentials to connect to BuildFix.
      </p>

      {error && (
        <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4">
        {renderConfigFields()}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setCurrentStep(2)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Back
        </button>
        <button
          onClick={handleSubmitIntegration}
          disabled={isLoading}
          className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Setting up...
            </>
          ) : (
            'Save & Finish'
          )}
        </button>
      </div>
    </div>
  );

  // Handle form submission
  const handleSubmitIntegration = async () => {
    if (!formData.name) {
      setError('Please provide an integration name.');
      return;
    }

    if (!formData.config.access_token) {
      setError('Access token is required.');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      
      // Send API request to create the integration
      await api.post('/api/v1/integrations', formData);
      
      // Update integration status in auth context
      await checkIntegrationStatus();
      
      // Redirect to dashboard
      navigate('/');
    } catch (err) {
      console.error('Error setting up integration:', err);
      setError('Failed to set up integration. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full">
      <div className="max-w-2xl mx-auto bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {/* Progress indicator */}
          {currentStep > 1 && (
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        step < currentStep
                          ? 'bg-primary-600'
                          : step === currentStep
                          ? 'bg-primary-500'
                          : 'bg-gray-300'
                      }`}
                    >
                      <span className="text-white text-sm">{step}</span>
                    </div>
                    <span className="text-xs mt-1 text-gray-500">
                      {step === 1 ? 'Welcome' : step === 2 ? 'Select' : 'Configure'}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-2 flex justify-between">
                <div className="h-1 w-full bg-primary-600"></div>
                <div
                  className={`h-1 w-full ${
                    currentStep >= 3 ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                ></div>
              </div>
            </div>
          )}

          {/* Step content */}
          {currentStep === 1 && renderStepOne()}
          {currentStep === 2 && renderStepTwo()}
          {currentStep === 3 && renderStepThree()}
        </div>
      </div>
    </div>
  );
};

export default SetupWelcome;
