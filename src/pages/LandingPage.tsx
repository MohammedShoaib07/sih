import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, Zap } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top brand header (matches home header style) */}
      <div className="bg-white border-b border-gray-200 pt-0 md:pt-0 mt-0">
        <div className="flex items-center justify-center py-2 md:py-3">
          <div className="flex items-center">
            <div className="w-10 h-10 md:w-16 md:h-16 flex items-center justify-center">
              <img
                src="/logo2.jpg"
                alt="FixMyPothole.AI Logo"
                className="w-10 h-10 md:w-16 md:h-16 object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/70 via-white to-white" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
              {/* Left: Text */}
              <div>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                  Fix potholes faster with AI-powered reporting
                </h1>
                <p className="mt-4 md:mt-6 text-base md:text-lg text-gray-600 max-w-2xl">
                  FixMyPothole.AI helps citizens and local governments detect, report and resolve potholes quickly.
                  Clear visibility on a live map, smart triage, and collaborative tools get roads fixed sooner.
                </p>
                <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              </div>

              {/* Right: Visual */}
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 md:p-6">
                  <div className="aspect-[16/10] w-full rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center">
                    <img
                      src="/logo2.jpg"
                      alt="FixMyPothole.AI"
                      className="w-28 h-28 md:w-44 md:h-44 object-contain drop-shadow"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-500">
        TEAM AURACODE
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
