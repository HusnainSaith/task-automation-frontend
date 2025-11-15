# Field Service Management Frontend

A Next.js frontend for the field service management system that integrates with the NestJS backend.

## Features

- **Company Registration**: Owners can create companies and get started
- **User Management**: Create clients and servicemen with different roles
- **Problem Reporting**: Clients can report problems with location details
- **Automatic Task Assignment**: System finds nearest available serviceman using Google Maps
- **Task Management**: Servicemen can view and complete assigned tasks
- **Real-time Status**: Shows serviceman availability and task queue status

## User Roles

### Owner
- Create and manage company
- Add clients and servicemen
- View overall system status

### Client
- Report problems with location
- Get automatic serviceman assignment
- Receive queue notifications when all servicemen are busy

### Serviceman
- Set location for optimal task assignment
- Toggle online/offline status
- View and complete assigned tasks (max 2 concurrent)
- Automatic assignment of next queued task on completion

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   # Update .env.local with your backend URL
   NEXT_PUBLIC_API_URL=http://localhost:3000
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Make sure backend is running**
   - Start the NestJS backend on port 3000
   - Ensure PostgreSQL database is configured
   - Google Maps API key is set in backend

## Workflow

1. **Company Setup**: Owner registers and creates company
2. **User Creation**: Owner adds clients and servicemen
3. **Problem Reporting**: Client reports issue with address
4. **Auto Assignment**: System finds nearest available serviceman
5. **Task Completion**: Serviceman completes task, triggers next assignment
6. **Queue Management**: Shows "serviceman is not free" when capacity reached

## Integration with Backend

The frontend communicates with the NestJS backend API endpoints:
- `/auth/register` - Company registration
- `/auth/login` - User authentication
- `/users/clients` - Client management
- `/users/servicemen` - Serviceman management
- `/problems/report` - Problem reporting
- `/tasks` - Task management

## Google Maps Integration

The system uses Google Maps APIs for:
- Address geocoding
- Distance calculation
- Nearest serviceman finding
- Location-based task assignment

Make sure to enable the following APIs in Google Cloud Console:
- Maps JavaScript API
- Geocoding API
- Distance Matrix API