import { AdminApp } from "../AdminApp";
import { AuthProvider } from "../AuthProvider";
import {
  AuthError,
  AuthMessages,
  ConnectionError,
  ConnectionMessages,
} from "../exceptions/exceptions";
import { Credentials } from "../User";

const WarningMessages = {
  INVALID_CREDENTIALS:
    "You do not have permission to enter the application. Check your email and password.",
  OFFLINE_SERVER:
    "Something went wrong with the connection. Please try again in a few minutes.",
};

// this function is a command, it does not return any relevant results.
export function onUserSignInUseCase(
  app: AdminApp,
  authProvider: AuthProvider,
  crendentials: Credentials
) {
  return authProvider
    .signInWithCredentials(crendentials)
    .then(onfulfilled, onrejected);

  function onfulfilled() {
    return "ok";
  }

  function onrejected(reason: AuthError | ConnectionError) {
    if (reason.message === AuthMessages.INVALID_CREDENTIALS) {
      app.setWarningMessage(WarningMessages.INVALID_CREDENTIALS);
    }
    if (reason.message === ConnectionMessages.OFFLINE_SERVER) {
      app.setWarningMessage(WarningMessages.OFFLINE_SERVER);
    }
    return "fail";
  }
}
