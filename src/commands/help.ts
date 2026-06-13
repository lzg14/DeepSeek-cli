import { defineCommand } from '../command';
import { GlobalFlags } from '../types/flags';
import type { Config } from '../config/schema';

export default defineCommand({
  name: 'help',
  description: 'Show help information',
  usage: 'ds help [command]',
  examples: ['ds help', 'ds help chat', 'ds help models'],
  run: async (_config: Config, flags: GlobalFlags) => {
    const positional = (flags._positional as string[]) || [];
    const { registry } = await import('../registry');
    registry.printHelp(positional, process.stdout);
  },
});
