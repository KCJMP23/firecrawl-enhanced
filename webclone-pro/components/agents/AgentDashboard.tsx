'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Users, 
  Workflow, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Play, 
  Square, 
  Eye,
  Settings,
  Activity
} from 'lucide-react';

interface AgentStats {
  totalAgents: number;
  totalCrews: number;
  totalWorkflows: number;
  completedWorkflows: number;
  totalCost: number;
  averageExecutionTime: number;
}

interface AgentConfig {
  id: string;
  name: string;
  role: string;
  backstory: string;
  goal: string;
  tools: string[];
  modelProvider: string;
  temperature: number;
  memoryEnabled: boolean;
}

interface WorkflowExecution {
  id: string;
  type: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  startTime: number;
  results?: any[];
}

export default function AgentDashboard() {
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Workflow creation state
  const [workflowType, setWorkflowType] = useState<string>('website_clone');
  const [workflowParams, setWorkflowParams] = useState<any>({});
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchAgents();
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchStats();
      if (executions.some(e => e.status === 'running')) {
        // Poll more frequently if there are running executions
        fetchExecutions();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [executions]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/agents/execute?action=stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents/execute?action=agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const fetchExecutions = async () => {
    try {
      const response = await fetch('/api/agents/execute?action=workflows');
      if (response.ok) {
        const data = await response.json();
        setExecutions(data.slice(-10)); // Show last 10 executions
      }
    } catch (error) {
      console.error('Error fetching executions:', error);
    }
  };

  const executeWorkflow = async () => {
    setIsExecuting(true);
    setError(null);

    try {
      const response = await fetch('/api/agents/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: workflowType,
          parameters: workflowParams,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Add to executions list
        const newExecution: WorkflowExecution = {
          id: `exec_${Date.now()}`,
          type: workflowType,
          status: 'completed',
          progress: 100,
          startTime: Date.now(),
          results: result.results,
        };
        setExecutions(prev => [newExecution, ...prev.slice(0, 9)]);
        
        // Reset form
        setWorkflowParams({});
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Execution failed');
      }
    } catch (error) {
      setError('Network error occurred');
      console.error('Execution error:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Brain className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading agent dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Agent Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and monitor your autonomous AI agents and workflows
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Play className="w-4 h-4 mr-2" />
              New Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Execute AI Workflow</DialogTitle>
              <DialogDescription>
                Choose a workflow type and configure parameters
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workflow-type">Workflow Type</Label>
                <Select value={workflowType} onValueChange={setWorkflowType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select workflow type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website_clone">Website Clone</SelectItem>
                    <SelectItem value="component_generation">Component Generation</SelectItem>
                    <SelectItem value="market_research">Market Research</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {workflowType === 'website_clone' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="url">Website URL</Label>
                    <Input
                      id="url"
                      placeholder="https://example.com"
                      value={workflowParams.url || ''}
                      onChange={(e) => setWorkflowParams((prev: any) => ({ ...prev, url: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="framework">Framework</Label>
                      <Select 
                        value={workflowParams.requirements?.framework || 'react'}
                        onValueChange={(value) => setWorkflowParams((prev: any) => ({
                          ...prev,
                          requirements: { ...prev.requirements, framework: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="react">React</SelectItem>
                          <SelectItem value="vue">Vue</SelectItem>
                          <SelectItem value="angular">Angular</SelectItem>
                          <SelectItem value="svelte">Svelte</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="styling">Styling</Label>
                      <Select 
                        value={workflowParams.requirements?.styling || 'tailwind'}
                        onValueChange={(value) => setWorkflowParams((prev: any) => ({
                          ...prev,
                          requirements: { ...prev.requirements, styling: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tailwind">Tailwind CSS</SelectItem>
                          <SelectItem value="css">CSS</SelectItem>
                          <SelectItem value="styled-components">Styled Components</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {workflowType === 'component_generation' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="description">Component Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the component you want to generate..."
                      value={workflowParams.description || ''}
                      onChange={(e) => setWorkflowParams((prev: any) => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {workflowType === 'market_research' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Research Topic</Label>
                    <Input
                      id="topic"
                      placeholder="Enter research topic..."
                      value={workflowParams.topic || ''}
                      onChange={(e) => setWorkflowParams((prev: any) => ({ ...prev, topic: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {error && (
                <Alert>
                  <AlertDescription className="text-red-600">{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button 
                onClick={executeWorkflow} 
                disabled={isExecuting}
                className="w-full"
              >
                {isExecuting ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Execute Workflow
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAgents}</div>
              <p className="text-xs text-muted-foreground">
                Across {stats.totalCrews} crews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workflows</CardTitle>
              <Workflow className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedWorkflows}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalWorkflows} total executed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.averageExecutionTime / 1000)}s</div>
              <p className="text-xs text-muted-foreground">
                Per workflow
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="executions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="executions">Recent Executions</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="executions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Workflow Executions</CardTitle>
              <CardDescription>
                Monitor the status and results of your AI workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              {executions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No workflow executions yet. Start by creating a new workflow above.
                </div>
              ) : (
                <div className="space-y-3">
                  {executions.map((execution) => (
                    <div key={execution.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            execution.status === 'completed' ? 'default' : 
                            execution.status === 'failed' ? 'destructive' : 
                            'secondary'
                          }>
                            {execution.status}
                          </Badge>
                          <span className="font-medium capitalize">
                            {execution.type.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(execution.startTime).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      {execution.status === 'running' && (
                        <Progress value={execution.progress} className="mb-2" />
                      )}
                      
                      {execution.results && (
                        <div className="text-sm text-muted-foreground">
                          {execution.results.length} tasks completed
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <Card key={agent.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  <CardDescription>
                    <Badge variant="outline">{agent.role}</Badge>
                    <span className="ml-2 text-sm">{agent.modelProvider}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {agent.goal.length > 100 ? `${agent.goal.substring(0, 100)}...` : agent.goal}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-1">
                      {agent.tools.slice(0, 3).map((tool) => (
                        <Badge key={tool} variant="secondary" className="text-xs">
                          {tool.replace('_', ' ')}
                        </Badge>
                      ))}
                      {agent.tools.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{agent.tools.length - 3}
                        </Badge>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>Real-time metrics and health status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">CPU Usage</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <Progress value={45} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Memory Usage</span>
                    <span className="text-sm font-medium">62%</span>
                  </div>
                  <Progress value={62} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Vector DB Load</span>
                    <span className="text-sm font-medium">28%</span>
                  </div>
                  <Progress value={28} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agent Activity</CardTitle>
                <CardDescription>Current agent workload and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {agents.slice(0, 4).map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-3 h-3 text-green-500" />
                        <span className="text-sm">{agent.name}</span>
                      </div>
                      <Badge variant="secondary">Idle</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}