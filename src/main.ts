import { scanCommandPath, parseFlags } from './args';
import { registry } from './registry';
import { GLOBAL_OPTIONS } from './command';
import { handleError } from './errors/handler';
import { loadConfig, readConfigFile } from './config/loader';
import { CLI_VERSION } from './version';

process.on('SIGINT', () => {
  process.stderr.write('\nInterrupted. Exiting.\n');
  process.exitCode = 130;
});

process.stdout.on('error', () => {});
process.stderr.on('error', () => {});

const NO_AUTH_SETUP = [
  ['auth', 'logout'],
  ['config', 'show'],
  ['config', 'set'],
  ['models'],
];

async function main() {
  const argv = process.argv.slice(2);

  if (argv.includes('--version') || argv.includes('-v')) {
    console.log(`ds ${CLI_VERSION}`);
    process.exitCode = 0;
    return;
  }

  const commandPath = scanCommandPath(argv, GLOBAL_OPTIONS);

  const rawConfig = readConfigFile();
  const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy
    || process.env.HTTP_PROXY || process.env.http_proxy
    || rawConfig.proxy;
  if (proxyUrl) {
    // Proxy handled per-request in fetch
  }

  if (argv.includes('--help') || argv.includes('-h')) {
    registry.printHelp(commandPath, process.stderr);
    process.exitCode = 0;
    return;
  }

  if (commandPath.length === 0) {
    registry.printHelp([], process.stderr);
    const hasKey = !!(rawConfig.apiKey);
    if (hasKey) {
      const { command: balanceCmd } = registry.resolve(['balance']);
      const flags = parseFlags(argv, [...GLOBAL_OPTIONS]);
      const config = loadConfig(flags);
      await balanceCmd.execute(config, flags);
    } else {
      process.stderr.write('  Not logged in.\n');
      process.stderr.write('  ds auth login              Login with your ds API key\n\n');
    }
    process.exitCode = 0;
    return;
  }

  const { command, extra } = registry.resolve(commandPath);
  const argvWithoutCommand = argv.slice(commandPath.length);
  const flags = parseFlags(argvWithoutCommand, [...GLOBAL_OPTIONS, ...(command.options ?? [])]);

  if (extra.length > 0) (flags as Record<string, unknown>)._positional = extra;

  const config = loadConfig(flags);

  const needsAuthSetup = !NO_AUTH_SETUP.some(
    (cmd) => cmd.every((c, i) => commandPath[i] === c),
  );
  if (needsAuthSetup && !config.apiKey) {
    const key = process.env.ds_API_KEY;
    if (!key) {
      process.stderr.write('Error: No API key found. Run "ds auth login" or set ds_API_KEY env var.\n');
      process.exitCode = 1;
      return;
    }
    config.apiKey = key;
  }

  await command.execute(config, flags);
}

main().catch(handleError);
