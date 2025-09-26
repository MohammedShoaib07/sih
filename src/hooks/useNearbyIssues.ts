import { useState, useEffect } from 'react';
import { TextReport } from '../types';
import { useAppStore } from '../store';

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const useNearbyIssues = (
  userLocation: { lat: number; lng: number } | null,
  radius: number = 5 // Default radius in km
) => {
  const { textReports } = useAppStore();
  const [nearbyIssues, setNearbyIssues] = useState<TextReport[]>([]);

  useEffect(() => {
    if (!userLocation) {
      setNearbyIssues([]);
      return;
    }

    const filtered = textReports.filter((report) => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        report.location.lat,
        report.location.lng
      );
      return distance <= radius;
    });

    // Sort by distance and priority
    const sorted = filtered.sort((a, b) => {
      // First sort by priority
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (b.priority === 'high' && a.priority !== 'high') return 1;

      // Then sort by distance
      const distanceA = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        a.location.lat,
        a.location.lng
      );
      const distanceB = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        b.location.lat,
        b.location.lng
      );
      return distanceA - distanceB;
    });

    setNearbyIssues(sorted);
  }, [userLocation, textReports, radius]);

  return nearbyIssues;
};