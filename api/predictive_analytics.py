import google.generativeai as genai
import json
import os
import re
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from sklearn.cluster import DBSCAN
import logging

logger = logging.getLogger(__name__)

class PredictiveAnalytics:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY', '')
        self.model = None
        
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
                logger.info("Predictive Analytics initialized with Gemini AI")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini AI: {e}")
        else:
            logger.warning("Gemini API key not configured - predictive analytics disabled")
    
    def is_enabled(self):
        return self.model is not None
    
    def predict_pothole_conditions(self, location_data: Dict, historical_reports: List[Dict], time_range: str = 'week') -> Dict[str, Any]:
        """Predict pothole conditions for a specific area using Gemini AI and statistical analysis"""
        if not self.is_enabled():
            return self._fallback_prediction(location_data, historical_reports, time_range)

        try:
            # Process historical data
            df = self._process_historical_data(historical_reports, location_data)
            
            # Identify hotspots
            hotspots = self._identify_hotspots(df)
            
            # Generate AI prompt with historical data
            prompt = self._generate_ai_prompt(df, location_data, time_range)
            
            # Get AI prediction
            response = self.model.generate_content(prompt)
            ai_insights = self._parse_ai_response(response.text)
            
            # Combine AI insights with statistical analysis
            statistical_trends = self._analyze_trends(df)
            
            result = {
                'predictedSeverity': ai_insights.get('severity', statistical_trends['prediction']),
                'confidence': float(ai_insights.get('confidence', 0.7)),
                'hotspots': hotspots,
                'trends': {
                    'ai': ai_insights.get('trends', {}),
                    'statistical': statistical_trends
                }
            }
            
            return result
        except Exception as e:
            logger.error(f"Error in AI prediction: {e}")
            return self._fallback_prediction(location_data, historical_reports, time_range)

    def _fallback_prediction(self, location_data: Dict, historical_reports: List[Dict], time_range: str) -> Dict[str, Any]:
        """Statistical fallback when AI prediction fails"""
        try:
            df = self._process_historical_data(historical_reports, location_data)
            hotspots = self._identify_hotspots(df)
            trends = self._analyze_trends(df)
            
            return {
                'predictedSeverity': trends['prediction'],
                'confidence': 0.6,  # Lower confidence for statistical-only prediction
                'hotspots': hotspots,
                'trends': {
                    'statistical': trends
                }
            }
        except Exception as e:
            logger.error(f"Error in fallback prediction: {e}")
            return {
                'predictedSeverity': 'low',
                'confidence': 0.3,
                'hotspots': [],
                'trends': {
                    'statistical': {
                        'trend': 'stable',
                        'frequency': 0,
                        'prediction': 'low'
                    }
                }
            }

    def _process_historical_data(self, reports: List[Dict], location: Dict[str, float], 
                               radius_km: float = 5) -> pd.DataFrame:
        """Process historical reports into a DataFrame for analysis"""
        relevant_reports = []
        
        for report in reports:
            report_lat = report['location']['lat']
            report_lng = report['location']['lng']
            
            # Calculate distance from target location
            distance = np.sqrt(
                (report_lat - location['lat'])**2 + 
                (report_lng - location['lng'])**2
            ) * 111  # Rough conversion to km
            
            if distance <= radius_km:
                report_data = {
                    'latitude': report_lat,
                    'longitude': report_lng,
                    'severity': report['severity'],
                    'created_at': pd.to_datetime(report['createdAt']),
                    'type': report.get('type', 'pothole'),
                    'verified': report['verified'],
                    'fixing_status': report['fixingStatus'],
                }
                relevant_reports.append(report_data)
        
        return pd.DataFrame(relevant_reports)

    def _identify_hotspots(self, df: pd.DataFrame, eps_km: float = 0.1) -> List[Dict]:
        """Identify clusters of reports using DBSCAN"""
        if df.empty:
            return []
            
        # Convert eps from km to degrees (rough approximation)
        eps_degrees = eps_km / 111
        
        coords = df[['latitude', 'longitude']].values
        clustering = DBSCAN(eps=eps_degrees, min_samples=3).fit(coords)
        
        hotspots = []
        for cluster_id in set(clustering.labels_):
            if cluster_id == -1:  # Skip noise points
                continue
                
            cluster_points = coords[clustering.labels_ == cluster_id]
            cluster_center = cluster_points.mean(axis=0)
            cluster_size = len(cluster_points)
            
            hotspots.append({
                'lat': float(cluster_center[0]),
                'lng': float(cluster_center[1]),
                'intensity': min(1.0, cluster_size / 10),  # Normalize intensity
                'count': int(cluster_size)
            })
        
        return hotspots

    def _analyze_trends(self, df: pd.DataFrame) -> Dict:
        """Analyze reporting trends over time"""
        if df.empty:
            return {
                'trend': 'stable',
                'frequency': 0,
                'prediction': 'low'
            }
            
        # Calculate weekly frequencies
        weekly_counts = df.resample('W', on='created_at').size()
        
        if len(weekly_counts) < 2:
            return {
                'trend': 'stable',
                'frequency': float(weekly_counts.mean() if not weekly_counts.empty else 0),
                'prediction': 'low'
            }
            
        # Calculate trend
        slope = np.polyfit(range(len(weekly_counts)), weekly_counts.values, 1)[0]
        
        trend = 'increasing' if slope > 0.1 else 'decreasing' if slope < -0.1 else 'stable'
        
        # Predict severity based on recent frequency and trend
        recent_frequency = float(weekly_counts[-4:].mean())  # Last 4 weeks
        
        prediction = 'high' if recent_frequency > 5 or (trend == 'increasing' and recent_frequency > 3) else \
                    'medium' if recent_frequency > 2 or trend == 'increasing' else \
                    'low'
                    
        return {
            'trend': trend,
            'frequency': recent_frequency,
            'prediction': prediction
        }

    def _generate_ai_prompt(self, df: pd.DataFrame, location: Dict[str, float], time_range: str) -> str:
        """Generate prompt for Gemini AI"""
        recent_reports = df[df['created_at'] >= pd.Timestamp.now() - pd.Timedelta(time_range)]
        
        stats = {
            'total_reports': len(df),
            'recent_reports': len(recent_reports),
            'high_severity': len(df[df['severity'] == 'high']),
            'verified_reports': len(df[df['verified'] == 'verified']),
            'resolved_reports': len(df[df['fixing_status'] == 'resolved'])
        }
        
        prompt = f"""Analyze road hazard conditions for location ({location['lat']}, {location['lng']}).

Historical data summary:
- Total reports: {stats['total_reports']}
- Recent reports ({time_range}): {stats['recent_reports']}
- High severity reports: {stats['high_severity']}
- Verified reports: {stats['verified_reports']}
- Resolved issues: {stats['resolved_reports']}

Based on this data, predict:
1. Expected hazard severity (high/medium/low)
2. Confidence level (0-1)
3. Reporting trends and patterns
4. Recommendations for monitoring/intervention"""
        
        return prompt

    def _parse_ai_response(self, response_text: str) -> Dict[str, Any]:
        """Parse Gemini AI response into structured data"""
        try:
            # Extract severity
            severity_keywords = {
                'high': ['high', 'severe', 'critical', 'dangerous'],
                'medium': ['medium', 'moderate', 'intermediate'],
                'low': ['low', 'minor', 'minimal']
            }
            
            severity = 'medium'  # Default
            for level, keywords in severity_keywords.items():
                if any(keyword in response_text.lower() for keyword in keywords):
                    severity = level
                    break
            
            # Extract confidence (look for numbers between 0 and 1)
            import re
            confidence_matches = re.findall(r'confidence[\s:]+([0-9.]+)', response_text.lower())
            confidence = float(confidence_matches[0]) if confidence_matches else 0.7
            
            # Extract trends
            trends = {
                'description': '',
                'recommendations': []
            }
            
            # Look for trend indicators
            if 'trend' in response_text.lower():
                trend_section = response_text.split('trend')[1].split('\n')[0]
                trends['description'] = trend_section.strip()
            
            # Look for recommendations
            recommendations = []
            for line in response_text.split('\n'):
                if any(word in line.lower() for word in ['recommend', 'suggest', 'should', 'need to']):
                    recommendations.append(line.strip())
            
            trends['recommendations'] = recommendations
            
            return {
                'severity': severity,
                'confidence': min(1.0, max(0.0, confidence)),
                'trends': trends
            }
            
        except Exception as e:
            logger.error(f"Error parsing AI response: {e}")
            return {
                'severity': 'medium',
                'confidence': 0.5,
                'trends': {
                    'description': 'Error parsing AI response',
                    'recommendations': []
                }
            }
            return self._generate_mock_prediction(location_data)
        
        try:
            # Prepare historical data summary
            report_summary = self._summarize_historical_reports(historical_reports)
            
            # Create prediction prompt
            prompt = f"""
            Analyze the following data to predict pothole conditions and trends:
            
            Location: {location_data.get('address', 'Unknown location')}
            Coordinates: {location_data.get('lat', 'N/A')}, {location_data.get('lng', 'N/A')}
            
            Historical Report Data:
            - Total reports in area: {len(historical_reports)}
            - Report summary: {report_summary}
            
            Please provide predictions in the following JSON format:
            {{
                "predicted_severity": "high|medium|low",
                "confidence": 0.75,
                "risk_factors": ["factor1", "factor2", "factor3"],
                "timeframe": "Next 30 days",
                "trend_analysis": {{
                    "increasing": true,
                    "peak_months": ["month1", "month2"],
                    "seasonal_pattern": "description"
                }},
                "recommendations": ["recommendation1", "recommendation2"],
                "weather_impact": "description of how weather affects potholes in this area"
            }}
            
            Base your predictions on:
            1. Historical report frequency and severity
            2. Seasonal patterns (monsoon, winter effects)
            3. Traffic density implications
            4. Road infrastructure age
            5. Weather patterns typical for the region
            """
            
            response = self.model.generate_content(prompt)
            
            if response.text:
                try:
                    # Extract JSON from response
                    json_start = response.text.find('{')
                    json_end = response.text.rfind('}') + 1
                    
                    if json_start != -1 and json_end != -1:
                        json_str = response.text[json_start:json_end]
                        prediction_data = json.loads(json_str)
                        
                        # Add metadata
                        prediction_data.update({
                            'generated_at': datetime.now().isoformat(),
                            'location': location_data,
                            'data_points': len(historical_reports),
                            'model': 'gemini-1.5-flash'
                        })
                        
                        return prediction_data
                    else:
                        logger.warning("No valid JSON found in Gemini response")
                        return self._generate_mock_prediction(location_data)
                        
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse Gemini JSON response: {e}")
                    return self._generate_mock_prediction(location_data)
            else:
                logger.warning("Empty response from Gemini AI")
                return self._generate_mock_prediction(location_data)
                
        except Exception as e:
            logger.error(f"Error generating predictions: {e}")
            return self._generate_mock_prediction(location_data)
    
    def generate_trend_forecast(self, historical_reports: List[Dict], area_name: str = "Selected Area") -> Dict[str, Any]:
        """Generate reporting trend forecasts using Gemini AI"""
        if not self.is_enabled():
            return self._generate_mock_trends(historical_reports, area_name)
        
        try:
            # Analyze historical patterns
            monthly_data = self._analyze_monthly_patterns(historical_reports)
            severity_distribution = self._analyze_severity_distribution(historical_reports)
            
            prompt = f"""
            Analyze pothole reporting trends for {area_name} and provide forecasts:
            
            Historical Data:
            - Total reports: {len(historical_reports)}
            - Monthly distribution: {monthly_data}
            - Severity distribution: {severity_distribution}
            
            Provide trend analysis in JSON format:
            {{
                "forecast_period": "Next 6 months",
                "predicted_reports": {{
                    "month1": 15,
                    "month2": 18,
                    "month3": 22
                }},
                "trend_direction": "increasing|decreasing|stable",
                "peak_periods": ["monsoon", "post-winter"],
                "issue_type_trends": {{
                    "potholes": "increasing",
                    "drainage": "stable",
                    "street_lamps": "decreasing"
                }},
                "recommendations": [
                    "Increase maintenance before monsoon",
                    "Focus on high-traffic areas"
                ],
                "confidence_level": 0.8
            }}
            """
            
            response = self.model.generate_content(prompt)
            
            if response.text:
                try:
                    json_start = response.text.find('{')
                    json_end = response.text.rfind('}') + 1
                    
                    if json_start != -1 and json_end != -1:
                        json_str = response.text[json_start:json_end]
                        trend_data = json.loads(json_str)
                        
                        trend_data.update({
                            'generated_at': datetime.now().isoformat(),
                            'area_name': area_name,
                            'data_points': len(historical_reports),
                            'model': 'gemini-1.5-flash'
                        })
                        
                        return trend_data
                    else:
                        return self._generate_mock_trends(historical_reports, area_name)
                        
                except json.JSONDecodeError:
                    return self._generate_mock_trends(historical_reports, area_name)
            else:
                return self._generate_mock_trends(historical_reports, area_name)
                
        except Exception as e:
            logger.error(f"Error generating trend forecast: {e}")
            return self._generate_mock_trends(historical_reports, area_name)
    
    def _summarize_historical_reports(self, reports: List[Dict]) -> str:
        """Summarize historical reports for AI analysis"""
        if not reports:
            return "No historical data available"
        
        # Count by severity
        severity_counts = {'high': 0, 'medium': 0, 'low': 0}
        for report in reports:
            severity = report.get('severity', 'medium')
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
        
        # Recent activity
        recent_reports = [r for r in reports if self._is_recent(r.get('createdAt'))]
        
        return f"High: {severity_counts['high']}, Medium: {severity_counts['medium']}, Low: {severity_counts['low']}. Recent activity: {len(recent_reports)} reports in last 30 days."
    
    def _analyze_monthly_patterns(self, reports: List[Dict]) -> Dict[str, int]:
        """Analyze monthly reporting patterns"""
        monthly_counts = {}
        for report in reports:
            try:
                if isinstance(report.get('createdAt'), str):
                    date = datetime.fromisoformat(report['createdAt'].replace('Z', '+00:00'))
                else:
                    date = report.get('createdAt', datetime.now())
                
                month_key = date.strftime('%Y-%m')
                monthly_counts[month_key] = monthly_counts.get(month_key, 0) + 1
            except:
                continue
        
        return monthly_counts
    
    def _analyze_severity_distribution(self, reports: List[Dict]) -> Dict[str, int]:
        """Analyze severity distribution"""
        severity_counts = {'high': 0, 'medium': 0, 'low': 0}
        for report in reports:
            severity = report.get('severity', 'medium')
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
        
        return severity_counts
    
    def _is_recent(self, date_str) -> bool:
        """Check if a date is within the last 30 days"""
        try:
            if isinstance(date_str, str):
                date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            else:
                date = date_str
            
            return (datetime.now() - date).days <= 30
        except:
            return False
    
    def _generate_mock_prediction(self, location_data: Dict) -> Dict[str, Any]:
        """Generate mock prediction when AI is not available"""
        return {
            'predicted_severity': 'medium',
            'confidence': 0.65,
            'risk_factors': ['Heavy traffic', 'Monsoon season', 'Road age'],
            'timeframe': 'Next 30 days',
            'trend_analysis': {
                'increasing': True,
                'peak_months': ['July', 'August'],
                'seasonal_pattern': 'Higher activity during monsoon season'
            },
            'recommendations': [
                'Increase monitoring during monsoon',
                'Schedule preventive maintenance'
            ],
            'weather_impact': 'Monsoon rains likely to worsen existing potholes',
            'generated_at': datetime.now().isoformat(),
            'location': location_data,
            'data_points': 0,
            'model': 'mock-fallback'
        }
    
    def _generate_mock_trends(self, reports: List[Dict], area_name: str) -> Dict[str, Any]:
        """Generate mock trends when AI is not available"""
        return {
            'forecast_period': 'Next 6 months',
            'predicted_reports': {
                'month1': 12,
                'month2': 15,
                'month3': 18,
                'month4': 14,
                'month5': 16,
                'month6': 13
            },
            'trend_direction': 'stable',
            'peak_periods': ['monsoon', 'post-winter'],
            'issue_type_trends': {
                'potholes': 'stable',
                'drainage': 'increasing',
                'street_lamps': 'stable'
            },
            'recommendations': [
                'Monitor during peak seasons',
                'Focus on preventive maintenance'
            ],
            'confidence_level': 0.6,
            'generated_at': datetime.now().isoformat(),
            'area_name': area_name,
            'data_points': len(reports),
            'model': 'mock-fallback'
        }