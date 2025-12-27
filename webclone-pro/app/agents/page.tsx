import React from 'react';
import AgentDashboard from '@/components/agents/AgentDashboard';

export const metadata = {
  title: 'AI Agents - WebClone Pro',
  description: 'Manage and monitor your autonomous AI agents and workflows',
};

export default function AgentsPage() {
  return (
    <div className="container mx-auto py-6">
      <AgentDashboard />
    </div>
  );
}