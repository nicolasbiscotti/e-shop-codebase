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

export async function onUserSignInUseCase(
  app: AdminApp,
  authProvider: AuthProvider,
  crendentials: Credentials
) {
  try {
    const user = await authProvider.signInWithCredentials(crendentials);
    app.setUser(user);
  } catch (error) {
    // handle potential errors
    app.setWarningMessage(
      "You do not have permission to enter the application. Check your email and password."
    );
  }
}

export function selectAdimnUser(app: AdminApp): AdminUser | null {
  return app.getState().user;
}
export function selectWarningMessage(app: AdminApp): string | null {
  return app.getState().warningMessage;
}

export function fakeAuthProvider(config: FakeProviderConfig): AuthProvider {
  const { enabledUsers } = config;

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
    throw new AuthError("auth/credentials are invalid");
  }

  async function signInWithCredentials(credentials: Credentials) {
    try {
      const validAccount = getValidUser(credentials);
      return Promise.resolve(validAccount);
    } catch (error) {
      return Promise.reject({ message: "auth/credentials are invalid" });
    }
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
