import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Video, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { placementApi } from '@/api/placementApi';
import type { PlacementJob } from '@/types/placement';

export default function Home() {
  const [jobs, setJobs] = useState<PlacementJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const allJobs = await placementApi.getAllJobs();
      setJobs(allJobs);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: PlacementJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: PlacementJob['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Video className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Placera</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl">
            Natural product placement powered by AI. Transform your videos with seamlessly integrated sponsor products.
          </p>
        </div>

        {/* Create New Button */}
        <Link
          to="/create"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl mb-12"
        >
          <Plus className="w-5 h-5" />
          Create New Placement
        </Link>

        {/* Recent Jobs */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Jobs</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 mt-4">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs yet</h3>
              <p className="text-gray-600 mb-6">Create your first product placement to get started.</p>
              <Link
                to="/create"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create First Job
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/result/${job.id}`}
                  className="bg-white rounded-lg p-6 shadow hover:shadow-md transition-shadow border border-gray-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(job.status)}
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {job.sponsor.productName} by {job.sponsor.sponsorName}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(job.createdAt)}
                        </span>
                        <span className="capitalize">
                          {job.options.placementType} placement
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                      {job.status === 'processing' && job.progress !== undefined && (
                        <span className="text-sm text-gray-600">{job.progress}%</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
