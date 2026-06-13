import { defineCommand } from '../command';
import { GlobalFlags } from '../types/flags';
import type { Config } from '../config/schema';
import { getApiBaseUrl } from '../args';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export default defineCommand({
  name: 'chat',
  description: 'Chat with DeepSeek models',
  usage: 'ds chat [options] [message]',
  examples: [
    'ds chat "Hello, who are you?"',
    'ds chat --model deepseek-v4-flash "Explain quantum computing"',
    'ds chat --no-stream',
  ],
  options: [
    { flag: '--model <model>', description: 'Model to use (deepseek-chat, deepseek-v4-flash)' },
    { flag: '--system <text>', description: 'System prompt' },
    { flag: '--think', description: 'Enable reasoning mode' },
    { flag: '--no-think', description: 'Disable reasoning mode' },
    { flag: '--thinking-effort <0-10>', description: 'Reasoning effort level' },
    { flag: '--stream', description: 'Enable streaming (default)' },
    { flag: '--no-stream', description: 'Disable streaming' },
    { flag: '--temperature <number>', description: 'Temperature (0-2)' },
    { flag: '--max-tokens <n>', description: 'Max output tokens' },
    { flag: '--json', description: 'Request JSON mode' },
    { flag: '--timeout <seconds>', description: 'Request timeout' },
  ],
  run: async (config: Config, flags: GlobalFlags) => {
    const baseUrl = getApiBaseUrl(config);
    const apiKey = config.apiKey;
    if (!apiKey) throw new Error('No API key. Set ds_API_KEY or run ds auth login');

    const model = (flags.model as string) || config.model || 'deepseek-chat';
    const messages: ChatMessage[] = [];

    if (flags.system) {
      messages.push({ role: 'system', content: flags.system as string });
    }

    const positional = (flags._positional as string[]) || [];
    if (positional.length > 0) {
      messages.push({ role: 'user', content: positional.join(' ') });
    }

    if (messages.length === 0) {
      process.stderr.write('Error: No message provided. Usage: ds chat <message>\n');
      process.exit(1);
    }

    const isStreaming = flags.stream !== false && flags.no_stream === undefined;
    const enableReasoning = flags.think !== undefined ? !!flags.think : config.thinking;

    const body: Record<string, unknown> = {
      model,
      messages,
      stream: isStreaming,
    };

    if (enableReasoning) {
      body.thinking = { type: 'enabled' };
      if (config.thinkingEffort) body.reasoning_effort = config.thinkingEffort;
    }

    if (flags.temperature !== undefined) body.temperature = parseFloat(flags.temperature as string);
    if (flags.max_tokens !== undefined) body.max_tokens = parseInt(flags.max_tokens as string, 10);
    if (flags.json) body.response_format = { type: 'json_object' };

    const timeout = (flags.timeout as number) || config.timeout || 120;

    if (flags.dry_run) {
      console.log(`[Dry run] POST ${baseUrl}/chat/completions`);
      console.log(JSON.stringify(body, null, 2));
      return;
    }

    if (isStreaming) {
      await runStreaming(baseUrl, apiKey, body, timeout, flags);
    } else {
      await runNonStreaming(baseUrl, apiKey, body, timeout, flags);
    }
  },
});

async function runStreaming(baseUrl: string, apiKey: string, body: Record<string, unknown>, timeout: number, flags: GlobalFlags) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout * 1000);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API error ${response.status}: ${err}`);
    }

    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) process.stdout.write(delta);
          } catch {}
        }
      }
    }
    process.stdout.write('\n');
  } finally {
    clearTimeout(timer);
  }
}

async function runNonStreaming(baseUrl: string, apiKey: string, body: Record<string, unknown>, timeout: number, flags: GlobalFlags) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout * 1000);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...body, stream: false }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;
    if (message?.reasoning_content && flags.verbose) {
      console.log('[Reasoning]:\n' + message.reasoning_content + '\n');
    }
    if (message?.content) console.log(message.content);
  } finally {
    clearTimeout(timer);
  }
}
