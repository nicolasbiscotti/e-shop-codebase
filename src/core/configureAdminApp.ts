import { AdminApp, AppState } from "./AdminApp";
import { AuthProvider } from "./AuthProvider";
import { AdminUser } from "./User";

type AppConfig = {
  authProvider: AuthProvider;
  initialState?: AppState;
};

export function configureAdminApp(config: AppConfig): AdminApp {
  const { authProvider, initialState } = config;

  const state: AppState = initialState || {
    user: null,
    warningMessage: null,
    notification: null,
  };

  const userListeners: Set<(user: AdminUser | null) => void> = new Set();
  const messageListeners: Set<(message: string | null) => void> = new Set();
  const notificationListeners: Set<(message: string | null) => void> =
    new Set();

  const unsuscribe = authProvider.onLoggedUserChange(setUser);

  function onUserChange(listener: (user: AdminUser | null) => void) {
    userListeners.add(listener);
    // listener(state.user);
    return () => userListeners.delete(listener);
  }

  function onMessageChange(listener: (message: string | null) => void) {
    messageListeners.add(listener);
    // listener(state.warningMessage);
    return () => messageListeners.delete(listener);
  }

  function onNotificationChange(listener: (message: string | null) => void) {
    notificationListeners.add(listener);
    return () => notificationListeners.delete(listener);
  }

  function setUser(user: AdminUser | null) {
    state.user = user;
    userListeners.forEach((listener) => listener(state.user));
  }

  function setWarningMessage(message: string | null) {
    state.warningMessage = message;
    messageListeners.forEach((listener) => listener(state.warningMessage));
  }

  function setNotification(message: string | null) {
    state.notification = message;
    notificationListeners.forEach((listener) => listener(state.notification));
  }

  const getState = () => ({ ...state });

  return {
    onUserChange,
    onMessageChange,
    onNotificationChange,
    setUser,
    setWarningMessage,
    setNotification,
    getState,
  };
}
