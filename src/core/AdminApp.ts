import { AdminUser } from "./User";

export type AppState = {
  user: AdminUser | null;
  warningMessage: string | null;
  notification: string | null;
};

export interface AdminApp {
  setUser: (user: AdminUser) => void;
  setWarningMessage: (message: string) => void;
  setNotification: (message: string) => void;
  onUserChange: (listener: (user: AdminUser | null) => void) => () => void;
  onMessageChange: (listener: (message: string | null) => void) => () => void;
  onNotificationChange: (
    listener: (message: string | null) => void
  ) => () => void;
  getState: () => AppState;
}
