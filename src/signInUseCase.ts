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
  hasLoggedInUser?: Credentials;
};

interface AuthProvider {
  signInWithCredentials: (credentials: Credentials) => Promise<AdminUser>;
  getLoggedInUser: () => AdminUser | null;
}

interface AdminApp {
  setUser: (user: AdminUser) => void;
  setWarningMessage: (message: string) => void;
  getState: () => AppState;
}

export function configureAdminApp(config: AppConfig): AdminApp {
  const { authProvider } = config;
  const initialState = { user: null, warningMessage: null };
  const state: AppState = initialState;

  setUser(authProvider.getLoggedInUser());

  function setUser(user: AdminUser | null) {
    state.user = user;
  }

  function setWarningMessage(message: string) {
    state.warningMessage = message;
  }

  const getState = () => ({ ...state });

  return {
    setUser,
    setWarningMessage,
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

  function onfulfilled(user: AdminUser) {
    app.setUser(user);
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
  const { enabledUsers, offline = false, hasLoggedInUser = null } = config;

  let loggedInUser: AdminUser | null = null;

  if (hasLoggedInUser) {
    setLoggedInUser(getValidUser(hasLoggedInUser));
  }

  function setLoggedInUser(user: AdminUser | null) {
    loggedInUser = user;
  }
  function getLoggedInUser() {
    return loggedInUser;
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
      }
      try {
        const validUser = getValidUser(credentials);
        resolve(validUser);
      } catch (error) {
        if (error instanceof Error && error.message === "bad credentials") {
          reject(new AuthError(AuthMessages.INVALID_CREDENTIALS));
        }
      }
    });
  }

  return {
    signInWithCredentials,
    getLoggedInUser,
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
