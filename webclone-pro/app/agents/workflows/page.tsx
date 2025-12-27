import React from 'react';
import WorkflowBuilder from '@/components/agents/WorkflowBuilder';

export const metadata = {
  title: 'Workflow Builder - WebClone Pro',
  description: 'Create and customize AI agent workflows',
};

export default function WorkflowsPage() {
  return (
    <div className="container mx-auto py-6">
      <WorkflowBuilder />
    </div>
  );
}