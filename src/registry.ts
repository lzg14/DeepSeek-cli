import type { Command } from './command';
import { CLIError } from './errors/base';
import { ExitCode } from './errors/codes';
import { CLI_VERSION } from './version';

import chatCmd from './commands/chat';
import modelsCmd from './commands/models';
import balanceCmd from './commands/balance';
import completeCmd from './commands/complete';
import authLoginCmd from './commands/auth/login';
import authLogoutCmd from './commands/auth/logout';
import configShowCmd from './commands/config/show';
import configSetCmd from './commands/config/set';
import helpCmd from './commands/help';

export type { Command, OptionDef } from './command';

interface CommandNode {
  command?: Command;
  children: Map<string, CommandNode>;
}

class CommandRegistry {
  private root: CommandNode = { children: new Map() };

  constructor(commands: Record<string, Command>) {
    for (const [path, cmd] of Object.entries(commands)) {
      this.register(path, cmd);
    }
  }

  private register(path: string, command: Command): void {
    const parts = path.split(' ');
    let node = this.root;
    for (const part of parts) {
      if (!node.children.has(part)) {
        node.children.set(part, { children: new Map() });
      }
      node = node.children.get(part)!;
    }
    node.command = command;
  }

  resolve(commandPath: string[]): { command: Command; extra: string[] } {
    let node = this.root;
    const matched: string[] = [];

    for (const part of commandPath) {
      const child = node.children.get(part);
      if (!child) break;
      node = child;
      matched.push(part);
    }

    if (node.command) {
      return { command: node.command, extra: commandPath.slice(matched.length) };
    }

    // If no command found but has children, try default subcommand "show"
    if (matched.length > 0 && node.children.size > 0 && node.children.has('show')) {
      const child = node.children.get('show')!;
      if (child.command) {
        return { command: child.command, extra: commandPath.slice(matched.length + 1) };
      }
    }

    if (matched.length > 0 && node.children.size === 1) {
      const [, child] = node.children.entries().next().value as [string, CommandNode];
      if (child.command) {
        return { command: child.command, extra: commandPath.slice(matched.length) };
      }
    }

    if (matched.length > 0 && node.children.size > 0) {
      const subcommands = Array.from(node.children.entries())
        .map(([name, n]) => {
          if (n.command) return `  ${matched.join(' ')} ${name}    ${n.command.description}`;
          const subs = Array.from(n.children.keys()).join(', ');
          return `  ${matched.join(' ')} ${name} [${subs}]`;
        })
        .join('\n');
      throw new CLIError(
        `Unknown command: ds ${commandPath.join(' ')}\n\nAvailable commands:\n${subcommands}`,
        ExitCode.USAGE,
        `ds ${matched.join(' ')} --help`,
      );
    }

    throw new CLIError(
      `Unknown command: ds ${commandPath.join(' ')}`,
      ExitCode.USAGE,
      'ds --help',
    );
  }

  private bold = (s: string, out: NodeJS.WriteStream) => out.isTTY ? `\x1b[1m${s}\x1b[0m` : s;
  private accent = (s: string, out: NodeJS.WriteStream) => out.isTTY ? `\x1b[38;2;103;58m${s}\x1b[0m` : s;
  private dim = (s: string, out: NodeJS.WriteStream) => out.isTTY ? `\x1b[2m${s}\x1b[0m` : s;

  printHelp(commandPath: string[], out: NodeJS.WriteStream = process.stdout): void {
    if (commandPath.length === 0) {
      this.printRootHelp(out);
      return;
    }

    let node = this.root;
    for (const part of commandPath) {
      const child = node.children.get(part);
      if (!child) {
        this.printRootHelp(out);
        return;
      }
      node = child;
    }

    if (node.command) {
      this.printCommandHelp(node.command, out);
      return;
    }

    const prefix = commandPath.join(' ');
    out.write(`\n${this.bold('Usage:', out)} ds ${prefix} <command> [flags]\n\n`);
    out.write(`${this.bold('Commands:', out)}\n`);
    this.printChildren(node, prefix, out);
    out.write('\n');
  }

  private printRootHelp(out: NodeJS.WriteStream): void {
    const b = (s: string) => this.bold(s, out);
    const a = (s: string) => this.accent(s, out);
    const d = (s: string) => this.dim(s, out);

    out.write(`
  ${b('ds')} ${a('v' + CLI_VERSION)}  Deepseek CLI

  ${b('Usage:')} ds <command> [flags]

  ${b('Commands:')}
    ${a('chat')}       ${d('Text chat with DeepSeek models')}
   ${a('models')}    ${d('List available models')}
   ${a('balance')}   ${d('Check account balance')}
   ${a('complete')}  ${d('FIM code completion (Beta)')}
   ${a('auth')}      ${d('Authentication (login, logout)')}
   ${a('config')}    ${d('CLI configuration (show, set)')}

 ${b('Global Flags:')}
   ${a('--api-key <key>')}      ${d('API key (overrides env var)')}
   ${a('--base-url <url>')}     ${d('API base URL')}
   ${a('--output <format>')}    ${d('Output format: text, json')}
   ${a('--quiet')}              ${d('Suppress non-essential output')}
   ${a('--verbose')}            ${d('Print HTTP details')}
   ${a('--help')}               ${d('Show help')}

 ${b('Getting Help:')}
   ${d('Add --help after any command.')}
   ${d('Example:')} ds chat --help
`);
  }

  private printCommandHelp(cmd: Command, out: NodeJS.WriteStream): void {
    const b = (s: string) => this.bold(s, out);
    const a = (s: string) => this.accent(s, out);
    const d = (s: string) => this.dim(s, out);

    out.write(`\n${cmd.description}\n`);
    if (cmd.usage) out.write(`${b('Usage:')} ${cmd.usage}\n`);
    if (cmd.options && cmd.options.length > 0) {
      const maxLen = Math.max(...cmd.options.map(o => o.flag.length));
      out.write(`\n${b('Options:')}\n`);
      for (const opt of cmd.options) {
        out.write(`  ${a(opt.flag.padEnd(maxLen + 2))} ${d(opt.description)}\n`);
      }
    }
    if (cmd.examples && cmd.examples.length > 0) {
      out.write(`\n${b('Examples:')}\n`);
      for (const ex of cmd.examples) {
        out.write(`  ${d(ex)}\n`);
      }
    }
    out.write('\n');
  }

  private printChildren(node: CommandNode, prefix: string, out: NodeJS.WriteStream): void {
    const entries: Array<{ fullName: string; description: string }> = [];
    const collect = (n: CommandNode, p: string) => {
      for (const [name, child] of n.children) {
        if (child.command) entries.push({ fullName: `${p} ${name}`, description: child.command.description });
        if (child.children.size > 0) collect(child, `${p} ${name}`);
      }
    };
    collect(node, prefix);
    const maxLen = Math.max(...entries.map(e => e.fullName.length));
    for (const { fullName, description } of entries) {
      out.write(`  ${this.accent(fullName.padEnd(maxLen), out)}  ${this.dim(description, out)}\n`);
    }
  }
}

export const registry = new CommandRegistry({
  'chat': chatCmd,
  'models': modelsCmd,
  'balance': balanceCmd,
  'complete': completeCmd,
  'auth login': authLoginCmd,
  'auth logout': authLogoutCmd,
  'config show': configShowCmd,
  'config set': configSetCmd,
  'help': helpCmd,
});
