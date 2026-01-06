import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { TodoistService } from "./services/todoist.js";
import { registerTools } from "./tools/index.js";

dotenv.config();

const API_TOKEN = process.env.TODOIST_API_TOKEN;
const MCP_API_KEY = process.env.MCP_API_KEY;
const PORT = process.env.PORT || 8881;
const TRANSPORT = process.env.TRANSPORT || "sse"; // Default to SSE if not specified

if (!API_TOKEN) {
	console.error("TODOIST_API_TOKEN is required");
	process.exit(1);
}

const todoistService = new TodoistService(API_TOKEN);

const server = new McpServer({
	name: "todoist-mcp",
	version: "1.0.0",
});

registerTools(server, todoistService);

async function startServer() {
	if (TRANSPORT === "stdio") {
		console.error("Starting Todoist MCP Server in Stdio mode...");
		const transport = new StdioServerTransport();
		await server.connect(transport);
	} else {
		const app = express();
		app.use(cors());

		// Auth middleware
		app.use((req, res, next) => {
			if (!MCP_API_KEY) {
				return next();
			}

			const authHeader = req.headers.authorization;
			const apiKey = req.query.apiKey;

			if (
				(authHeader && authHeader === `Bearer ${MCP_API_KEY}`) ||
				apiKey === MCP_API_KEY
			) {
				return next();
			}

			res.status(401).send("Unauthorized");
		});

		let transport: SSEServerTransport | null = null;

		app.get("/sse", async (_req, res) => {
			console.log("New SSE connection");
			transport = new SSEServerTransport("/messages", res);
			await server.connect(transport);
		});

		app.post("/messages", async (req, res) => {
			// console.log('Received message');
			if (transport) {
				await transport.handlePostMessage(req, res);
			} else {
				res.status(400).send("No active SSE connection");
			}
		});

		app.listen(PORT, () => {
			console.log(`Todoist MCP Server running on port ${PORT}`);
		});
	}
}

startServer().catch((err) => {
	console.error("Failed to start server:", err);
	process.exit(1);
});
