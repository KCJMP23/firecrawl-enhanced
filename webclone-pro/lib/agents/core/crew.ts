// Crew Orchestration System
import { CrewConfig, Task, Workflow, ExecutionResult, AgentConfig } from '../types';
import { Agent } from './agent';
import { Tool } from '../types';

export class Crew {
  private config: CrewConfig;
  private agents: Map<string, Agent>;
  private workflows: Map<string, Workflow>;

  constructor(config: CrewConfig, tools: Tool[] = []) {
    this.config = config;
    this.agents = new Map();
    this.workflows = new Map();

    // Initialize agents
    config.agents.forEach(agentConfig => {
      const agent = new Agent(agentConfig, tools);
      this.agents.set(agentConfig.id, agent);
    });
  }

  async executeWorkflow(workflow: Workflow): Promise<{
    status: 'completed' | 'failed' | 'partial';
    results: ExecutionResult[];
    totalCost: number;
    executionTime: number;
  }> {
    const startTime = Date.now();
    const results: ExecutionResult[] = [];
    let totalCost = 0;

    try {
      // Update workflow status
      workflow.status = 'running';
      this.workflows.set(workflow.id, workflow);

      // Execute tasks based on crew process
      switch (this.config.process) {
        case 'sequential':
          await this.executeSequential(workflow, results);
          break;
        case 'hierarchical':
          await this.executeHierarchical(workflow, results);
          break;
        case 'consensus':
          await this.executeConsensus(workflow, results);
          break;
      }

      // Calculate total cost
      totalCost = results.reduce((sum, result) => sum + (result.cost || 0), 0);

      // Determine final status
      const failedTasks = results.filter(r => r.status === 'failure');
      const partialTasks = results.filter(r => r.status === 'partial');
      
      let finalStatus: 'completed' | 'failed' | 'partial';
      if (failedTasks.length === 0) {
        finalStatus = 'completed';
      } else if (failedTasks.length === results.length) {
        finalStatus = 'failed';
      } else {
        finalStatus = 'partial';
      }

      workflow.status = finalStatus === 'completed' ? 'completed' : 'failed';
      
      const executionTime = Date.now() - startTime;

      return {
        status: finalStatus,
        results,
        totalCost,
        executionTime,
      };

    } catch (error) {
      console.error('Workflow execution failed:', error);
      workflow.status = 'failed';
      
      return {
        status: 'failed',
        results,
        totalCost: results.reduce((sum, result) => sum + (result.cost || 0), 0),
        executionTime: Date.now() - startTime,
      };
    }
  }

  private async executeSequential(workflow: Workflow, results: ExecutionResult[]): Promise<void> {
    // Sort tasks by dependencies
    const sortedTasks = this.topologicalSort(workflow.tasks);
    
    for (const task of sortedTasks) {
      const agent = this.agents.get(task.agentId);
      if (!agent) {
        throw new Error(`Agent ${task.agentId} not found`);
      }

      // Add context from previous task results
      const enrichedTask = this.enrichTaskWithContext(task, results);
      
      if (this.config.verbose) {
        console.log(`Executing task ${task.id} with agent ${task.agentId}`);
      }

      const result = await agent.executeTask(enrichedTask);
      results.push(result);

      // Stop execution if critical task fails
      if (result.status === 'failure' && task.priority === 'critical') {
        throw new Error(`Critical task ${task.id} failed: ${result.errors?.join(', ')}`);
      }
    }
  }

  private async executeHierarchical(workflow: Workflow, results: ExecutionResult[]): Promise<void> {
    // Find manager agent (first agent or designated planner)
    const managerAgent = this.findManagerAgent();
    if (!managerAgent) {
      throw new Error('No manager agent found for hierarchical execution');
    }

    // Manager creates execution plan
    const planningTask: Task = {
      id: `planning_${workflow.id}`,
      description: `Create an execution plan for workflow: ${workflow.description}. Available tasks: ${workflow.tasks.map(t => t.description).join(', ')}`,
      expectedOutput: 'Detailed execution plan with task assignments and dependencies',
      agentId: managerAgent.config.id,
      priority: 'critical',
    };

    const planResult = await managerAgent.executeTask(planningTask);
    results.push(planResult);

    if (planResult.status === 'failure') {
      throw new Error('Planning phase failed');
    }

    // Execute plan (simplified - in real implementation, parse plan and execute)
    await this.executeSequential(workflow, results);
  }

  private async executeConsensus(workflow: Workflow, results: ExecutionResult[]): Promise<void> {
    // Execute each task with multiple agents and reach consensus
    for (const task of workflow.tasks) {
      const availableAgents = Array.from(this.agents.values())
        .filter(agent => agent.config.role === 'researcher' || agent.config.role === 'developer');

      if (availableAgents.length < 2) {
        // Fall back to single agent execution
        const agent = this.agents.get(task.agentId);
        if (agent) {
          const result = await agent.executeTask(task);
          results.push(result);
        }
        continue;
      }

      // Execute with multiple agents
      const agentResults = await Promise.all(
        availableAgents.slice(0, 3).map(agent => agent.executeTask(task))
      );

      // Reach consensus (simplified - take best result or aggregate)
      const consensusResult = this.reachConsensus(task, agentResults);
      results.push(consensusResult);
    }
  }

  private topologicalSort(tasks: Task[]): Task[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: Task[] = [];
    const taskMap = new Map(tasks.map(task => [task.id, task]));

    const visit = (taskId: string) => {
      if (visiting.has(taskId)) {
        throw new Error(`Circular dependency detected involving task ${taskId}`);
      }
      if (visited.has(taskId)) {
        return;
      }

      visiting.add(taskId);
      const task = taskMap.get(taskId);
      
      if (task?.dependencies) {
        task.dependencies.forEach(depId => {
          if (taskMap.has(depId)) {
            visit(depId);
          }
        });
      }

      visiting.delete(taskId);
      visited.add(taskId);
      
      if (task) {
        result.push(task);
      }
    };

    tasks.forEach(task => {
      if (!visited.has(task.id)) {
        visit(task.id);
      }
    });

    return result;
  }

  private enrichTaskWithContext(task: Task, previousResults: ExecutionResult[]): Task {
    const relevantResults = previousResults.filter(result => 
      task.dependencies?.includes(result.taskId) || 
      result.status === 'success'
    );

    if (relevantResults.length === 0) {
      return task;
    }

    const contextData: Record<string, any> = {};
    relevantResults.forEach(result => {
      contextData[`task_${result.taskId}_output`] = result.output;
    });

    return {
      ...task,
      context: {
        ...task.context,
        ...contextData,
      },
    };
  }

  private findManagerAgent(): Agent | null {
    // Look for planner role first, then any agent
    for (const agent of this.agents.values()) {
      if (agent.config.role === 'planner') {
        return agent;
      }
    }
    return this.agents.values().next().value || null;
  }

  private reachConsensus(task: Task, results: ExecutionResult[]): ExecutionResult {
    // Simple consensus: pick result with highest confidence (or first successful one)
    const successfulResults = results.filter(r => r.status === 'success');
    
    if (successfulResults.length === 0) {
      return results[0]; // Return first result even if failed
    }

    // For now, return the first successful result
    // Could be enhanced with more sophisticated consensus mechanisms
    return successfulResults[0];
  }

  // Crew management methods
  addAgent(agentConfig: AgentConfig, tools: Tool[] = []): void {
    const agent = new Agent(agentConfig, tools);
    this.agents.set(agentConfig.id, agent);
    this.config.agents.push(agentConfig);
  }

  removeAgent(agentId: string): void {
    this.agents.delete(agentId);
    this.config.agents = this.config.agents.filter(a => a.id !== agentId);
  }

  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  listAgents(): AgentConfig[] {
    return Array.from(this.agents.values()).map(agent => agent.config);
  }

  async getCrewStats(): Promise<{
    totalAgents: number;
    averageMemoryUsage: number;
    totalWorkflows: number;
    completedWorkflows: number;
  }> {
    const totalAgents = this.agents.size;
    const memoryStats = await Promise.all(
      Array.from(this.agents.values()).map(agent => agent.getMemoryStats())
    );
    
    const averageMemoryUsage = memoryStats.reduce((sum, stats) => 
      sum + stats.shortTermEntries + stats.longTermEntries, 0
    ) / Math.max(1, memoryStats.length);

    const totalWorkflows = this.workflows.size;
    const completedWorkflows = Array.from(this.workflows.values())
      .filter(w => w.status === 'completed').length;

    return {
      totalAgents,
      averageMemoryUsage,
      totalWorkflows,
      completedWorkflows,
    };
  }
}