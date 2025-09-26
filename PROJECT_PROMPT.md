# FixMyPothole.AI - Complete Project Prompt

## Project Overview
Build a comprehensive AI-powered pothole detection and reporting system that allows citizens to report road hazards and enables government officials to manage and track these reports efficiently.

## Core Requirements

### 1. **Dual Portal System**
- **Citizen Portal**: For public users to report potholes here we can sign-in and sign-up
- **Government Portal**: For officials to manage and track reports give demo accounts this should not have register option (only sign-in)
- Separate authentication systems for each portal
- Different color schemes and branding for each portal

### 2. **AI-Powered Detection System**
- **YOLOv8 Integration**: Real-time pothole detection from uploaded images
- **Multi-Image Support**: Users can upload 1-5 images per report
- **Batch Processing**: Analyze all images before allowing submission
- **Confidence Scoring**: AI confidence levels for each detection
- **Severity Classification**: Automatic severity assessment (High/Medium/Low)
- **Annotated Images**: Visual overlays showing detected potholes

### 3. **Gemini AI Integration**
- **Optional AI Descriptions**: Generate detailed pothole descriptions
- **User-Controlled**: "AI Desc" button with clear option
- **Fallback Models**: Multiple Gemini model support for reliability
- **Enhanced Analysis**: Detailed pothole characteristics and recommendations

### 4. **Location Services**
- **GPS Integration**: Automatic location detection
- **Manual Location**: Allow users to set location manually
- **Address Lookup**: Convert coordinates to readable addresses
- **Interactive Maps**: Mapbox integration for location visualization
- **Radius-Based Filtering**: Location-based report counting for citizens

### 5. **Email Reporting System**
- **Production Emails**: Real email delivery (not test emails)
- **Administrator Only**: Send emails only to mohammedafaaz433@gmail.com
- **Complete Content**: All uploaded images, detection results, location data
- **Google Maps Links**: Clickable links with exact coordinates (https://www.google.com/maps?q={lat},{lng})
- **Professional Format**: Clean HTML emails without emojis
- **Submit Trigger**: Emails sent only on final report submission

### 6. **User Management**
- **Citizen Registration**: Public user accounts with email verification
- **Government Accounts**: Restricted registration for officials
- **Profile Management**: User information and preferences
- **Authentication**: Secure login/logout functionality
- **Role-Based Access**: Different permissions for citizens vs officials

### 7. **Report Management**
- **Status Tracking**: Not Started, In Progress, Resolved, Rejected
- **Government Sync**: Status updates sync with government systems
- **Filtering System**: Filter by severity, date, status, location
- **Chronological Sorting**: Default sorting by submission date
- **Thanks Feature**: Only available to original reporter
- **Notifications**: Status update notifications to all users

### 8. **Mobile-First Design**
- **Responsive Interface**: Works on all device sizes
- **Touch-Friendly**: Large buttons and touch targets
- **Mobile Navigation**: Collapsible navbar with scroll behavior
- **Image Galleries**: Mobile-compatible image viewing
- **Voice Activation**: Hands-free reporting for driving safety
- **Safety Warnings**: Alerts for driving mode features

### 9. **Data Visualization**
- **Statistics Dashboard**: Government-only report statistics
- **Interactive Maps**: Show all reports on map interface
- **Filtering Controls**: Date range, severity, status filters
- **Export Capabilities**: Data export for government analysis
- **Real-time Updates**: Live data synchronization

### 10. **Security & Performance**
- **API Authentication**: Secure API endpoints with key validation
- **Data Validation**: Input sanitization and validation
- **Error Handling**: Comprehensive error management
- **Logging**: Detailed system logging for debugging
- **Rate Limiting**: Prevent API abuse
- **CORS Configuration**: Proper cross-origin resource sharing

## Technical Stack

### Backend
- **Python Flask**: RESTful API server
- **YOLOv8**: Computer vision model for pothole detection
- **Google Gemini AI**: Advanced AI descriptions and analysis
- **SQLite/PostgreSQL**: Database for user and report data
- **SMTP Email**: Gmail integration for email reports
- **Mapbox API**: Location services and mapping

### Frontend
- **React + TypeScript**: Modern web application
- **Vite**: Fast development and build tool
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **Responsive Design**: Mobile-first approach

### APIs & Services
- **Pothole Detection API**: Custom YOLOv8 endpoint
- **Email Service**: Gmail SMTP integration
- **Location Services**: GPS and address lookup
- **Gemini AI API**: Google's generative AI
- **Mapbox API**: Interactive maps and geocoding

## Key Features

### Citizen Features
- Multi-image pothole reporting (1-5 images)
- Real-time AI detection with visual feedback
- Optional AI-generated descriptions
- GPS automatic location detection
- Report status tracking and notifications
- Thanks feature for resolved reports
- Location-based report statistics
- Voice-activated reporting for safety

### Government Features
- Comprehensive dashboard with statistics
- 5km radius assignment based on the lattitude and logitude provided during profile setup
- Report management with status updates
- Advanced filtering and search capabilities
- Interactive map view of all reports
- Email notifications for new reports
- Data export and analysis tools
- User management capabilities

### Email System
- Professional HTML email templates
- All uploaded images included
- Complete detection results in tables
- Clickable Google Maps links
- Location information and coordinates
- Sent only to administrator email
- Triggered only on final submission

## User Experience Requirements

### Design Principles
- **Clean Interface**: Minimal, professional design
- **Intuitive Navigation**: Easy-to-use interface for all users
- **Accessibility**: WCAG compliant design
- **Performance**: Fast loading and responsive interactions
- **Consistency**: Uniform design language across portals
- **Safety First**: Warnings and safety features for mobile use

### Color Schemes
- **Citizen Portal**: Blue accent colors (#3498db)
- **Government Portal**: Red accent colors for distinction
- **Consistent Branding**: Prominent logos on all pages
- **Eye-Friendly**: Soft backgrounds instead of bright white

### Mobile Optimization
- **Touch Targets**: Minimum 44px touch targets
- **Readable Text**: Appropriate font sizes for mobile
- **Thumb Navigation**: Easy one-handed operation
- **Fast Loading**: Optimized images and assets
- **Offline Capability**: Basic functionality without internet

## Data Requirements

### Report Data Structure
- User information (name, email, contact)
- Location data (GPS coordinates, address, accuracy)
- Image data (original and annotated images)
- Detection results (confidence, severity, coordinates)
- Timestamps (submission, updates, resolution)
- Status information (current status, history)
- AI descriptions (if generated)

### User Data Structure
- Authentication credentials (email, password hash)
- Profile information (name, contact details)
- User type (citizen, government official)
- Preferences (notifications, AI descriptions)
- Activity history (reports submitted, actions taken)

## Integration Requirements

### External Services
- **Gmail SMTP**: For email delivery
- **Mapbox**: For mapping and geocoding
- **Google Gemini**: For AI descriptions
- **GPS Services**: For location detection

### API Endpoints
- Authentication endpoints (login, register, logout)
- Report management (create, read, update, delete)
- Image processing (upload, analyze, annotate)
- Email services (send reports, notifications)
- User management (profiles, preferences)
- Statistics and analytics

## Deployment Requirements

### Environment Configuration
- Development, staging, and production environments
- Environment-specific configuration files
- Secure credential management
- Database migration scripts
- Automated deployment pipelines

### Performance Requirements
- **Response Time**: < 2 seconds for API calls
- **Image Processing**: < 10 seconds for multi-image analysis
- **Concurrent Users**: Support 100+ simultaneous users
- **Uptime**: 99.9% availability target
- **Scalability**: Horizontal scaling capability

## Quality Assurance

### Testing Requirements
- Unit tests for all API endpoints
- Integration tests for email and AI services
- Frontend component testing
- End-to-end user workflow testing
- Performance and load testing
- Security vulnerability testing

### Documentation
- API documentation with examples
- User guides for both portals
- Administrator setup instructions
- Troubleshooting guides
- Code documentation and comments

This comprehensive system should provide a complete solution for pothole detection and reporting, serving both citizens and government officials with a professional, efficient, and user-friendly platform.
