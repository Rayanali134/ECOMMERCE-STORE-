// FIX #14: App.css existed (2.8 KB) but was never imported — styles were dead
import "./App.css";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return <AppRoutes />;
}

export default App;