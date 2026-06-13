import type { GlobalFlags } from './types/flags';

export function parseFlags(argv: string[], knownFlags: Array<{ flag: string; type?: string }>): GlobalFlags {
  const flags: GlobalFlags = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--') {
      flags._positional = argv.slice(i + 1);
      break;
    }

    if (!arg.startsWith('-')) {
      if (!flags._positional) flags._positional = [];
      flags._positional.push(arg);
      continue;
    }

    const eqIdx = arg.indexOf('=');
    if (eqIdx !== -1) {
      const name = arg.slice(0, eqIdx);
      const value = arg.slice(eqIdx + 1);
      flags[name.replace(/^--/, '').replace(/-/g, '_')] = value;
      continue;
    }

    const flagName = arg.replace(/^--/, '').replace(/-/g, '_');
    const flagDef = knownFlags.find(f => {
      const baseFlag = f.flag.split(' ')[0];
      return baseFlag === arg || baseFlag === `--${flagName.replace(/_/g, '-')}`;
    });
    const hasValueSpec = flagDef?.flag.includes(' <') || flagDef?.flag.includes(' [');
    const nextArg = argv[i + 1];

    if (hasValueSpec && nextArg && !nextArg.startsWith('-')) {
      flags[flagName] = nextArg;
      i++;
    } else {
      flags[flagName] = true;
    }
  }

  return flags;
}

export function scanCommandPath(argv: string[], globalOptions: string[]): string[] {
  const path: string[] = [];
  for (const arg of argv) {
    if (arg.startsWith('-')) break;
    if (arg === '--') break;
    path.push(arg);
  }
  return path;
}

export function getApiBaseUrl(config: Record<string, unknown>): string {
  return (config.base_url as string) || (config.baseUrl as string) || 'https://api.ds.com';
}
