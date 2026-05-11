import AppRoutes from "./routes/AppRoutes";
import { NotificationProvider } from "./contexts/NotificationContext";
import NotificationToast from "./components/common/NotificationToast";
import "./index.css";

function App() {
  return (
    <NotificationProvider>
      <AppRoutes />
      <NotificationToast />
    </NotificationProvider>
  );
}

export default App;
