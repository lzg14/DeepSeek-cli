import { CLIError } from './base';
import { ExitCode } from './codes';

export function handleError(error: unknown): never {
  if (error instanceof CLIError) {
    if (error.suggestion) {
      process.stderr.write(`\n\x1b[1merror:\x1b[0m ${error.message}\n\n  -> ${error.suggestion}\n\n`);
    } else {
      process.stderr.write(`\n\x1b[1merror:\x1b[0m ${error.message}\n\n`);
    }
    process.exit(ExitCode.UNKNOWN);
  }

  const msg = String(error);
  if (msg.includes('ENOTFOUND') || msg.includes('ECONNREFUSED') || msg.includes('fetch failed')) {
    process.stderr.write(`\n\x1b[1merror:\x1b[0m ${msg}\n`);
    process.stderr.write('\n  -> Check your network connection or proxy settings.\n');
    process.exit(ExitCode.NETWORK);
  }

  process.stderr.write(`\n\x1b[1merror:\x1b[0m ${msg}\n`);
  process.exit(ExitCode.UNKNOWN);
}
