import { Report, TextReport } from '../types';

interface Location {
  lat: number;
  lng: number;
}

const PROXIMITY_THRESHOLD = 100; // meters
const REPORT_COUNT_THRESHOLD = 3;
const EARTH_RADIUS = 6371; // kilometers

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

const calculateDistance = (point1: Location, point2: Location): number => {
  const lat1 = toRadians(point1.lat);
  const lon1 = toRadians(point1.lng);
  const lat2 = toRadians(point2.lat);
  const lon2 = toRadians(point2.lng);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS * c;

  return distance * 1000; // Convert to meters
};

export const detectHighPriorityHazards = (
  reports: (Report | TextReport)[],
  location: Location,
  radius: number = 5000 // 5km in meters
): (Report | TextReport)[] => {
  // Filter reports within the given radius
  const nearbyReports = reports.filter(
    (report) =>
      calculateDistance(location, report.location) <= radius
  );

  // Group reports by proximity
  const clusters: (Report | TextReport)[][] = [];

  nearbyReports.forEach((report) => {
    let addedToCluster = false;

    // Try to add to existing cluster
    for (const cluster of clusters) {
      const referenceReport = cluster[0];
      if (
        calculateDistance(referenceReport.location, report.location) <=
        PROXIMITY_THRESHOLD
      ) {
        cluster.push(report);
        addedToCluster = true;
        break;
      }
    }

    // Create new cluster if not added to any existing cluster
    if (!addedToCluster) {
      clusters.push([report]);
    }
  });

  // Identify high-priority clusters
  const highPriorityReports = clusters
    .filter((cluster) => cluster.length >= REPORT_COUNT_THRESHOLD)
    .flat()
    .map((report) => ({
      ...report,
      priority: "high" as "high",
      reportCount: clusters.find((cluster) =>
        cluster.some((r) => r.id === report.id)
      )?.length || 1,
    }));

  return highPriorityReports;
};

export const shouldSendAlert = (
  lastAlertSent?: Date
): boolean => {
  if (!lastAlertSent) return true;

  // Check if 24 hours have passed since last alert
  const hoursSinceLastAlert =
    (new Date().getTime() - new Date(lastAlertSent).getTime()) / (1000 * 60 * 60);

  return hoursSinceLastAlert >= 24;
};