import React, { useState } from 'react';
import ReportForm from '../components/ReportForm';
import ReportOtherIssue from '../components/ReportOtherIssue';
import MobileNavigation from '../components/MobileNavigation';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import { getCurrentLocation } from '../utils/location';

const NewReport: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  React.useEffect(() => {
    const getLocation = async () => {
      const location = await getCurrentLocation();
      if (location) {
        setUserLocation({ 
          lat: location.coords.latitude, 
          lng: location.coords.longitude 
        });
      }
    };
    getLocation();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNavigation />

      {/* Desktop sidebar spacing */}
      <div className="md:pl-64">
        <div className="p-4">
          <Typography variant="h5" component="h1" gutterBottom>
            Report an Issue
          </Typography>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Report Pothole" />
              <Tab label="Report Other Issue" />
            </Tabs>
          </Box>

          {activeTab === 0 ? (
            <ReportForm />
          ) : (
            <ReportOtherIssue 
              isOpen={true}
              onClose={() => setActiveTab(0)}
              userLocation={userLocation}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NewReport;