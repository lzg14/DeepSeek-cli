export interface GlobalFlags {
  api_key?: string;
  base_url?: string;
  output?: string;
  timeout?: number;
  quiet?: boolean;
  verbose?: boolean;
  no_color?: boolean;
  dry_run?: boolean;
  non_interactive?: boolean;
  help?: boolean;
  version?: boolean;
  _positional?: string[];
  [key: string]: unknown;
}
