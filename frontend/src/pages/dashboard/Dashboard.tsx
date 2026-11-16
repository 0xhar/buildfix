import React, { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import api from '../../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface BuildStats {
  total_builds: number;
  successful_builds: number;
  failed_builds: number;
  success_rate: number;
  average_duration: number;
  common_failures: { type: string; count: number }[];
}

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<BuildStats | null>(null);
  const [timelineData, setTimelineData] = useState<any>(null);
  const [integrationData, setIntegrationData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch build statistics
        const statsResponse = await api.get('/api/v1/dashboard/stats');
        setStats(statsResponse.data);

        // Fetch build timeline data
        const timelineResponse = await api.get('/api/v1/dashboard/status-summary');
        setTimelineData({
          labels: timelineResponse.data.dates,
          datasets: [
            {
              label: 'Successful Builds',
              data: timelineResponse.data.success,
              borderColor: 'rgb(16, 185, 129)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.3,
            },
            {
              label: 'Failed Builds',
              data: timelineResponse.data.failure,
              borderColor: 'rgb(239, 68, 68)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.3,
            },
          ],
        });

        // Fetch integration data
        const integrationsResponse = await api.get('/api/v1/dashboard/integrations-summary');
        setIntegrationData({
          labels: integrationsResponse.data.integrations,
          datasets: [
            {
              label: 'Successful Builds',
              data: integrationsResponse.data.success,
              backgroundColor: [
                'rgba(16, 185, 129, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(245, 158, 11, 0.8)',
              ],
              borderColor: [
                'rgb(16, 185, 129)',
                'rgb(59, 130, 246)',
                'rgb(245, 158, 11)',
              ],
              borderWidth: 1,
            },
          ],
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your build performance and failure analysis
        </p>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Builds</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.total_builds || 0}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Success Rate</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.success_rate.toFixed(1) || 0}%</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Failed Builds</dt>
            <dd className="mt-1 text-3xl font-semibold text-red-600">{stats?.failed_builds || 0}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Avg Duration</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats?.average_duration ? Math.round(stats.average_duration / 60) : 0} min
            </dd>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Build Timeline */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Build Timeline</h3>
            <div className="mt-4" style={{ height: '300px' }}>
              {timelineData && <Line data={timelineData} options={{ 
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0
                    }
                  }
                }
              }} />}
            </div>
          </div>
        </div>

        {/* Integration Success Rate */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Integration Success Rate</h3>
            <div className="mt-4 flex justify-center" style={{ height: '300px' }}>
              {integrationData && <Doughnut data={integrationData} options={{ 
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }} />}
            </div>
          </div>
        </div>
      </div>

      {/* Common Failures */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Common Failures</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Top failure categories in your builds</p>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {stats?.common_failures?.map((failure, index) => (
              <li key={index} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">{failure.type}</p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      {failure.count} instances
                    </p>
                  </div>
                </div>
              </li>
            ))}
            {(!stats?.common_failures || stats.common_failures.length === 0) && (
              <li className="px-4 py-4 sm:px-6 text-sm text-gray-500">
                No failure data available
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
