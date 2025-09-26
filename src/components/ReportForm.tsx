import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Check } from 'lucide-react';
import { useAppStore } from '../store';
import { Detection } from '../types';
import { getCurrentLocation, getAddressFromCoordinates } from '../utils/location';
import CameraCapture from './CameraCapture';
import AIDescriptionGenerator from './AIDescriptionGenerator';
import usePotholeDetection from '../hooks/usePotholeDetection';
import DetectionProgressBar from './DetectionProgressBar';
import PotholeDetectionAPI from '../services/potholeAPI';

const ReportForm: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, addReport } = useAppStore();
  const { detectFromBase64 } = usePotholeDetection();

  const [showCamera, setShowCamera] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [description, setDescription] = useState('');
  const [allDetections, setAllDetections] = useState<Detection[][]>([]);
  const [severity, setSeverity] = useState<'high' | 'medium' | 'low'>('low');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [annotatedImageUrls, setAnnotatedImageUrls] = useState<string[]>([]);
  const [potholeDetected, setPotholeDetected] = useState<boolean>(false);
  const [imagesAnalyzed, setImagesAnalyzed] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [analysisSuccess, setAnalysisSuccess] = useState(false);

  // AI Description states
  const [aiDescription, setAiDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);

  // Progress bar states
  const [showProgress, setShowProgress] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<'capturing' | 'uploading' | 'processing' | 'analyzing' | 'complete' | 'error'>('capturing');
  const [progressValue, setProgressValue] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string>('');

  const handleOpenCamera = () => {
    setShowCamera(true);
  };

  const handleCameraCapture = async (
    capturedPhoto: string,
    _capturedDetections: Detection[],
    _detectedSeverity: 'high' | 'medium' | 'low'
  ) => {
    // Check if we already have 5 photos
    if (photos.length >= 5) {
      setError('Maximum 5 photos allowed');
      return;
    }

    // Add photo to array (no detection processing yet)
    const newPhotos = [...photos, capturedPhoto];
    setPhotos(newPhotos);
    setCurrentPhotoIndex(newPhotos.length - 1);

    setShowCamera(false);
    setError(null);

    // Reset analysis state when new photos are added
    setImagesAnalyzed(false);
    setPotholeDetected(false);
    setValidationErrors([]);
    setAnalysisSuccess(false);
    setAllDetections([]);
    setAnnotatedImageUrls([]);

    // Convert base64 to File for AI description (use the most recently captured photo)
    try {
      const response = await fetch(capturedPhoto);
      const blob = await response.blob();
      const file = new File([blob], `pothole-image-${newPhotos.length}.jpg`, { type: 'image/jpeg' });
      setImageFile(file);
    } catch (error) {
      console.error('Error converting image to file:', error);
    }
  };

  // New function to analyze all captured images
  const handleAnalyzeImages = async () => {
    if (photos.length === 0) {
      setError('Please capture at least one image first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setValidationErrors([]);
    setAnalysisSuccess(false);

    // Start progress bar
    setShowProgress(true);
    setProgressStep('analyzing');
    setProgressValue(0);
    setProgressMessage('Analyzing all captured images...');

    try {
      const newDetections: Detection[][] = [];
      const newAnnotatedUrls: string[] = [];
      const errors: string[] = [];
      let allSeverities: ('high' | 'medium' | 'low')[] = [];

      // Get location data once
      let locationData: { latitude: number; longitude: number } | undefined = undefined;
      try {
        const position = await getCurrentLocation();
        locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        const address = await getAddressFromCoordinates(position.coords.latitude, position.coords.longitude);
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: address || 'Location detected'
        });
      } catch (error) {
        console.warn('Could not get location for detection:', error);
      }

      // Analyze each photo
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        setProgressValue((i / photos.length) * 80); // 80% for analysis
        setProgressMessage(`Analyzing image ${i + 1} of ${photos.length}...`);

        try {
          const result = await detectFromBase64(photo, {
            includeImage: true,
            email: 'mohammedafaaz433@gmail.com',
            sendEmail: false, // Don't send email during analysis
            location: locationData,
            userInfo: {
              name: currentUser?.name || 'Unknown User',
              email: currentUser?.email || 'N/A'
            }
          });

          // Check if potholes were detected in this image
          const hasValidPotholes = result.detections.length > 0 &&
            result.detections.some(detection =>
              detection.class.toLowerCase().includes('pothole') &&
              detection.confidence > 0.3
            );

          if (!hasValidPotholes) {
            errors.push(`Image #${i + 1} does not contain a pothole`);
          }

          newDetections.push(result.detections);
          newAnnotatedUrls.push(result.annotatedImageUrl || '');
          allSeverities.push(result.severity);

        } catch (error) {
          console.error(`Error analyzing image ${i + 1}:`, error);
          errors.push(`Failed to analyze image #${i + 1}`);
          newDetections.push([]);
          newAnnotatedUrls.push('');
        }
      }

      // Update state with results
      setAllDetections(newDetections);
      setAnnotatedImageUrls(newAnnotatedUrls);

      // Set overall severity (highest among all images)
      if (allSeverities.length > 0) {
        const severityPriority = { 'high': 3, 'medium': 2, 'low': 1 };
        const highestSeverity = allSeverities.reduce((prev, current) =>
          severityPriority[current] > severityPriority[prev] ? current : prev
        );
        setSeverity(highestSeverity);
      }

      setProgressValue(100);

      if (errors.length > 0) {
        setValidationErrors(errors);
        setError(`Among the ${photos.length} images captured, ${errors.join(', ')}. Please capture only images with potholes.`);
        setPotholeDetected(false);
        setProgressMessage('Validation failed - some images do not contain potholes');
      } else {
        setPotholeDetected(true);
        setProgressMessage(`Analysis complete! All ${photos.length} images contain potholes.`);
        setAnalysisSuccess(true);

        // Auto-hide success message after 8 seconds
        setTimeout(() => {
          setAnalysisSuccess(false);
        }, 8000);
      }

      setImagesAnalyzed(true);

    } catch (error) {
      console.error('Error during image analysis:', error);
      setError('Failed to analyze images. Please try again.');
      setPotholeDetected(false);
      setProgressMessage('Analysis failed');
    } finally {
      setIsAnalyzing(false);

      // Hide progress bar after 3 seconds
      setTimeout(() => {
        setShowProgress(false);
      }, 3000);
    }
  };



  // AI Description handlers
  const handleAIDescriptionGenerated = (generatedDescription: string) => {
    setAiDescription(generatedDescription);
    // Optionally merge with existing description or replace it
    setDescription(generatedDescription);
  };

  const handleClearAIDescription = () => {
    setAiDescription('');
    setDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (photos.length === 0) {
      setError('Please capture at least one photo of the pothole');
      return;
    }

    if (!potholeDetected) {
      setError('No potholes detected in the captured image. Please capture a clearer image of the pothole.');
      return;
    }


    
    if (!currentUser) {
      setError('You must be logged in to submit a report');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Get current location with high accuracy
      const position = await getCurrentLocation();
      const { latitude, longitude } = position.coords;
      
      // Get address from coordinates with better error handling
      let address;
      try {
        address = await getAddressFromCoordinates(latitude, longitude);
      } catch (error) {
        console.error('Error getting address:', error);
        address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }
      
      // Get all detections from all photos
      const allDetectionsList = allDetections.flat();

      // Create report with precise coordinates and multiple photos
      const reportData = {
        userId: currentUser.id,
        photos: photos.map((photo, index) => ({
          image: annotatedImageUrls[index] || photo,
          detections: allDetections[index] || []
        })),
        photo: annotatedImageUrls[currentPhotoIndex] || photos[currentPhotoIndex], // Main photo for compatibility
        description: description.trim() || undefined,
        severity,
        confidence: allDetectionsList.length > 0
          ? allDetectionsList.reduce((sum: number, det) => sum + det.confidence, 0) / allDetectionsList.length
          : 0,
        location: {
          lat: latitude,
          lng: longitude,
          address
        },
        originalPhoto: photos[currentPhotoIndex], // Keep original photo as backup
        annotatedImageUrl: annotatedImageUrls[currentPhotoIndex] || undefined,
        upvotedBy: [],
        downvotedBy: []
      };
      
      // Add report to store
      addReport(reportData);

      // Send single email with comprehensive multi-image report
      try {
        // Find the best representative image (highest confidence detections)
        let bestImageIndex = 0;
        let highestConfidence = 0;
        let totalDetections = 0;

        // Calculate statistics across all images
        for (let i = 0; i < allDetections.length; i++) {
          const detections = allDetections[i] || [];
          totalDetections += detections.length;

          if (detections.length > 0) {
            const maxConfidence = Math.max(...detections.map(d => d.confidence));
            if (maxConfidence > highestConfidence) {
              highestConfidence = maxConfidence;
              bestImageIndex = i;
            }
          }
        }

        // Send email with all images and detections
        console.log('Email debug:', {
          totalDetections,
          photos: photos.length,
          allDetections: allDetections.length,
          bestImageIndex,
          hasDetections: totalDetections > 0,
          allDetectionsData: allDetections
        });

        // Send email for all reports using the new email service
        if (photos.length > 0) {
          try {
            console.log('Sending email report...');

            // Prepare email data
            const emailData = {
              user_email: currentUser?.email || 'N/A',
              user_name: currentUser?.name || 'Unknown User',
              detections_data: allDetections,
              location_data: {
                latitude: latitude,
                longitude: longitude,
                address: address
              },
              images_data: photos  // Always send original base64 photos, not URLs
            };

            console.log('Email data prepared:', {
              user_email: emailData.user_email,
              images_count: emailData.images_data.length,
              images_preview: emailData.images_data.map((img, i) =>
                `Image ${i+1}: ${img ? img.substring(0, 50) + '...' : 'EMPTY'}`
              )
            });

            // Use the API service to send email
            const api = new PotholeDetectionAPI(
              import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'
            );

            const result = await api.sendReportEmail(emailData);
            console.log('Email sent successfully:', result);
            console.log(`Email report sent for ${photos.length} images (${totalDetections} total potholes detected)`);
          } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Don't fail the submission if email fails
          }
        } else {
          console.log('No email sent - no photos available');
        }

        // Navigate to home page
        navigate('/home');
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the submission if email fails
        // Still navigate to home page even if email fails
        navigate('/home');
      }
    } catch (err) {
      console.error('Error submitting report:', err);
      
      // Check if the error is related to geolocation permission
      if (err && typeof err === 'object' && 'code' in err) {
        const geoError = err as GeolocationPositionError;
        switch (geoError.code) {
          case 1: // PERMISSION_DENIED
            setError('Location access denied. Please enable location services to submit a report.');
            break;
          case 2: // POSITION_UNAVAILABLE
            setError('Unable to determine your location. Please try again.');
            break;
          case 3: // TIMEOUT
            setError('Location request timed out. Please try again.');
            break;
          default:
            setError('Failed to get location. Please try again.');
        }
      } else {
        setError('Failed to submit report. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 animate-pop-in">
      <h1 className="text-2xl font-bold mb-6">Report a Pothole</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Pothole Photos <span className="text-red-500">*</span>
            <span className="text-sm text-gray-500 ml-2">
              ({photos.length} out of 5 images captured)
            </span>
          </label>

          {/* Camera and Analyze Buttons */}
          <div className="flex gap-3 mb-4">
            <button
              type="button"
              onClick={handleOpenCamera}
              disabled={photos.length >= 5}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                photos.length >= 5
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <Camera size={20} />
              {photos.length === 0 ? 'Capture' : 'Add'}
            </button>

            <button
              type="button"
              onClick={handleAnalyzeImages}
              disabled={photos.length === 0 || isAnalyzing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                photos.length === 0 || isAnalyzing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : imagesAnalyzed
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              <Check size={20} />
              {isAnalyzing ? 'Analyzing...' : imagesAnalyzed ? 'Analyze again' : 'Analyze Images'}
            </button>
          </div>

          {/* Success Message */}
          {analysisSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-green-800 font-semibold text-base">🎉 Analysis Successful!</h3>
                  <p className="text-green-700 text-sm mt-1">
                    {photos.length === 1
                      ? 'Pothole detected in your image. You can now submit your report.'
                      : `Potholes detected in all ${photos.length} images. You can now submit your report.`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <ul className="text-red-600 text-sm mt-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {photos.length > 0 ? (
            <div className="relative">
              <div className="relative">
                <img
                  src={photos[currentPhotoIndex]}
                  alt={`Captured pothole ${currentPhotoIndex + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />

                {/* Photo counter */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  {currentPhotoIndex + 1} / {photos.length}
                </div>

                {/* Navigation arrows */}
                {photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setCurrentPhotoIndex(Math.max(0, currentPhotoIndex - 1))}
                      disabled={currentPhotoIndex === 0}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70 disabled:opacity-30"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPhotoIndex(Math.min(photos.length - 1, currentPhotoIndex + 1))}
                      disabled={currentPhotoIndex === photos.length - 1}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70 disabled:opacity-30"
                    >
                      →
                    </button>
                  </>
                )}

                {/* Delete current photo */}
                <button
                  type="button"
                  onClick={() => {
                    const newPhotos = photos.filter((_, index) => index !== currentPhotoIndex);
                    const newDetections = allDetections.filter((_, index) => index !== currentPhotoIndex);
                    const newAnnotatedUrls = annotatedImageUrls.filter((_, index) => index !== currentPhotoIndex);

                    setPhotos(newPhotos);
                    setAllDetections(newDetections);
                    setAnnotatedImageUrls(newAnnotatedUrls);

                    if (newPhotos.length === 0) {
                      setCurrentPhotoIndex(0);
                    } else if (currentPhotoIndex >= newPhotos.length) {
                      setCurrentPhotoIndex(newPhotos.length - 1);
                    }
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                >
                  ×
                </button>

                {/* Add more photos button */}
                {photos.length < 5 && (
                  <button
                    type="button"
                    onClick={handleOpenCamera}
                    className="absolute bottom-2 right-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full"
                    aria-label="Add another photo"
                  >
                    <Camera size={20} />
                  </button>
                )}
              </div>

              {/* Photo thumbnails */}
              {photos.length > 1 && (
                <div className="flex gap-2 mt-2 overflow-x-auto">
                  {photos.map((photo, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                        index === currentPhotoIndex ? 'border-blue-500' : 'border-gray-300'
                      }`}
                    >
                      <img
                        src={photo}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50">
              <Camera size={36} className="text-gray-400 mb-2" />
              <span className="text-gray-500">Use the "Capture" button above to add images</span>
              <span className="text-gray-400 text-sm mt-1">Capture 1-5 photos, then click "Analyze Images"</span>
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
            Description (Optional)
          </label>

          {/* AI Description Generator */}
          <div className="mb-4">
            <AIDescriptionGenerator
              imageFile={imageFile}
              location={currentLocation}
              onDescriptionGenerated={handleAIDescriptionGenerated}
              currentDescription={aiDescription}
              onClearDescription={handleClearAIDescription}
            />
          </div>

          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any additional details about the pothole..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>


        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting || photos.length === 0 || !imagesAnalyzed || !potholeDetected || validationErrors.length > 0}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${
              potholeDetected && imagesAnalyzed && validationErrors.length === 0 && !isSubmitting
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            title={
              !imagesAnalyzed ? 'Please analyze images first' :
              validationErrors.length > 0 ? 'Some images do not contain potholes' :
              !potholeDetected ? 'No potholes detected in images' : ''
            }
          >
            {isSubmitting ? 'Submitting...' :
             !imagesAnalyzed ? 'Analyze Images First' :
             validationErrors.length > 0 ? 'Capture Valid Image' :
             !potholeDetected ? 'No Potholes Detected' :
             'Submit Report'}
          </button>
        </div>
      </form>
      
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Detection Progress Bar */}
      <DetectionProgressBar
        isActive={showProgress}
        currentStep={progressStep}
        progress={progressValue}
        message={progressMessage}
        onComplete={() => setShowProgress(false)}
      />
    </div>
  );
};

export default ReportForm;