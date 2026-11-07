# Mind Numb Games (Drift)

Small browser games for short focus breaks: Mini Sudoku and Gravity Drop.
React + Vite. Scores, best score, name and theme are kept in localStorage.

## Develop and build

    npm install
    npm run dev      # local dev server
    npm run build    # static site in dist/

`dist/` is fully static with relative asset URLs (`base: './'`) and hash routing
(`#sudoku`, `#gravity`), so it can be served from any subpath such as
`games.prithivraj.xyz/mindnumb/`. Serve it with a trailing slash (`/mindnumb/`).

## Next steps

- Deploy `dist/` to games.prithivraj.xyz/mindnumb/ via Vercel (build: `npm run build`,
  output: `dist`; redirect `/mindnumb` to `/mindnumb/`, relative assets need the slash).
- Add a visible pause button; add sound with a mute toggle.
- Gravity Drop: more levels, and drop from a fixed height so clicking inside the goal is not a free win.
- Sudoku: arrow-key navigation, pencil notes, daily seeded puzzle.
- Add automated tests for the sudoku generator and the score calculations.
