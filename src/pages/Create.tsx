import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Link as LinkIcon, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { placementApi } from '@/api/placementApi';
import type { PlacementType, SponsorProduct, PlacementOptions } from '@/types/placement';

export default function Create() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'generating'>('form');
  const [progress, setProgress] = useState(0);

  // Form state
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [sponsorName, setSponsorName] = useState('');
  const [productName, setProductName] = useState('');
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState('');
  const [placementType, setPlacementType] = useState<PlacementType>('background');
  const [naturalness, setNaturalness] = useState(75);
  const [targetLength, setTargetLength] = useState(15);
  const [autoPickMoment, setAutoPickMoment] = useState(true);

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(''); // Clear URL if file is selected
    }
  };

  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    // Validation
    if (!videoUrl && !videoFile) {
      alert('Please provide a video URL or upload a video file');
      return;
    }
    if (!sponsorName || !productName) {
      alert('Please provide sponsor and product names');
      return;
    }

    setStep('generating');
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      const sponsor: SponsorProduct = {
        sponsorName,
        productName,
        productImageUrl: productImagePreview || undefined,
      };

      const options: PlacementOptions = {
        placementType,
        naturalness,
        targetLength,
        autoPickMoment,
      };

      // Use video URL or create a mock URL for uploaded file
      const inputVideoUrl = videoUrl || URL.createObjectURL(videoFile!);

      const job = await placementApi.createJob({
        inputVideoUrl,
        sponsor,
        options,
      });

      clearInterval(progressInterval);
      setProgress(100);

      // Navigate to result page
      setTimeout(() => {
        navigate(`/result/${job.id}`);
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Failed to create job:', error);
      alert('Failed to create placement job. Please try again.');
      setStep('form');
      setProgress(0);
    }
  };

  const isFormValid = (videoUrl || videoFile) && sponsorName && productName;

  if (step === 'generating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="mb-6">
            <Sparkles className="w-16 h-16 text-blue-600 mx-auto animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Generating Placement</h2>
          <p className="text-gray-600 mb-6">AI is analyzing your video and creating natural product placement...</p>
          <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500">{progress}% complete</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Create Product Placement</h1>
          <p className="text-gray-600 mt-2">Upload your video and sponsor details to generate natural product placement</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Left: Video Input */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Video Input</h2>
            
            {/* Video URL */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video URL
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!!videoFile}
                />
              </div>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Video File
              </label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {videoFile ? videoFile.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">MP4, MOV, AVI (max. 500MB)</p>
                </div>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Video Preview */}
            {(videoUrl || videoFile) && (
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <video
                  src={videoUrl || (videoFile ? URL.createObjectURL(videoFile) : '')}
                  controls
                  className="w-full h-full"
                />
              </div>
            )}
          </div>

          {/* Right: Sponsor Input */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sponsor Details</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sponsor Name *
              </label>
              <input
                type="text"
                value={sponsorName}
                onChange={(e) => setSponsorName(e.target.value)}
                placeholder="e.g., Nike, Apple, Coca-Cola"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g., Air Max 90, iPhone 15 Pro"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                {productImagePreview ? (
                  <img
                    src={productImagePreview}
                    alt="Product preview"
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Upload product image</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG (max. 5MB)</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProductImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Bottom: Placement Options */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Placement Options</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              {/* Placement Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Placement Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['background', 'handheld', 'overlay'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setPlacementType(type)}
                      className={`px-4 py-3 rounded-lg border-2 font-medium capitalize transition-all ${
                        placementType === type
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Naturalness Slider */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Naturalness: {naturalness}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={naturalness}
                  onChange={(e) => setNaturalness(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Obvious</span>
                  <span>Subtle</span>
                </div>
              </div>
            </div>

            <div>
              {/* Target Length */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Length
                </label>
                <select
                  value={targetLength}
                  onChange={(e) => setTargetLength(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={5}>5 seconds</option>
                  <option value={10}>10 seconds</option>
                  <option value={15}>15 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                </select>
              </div>

              {/* Auto-pick Moment */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoPickMoment}
                    onChange={(e) => setAutoPickMoment(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Auto-pick best moment for placement
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-2 ml-8">
                  AI will analyze the video and select the most natural moment for product placement
                </p>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleGenerate}
              disabled={!isFormValid}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {isFormValid ? (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Placement
                </>
              ) : (
                <>
                  <Loader2 className="w-5 h-5" />
                  Fill Required Fields
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
