import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

interface BuildDetail {
  id: number;
  build_number: string;
  status: 'success' | 'failure' | 'running' | 'queued' | 'cancelled';
  repository: string;
  branch: string;
  commit_sha: string;
  commit_message: string;
  commit_author: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  logs: string | null;
  failure_reason: string | null;
  failure_type: string | null;
  failure_location: string | null;
  analysis_results: {
    summary: string;
    root_cause: string;
    recommendations: string[];
    similar_issues?: {
      id: string;
      title: string;
      url: string;
    }[];
  } | null;
  created_at: string;
  integration_id: number;
  integration_name: string;
}

enum TabType {
  Overview = 'overview',
  Logs = 'logs',
  Analysis = 'analysis',
}

const BuildDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [build, setBuild] = useState<BuildDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>(TabType.Overview);

  useEffect(() => {
    const fetchBuildDetail = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/v1/builds/${id}`);
        setBuild(response.data);
      } catch (err) {
        console.error('Error fetching build details:', err);
        setError('Failed to load build details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuildDetail();
  }, [id]);

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

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    let classes = 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ';
    
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !build) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md">
        <p>{error || 'Build not found'}</p>
        <Link to="/builds" className="mt-4 inline-block text-primary-600 hover:text-primary-800">
          ← Back to builds
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/builds" className="text-primary-600 hover:text-primary-800">
          ← Back to builds
        </Link>
        <div className="flex justify-between items-center mt-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            Build #{build.build_number}
          </h1>
          <StatusBadge status={build.status} />
        </div>
        <p className="mt-1 text-gray-500">{build.commit_message}</p>
      </div>

      {/* Build info */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Build Information</h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Repository</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {build.repository} ({build.branch})
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Commit</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className="font-mono">{build.commit_sha?.substring(0, 8)}</span> by {build.commit_author}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Integration</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {build.integration_name}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Started</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDate(build.started_at)}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Completed</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDate(build.completed_at)}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Duration</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDuration(build.duration_seconds)}
              </dd>
            </div>
            {build.status === 'failure' && (
              <div className="bg-red-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-red-700">Failure Reason</dt>
                <dd className="mt-1 text-sm text-red-700 sm:mt-0 sm:col-span-2">
                  {build.failure_reason || 'Unknown failure reason'}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`${
                activeTab === TabType.Overview
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab(TabType.Overview)}
            >
              Overview
            </button>
            <button
              className={`${
                activeTab === TabType.Logs
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab(TabType.Logs)}
            >
              Logs
            </button>
            {build.status === 'failure' && (
              <button
                className={`${
                  activeTab === TabType.Analysis
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab(TabType.Analysis)}
              >
                Analysis
              </button>
            )}
          </nav>
        </div>

        <div className="px-4 py-5 sm:p-6">
          {/* Overview Tab */}
          {activeTab === TabType.Overview && (
            <div>
              <h3 className="text-lg font-medium text-gray-900">Build Summary</h3>
              <div className="mt-4">
                <p className="text-gray-700">
                  This build {build.status === 'success' ? 'completed successfully' : `failed with status: ${build.status}`}
                  {build.duration_seconds ? ` and took ${formatDuration(build.duration_seconds)}` : ''}.
                </p>
                {build.status === 'failure' && (
                  <div className="mt-4 p-4 bg-red-50 rounded-md">
                    <h4 className="text-md font-medium text-red-700">Failure Details</h4>
                    <p className="mt-2 text-sm text-red-600">
                      <strong>Type:</strong> {build.failure_type || 'Unknown'}
                    </p>
                    {build.failure_location && (
                      <p className="mt-1 text-sm text-red-600">
                        <strong>Location:</strong> {build.failure_location}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === TabType.Logs && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Build Logs</h3>
              {build.logs ? (
                <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto max-h-96">
                  <pre className="text-xs font-mono whitespace-pre-wrap">{build.logs}</pre>
                </div>
              ) : (
                <p className="text-gray-500">No logs available for this build.</p>
              )}
            </div>
          )}

          {/* Analysis Tab */}
          {activeTab === TabType.Analysis && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Failure Analysis</h3>
              
              {build.analysis_results ? (
                <div className="space-y-4">
                  <div className="bg-white overflow-hidden shadow-sm rounded-md border border-gray-200">
                    <div className="px-4 py-5 sm:px-6 bg-gray-50">
                      <h4 className="text-md font-medium text-gray-900">Summary</h4>
                    </div>
                    <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
                      <p className="text-gray-700">{build.analysis_results.summary}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white overflow-hidden shadow-sm rounded-md border border-gray-200">
                    <div className="px-4 py-5 sm:px-6 bg-gray-50">
                      <h4 className="text-md font-medium text-gray-900">Root Cause</h4>
                    </div>
                    <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
                      <p className="text-gray-700">{build.analysis_results.root_cause}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white overflow-hidden shadow-sm rounded-md border border-gray-200">
                    <div className="px-4 py-5 sm:px-6 bg-gray-50">
                      <h4 className="text-md font-medium text-gray-900">Recommendations</h4>
                    </div>
                    <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {build.analysis_results.recommendations.map((recommendation, index) => (
                          <li key={index}>{recommendation}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {build.analysis_results.similar_issues && build.analysis_results.similar_issues.length > 0 && (
                    <div className="bg-white overflow-hidden shadow-sm rounded-md border border-gray-200">
                      <div className="px-4 py-5 sm:px-6 bg-gray-50">
                        <h4 className="text-md font-medium text-gray-900">Similar Issues</h4>
                      </div>
                      <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
                        <ul className="space-y-2">
                          {build.analysis_results.similar_issues.map((issue) => (
                            <li key={issue.id} className="text-primary-600 hover:text-primary-800">
                              <a href={issue.url} target="_blank" rel="noopener noreferrer">
                                {issue.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded-md">
                  <p className="text-yellow-700">
                    No analysis results available for this build. Run analysis to get insights into the failure cause and potential solutions.
                  </p>
                  <button 
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        await api.post(`/api/v1/builds/${id}/analyze`);
                        const response = await api.get(`/api/v1/builds/${id}`);
                        setBuild(response.data);
                      } catch (err) {
                        console.error('Error analyzing build:', err);
                        setError('Failed to analyze build. Please try again.');
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    Run Analysis
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuildDetail;
