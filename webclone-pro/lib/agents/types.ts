// AI Agent System Types and Interfaces
import { z } from 'zod';

// Base Agent Configuration
export const AgentConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  backstory: z.string(),
  goal: z.string(),
  tools: z.array(z.string()),
  modelProvider: z.enum(['openai', 'anthropic', 'google', 'local']),
  modelName: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().optional(),
  memoryEnabled: z.boolean().default(true),
});

export type AgentConfig = z.infer<typeof AgentConfigSchema>;

// Task Definition
export const TaskSchema = z.object({
  id: z.string(),
  description: z.string(),
  expectedOutput: z.string(),
  agentId: z.string(),
  context: z.record(z.any()).optional(),
  dependencies: z.array(z.string()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  deadline: z.date().optional(),
});

export type Task = z.infer<typeof TaskSchema>;

// Workflow Definition
export const WorkflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  tasks: z.array(TaskSchema),
  agents: z.array(AgentConfigSchema),
  status: z.enum(['pending', 'running', 'completed', 'failed']).default('pending'),
  metadata: z.record(z.any()).optional(),
});

export type Workflow = z.infer<typeof WorkflowSchema>;

// Agent Execution Result
export const ExecutionResultSchema = z.object({
  taskId: z.string(),
  agentId: z.string(),
  status: z.enum(['success', 'failure', 'partial']),
  output: z.any(),
  artifacts: z.array(z.object({
    type: z.string(),
    content: z.any(),
    metadata: z.record(z.any()).optional(),
  })).optional(),
  errors: z.array(z.string()).optional(),
  executionTime: z.number(),
  tokensUsed: z.number().optional(),
  cost: z.number().optional(),
});

export type ExecutionResult = z.infer<typeof ExecutionResultSchema>;

// Crew (Team of Agents) Configuration
export const CrewConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  agents: z.array(AgentConfigSchema),
  process: z.enum(['sequential', 'hierarchical', 'consensus']).default('sequential'),
  verbose: z.boolean().default(false),
  memoryEnabled: z.boolean().default(true),
  maxExecution: z.number().default(5),
});

export type CrewConfig = z.infer<typeof CrewConfigSchema>;

// Predefined Agent Roles
export enum AgentRole {
  PLANNER = 'planner',
  RESEARCHER = 'researcher', 
  DEVELOPER = 'developer',
  DESIGNER = 'designer',
  QA_TESTER = 'qa_tester',
  CONTENT_WRITER = 'content_writer',
  OPTIMIZER = 'optimizer',
  DEBUGGER = 'debugger'
}

// Tool Definitions
export interface Tool {
  name: string;
  description: string;
  parameters: z.ZodSchema;
  execute: (params: any) => Promise<any>;
}

// Agent Memory Interface
export interface AgentMemory {
  shortTerm: Map<string, any>;
  longTerm: Array<{
    timestamp: Date;
    context: string;
    data: any;
  }>;
  entityMemory: Map<string, {
    properties: Record<string, any>;
    lastUpdated: Date;
  }>;
}

// Model Provider Interface
export interface ModelProvider {
  name: string;
  generateResponse(prompt: string, config: any): Promise<string>;
  calculateCost(tokens: number): number;
  getMaxTokens(): number;
}