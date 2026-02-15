import type { PlacementJob, CreateJobRequest, JobStatus } from '@/types/placement';

// Mock data store
const mockJobs = new Map<string, PlacementJob>();

// Simulate async delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate mock job ID
const generateJobId = () => `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Mock output video URL (placeholder)
const MOCK_OUTPUT_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export const placementApi = {
  /**
   * Create a new placement job
   */
  async createJob(request: CreateJobRequest): Promise<PlacementJob> {
    await delay(500); // Simulate network delay

    const jobId = generateJobId();
    const job: PlacementJob = {
      id: jobId,
      status: 'pending',
      inputVideoUrl: request.inputVideoUrl,
      sponsor: request.sponsor,
      options: request.options,
      progress: 0,
      createdAt: new Date(),
    };

    mockJobs.set(jobId, job);

    // Start mock processing simulation
    simulateProcessing(jobId);

    return job;
  },

  /**
   * Get job by ID
   */
  async getJob(jobId: string): Promise<PlacementJob | null> {
    await delay(200); // Simulate network delay

    const job = mockJobs.get(jobId);
    return job ? { ...job } : null;
  },

  /**
   * Get all jobs (for dashboard)
   */
  async getAllJobs(): Promise<PlacementJob[]> {
    await delay(300); // Simulate network delay

    return Array.from(mockJobs.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10); // Return last 10 jobs
  },

  /**
   * Poll job status (for real-time updates)
   */
  async pollJobStatus(jobId: string, onUpdate: (job: PlacementJob) => void): Promise<void> {
    const maxAttempts = 30;
    let attempts = 0;

    const poll = async () => {
      const job = await placementApi.getJob(jobId);
      if (!job) return;

      onUpdate(job);

      if (job.status === 'completed' || job.status === 'failed' || attempts >= maxAttempts) {
        return;
      }

      attempts++;
      setTimeout(poll, 1000);
    };

    await poll();
  },
};

/**
 * Simulate processing progression for demo purposes
 */
function simulateProcessing(jobId: string) {
  const stages: Array<{ status: JobStatus; progress: number; duration: number }> = [
    { status: 'pending', progress: 0, duration: 500 },
    { status: 'processing', progress: 10, duration: 1000 },
    { status: 'processing', progress: 25, duration: 1500 },
    { status: 'processing', progress: 45, duration: 1500 },
    { status: 'processing', progress: 65, duration: 1500 },
    { status: 'processing', progress: 85, duration: 1500 },
    { status: 'processing', progress: 95, duration: 1000 },
    { status: 'completed', progress: 100, duration: 500 },
  ];

  let currentStage = 0;

  const updateStage = () => {
    const job = mockJobs.get(jobId);
    if (!job) return;

    const stage = stages[currentStage];
    job.status = stage.status;
    job.progress = stage.progress;

    if (stage.status === 'completed') {
      job.outputVideoUrl = MOCK_OUTPUT_VIDEO;
      job.completedAt = new Date();
      job.metadata = {
        placementTimestamp: 12.5,
        confidence: 0.92,
        processingTime: 8.3,
      };
    }

    mockJobs.set(jobId, job);

    currentStage++;
    if (currentStage < stages.length) {
      setTimeout(updateStage, stage.duration);
    }
  };

  updateStage();
}
