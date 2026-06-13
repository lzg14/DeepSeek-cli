import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import type { Config } from './schema';

const CONFIG_DIR = join(homedir(), '.seek');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export function readConfigFile(): Config {
  if (!existsSync(CONFIG_FILE)) return {};
  try {
    let raw = readFileSync(CONFIG_FILE, 'utf-8');
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function writeConfigFile(config: Config): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

export function loadConfig(flags: Record<string, unknown>): Config {
  const fileConfig = readConfigFile();
  const config: Config = {
    apiKey: (flags.api_key as string) || fileConfig.apiKey || process.env.DEEPSEEK_API_KEY,
    baseUrl: (flags.base_url as string) || fileConfig.baseUrl || 'https://api.ds.com',
    model: (flags.model as string) || fileConfig.model || 'deepseek-chat',
    output: (flags.output as string) || fileConfig.output || 'text',
    timeout: (flags.timeout as number) || fileConfig.timeout,
    proxy: fileConfig.proxy || process.env.HTTPS_PROXY || process.env.HTTP_PROXY,
    thinking: flags.thinking !== undefined ? !!flags.thinking : fileConfig.thinking,
    thinkingEffort: (flags.thinking_effort as number) || fileConfig.thinkingEffort || 3,
    stream: flags.stream !== undefined ? !!flags.stream : true,
  };
  return config;
}

export function loadConfigWithDefaults(partial: Partial<Config>): Config {
  const fileConfig = readConfigFile();
  return {
    ...fileConfig,
    ...partial,
  };
}
