import { defineCommand } from '../../command';
import { GlobalFlags } from '../../types/flags';
import type { Config } from '../../config/schema';
import { writeConfigFile } from '../../config/loader';
import { getApiBaseUrl } from '../../args';
import * as readline from 'readline';

export default defineCommand({
  name: 'auth login',
  description: 'Login with ds API key',
  usage: 'ds auth login [flags]',
  examples: [
    'ds auth login',
    'ds auth login --key sk-xxxxx',
  ],
  options: [
    { flag: '--key <api-key>', description: 'API key (or enter interactively)' },
    { flag: '--base-url <url>', description: 'API base URL' },
  ],
  run: async (config: Config, flags: GlobalFlags) => {
    let apiKey = flags.key as string;

    if (!apiKey) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stderr,
      });

      apiKey = await new Promise<string>((resolve) => {
        rl.question('Enter your ds API key: ', (answer) => {
          rl.close();
          resolve(answer.trim());
        });
      });
    }

    if (!apiKey) {
      process.stderr.write('Error: API key is required\n');
      process.exit(1);
    }

    if (flags.dry_run) {
      console.log(`[Dry run] Would save API key: ${apiKey.slice(0, 8)}...`);
      return;
    }

    if (flags.base_url) {
      writeConfigFile({ ...config, apiKey, baseUrl: flags.base_url as string });
    } else {
      writeConfigFile({ ...config, apiKey, baseUrl: getApiBaseUrl(config) });
    }

    console.log('[OK] API key saved successfully');

    if (flags.base_url) {
      console.log(`  Base URL: ${flags.base_url}`);
    }

    console.log('  Run "ds models" to verify your credentials.\n');
  },
});
