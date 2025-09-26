export interface TextReport {
  id: string;
  userId: string;
  userName: string;
  createdAt: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  issueType: 'street_lamp' | 'sign_board' | 'drainage' | 'garbage' | 'road_damage' | 'traffic_light' | 'other';
  description: string;
  severity: 'high' | 'medium' | 'low';
  images?: string[];
  visibilityRadius: number;
  status: 'active' | 'resolved' | 'archived';
  priority: 'high' | 'normal' | 'low';
  upvotes: number;
  downvotes: number;
  upvotedBy: string[];
  downvotedBy: string[];
  reportCount: number;
  verified: 'pending' | 'verified' | 'rejected';
  fixingStatus: 'pending' | 'in_progress' | 'resolved' | 'rejected';
}

export interface User {
  id: string;
  name: string;
  age: number;
  email: string;
  points: number;
  reports: string[];
  badge: Badge;
  createdAt: Date;
}

export interface GovUser {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  phone: string;
  email: string;
  createdAt: Date;
}

export interface Report {
  id: string;
  userId: string;
  userName: string;
  createdAt: Date;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  photo: string;
  photos?: Array<{
    image: string;
    detections: Detection[];
  }>;
  description?: string;
  severity: 'high' | 'medium' | 'low';
  confidence: number;
  upvotes: number;
  downvotes: number;
  upvotedBy: string[];
  downvotedBy: string[];
  verified: 'pending' | 'verified' | 'rejected';
  fixingStatus: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  originalPhoto?: string;
  annotatedImageUrl?: string;
  type?: 'pothole' | 'text';
  priority?: 'high' | 'normal' | 'low';
  reportCount?: number;
}

export interface ScratchCard {
  id: string;
  userId: string;
  isRevealed: boolean;
  reward: {
    type: 'discount' | 'coupon' | 'badge' | 'charity';
    value: string;
    description: string;
  };
  createdAt: Date;
}

export interface PredictionData {
  location: { lat: number; lng: number };
  predictedSeverity: 'high' | 'medium' | 'low';
  confidence: number;
  factors: string[];
  timeframe: string;
}

export interface TrendData {
  period: string;
  reportCount: number;
  issueTypes: Record<string, number>;
  averageSeverity: number;
}

export interface Detection {
  box?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  bbox?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    height: number;
  };
  class: string;
  confidence: number;
}

export type Badge = 'none' | 'bronze' | 'silver' | 'gold';