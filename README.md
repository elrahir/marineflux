# MarineFlux - Maritime Industry Digital Marketplace

MarineFlux is a P2P marketplace platform that connects ship owners with suppliers and service providers in the maritime industry.

## Features

- **Multi-language Support**: Turkish and English
- **Role-based Access**: Admin, Shipowner, and Supplier dashboards
- **Real-time Notifications**: Firebase Cloud Messaging integration
- **Request for Quotations (RFQ)**: Shipowners can request quotes from multiple suppliers
- **Order Management**: Track orders and processes in real-time
- **Rating & Review System**: Transparent supplier ratings
- **Secure Payments**: Mock payment system (ready for integration)

## Tech Stack

### Frontend & Backend
- **Next.js 14+** with App Router
- **React 18+**
- **TypeScript**
- **Tailwind CSS**

### Database & Services
- **Firebase Firestore** - Database
- **Firebase Authentication** - User authentication
- **Firebase Storage** - File storage
- **Firebase Cloud Messaging** - Push notifications

### UI Components
- **shadcn/ui** - Modern UI components
- **Lucide React** - Icons
- **Recharts** - Dashboard charts

### Internationalization
- **next-intl** - Multi-language support

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase project created

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd marineflux
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Get your Firebase configuration

4. Create `.env.local` file in the root directory:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
marineflux/
├── app/
│   ├── [locale]/           # Internationalized routes
│   │   ├── page.tsx        # Landing page
│   │   ├── (auth)/         # Authentication routes
│   │   ├── admin/          # Admin dashboard
│   │   ├── shipowner/      # Shipowner dashboard
│   │   └── supplier/       # Supplier dashboard
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/
│   ├── shipowner/
│   ├── supplier/
│   └── admin/
├── lib/
│   ├── firebase/           # Firebase configuration and helpers
│   ├── hooks/
│   └── utils.ts
├── types/                  # TypeScript type definitions
├── messages/               # i18n translation files
│   ├── en.json
│   └── tr.json
└── middleware.ts           # Auth & i18n middleware
```

## Firebase Setup

### Firestore Collections

The application uses the following Firestore collections:

- `users` - User accounts (admin, shipowner, supplier)
- `shipowners` - Shipowner-specific data
- `suppliers` - Supplier-specific data
- `rfqs` - Request for Quotations
- `quotations` - Supplier quotations
- `orders` - Order records
- `reviews` - Supplier reviews
- `notifications` - User notifications

### Security Rules

Make sure to configure Firestore security rules to protect your data. Example rules are provided in the documentation.

## Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
```

### Starting Production Server
```bash
npm start
```

## Deployment

The application is optimized for deployment on **Vercel**:

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## User Roles

### Admin
- Create and manage user accounts
- View platform statistics
- Monitor all activities

### Shipowner
- Create RFQs (Request for Quotations)
- Review and compare quotations
- Place orders
- Track order status
- Rate suppliers

### Supplier
- View available RFQs
- Submit quotations
- Manage orders
- Track payments
- View ratings and reviews

## License

© 2024 MarineFlux. All rights reserved.

## Support

For support, please contact support@marineflux.com




