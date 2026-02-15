export type PlacementType = 'background' | 'handheld' | 'overlay';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface SponsorProduct {
  sponsorName: string;
  productName: string;
  productImageUrl?: string;
}

export interface PlacementOptions {
  placementType: PlacementType;
  naturalness: number; // 0-100
  targetLength: number; // seconds
  autoPickMoment: boolean;
}

export interface PlacementJob {
  id: string;
  status: JobStatus;
  inputVideoUrl: string;
  sponsor: SponsorProduct;
  options: PlacementOptions;
  outputVideoUrl?: string;
  progress?: number; // 0-100
  createdAt: Date;
  completedAt?: Date;
  metadata?: {
    placementTimestamp?: number;
    confidence?: number;
    processingTime?: number;
  };
}

export interface CreateJobRequest {
  inputVideoUrl: string;
  sponsor: SponsorProduct;
  options: PlacementOptions;
}
