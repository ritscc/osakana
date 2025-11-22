# Suggested Commands for Osakana Project

## Client (Next.js) Commands

### Development
```bash
cd client
pnpm dev              # Start development server (http://localhost:3000)
```

### Building & Production
```bash
cd client
pnpm build            # Build production bundle
pnpm start            # Start production server
```

### Code Quality
```bash
cd client
pnpm lint             # Run Biome linter (biome check)
pnpm format           # Format code with Biome (biome format --write)
```

### Package Management
```bash
cd client
pnpm install          # Install dependencies
pnpm add <package>    # Add a new dependency
pnpm remove <package> # Remove a dependency
```

## Server (Rust) Commands

### Development
```bash
cd server
cargo run             # Build and run the server (port 8000)
cargo check           # Check code without building
cargo build           # Build the project
cargo build --release # Build optimized release binary
```

### Code Quality
```bash
cd server
cargo fmt             # Format Rust code
cargo clippy          # Run Clippy linter
cargo test            # Run tests (if any)
```

### Running Tests
```bash
cd server
cargo test            # Run all tests
cargo test -- --nocapture  # Run tests with output
```

## Docker Commands

### Development with Docker Compose
```bash
cd server
docker compose up     # Start services (server + cloudflared)
docker compose up -d  # Start services in detached mode
docker compose down   # Stop and remove services
docker compose logs   # View logs
docker compose logs -f # Follow logs
```

### Building Docker Image
```bash
cd server
docker build -t osakana-server .  # Build server image
```

## Git Commands

```bash
git status            # Check repository status
git add <file>        # Stage files
git commit -m "msg"   # Commit changes
git push              # Push to remote
git pull              # Pull from remote
git log               # View commit history
git diff              # View changes
```

## System Utilities (Linux)

```bash
ls -la                # List files with details
cd <directory>        # Change directory
grep -r "pattern" .   # Search recursively
find . -name "*.rs"   # Find files by pattern
ps aux | grep cargo   # Find running processes
kill <pid>            # Kill a process
```

## Environment Setup

### Server Environment
```bash
cd server
# Create .env file with:
# FRONTEND_URL=https://osakana.vercel.app
# CLOUDFLARED_TOKEN=<your-token>
```

### Client Environment
```bash
cd client
# No .env file needed for basic development
# Next.js will run on http://localhost:3000 by default
```

## Common Workflows

### Starting Full Stack Development
```bash
# Terminal 1: Start server
cd server
cargo run

# Terminal 2: Start client
cd client
pnpm dev
```

### Before Committing Code
```bash
# Client
cd client
pnpm format           # Format code
pnpm lint             # Check for issues

# Server
cd server
cargo fmt             # Format code
cargo clippy          # Check for issues
```

### Checking Project Status
```bash
git status            # Check git status
cd client && pnpm list # Check client dependencies
cd server && cargo tree # Check server dependencies (if cargo-tree installed)
```