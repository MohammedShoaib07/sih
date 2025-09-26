import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { User, Shield } from 'lucide-react';

const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const { 
    isGovUser, 
    createUser, 
    createGovUser 
  } = useAppStore();
  
  // Citizen user state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  
  // Government user state
  const [govName, setGovName] = useState('');
  const [govLocation, setGovLocation] = useState('');
  const [govPhone, setGovPhone] = useState('');
  const [govEmail, setGovEmail] = useState('');
  const [govLatitude, setGovLatitude] = useState('');
  const [govLongitude, setGovLongitude] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  
  const handleCitizenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !age || !email) {
      setError('All fields are required');
      return;
    }
    
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      setError('Please enter a valid age between 13 and 120');
      return;
    }
    
    createUser({
      name,
      age: ageNum,
      email,
      badge: 'none'
    });
    
    navigate('/home');
  };
  
  const handleGovSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!govName || !govLocation || !govPhone || !govEmail || !govLatitude || !govLongitude) {
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

    createGovUser({
      name: govName,
      location: { lat, lng },
      phone: govPhone,
      email: govEmail
    });

    // Set government location in store
    const { setGovLocation } = useAppStore.getState();
    setGovLocation({ lat, lng });

    navigate('/gov-home');
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden animate-pop-in">
        <div className="p-6 md:p-8">
          <div className="flex justify-center mb-6">
            {isGovUser ? (
              <Shield className="h-10 w-10 text-red-500" />
            ) : (
              <User className="h-10 w-10 text-blue-500" />
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-6">
            {isGovUser ? 'Government Official Setup' : 'Citizen Profile Setup'}
          </h1>
          
          {error && (
            <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {isGovUser ? (
            <form onSubmit={handleGovSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="govName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="govName"
                    value={govName}
                    onChange={(e) => setGovName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="govLocation" className="block text-sm font-medium text-gray-700 mb-1">
                    Office Address
                  </label>
                  <input
                    type="text"
                    id="govLocation"
                    value={govLocation}
                    onChange={(e) => setGovLocation(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter office address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="govLatitude" className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      id="govLatitude"
                      value={govLatitude}
                      onChange={(e) => setGovLatitude(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="40.7128"
                      min="-90"
                      max="90"
                    />
                  </div>
                  <div>
                    <label htmlFor="govLongitude" className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      id="govLongitude"
                      value={govLongitude}
                      onChange={(e) => setGovLongitude(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="-74.0060"
                      min="-180"
                      max="180"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 -mt-2">
                  These coordinates will determine your 5km radius assignment
                </p>
                
                <div>
                  <label htmlFor="govPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="govPhone"
                    value={govPhone}
                    onChange={(e) => setGovPhone(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div>
                  <label htmlFor="govEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="govEmail"
                    value={govEmail}
                    onChange={(e) => setGovEmail(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email address"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Complete Setup
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCitizenSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    id="age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="25"
                    min="13"
                    max="120"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email address"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Complete Profile
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;