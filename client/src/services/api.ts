import { 
  DiscussionSession, 
  DiscussionMessage, 
  SessionReport, 
  AnalyticsSummary, 
  AIPersonality,
  SessionComparisonResult 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.port === '5173' ? 'http://localhost:5000/api' : '/api');

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('gd_arena_token');
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  }
  return { 'Authorization': 'Bearer demo-user-local' };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    let errorMsg = `API Error (${response.status})`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorMsg;
    } catch {
      errorMsg = await response.text() || errorMsg;
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Check health
  async checkHealth() {
    return request<{ status: string; isAiConfigured: boolean; isSupabaseConfigured: boolean }>('/health');
  },

  // Sessions
  async createSession(data: {
    topic: string;
    difficulty: string;
    duration_minutes: number;
    participant_count: number;
    discussion_style: string;
    selected_personalities: string[];
  }): Promise<{ session: DiscussionSession; initialMessage: DiscussionMessage; participants: AIPersonality[] }> {
    return request('/sessions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getSessions(): Promise<{ sessions: DiscussionSession[] }> {
    return request('/sessions');
  },

  async getSession(id: string): Promise<{
    session: DiscussionSession;
    messages: DiscussionMessage[];
    participants: AIPersonality[];
  }> {
    return request(`/sessions/${id}`);
  },

  async addMessage(sessionId: string, message: {
    message_text: string;
    speaker_type: 'user' | 'ai';
    speaker_name: string;
    personality?: string;
  }): Promise<{ message: DiscussionMessage }> {
    return request(`/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify(message)
    });
  },

  // AI Orchestration
  async respondTurn(sessionId: string, userMessage?: string): Promise<{
    message: DiscussionMessage;
    speaker: AIPersonality;
  }> {
    return request(`/sessions/${sessionId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ userMessage })
    });
  },

  async finishSession(sessionId: string): Promise<{ message: string; sessionId: string }> {
    return request(`/sessions/${sessionId}/finish`, {
      method: 'POST'
    });
  },

  // Report
  async generateReport(sessionId: string): Promise<{ report: SessionReport }> {
    return request(`/sessions/${sessionId}/report`, {
      method: 'POST'
    });
  },

  async getReport(sessionId: string): Promise<{ report: SessionReport }> {
    return request(`/sessions/${sessionId}/report`);
  },

  // Analytics
  async getAnalytics(): Promise<{ analytics: AnalyticsSummary }> {
    return request('/analytics');
  },

  // Comparison
  async compareSessions(sessionAId: string, sessionBId: string): Promise<{ comparison: SessionComparisonResult }> {
    return request('/sessions/compare', {
      method: 'POST',
      body: JSON.stringify({ sessionAId, sessionBId })
    });
  },

  // Exercises & Drills
  async completeExercise(exerciseId: string): Promise<{ success: boolean; exerciseId: string; completedAt: string }> {
    return request('/sessions/exercises/complete', {
      method: 'POST',
      body: JSON.stringify({ exerciseId })
    });
  },

  async getCompletedExercises(): Promise<{ completed: string[] }> {
    return request('/sessions/exercises/completed');
  }
};
