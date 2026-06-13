# Changelog

All notable changes to this project will be documented in this file.

## [0.1.3] - 2026-06-13

### Fixed
- Environment variable name: `DEEPSEEK_API_KEY` (was inconsistently `ds_API_KEY`)
- `ds help` now works without API key
- JSON output mode masks API key
- Fixed test file to reference correct binary `ds.js`

### Changed
- Replaced `process.exit()` with `process.exitCode` to fix Windows assertion errors
- Added shebang `#!/usr/bin/env node` to built binary

## [0.1.0] - 2026-06-13

### Added
- `ds chat` - Text chat with DeepSeek models
- `ds models` - List available models
- `ds balance` - Check account balance
- `ds complete` - FIM code completion (Beta)
- `ds auth login/logout` - Authentication
- `ds config show/set` - Configuration management
- Streaming support for chat
- JSON output mode
- Config file support (`~/.seek/config.json`)
- Environment variable support (`DEEPSEEK_API_KEY`)
- Proxy support
- Multiple model support (deepseek-chat, deepseek-v4-flash, deepseek-v4-pro)
- Configurable timeout
- Dry-run mode for testing
- Verbose output for debugging
