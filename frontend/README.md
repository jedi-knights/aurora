# Aurora Frontend

Next.js-based frontend for the Aurora personal organization application.

## Features

- 💭 **Thoughts** - Quick capture for fleeting ideas
- 📔 **Journals** - Organize writing into separate journals
- 📅 **Planning** - Calendar view for tasks and events

## Tech Stack

- Next.js 14 (App Router)
- React 18
- CSS Modules

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Docker

```bash
# Build image
docker build -t aurora-frontend .

# Run container
docker run -p 3000:3000 aurora-frontend
```

## Environment Variables

Currently, the frontend uses browser localStorage for data persistence. Future backend integration will use environment variables for API endpoints.

## Build

```bash
npm run build
npm start
```

