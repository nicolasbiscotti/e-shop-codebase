type AuthorizationResult = {
  user: AdminUser | null;
};
type AuthListener = (authResult: AuthorizationResult) => void;

type AdminUser = {
  username: string;
  email: string;
  photoUrl: string;
};

type AppState = { user: AdminUser | null };

type AppConfig = {
  initialState?: AppState;
  authProvider: AuthProvider;
};

type FakeProviderConfig = {
  enabledUsers?: AdminUser[];
  requestSignInFor: string;
};

interface AuthProvider {
  addAuthStateListener: (listener: AuthListener) => void;
  signInUser: () => void;
}

interface AdminApp {
  getState: () => AppState;
}

export function configureAdminApp(config: AppConfig): AdminApp {
  const state: AppState = config.initialState || { user: null };

  const onAuthSateChange = (authResult: AuthorizationResult) => {
    const { user } = authResult;
    setUser(user);
  };

  config.authProvider.addAuthStateListener(onAuthSateChange);

  const setUser = (user: AdminUser | null) => {
    state.user = user;
  };
  const getState = () => ({ ...state });

  return {
    getState,
  };
}

export function onUserSignInUseCase(authProvider: AuthProvider) {
  authProvider.signInUser();
}

export function selectAdimnUser(app: AdminApp): AdminUser | null {
  return app.getState().user;
}

export function fakeAuthProvider(config: FakeProviderConfig): AuthProvider {
  const email = config.requestSignInFor;
  const authStateListeners = new Array<AuthListener>();

  function authorizeUserByEmail(emailToAuthorize: string): AuthorizationResult {
    const user = config.enabledUsers?.find(
      (enableUser) => enableUser.email === emailToAuthorize
    );
    if (user) {
      return { user };
    }
    return { user: null };
  }

  function addAuthStateListener(authListener: AuthListener) {
    authStateListeners.push(authListener);
  }

  function signInUser() {
    const result = authorizeUserByEmail(email);
    authStateListeners.forEach((listener) => listener(result));
  }

  return {
    addAuthStateListener,
    signInUser,
  };
}
