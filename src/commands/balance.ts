import { defineCommand } from '../command';
import { GlobalFlags } from '../types/flags';
import type { Config } from '../config/schema';
import { getApiBaseUrl } from '../args';

export default defineCommand({
  name: 'balance',
  description: 'Check ds account balance',
  usage: 'ds balance [flags]',
  examples: [
    'ds balance',
    'ds balance --json',
  ],
  options: [
    { flag: '--json', description: 'Output in JSON format' },
  ],
  run: async (config: Config, flags: GlobalFlags) => {
    const baseUrl = getApiBaseUrl(config);
    const apiKey = config.apiKey;
    if (!apiKey) throw new Error('No API key. Set ds_API_KEY or run ds auth login');

    if (flags.dry_run) {
      console.log(`[Dry run] GET ${baseUrl}/user/balance`);
      return;
    }

    const controller = new AbortController();
    const timeout = (flags.timeout as number) || config.timeout || 30;
    const timer = setTimeout(() => controller.abort(), timeout * 1000);

    try {
      const response = await fetch(`${baseUrl}/user/balance`, {
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

      const balance = data.balance_infos || [];
      if (balance.length === 0) {
        console.log('\n  No balance information available.\n');
        return;
      }

      console.log('\n  ds Account Balance:\n');
      for (const item of balance) {
        const currency = item.currency || 'CNY';
        const available = item.total_balance ?? item.balance ?? 'N/A';
        console.log(`    ${item.model || 'Account'}: ${available} ${currency}`);
      }
      console.log('');
    } finally {
      clearTimeout(timer);
    }
  },
});
