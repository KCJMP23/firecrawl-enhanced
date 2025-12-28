// Agent Execution API Endpoint
import { NextRequest, NextResponse } from 'next/server';
import { getAgentOrchestrator } from '@/lib/agents/orchestrator';
import { z } from 'zod';

const ExecuteWorkflowSchema = z.object({
  type: z.enum(['website_clone', 'component_generation', 'market_research', 'custom']),
  parameters: z.object({
    url: z.string().optional(),
    description: z.string().optional(),
    topic: z.string().optional(),
    requirements: z.record(z.string(), z.any()).optional(),
    scope: z.record(z.string(), z.any()).optional(),
    workflow: z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      tasks: z.array(z.any()),
      agents: z.array(z.any()),
    }).optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, parameters } = ExecuteWorkflowSchema.parse(body);

    const orchestrator = getAgentOrchestrator();
    let results;

    switch (type) {
      case 'website_clone':
        if (!parameters.url) {
          return NextResponse.json(
            { error: 'URL is required for website clone workflow' },
            { status: 400 }
          );
        }
        results = await orchestrator.executeWebsiteCloneWorkflow(
          parameters.url,
          parameters.requirements || {}
        );
        break;

      case 'component_generation':
        if (!parameters.description) {
          return NextResponse.json(
            { error: 'Description is required for component generation workflow' },
            { status: 400 }
          );
        }
        results = await orchestrator.executeComponentGenerationWorkflow(
          parameters.description,
          parameters.requirements || {}
        );
        break;

      case 'market_research':
        if (!parameters.topic) {
          return NextResponse.json(
            { error: 'Topic is required for market research workflow' },
            { status: 400 }
          );
        }
        results = await orchestrator.executeMarketResearchWorkflow(
          parameters.topic,
          parameters.scope || {}
        );
        break;

      case 'custom':
        if (!parameters.workflow) {
          return NextResponse.json(
            { error: 'Workflow definition is required for custom workflow' },
            { status: 400 }
          );
        }
        results = await orchestrator.executeWorkflow({
          ...parameters.workflow,
          status: 'pending' as const
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid workflow type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      workflowType: type,
      results: results.map(result => ({
        taskId: result.taskId,
        agentId: result.agentId,
        status: result.status,
        output: result.output,
        executionTime: result.executionTime,
        tokensUsed: result.tokensUsed,
        cost: result.cost,
        errors: result.errors,
      })),
      totalCost: results.reduce((sum, r) => sum + (r.cost || 0), 0),
      totalExecutionTime: results.reduce((sum, r) => sum + r.executionTime, 0),
    });

  } catch (error) {
    console.error('Agent execution error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const orchestrator = getAgentOrchestrator();

    switch (action) {
      case 'stats':
        const stats = await orchestrator.getSystemStats();
        return NextResponse.json(stats);

      case 'agents':
        const agents = orchestrator.listAvailableAgents();
        return NextResponse.json(agents);

      case 'crews':
        const crews = orchestrator.listAvailableCrews();
        return NextResponse.json(crews);

      case 'workflows':
        const workflows = orchestrator.getWorkflowHistory();
        return NextResponse.json(workflows);

      case 'providers':
        const providers = orchestrator.getModelProviders();
        return NextResponse.json(providers);

      default:
        return NextResponse.json(
          { error: 'Invalid action. Available actions: stats, agents, crews, workflows, providers' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Agent API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}