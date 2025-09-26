import React, { useState, useRef } from 'react';
import { X, MapPin, AlertTriangle, Camera, Upload, Loader2, Wand2 } from 'lucide-react';
import { useAppStore } from '../store';
import usePotholeDetection from '../hooks/usePotholeDetection';
import CameraCapture from './CameraCapture';
import { getAddressFromCoordinates } from '../utils/location';

interface ReportOtherIssueProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: { lat: number; lng: number } | null;
}

const ReportOtherIssue: React.FC<ReportOtherIssueProps> = ({
  isOpen,
  onClose,
  userLocation,
}) => {
  const { addTextReport, currentUser } = useAppStore();
  const { detectPotholes } = usePotholeDetection();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    issueType: 'other' as const,
    description: '',
    severity: 'medium' as const,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const issueTypes = [
    { value: 'street_lamp', label: 'Street Lamp', icon: '💡' },
    { value: 'sign_board', label: 'Sign Board', icon: '🚸' },
    { value: 'drainage', label: 'Drainage', icon: '🌊' },
    { value: 'garbage', label: 'Garbage', icon: '🗑️' },
    { value: 'road_damage', label: 'Road Damage', icon: '🚧' },
    { value: 'traffic_light', label: 'Traffic Light', icon: '🚦' },
    { value: 'other', label: 'Other', icon: '⚠️' },
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-red-600' },
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setCapturedImages(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleCameraCapture = (photo: string) => {
    setCapturedImages(prev => [...prev, photo]);
    setShowCamera(false);
  };

  const removeImage = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  };

  const generateAIDescription = async () => {
    if (capturedImages.length === 0) return;

    setIsGeneratingDescription(true);
    try {
      // Convert first image to File for API
      const response = await fetch(capturedImages[0]);
      const blob = await response.blob();
      const file = new File([blob], 'issue-image.jpg', { type: 'image/jpeg' });

      // Use pothole detection API to analyze the image
      const result = await detectPotholes(file, {
        includeImage: true,
        location: userLocation ? { latitude: userLocation.lat, longitude: userLocation.lng } : undefined
      });

      // Generate description based on issue type and detection results
      const issueTypeLabel = issueTypes.find(type => type.value === formData.issueType)?.label || 'Issue';
      let aiDescription = `${issueTypeLabel} detected with ${result.confidence > 0.7 ? 'high' : result.confidence > 0.4 ? 'medium' : 'low'} confidence. `;
      
      if (result.detections.length > 0) {
        aiDescription += `Analysis shows ${result.detections.length} area(s) of concern. `;
      }
      
      aiDescription += `Severity assessed as ${result.severity}. Location coordinates: ${userLocation?.lat.toFixed(6)}, ${userLocation?.lng.toFixed(6)}.`;

      setFormData(prev => ({ ...prev, description: aiDescription }));
    } catch (error) {
      console.error('Error generating AI description:', error);
      // Fallback description
      const issueTypeLabel = issueTypes.find(type => type.value === formData.issueType)?.label || 'Issue';
      setFormData(prev => ({ 
        ...prev, 
        description: `${issueTypeLabel} reported at location ${userLocation?.lat.toFixed(6)}, ${userLocation?.lng.toFixed(6)}. Please review and take appropriate action.`
      }));
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userLocation) return;

    setIsSubmitting(true);
    try {
      // Send email report if images are available
      if (capturedImages.length > 0 && currentUser.email) {
        try {
          const api = new (await import('../services/potholeAPI')).default();
          
          await api.sendReportEmail({
            user_email: currentUser.email,
            user_name: currentUser.name,
            detections_data: [{
              issue_type: formData.issueType,
              description: formData.description,
              severity: formData.severity,
              location: userLocation
            }],
            location_data: userLocation,
            images_data: capturedImages
          });
        } catch (emailError) {
          console.warn('Email sending failed:', emailError);
        }
      }

      const reportData = {
        ...formData,
        userId: currentUser.id,
        userName: currentUser.name,
        images: capturedImages,
        location: {
          lat: userLocation.lat,
          lng: userLocation.lng,
          address: await getAddressFromCoordinates(userLocation.lat, userLocation.lng),
        },
        createdAt: new Date().toISOString(),
        visibilityRadius: 5000, // 5km in meters
        status: "active" as "active",
        priority: 'normal' as 'normal',
        upvotedBy: [],
        downvotedBy: [],
        reportCount: 1, // Initial count for clustering
        verified: 'pending',
        fixingStatus: 'pending',
      };

      addTextReport(reportData);

      // Reset form
      setFormData({
        issueType: 'other',
        description: '',
        severity: 'medium',
      });
      setCapturedImages([]);
      
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Report Other Issue</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Type
            </label>
            <select
              value={formData.issueType}
              onChange={(e) => setFormData({ ...formData, issueType: e.target.value as any })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {issueTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images
            </label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setShowCamera(true)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center"
              >
                <Camera className="w-4 h-4 mr-2" />
                Camera
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            {capturedImages.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {capturedImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Captured ${index + 1}`}
                      className="w-full h-20 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity
            </label>
            <div className="grid grid-cols-3 gap-2">
              {severityLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, severity: level.value as any })}
                  className={`p-2 border rounded-md text-sm font-medium transition-colors ${
                    formData.severity === level.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <AlertTriangle className={`w-4 h-4 mx-auto mb-1 ${level.color}`} />
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              {capturedImages.length > 0 && (
                <button
                  type="button"
                  onClick={generateAIDescription}
                  disabled={isGeneratingDescription}
                  className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50 flex items-center"
                >
                  {isGeneratingDescription ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3 mr-1" />
                  )}
                  AI Generate
                </button>
              )}
            </div>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the issue in detail..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              required
            />
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            Location will be auto-captured
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !userLocation}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </button>
          </div>
        </form>
      </div>
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};

export default ReportOtherIssue;