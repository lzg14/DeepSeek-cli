export interface Config {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  output?: string;
  timeout?: number;
  proxy?: string;
  thinking?: boolean;
  thinkingEffort?: number;
  stream?: boolean;
}
