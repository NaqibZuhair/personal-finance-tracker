import OpenAI from 'openai';

const DEFAULT_MODEL = process.env.AI_MODEL || 'nvidia/nemotron-3-nano-30b-a3b:free';

export interface AIProvider {
  name: string;
  client: OpenAI;
  model: string;
}

export const getAIProviders = (isVision: boolean = false): AIProvider[] => {
  const providers: AIProvider[] = [];
  const createClient = (baseURL: string, apiKey: string) => new OpenAI({ baseURL, apiKey });

  const getKeys = (prefix: string, typoPrefixes: string[] = []): string[] => {
    const keys: string[] = [];
    const prefixes = [prefix, ...typoPrefixes];
    for (const p of prefixes) {
      if (process.env[`${p}S`]) {
        keys.push(...process.env[`${p}S`]!.split(',').map(k => k.trim()).filter(Boolean));
      }
      for (let i = 1; i <= 10; i++) {
        if (process.env[`${p}_${i}`]) {
          keys.push(process.env[`${p}_${i}`]!.trim());
        }
      }
      if (process.env[p]) {
        keys.push(process.env[p]!.trim());
      }
    }
    return Array.from(new Set(keys)).filter(Boolean);
  };

  const CEREBRAS_MODELS = ['llama-3.3-70b', 'llama-3.1-8b'];
  const GEMINI_TEXT_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash'];
  const GEMINI_VISION_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash'];
  const GROQ_TEXT_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
  const GROQ_VISION_MODELS = ['llama-3.2-11b-vision-preview', 'llama-3.2-90b-vision-preview'];
  const OPENROUTER_TEXT_MODELS = [
    'meta-llama/llama-3.3-70b-instruct:free',
    'qwen/qwen-2.5-coder-32b-instruct:free',
    'google/gemini-2.0-flash-exp:free',
    'openrouter/free'
  ];
  const OPENROUTER_VISION_MODELS = [
    'qwen/qwen-2-vl-72b-instruct:free',
    'google/gemini-2.0-flash-exp:free',
    'openrouter/free'
  ];

  const cerebrasKeys = getKeys('CEREBRAS_API_KEY', ['CEREBRAS_KEY']);
  if (!isVision && cerebrasKeys.length > 0) {
    cerebrasKeys.forEach((key, idx) => {
      CEREBRAS_MODELS.forEach((m) => {
        providers.push({
          name: `Cerebras Cloud (#${idx + 1} - ${m}) ⚡`,
          client: createClient('https://api.cerebras.ai/v1', key),
          model: m,
        });
      });
    });
  }

  const geminiKeys = getKeys('GEMINI_API_KEY', ['GOOGLE_API_KEY']);
  if (geminiKeys.length > 0) {
    geminiKeys.forEach((key, idx) => {
      const models = isVision ? GEMINI_VISION_MODELS : GEMINI_TEXT_MODELS;
      models.forEach((m) => {
        providers.push({
          name: `Google Gemini AI (#${idx + 1} - ${m}) 🌟`,
          client: createClient('https://generativelanguage.googleapis.com/v1beta/openai/', key),
          model: m,
        });
      });
    });
  }

  const groqKeys = getKeys('GROQ_API_KEY', ['GROQ_KEY']);
  if (groqKeys.length > 0) {
    groqKeys.forEach((key, idx) => {
      const models = isVision ? GROQ_VISION_MODELS : GROQ_TEXT_MODELS;
      models.forEach((m) => {
        providers.push({
          name: `Groq Cloud (#${idx + 1} - ${m}) 🔥`,
          client: createClient('https://api.groq.com/openai/v1', key),
          model: m,
        });
      });
    });
  }

  const openRouterKeys = getKeys('OPENROUTER_API_KEY', ['OPNEROUTER_API_KEY', 'AI_API_KEY']);
  if (openRouterKeys.length > 0) {
    openRouterKeys.forEach((key, idx) => {
      const models = isVision ? OPENROUTER_VISION_MODELS : OPENROUTER_TEXT_MODELS;
      models.forEach((m) => {
        providers.push({
          name: `OpenRouter (#${idx + 1} - ${m}) 🌐`,
          client: createClient('https://openrouter.ai/api/v1', key),
          model: m,
        });
      });
    });
  }

  return providers;
};