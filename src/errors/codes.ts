export const ExitCode = {
  SUCCESS: 0,
  USAGE: 1,
  CONFIG: 2,
  AUTH: 3,
  NETWORK: 4,
  API: 5,
  TIMEOUT: 6,
  ABORT: 7,
  UNKNOWN: 99,
} as const;

export type ExitCodeKey = keyof typeof ExitCode;
export type ExitCodeValue = (typeof ExitCode)[ExitCodeKey];
