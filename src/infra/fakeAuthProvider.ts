import { AuthProvider } from "../core/AuthProvider";
import {
  AuthError,
  AuthMessages,
  ConnectionError,
  ConnectionMessages,
} from "../core/exceptions/exceptions";
import { AdminUser, Credentials } from "../core/User";

type AdminAccount = { user: AdminUser; credentials: Credentials; id: string };

type FakeProviderConfig = {
  enabledUsers: AdminAccount[];
  offline?: boolean;
  hasLoggedUser?: Credentials;
};

export function fakeAuthProvider(config: FakeProviderConfig): AuthProvider {
  const { enabledUsers, offline = false, hasLoggedUser } = config;

  let loggedUser: AdminUser | null = null;

  if (hasLoggedUser) {
    setLoggedUser(getValidUser(hasLoggedUser));
  }

  const loggedUserListeners: Set<(user: AdminUser | null) => void> = new Set();

  function onLoggedUserChange(listener: (user: AdminUser | null) => void) {
    loggedUserListeners.add(listener);
    listener(loggedUser);
    return () => loggedUserListeners.delete(listener);
  }

  function setLoggedUser(user: AdminUser | null) {
    loggedUser = user;
    loggedUserListeners?.forEach((listener) => listener(loggedUser));
  }

  function findAccountByEmail(email: string) {
    return enabledUsers.find((acount) => email === acount.credentials.email);
  }

  function getValidUser(credentials: Credentials) {
    const { email: emailToCheck, password: passToCheck } = credentials;
    const validAccount = findAccountByEmail(emailToCheck);
    if (validAccount && passToCheck === validAccount.credentials.password) {
      return validAccount.user;
    }
    throw new Error("bad credentials");
  }

  function signInWithCredentials(credentials: Credentials) {
    return new Promise<AdminUser>((resolve, reject) => {
      if (offline) {
        reject(new ConnectionError(ConnectionMessages.OFFLINE_SERVER));
      } else {
        try {
          const validUser = getValidUser(credentials);
          setLoggedUser(validUser);
          resolve(validUser);
        } catch (error) {
          if (error instanceof Error && error.message === "bad credentials") {
            reject(new AuthError(AuthMessages.INVALID_CREDENTIALS));
          }
        }
      }
    });
  }

  function signOut() {
    return new Promise<void>((resolve, reject) => {
      if (offline) {
        reject(new ConnectionError(ConnectionMessages.OFFLINE_SERVER));
      } else {
        setLoggedUser(null);
        resolve();
      }
    });
  }

  return {
    onLoggedUserChange,
    signInWithCredentials,
    signOut,
  };
}
