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

interface TodoistListResponse<T> {
	results: T[];
}

interface TodoistIdMapping {
	old_id: string;
	new_id: string;
}

export class TodoistService {
	private client: AxiosInstance;
	private defaultProjectId?: string;
	private projectIdMappingCache = new Map<string, string>();
	private taskIdMappingCache = new Map<string, string>();

	constructor(token: string, defaultProjectId?: string) {
		this.client = axios.create({
			baseURL: "https://api.todoist.com/api/v1",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});
		this.defaultProjectId = defaultProjectId;
	}

	private unwrapListResponse<T>(data: T[] | TodoistListResponse<T>): T[] {
		return Array.isArray(data) ? data : data.results;
	}

	private async resolveProjectId(projectId?: string): Promise<string | undefined> {
		if (!projectId || !/^\d+$/.test(projectId)) {
			return projectId;
		}

		const cached = this.projectIdMappingCache.get(projectId);
		if (cached) {
			return cached;
		}

		const response = await this.client.get<TodoistIdMapping[]>(
			`/id_mappings/projects/${projectId}`,
		);
		const mappedId = response.data[0]?.new_id || projectId;
		this.projectIdMappingCache.set(projectId, mappedId);
		return mappedId;
	}

	private async resolveTaskId(taskId?: string): Promise<string | undefined> {
		if (!taskId || !/^\d+$/.test(taskId)) {
			return taskId;
		}

		const cached = this.taskIdMappingCache.get(taskId);
		if (cached) {
			return cached;
		}

		const response = await this.client.get<TodoistIdMapping[]>(
			`/id_mappings/tasks/${taskId}`,
		);
		const mappedId = response.data[0]?.new_id || taskId;
		this.taskIdMappingCache.set(taskId, mappedId);
		return mappedId;
	}

	async getProjects(): Promise<TodoistProject[]> {
		const response = await this.client.get<
			TodoistProject[] | TodoistListResponse<TodoistProject>
		>("/projects");
		return this.unwrapListResponse(response.data);
	}

	async getTasks(
		options: {
			projectId?: string;
			sectionId?: string;
			label?: string;
			priority?: number;
			lang?: string;
			search?: string;
		} = {},
	): Promise<TodoistTask[]> {
		const params: any = {};
		const projectId = await this.resolveProjectId(
			options.projectId || this.defaultProjectId,
		);

		if (projectId) params.project_id = projectId;
		if (options.sectionId) params.section_id = options.sectionId;
		if (options.label) params.label = options.label;
		if (options.priority) params.priority = options.priority;
		if (options.lang) params.lang = options.lang;

		const response = await this.client.get<
			TodoistTask[] | TodoistListResponse<TodoistTask>
		>("/tasks", { params });
		let tasks = this.unwrapListResponse(response.data);

		if (options.search) {
			const query = options.search.toLowerCase();
			tasks = tasks.filter(
				(task) =>
					task.content.toLowerCase().includes(query) ||
					task.description.toLowerCase().includes(query),
			);
		}

		return tasks;
	}

	async createTask(
		content: string,
		projectId?: string,
		dueDate?: string,
		priority?: number,
		labels?: string[],
	): Promise<TodoistTask> {
		const resolvedProjectId = await this.resolveProjectId(
			projectId || this.defaultProjectId,
		);
		const response = await this.client.post<TodoistTask>("/tasks", {
			content,
			project_id: resolvedProjectId,
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
		const resolvedTaskId = await this.resolveTaskId(taskId);
		const response = await this.client.post<TodoistTask>(
			`/tasks/${resolvedTaskId}`,
			{
			content: options.content,
			description: options.description,
			due_string: options.dueDate,
			priority: options.priority,
			labels: options.labels,
			},
		);
		return response.data;
	}

	async closeTask(taskId: string): Promise<void> {
		const resolvedTaskId = await this.resolveTaskId(taskId);
		await this.client.post(`/tasks/${resolvedTaskId}/close`);
	}

	async moveTask(
		taskId: string,
		options: {
			projectId?: string;
			sectionId?: string;
			parentId?: string;
		},
	): Promise<void> {
		const resolvedTaskId = await this.resolveTaskId(taskId);
		const resolvedProjectId = await this.resolveProjectId(options.projectId);
		await this.client.post(`/tasks/${resolvedTaskId}/move`, {
			project_id: resolvedProjectId,
			section_id: options.sectionId,
			parent_id: options.parentId,
		});
	}

	async deleteTask(taskId: string): Promise<void> {
		const resolvedTaskId = await this.resolveTaskId(taskId);
		await this.client.delete(`/tasks/${resolvedTaskId}`);
	}

	async getLabels(): Promise<TodoistLabel[]> {
		const response = await this.client.get<
			TodoistLabel[] | TodoistListResponse<TodoistLabel>
		>("/labels");
		return this.unwrapListResponse(response.data);
	}

	async createLabel(
		name: string,
		order?: number,
		color?: string,
		isFavorite?: boolean,
	): Promise<TodoistLabel> {
		const response = await this.client.post<TodoistLabel>("/labels", {
			name,
			order,
			color,
			is_favorite: isFavorite,
		});
		return response.data;
	}

	async updateLabel(
		labelId: string,
		options: {
			name?: string;
			order?: number;
			color?: string;
			isFavorite?: boolean;
		},
	): Promise<TodoistLabel> {
		const response = await this.client.post<TodoistLabel>(
			`/labels/${labelId}`,
			{
				name: options.name,
				order: options.order,
				color: options.color,
				is_favorite: options.isFavorite,
			},
		);
		return response.data;
	}

	async deleteLabel(labelId: string): Promise<void> {
		await this.client.delete(`/labels/${labelId}`);
	}

	async createProject(
		name: string,
		parentId?: string,
	): Promise<TodoistProject> {
		const resolvedParentId = await this.resolveProjectId(parentId);
		const response = await this.client.post<TodoistProject>("/projects", {
			name,
			parent_id: resolvedParentId,
		});
		return response.data;
	}

	async updateProject(
		projectId: string,
		name: string,
	): Promise<TodoistProject> {
		const resolvedProjectId = await this.resolveProjectId(projectId);
		const response = await this.client.post<TodoistProject>(
			`/projects/${resolvedProjectId}`,
			{
				name,
			},
		);
		return response.data;
	}

	async deleteProject(projectId: string): Promise<void> {
		const resolvedProjectId = await this.resolveProjectId(projectId);
		await this.client.delete(`/projects/${resolvedProjectId}`);
	}

	async getComments(
		taskId?: string,
		projectId?: string,
	): Promise<TodoistComment[]> {
		const params: any = {};
		if (taskId) {
			params.task_id = await this.resolveTaskId(taskId);
		} else {
			params.project_id = await this.resolveProjectId(
				projectId || this.defaultProjectId,
			);
		}
		const response = await this.client.get<
			TodoistComment[] | TodoistListResponse<TodoistComment>
		>("/comments", {
			params,
		});
		return this.unwrapListResponse(response.data);
	}

	async addComment(
		content: string,
		taskId?: string,
		projectId?: string,
	): Promise<TodoistComment> {
		const data: any = { content };
		if (taskId) {
			data.task_id = await this.resolveTaskId(taskId);
		} else {
			data.project_id = await this.resolveProjectId(
				projectId || this.defaultProjectId,
			);
		}

		const response = await this.client.post<TodoistComment>("/comments", data);
		return response.data;
	}

	async deleteComment(commentId: string): Promise<void> {
		await this.client.delete(`/comments/${commentId}`);
	}
}
