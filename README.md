# Todoist MCP Server

A Model Context Protocol (MCP) server for Todoist. This server allows LLMs to interact with Todoist to manage tasks, projects, labels, and comments.

## Features

- **Manage Tasks:** List, create, update, close, delete, and move tasks.
- **Manage Projects:** List, create, update, and delete projects.
- **Manage Labels:** List, create, update, and delete labels.
- **Manage Comments:** Get, add, and delete comments on tasks or projects.
- **Search:** Search tasks by content or description.
- **Filtering:** Filter tasks by project, section, label, priority.

## Prerequisites

- Node.js (v18 or higher)
- A Todoist Account
- Todoist API Token (found in Todoist Settings > Integrations > Developer)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd todoist-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Required
TODOIST_API_TOKEN=your_todoist_api_token_here

# Optional
PORT=8881
TRANSPORT=sse # or 'stdio'
MCP_API_KEY=your_optional_mcp_api_key
DEFAULT_PROJECT_ID=your_default_project_id
```

### Project Context

The server automatically picks up a default project ID from:
1. `DEFAULT_PROJECT_ID` environment variable.
2. A `project.id` file in the current working directory.

If a default project ID is set, tools like `get_tasks`, `add_task`, and `add_comment` will use it if no specific project or task ID is provided.

## Available Tools

### Stdio Mode (Default for MCP Clients)

To run the server in `stdio` mode (communicating via standard input/output):

```bash
npm run start:stdio
```

Or configure your MCP client (like Claude Desktop) to run:

```json
{
  "mcpServers": {
    "todoist": {
      "command": "node",
      "args": ["/path/to/todoist-mcp/dist/index.js"],
      "env": {
        "TODOIST_API_TOKEN": "your_token",
        "TRANSPORT": "stdio"
      }
    }
  }
}
```

### SSE Mode (HTTP Server)

To run the server as an HTTP server supporting Server-Sent Events (SSE):

```bash
npm start
```
The server will start on port 8881 (or the port defined in `.env`).

## Available Tools

- `list_projects`: Get all Todoist projects.
- `get_tasks`: Get tasks with optional filtering (project, label, priority) and search.
- `add_task`: Add a new task.
- `update_task`: Update an existing task.
- `close_task`: Complete a task.
- `delete_task`: Delete a task.
- `move_task`: Move a task to a different project/section.
- `get_labels`: Get all labels.
- `create_label`: Create a new label.
- `update_label`: Update a label.
- `delete_label`: Delete a label.
- `create_project`: Create a new project.
- `update_project`: Update a project.
- `delete_project`: Delete a project.
- `get_comments`: Get comments for a task or project.
- `add_comment`: Add a comment to a task or project.
- `delete_comment`: Delete a comment.

## Development

- **Build:** `npm run build`
- **Test:** `npm test`
- **Lint:** `npm run lint`
- **Format:** `npm run format`

## Docker

You can also run the server using Docker.

1. Build the image:
   ```bash
   make docker-build
   ```

2. Run the container:
   ```bash
   make docker-up
   ```
