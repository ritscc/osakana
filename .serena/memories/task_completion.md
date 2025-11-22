# Task Completion Checklist

When completing a task, follow these steps to ensure code quality and consistency:

## Before Starting Work

1. **Understand the Requirements**
   - Clarify any ambiguous requirements with the user
   - Understand the scope and expected outcome

2. **Explore the Codebase**
   - Use symbolic tools (`get_symbols_overview`, `find_symbol`) to understand structure
   - Read only necessary code, avoid reading entire files unnecessarily
   - Check existing patterns and conventions

## During Development

1. **Follow Code Style**
   - Adhere to project conventions (see `code_style.md`)
   - Use appropriate naming conventions
   - Maintain consistent formatting

2. **Write Clean Code**
   - Keep functions focused and small
   - Use meaningful variable names
   - Add comments for complex logic
   - Follow existing patterns in the codebase

3. **Handle Errors Appropriately**
   - Client: Handle errors gracefully in UI
   - Server: Return appropriate HTTP status codes
   - Use proper error types in Rust

## Before Committing/Submitting

### Client (TypeScript/React)

1. **Format Code**
   ```bash
   cd client
   pnpm format
   ```

2. **Lint Code**
   ```bash
   cd client
   pnpm lint
   ```
   - Fix any linting errors
   - Address warnings if critical

3. **Verify Functionality**
   - Test the changes in development (`pnpm dev`)
   - Check browser console for errors
   - Verify UI behavior

### Server (Rust)

1. **Format Code**
   ```bash
   cd server
   cargo fmt
   ```

2. **Check Code**
   ```bash
   cd server
   cargo check
   ```

3. **Run Clippy**
   ```bash
   cd server
   cargo clippy
   ```
   - Fix any warnings or errors
   - Consider suggestions for improvement

4. **Test (if applicable)**
   ```bash
   cd server
   cargo test
   ```

5. **Verify Functionality**
   - Run the server (`cargo run`)
   - Test API endpoints
   - Check logs for errors

## Final Checklist

- [ ] Code is formatted (client: `pnpm format`, server: `cargo fmt`)
- [ ] Code passes linting (client: `pnpm lint`, server: `cargo clippy`)
- [ ] Code compiles/builds without errors
- [ ] Functionality works as expected
- [ ] No console errors or warnings (client)
- [ ] No unexpected log errors (server)
- [ ] Changes follow existing code patterns
- [ ] No unnecessary files created
- [ ] Documentation updated if needed

## Common Issues to Avoid

1. **Don't read entire files unnecessarily**
   - Use symbolic tools first
   - Read only what you need

2. **Don't break existing functionality**
   - Test related features
   - Check for breaking changes

3. **Don't ignore linting/formatting**
   - Always format before committing
   - Fix linting errors

4. **Don't create unnecessary files**
   - Reuse existing components/utilities
   - Follow project structure

5. **Don't hardcode values**
   - Use environment variables when appropriate
   - Make code configurable

## Integration Testing

If making changes that affect both client and server:

1. Start both services
2. Test the full flow
3. Verify real-time features (SSE) if applicable
4. Check CORS if making API changes
5. Verify error handling across the stack

## Documentation

- Update code comments if logic changes significantly
- Update README if adding new commands or setup steps
- Document new environment variables if added