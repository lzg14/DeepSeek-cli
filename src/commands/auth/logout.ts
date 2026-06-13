import { defineCommand } from '../../command';
import { GlobalFlags } from '../../types/flags';
import type { Config } from '../../config/schema';
import { writeConfigFile, readConfigFile } from '../../config/loader';

export default defineCommand({
  name: 'auth logout',
  description: 'Logout and remove stored credentials',
  usage: 'ds auth logout',
  examples: ['ds auth logout'],
  run: async (_config: Config, _flags: GlobalFlags) => {
    if (_flags.dry_run) {
      console.log('[Dry run] Would remove stored API key');
      return;
    }

    const current = readConfigFile();
    if (!current.apiKey && !current.baseUrl) {
      console.log('No credentials stored.\n');
      return;
    }

    writeConfigFile({});

    console.log('[OK] Logged out successfully.\n');
  },
});
