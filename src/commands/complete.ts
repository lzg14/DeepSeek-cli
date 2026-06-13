import { defineCommand } from '../command';
import { GlobalFlags } from '../types/flags';
import type { Config } from '../config/schema';
import { getApiBaseUrl } from '../args';

export default defineCommand({
  name: 'complete',
  description: 'FIM code completion (Beta)',
  usage: 'ds complete [flags] [--prompt <prefix>] [--suffix <suffix>]',
  examples: [
    'ds complete --prompt "fn main()"',
    'ds complete --prompt "class MyClass" --suffix "}"',
    'ds complete --model deepseek-coder --prompt "import"',
  ],
  options: [
    { flag: '--model <model>', description: 'Model to use (default: deepseek-coder)' },
    { flag: '--prompt <text>', description: 'Prefix text' },
    { flag: '--suffix <text>', description: 'Suffix text' },
    { flag: '--max-tokens <n>', description: 'Max output tokens' },
    { flag: '--temperature <number>', description: 'Temperature (0-2)' },
    { flag: '--stream', description: 'Enable streaming' },
    { flag: '--no-stream', description: 'Disable streaming' },
  ],
  run: async (config: Config, flags: GlobalFlags) => {
    const baseUrl = getApiBaseUrl(config);
    const apiKey = config.apiKey;
    if (!apiKey) throw new Error('No API key. Set ds_API_KEY or run ds auth login');

    const model = (flags.model as string) || 'deepseek-coder';

    if (flags.dry_run) {
      console.log(`[Dry run] POST ${baseUrl}/completions`);
      return;
    }

    const body: Record<string, unknown> = {
      model,
      stream: flags.stream !== false && flags.no_stream === undefined,
    };

    if (flags.prompt) body.prompt = flags.prompt;
    if (flags.suffix) body.suffix = flags.suffix;
    if (flags.max_tokens !== undefined) body.max_tokens = parseInt(flags.max_tokens as string);
    if (flags.temperature !== undefined) body.temperature = parseFloat(flags.temperature as string);

    if (!body.prompt) {
      process.stderr.write('Error: --prompt is required for FIM completion\n');
      process.exit(1);
    }

    const controller = new AbortController();
    const timeout = (flags.timeout as number) || config.timeout || 60;
    const timer = setTimeout(() => controller.abort(), timeout * 1000);

    try {
      const response = await fetch(`${baseUrl}/completions`, {
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

      const isStreaming = body.stream;
      if (isStreaming) {
        if (!response.body) throw new Error('No response body');
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data:')) {
              const data = trimmed.slice(5).trim();
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content || parsed.choices?.[0]?.text;
                if (delta) process.stdout.write(delta);
              } catch {}
            }
          }
        }
        process.stdout.write('\n');
      } else {
        const data = await response.json();
        const text = data.choices?.[0]?.text || data.choices?.[0]?.message?.content;
        if (text) console.log(text);
      }
    } finally {
      clearTimeout(timer);
    }
  },
});
