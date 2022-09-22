type Credentials = { email: string; password: string };

type AdminUser = {
  uid: string;
  username: string;
  email: string;
  photoUrl: string;
};
type AdimAccount = AdminUser & {
  password: string;
};

type AppState = { user: AdminUser | null; warningMessage: string | null };

type AppConfig = {
  authProvider: AuthProvider;
};

type FakeProviderConfig = {
  enabledUsers: AdimAccount[];
  offline?: boolean;
  hasLoggedUser?: Credentials;
};

interface AuthProvider {
  signInWithCredentials: (credentials: Credentials) => Promise<AdminUser>;
  onLoggedUserChange: (
    listener: (user: AdminUser | null) => void
  ) => () => void;
}

interface AdminApp {
  setUser: (user: AdminUser) => void;
  setWarningMessage: (message: string) => void;
  onUserChange: (listener: (user: AdminUser | null) => void) => () => void;
  onMessageChange: (listener: (message: string | null) => void) => () => void;
  getState: () => AppState;
}

export function configureAdminApp(config: AppConfig): AdminApp {
  const { authProvider } = config;
  const initialState = { user: null, warningMessage: null };
  const state: AppState = initialState;

  const unsuscribe = authProvider.onLoggedUserChange(setUser);

  const userListeners: Set<(user: AdminUser | null) => void> = new Set();
  const messageListeners: Set<(message: string | null) => void> = new Set();

  function onUserChange(listener: (user: AdminUser | null) => void) {
    userListeners.add(listener);
    listener(state.user);
    return () => userListeners.delete(listener);
  }

  function onMessageChange(listener: (message: string | null) => void) {
    messageListeners.add(listener);
    listener(state.warningMessage);
    return () => messageListeners.delete(listener);
  }

  function setUser(user: AdminUser | null) {
    state.user = user;
    userListeners?.forEach((listener) => listener(state.user));
  }

  function setWarningMessage(message: string | null) {
    state.warningMessage = message;
    messageListeners?.forEach((listener) => listener(state.warningMessage));
  }

  const getState = () => ({ ...state });

  return {
    setUser,
    setWarningMessage,
    onUserChange,
    onMessageChange,
    getState,
  };
}
const WarningMessages = {
  INVALID_CREDENTIALS:
    "You do not have permission to enter the application. Check your email and password.",
  OFFLINE_SERVER:
    "Something went wrong with the connection. Please try again in a few minutes.",
};

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

export function selectAdimnUser(app: AdminApp): AdminUser | null {
  return app.getState().user;
}
export function selectWarningMessage(app: AdminApp): string | null {
  return app.getState().warningMessage;
}

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
    return enabledUsers.find((user) => email === user.email);
  }

  function getValidUser(credentials: Credentials) {
    const { email: emailToCheck, password: passToCheck } = credentials;
    const existingAccount = findAccountByEmail(emailToCheck);
    if (existingAccount && existingAccount.password === passToCheck) {
      const validUser = {
        uid: existingAccount.uid,
        username: existingAccount.username,
        email: existingAccount.email,
        photoUrl: existingAccount.photoUrl,
      };
      return validUser;
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

  return {
    signInWithCredentials,
    onLoggedUserChange,
  };
}

class AuthError extends Error {
  constructor(message: string) {
    super(message);
  }
}
const AuthMessages = {
  INVALID_CREDENTIALS: "auth/credentials are invalid",
};
class ConnectionError extends Error {
  constructor(message: string) {
    super(message);
  }
}
const ConnectionMessages = {
  OFFLINE_SERVER: "connection/server is offline",
};
