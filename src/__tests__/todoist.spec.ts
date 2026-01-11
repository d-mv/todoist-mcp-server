import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TodoistService } from "../services/todoist.js";

vi.mock("axios");

describe("TodoistService", () => {
	const token = "test-token";
	let service: TodoistService;
	const mockAxios = {
		get: vi.fn(),
		post: vi.fn(),
		delete: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
		(axios.create as any).mockReturnValue(mockAxios);
		service = new TodoistService(token);
	});

	it("should get projects", async () => {
		const mockProjects = [{ id: "1", name: "Inbox" }];
		mockAxios.get.mockResolvedValue({ data: mockProjects });

		const projects = await service.getProjects();

		expect(mockAxios.get).toHaveBeenCalledWith("/projects");
		expect(projects).toEqual(mockProjects);
	});

	it("should get tasks with filters", async () => {
		const mockTasks = [{ id: "t1", content: "Task 1", description: "" }];
		mockAxios.get.mockResolvedValue({ data: mockTasks });

		const tasks = await service.getTasks({ projectId: "p1", priority: 4 });

		expect(mockAxios.get).toHaveBeenCalledWith("/tasks", {
			params: { project_id: "p1", priority: 4 },
		});
		expect(tasks).toEqual(mockTasks);
	});

	it("should search tasks by content", async () => {
		const mockTasks = [
			{ id: "t1", content: "Buy milk", description: "" },
			{ id: "t2", content: "Call mom", description: "urgent" },
		];
		mockAxios.get.mockResolvedValue({ data: mockTasks });

		const tasks = await service.getTasks({ search: "milk" });

		expect(tasks).toEqual([mockTasks[0]]);
	});

	it("should search tasks by description", async () => {
		const mockTasks = [
			{ id: "t1", content: "Buy milk", description: "" },
			{ id: "t2", content: "Call mom", description: "urgent" },
		];
		mockAxios.get.mockResolvedValue({ data: mockTasks });

		const tasks = await service.getTasks({ search: "urgent" });

		expect(tasks).toEqual([mockTasks[1]]);
	});

	it("should get tasks with defaultProjectId if none provided", async () => {
		const serviceWithDefault = new TodoistService(token, "default-p1");
		const mockTasks = [{ id: "t1", content: "Task 1" }];
		mockAxios.get.mockResolvedValue({ data: mockTasks });

		const tasks = await serviceWithDefault.getTasks();

		expect(mockAxios.get).toHaveBeenCalledWith("/tasks", {
			params: { project_id: "default-p1" },
		});
		expect(tasks).toEqual(mockTasks);
	});

	it("should override defaultProjectId in getTasks if projectId provided", async () => {
		const serviceWithDefault = new TodoistService(token, "default-p1");
		const mockTasks = [{ id: "t1", content: "Task 1" }];
		mockAxios.get.mockResolvedValue({ data: mockTasks });

		await serviceWithDefault.getTasks({ projectId: "other-p" });

		expect(mockAxios.get).toHaveBeenCalledWith("/tasks", {
			params: { project_id: "other-p" },
		});
	});

	it("should create a task with defaultProjectId if none provided", async () => {
		const serviceWithDefault = new TodoistService(token, "default-p1");
		const mockTask = { id: "123", content: "Test Task" };
		mockAxios.post.mockResolvedValue({ data: mockTask });

		await serviceWithDefault.createTask("Test Task");

		expect(mockAxios.post).toHaveBeenCalledWith("/tasks", {
			content: "Test Task",
			project_id: "default-p1",
			due_string: undefined,
			priority: undefined,
			labels: undefined,
		});
	});

	it("should use defaultProjectId for comments if taskId not provided", async () => {
		const serviceWithDefault = new TodoistService(token, "default-p1");
		const mockComments = [{ id: "c1", content: "Test comment" }];
		mockAxios.get.mockResolvedValue({ data: mockComments });

		await serviceWithDefault.getComments();

		expect(mockAxios.get).toHaveBeenCalledWith("/comments", {
			params: { project_id: "default-p1" },
		});
	});

	it("should delete a task", async () => {
		mockAxios.delete.mockResolvedValue({});
		await service.deleteTask("123");
		expect(mockAxios.delete).toHaveBeenCalledWith("/tasks/123");
	});

	it("should move a task", async () => {
		mockAxios.post.mockResolvedValue({});
		await service.moveTask("123", { projectId: "p1" });
		expect(mockAxios.post).toHaveBeenCalledWith("/tasks/123/move", {
			project_id: "p1",
			section_id: undefined,
			parent_id: undefined,
		});
	});

	it("should get labels", async () => {
		const mockLabels = [{ id: "l1", name: "label1" }];
		mockAxios.get.mockResolvedValue({ data: mockLabels });

		const labels = await service.getLabels();

		expect(mockAxios.get).toHaveBeenCalledWith("/labels");
		expect(labels).toEqual(mockLabels);
	});

	it("should create a label", async () => {
		const mockLabel = { id: "l1", name: "new_label" };
		mockAxios.post.mockResolvedValue({ data: mockLabel });

		const label = await service.createLabel("new_label");

		expect(mockAxios.post).toHaveBeenCalledWith("/labels", {
			name: "new_label",
			order: undefined,
			color: undefined,
			is_favorite: undefined,
		});
		expect(label).toEqual(mockLabel);
	});

	it("should update a label", async () => {
		const mockLabel = { id: "l1", name: "updated_label" };
		mockAxios.post.mockResolvedValue({ data: mockLabel });

		const label = await service.updateLabel("l1", { name: "updated_label" });

		expect(mockAxios.post).toHaveBeenCalledWith("/labels/l1", {
			name: "updated_label",
			order: undefined,
			color: undefined,
			is_favorite: undefined,
		});
		expect(label).toEqual(mockLabel);
	});

	it("should delete a label", async () => {
		mockAxios.delete.mockResolvedValue({});
		await service.deleteLabel("l1");
		expect(mockAxios.delete).toHaveBeenCalledWith("/labels/l1");
	});

	it("should update a project", async () => {
		const mockProject = { id: "456", name: "Updated Project" };
		mockAxios.post.mockResolvedValue({ data: mockProject });

		const project = await service.updateProject("456", "Updated Project");

		expect(mockAxios.post).toHaveBeenCalledWith("/projects/456", {
			name: "Updated Project",
		});
		expect(project).toEqual(mockProject);
	});

	it("should delete a project", async () => {
		mockAxios.delete.mockResolvedValue({});
		await service.deleteProject("456");
		expect(mockAxios.delete).toHaveBeenCalledWith("/projects/456");
	});

	it("should get comments", async () => {
		const mockComments = [{ id: "c1", content: "Test comment" }];
		mockAxios.get.mockResolvedValue({ data: mockComments });

		const comments = await service.getComments("task1");

		expect(mockAxios.get).toHaveBeenCalledWith("/comments", {
			params: { task_id: "task1" },
		});
		expect(comments).toEqual(mockComments);
	});

	it("should add a comment", async () => {
		const mockComment = { id: "c1", content: "New comment" };
		mockAxios.post.mockResolvedValue({ data: mockComment });

		const comment = await service.addComment("New comment", "task1");

		expect(mockAxios.post).toHaveBeenCalledWith("/comments", {
			content: "New comment",
			task_id: "task1",
		});
		expect(comment).toEqual(mockComment);
	});

	it("should delete a comment", async () => {
		mockAxios.delete.mockResolvedValue({});
		await service.deleteComment("c1");
		expect(mockAxios.delete).toHaveBeenCalledWith("/comments/c1");
	});
});
