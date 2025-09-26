// services/potholeAPI.ts
export interface PotholeDetectionResponse {
  success: boolean;
  timestamp: string;
  version: string;
  data?: {
    detections: Array<{
      class: string;
      confidence: number;
      severity: 'High' | 'Medium' | 'Low';
      bbox: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        width: number;
        height: number;
      };
      relative_size: number;
    }>;
    detection_count: number;
    image_info: {
      width: number;
      height: number;
      filename: string;
    };
    annotated_image_url?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
    email?: {
      sent: boolean;
      error: string | null;
      recipient: string;
    };
  };
  error?: string;
  code?: string;
  message?: string;
}

export interface DetectionOptions {
  email?: string;
  sendEmail?: boolean;
  includeImage?: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
  userInfo?: {
    name: string;
    email: string;
  };
  allImages?: string[];
  allDetections?: any[][];
}

class PotholeDetectionAPI {
  private baseURL: string;
  private apiKey: string | null;

  constructor(baseURL = 'http://localhost:5000/api/v1', apiKey: string | null = null) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }
    return headers;
  }

  async healthCheck(): Promise<PotholeDetectionResponse> {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        headers: this.getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error('Failed to connect to pothole detection API');
    }
  }

  async detectPotholes(imageFile: File, options: DetectionOptions = {}): Promise<PotholeDetectionResponse> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      // Optional parameters
      if (options.email) formData.append('email', options.email);
      if (options.sendEmail) formData.append('send_email', 'true');
      if (options.includeImage !== undefined) {
        formData.append('include_image', options.includeImage ? 'true' : 'false');
      }
      if (options.location) {
        formData.append('latitude', options.location.latitude.toString());
        formData.append('longitude', options.location.longitude.toString());
      }
      if (options.userInfo) {
        formData.append('user_name', options.userInfo.name);
        formData.append('user_email', options.userInfo.email);
      }
      if (options.allImages) {
        formData.append('all_images', JSON.stringify(options.allImages));
      }
      if (options.allDetections) {
        formData.append('all_detections', JSON.stringify(options.allDetections));
      }

      const response = await fetch(`${this.baseURL}/detect`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: formData
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }
      
      return result;
    } catch (error) {
      console.error('Detection failed:', error);
      throw error;
    }
  }

  async batchDetect(imageFiles: File[]): Promise<PotholeDetectionResponse> {
    try {
      const formData = new FormData();
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`${this.baseURL}/detect/batch`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: formData
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }
      
      return result;
    } catch (error) {
      console.error('Batch detection failed:', error);
      throw error;
    }
  }

  async sendReportEmail(emailData: {
    user_email: string;
    user_name: string;
    detections_data: any[];
    location_data: any;
    images_data: string[];
  }): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/send-report-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getHeaders()
        },
        body: JSON.stringify(emailData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  async getSystemInfo(): Promise<PotholeDetectionResponse> {
    try {
      const response = await fetch(`${this.baseURL}/system/info`, {
        headers: this.getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('System info request failed:', error);
      throw error;
    }
  }

  // Helper method to get full URL for annotated images
  getAnnotatedImageUrl(relativePath: string): string {
    return `${this.baseURL.replace('/api/v1', '')}${relativePath}`;
  }
}

export default PotholeDetectionAPI;
