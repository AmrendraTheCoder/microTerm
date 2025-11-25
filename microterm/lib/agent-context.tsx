'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAccount } from 'wagmi';

export interface AgentDirective {
  id: string;
  rule: string;
  filter: {
    type?: 'deal' | 'alert' | 'news';
    minAmount?: number;
    sector?: string;
    keyword?: string;
  };
  action: 'auto_unlock' | 'notify' | 'copy_trade';
  maxCostPerAction: number;
  isActive: boolean;
  createdAt: Date;
}

export interface AgentAction {
  id: string;
  type: 'unlock' | 'swap' | 'summary' | 'notify';
  itemType?: string;
  itemId?: string;
  cost: number;
  success: boolean;
  message: string;
  timestamp: Date;
}

interface AgentContextType {
  // State
  balance: number;
  directives: AgentDirective[];
  actions: AgentAction[];
  isExecuting: boolean;
  
  // Methods
  setBalance: (balance: number) => void;
  addDirective: (directive: Omit<AgentDirective, 'id' | 'createdAt'>) => void;
  removeDirective: (id: string) => void;
  toggleDirective: (id: string) => void;
  executeCommand: (command: string) => Promise<{ success: boolean; message: string }>;
  logAction: (action: Omit<AgentAction, 'id' | 'timestamp'>) => void;
  clearActions: () => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
  const { address } = useAccount();
  const [balance, setBalance] = useState(10); // Default $10 USDC for agent
  const [directives, setDirectives] = useState<AgentDirective[]>([]);
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  // Load state from localStorage on mount
  React.useEffect(() => {
    const savedBalance = localStorage.getItem('agent_balance');
    const savedDirectives = localStorage.getItem('agent_directives');
    const savedActions = localStorage.getItem('agent_actions');

    if (savedBalance) setBalance(parseFloat(savedBalance));
    if (savedDirectives) {
      const parsed = JSON.parse(savedDirectives);
      setDirectives(parsed.map((d: any) => ({
        ...d,
        createdAt: new Date(d.createdAt),
      })));
    }
    if (savedActions) {
      const parsed = JSON.parse(savedActions);
      setActions(parsed.map((a: any) => ({
        ...a,
        timestamp: new Date(a.timestamp),
      })));
    }
  }, []);

  // Save state to localStorage
  React.useEffect(() => {
    localStorage.setItem('agent_balance', balance.toString());
  }, [balance]);

  React.useEffect(() => {
    localStorage.setItem('agent_directives', JSON.stringify(directives));
  }, [directives]);

  React.useEffect(() => {
    localStorage.setItem('agent_actions', JSON.stringify(actions));
  }, [actions]);

  const addDirective = useCallback((directive: Omit<AgentDirective, 'id' | 'createdAt'>) => {
    const newDirective: AgentDirective = {
      ...directive,
      id: `dir_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };
    setDirectives((prev) => [newDirective, ...prev]);
  }, []);

  const removeDirective = useCallback((id: string) => {
    setDirectives((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const toggleDirective = useCallback((id: string) => {
    setDirectives((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d))
    );
  }, []);

  const logAction = useCallback((action: Omit<AgentAction, 'id' | 'timestamp'>) => {
    const newAction: AgentAction = {
      ...action,
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    setActions((prev) => [newAction, ...prev.slice(0, 99)]); // Keep last 100
  }, []);

  const clearActions = useCallback(() => {
    setActions([]);
    localStorage.removeItem('agent_actions');
  }, []);

  const executeCommand = useCallback(async (command: string): Promise<{ success: boolean; message: string }> => {
    if (!address) {
      return { success: false, message: 'Please connect your wallet first' };
    }

    setIsExecuting(true);

    try {
      // Call the AI parser API
      const response = await fetch('/api/agent/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, userWallet: address }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse command');
      }

      const result = await response.json();

      // Execute the parsed action
      switch (result.action) {
        case 'auto_unlock':
          addDirective({
            rule: command,
            filter: result.filter || {},
            action: 'auto_unlock',
            maxCostPerAction: result.maxCost || 1.0,
            isActive: true,
          });
          logAction({
            type: 'notify',
            cost: 0,
            success: true,
            message: `Auto-unlock rule created: ${result.filter.type || 'all'} items`,
          });
          return { success: true, message: 'Auto-unlock directive created' };

        case 'swap':
          logAction({
            type: 'swap',
            cost: 0,
            success: true,
            message: `Swap initiated: ${result.amount} ${result.token}`,
          });
          return { success: true, message: `Swap initiated for ${result.token}` };

        case 'summarize':
          logAction({
            type: 'summary',
            itemType: result.itemType,
            itemId: result.itemId,
            cost: 0,
            success: true,
            message: 'AI summary generated',
          });
          return { success: true, message: 'Generating AI summary...' };

        case 'show_status':
          return {
            success: true,
            message: `Agent Balance: $${balance.toFixed(2)} | Active Rules: ${directives.filter(d => d.isActive).length}`,
          };

        case 'unlock':
          if (balance < result.cost) {
            return { success: false, message: 'Insufficient agent balance' };
          }
          // This would trigger the actual unlock flow
          logAction({
            type: 'unlock',
            itemType: result.itemType,
            itemId: result.itemId,
            cost: result.cost,
            success: true,
            message: `Unlocked ${result.itemType} #${result.itemId}`,
          });
          setBalance((prev) => prev - result.cost);
          return { success: true, message: `Unlocked ${result.itemType}` };

        default:
          return { success: false, message: 'Unknown command' };
      }
    } catch (error) {
      console.error('Command execution error:', error);
      logAction({
        type: 'notify',
        cost: 0,
        success: false,
        message: `Failed to execute: ${command}`,
      });
      return { success: false, message: 'Failed to execute command' };
    } finally {
      setIsExecuting(false);
    }
  }, [address, balance, addDirective, logAction, directives]);

  const value: AgentContextType = {
    balance,
    directives,
    actions,
    isExecuting,
    setBalance,
    addDirective,
    removeDirective,
    toggleDirective,
    executeCommand,
    logAction,
    clearActions,
  };

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>;
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
}

