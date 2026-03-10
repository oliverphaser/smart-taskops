import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { Request, Response } from "express";
import { z } from "zod";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:4000/api/v1";
const MCP_TRANSPORT = process.env.MCP_TRANSPORT ?? "http";
const MCP_PORT = Number(process.env.MCP_PORT ?? "4100");

interface ApiResponse<T> {
  data: T;
  error?: string;
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json"
    },
    ...init
  });

  if (!response.ok) {
    const fallback = `Hiba történt (${response.status}).`;
    try {
      const body = (await response.json()) as ApiResponse<never>;
      throw new Error(body.error ?? fallback);
    } catch {
      throw new Error(fallback);
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body = (await response.json()) as ApiResponse<T>;
  return body.data;
}

const createServer = (): McpServer => {
  const server = new McpServer({
    name: "smart-taskops-mcp-server",
    version: "1.0.0"
  });

  server.registerTool(
    "task_lista",
    {
      title: "Task lista",
      description: "Taskok listázása opcionális szűrésekkel.",
      inputSchema: {
        status: z.enum(["todo", "in_progress", "done"]).optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        q: z.string().optional()
      }
    },
    async (args) => {
      const params = new URLSearchParams();
      if (args.status) params.set("status", args.status);
      if (args.priority) params.set("priority", args.priority);
      if (args.q) params.set("q", args.q);
      const query = params.toString();
      const data = await apiRequest<unknown[]>(`/tasks${query ? `?${query}` : ""}`);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2)
          }
        ]
      };
    }
  );

  server.registerTool(
    "task_letrehozas",
    {
      title: "Task létrehozás",
      description: "Új task létrehozása.",
      inputSchema: {
        title: z.string().min(1),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        tags: z.array(z.string()).optional(),
        dueDate: z.string().datetime().optional()
      }
    },
    async (args) => {
      const data = await apiRequest<unknown>("/tasks", {
        method: "POST",
        body: JSON.stringify(args)
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2)
          }
        ]
      };
    }
  );

  server.registerTool(
    "task_modositas",
    {
      title: "Task módosítása",
      description: "Meglévő task mezőinek módosítása.",
      inputSchema: {
        id: z.string().regex(/^[0-9a-fA-F]{24}$/),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["todo", "in_progress", "done"]).optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        tags: z.array(z.string()).optional(),
        dueDate: z.string().datetime().optional()
      }
    },
    async ({ id, ...payload }) => {
      const data = await apiRequest<unknown>(`/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2)
          }
        ]
      };
    }
  );

  server.registerTool(
    "task_lezaras",
    {
      title: "Task lezárása",
      description: "Egy task státuszát kész-re állítja.",
      inputSchema: {
        id: z.string().regex(/^[0-9a-fA-F]{24}$/)
      }
    },
    async ({ id }) => {
      const data = await apiRequest<unknown>(`/tasks/${id}/complete`, {
        method: "POST"
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2)
          }
        ]
      };
    }
  );

  server.registerTool(
    "task_torles",
    {
      title: "Task törlése",
      description: "Task törlése azonosító alapján.",
      inputSchema: {
        id: z.string().regex(/^[0-9a-fA-F]{24}$/)
      }
    },
    async ({ id }) => {
      await apiRequest<void>(`/tasks/${id}`, {
        method: "DELETE"
      });

      return {
        content: [
          {
            type: "text",
            text: "A task törlése sikeres."
          }
        ]
      };
    }
  );

  return server;
};

const startStdio = async (): Promise<void> => {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("MCP szerver stdio módban fut.");
};

const startHttp = async (): Promise<void> => {
  const app = createMcpExpressApp({ host: "0.0.0.0" });

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      service: "smart-taskops-mcp-server",
      timestamp: new Date().toISOString()
    });
  });

  app.post("/mcp", async (req: Request, res: Response) => {
    const server = createServer();
    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      res.on("close", () => {
        void transport.close();
        void server.close();
      });
    } catch {
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Belső MCP hiba."
          },
          id: null
        });
      }
    }
  });

  app.listen(MCP_PORT, () => {
    console.log(`MCP szerver HTTP módban fut a ${MCP_PORT} porton.`);
  });
};

const main = async () => {
  if (MCP_TRANSPORT === "stdio") {
    await startStdio();
    return;
  }
  await startHttp();
};

main().catch((error) => {
  console.error("MCP szerver hiba:", error);
  process.exit(1);
});
