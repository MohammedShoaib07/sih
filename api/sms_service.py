import requests
import os
from datetime import datetime, timedelta
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)

class SMSService:
    def __init__(self):
        # Fast2SMS configuration
        self.api_key = os.getenv('FAST2SMS_API_KEY', '')
        self.base_url = "https://www.fast2sms.com/dev/bulkV2"
        
        # Rate limiting to prevent spam
        self.sent_alerts = defaultdict(list)  # location_key -> [timestamps]
        self.max_alerts_per_day = 1
        
        if not self.api_key:
            logger.warning("Fast2SMS API key not configured - SMS alerts disabled")
    
    def is_enabled(self):
        return bool(self.api_key)
    
    def _get_location_key(self, lat, lng):
        """Generate a location key for rate limiting (rounded to ~100m precision)"""
        return f"{round(lat, 3)}_{round(lng, 3)}"
    
    def _can_send_alert(self, location_key):
        """Check if we can send an alert for this location (rate limiting)"""
        now = datetime.now()
        yesterday = now - timedelta(days=1)
        
        # Clean old alerts
        self.sent_alerts[location_key] = [
            timestamp for timestamp in self.sent_alerts[location_key]
            if timestamp > yesterday
        ]
        
        # Check if we've exceeded the daily limit
        return len(self.sent_alerts[location_key]) < self.max_alerts_per_day
    
    def send_high_priority_alert(self, phone_numbers, location_data, report_count):
        """Send SMS alert for high-priority pothole location"""
        if not self.is_enabled():
            logger.warning("SMS service not enabled - skipping alert")
            return False, "SMS service not configured"
        
        if not phone_numbers:
            return False, "No phone numbers provided"
        
        # Generate location key for rate limiting
        location_key = self._get_location_key(
            location_data.get('lat', 0), 
            location_data.get('lng', 0)
        )
        
        # Check rate limiting
        if not self._can_send_alert(location_key):
            logger.info(f"Rate limit reached for location {location_key}")
            return False, "Daily alert limit reached for this location"
        
        # Prepare message
        address = location_data.get('address', f"Lat: {location_data.get('lat', 'N/A')}, Lng: {location_data.get('lng', 'N/A')}")
        message = f"HIGH PRIORITY ALERT: {report_count} pothole reports received at {address}. Immediate attention required. - FixMyPothole.AI"
        
        # Prepare phone numbers (remove +91 prefix if present, Fast2SMS adds it automatically)
        clean_numbers = []
        for number in phone_numbers:
            clean_number = str(number).replace('+91', '').replace(' ', '').replace('-', '')
            if len(clean_number) == 10 and clean_number.isdigit():
                clean_numbers.append(clean_number)
        
        if not clean_numbers:
            return False, "No valid phone numbers found"
        
        try:
            # Fast2SMS API payload
            payload = {
                'authorization': self.api_key,
                'message': message,
                'numbers': ','.join(clean_numbers),
                'route': 'q',  # Promotional route (free tier)
                'sender_id': 'FXPTHL'  # 6-character sender ID
            }
            
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            
            response = requests.post(self.base_url, data=payload, headers=headers, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('return') == True:
                    # Mark alert as sent
                    self.sent_alerts[location_key].append(datetime.now())
                    logger.info(f"SMS alert sent successfully to {len(clean_numbers)} numbers")
                    return True, f"Alert sent to {len(clean_numbers)} recipients"
                else:
                    error_msg = result.get('message', 'Unknown error')
                    logger.error(f"Fast2SMS API error: {error_msg}")
                    return False, f"SMS API error: {error_msg}"
            else:
                logger.error(f"Fast2SMS HTTP error: {response.status_code}")
                return False, f"SMS service error: {response.status_code}"
                
        except requests.exceptions.Timeout:
            logger.error("SMS request timeout")
            return False, "SMS request timeout"
        except requests.exceptions.RequestException as e:
            logger.error(f"SMS request error: {e}")
            return False, f"SMS request failed: {str(e)}"
        except Exception as e:
            logger.error(f"Unexpected SMS error: {e}")
            return False, f"Unexpected error: {str(e)}"
    
    def send_test_sms(self, phone_number, test_message="Test message from FixMyPothole.AI"):
        """Send a test SMS to verify configuration"""
        if not self.is_enabled():
            return False, "SMS service not configured"
        
        clean_number = str(phone_number).replace('+91', '').replace(' ', '').replace('-', '')
        if len(clean_number) != 10 or not clean_number.isdigit():
            return False, "Invalid phone number format"
        
        try:
            payload = {
                'authorization': self.api_key,
                'message': test_message,
                'numbers': clean_number,
                'route': 'q',
                'sender_id': 'FXPTHL'
            }
            
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            
            response = requests.post(self.base_url, data=payload, headers=headers, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('return') == True:
                    return True, "Test SMS sent successfully"
                else:
                    return False, result.get('message', 'Unknown error')
            else:
                return False, f"HTTP error: {response.status_code}"
                
        except Exception as e:
            return False, f"Error: {str(e)}"