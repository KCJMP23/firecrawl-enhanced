// Core Agent Implementation
import { AgentConfig, AgentMemory, Task, ExecutionResult, Tool } from '../types';
import { ModelProvider, ModelRouter } from '../providers';
import { z } from 'zod';

export class Agent {
  private config: AgentConfig;
  private memory: AgentMemory;
  private tools: Map<string, Tool>;
  private modelRouter: ModelRouter;

  constructor(config: AgentConfig, tools: Tool[] = []) {
    this.config = config;
    this.modelRouter = new ModelRouter();
    this.tools = new Map(tools.map(tool => [tool.name, tool]));
    this.memory = {
      shortTerm: new Map(),
      longTerm: [],
      entityMemory: new Map(),
    };
  }

  getId(): string {
    return this.config.id;
  }

  getRole(): string {
    return this.config.role;
  }

  getConfig(): AgentConfig {
    return this.config;
  }

  async executeTask(task: Task): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Build context from memory and task
      const context = this.buildTaskContext(task);
      
      // Generate execution plan
      const plan = await this.generateExecutionPlan(task, context);
      
      // Execute the plan step by step
      const result = await this.executePlan(plan, task);
      
      // Update memory with results
      if (this.config.memoryEnabled) {
        this.updateMemory(task, result, context);
      }

      const executionTime = Date.now() - startTime;

      return {
        taskId: task.id,
        agentId: this.config.id,
        status: 'success',
        output: result.output,
        artifacts: result.artifacts,
        executionTime,
        tokensUsed: result.tokensUsed,
        cost: result.cost,
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`Agent ${this.config.id} failed to execute task ${task.id}:`, error);

      return {
        taskId: task.id,
        agentId: this.config.id,
        status: 'failure',
        output: null,
        errors: [error instanceof Error ? error.message : String(error)],
        executionTime,
      };
    }
  }

  private buildTaskContext(task: Task): string {
    let context = `Agent Role: ${this.config.role}\n`;
    context += `Goal: ${this.config.goal}\n`;
    context += `Backstory: ${this.config.backstory}\n\n`;
    
    context += `Task: ${task.description}\n`;
    context += `Expected Output: ${task.expectedOutput}\n\n`;

    // Add relevant memory context
    if (this.config.memoryEnabled) {
      const recentMemories = this.getRelevantMemories(task.description);
      if (recentMemories.length > 0) {
        context += `Relevant Previous Experience:\n`;
        recentMemories.forEach(memory => {
          context += `- ${memory.context}: ${JSON.stringify(memory.data)}\n`;
        });
        context += '\n';
      }
    }

    // Add available tools
    if (this.tools.size > 0) {
      context += `Available Tools:\n`;
      Array.from(this.tools.values()).forEach(tool => {
        context += `- ${tool.name}: ${tool.description}\n`;
      });
      context += '\n';
    }

    // Add task-specific context
    if (task.context) {
      context += `Additional Context:\n`;
      Object.entries(task.context).forEach(([key, value]) => {
        context += `- ${key}: ${JSON.stringify(value)}\n`;
      });
    }

    return context;
  }

  private async generateExecutionPlan(task: Task, context: string): Promise<any> {
    const prompt = `${context}

Based on the above information, create a detailed step-by-step execution plan for this task. 
Consider:
1. What tools need to be used and in what order
2. What information needs to be gathered
3. What outputs need to be generated
4. Any potential challenges or edge cases

Respond with a JSON object containing an execution plan with steps array.
Each step should have: action, tool (if applicable), parameters, and expected_outcome.

Example format:
{
  "steps": [
    {
      "action": "gather_requirements",
      "tool": "web_search",
      "parameters": {...},
      "expected_outcome": "List of requirements"
    }
  ]
}`;

    const { provider, estimatedCost } = this.modelRouter.selectOptimalModel(prompt, {
      preferredProvider: this.config.modelProvider,
      complexity: 'medium'
    });

    const response = await provider.generateResponse(prompt, {
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
    });

    try {
      return JSON.parse(response);
    } catch (error) {
      // Fallback to simple execution plan
      return {
        steps: [{
          action: 'execute_task',
          tool: null,
          parameters: {},
          expected_outcome: task.expectedOutput
        }]
      };
    }
  }

  private async executePlan(plan: any, task: Task): Promise<any> {
    let totalTokensUsed = 0;
    let totalCost = 0;
    let outputs: any[] = [];
    let artifacts: any[] = [];

    for (const step of plan.steps) {
      try {
        let stepResult;

        if (step.tool && this.tools.has(step.tool)) {
          // Execute using tool
          const tool = this.tools.get(step.tool)!;
          stepResult = await tool.execute(step.parameters);
        } else {
          // Execute using AI generation
          const prompt = this.buildStepPrompt(step, task, outputs);
          const { provider, estimatedCost } = this.modelRouter.selectOptimalModel(prompt, {
            preferredProvider: this.config.modelProvider,
            complexity: 'medium'
          });

          stepResult = await provider.generateResponse(prompt, {
            temperature: this.config.temperature,
            maxTokens: this.config.maxTokens,
          });

          totalTokensUsed += this.modelRouter['estimateTokens'](prompt + stepResult);
          totalCost += estimatedCost;
        }

        outputs.push({
          step: step.action,
          result: stepResult
        });

        // Store step result in short-term memory
        this.memory.shortTerm.set(`step_${step.action}`, stepResult);

      } catch (error) {
        console.error(`Step ${step.action} failed:`, error);
        outputs.push({
          step: step.action,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // Synthesize final output
    const finalOutput = await this.synthesizeFinalOutput(task, outputs);

    return {
      output: finalOutput,
      artifacts,
      tokensUsed: totalTokensUsed,
      cost: totalCost,
    };
  }

  private buildStepPrompt(step: any, task: Task, previousOutputs: any[]): string {
    let prompt = `You are a ${this.config.role} working on: ${task.description}\n\n`;
    
    prompt += `Current Step: ${step.action}\n`;
    prompt += `Expected Outcome: ${step.expected_outcome}\n\n`;

    if (previousOutputs.length > 0) {
      prompt += `Previous Step Results:\n`;
      previousOutputs.forEach((output, index) => {
        prompt += `${index + 1}. ${output.step}: ${JSON.stringify(output.result)}\n`;
      });
      prompt += '\n';
    }

    prompt += `Please execute this step and provide the expected outcome. Be specific and actionable in your response.`;

    return prompt;
  }

  private async synthesizeFinalOutput(task: Task, outputs: any[]): Promise<any> {
    const prompt = `Task: ${task.description}
Expected Output: ${task.expectedOutput}

Step Results:
${outputs.map((output, i) => `${i + 1}. ${output.step}: ${JSON.stringify(output.result)}`).join('\n')}

Based on the above step results, provide the final synthesized output that meets the expected output requirements. 
Be concise but comprehensive.`;

    const { provider } = this.modelRouter.selectOptimalModel(prompt, {
      preferredProvider: this.config.modelProvider,
      complexity: 'high'
    });

    return await provider.generateResponse(prompt, {
      temperature: this.config.temperature * 0.8, // Lower temperature for final synthesis
      maxTokens: this.config.maxTokens,
    });
  }

  private updateMemory(task: Task, result: any, context: string): void {
    // Update long-term memory
    this.memory.longTerm.push({
      timestamp: new Date(),
      context: `Task: ${task.description}`,
      data: {
        taskId: task.id,
        output: result.output,
        success: !result.errors,
      }
    });

    // Limit long-term memory size
    if (this.memory.longTerm.length > 100) {
      this.memory.longTerm = this.memory.longTerm.slice(-50);
    }

    // Extract and update entity memory
    this.updateEntityMemory(task.description + ' ' + JSON.stringify(result.output));
  }

  private updateEntityMemory(text: string): void {
    // Simple entity extraction (could be enhanced with NLP)
    const entities = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    
    entities.forEach(entity => {
      if (!this.memory.entityMemory.has(entity)) {
        this.memory.entityMemory.set(entity, {
          properties: { mentions: 1 },
          lastUpdated: new Date(),
        });
      } else {
        const existing = this.memory.entityMemory.get(entity)!;
        existing.properties.mentions = (existing.properties.mentions || 0) + 1;
        existing.lastUpdated = new Date();
      }
    });
  }

  private getRelevantMemories(query: string, limit: number = 5): Array<{
    timestamp: Date;
    context: string;
    data: any;
  }> {
    return this.memory.longTerm
      .filter(memory => 
        memory.context.toLowerCase().includes(query.toLowerCase()) ||
        JSON.stringify(memory.data).toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Public methods for agent management
  addTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  removeTool(toolName: string): void {
    this.tools.delete(toolName);
  }

  getMemoryStats(): {
    shortTermEntries: number;
    longTermEntries: number;
    entityEntries: number;
  } {
    return {
      shortTermEntries: this.memory.shortTerm.size,
      longTermEntries: this.memory.longTerm.length,
      entityEntries: this.memory.entityMemory.size,
    };
  }

  clearMemory(): void {
    this.memory.shortTerm.clear();
    this.memory.longTerm = [];
    this.memory.entityMemory.clear();
  }
}