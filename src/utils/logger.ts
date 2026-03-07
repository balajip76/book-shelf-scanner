export interface AgentLogEntry {
  timestamp: string;
  agent: string;
  inputSummary: string;
  outcome: string;
}

export function logAgentDecision(entry: Omit<AgentLogEntry, 'timestamp'>): void {
  const logEntry: AgentLogEntry = {
    timestamp: new Date().toISOString(),
    ...entry,
  };
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') return;
  console.info('[agent]', JSON.stringify(logEntry));
}
