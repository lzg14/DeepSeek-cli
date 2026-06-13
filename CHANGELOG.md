# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2024-06-13

### Added
- `seek chat` - Text chat with DeepSeek models
- `seek models` - List available models
- `seek balance` - Check account balance
- `seek complete` - FIM code completion (Beta)
- `seek auth login/logout` - Authentication
- `seek config show/set` - Configuration management
- Streaming support for chat
- JSON output mode
- Config file support (`~/.seek/config.json`)
- Environment variable support (`DEEPSEEK_API_KEY`)
- Proxy support

### Features
- Multiple model support (deepseek-chat, deepseek-v4-flash, deepseek-v4-pro)
- Configurable timeout
- Dry-run mode for testing
- Verbose output for debugging
