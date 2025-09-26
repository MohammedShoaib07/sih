#!/usr/bin/env python3
"""
Email Service Module for Pothole Detection System
Sends clean, professional emails with pothole report data
"""

import os
import smtplib
import ssl
import base64
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Email configuration
EMAIL_USER = os.getenv('EMAIL_USER')
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD')
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'mohammedafaaz433@gmail.com')

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmailService:
    """Professional email service for pothole reports"""
    
    def __init__(self):
        self.email_user = EMAIL_USER
        self.email_password = EMAIL_PASSWORD
        self.smtp_server = SMTP_SERVER
        self.smtp_port = SMTP_PORT
        self.admin_email = ADMIN_EMAIL
        
        # Validate configuration
        if not self.email_user or not self.email_password:
            raise ValueError("Email configuration missing. Please set EMAIL_USER and EMAIL_PASSWORD in .env file")
    
    def send_pothole_report(self, user_email, user_name, detections_data, location_data, images_data):
        """
        Send pothole report to both user and administrator
        
        Args:
            user_email (str): Email of the user who submitted the report
            user_name (str): Name of the user who submitted the report
            detections_data (list): List of detection data for all images
            location_data (dict): Location information with lat, lng, address
            images_data (list): List of base64 image data
        
        Returns:
            tuple: (success, error_message)
        """
        try:
            # Send only to administrator (mohammedafaaz433@gmail.com)
            admin_success, admin_error = self._send_email(
                recipient_email=self.admin_email,
                recipient_name="Administrator",
                user_email=user_email,
                user_name=user_name,
                detections_data=detections_data,
                location_data=location_data,
                images_data=images_data,
                is_admin=True
            )

            # Return admin email result only
            return admin_success, admin_error
            
        except Exception as e:
            logger.error(f"Email service error: {str(e)}")
            return False, str(e)
    
    def _send_email(self, recipient_email, recipient_name, user_email, user_name, 
                   detections_data, location_data, images_data, is_admin=False):
        """
        Send email to a specific recipient
        
        Returns:
            tuple: (success, error_message)
        """
        try:
            # Create message with related multipart for inline images
            msg = MIMEMultipart('related')
            msg['Subject'] = 'FixMyPothole.AI - Pothole Detection Report'
            msg['From'] = self.email_user
            msg['To'] = recipient_email
            
            # Generate email body
            html_body = self._generate_email_body(
                recipient_name, user_email, user_name, 
                detections_data, location_data, images_data, is_admin
            )
            
            # Create the main message body
            msg_body = MIMEText(html_body, 'html')
            msg.attach(msg_body)

            # Attach images as inline content
            self._attach_images(msg, images_data)
            
            # Send email
            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=context)
                server.login(self.email_user, self.email_password)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {recipient_email}")
            return True, None
            
        except Exception as e:
            error_msg = f"Failed to send email to {recipient_email}: {str(e)}"
            logger.error(error_msg)
            return False, error_msg



    def _generate_email_body(self, recipient_name, user_email, user_name,
                           detections_data, location_data, images_data, is_admin):
        """Generate clean, professional email HTML body"""
        
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Calculate statistics
        total_detections = sum(len(img_detections) for img_detections in detections_data)
        highest_severity = 'Low'
        max_confidence = 0.0
        
        for img_detections in detections_data:
            for detection in img_detections:
                confidence = detection.get('confidence', 0)
                if confidence > max_confidence:
                    max_confidence = confidence
                
                severity = detection.get('severity', 'Low')
                severity_levels = {'High': 3, 'Medium': 2, 'Low': 1}
                if severity_levels.get(severity, 1) > severity_levels.get(highest_severity, 1):
                    highest_severity = severity
        
        # Location information
        location_text = "Location not available"
        if location_data:
            lat = location_data.get('latitude')
            lng = location_data.get('longitude')
            address = location_data.get('address', '')
            
            if lat is not None and lng is not None:
                location_text = f"{lat:.6f}, {lng:.6f}"
                if address:
                    location_text += f" - {address}"
        
        # Generate HTML
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>FixMyPothole.AI - Pothole Detection Report</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f5f5f5; }}
                .container {{ max-width: 800px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                .header {{ background: #2c3e50; color: white; padding: 30px; text-align: center; }}
                .header h1 {{ margin: 0; font-size: 24px; }}
                .header p {{ margin: 10px 0 0 0; opacity: 0.9; }}
                .content {{ padding: 30px; }}
                .section {{ margin-bottom: 25px; }}
                .section h2 {{ color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 8px; margin-bottom: 15px; }}
                table {{ width: 100%; border-collapse: collapse; margin: 15px 0; }}
                th, td {{ padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }}
                th {{ background-color: #f8f9fa; font-weight: bold; color: #495057; }}
                .severity-high {{ color: #dc3545; font-weight: bold; }}
                .severity-medium {{ color: #fd7e14; font-weight: bold; }}
                .severity-low {{ color: #28a745; font-weight: bold; }}
                .stats {{ display: flex; justify-content: space-around; margin: 20px 0; }}
                .stat {{ text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px; }}
                .stat-number {{ font-size: 24px; font-weight: bold; color: #2c3e50; }}
                .stat-label {{ color: #6c757d; font-size: 14px; }}
                .footer {{ background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }}
                .image-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 20px 0; }}
                .image-item {{ text-align: center; }}
                .image-item img {{ max-width: 100%; border-radius: 8px; border: 2px solid #ddd; }}
                .image-title {{ font-weight: bold; margin: 10px 0 5px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>FixMyPothole.AI</h1>
                    <p>Pothole Detection Report</p>
                    <p>Generated: {current_time}</p>
                </div>
                
                <div class="content">
                    <div class="section">
                        <h2>Summary</h2>
                        <div class="stats">
                            <div class="stat">
                                <div class="stat-number">{total_detections}</div>
                                <div class="stat-label">Total Detections</div>
                            </div>
                            <div class="stat">
                                <div class="stat-number severity-{highest_severity.lower()}">{highest_severity}</div>
                                <div class="stat-label">Highest Severity</div>
                            </div>
                            <div class="stat">
                                <div class="stat-number">{max_confidence*100:.1f}%</div>
                                <div class="stat-label">Max Confidence</div>
                            </div>
                            <div class="stat">
                                <div class="stat-number">{len(images_data)}</div>
                                <div class="stat-label">Images Analyzed</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="section">
                        <h2>Report Information</h2>
                        <table>
                            <tr><td><strong>Reporter Name</strong></td><td>{user_name}</td></tr>
                            <tr><td><strong>Reporter Email</strong></td><td>{user_email}</td></tr>
                            <tr><td><strong>Report Time</strong></td><td>{current_time}</td></tr>
                            <tr><td><strong>Location</strong></td><td>{location_text}</td></tr>
                            <tr><td><strong>Google Maps</strong></td><td>{self._generate_google_maps_link(location_data)}</td></tr>
                        </table>
                    </div>

                    <div class="section">
                        <h2>Detection Results</h2>
                        {self._generate_detection_table(detections_data)}
                    </div>

                    <div class="section">
                        <h2>Analyzed Images</h2>
                        <p style="margin-bottom: 15px; color: #495057;">
                            All {len(images_data)} uploaded images from this pothole report are displayed below:
                        </p>
                        <div class="image-grid">
                            {self._generate_image_grid(images_data)}
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <p><strong>TEAM AURACODE</strong> - Images Processed using YOLOv8 Model</p>
                </div>
            </div>
        </body>
        </html>
        """

        return html_body

    def _generate_detection_table(self, detections_data):
        """Generate HTML table with all detection results"""
        if not detections_data or not any(detections_data):
            return '<p style="text-align: center; color: #28a745; padding: 20px;">No potholes detected in the analyzed images</p>'

        table_html = """
        <table>
            <thead>
                <tr>
                    <th>Image #</th>
                    <th>Detection #</th>
                    <th>Type</th>
                    <th>Severity</th>
                    <th>Confidence</th>
                    <th>Size</th>
                </tr>
            </thead>
            <tbody>
        """

        for img_idx, img_detections in enumerate(detections_data):
            if img_detections:
                for det_idx, detection in enumerate(img_detections):
                    severity = detection.get('severity', 'Medium')
                    severity_class = f"severity-{severity.lower()}"
                    confidence = detection.get('confidence', 0) * 100
                    size = detection.get('relative_size', 0) * 100
                    detection_type = detection.get('class', 'Pothole').title()

                    table_html += f"""
                    <tr>
                        <td>#{img_idx + 1}</td>
                        <td>#{det_idx + 1}</td>
                        <td>{detection_type}</td>
                        <td><span class="{severity_class}">{severity}</span></td>
                        <td>{confidence:.1f}%</td>
                        <td>{size:.1f}%</td>
                    </tr>
                    """
            else:
                table_html += f"""
                <tr>
                    <td>#{img_idx + 1}</td>
                    <td colspan="5" style="text-align: center; color: #6c757d;">No detections in this image</td>
                </tr>
                """

        table_html += """
            </tbody>
        </table>
        """

        return table_html

    def _generate_image_grid(self, images_data):
        """Generate HTML for image grid with CID references"""
        image_grid_html = ""

        for i in range(len(images_data)):
            image_grid_html += f"""
            <div class="image-item">
                <div class="image-title">Image {i + 1}</div>
                <img src="cid:image_{i + 1}" alt="Pothole analysis image {i + 1}" style="max-width: 100%; height: auto; border-radius: 8px; border: 2px solid #ddd;">
            </div>
            """

        return image_grid_html

    def _generate_google_maps_link(self, location_data):
        """Generate clickable Google Maps link"""
        if not location_data:
            return "Location not available"

        lat = location_data.get('latitude')
        lng = location_data.get('longitude')

        if lat is None or lng is None:
            return "Coordinates not available"

        # Format the Google Maps URL as specified
        maps_url = f"https://www.google.com/maps?q={lat},{lng}"
        return f'<a href="{maps_url}" target="_blank" style="color: #3498db; text-decoration: none;">View on Google Maps</a>'
    
    def _attach_images(self, msg, images_data):
        """Attach pothole images as inline embedded content with robust error handling"""
        for i, image_data in enumerate(images_data):
            try:
                # Validate image data
                if not image_data:
                    logger.warning(f"Empty image data for image {i + 1}, skipping")
                    continue

                # Handle base64 image data
                image_bytes = None
                if image_data.startswith('data:image'):
                    # Extract base64 data
                    try:
                        _, encoded = image_data.split(',', 1)
                        # Fix base64 padding if needed
                        encoded = self._fix_base64_padding(encoded)
                        image_bytes = base64.b64decode(encoded)
                    except Exception as decode_error:
                        logger.error(f"Failed to decode data URI for image {i + 1}: {decode_error}")
                        continue
                else:
                    # Assume it's already base64 encoded
                    try:
                        # Fix base64 padding if needed
                        encoded = self._fix_base64_padding(image_data)
                        image_bytes = base64.b64decode(encoded)
                    except Exception as decode_error:
                        logger.error(f"Failed to decode base64 for image {i + 1}: {decode_error}")
                        continue

                # Validate decoded image bytes
                if not image_bytes or len(image_bytes) < 100:  # Minimum reasonable image size
                    logger.warning(f"Invalid or too small image data for image {i + 1}, skipping")
                    continue

                # Create inline image attachment
                try:
                    img_attachment = MIMEImage(image_bytes)

                    # Set Content-ID for inline embedding
                    img_attachment.add_header('Content-ID', f'<image_{i + 1}>')

                    # Set as inline disposition
                    img_attachment.add_header('Content-Disposition', 'inline')

                    # Add to message
                    msg.attach(img_attachment)

                    logger.info(f"Successfully attached inline image {i + 1} with CID: image_{i + 1} (size: {len(image_bytes)} bytes)")

                except Exception as attachment_error:
                    logger.error(f"Failed to create attachment for image {i + 1}: {attachment_error}")
                    continue

            except Exception as e:
                logger.error(f"Unexpected error processing image {i + 1}: {e}")
                continue

    def _fix_base64_padding(self, data):
        """Fix base64 padding if needed"""
        missing_padding = len(data) % 4
        if missing_padding:
            data += '=' * (4 - missing_padding)
        return data
