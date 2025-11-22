# AGENTS.md - Osakana Project Guide

This document provides comprehensive information about the Osakana project for AI agents and developers.

## Project Overview

**Osakana** (魚) is a real-time multiplayer kanji quiz game focused on fish radical kanji (魚へん漢字). Players are presented with kanji characters and their readings (yomi), and must correctly identify them. The game features synchronized multiplayer gameplay with real-time updates, a ranking system, and time-based question rounds.

### Key Features

- **Real-time Synchronization**: Server-Sent Events (SSE) for live game state updates
- **Multiplayer Support**: Multiple players can participate simultaneously
- **Ranking System**: Players can register their scores and compete
- **Time-based Rounds**: Questions automatically reset after 30 seconds
- **Combo System**: Players earn combo points for consecutive correct answers
- **Mobile & Desktop**: Responsive design supporting both interfaces

## Architecture

### Tech Stack

#### Client (`client/`)

- **Framework**: Next.js 16.0.3 (App Router)
- **UI Library**: React 19.2.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4, Sass/SCSS, DaisyUI 5.5.5
- **State Management**: React hooks (useState, useEffect)
- **URL State**: nuqs 2.8.0
- **Package Manager**: pnpm
- **Linting/Formatting**: Biome 2.2.0, dprint

#### Server (`server/`)

- **Language**: Rust (Edition 2024)
- **Web Framework**: Axum 0.8.7
- **Async Runtime**: Tokio 1.47.2
- **Serialization**: serde, serde_json
- **Real-time**: Server-Sent Events (SSE) via async-stream
- **HTTP Middleware**: tower-http (CORS, tracing)
- **Logging**: tracing, tracing-subscriber
- **Utilities**: dotenvy, uuid, rand, thiserror

## Project Structure

```
osakana/
├── client/                          # Next.js frontend
│   ├── app/
│   │   ├── mobile/                  # Mobile interface
│   │   │   ├── _components/         # Mobile components
│   │   │   │   ├── combo.tsx        # Combo display
│   │   │   │   └── Keypad.tsx       # Input keypad
│   │   │   ├── actions.ts           # Server actions
│   │   │   ├── page.tsx             # Mobile main page
│   │   │   ├── register-user/       # User registration
│   │   │   ├── register-rank/       # Ranking registration
│   │   │   └── request/             # Answer submission
│   │   ├── screen/                  # Desktop game screen
│   │   │   ├── _components/         # Screen components
│   │   │   │   ├── AllClear/        # All clear animation
│   │   │   │   ├── BubbleContainer/ # Bubble effects
│   │   │   │   ├── Kanji/           # Kanji display
│   │   │   │   ├── KanjiSplitter/   # Kanji splitting effect
│   │   │   │   ├── OceanBackground/ # Ocean animation
│   │   │   │   ├── QuestionCard/    # Question card component
│   │   │   │   └── TimeGauge/       # Timer display
│   │   │   ├── page.tsx             # Screen main page
│   │   │   └── styles/              # Screen styles
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Home page
│   ├── public/                      # Static assets
│   ├── biome.json                   # Biome config
│   ├── dprint.json                  # dprint config
│   ├── next.config.ts               # Next.js config
│   ├── package.json                 # Dependencies
│   └── tsconfig.json                # TypeScript config
│
└── server/                          # Rust backend
    ├── src/
    │   ├── domain/                  # Domain logic (DDD)
    │   │   ├── answer.rs            # Answer handling
    │   │   ├── questions.rs         # Question retrieval
    │   │   ├── ranking.rs           # Ranking registration
    │   │   └── user.rs              # User creation
    │   ├── kanji.rs                 # Kanji data loading
    │   ├── main.rs                  # Application entry point
    │   ├── questions.rs             # Question types & logic
    │   ├── sse_event.rs             # SSE event types
    │   └── user.rs                  # User types
    ├── data.csv                     # Kanji data source
    ├── Cargo.toml                   # Rust dependencies
    ├── compose.yaml                 # Docker Compose config
    └── Dockerfile                   # Docker build config
```

## API Specification

### Base URL

- Development: `http://localhost:8000`
- Production: Set via `FRONTEND_URL` environment variable

### Endpoints

#### 1. Create User

- **Method**: `POST`
- **Path**: `/user`
- **Request Body**: None
- **Response**:
  ```json
  {
    "user_id": "uuid-string"
  }
  ```
- **Description**: Creates a new user and returns a unique user ID

#### 2. Get Current Questions

- **Method**: `GET`
- **Path**: `/questions/current`
- **Response**:
  ```json
  {
    "current_questions": [
      {
        "index": 0,
        "kanji": {
          "unicode": "9b2c",
          "yomi": "まぐろ",
          "kanji": "鮪",
          "difficulty": "Easy"
        },
        "is_solved": false
      }
    ]
  }
  ```
- **Description**: Retrieves the current set of questions

#### 3. Submit Answer

- **Method**: `POST`
- **Path**: `/answer`
- **Request Body**:
  ```json
  {
    "user_id": "uuid-string",
    "question_index": 0,
    "kanji_unicode": "9b2c"
  }
  ```
- **Response**:
  ```json
  {
    "is_correct": true,
    "combo": 5
  }
  ```
- **Description**: Submits an answer and returns correctness and combo count
- **Status Codes**:
  - `200 OK`: Success
  - `404 NOT_FOUND`: User or question not found

#### 4. Register Ranking

- **Method**: `POST`
- **Path**: `/ranking`
- **Request Body**:
  ```json
  {
    "user_id": "uuid-string",
    "username": "PlayerName"
  }
  ```
- **Response**: `200 OK` (no body)
- **Description**: Registers a user's score in the ranking system
- **Status Codes**:
  - `200 OK`: Success
  - `404 NOT_FOUND`: User not found

#### 5. Server-Sent Events (SSE)

- **Method**: `GET`
- **Path**: `/sse`
- **Response**: Event stream
- **Event Types**:

  ```json
  // Question reload event
  {
    "ReloadQuestions": {
      "questions": [...]
    }
  }

  // Time update event
  {
    "RemainingTimePercentage": {
      "percentage": 75.5
    }
  }

  // Answer event
  {
    "Answer": {
      "index": 0,
      "is_correct": true
    }
  }
  ```

- **Description**: Real-time event stream for game state updates
- **Update Frequency**: Time percentage updates every 500ms

## Data Models

### Server-Side Models

#### GameState

```rust
pub struct GameState {
    questions: Questions,        // Current question set
    participants: Users,        // Active players
    ranking: Vec<User>,          // Leaderboard
    tx: broadcast::Sender<SseEvent>, // SSE event broadcaster
}
```

#### Question

```rust
pub struct Question {
    index: usize,
    kanji: Kanji,
    is_solved: bool,
}
```

#### Kanji

```rust
pub struct Kanji {
    pub unicode: String,         // Hex unicode (e.g., "9b2c")
    pub yomi: String,            // Reading (e.g., "まぐろ")
    pub kanji: char,             // Character (e.g., '鮪')
    pub difficulty: KanjiDifficulty, // Easy, Medium, Hard
}
```

#### User

```rust
pub struct User {
    id: String,                  // UUID
    username: Option<String>,    // Optional display name
    combo: u32,                  // Current combo count
}
```

### Client-Side Models

#### Question (Client)

```typescript
interface Question {
  unicode: number; // Unique identifier
  yomi: string; // Reading
  kanji: string; // Character
  difficulty: number; // 1-3 (Easy, Medium, Hard)
}
```

## Data Flow

### Game Initialization Flow

```
1. Client → POST /user
   Server creates user, returns user_id

2. Client stores user_id in cookie

3. Client → GET /questions/current
   Server returns current question set

4. Client → GET /sse
   Server establishes SSE connection
   Client receives real-time updates
```

### Answer Submission Flow

```
1. User selects answer

2. Client → POST /answer
   {
     user_id: "...",
     question_index: 0,
     kanji_unicode: "9b2c"
   }

3. Server validates answer:
   - Checks question exists
   - Validates user exists
   - Compares kanji_unicode
   - Updates user combo if correct

4. Server broadcasts SSE event:
   {
     "Answer": {
       "index": 0,
       "is_correct": true
     }
   }

5. Server responds:
   {
     "is_correct": true,
     "combo": 5
   }
```

### Question Reset Flow

```
1. Background task runs every 500ms:
   - Decreases remaining_time
   - Checks if time <= 0

2. When time expires:
   - Reset questions (select new random set)
   - Reset timer to 30 seconds
   - Broadcast ReloadQuestions event

3. All connected clients receive:
   {
     "ReloadQuestions": {
       "questions": [...]
     }
   }
```

## Game Mechanics

### Question System

- **Total Questions**: 10 per round
- **Time Limit**: 30 seconds per round
- **Reset**: Automatic after time expires
- **Selection**: Random selection from kanji database
- **Difficulty**: Three levels (Easy, Medium, Hard)

### Scoring System

- **Combo**: Increments on each correct answer
- **Reset**: Combo resets on incorrect answer (implied)
- **Ranking**: Based on combo count

### Real-time Updates

- **Time Updates**: Every 500ms via SSE
- **Answer Events**: Broadcast immediately after validation
- **Question Reload**: Broadcast when round resets

## Environment Variables

### Server

- `FRONTEND_URL` (required): Frontend URL for CORS configuration
  - Example: `https://osakana.vercel.app`
- `CLOUDFLARED_TOKEN` (optional): Cloudflare Tunnel token for Docker Compose

### Client

- `NEXT_PUBLIC_BACKEND_URL`: Backend API URL
  - Example: `http://localhost:8000` (dev) or production URL

## Development Commands

### Client

```bash
cd client
pnpm dev          # Start dev server (port 3000)
pnpm build         # Build for production
pnpm start         # Start production server
pnpm lint          # Run linter
pnpm format        # Format code
```

### Server

```bash
cd server
cargo run          # Build and run (port 8000)
cargo check        # Check without building
cargo build        # Build only
cargo fmt          # Format code
cargo clippy       # Run linter
cargo test         # Run tests
```

### Docker

```bash
cd server
docker compose up  # Start services
docker compose down # Stop services
docker compose logs # View logs
```

## Code Style Guidelines

### TypeScript/React

- **Indentation**: 2 spaces
- **Line Width**: 100 characters
- **Components**: PascalCase
- **Functions/Variables**: camelCase
- **Files**: PascalCase for components, kebab-case for utilities
- **Styling**: CSS Modules (`.module.scss`) + Tailwind CSS

### Rust

- **Formatting**: `cargo fmt` (rustfmt)
- **Modules**: snake_case
- **Types/Structs**: PascalCase
- **Functions**: snake_case
- **Error Handling**: Use `Result<T, E>` and `thiserror`

## Important Implementation Details

### Server-Side

1. **Game State Management**

   - Uses `Arc<Mutex<GameState>>` for shared mutable state
   - Background task updates timer every 500ms
   - SSE events broadcast via Tokio broadcast channel

2. **Kanji Data Loading**

   - Loaded from `data.csv` at startup
   - Stored in `OnceLock` for global access
   - CSV format: `[index, yomi, level, ?, unicode]`

3. **Question Reset Logic**

   - Randomly selects 10 kanji from database
   - Resets timer to 30 seconds
   - Broadcasts reload event to all SSE clients

4. **Answer Validation**
   - Compares submitted `kanji_unicode` with question's kanji unicode
   - Updates user combo on correct answer
   - Broadcasts answer event for real-time UI updates

### Client-Side

1. **State Management**

   - React hooks (`useState`, `useEffect`) for local state
   - Cookies for user_id and question_index persistence
   - URL search params for error handling and combo display

2. **Mobile Interface**

   - Uses server actions for API calls
   - Cookie-based authentication
   - Form-based input via keypad component

3. **Desktop Interface (Screen)**

   - Client-side state management
   - Timer-based question reload
   - Animation states: "idle", "entering", "exiting"

4. **Error Handling**
   - Redirects with error params on failure
   - Cookie validation before API calls
   - Server action error boundaries

## Common Patterns

### Server Action Pattern (Client)

```typescript
"use server";

export async function actionName(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) {
    redirect("/mobile/?error=missing_user");
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/endpoint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, ...data }),
  });

  if (!res.ok) {
    redirect("/mobile/?error=server_error");
  }

  return await res.json();
}
```

### Domain Handler Pattern (Server)

```rust
#[axum::debug_handler]
#[tracing::instrument]
pub async fn handler_name(
    State(game_state): State<SharedGameState>,
    Json(request): Json<RequestType>,
) -> Result<Json<ResponseType>, StatusCode> {
    let mut game_state = game_state.lock().await;
    // Domain logic here
    Ok(Json(response))
}
```

## Testing Considerations

### Server Testing

- Unit tests for domain logic (questions, users)
- Integration tests for API endpoints
- SSE event broadcasting tests

### Client Testing

- Component rendering tests
- User interaction tests
- API integration tests
- Cookie management tests

## Deployment

### Frontend (Vercel)

- Automatic deployment from Git
- Environment variables via Vercel dashboard
- Build command: `pnpm build`

### Backend (Docker + Cloudflare Tunnel)

- Docker image built from `Dockerfile`
- Cloudflare Tunnel for public access
- Environment variables via `.env` file or Docker Compose

## Troubleshooting

### Common Issues

1. **CORS Errors**

   - Ensure `FRONTEND_URL` matches actual frontend URL
   - Check CORS configuration in `main.rs`

2. **SSE Connection Issues**

   - Verify SSE endpoint is accessible
   - Check browser console for connection errors
   - Ensure server is running and accessible

3. **User Not Found Errors**

   - Verify user_id cookie is set
   - Check user creation endpoint response
   - Ensure user exists in game state

4. **Question Not Found Errors**
   - Verify question_index is valid (0-9)
   - Check current questions endpoint
   - Ensure questions are loaded from CSV

## Future Considerations

- Database persistence for rankings
- User authentication and sessions
- Multiple game rooms/lobbies
- Question difficulty progression
- Achievement system
- Social features (friends, challenges)

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [Axum Documentation](https://docs.rs/axum/)
- [Tokio Documentation](https://tokio.rs/)
- [Server-Sent Events MDN](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

---

**Last Updated**: Based on current codebase state
**Maintainer**: Project team
**License**: See repository LICENSE file
