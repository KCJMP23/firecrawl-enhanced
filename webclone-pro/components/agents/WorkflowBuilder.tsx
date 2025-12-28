'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Trash2, 
  ArrowDown, 
  ArrowRight, 
  Play, 
  Save, 
  Settings,
  Users,
  Clock,
  Target,
  Workflow
} from 'lucide-react';

interface Task {
  id: string;
  description: string;
  expectedOutput: string;
  agentId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[];
  context?: Record<string, any>;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  backstory: string;
  goal: string;
  tools: string[];
  modelProvider: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  agents: Agent[];
}

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'website_analysis',
    name: 'Website Analysis & Clone',
    description: 'Comprehensive website analysis and recreation workflow',
    tasks: [
      {
        id: 'research',
        description: 'Analyze target website structure, components, and technologies',
        expectedOutput: 'Detailed technical analysis with component breakdown',
        agentId: 'researcher',
        priority: 'high',
        dependencies: [],
      },
      {
        id: 'design',
        description: 'Extract design patterns and create component specifications',
        expectedOutput: 'Design system and component library specifications',
        agentId: 'designer',
        priority: 'high',
        dependencies: ['research'],
      },
      {
        id: 'development',
        description: 'Implement components and application structure',
        expectedOutput: 'Complete application implementation',
        agentId: 'developer',
        priority: 'critical',
        dependencies: ['research', 'design'],
      },
      {
        id: 'testing',
        description: 'Test implementation for functionality and performance',
        expectedOutput: 'Quality assurance report and test results',
        agentId: 'qa_tester',
        priority: 'high',
        dependencies: ['development'],
      },
    ],
    agents: [],
  },
  {
    id: 'component_library',
    name: 'Component Library Creation',
    description: 'Build a comprehensive component library from scratch',
    tasks: [
      {
        id: 'planning',
        description: 'Plan component library structure and requirements',
        expectedOutput: 'Component library architecture and roadmap',
        agentId: 'planner',
        priority: 'critical',
        dependencies: [],
      },
      {
        id: 'design_system',
        description: 'Create design system with tokens and guidelines',
        expectedOutput: 'Complete design system documentation',
        agentId: 'designer',
        priority: 'high',
        dependencies: ['planning'],
      },
      {
        id: 'base_components',
        description: 'Implement base components (Button, Input, etc.)',
        expectedOutput: 'Core component implementations',
        agentId: 'developer',
        priority: 'high',
        dependencies: ['design_system'],
      },
      {
        id: 'complex_components',
        description: 'Implement complex components (DataTable, Forms, etc.)',
        expectedOutput: 'Advanced component implementations',
        agentId: 'developer',
        priority: 'medium',
        dependencies: ['base_components'],
      },
      {
        id: 'documentation',
        description: 'Create comprehensive documentation and examples',
        expectedOutput: 'Complete component documentation',
        agentId: 'content_writer',
        priority: 'medium',
        dependencies: ['base_components', 'complex_components'],
      },
    ],
    agents: [],
  },
];

export default function WorkflowBuilder() {
  const [workflow, setWorkflow] = useState<WorkflowTemplate | null>(null);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const createNewWorkflow = () => {
    const newWorkflow: WorkflowTemplate = {
      id: `custom_${Date.now()}`,
      name: 'Custom Workflow',
      description: 'Custom workflow description',
      tasks: [],
      agents: [],
    };
    setWorkflow(newWorkflow);
  };

  const loadTemplate = (templateId: string) => {
    const template = WORKFLOW_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setWorkflow({ ...template, id: `${template.id}_${Date.now()}` });
    }
  };

  const addTask = () => {
    if (!workflow) return;

    const newTask: Task = {
      id: `task_${Date.now()}`,
      description: '',
      expectedOutput: '',
      agentId: '',
      priority: 'medium',
      dependencies: [],
    };

    setSelectedTask(newTask);
    setIsTaskDialogOpen(true);
  };

  const editTask = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDialogOpen(true);
  };

  const saveTask = (task: Task) => {
    if (!workflow) return;

    const updatedTasks = selectedTask?.id && workflow.tasks.find(t => t.id === selectedTask.id)
      ? workflow.tasks.map(t => t.id === task.id ? task : t)
      : [...workflow.tasks, task];

    setWorkflow({
      ...workflow,
      tasks: updatedTasks,
    });
    setIsTaskDialogOpen(false);
    setSelectedTask(null);
  };

  const deleteTask = (taskId: string) => {
    if (!workflow) return;

    setWorkflow({
      ...workflow,
      tasks: workflow.tasks.filter(t => t.id !== taskId),
    });
  };

  const executeWorkflow = async () => {
    if (!workflow) return;

    setIsExecuting(true);
    try {
      const response = await fetch('/api/agents/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'custom',
          parameters: {
            workflow: {
              id: workflow.id,
              name: workflow.name,
              description: workflow.description,
              tasks: workflow.tasks,
              agents: workflow.agents,
            },
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Workflow executed successfully:', result);
        // Handle success
      } else {
        console.error('Workflow execution failed');
      }
    } catch (error) {
      console.error('Error executing workflow:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const getTaskDependencies = (taskId: string): Task[] => {
    if (!workflow) return [];
    return workflow.tasks.filter(task => task.dependencies.includes(taskId));
  };

  const renderWorkflowGraph = () => {
    if (!workflow || workflow.tasks.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No tasks in this workflow. Add some tasks to get started.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {workflow.tasks.map((task, index) => (
          <div key={task.id} className="relative">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => editTask(task)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={PRIORITY_COLORS[task.priority]}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline">{task.agentId || 'No agent'}</Badge>
                    </div>
                    <h4 className="font-medium mb-1">
                      {task.description || 'Untitled Task'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {task.expectedOutput || 'No expected output defined'}
                    </p>
                    {task.dependencies.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-muted-foreground">
                          Depends on: {task.dependencies.length} task(s)
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        editTask(task);
                      }}
                    >
                      <Settings className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(task.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {index < workflow.tasks.length - 1 && (
              <div className="flex justify-center py-2">
                <ArrowDown className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflow Builder</h2>
          <p className="text-muted-foreground">
            Create and customize AI agent workflows
          </p>
        </div>
        <div className="flex space-x-2">
          {workflow && (
            <>
              <Button variant="outline" onClick={() => setWorkflow(null)}>
                New Workflow
              </Button>
              <Button onClick={executeWorkflow} disabled={isExecuting || !workflow.tasks.length}>
                {isExecuting ? 'Executing...' : 'Execute Workflow'}
                <Play className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}
        </div>
      </div>

      {!workflow ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Choose how you want to create your workflow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={createNewWorkflow} className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Create Custom Workflow
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <CardDescription>
                Start with a pre-built workflow template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {WORKFLOW_TEMPLATES.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Workflow className="w-3 h-3" />
                            <span>{template.tasks.length} tasks</span>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => loadTemplate(template.id)}>
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      <Input
                        value={workflow.name}
                        onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
                        className="text-xl font-bold border-none p-0 h-auto"
                        placeholder="Workflow Name"
                      />
                    </CardTitle>
                    <Textarea
                      value={workflow.description}
                      onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
                      className="text-muted-foreground border-none p-0 resize-none"
                      placeholder="Workflow description..."
                      rows={2}
                    />
                  </div>
                  <Button onClick={addTask}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {renderWorkflowGraph()}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Workflow Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Tasks</span>
                  <Badge variant="secondary">{workflow.tasks.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Assigned Agents</span>
                  <Badge variant="secondary">
                    {new Set(workflow.tasks.map(t => t.agentId).filter(Boolean)).size}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Critical Tasks</span>
                  <Badge variant="secondary">
                    {workflow.tasks.filter(t => t.priority === 'critical').length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Priorities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {['critical', 'high', 'medium', 'low'].map((priority) => {
                  const count = workflow.tasks.filter(t => t.priority === priority).length;
                  return (
                    <div key={priority} className="flex items-center justify-between">
                      <Badge className={PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS]}>
                        {priority}
                      </Badge>
                      <span className="text-sm">{count}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTask?.id && workflow?.tasks.find(t => t.id === selectedTask.id) ? 'Edit Task' : 'Add Task'}
            </DialogTitle>
            <DialogDescription>
              Configure the task details and requirements
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <TaskForm
              task={selectedTask}
              workflow={workflow}
              onSave={saveTask}
              onCancel={() => setIsTaskDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TaskFormProps {
  task: Task;
  workflow: WorkflowTemplate | null;
  onSave: (task: Task) => void;
  onCancel: () => void;
}

function TaskForm({ task, workflow, onSave, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState<Task>(task);

  const availableDependencies = workflow?.tasks.filter(t => t.id !== formData.id) || [];
  const availableAgents = ['planner', 'researcher', 'developer', 'designer', 'qa_tester', 'content_writer', 'optimizer'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Task Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what this task should accomplish..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expectedOutput">Expected Output</Label>
        <Textarea
          id="expectedOutput"
          value={formData.expectedOutput}
          onChange={(e) => setFormData({ ...formData, expectedOutput: e.target.value })}
          placeholder="Describe the expected outcome or deliverable..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="agentId">Assigned Agent</Label>
          <Select value={formData.agentId} onValueChange={(value) => setFormData({ ...formData, agentId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select agent" />
            </SelectTrigger>
            <SelectContent>
              {availableAgents.map((agent) => (
                <SelectItem key={agent} value={agent}>
                  {agent.charAt(0).toUpperCase() + agent.slice(1).replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {availableDependencies.length > 0 && (
        <div className="space-y-2">
          <Label>Dependencies</Label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {availableDependencies.map((dep) => (
              <div key={dep.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`dep-${dep.id}`}
                  checked={formData.dependencies.includes(dep.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({ ...formData, dependencies: [...formData.dependencies, dep.id] });
                    } else {
                      setFormData({ ...formData, dependencies: formData.dependencies.filter(id => id !== dep.id) });
                    }
                  }}
                />
                <Label htmlFor={`dep-${dep.id}`} className="text-sm">
                  {dep.description || 'Untitled Task'}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          Save Task
        </Button>
      </DialogFooter>
    </form>
  );
}