// ─────────────────────────────────────────────────────────────
//  Morgan's Hope — Frontend Types  (matches backend SPEC exactly)
// ─────────────────────────────────────────────────────────────

export type ImageType = 'xray' | 'ct';
export type UrgencyLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

export interface SafeUser {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string | null;
  phone?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  acceptedDisclaimer?: boolean;
  onboardingCompleted?: boolean;
  authProvider?: 'local' | 'google';
  age?: number;
  gender?: 'male' | 'female' | 'other';
  smokingHistory?: 'never' | 'former' | 'current';
  medicalHistory?: string;
  profilePicture?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
}

export interface AnalysisResult {
  id: number;
  userId: number;
  imageType: ImageType;
  imagePath: string;
  imageUrl?: string;
  originalFilename: string;
  gateClassification?: 'Chest_XRay' | 'Chest_CT' | 'Other_Medical' | 'Non_Medical' | null;
  gateConfidence?: number | null;
  classification: string;
  clinicalGroup?: string | null;
  confidence: number;
  hasFindings: boolean;
  hasCancer: boolean | null;
  cancerProbability: number | null;
  isMalignant: boolean | null;
  allProbabilities: Record<string, number>;
  tbDetected?: boolean | null;
  tbConfidence?: number | null;
  tbLocalizations?: Array<Record<string, unknown>> | null;
  noduleBoundingBox?: Record<string, number> | null;
  noduleSizeMm?: number | null;
  noduleDetectionConfidence?: number | null;
  nextStep: string | null;
  sessionId: string | null;
  status: 'pending' | 'completed' | 'failed';
  processingTimeMs: number | null;
  urgencyLevel: UrgencyLevel;
  createdAt: string;
  updatedAt: string;
  user?: SafeUser;
}

export interface Hospital {
  id: number;
  cityId: number;
  hospitalName: string;
  specialization: string;
  address?: string;
  phone?: string;
  website?: string;
  rating: number;
  totalReviews: number;
  imageUrl?: string;
  isActive: boolean;
  city?: City;
}

export interface City {
  id: number;
  cityName: string;
  state?: string;
  country: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UploadResponse {
  result: AnalysisResult;
  urgencyLevel: UrgencyLevel;
  recommendedHospitals: Hospital[];
  processingTimeMs: number;
}

export interface UploadIntentResponse {
  analysisId: number;
  objectPath: string;
  bucket: string;
  token: string;
  signedUrl: string;
}

export interface AnalysisSubmitResponse {
  analysisId: number;
  jobId: string;
  status: string;
}

export interface AnalysisStatusResponse {
  analysisId: number;
  status: 'pending' | 'completed' | 'failed';
  jobId: string | null;
  jobStatus: string | null;
  errorMessage?: string | null;
  result?: AnalysisResult;
  recommendedHospitals?: Hospital[];
}
