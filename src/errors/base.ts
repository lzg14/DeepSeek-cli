export class CLIError extends Error {
  public readonly code: number;
  public readonly suggestion?: string;
  public readonly fields?: Record<string, unknown>;

  constructor(message: string, code = 1, suggestion?: string, fields?: Record<string, unknown>) {
    super(message);
    this.name = 'CLIError';
    this.code = code;
    this.suggestion = suggestion;
    this.fields = fields;
  }
}

export function errorWithFields(message: string, fields: Record<string, unknown>): CLIError {
  return new CLIError(message, 1, undefined, fields);
}
