## About

This is responsive web app designed to help keep track of responsibilities and obligations in a form of a to-do task list.

### Visuals
**[Watch 3-Minute Video Demo](./demo-tasklist.mp4)**

#### Login page
![screen of logging page](screen_log_in.png)


#### Main dashboard
![screen of main dashboard](screen_dashboard.png)

#### Window for task creation
![screen of task creation window](screen_task_creation.png)

#### Window for tag creation
![screen of tag creation window](screen_tag_creation.png)

## Features
- Dynamic filtering and sorting tasks (tags, priorities, dates, etc.)
- Optimistic UI design, debouncer for "spammable" requests
- Authorisation and Session management through API
- Interactive tag creation with color-picking and cascade deletion.

## Tech stack
- **Frontend**: Svelte 5, TypeScript, Vite
- **Backend**: Express, TypeScript, SQLite

## Quick Start

To install dependencies, build both client & server, and copy static files in a single step:

```bash
npm run build
npm start