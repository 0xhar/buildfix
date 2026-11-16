import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AnalysisStats {
  failure_types: {
    type: string;
    count: number;
  }[];
  resolution_time: {
    type: string;
    average_hours: number;
  }[];
  failure_trends: {
    date: string;
    count: number;
  }[];
  most_impacted_repositories: {
    repository: string;
    failure_count: number;
  }[];
  recurring_issues: {
    issue: string;
    count: number;
    examples: string[];
  }[];
}

const Analysis: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AnalysisStats | null>(null);
  const [timeRange, setTimeRange] = useState<string>('30d');

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await api.get(`/api/v1/analysis/stats?time_range=${timeRange}`);
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching analysis data:', err);
        setError('Failed to load analysis data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysisData();
  }, [timeRange]);

  const failureTypeChartData = {
    labels: stats?.failure_types.map(item => item.type) || [],
    datasets: [
      {
        label: 'Number of Failures',
        data: stats?.failure_types.map(item => item.count) || [],
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
    ],
  };

  const resolutionTimeChartData = {
    labels: stats?.resolution_time.map(item => item.type) || [],
    datasets: [
      {
        label: 'Average Resolution Time (hours)',
        data: stats?.resolution_time.map(item => item.average_hours) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  const repositoriesChartData = {
    labels: stats?.most_impacted_repositories.map(item => item.repository) || [],
    datasets: [
      {
        label: 'Number of Failures',
        data: stats?.most_impacted_repositories.map(item => item.failure_count) || [],
        backgroundColor: 'rgba(245, 158, 11, 0.6)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1,
      },
    ],
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Build Analysis</h1>
          <p className="mt-1 text-sm text-gray-500">
            Insights and patterns from your build failures
          </p>
        </div>
        
        <div>
          <label htmlFor="time-range" className="sr-only">
            Time Range
          </label>
          <select
            id="time-range"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Failure Types */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Common Failure Types</h3>
            <div className="mt-4" style={{ height: '300px' }}>
              <Bar 
                data={failureTypeChartData} 
                options={{ 
                  maintainAspectRatio: false,
                  indexAxis: 'y',
                  scales: {
                    x: {
                      beginAtZero: true,
                      ticks: { precision: 0 }
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>

        {/* Average Resolution Time */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Resolution Time by Failure Type</h3>
            <div className="mt-4" style={{ height: '300px' }}>
              <Bar 
                data={resolutionTimeChartData} 
                options={{ 
                  maintainAspectRatio: false,
                  indexAxis: 'y'
                }} 
              />
            </div>
          </div>
        </div>

        {/* Most Impacted Repositories */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Most Impacted Repositories</h3>
            <div className="mt-4" style={{ height: '300px' }}>
              <Bar 
                data={repositoriesChartData} 
                options={{ 
                  maintainAspectRatio: false,
                  indexAxis: 'y',
                  scales: {
                    x: {
                      beginAtZero: true,
                      ticks: { precision: 0 }
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>

        {/* Recurring Issues */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recurring Issues</h3>
            <div className="mt-4 overflow-y-auto" style={{ maxHeight: '300px' }}>
              {stats?.recurring_issues && stats.recurring_issues.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {stats.recurring_issues.map((issue, index) => (
                    <li key={index} className="py-3">
                      <div className="flex justify-between">
                        <div className="text-sm font-medium text-gray-900">{issue.issue}</div>
                        <div className="text-sm text-gray-500">{issue.count} occurrences</div>
                      </div>
                      <div className="mt-1">
                        <details className="text-sm text-gray-600">
                          <summary className="cursor-pointer text-primary-600 hover:text-primary-800">View examples</summary>
                          <ul className="mt-2 pl-5 list-disc">
                            {issue.examples.map((example, idx) => (
                              <li key={idx} className="text-xs text-gray-500 mt-1">{example}</li>
                            ))}
                          </ul>
                        </details>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm py-4">No recurring issues detected in this time period.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Failure Trends */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Failure Trends Over Time</h3>
          <div className="mt-4" style={{ height: '300px' }}>
            <Bar
              data={{
                labels: stats?.failure_trends.map(item => item.date) || [],
                datasets: [
                  {
                    label: 'Number of Failures',
                    data: stats?.failure_trends.map(item => item.count) || [],
                    backgroundColor: 'rgba(16, 185, 129, 0.6)',
                    borderColor: 'rgb(16, 185, 129)',
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white overflow-hidden shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Actionable Insights</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Recommendations to improve your build health
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="prose prose-sm text-gray-700">
            <ul className="list-disc pl-5 space-y-2">
              {stats?.failure_types && stats.failure_types.length > 0 ? (
                <>
                  <li>
                    The most common failure type is <strong>{stats.failure_types[0].type}</strong> with {stats.failure_types[0].count} occurrences. 
                    Consider adding specific test cases or linting rules to catch these issues earlier.
                  </li>
                  {stats.resolution_time && stats.resolution_time.length > 0 && (
                    <li>
                      <strong>{stats.resolution_time[0].type}</strong> failures take the longest to resolve (avg. {stats.resolution_time[0].average_hours.toFixed(1)} hours). 
                      Consider creating documentation or playbooks for quicker resolution.
                    </li>
                  )}
                  {stats.most_impacted_repositories && stats.most_impacted_repositories.length > 0 && (
                    <li>
                      <strong>{stats.most_impacted_repositories[0].repository}</strong> has the highest failure rate. 
                      Consider a focused code review or test improvement sprint for this repository.
                    </li>
                  )}
                  <li>
                    Consider implementing pre-commit hooks to catch common issues before they reach the CI pipeline.
                  </li>
                </>
              ) : (
                <li>Not enough data to generate recommendations.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
