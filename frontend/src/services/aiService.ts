import { apiClient } from '../lib/apiClient';

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

export interface AIChatResponse {
  message: string;
  data: {
    response: string;
    executedTools: string[];
  };
}

export const aiService = {
  async chat(message: string, history: AIChatMessage[] = [], image?: string): Promise<{ response: string; executedTools: string[] }> {
    const res = await apiClient<AIChatResponse>('/ai/chat', {
      method: 'POST',
      body: {
        message,
        history: history.map(h => ({ role: h.role, content: h.content })),
        image,
      },
    });
    return res.data;
  },
};
