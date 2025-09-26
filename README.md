# 🚧 Pothole Detection System

An AI-powered pothole detection and reporting system that enables citizens to report road hazards and allows government officials to manage and track these reports efficiently.

## 🌟 Features

### 🏛️ Dual Portal System
- **Citizen Portal**: Public reporting interface with blue theme
- **Government Portal**: Administrative dashboard with red theme
- Separate authentication and role-based access control

### 🤖 AI-Powered Detection
- **YOLOv8 Integration**: Real-time pothole detection from images
- **Multi-Image Support**: Upload and analyze 1-5 images per report
- **Confidence Scoring**: AI confidence levels for each detection
- **Severity Classification**: Automatic High/Medium/Low severity assessment
- **Visual Annotations**: Overlay detected potholes on images

### 📧 Email Reporting System
- **Production Emails**: Real email delivery to administrator
- **Complete Reports**: All images, detection results, and location data
- **Google Maps Integration**: Clickable location links
- **Professional Format**: Clean HTML templates without emojis

### 📍 Location Services
- **GPS Integration**: Automatic location detection
- **Address Lookup**: Convert coordinates to readable addresses
- **Interactive Maps**: Mapbox integration for visualization
- **Manual Override**: Set location manually if needed

### 🎯 Advanced Features
- **Gemini AI Descriptions**: Optional AI-generated detailed descriptions
- **Voice Activation**: Hands-free reporting for driving safety
- **Mobile-First Design**: Responsive interface for all devices
- **Real-time Notifications**: Status updates and alerts

## 🛠️ Technology Stack

### Backend
- **Python Flask**: RESTful API server
- **YOLOv8**: Computer vision for pothole detection
- **Google Gemini AI**: Advanced AI descriptions
- **SQLite**: Database for development
- **Gmail SMTP**: Email delivery service

### Frontend
- **React + TypeScript**: Modern web application
- **Vite**: Fast development and build tool
- **Tailwind CSS**: Utility-first styling
- **React Router**: Client-side routing

### APIs & Services
- **Mapbox**: Interactive maps and geocoding
- **Google Gemini**: Generative AI for descriptions
- **Gmail SMTP**: Email notifications

## 📋 Prerequisites

### System Requirements
- **Python 3.8+**
- **Node.js 16+**
- **npm or yarn**
- **Git**

### API Keys Required
- **Mapbox Access Token**
- **Google Gemini API Key**
- **Gmail App Password**

## 🚀 Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd pothole-detection-system
```

### 2. Backend Setup
```bash
# Navigate to API directory
cd api

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
```

### 3. Configure Environment Variables
Edit `api/.env` file:
```env
# Model Configuration
MODEL_PATH=best.pt
CONFIDENCE_THRESHOLD=0.25
IMAGE_SIZE=640

# Email Configuration (REQUIRED)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
ADMIN_EMAIL=mohammedafaaz433@gmail.com

# API Configuration
API_KEY=your-secure-api-key

# External Services
MAPBOX_ACCESS_TOKEN=your-mapbox-token
GEMINI_API_KEY=your-gemini-api-key
```

### 4. Frontend Setup
```bash
# Navigate to project root
cd ..

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env` file:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_MAPBOX_ACCESS_TOKEN=your-mapbox-token
```

## 🔧 Configuration

### Gmail Setup (Required for Email Reports)
1. **Enable 2-Factor Authentication**:
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**:
   - Visit https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (custom name)"
   - Enter "Pothole Detection System"
   - Copy the 16-character password

3. **Update Environment**:
   - Set `EMAIL_PASSWORD` in `api/.env` to the App Password

### Mapbox Setup (Required for Maps)
1. Create account at https://mapbox.com
2. Get your access token from the dashboard
3. Set `MAPBOX_ACCESS_TOKEN` in both `api/.env` and `.env`

### Gemini AI Setup (Optional)
1. Get API key from https://makersuite.google.com/app/apikey
2. Set `GEMINI_API_KEY` in `api/.env`

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start Backend Server**:
```bash
cd api
python app.py
```
Server runs on: http://localhost:5000

2. **Start Frontend Development Server**:
```bash
# In project root
npm run dev
```
Application runs on: http://localhost:5173

### Production Mode

1. **Build Frontend**:
```bash
npm run build
```

2. **Start Production Server**:
```bash
cd api
python app.py
```

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
All API endpoints require an API key in the header:
```
X-API-Key: your-api-key
```

### Core Endpoints

#### Health Check
```http
GET /health
```
Returns API status and available endpoints.

#### Pothole Detection
```http
POST /detect
Content-Type: multipart/form-data

Parameters:
- image: Image file (required)
- location: JSON object with latitude/longitude
- userInfo: JSON object with user details
- includeImage: boolean (default: true)
```

#### Batch Detection
```http
POST /detect/batch
Content-Type: application/json

Body:
{
  "images": ["base64-image-1", "base64-image-2"],
  "location": {"latitude": 40.7128, "longitude": -74.0060},
  "userInfo": {"name": "User Name", "email": "user@example.com"}
}
```

#### Send Email Report
```http
POST /send-report-email
Content-Type: application/json

Body:
{
  "user_email": "user@example.com",
  "user_name": "User Name",
  "detections_data": [
    [{"class": "pothole", "confidence": 0.85, "severity": "High"}]
  ],
  "location_data": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Main St, City, State"
  },
  "images_data": ["base64-image-data"]
}
```

### Response Format
All API responses follow this format:
```json
{
  "success": true,
  "data": {...},
  "message": "Success message",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "v1"
}
```

## 📧 Email Reports

### Email Features
- **Recipient**: Only sent to administrator (mohammedafaaz433@gmail.com)
- **Content**: Professional HTML format with all report data
- **Images**: All uploaded images included as attachments
- **Location**: Clickable Google Maps links with exact coordinates
- **Detection Results**: Complete AI analysis in table format

### Email Trigger
Emails are sent automatically when:
1. User completes pothole report submission
2. Clicks final "Submit Report" button
3. All images have been analyzed by AI

### Email Content Includes
- Report summary with statistics
- User information (name, email, submission time)
- Location details with Google Maps link
- Complete detection results table
- All uploaded images with annotations
- Professional formatting without emojis

## 🎯 Usage Guide

### For Citizens

1. **Access Citizen Portal**:
   - Navigate to the application
   - Click "Citizen" tab on login page

2. **Report a Pothole**:
   - Click "Report Pothole" button
   - Upload 1-5 images of the pothole
   - Wait for AI analysis to complete
   - Optionally generate AI description
   - Verify location (GPS or manual)
   - Submit report

3. **Track Reports**:
   - View your submitted reports
   - Check status updates
   - Thank officials for resolved issues

### For Government Officials

1. **Access Government Portal**:
   - Navigate to the application
   - Click "Government" tab on login page
   - Use official credentials

2. **Manage Reports**:
   - View dashboard with statistics
   - Filter reports by status, date, severity
   - Update report status
   - View detailed report information

3. **Monitor System**:
   - Track resolution metrics
   - Export data for analysis
   - Manage user accounts

## 🔍 Troubleshooting

### Common Issues

#### Email Not Sending
- Verify Gmail App Password is correct
- Check 2-factor authentication is enabled
- Ensure EMAIL_USER and EMAIL_PASSWORD are set in .env

#### AI Detection Not Working
- Verify model file (best.pt) exists in api directory
- Check CONFIDENCE_THRESHOLD setting
- Ensure sufficient system memory

#### Maps Not Loading
- Verify MAPBOX_ACCESS_TOKEN is valid
- Check token permissions include maps and geocoding
- Ensure token is set in both .env files

#### API Connection Issues
- Verify backend server is running on port 5000
- Check API_KEY is set correctly
- Ensure CORS settings allow frontend domain

### Log Files
- Backend logs: Check console output from `python app.py`
- Frontend logs: Check browser developer console
- Email logs: Check backend console for SMTP messages

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting guide above

---
#   s i h  
 