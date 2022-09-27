import { AdminApp } from "../AdminApp";
import { AuthProvider } from "../AuthProvider";
import { ConnectionError, ConnectionMessages } from "../exceptions/exceptions";
import { NotificationMessages } from "../notifications/messages";

export function onUserSignOutUseCase(
  app: AdminApp,
  authProvider: AuthProvider
) {
  return authProvider.signOut().then(onfulfilled, onrejected);

  function onfulfilled() {
    app.setNotification(NotificationMessages.SUCCESSFULLY_LOGOUT);
    return "ok";
  }

  function onrejected(reason: ConnectionError) {
    if (reason.message === ConnectionMessages.OFFLINE_SERVER) {
      app.setWarningMessage("Connection Error!!. You have not logged out.");
    }
    return "fail";
  }
}
