# Weather Dashboard

Type a city name to see its live weather. The data comes from Open-Meteo.

## API key setup

This project does not need an API key. Open-Meteo is free and needs no sign-up.

If I change to a weather API that needs a key:

1. Copy `.env.example` and rename the copy to `.env` (.env.example created to demonstrate example and make it visible, not ignored by gitignore)
2. In `.env`, replace `the-api-key` with the real key
3. `.env` is in `.gitignore`, so it is never pushed to GitHub

## Reading the key from .env

A browser cannot read `.env` on its own.

Create a Vite project (choose Vanilla, then JavaScript):

```
npm create vite@latest weather-app
cd weather-app
npm install
npm run dev
```

Then move the code into it:

1. Copy the HTML into `index.html`
2. Copy the CSS into `src/style.css`
3. Paste the script into `src/main.js`
4. In `index.html`, load it with `<script type="module" src="/src/main.js"></script>`

In `.env`, the key name must start with `VITE_`:

```
VITE_WEATHER_API_KEY=the-real-key
```

In `src/main.js`, read the key:

```
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
```