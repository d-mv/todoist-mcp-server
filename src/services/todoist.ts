import axios, { type AxiosInstance } from "axios";

export interface TodoistTask {
	id: string;
	content: string;
	description: string;
	project_id: string;
	priority: number;
	labels: string[];
	due?: {
		date: string;
		string: string;
		lang: string;
		is_recurring: boolean;
	};
}

export interface TodoistLabel {
	id: string;
	name: string;
	color: string;
	order: number;
	is_favorite: boolean;
}

export interface TodoistProject {
	id: string;
	name: string;
	parent_id?: string | null;
}

export interface TodoistComment {
	id: string;
	task_id?: string;
	project_id?: string;
	content: string;
	posted_at: string;
	attachment?: {
		file_name: string;
		file_type: string;
		file_url: string;
		resource_type: string;
	};
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
		priority?: number,
		labels?: string[],
	): Promise<TodoistTask> {
		const response = await this.client.post<TodoistTask>("/tasks", {
			content,
			project_id: projectId,
			due_string: dueDate,
			priority,
			labels,
		});
		return response.data;
	}

	async updateTask(
		taskId: string,
		options: {
			content?: string;
			description?: string;
			dueDate?: string;
			priority?: number;
			labels?: string[];
		},
	): Promise<TodoistTask> {
		const response = await this.client.post<TodoistTask>(`/tasks/${taskId}`, {
			content: options.content,
			description: options.description,
			due_string: options.dueDate,
			priority: options.priority,
			labels: options.labels,
		});
		return response.data;
	}

	async closeTask(taskId: string): Promise<void> {
		await this.client.post(`/tasks/${taskId}/close`);
	}

	async moveTask(
		taskId: string,
		options: {
			projectId?: string;
			sectionId?: string;
			parentId?: string;
		},
	): Promise<void> {
		await this.client.post(`/tasks/${taskId}/move`, {
			project_id: options.projectId,
			section_id: options.sectionId,
			parent_id: options.parentId,
		});
	}

	async deleteTask(taskId: string): Promise<void> {
		await this.client.delete(`/tasks/${taskId}`);
	}

	async getLabels(): Promise<TodoistLabel[]> {
		const response = await this.client.get<TodoistLabel[]>("/labels");
		return response.data;
	}

	async createLabel(name: string, order?: number, color?: string, isFavorite?: boolean): Promise<TodoistLabel> {
		const response = await this.client.post<TodoistLabel>("/labels", {
			name,
			order,
			color,
			is_favorite: isFavorite
		});
		return response.data;
	}

	async updateLabel(labelId: string, options: { name?: string, order?: number, color?: string, isFavorite?: boolean }): Promise<TodoistLabel> {
		const response = await this.client.post<TodoistLabel>(`/labels/${labelId}`, {
			name: options.name,
			order: options.order,
			color: options.color,
			is_favorite: options.isFavorite
		});
		return response.data;
	}

	async deleteLabel(labelId: string): Promise<void> {
		await this.client.delete(`/labels/${labelId}`);
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

	async updateProject(
		projectId: string,
		name: string,
	): Promise<TodoistProject> {
		const response = await this.client.post<TodoistProject>(
			`/projects/${projectId}`,
			{
				name,
			},
		);
		return response.data;
	}

	async deleteProject(projectId: string): Promise<void> {
		await this.client.delete(`/projects/${projectId}`);
	}

	async getComments(
		taskId?: string,
		projectId?: string,
	): Promise<TodoistComment[]> {
		const params: any = {};
		if (taskId) params.task_id = taskId;
		if (projectId) params.project_id = projectId;
		const response = await this.client.get<TodoistComment[]>("/comments", {
			params,
		});
		return response.data;
	}

	async addComment(
		content: string,
		taskId?: string,
		projectId?: string,
	): Promise<TodoistComment> {
		const data: any = { content };
		if (taskId) data.task_id = taskId;
		if (projectId) data.project_id = projectId;

		const response = await this.client.post<TodoistComment>("/comments", data);
		return response.data;
	}

	async deleteComment(commentId: string): Promise<void> {
		await this.client.delete(`/comments/${commentId}`);
	}
}
