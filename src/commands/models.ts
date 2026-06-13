import { defineCommand } from '../command';
import { GlobalFlags } from '../types/flags';
import type { Config } from '../config/schema';
import { getApiBaseUrl } from '../args';

export default defineCommand({
  name: 'models',
  description: 'List available DeepSeek models',
  usage: 'ds models [flags]',
  examples: [
    'ds models',
    'ds models --json',
  ],
  options: [
    { flag: '--json', description: 'Output in JSON format' },
  ],
  run: async (config: Config, flags: GlobalFlags) => {
    const baseUrl = getApiBaseUrl(config);
    const apiKey = config.apiKey;
    if (!apiKey) throw new Error('No API key. Set ds_API_KEY or run ds auth login');

    if (flags.dry_run) {
      console.log(`[Dry run] GET ${baseUrl}/models`);
      return;
    }

    const controller = new AbortController();
    const timeout = (flags.timeout as number) || config.timeout || 30;
    const timer = setTimeout(() => controller.abort(), timeout * 1000);

    try {
      const response = await fetch(`${baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`API error ${response.status}: ${err}`);
      }

      const data = await response.json();

      if (flags.json) {
        console.log(JSON.stringify(data, null, 2));
        return;
      }

      const models = data.data || [];
      console.log('\nAvailable ds Models:\n');
      for (const model of models) {
        const created = model.created ? new Date(model.created * 1000).toLocaleDateString() : '';
        console.log(`  ${model.id}  ${model.object}  ${created}`);
        if (model.owned_by) console.log(`    Owned by: ${model.owned_by}`);
      }
      console.log('');
    } finally {
      clearTimeout(timer);
    }
  },
});
