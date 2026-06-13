import { describe, it } from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import { join } from 'node:path';

const CLI = join(process.cwd(), 'dist', 'ds.js');

function run(args: string[]): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve) => {
    const proc = spawn(process.execPath, [CLI, ...args], {
      env: { ...process.env, DEEPSEEK_API_KEY: 'sk-test' },
    });
    let stdout = '';
    let stderr = '';
    proc.stdout?.on('data', (d) => { stdout += d; });
    proc.stderr?.on('data', (d) => { stderr += d; });
    proc.on('close', (code) => resolve({ stdout, stderr, code: code ?? 0 }));
  });
}

describe('ds CLI', () => {
  describe('--help', () => {
    it('shows help without args', async () => {
      const result = await run(['--help']);
      const output = result.stdout + result.stderr;
      assert.ok(output.includes('Usage:'));
      assert.ok(output.includes('chat'));
      assert.ok(output.includes('models'));
      assert.ok(output.includes('balance'));
    });

    it('shows command help for chat', async () => {
      const result = await run(['chat', '--help']);
      const output = result.stdout + result.stderr;
      assert.ok(output.includes('Usage:'));
      assert.ok(output.includes('ds chat'));
    });

    it('shows command help for balance', async () => {
      const result = await run(['balance', '--help']);
      const output = result.stdout + result.stderr;
      assert.ok(output.includes('Usage:'));
      assert.ok(output.includes('ds balance'));
    });

    it('shows command help for models', async () => {
      const result = await run(['models', '--help']);
      const output = result.stdout + result.stderr;
      assert.ok(output.includes('Usage:'));
      assert.ok(output.includes('ds models'));
    });
  });

  describe('chat', () => {
    it('rejects empty message', async () => {
      const result = await run(['chat']);
      assert.notStrictEqual(result.code, 0);
    });

    it('accepts positional message with --dry-run', async () => {
      const result = await run(['chat', '--dry-run', 'Hello']);
      assert.ok(result.stdout.includes('POST'));
      assert.ok(result.stdout.includes('Hello'));
    });

    it('handles --model flag with --dry-run', async () => {
      const result = await run(['chat', '--model', 'deepseek-v4-flash', '--dry-run', 'Hi']);
      assert.ok(result.stdout.includes('POST'));
      assert.ok(result.stdout.includes('deepseek-v4-flash'));
    });

    it('handles --no-stream with --dry-run', async () => {
      const result = await run(['chat', '--no-stream', '--dry-run', 'Hi']);
      assert.ok(result.stdout.includes('"stream": false'));
    });
  });

  describe('balance', () => {
    it('shows command help', async () => {
      const result = await run(['balance', '--help']);
      const output = result.stdout + result.stderr;
      assert.ok(output.includes('Usage:'));
      assert.ok(output.includes('ds balance'));
    });
  });

  describe('models', () => {
    it('shows command help', async () => {
      const result = await run(['models', '--help']);
      const output = result.stdout + result.stderr;
      assert.ok(output.includes('Usage:'));
      assert.ok(output.includes('ds models'));
    });
  });

  describe('config', () => {
    it('shows config', async () => {
      const result = await run(['config', 'show']);
      assert.ok(result.stdout.includes('seek configuration') || result.stdout.includes('ds configuration'));
    });
  });

  describe('complete', () => {
    it('shows command help', async () => {
      const result = await run(['complete', '--help']);
      const output = result.stdout + result.stderr;
      assert.ok(output.includes('Usage:'));
      assert.ok(output.includes('ds complete'));
    });

    it('accepts --prompt with --dry-run', async () => {
      const result = await run(['complete', '--prompt', 'fn main()', '--dry-run']);
      assert.ok(result.stdout.includes('POST'));
      assert.ok(result.stdout.includes('/completions'));
    });
  });

  describe('error handling', () => {
    it('unknown command shows error', async () => {
      const result = await run(['unknown-cmd']);
      assert.notStrictEqual(result.code, 0);
    });
  });
});
