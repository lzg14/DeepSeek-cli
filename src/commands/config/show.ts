import { defineCommand } from '../../command';
import { GlobalFlags } from '../../types/flags';
import type { Config } from '../../config/schema';
import { readConfigFile } from '../../config/loader';

export default defineCommand({
  name: 'config show',
  description: 'Show current configuration',
  usage: 'ds config show [flags]',
  examples: ['ds config show', 'ds config show --json'],
  options: [
    { flag: '--json', description: 'Output in JSON format' },
  ],
  run: async (_config: Config, flags: GlobalFlags) => {
    const cfg = readConfigFile();

    if (flags.json) {
      console.log(JSON.stringify(cfg, null, 2));
      return;
    }

    console.log('\n  ds configuration:\n');
    console.log(`    API Key:  ${cfg.apiKey ? cfg.apiKey.slice(0, 8) + '...' : '(not set)'}`);
    console.log(`    Base URL: ${cfg.baseUrl || 'https://api.ds.com (default)'}`);
    console.log(`    Model:    ${cfg.model || 'deepseek-chat (default)'}`);
    console.log(`    Proxy:     ${cfg.proxy || '(not set)'}`);
    console.log('');
    console.log('  Environment variables:');
    console.log('    ds_API_KEY  -> API key');
    console.log('    HTTPS_PROXY       -> Proxy URL');
    console.log('    HTTP_PROXY        -> Proxy URL');
    console.log('');
  },
});
