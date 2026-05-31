<div align="center">

# RiceMe

**terminal aesthetic for your GitHub README**

![License](https://img.shields.io/github/license/Solenad/chiikawa-readme?style=for-the-badge&color=7e9cd8)
![Next.js 16](https://img.shields.io/badge/Next.js-16-7e9cd8?style=for-the-badge)
![React 19](https://img.shields.io/badge/React-19-7e9cd8?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5-7e9cd8?style=for-the-badge)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind%20CSS-4-7e9cd8?style=for-the-badge)
![GitHub Stars](https://img.shields.io/github/stars/Solenad/riceme-readme-generator?style=for-the-badge&logo=github&color=7e9cd8)

</div>

![RiceMe screenshot](https://github.com/user-attachments/assets/81748fe4-5779-4e50-adcf-90e1b0a13341)

## What is this?

RiceMe generates dynamic terminal-style SVG cards for your GitHub profile README. It fetches live GitHub stats (repos, followers, following, total stars) server-side and renders them in a retro terminal layout with 23+ color themes, CRT scanline effects, ASCII art, and typewriter animations.

Just paste a markdown snippet into your `README.md` and it comes alive — no maintenance required.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), enter your GitHub username, customize the fields, and copy the markdown snippet into your profile README.

### Quick Snippet

```markdown
![solenad](http://localhost:3000/api/public/readme.svg?username=YOUR_USERNAME)
```

Replace `YOUR_USERNAME` with your GitHub username and `localhost:3000` with the deployed URL.

## Features

- **Dynamic SVG cards** — server-side rendered, works in GitHub's camo proxy cache (~30 min refresh)
- **Live GitHub stats** — public repos, followers, following, total stars fetched from the API
- **23 color themes** — Catppuccin, Kanagawa, Tokyo Night, Gruvbox, Everforest, Dracula, Rosé Pine, Nightfox (light, warm-dark, deep-dark, cool-dark)
- **CRT effects** — scanlines, vignette, beam sweep for authentic terminal feel
- **ASCII art** — built-in Chiikawa art or paste your own custom ASCII
- **Typewriter footer** — animated text cycling in the terminal prompt
- **Custom fields** — distro, host, uptime, kernel, school, shell, WM, editor, languages, stack, DB, tools, AI
- **Visual builder** — `/build` page with live preview, toggle switches, and one-click copy

## Project Structure

```
src/
├── app/
│   ├── api/public/readme.svg/route.ts   # SVG generation endpoint
│   ├── build/page.tsx                    # Visual card builder page
│   ├── page.tsx                          # Landing page
│   ├── layout.tsx                        # Root layout (metadata + providers)
│   ├── providers.tsx                     # TanStack Query provider
│   ├── globals.css                       # Tailwind + theme variables
│   ├── error.tsx                         # Error boundary
│   └── not-found.tsx                     # 404 page
├── components/
│   ├── readme-builder.tsx                # Main builder component
│   └── ui/                              # shadcn/ui primitives (46 components)
├── hooks/
│   └── use-mobile.ts                     # Mobile breakpoint hook
└── lib/
    ├── themes.ts                         # 23 color theme definitions
    └── utils.ts                          # cn() helper (clsx + tailwind-merge)
openspec/
├── config.yaml
├── specs/
│   └── typewriter-footer/               # Planned feature specs
└── changes/
.github/
└── pull_request_template.md             # PR template
```

## Documentation

| Resource | Description |
|----------|-------------|
| [AGENTS.md](AGENTS.md) | Next.js version conventions and gotchas |
| [PR Template](.github/pull_request_template.md) | Pull request guidelines |
| [OpenSpec Proposals](openspec/specs/) | Planned features and design docs |

## API

```
GET /api/public/readme.svg
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `username` | string | `Solenad` | GitHub username for stats |
| `ascii` | `0`/`1` | `1` | Show ASCII art |
| `crt` | `0`/`1` | `1` | Show CRT effects |
| `theme` | string | `catppuccin-macchiato` | Theme name |
| `ascii_art` | string | — | Custom ASCII art |
| `distro`, `host`, `uptime`, `kernel`, `school`, `shell`, `wm`, `editor`, `languages`, `stack`, `db`, `tools`, `ai` | string | — | Custom field values |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16.2](https://nextjs.org) (App Router) |
| UI Library | [React 19.2](https://react.dev) |
| Language | [TypeScript 5](https://www.typescriptlang.org) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) + [tw-animate-css](https://github.com/tailwindlabs/tailwindcss-animate) |
| UI Primitives | [Radix UI](https://www.radix-ui.com) + [shadcn/ui](https://ui.shadcn.com) |
| Data Fetching | [TanStack React Query 5](https://tanstack.com/query/latest) |
| Icons | [Lucide React](https://lucide.dev) |
| Animation | [Motion](https://motion.dev) |
| Charts | [Recharts](https://recharts.org) |
| Deployment | [OpenNext Cloudflare](https://opennext.js.org/cloudflare) + [Wrangler](https://developers.cloudflare.com/workers/wrangaller/) |

## Contributing

Contributions are welcome! Open an issue or pull request on [GitHub](https://github.com/Solenad/chiikawa-readme).

<a href="https://github.com/Solenad/chiikawa-readme/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Solenad/chiikawa-readme" />
</a>

## License

MIT © 2026 roe

