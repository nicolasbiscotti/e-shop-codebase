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
  initialState?: AppState;
  authProvider?: AuthProvider;
};

type FakeProviderConfig = {
  enabledUsers: AdimAccount[];
  offline?: boolean;
};

interface AuthProvider {
  signInWithCredentials: (credentials: Credentials) => Promise<AdminUser>;
}

interface AdminApp {
  setUser: (user: AdminUser) => void;
  setWarningMessage: (message: string) => void;
  getState: () => AppState;
}

export function configureAdminApp(config?: AppConfig): AdminApp {
  const initialState = { user: null, warningMessage: null };
  const state: AppState = config?.initialState || initialState;

  const setUser = (user: AdminUser) => {
    state.user = user;
  };

  const setWarningMessage = (message: string) => {
    state.warningMessage = message;
  };

  const getState = () => ({ ...state });

  return {
    setUser,
    setWarningMessage,
    getState,
  };
}

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

  function onrejected(reason: AuthError | ConecctionError) {
    if (reason.message === "auth/credentials are invalid") {
      app.setWarningMessage(
        "You do not have permission to enter the application. Check your email and password."
      );
    }
    if (reason.message === "connection/server is offline") {
      app.setWarningMessage(
        "Something went wrong with the connection. Please try again in a few minutes."
      );
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
  const { enabledUsers, offline = false } = config;

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
        reject(new ConecctionError("connection/server is offline"));
      }
      try {
        const validUser = getValidUser(credentials);
        resolve(validUser);
      } catch (error) {
        if (error instanceof Error && error.message === "bad credentials") {
          reject(new AuthError("auth/credentials are invalid"));
        }
      }
    });
  }

  return {
    signInWithCredentials,
  };
}

class AuthError extends Error {
  constructor(message: string) {
    super(message);
  }
}
class ConecctionError extends Error {
  constructor(message: string) {
    super(message);
  }
}
