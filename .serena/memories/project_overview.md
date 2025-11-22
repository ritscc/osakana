# Project Overview: Osakana

## Purpose
Osakana (魚) is a real-time multiplayer kanji quiz game focused on fish radical kanji (魚へん漢字). The game presents players with kanji characters and their readings (yomi), and players must correctly identify them. The application features:

- Real-time question updates via Server-Sent Events (SSE)
- Ranking system for players
- Time-based question rounds
- Multiplayer support with synchronized game state
- Mobile and desktop interfaces

## Tech Stack

### Client (`client/`)
- **Framework**: Next.js 16.0.3 (App Router)
- **UI Library**: React 19.2.0
- **Language**: TypeScript 5
- **Styling**: 
  - Tailwind CSS 4
  - Sass/SCSS (for component-specific styles)
  - DaisyUI 5.5.5
- **State Management**: React hooks (useState, useEffect)
- **URL State**: nuqs 2.8.0
- **Package Manager**: pnpm
- **Linting/Formatting**: 
  - Biome 2.2.0 (linting and formatting)
  - dprint (code formatting)

### Server (`server/`)
- **Language**: Rust (Edition 2024)
- **Web Framework**: Axum 0.8.7
- **Async Runtime**: Tokio 1.47.2
- **Serialization**: serde, serde_json
- **Real-time**: Server-Sent Events (SSE) via async-stream
- **HTTP**: tower-http (CORS, tracing)
- **Logging**: tracing, tracing-subscriber
- **Other**: 
  - dotenvy (environment variables)
  - uuid (user identification)
  - rand (randomization)
  - thiserror (error handling)

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Tunneling**: Cloudflare Tunnel (cloudflared)
- **Deployment**: 
  - Frontend: Vercel (https://osakana.vercel.app)
  - Backend: Docker container with Cloudflare Tunnel

## Project Structure

```
osakana/
├── client/                 # Next.js frontend application
│   ├── app/               # Next.js App Router
│   │   ├── mobile/        # Mobile-specific pages and components
│   │   ├── screen/        # Main game screen
│   │   └── page.tsx       # Home page
│   ├── public/            # Static assets
│   ├── biome.json         # Biome linting/formatting config
│   ├── dprint.json        # dprint formatting config
│   ├── next.config.ts     # Next.js configuration
│   ├── package.json       # Node.js dependencies
│   └── tsconfig.json      # TypeScript configuration
│
└── server/                # Rust backend application
    ├── src/
    │   ├── domain/        # Domain logic (DDD structure)
    │   │   ├── answer.rs  # Answer handling
    │   │   ├── questions.rs # Question management
    │   │   ├── ranking.rs  # Ranking system
    │   │   └── user.rs     # User management
    │   ├── kanji.rs       # Kanji data loading
    │   ├── main.rs        # Application entry point
    │   ├── questions.rs   # Question types
    │   ├── sse_event.rs   # SSE event types
    │   └── user.rs        # User types
    ├── data.csv           # Kanji data source
    ├── Cargo.toml         # Rust dependencies
    ├── compose.yaml       # Docker Compose configuration
    └── Dockerfile         # Docker build configuration
```

## Key Features

1. **Real-time Synchronization**: Server-Sent Events (SSE) for live updates
2. **Game State Management**: Shared game state with Arc<Mutex<GameState>>
3. **Question System**: Time-based question rounds with automatic reset
4. **User Management**: User creation and session management
5. **Ranking System**: Player ranking registration and retrieval
6. **Answer Validation**: Answer submission and validation system

## Environment Variables

### Server
- `FRONTEND_URL`: Frontend URL for CORS configuration (required)
- `CLOUDFLARED_TOKEN`: Cloudflare Tunnel token (for Docker Compose)

## Development Workflow

The project follows a monorepo structure with separate client and server directories. The client is a Next.js application, and the server is a Rust Axum application. They communicate via HTTP/REST API and Server-Sent Events.