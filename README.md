# Bad UI Olympics

An independent six-event browser game. No portfolio layout, backend, account, or environment variables required.

## Development

Run `npm install` and `npm run dev` from this directory. The game is served at `/`.

## Vercel

Import this standalone repository and use the Next.js preset with the default root directory (`.`). The build command is `npm run build`.

After deployment, add the verified production URL to the Bad UI Olympics `websiteUrl` field in both portfolio catalogs (in the sibling `portfolio-project` repository: `projects/projects.json` and `projects/projects.ja.json`). Until then, leave those fields empty.

Personal bests are stored only in the player's browser. Score sharing uses the current origin; no production URL is hardcoded.

## Games

- PINball machine
- Volume gymnastics
- Submit sprint
- Checkbox hurdles
- Elevator roulette
- Password pentathlon

## Checks

Run `npm test` for game-flow tests and `npm run build` for a production build.

## License

[MIT](LICENSE) © 2026 Kitty Kio.
