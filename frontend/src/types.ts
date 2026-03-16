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
  email: string;
  phone?: string;
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
  originalFilename: string;
  classification: string;
  confidence: number;
  hasFindings: boolean;
  hasCancer: boolean | null;
  cancerProbability: number | null;
  isMalignant: boolean | null;
  allProbabilities: Record<string, number>;
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
