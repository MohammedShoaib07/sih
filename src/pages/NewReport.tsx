import React from 'react';
import ReportForm from '../components/ReportForm';
import MobileNavigation from '../components/MobileNavigation';

const NewReport: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNavigation />

      {/* Desktop sidebar spacing */}
      <div className="md:pl-64">
        <div className="p-4">
          <ReportForm />
        </div>
      </div>
    </div>
  );
};

export default NewReport;