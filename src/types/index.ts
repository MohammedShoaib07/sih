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
  }>; // Multiple photos with their detections
  description?: string;
  severity: 'high' | 'medium' | 'low';
  confidence: number;
  upvotes: number;
  downvotes: number;
  upvotedBy: string[]; // Array of user IDs who upvoted
  downvotedBy: string[]; // Array of user IDs who downvoted
  verified: 'pending' | 'verified' | 'rejected';
  fixingStatus: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  originalPhoto?: string; // Original photo before annotation
  annotatedImageUrl?: string; // URL to Flask API annotated image
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