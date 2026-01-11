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
		"Get tasks from Todoist with optional filtering and search. Defaults to the current project if none specified.",
		{
			projectId: z
				.string()
				.optional()
				.describe(
					"Optional project ID to filter tasks. If not provided, uses the default project.",
				),
			sectionId: z
				.string()
				.optional()
				.describe("Optional section ID to filter tasks"),
			label: z
				.string()
				.optional()
				.describe("Optional label name to filter tasks"),
			priority: z
				.number()
				.optional()
				.describe("Optional priority (1-4) to filter tasks"),
			search: z
				.string()
				.optional()
				.describe(
					"Optional search query to filter tasks by content or description",
				),
		},
		async ({ projectId, sectionId, label, priority, search }) => {
			const tasks = await todoistService.getTasks({
				projectId,
				sectionId,
				label,
				priority,
				search,
			});
			return {
				content: [{ type: "text", text: JSON.stringify(tasks, null, 2) }],
			};
		},
	);

	server.tool(
		"add_task",
		"Add a new task to Todoist. Defaults to the current project if none specified.",
		{
			content: z.string().describe("Task content"),
			projectId: z
				.string()
				.optional()
				.describe(
					"Optional project ID. If not provided, uses the default project.",
				),
			dueDate: z
				.string()
				.optional()
				.describe('Optional due date (e.g., "tomorrow", "next Monday")'),
			priority: z
				.number()
				.optional()
				.describe("Task priority from 1 (normal) to 4 (urgent)"),
			labels: z
				.array(z.string())
				.optional()
				.describe("List of label names to add to the task"),
		},
		async ({ content, projectId, dueDate, priority, labels }) => {
			const task = await todoistService.createTask(
				content,
				projectId,
				dueDate,
				priority,
				labels,
			);
			return {
				content: [{ type: "text", text: JSON.stringify(task, null, 2) }],
			};
		},
	);

	server.tool(
		"update_task",
		"Update a task",
		{
			taskId: z.string().describe("The ID of the task to update"),
			content: z.string().optional().describe("New task content"),
			description: z.string().optional().describe("New task description"),
			dueDate: z.string().optional().describe("New due date"),
			priority: z.number().optional().describe("New priority (1-4)"),
			labels: z
				.array(z.string())
				.optional()
				.describe("List of label names to replace existing labels"),
		},
		async ({ taskId, content, description, dueDate, priority, labels }) => {
			const task = await todoistService.updateTask(taskId, {
				content,
				description,
				dueDate,
				priority,
				labels,
			});
			return {
				content: [{ type: "text", text: JSON.stringify(task, null, 2) }],
			};
		},
	);

	server.tool("get_labels", "Get all Todoist labels", {}, async () => {
		const labels = await todoistService.getLabels();
		return {
			content: [{ type: "text", text: JSON.stringify(labels, null, 2) }],
		};
	});

	server.tool(
		"create_label",
		"Create a new label",
		{
			name: z.string().describe("Name of the label"),
			order: z.number().optional().describe("Order of the label"),
			color: z
				.string()
				.optional()
				.describe("Color of the label (e.g., 'berry_red')"),
			isFavorite: z
				.boolean()
				.optional()
				.describe("Whether the label is a favorite"),
		},
		async ({ name, order, color, isFavorite }) => {
			const label = await todoistService.createLabel(
				name,
				order,
				color,
				isFavorite,
			);
			return {
				content: [{ type: "text", text: JSON.stringify(label, null, 2) }],
			};
		},
	);

	server.tool(
		"update_label",
		"Update a label",
		{
			labelId: z.string().describe("ID of the label to update"),
			name: z.string().optional().describe("New name of the label"),
			order: z.number().optional().describe("New order of the label"),
			color: z.string().optional().describe("New color of the label"),
			isFavorite: z
				.boolean()
				.optional()
				.describe("Whether the label is a favorite"),
		},
		async ({ labelId, name, order, color, isFavorite }) => {
			const label = await todoistService.updateLabel(labelId, {
				name,
				order,
				color,
				isFavorite,
			});
			return {
				content: [{ type: "text", text: JSON.stringify(label, null, 2) }],
			};
		},
	);

	server.tool(
		"delete_label",
		"Delete a label",
		{
			labelId: z.string().describe("ID of the label to delete"),
		},
		async ({ labelId }) => {
			await todoistService.deleteLabel(labelId);
			return {
				content: [
					{ type: "text", text: `Label ${labelId} deleted successfully.` },
				],
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
		"move_task",
		"Move a task to a different project, section, or parent task",
		{
			taskId: z.string().describe("The ID of the task to move"),
			projectId: z
				.string()
				.optional()
				.describe("ID of the destination project"),
			sectionId: z
				.string()
				.optional()
				.describe("ID of the destination section"),
			parentId: z
				.string()
				.optional()
				.describe("ID of the destination parent task"),
		},
		async ({ taskId, projectId, sectionId, parentId }) => {
			await todoistService.moveTask(taskId, { projectId, sectionId, parentId });
			return {
				content: [{ type: "text", text: `Task ${taskId} moved successfully.` }],
			};
		},
	);

	server.tool(
		"delete_task",
		"Delete a task",
		{
			taskId: z.string().describe("The ID of the task to delete"),
		},
		async ({ taskId }) => {
			await todoistService.deleteTask(taskId);
			return {
				content: [
					{ type: "text", text: `Task ${taskId} deleted successfully.` },
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

	server.tool(
		"update_project",
		"Update a project",
		{
			projectId: z.string().describe("The ID of the project to update"),
			name: z.string().describe("The new name of the project"),
		},
		async ({ projectId, name }) => {
			const project = await todoistService.updateProject(projectId, name);
			return {
				content: [{ type: "text", text: JSON.stringify(project, null, 2) }],
			};
		},
	);

	server.tool(
		"delete_project",
		"Delete a project",
		{
			projectId: z.string().describe("The ID of the project to delete"),
			confirm: z
				.boolean()
				.optional()
				.describe("Confirm deletion if project is not empty"),
		},
		async ({ projectId, confirm }) => {
			const tasks = await todoistService.getTasks({ projectId });
			if (tasks.length > 0 && !confirm) {
				return {
					isError: true,
					content: [
						{
							type: "text",
							text: `Project ${projectId} is not empty. It has ${tasks.length} tasks. Please use 'confirm: true' to delete it.`,
						},
					],
				};
			}

			await todoistService.deleteProject(projectId);
			return {
				content: [
					{ type: "text", text: `Project ${projectId} deleted successfully.` },
				],
			};
		},
	);

	server.tool(
		"get_comments",
		"Get comments for a task or project. Defaults to the current project if no IDs provided.",
		{
			taskId: z.string().optional().describe("The ID of the task"),
			projectId: z
				.string()
				.optional()
				.describe(
					"The ID of the project. If not provided (and no taskId), uses the default project.",
				),
		},
		async ({ taskId, projectId }) => {
			const comments = await todoistService.getComments(taskId, projectId);
			return {
				content: [{ type: "text", text: JSON.stringify(comments, null, 2) }],
			};
		},
	);

	server.tool(
		"add_comment",
		"Add a comment to a task or project. Defaults to the current project if no IDs provided.",
		{
			content: z.string().describe("The content of the comment"),
			taskId: z.string().optional().describe("The ID of the task"),
			projectId: z
				.string()
				.optional()
				.describe(
					"The ID of the project. If not provided (and no taskId), uses the default project.",
				),
		},
		async ({ content, taskId, projectId }) => {
			if (!taskId && !projectId) {
				return {
					isError: true,
					content: [
						{
							type: "text",
							text: "Either taskId or projectId must be provided.",
						},
					],
				};
			}
			const comment = await todoistService.addComment(
				content,
				taskId,
				projectId,
			);
			return {
				content: [{ type: "text", text: JSON.stringify(comment, null, 2) }],
			};
		},
	);

	server.tool(
		"delete_comment",
		"Delete a comment",
		{
			commentId: z.string().describe("The ID of the comment to delete"),
		},
		async ({ commentId }) => {
			await todoistService.deleteComment(commentId);
			return {
				content: [
					{ type: "text", text: `Comment ${commentId} deleted successfully.` },
				],
			};
		},
	);
}
