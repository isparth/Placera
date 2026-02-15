import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { placementApi } from '@/api/placementApi';
import type { PlacementJob } from '@/types/placement';

export default function Result() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<PlacementJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'after' | 'before'>('after');

  useEffect(() => {
    if (!jobId) {
      navigate('/');
      return;
    }

    loadJob();
    
    // Start polling for updates
    const unsubscribe = placementApi.pollJobStatus(jobId, (updatedJob) => {
      setJob(updatedJob);
      setLoading(false);
    });

    return () => {
      // Cleanup polling if needed
    };
  }, [jobId, navigate]);

  const loadJob = async () => {
    if (!jobId) return;

    try {
      const fetchedJob = await placementApi.getJob(jobId);
      if (fetchedJob) {
        setJob(fetchedJob);
      } else {
        alert('Job not found');
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to load job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (job?.outputVideoUrl) {
      window.open(job.outputVideoUrl, '_blank');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${job?.sponsor.productName} Placement`,
          text: `Check out this AI-generated product placement for ${job?.sponsor.productName}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading job...</p>
        </div>
      </div>
    );
  }

  const isProcessing = job.status === 'pending' || job.status === 'processing';
  const isCompleted = job.status === 'completed';
  const isFailed = job.status === 'failed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {job.sponsor.productName} by {job.sponsor.sponsorName}
              </h1>
              <p className="text-gray-600">
                {job.options.placementType.charAt(0).toUpperCase() + job.options.placementType.slice(1)} placement
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isProcessing && (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                  <Clock className="w-5 h-5 animate-spin" />
                  <span className="font-medium">Processing {job.progress}%</span>
                </div>
              )}
              {isCompleted && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Completed</span>
                </div>
              )}
              {isFailed && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Failed</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className="bg-white rounded-lg shadow p-12 text-center mb-8">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Your Video</h2>
            <p className="text-gray-600 mb-6">
              AI is analyzing your video and creating natural product placement...
            </p>
            <div className="max-w-md mx-auto">
              <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ease-out"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">{job.progress}% complete</p>
            </div>
          </div>
        )}

        {/* Failed State */}
        {isFailed && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Failed</h2>
            <p className="text-gray-600 mb-6">
              Something went wrong while processing your video. Please try again.
            </p>
            <button
              onClick={() => navigate('/create')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create New Placement
            </button>
          </div>
        )}

        {/* Completed State */}
        {isCompleted && (
          <>
            {/* Before/After Tabs */}
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('after')}
                    className={`px-8 py-4 font-semibold transition-colors ${
                      activeTab === 'after'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    After (With Placement)
                  </button>
                  <button
                    onClick={() => setActiveTab('before')}
                    className={`px-8 py-4 font-semibold transition-colors ${
                      activeTab === 'before'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Before (Original)
                  </button>
                </div>
              </div>

              {/* Video Player */}
              <div className="p-6">
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <video
                    key={activeTab}
                    src={activeTab === 'after' ? job.outputVideoUrl : job.inputVideoUrl}
                    controls
                    className="w-full h-full"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Download Video
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Placement Details */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Placement Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Placement Type</span>
                    <span className="font-medium text-gray-900 capitalize">{job.options.placementType}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Naturalness</span>
                    <span className="font-medium text-gray-900">{job.options.naturalness}%</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Target Length</span>
                    <span className="font-medium text-gray-900">{job.options.targetLength}s</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Placement Timestamp</span>
                    <span className="font-medium text-gray-900">{job.metadata?.placementTimestamp}s</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">AI Confidence</span>
                    <span className="font-medium text-gray-900">
                      {((job.metadata?.confidence || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Sponsor Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Sponsor Information</h2>
                <div className="space-y-4">
                  {job.sponsor.productImageUrl && (
                    <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                      <img
                        src={job.sponsor.productImageUrl}
                        alt={job.sponsor.productName}
                        className="max-h-32 object-contain"
                      />
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Sponsor</span>
                      <span className="font-medium text-gray-900">{job.sponsor.sponsorName}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Product</span>
                      <span className="font-medium text-gray-900">{job.sponsor.productName}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Processing Time</span>
                      <span className="font-medium text-gray-900">{job.metadata?.processingTime}s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
