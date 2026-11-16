import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

interface Build {
  id: number;
  build_number: string;
  status: 'success' | 'failure' | 'running' | 'queued' | 'cancelled';
  repository: string;
  branch: string;
  commit_sha: string;
  commit_message: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  created_at: string;
  integration_id: number;
  integration_name: string;
}

const Builds: React.FC = () => {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [integrationFilter, setIntegrationFilter] = useState<string>('all');
  const [integrations, setIntegrations] = useState<{id: number; name: string}[]>([]);

  // Load builds
  useEffect(() => {
    const fetchBuilds = async () => {
      try {
        setIsLoading(true);
        
        // Build query params
        const params: Record<string, string> = {
          page: page.toString(),
          limit: '10',
        };
        
        if (statusFilter !== 'all') {
          params.status = statusFilter;
        }
        
        if (integrationFilter !== 'all') {
          params.integration_id = integrationFilter;
        }
        
        // Make API request
        const response = await api.get('/api/v1/builds', { params });
        
        setBuilds(response.data.items);
        setTotalPages(Math.ceil(response.data.total / 10));
      } catch (err) {
        console.error('Error fetching builds:', err);
        setError('Failed to load builds. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuilds();
  }, [page, statusFilter, integrationFilter]);

  // Load integrations for filtering
  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const response = await api.get('/api/v1/integrations');
        setIntegrations(response.data.map((item: any) => ({ 
          id: item.id, 
          name: item.name 
        })));
      } catch (err) {
        console.error('Error fetching integrations:', err);
      }
    };

    fetchIntegrations();
  }, []);

  // Format duration
  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return '-';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }
    
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Handle pagination
  const nextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    let classes = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full ';
    
    switch (status) {
      case 'success':
        classes += 'bg-green-100 text-green-800';
        break;
      case 'failure':
        classes += 'bg-red-100 text-red-800';
        break;
      case 'running':
        classes += 'bg-blue-100 text-blue-800';
        break;
      case 'queued':
        classes += 'bg-yellow-100 text-yellow-800';
        break;
      case 'cancelled':
        classes += 'bg-gray-100 text-gray-800';
        break;
      default:
        classes += 'bg-gray-100 text-gray-800';
    }
    
    return <span className={classes}>{status}</span>;
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Builds</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and analyze your build history
          </p>
        </div>
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

      {/* Filters */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:flex md:space-x-4">
          <div className="mb-4 md:mb-0">
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="all">All statuses</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
              <option value="running">Running</option>
              <option value="queued">Queued</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="integration-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Integration
            </label>
            <select
              id="integration-filter"
              value={integrationFilter}
              onChange={(e) => {
                setIntegrationFilter(e.target.value);
                setPage(1);
              }}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="all">All integrations</option>
              {integrations.map((integration) => (
                <option key={integration.id} value={integration.id.toString()}>
                  {integration.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Builds list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : builds.length === 0 ? (
          <div className="px-4 py-6 sm:px-6 text-center">
            <p className="text-gray-500">No builds found matching your filters</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {builds.map((build) => (
              <li key={build.id}>
                <Link to={`/builds/${build.id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-primary-600 truncate">
                          #{build.build_number} - {build.commit_message}
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <StatusBadge status={build.status} />
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {build.repository} ({build.branch})
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          {build.integration_name}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          Started {formatDate(build.started_at)} • Duration: {formatDuration(build.duration_seconds)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
            aria-label="Pagination"
          >
            <div className="hidden sm:block">
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{page}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div className="flex-1 flex justify-between sm:justify-end">
              <button
                onClick={prevPage}
                disabled={page === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  page === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={nextPage}
                disabled={page === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  page === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};

export default Builds;
