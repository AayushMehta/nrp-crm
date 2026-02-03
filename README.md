# NRP CRM - Client Relationship Management System

A comprehensive CRM system built with Next.js 15, TypeScript, and Tailwind CSS for managing client onboarding, communications, and reminders.

## Features

### 1. Onboarding Automation with Master Checklist
- Document management system with conditional logic
- Temporary client access for document uploads
- Admin verification workflow
- Progress tracking (100% document scenario coverage)
- KYC exception handling (already done vs. new)
- NRP Light vs. NRP 360 service selection

### 2. Client Communication Trail / Meeting Notes
- Meeting notes with privacy-controlled visibility
- Internal notes hidden from clients
- Action items with reminder conversion
- Unified timeline view (meetings + messages + documents)
- Search and filter functionality

### 3. Enhanced Reminder System
- Automated reminder generation from triggers
- Document upload notifications
- Meeting action item reminders
- Dashboard widgets and email notifications
- Recurring reminders with snooze functionality

## Tech Stack

- **Framework**: Next.js 15.5.7 (App Router)
- **Language**: TypeScript (strict mode)
- **UI Library**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS v4
- **Forms**: react-hook-form + zod validation
- **Icons**: lucide-react
- **Data Storage**: localStorage (MVP) → Supabase (planned)
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 20.0.0 or higher
- npm or yarn

### Installation

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
\`\`\`

### Development

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Demo Credentials

### Admin Account
- Username: `admin`
- Password: `admin123`

### Relationship Manager
- Username: `rm`
- Password: `rm123`

### Family Client 1
- Username: `sharma`
- Password: `demo123`

### Family Client 2
- Username: `patel`
- Password: `demo123`

## Project Structure

\`\`\`
nrp-crm/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin dashboard and features
│   ├── rm/                # RM dashboard and features
│   └── client/            # Client portal
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   ├── onboarding/       # Onboarding feature components
│   ├── meeting-notes/    # Meeting notes components
│   ├── reminders/        # Reminder components
│   └── documents/        # Document management components
├── lib/                   # Business logic and utilities
│   ├── services/         # Service layer (business logic)
│   ├── storage/          # Data persistence layer
│   └── utils/            # Utility functions
├── types/                 # TypeScript type definitions
├── context/               # React Context providers
└── data/                  # Mock data and samples
\`\`\`

## Implementation Status

### ✅ Completed (Phase 1: Foundation)
- Next.js 15 project setup
- TypeScript configuration (strict mode)
- Tailwind CSS v4 setup
- shadcn/ui integration
- Authentication system (mock auth)
- localStorage utilities
- Sample users and data
- App layout and routing structure

### 🚧 In Progress
- Login page
- Dashboard layouts
- Type definitions for all features

### 📋 Planned
- Onboarding checklist system
- Document upload and verification
- Meeting notes with privacy controls
- Communication timeline
- Reminder automation
- Email notifications

## Documentation

- **Implementation Guide**: See `IMPLEMENTATION_GUIDE.md` for detailed implementation plan
- **API Documentation**: Coming soon
- **Component Documentation**: Coming soon

## Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow Next.js App Router conventions
- Use shadcn/ui components for consistency
- Implement proper error handling
- Add comments for complex business logic

### Privacy Controls
- **Critical**: Meeting notes have strict privacy filters
- Internal notes are ALWAYS hidden from clients
- Action items filtered by assignment
- Timeline shows only client-visible content

### Conditional Logic
- Onboarding checklist adapts based on KYC status
- NRP Light vs. NRP 360 affects required documents
- 100% coverage of document scenarios

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly (especially privacy controls)
4. Submit a pull request

## License

Proprietary - All rights reserved

## Support

For issues and questions, please contact the development team.

---

**Version**: 0.1.0
**Last Updated**: 2026-01-20
**Built with** ❤️ **by the NRP team**
