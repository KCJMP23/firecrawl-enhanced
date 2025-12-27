// Agent Orchestrator - Main service for managing AI agents
import { Crew } from './core/crew';
import { Agent } from './core/agent';
import { CrewConfig, AgentConfig, Task, Workflow, ExecutionResult } from './types';
import { defaultTools, ToolFactory } from './tools';
import { predefinedAgents, webDevelopmentCrew, researchAndAnalysisCrew, optimizationCrew } from './presets/agents';
import { ModelRouter } from './providers';

export class AgentOrchestrator {
  private crews: Map<string, Crew> = new Map();
  private agents: Map<string, Agent> = new Map();
  private workflows: Map<string, Workflow> = new Map();
  private modelRouter: ModelRouter;

  constructor() {
    this.modelRouter = new ModelRouter();
    this.initializePredefinedAgents();
    this.initializePredefinedCrews();
  }

  private initializePredefinedAgents(): void {
    predefinedAgents.forEach(agentConfig => {
      const agent = new Agent(agentConfig, defaultTools);
      this.agents.set(agentConfig.id, agent);
    });
  }

  private initializePredefinedCrews(): void {
    const predefinedCrews = [webDevelopmentCrew, researchAndAnalysisCrew, optimizationCrew];
    
    predefinedCrews.forEach(crewConfig => {
      const crew = new Crew(crewConfig, defaultTools);
      this.crews.set(crewConfig.id, crew);
    });
  }

  // High-level workflow methods
  async executeWebsiteCloneWorkflow(
    url: string,
    requirements: {
      framework?: 'react' | 'vue' | 'angular' | 'svelte';
      styling?: 'tailwind' | 'css' | 'styled-components';
      features?: string[];
      deployment?: 'vercel' | 'netlify' | 'aws' | 'self-hosted';
    }
  ): Promise<ExecutionResult[]> {
    const workflow: Workflow = {
      id: `clone_${Date.now()}`,
      name: 'Website Clone Workflow',
      description: `Clone website ${url} with specific requirements`,
      tasks: [
        {
          id: 'research_task',
          description: `Analyze the website at ${url} and extract its structure, components, and design patterns`,
          expectedOutput: 'Detailed analysis of website structure, components, and technical implementation',
          agentId: 'researcher',
          priority: 'high',
          context: { url, requirements },
        },
        {
          id: 'planning_task',
          description: `Create a development plan based on the website analysis and requirements`,
          expectedOutput: 'Comprehensive development plan with task breakdown and timeline',
          agentId: 'planner',
          priority: 'critical',
          dependencies: ['research_task'],
        },
        {
          id: 'design_task',
          description: `Create design specifications and component library based on the analyzed website`,
          expectedOutput: 'Design system, component specifications, and visual guidelines',
          agentId: 'designer',
          priority: 'high',
          dependencies: ['research_task'],
        },
        {
          id: 'development_task',
          description: `Implement the website using ${requirements.framework || 'react'} and ${requirements.styling || 'tailwind'}`,
          expectedOutput: 'Complete implementation with all components and functionality',
          agentId: 'developer',
          priority: 'critical',
          dependencies: ['planning_task', 'design_task'],
        },
        {
          id: 'qa_task',
          description: 'Test the implementation for functionality, performance, and accessibility',
          expectedOutput: 'Quality assurance report with test results and recommendations',
          agentId: 'qa_tester',
          priority: 'high',
          dependencies: ['development_task'],
        },
        {
          id: 'optimization_task',
          description: 'Optimize the application for performance, SEO, and cost efficiency',
          expectedOutput: 'Optimized application with performance improvements',
          agentId: 'optimizer',
          priority: 'medium',
          dependencies: ['qa_task'],
        },
      ],
      agents: predefinedAgents.filter(agent => 
        ['researcher', 'planner', 'designer', 'developer', 'qa_tester', 'optimizer'].includes(agent.id)
      ),
      status: 'pending',
      metadata: { url, requirements },
    };

    return await this.executeWorkflow(workflow);
  }

  async executeComponentGenerationWorkflow(
    description: string,
    requirements: {
      framework?: string;
      styling?: string;
      complexity?: 'simple' | 'medium' | 'complex';
      features?: string[];
    }
  ): Promise<ExecutionResult[]> {
    const workflow: Workflow = {
      id: `component_${Date.now()}`,
      name: 'Component Generation Workflow',
      description: `Generate component: ${description}`,
      tasks: [
        {
          id: 'research_component',
          description: `Research best practices and existing patterns for: ${description}`,
          expectedOutput: 'Research findings on component patterns and best practices',
          agentId: 'researcher',
          priority: 'medium',
          context: { description, requirements },
        },
        {
          id: 'design_component',
          description: `Design the component interface and visual specifications`,
          expectedOutput: 'Component design specifications and interface definition',
          agentId: 'designer',
          priority: 'high',
          dependencies: ['research_component'],
        },
        {
          id: 'develop_component',
          description: `Implement the component according to specifications`,
          expectedOutput: 'Fully implemented component with tests and documentation',
          agentId: 'developer',
          priority: 'critical',
          dependencies: ['design_component'],
        },
        {
          id: 'test_component',
          description: `Test the component for functionality and accessibility`,
          expectedOutput: 'Test results and quality assurance report',
          agentId: 'qa_tester',
          priority: 'high',
          dependencies: ['develop_component'],
        },
      ],
      agents: predefinedAgents.filter(agent => 
        ['researcher', 'designer', 'developer', 'qa_tester'].includes(agent.id)
      ),
      status: 'pending',
      metadata: { description, requirements },
    };

    return await this.executeWorkflow(workflow);
  }

  async executeMarketResearchWorkflow(
    topic: string,
    scope: {
      competitors?: string[];
      technologies?: string[];
      marketSegments?: string[];
    }
  ): Promise<ExecutionResult[]> {
    const workflow: Workflow = {
      id: `research_${Date.now()}`,
      name: 'Market Research Workflow',
      description: `Conduct market research on: ${topic}`,
      tasks: [
        {
          id: 'primary_research',
          description: `Conduct primary research on ${topic} including current trends and technologies`,
          expectedOutput: 'Comprehensive research report with key findings',
          agentId: 'researcher',
          priority: 'high',
          context: { topic, scope },
        },
        {
          id: 'competitive_analysis',
          description: `Analyze competitors and market positioning for ${topic}`,
          expectedOutput: 'Competitive analysis with strengths, weaknesses, and opportunities',
          agentId: 'researcher',
          priority: 'high',
          dependencies: ['primary_research'],
        },
        {
          id: 'documentation',
          description: `Create comprehensive documentation of research findings`,
          expectedOutput: 'Professional research documentation and recommendations',
          agentId: 'content_writer',
          priority: 'medium',
          dependencies: ['primary_research', 'competitive_analysis'],
        },
      ],
      agents: predefinedAgents.filter(agent => 
        ['researcher', 'content_writer'].includes(agent.id)
      ),
      status: 'pending',
      metadata: { topic, scope },
    };

    const crew = this.crews.get('research_crew');
    if (!crew) {
      throw new Error('Research crew not found');
    }

    const result = await crew.executeWorkflow(workflow);
    return result.results;
  }

  // Core workflow execution
  async executeWorkflow(workflow: Workflow): Promise<ExecutionResult[]> {
    // Determine best crew for the workflow
    const crew = this.selectOptimalCrew(workflow);
    
    if (!crew) {
      throw new Error('No suitable crew found for workflow');
    }

    const result = await crew.executeWorkflow(workflow);
    
    // Store workflow for future reference
    this.workflows.set(workflow.id, {
      ...workflow,
      status: result.status === 'completed' ? 'completed' : 'failed',
    });

    return result.results;
  }

  private selectOptimalCrew(workflow: Workflow): Crew | null {
    // Simple crew selection logic - could be enhanced with ML
    const requiredRoles = new Set(workflow.agents.map(agent => agent.role));
    
    // Check for web development workflow
    if (requiredRoles.has('developer') && requiredRoles.has('designer')) {
      return this.crews.get('web_dev_crew') || null;
    }
    
    // Check for research workflow
    if (requiredRoles.has('researcher') && requiredRoles.size <= 2) {
      return this.crews.get('research_crew') || null;
    }
    
    // Check for optimization workflow
    if (requiredRoles.has('optimizer') || requiredRoles.has('debugger')) {
      return this.crews.get('optimization_crew') || null;
    }
    
    // Default to web development crew
    return this.crews.get('web_dev_crew') || null;
  }

  // Agent management
  async createCustomAgent(agentConfig: AgentConfig, customTools: any[] = []): Promise<Agent> {
    const tools = [...defaultTools, ...customTools];
    const agent = new Agent(agentConfig, tools);
    this.agents.set(agentConfig.id, agent);
    return agent;
  }

  async createCustomCrew(crewConfig: CrewConfig): Promise<Crew> {
    const crew = new Crew(crewConfig, defaultTools);
    this.crews.set(crewConfig.id, crew);
    return crew;
  }

  // Monitoring and analytics
  async getSystemStats(): Promise<{
    totalAgents: number;
    totalCrews: number;
    totalWorkflows: number;
    completedWorkflows: number;
    totalCost: number;
    averageExecutionTime: number;
  }> {
    const completedWorkflows = Array.from(this.workflows.values())
      .filter(w => w.status === 'completed');

    // Get cost and timing data from crew stats
    const crewStats = await Promise.all(
      Array.from(this.crews.values()).map(crew => crew.getCrewStats())
    );

    const totalCost = 0; // Would track from execution results
    const averageExecutionTime = 0; // Would calculate from execution results

    return {
      totalAgents: this.agents.size,
      totalCrews: this.crews.size,
      totalWorkflows: this.workflows.size,
      completedWorkflows: completedWorkflows.length,
      totalCost,
      averageExecutionTime,
    };
  }

  async getAgentPerformance(agentId: string): Promise<{
    tasksCompleted: number;
    successRate: number;
    averageExecutionTime: number;
    totalCost: number;
    memoryStats: any;
  }> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const memoryStats = agent.getMemoryStats();
    
    // In a real implementation, these would be tracked from execution results
    return {
      tasksCompleted: 0,
      successRate: 0,
      averageExecutionTime: 0,
      totalCost: 0,
      memoryStats,
    };
  }

  // Utility methods
  listAvailableAgents(): AgentConfig[] {
    return Array.from(this.agents.values()).map(agent => agent.config);
  }

  listAvailableCrews(): any[] {
    return Array.from(this.crews.values()).map(crew => crew.config);
  }

  getWorkflowHistory(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  getModelProviders(): string[] {
    return this.modelRouter.listAvailableProviders();
  }
}

// Singleton instance
let orchestratorInstance: AgentOrchestrator | null = null;

export function getAgentOrchestrator(): AgentOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new AgentOrchestrator();
  }
  return orchestratorInstance;
}