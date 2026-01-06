import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TodoistService } from "../services/todoist.js";

export function registerTools(
	server: McpServer,
	todoistService: TodoistService,
) {
	server.tool("list_projects", "Get all Todoist projects", {}, async () => {
		const projects = await todoistService.getProjects();
		return {
			content: [{ type: "text", text: JSON.stringify(projects, null, 2) }],
		};
	});

	server.tool(
		"get_tasks",
		"Get tasks from Todoist",
		{
			projectId: z
				.string()
				.optional()
				.describe("Optional project ID to filter tasks"),
		},
		async ({ projectId }) => {
			const tasks = await todoistService.getTasks(projectId);
			return {
				content: [{ type: "text", text: JSON.stringify(tasks, null, 2) }],
			};
		},
	);

	server.tool(
		"add_task",
		"Add a new task to Todoist",
		{
			content: z.string().describe("Task content"),
			projectId: z.string().optional().describe("Optional project ID"),
			dueDate: z
				.string()
				.optional()
				.describe('Optional due date (e.g., "tomorrow", "next Monday")'),
		},
		async ({ content, projectId, dueDate }) => {
			const task = await todoistService.createTask(content, projectId, dueDate);
			return {
				content: [{ type: "text", text: JSON.stringify(task, null, 2) }],
			};
		},
	);

	server.tool(
		"close_task",
		"Complete a task",
		{
			taskId: z.string().describe("The ID of the task to close"),
		},
		async ({ taskId }) => {
			await todoistService.closeTask(taskId);
			return {
				content: [
					{ type: "text", text: `Task ${taskId} closed successfully.` },
				],
			};
		},
	);

	server.tool(
		"create_project",
		"Create a new Todoist project",
		{
			name: z.string().describe("The name of the project to create"),
			parentId: z
				.string()
				.optional()
				.describe("The ID of the parent project (to create a sub-project)"),
		},
		async ({ name, parentId }) => {
			const project = await todoistService.createProject(name, parentId);
			return {
				content: [{ type: "text", text: JSON.stringify(project, null, 2) }],
			};
		},
	);
}
