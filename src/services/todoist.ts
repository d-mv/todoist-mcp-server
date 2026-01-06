import axios, { type AxiosInstance } from "axios";

export interface TodoistTask {
	id: string;
	content: string;
	description: string;
	project_id: string;
	due?: {
		date: string;
		string: string;
		lang: string;
		is_recurring: boolean;
	};
}

export interface TodoistProject {
	id: string;
	name: string;
	parent_id?: string | null;
}

export class TodoistService {
	private client: AxiosInstance;

	constructor(token: string) {
		this.client = axios.create({
			baseURL: "https://api.todoist.com/rest/v2",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});
	}

	async getProjects(): Promise<TodoistProject[]> {
		const response = await this.client.get<TodoistProject[]>("/projects");
		return response.data;
	}

	async getTasks(projectId?: string): Promise<TodoistTask[]> {
		const params = projectId ? { project_id: projectId } : {};
		const response = await this.client.get<TodoistTask[]>("/tasks", { params });
		return response.data;
	}

	async createTask(
		content: string,
		projectId?: string,
		dueDate?: string,
	): Promise<TodoistTask> {
		const response = await this.client.post<TodoistTask>("/tasks", {
			content,
			project_id: projectId,
			due_string: dueDate,
		});
		return response.data;
	}

	async closeTask(taskId: string): Promise<void> {
		await this.client.post(`/tasks/${taskId}/close`);
	}

	async createProject(
		name: string,
		parentId?: string,
	): Promise<TodoistProject> {
		const response = await this.client.post<TodoistProject>("/projects", {
			name,
			parent_id: parentId,
		});
		return response.data;
	}
}
