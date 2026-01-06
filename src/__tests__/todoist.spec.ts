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

	it("should create a task", async () => {
		const mockTask = { id: "123", content: "Test Task" };
		mockAxios.post.mockResolvedValue({ data: mockTask });

		const task = await service.createTask("Test Task", "project1", "tomorrow");

		expect(mockAxios.post).toHaveBeenCalledWith("/tasks", {
			content: "Test Task",
			project_id: "project1",
			due_string: "tomorrow",
		});
		expect(task).toEqual(mockTask);
	});
});
