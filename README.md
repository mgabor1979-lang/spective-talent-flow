# Spective

A comprehensive talent management platform that connects professionals with companies in the automotive and manufacturing industries.

## 🌟 Overview

Spective is a modern web application built to facilitate connections between skilled professionals and companies seeking specialized talent. The platform serves as a bridge for interim managers, consultants, and industry experts to showcase their expertise while enabling companies to discover and connect with the right talent for their transformation projects.

## 🚀 Key Features

### For Professionals
- **Profile Management**: Comprehensive skill showcasing, work experience, education, and technology expertise
- **Availability Management**: Set availability dates and receive automated reminders
- **Document Management**: Upload and manage professional documents
- **Real-time Notifications**: Email notifications for profile status updates

### For Companies
- **Professional Discovery**: Advanced search and filtering capabilities
- **Company Dashboard**: Browse professional profiles with privacy-protected data
- **Favorites System**: Save and manage preferred professionals
- **Contact Management**: Streamlined communication with potential hires
- **Distance Calculations**: Location-based professional matching

### For Administrators
- **User Management**: Approve/reject professional and company profiles
- **Content Moderation**: Manage platform content and user interactions
- **Email System**: Automated notification workflows
- **Analytics Dashboard**: Monitor platform usage and engagement

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **React Router** for navigation
- **React Hook Form** for form management
- **Tanstack Query** for state management

### Backend & Database
- **Supabase** for authentication and database
- **PostgreSQL** with Row Level Security (RLS)
- **Real-time subscriptions** for live updates

### Email & Notifications
- **Resend** for email delivery
- **Comprehensive email templates** for all user interactions
- **Automated cron jobs** for scheduled notifications

### File Storage & Media
- **Cloudinary** for secure image upload and management
- **Rate limiting** to prevent spam and abuse
- **Image transformations** for optimized delivery

### Deployment & Infrastructure
- **Vercel** for hosting and serverless functions
- **Vercel Cron Jobs** for automated tasks
- **Environment-based configuration**

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ (recommended: install with [nvm](https://github.com/nvm-sh/nvm))
- npm or yarn package manager
- Supabase account and project
- Resend account for email services

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/mgabor1979-lang/spective-talent-flow.git
   cd spective-talent-flow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with:
   ```bash
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=http://localhost:8080
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

4. **Start the development servers**
   ```bash
   # Frontend only
   npm run dev

   # Email API only
   npm run dev:api

   # Both frontend and email API
   npm run dev:full
   ```

## 📋 Available Scripts

- `npm run dev` - Start the frontend development server
- `npm run dev:api` - Start the email server only
- `npm run dev:full` - Start both frontend and email API
- `npm run build` - Build for production
- `npm run build:ssr` - Build with server-side rendering
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🗄️ Project Structure

```
src/
├── components/           # React components
│   ├── admin/           # Admin panel components
│   ├── auth/            # Authentication forms
│   ├── company/         # Company-specific components
│   ├── layout/          # Layout and navigation
│   ├── profile/         # Professional profiles
│   ├── registration/    # User registration flows
│   └── ui/              # shadcn/ui base components
├── hooks/               # Custom React hooks
├── integrations/        # External service integrations
├── lib/                 # Utilities and services
│   ├── email-service.ts # Email functionality
│   ├── email-templates.ts # Email templates
│   └── utils.ts         # Helper functions
├── pages/               # Page components
└── App.tsx              # Main application

api/                     # Vercel serverless functions
├── cron/               # Scheduled jobs
└── *.js                # API endpoints

supabase/               # Database configuration
├── migrations/         # Database schema changes
└── config.toml         # Supabase settings
```

## 🔄 Automated Systems

### Email Notifications
The platform includes comprehensive email automation:
- Welcome emails for new users
- Profile approval/rejection notifications
- Availability reminder emails
- Password reset and verification emails

### Cron Jobs
- **Daily availability checks** (6:00 AM UTC)
- **Automated profile status updates**
- **Email queue processing**

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   - Import the GitHub repository to Vercel
   - Configure environment variables in Vercel dashboard

2. **Environment Variables**
   ```bash
   SUPABASE_URL=your_production_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   CRON_SECRET=your_random_secret_string
   ```

3. **Deploy**
   - Push to main branch triggers automatic deployment
   - Vercel cron jobs are automatically configured

For detailed deployment instructions, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md).

## 🧪 Testing

### API Testing
Test the cron job functionality:
```
https://your-app.vercel.app/api/test-cron
```

### Email Testing
Use the built-in email testing component available to administrators.

## 📚 Documentation

- [Email System Guide](./EMAIL_SERVICE_GUIDE.md)
- [Cloudinary Setup](./CLOUDINARY_SETUP.md)
- [Cron Jobs Documentation](./CRON_JOBS.md)
- [Company File Management](./COMPANY_FILE_MANAGEMENT.md)
- [Document Management](./DOCUMENT_MANAGEMENT.md)
- [Distance Caching Implementation](./DISTANCE_CACHING_IMPLEMENTATION.md)

## 🔒 Security Features

- **Row Level Security (RLS)** on all database tables
- **User authentication** with Supabase Auth
- **Role-based access control** (Professional, Company, Admin)
- **Data privacy protection** for professional profiles
- **Secure file upload** and document management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software owned by Spective Kft.

## 📞 Support

For support and inquiries, contact:
- Email: support@spective-talent-flow.com
- Website: [https://spective.hu](https://spective.hu)

---

© 2025 Spective Kft. All rights reserved.
