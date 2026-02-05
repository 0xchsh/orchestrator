# Orchestrator Project Tasks

## Week 1 - MVP

### Task 1: Project Setup
- [ ] Initialize Node.js/TypeScript project structure
- [ ] Set up package.json with dependencies
- [ ] Create basic folder structure
- [ ] Add environment template (.env.example)

### Task 2: Notion Integration Client  
- [ ] Build Notion API wrapper for:
  - Query Projects database (Status = Queued)
  - Query Tasks database (Status = Queued)  
  - Update Task/Project Status
  - Write PR Link field
- [ ] Add error handling and rate limiting (3 req/sec limit)
- [ ] Add unit tests for Notion API client

### Task 3: Algernon Integration
- [ ] Build Algernon dispatcher interface
- [ ] Research OpenClaw task submission method
- [ ] Create task execution wrapper
- [ ] Add timeout handling (30 min max)

### Task 4: GitHub Integration
- [ ] GitHub client for repo operations
- [ ] PR creation with proper formatting
- [ ] Branch management
- [ ] PR link retrieval for Notion updates

### Task 5: Telegram Notifications
- [ ] Set up Telegram bot client
- [ ] Build notification templates
- [ ] Add error notification handler
- [ ] Add rate limiting for messages

### Task 6: Core Polling Loop
- [ ] Main polling service architecture
- [ ] 30-second polling interval
- [ ] Status management and state machine
- [ ] Graceful shutdown on SIGTERM

### Task 7: Configuration & Deployment
- [ ] Environment configuration system
- [ ] PM2 configuration and scripts
- [ ] GitHub Actions CI/CD pipeline
- [ ] Development vs production configs

## Phase 1: Foundation (Today)
Starting with Task 1 - initializing the project structure.