# ds-cli - DeepSeek CLI

Command-line tool for DeepSeek API. Chat with models, manage API keys, and more.

## Features

- **Chat** - Interactive text chat with DeepSeek models
- **Models** - List available models and their capabilities
- **Balance** - Check your account balance and usage
- **Complete** - FIM (Fill-in-the-Middle) code completion
- **Streaming** - Real-time streaming responses
- **JSON Output** - Machine-readable output format

## Requirements

- Node.js >= 18
- DeepSeek API key

## Installation

### npm

```bash
npm install -g ds-cli
```

## Quick Start

```bash
# Login with API key (interactive)
ds auth login

# Or set via environment variable
export DEEPSEEK_API_KEY=sk-xxxxx

# Chat with DeepSeek
ds chat "Hello, who are you?"

# List available models
ds models

# Check account balance
ds balance

# Code completion (Beta)
ds complete --prompt "fn main()"
```

## Commands

| Command | Description |
|---------|-------------|
| `ds chat [options] [message]` | Chat with DeepSeek models |
| `ds models` | List available models |
| `ds balance` | Check account balance |
| `ds complete [options]` | FIM code completion (Beta) |
| `ds auth login` | Login with API key |
| `ds auth logout` | Logout and remove credentials |
| `ds config` | Show configuration |
| `ds config set <key> <value>` | Set a configuration value |

## Options

### Global Flags

| Flag | Description |
|------|-------------|
| `--api-key <key>` | DeepSeek API key |
| `--base-url <url>` | API base URL (default: https://api.deepseek.com) |
| `--output <format>` | Output format: text, json |
| `--timeout <seconds>` | Request timeout |
| `--quiet` | Suppress non-essential output |
| `--verbose` | Print HTTP request/response details |
| `--dry-run` | Print request without sending |
| `--help` | Show help |
| `--version` | Show version |

### Chat Options

| Flag | Description |
|------|-------------|
| `--model <model>` | Model to use (deepseek-chat, deepseek-v4-flash) |
| `--system <text>` | System prompt |
| `--stream` | Enable streaming (default) |
| `--no-stream` | Disable streaming |
| `--temperature <number>` | Temperature (0-2) |
| `--max-tokens <n>` | Max output tokens |
| `--json` | Request JSON mode |

### Complete Options

| Flag | Description |
|------|-------------|
| `--model <model>` | Model to use (deepseek-coder) |
| `--prompt <text>` | Prefix text (required) |
| `--suffix <text>` | Suffix text |
| `--max-tokens <n>` | Max output tokens |
| `--temperature <number>` | Temperature (0-2) |

## Configuration

Config file: `~/.seek/config.json`

```json
{
  "apiKey": "sk-xxxxx",
  "baseUrl": "https://api.deepseek.com",
  "model": "deepseek-chat"
}
```

Or use CLI commands:

```bash
ds config set model deepseek-v4-flash
ds config
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DEEPSEEK_API_KEY` | API key |
| `HTTPS_PROXY` | HTTPS proxy URL |
| `HTTP_PROXY` | HTTP proxy URL |

## Models

| Model | Context | Description |
|-------|---------|-------------|
| `deepseek-chat` | 64K | General chat model |
| `deepseek-v4-flash` | 1M | Fast, low-cost |
| `deepseek-v4-pro` | 1M | High performance |

## Pricing

| Model | Input (cached) | Input | Output |
|-------|----------------|-------|--------|
| deepseek-v4-flash | ¥0.02/M | ¥1/M | ¥2/M |
| deepseek-v4-pro | ¥0.025/M | ¥3/M | ¥6/M |

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Type check
npm run typecheck
```

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
