# Changelog

All notable changes to this project are documented here.

## [0.2.0-beta] - 2026-09-10

### Added
- Better inliner
- Luau parser: generics on functions (`function foo<T>()`, `local function foo<T>()`, function literal expressions)
- Luau parser: attribute support (`@native`, `@checked`, etc.) before statements
- Luau parser: variadic type pack parsing (`...T`)

### Changed
- Cleaned up parser error formatting: `unexpected [x], expected [y]` and `Syntax Error at Position [line:col]` instead of `<Kind>`-tagged messages

## [0.1.0-beta] - 2026-09-07

### Added
- Server-side usage stats
- Added mode with two explicit modes: `Minify` (default, comment-free & compact) and `Beautify` (readable, formatted output).

### Changed
- Improved Client

### Removed
- Removed API key / `Authorization: Bearer` requirement. All endpoints are open, no auth header needed.
