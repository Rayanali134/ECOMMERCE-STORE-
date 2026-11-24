// FIX #4: This file at src/Home.jsx was an orphan — never imported by any route.
// The real Home page lives at src/pages/public/Home.jsx and is used in AppRoutes.jsx.
// This file now simply re-exports that component so it isn't dead code.
// If you don't need this file at all, you can safely delete it.
export { default } from "./pages/public/Home";