# Stayora — Hotel Booking Platform

Stayora is a full-stack hotel booking platform built with Next.js and TypeScript. It allows customers to explore hotels, check room availability and pricing, and manage reservations. A centralized admin dashboard supports hotel, room, rate, and booking management.

**Live Demo:** [https://stayora-pexk.vercel.app/](https://stayora-pexk.vercel.app/)

**Source Code:** [GitHub Repository](https://github.com/KarlHenz548/stayora)

## Features

### Customer Experience

- Browse and search hotels.
- Explore hotel room types and room details.
- Check room availability and pricing.
- Create bookings and view booking details.
- Cancel eligible reservations.

### Administration

- Manage hotel listings.
- Manage room types and rooms.
- Manage room rates.
- View and manage bookings.

### Authentication and Security

- Email and password authentication with Better Auth.
- Role-based access for protected administrative features.
- Protected booking-expiration endpoint using a cron secret.
- Server-side validation and access controls for supported operations.

### Booking Lifecycle

- Booking creation and reservation management.
- Room availability and pricing checks.
- Booking cancellation.
- Booking-expiration handling.

### Testing

- Unit tests for isolated logic.
- API route tests.
- Integration tests for connected application functionality.

## Tech Stack

| Technology                                    | Purpose                                          |
| --------------------------------------------- | ------------------------------------------------ |
| [Next.js](https://nextjs.org/)                | Full-stack React framework and App Router        |
| [React](https://react.dev/)                   | User interface                                   |
| [TypeScript](https://www.typescriptlang.org/) | Type safety                                      |
| [Tailwind CSS](https://tailwindcss.com/)      | Styling and responsive layouts                   |
| [Neon](https://neon.tech/)                    | Serverless PostgreSQL database                   |
| [Drizzle ORM](https://orm.drizzle.team/)      | Type-safe database queries and schema management |
| [Better Auth](https://www.better-auth.com/)   | Authentication and admin access                  |
| [Zod](https://zod.dev/)                       | Data validation                                  |
| [Cloudinary](https://cloudinary.com/)         | Image and media management                       |
| [Vitest](https://vitest.dev/)                 | Unit and integration testing                     |

## Getting Started

### Prerequisites

- Node.js compatible with the project's dependencies.
- npm.
- A Neon PostgreSQL database.
- Required authentication and Cloudinary configuration values.

### 1. Clone the repository

```bash
git clone https://github.com/KarlHenz548/stayora.git
cd stayora
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local `.env` file based on the environment variables required by the project.

At minimum, configure the database connection:

```env
DATABASE_URL=your_neon_postgresql_connection_string
```

Also configure the Better Auth, Cloudinary, and protected booking-expiration endpoint variables according to the project's environment configuration. Keep all secrets private and never commit real credentials.

### 4. Run database migrations

Use the Drizzle Kit migration command configured for the project:

```bash
npx drizzle-kit migrate
```

Ensure the database connection is configured before running migrations.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

The following are standard project commands; verify `package.json` for the exact scripts configured in the current version.

| Command                   | Purpose                              |
| ------------------------- | ------------------------------------ |
| `npm run dev`             | Start the development server         |
| `npm run build`           | Build the application for production |
| `npm run start`           | Start the production server          |
| `npx vitest`              | Run the Vitest test suite            |
| `npx drizzle-kit migrate` | Apply pending database migrations    |

## Database

Stayora uses PostgreSQL through Neon, with Drizzle ORM managing its database schema and migrations.

Database schema changes are maintained as migration files. Review the project's migration configuration and environment variables before applying migrations to any database.

## Deployment

The application is deployed on [Vercel](https://vercel.com/).

For production deployment:

1. Connect the repository to Vercel.
2. Configure the required environment variables.
3. Confirm the Neon database is accessible from the deployment.
4. Apply the required database migrations.
5. Verify authentication, image handling, booking operations, and protected endpoints.

See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for additional details.

## Project Goals

Stayora is a portfolio project demonstrating full-stack application development, database modeling, authentication, reservation workflows, administrative operations, and automated testing.

---

Built with Next.js, TypeScript, and PostgreSQL.
