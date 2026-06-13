import { CLIError } from './base';
import { ExitCode } from './codes';
import type { Config } from '../config/schema';

export function handleError(error: unknown): never {
  if (error instanceof CLIError) {
    if (error.suggestion) {
      process.stderr.write(`\n\x1b[1merror:\x1b[0m ${error.message}\n\n  -> ${error.suggestion}\n\n`);
    } else {
      process.stderr.write(`\n\x1b[1merror:\x1b[0m ${error.message}\n\n`);
    }
    if ((error as NodeJS.ErrnoException).code === 'ENOTFOUND' || (error as NodeJS.ErrnoException).code === 'ECONNREFUSED') {
      process.stderr.write('\n  -> Check your network connection or proxy settings.\n');
      process.stderr.write('  -> Or set a proxy: ds config set proxy http://localhost:7890\n');
      process.exit(ExitCode.NETWORK);
    }
    process.exit(ExitCode.UNKNOWN);
  }

  process.stderr.write(`\n\x1b[1merror:\x1b[0m ${String(error)}\n`);
  process.exit(ExitCode.UNKNOWN);
}
