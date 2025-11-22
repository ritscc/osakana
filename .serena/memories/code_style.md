# Code Style and Conventions

## TypeScript/React (Client)

### Formatting
- **Tool**: Biome 2.2.0 (primary) and dprint
- **Indentation**: 2 spaces
- **Line Width**: 100 characters (dprint)
- **Trailing Commas**: None (dprint config)
- **Arrow Parentheses**: As needed (dprint config)
- **Quote Style**: Double quotes (Biome default)

### TypeScript Configuration
- **Strict Mode**: Enabled
- **Target**: ES2017
- **Module**: ESNext
- **Module Resolution**: Bundler
- **JSX**: react-jsx
- **Path Aliases**: `@/*` maps to `./*`

### Naming Conventions
- **Components**: PascalCase (e.g., `QuestionCard`, `TimeGauge`)
- **Files**: 
  - Components: PascalCase (e.g., `QuestionCard.tsx`)
  - Utilities: kebab-case or camelCase
  - Pages: lowercase (Next.js App Router convention)
- **Variables/Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE or camelCase
- **CSS Modules**: camelCase (e.g., `styles.module.scss`)

### Component Structure
- Use functional components with hooks
- Use `"use client"` directive for client components
- Import order: React → external → internal → styles
- Example structure:
```typescript
"use client";

import { useState, useEffect } from "react";
import ExternalLib from "external-lib";
import LocalComponent from "./LocalComponent";
import styles from "./styles.module.scss";

export default function Component() {
  // hooks
  // handlers
  // render
}
```

### Styling
- **CSS Modules**: Use `.module.scss` for component styles
- **Tailwind CSS**: Available for utility classes
- **DaisyUI**: Available for component library
- **SCSS**: Use for complex styling needs

### Linting Rules
- Biome recommended rules enabled
- Next.js and React domains enabled
- `noUnknownAtRules` disabled (for Tailwind/CSS)

### Import Organization
- Biome auto-organizes imports (`organizeImports: "on"`)

## Rust (Server)

### Formatting
- **Tool**: `cargo fmt` (rustfmt)
- **Standard Rust Style**: Follow rustfmt defaults
- **Edition**: 2024

### Naming Conventions
- **Modules**: snake_case
- **Types/Structs**: PascalCase
- **Functions**: snake_case
- **Variables**: snake_case
- **Constants**: UPPER_SNAKE_CASE
- **Lifetimes**: Single lowercase letter (e.g., `'a`)

### Code Organization
- **Domain-Driven Design**: Domain logic in `domain/` module
- **Separation of Concerns**: 
  - Domain logic in `domain/`
  - Types in separate modules
  - Handlers use domain functions
- **Error Handling**: Use `thiserror` for custom errors
- **Async/Await**: Prefer async/await over raw futures

### Documentation
- Use `///` for public API documentation
- Use `//` for inline comments
- Add `#[tracing::instrument]` for important functions
- Use `#[axum::debug_handler]` for route handlers

### Example Structure
```rust
use axum::{Json, extract::State};
use serde::Serialize;

#[derive(Serialize)]
pub struct Response {
    // fields
}

#[axum::debug_handler]
#[tracing::instrument]
pub async fn handler(
    State(state): State<SharedState>,
) -> Result<Json<Response>, StatusCode> {
    // implementation
}
```

### Error Handling
- Use `Result<T, E>` for fallible operations
- Use `thiserror` for custom error types
- Return appropriate HTTP status codes

## File Organization

### Client
- Components in `_components/` subdirectories
- Styles co-located with components (`styles.module.scss`)
- Pages follow Next.js App Router structure
- Route handlers in `route.ts` files

### Server
- Domain logic in `domain/` module
- Shared types in root `src/`
- Main application logic in `main.rs`
- Each domain concept in its own module

## General Guidelines

### Code Quality
- Write self-documenting code
- Prefer explicit over implicit
- Use meaningful variable names
- Keep functions focused and small
- Avoid deep nesting

### Comments
- Comment "why", not "what"
- Keep comments up to date
- Remove commented-out code before committing

### Git
- Use descriptive commit messages
- Keep commits focused and atomic
- Format code before committing