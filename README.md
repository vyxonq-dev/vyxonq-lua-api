# vyxonq-api

[![API](https://img.shields.io/badge/API-vyxonq.dev-blue?style=flat-square)](https://api.vyxonq.dev)
[![Status](https://img.shields.io/badge/status-open-success?style=flat-square)](https://api.vyxonq.dev/v1/status)

Open Lua minify / beautify / VM-compress API.  
**Base URL:** `https://api.vyxonq.dev` · No auth required.

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/v1/status` | Runtime info & usage stats |
| `POST` | `/v1/apply/` | Minify or Beautify (`mode`) |
| `POST` | `/v1/apply/vm` | VM Compression (load/loadstring) required |

---

## Usage

See the examples:

- [Node](examples/node/example.js)
- [TypeScript](examples/typescript/example.ts)
- Client → `src/client/VyxonqClient`

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md).