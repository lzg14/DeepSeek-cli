import { defineCommand } from '../../command';
import { GlobalFlags } from '../../types/flags';
import type { Config } from '../../config/schema';
import { readConfigFile, writeConfigFile } from '../../config/loader';

export default defineCommand({
  name: 'config set',
  description: 'Set a configuration value',
  usage: 'ds config set <key> <value>',
  examples: [
    'ds config set model deepseek-chat',
    'ds config set proxy http://localhost:7890',
  ],
  run: async (_config: Config, flags: GlobalFlags) => {
    const positional = (flags._positional as string[]) || [];
    const [key, ...valueParts] = positional;

    if (!key || valueParts.length === 0) {
      process.stderr.write('Error: Usage: ds config set <key> <value>\n');
      process.exit(1);
    }

    const value = valueParts.join(' ');
    const cfg = readConfigFile();

    const keyMap: Record<string, string> = {
      'model': 'model',
      'base-url': 'baseUrl',
      'base_url': 'baseUrl',
      'proxy': 'proxy',
      'timeout': 'timeout',
      'thinking': 'thinking',
      'thinking-effort': 'thinkingEffort',
      'thinking_effort': 'thinkingEffort',
    };

    const configKey = keyMap[key] || key;

    if (flags.dry_run) {
      console.log(`[Dry run] Would set ${configKey} = ${value}`);
      return;
    }

    (cfg as Record<string, unknown>)[configKey] = value;
    writeConfigFile(cfg);

    console.log(`[OK] Set ${key} = ${value}\n`);
  },
});
