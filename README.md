# Thread - Daily Puzzle Game

A browser-based puzzle game where players connect numbered dots in sequence, creating a continuous thread without backtracking.

## Features

- 🎯 Daily puzzles that are the same for all players
- 🧩 5x5 grid with numbered dots to connect
- 🎨 Clean, modern UI with animations
- 📱 Mobile-first, responsive design
- 💾 Local progress saving
- 🎮 Interactive gameplay with visual feedback

## Tech Stack

- React 18
- TypeScript
- Vite
- TailwindCSS
- Framer Motion
- SeedRandom

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Game Rules

1. The game shows a 5x5 grid of dots
2. Some dots are labeled with numbers (1, 2, 3, ...)
3. Connect the numbered dots in sequence
4. The thread must be continuous and cannot backtrack
5. You can pass through unnumbered dots
6. The puzzle is complete when you reach the final numbered dot

## License

MIT
