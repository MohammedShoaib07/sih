import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { User, Shield, Save, LogOut } from 'lucide-react';
import MobileNavigation from '../components/MobileNavigation';
// import UserProfileCard from '../components/UserProfileCard'; // Removed from profile settings

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    govUser,
    isGovUser,
    updateUserProfile,
    updateGovProfile,
    getBadge,
    reports,
    logout
  } = useAppStore();
  
  // Citizen user state
  const [name, setName] = useState(currentUser?.name || '');
  const [age, setAge] = useState(currentUser?.age.toString() || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  
  // Government user state
  const [govName, setGovName] = useState(govUser?.name || '');
  const [govAddress, setGovAddress] = useState(
    govUser ? `${govUser.location.lat}, ${govUser.location.lng}` : ''
  );
  const [govLatitude, setGovLatitude] = useState(govUser?.location.lat.toString() || '');
  const [govLongitude, setGovLongitude] = useState(govUser?.location.lng.toString() || '');
  const [govPhone, setGovPhone] = useState(govUser?.phone || '');
  const [govEmail, setGovEmail] = useState(govUser?.email || '');
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const userPoints = currentUser?.points || 0;
  const badge = getBadge(userPoints);

  // Calculate actual reports count from reports array
  const userReportsCount = currentUser ? reports.filter(report => report.userId === currentUser.id).length : 0;
  
  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccessMessage(null);
  };
  
  const handleCitizenSave = () => {
    if (!name || !age || !email) {
      setError('All fields are required');
      return;
    }
    
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      setError('Please enter a valid age between 13 and 120');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      updateUserProfile({
        name,
        age: ageNum,
        email
      });
      
      setSuccessMessage('Profile updated successfully');
      setIsEditing(false);
    } catch {
      setError('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleGovSave = () => {
    if (!govName || !govAddress || !govPhone || !govEmail || !govLatitude || !govLongitude) {
      setError('All fields are required');
      return;
    }

    // Parse latitude and longitude
    const lat = parseFloat(govLatitude);
    const lng = parseFloat(govLongitude);

    if (isNaN(lat) || isNaN(lng)) {
      setError('Please enter valid latitude and longitude values');
      return;
    }

    if (lat < -90 || lat > 90) {
      setError('Latitude must be between -90 and 90');
      return;
    }

    if (lng < -180 || lng > 180) {
      setError('Longitude must be between -180 and 180');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      updateGovProfile({
        name: govName,
        location: { lat, lng },
        phone: govPhone,
        email: govEmail
      });

      setSuccessMessage('Profile updated successfully');
      setIsEditing(false);
    } catch {
      setError('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
    // Reset form values
    if (currentUser) {
      setName(currentUser.name);
      setAge(currentUser.age.toString());
      setEmail(currentUser.email);
    }

    if (govUser) {
      setGovName(govUser.name);
      setGovAddress(`${govUser.location.lat}, ${govUser.location.lng}`);
      setGovLatitude(govUser.location.lat.toString());
      setGovLongitude(govUser.location.lng.toString());
      setGovPhone(govUser.phone);
      setGovEmail(govUser.email);
    }

    setIsEditing(false);
    setError(null);
    setSuccessMessage(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNavigation />

      {/* Centered Logo Header - Flush with top */}
      <div className="bg-white border-b border-gray-200 md:pl-64 pt-0 md:pt-0">
        <div className="flex items-center justify-center py-2 md:py-3">
          <div className="flex items-center">
            <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
              <img
                src="/logo2.jpg"
                alt="FixMyPothole.AI Logo"
                className="w-12 h-12 md:w-16 md:h-16 object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar spacing */}
      <div className="md:pl-64">
        <div className="max-w-lg mx-auto p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6 animate-pop-in">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              {isGovUser ? (
                <Shield className="h-6 w-6 text-blue-500" />
              ) : (
                <User className="h-6 w-6 text-blue-500" />
              )}
            </div>
            <h1 className="text-2xl font-bold">
              {isGovUser ? 'Government Profile' : 'Edit Profile'}
            </h1>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            <LogOut size={18} className="mr-2" />
            Logout
          </button>
        </div>
      
      {successMessage && (
        <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-lg animate-fade-in">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg animate-fade-in">
          {error}
        </div>
      )}
      
      {!isGovUser && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6 animate-pop-in">
          <h2 className="font-semibold mb-2">Reporting Stats</h2>
          <div className="grid grid-cols-3 gap-4 mb-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {userReportsCount}
              </div>
              <div className="text-sm text-gray-600">Reports</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {currentUser?.points || 0}
              </div>
              <div className="text-sm text-gray-600">Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500 capitalize">
                {badge}
              </div>
              <div className="text-sm text-gray-600">Badge</div>
            </div>
          </div>
          
          <div className="w-full bg-white rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-700"
              style={{ 
                width: `${Math.min(100, (userPoints % 50) * 2)}%` 
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Get Badges on your Successfull Reports Verified by Government</span>
            <span>Next badge at {badge === 'none' ? 25 : badge === 'bronze' ? 50 : 100} points</span>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden animate-fade-in">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <h2 className="font-semibold">Profile Information</h2>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="text-red-500 hover:text-red-700"
            >
              Edit
            </button>
          )}
        </div>
        
        <div className="p-4">
          {isGovUser ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="govName\" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    id="govName"
                    value={govName}
                    onChange={(e) => setGovName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded-md">{govName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Office Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={govAddress}
                    onChange={(e) => setGovAddress(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter office address"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded-md">{govAddress}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="govLatitude" className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="any"
                      id="govLatitude"
                      value={govLatitude}
                      onChange={(e) => setGovLatitude(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="40.7128"
                      min="-90"
                      max="90"
                    />
                  ) : (
                    <p className="p-2 bg-gray-50 rounded-md">{govLatitude}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="govLongitude" className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="any"
                      id="govLongitude"
                      value={govLongitude}
                      onChange={(e) => setGovLongitude(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="-74.0060"
                      min="-180"
                      max="180"
                    />
                  ) : (
                    <p className="p-2 bg-gray-50 rounded-md">{govLongitude}</p>
                  )}
                </div>
              </div>
              {isEditing && (
                <p className="text-xs text-gray-500 -mt-2">
                  These coordinates determine your 5km radius assignment
                </p>
              )}
              
              <div>
                <label htmlFor="govPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    id="govPhone"
                    value={govPhone}
                    onChange={(e) => setGovPhone(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded-md">{govPhone}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="govEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    id="govEmail"
                    value={govEmail}
                    onChange={(e) => setGovEmail(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded-md">{govEmail}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded-md">{name}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    id="age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    min="13"
                    max="120"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded-md">{age}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded-md">{email}</p>
                )}
              </div>
            </div>
          )}
          
          {isEditing && (
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-red-500 border border-gray-300 rounded-md text-white hover:bg-red-600"
              >
                Cancel
              </button>
              
              <button
                onClick={isGovUser ? handleGovSave : handleCitizenSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : (
                  <>
                    <Save size={18} className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Profile;