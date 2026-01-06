import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import cors from "cors";
import dotenv from "dotenv";
import express, {
	type NextFunction,
	type Request,
	type Response,
} from "express";
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

async function main() {
	try {
		if (TRANSPORT === "stdio") {
			console.error("Starting Todoist MCP Server in Stdio mode...");

			const transport = new StdioServerTransport();

			await server.connect(transport);
		} else {
			const app = express();

			app.use(cors());

			app.use(express.json());

			app.get("/healthcheck", (_req: Request, res: Response) => {
				res.status(200).send("OK");
			});

			const authMiddleware = (
				req: Request,

				res: Response,

				next: NextFunction,
			) => {
				if (!MCP_API_KEY) {
					return next(); // No API key configured, auth is disabled
				}

				const authHeader = req.headers.authorization;

				const apiKey = req.query.apiKey;

				if (
					(authHeader && authHeader === `Bearer ${MCP_API_KEY}`) ||
					(apiKey && apiKey === MCP_API_KEY)
				) {
					return next();
				}

				res.status(401).send("Unauthorized");
			};

			const transport = new StreamableHTTPServerTransport();

			await server.connect(transport);

			app.all("/mcp", authMiddleware, async (req: Request, res: Response) => {
				await transport.handleRequest(req, res, req.body);
			});

			app.listen(PORT, () => {
				console.log(`Todoist MCP Server running on port ${PORT}`);

				console.log("Server started successfully!");
			});
		}
	} catch (err) {
		console.error("Critical error in startServer:", err);

		process.exit(1);
	}
}

main();
