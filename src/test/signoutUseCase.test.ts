import { expect } from "chai";
import { AdminApp, AppState } from "../core/AdminApp";
import { AuthProvider } from "../core/AuthProvider";
import { configureAdminApp } from "../core/configureAdminApp";
import {
  selectAdimnUser,
  selectNotification,
  selectWarningMessage,
} from "../core/selectors";
import { onUserSignOutUseCase } from "../core/usecases/signOutUseCase";
import { fakeAuthProvider } from "../infra/fakeAuthProvider";

describe("Sign Out Use Case", () => {
  const adminUserWithValidCredentials = {
    user: {
      uid: "02qW-OI89yt-8jU",
      username: "leoquiroga",
      email: "leoquiroga@gmail.com",
      photoUrl: "https://leosphotourl.google.com",
    },
    credentials: {
      email: "leoquiroga@gmail.com",
      password: "leo2022",
    },
    id: "Ui8o-08ByhR-o67",
  };

  const potentialUserWithoutValidCredentials = {
    credentials: {
      email: "blablebli@gmail.com",
      password: "1234",
    },
  };

  const enabledUsers = [adminUserWithValidCredentials];

  let authProvider: AuthProvider;
  let adminApp: AdminApp;

  beforeEach(() => {
    authProvider = fakeAuthProvider({
      enabledUsers,
      hasLoggedUser: adminUserWithValidCredentials.credentials,
    });
    adminApp = configureAdminApp({ authProvider });
  });

  it("should log the user out and notify the user of this fact", async () => {
    const expectedAdminUser = null;
    const expectedNotification = "You have successfully logged out.";

    await onUserSignOutUseCase(adminApp, authProvider);

    const currentUser = selectAdimnUser(adminApp);
    const currentNotification = selectNotification(adminApp);

    expect(currentUser).to.deep.equal(expectedAdminUser);
    expect(currentNotification).equal(expectedNotification);
  });

  it("should warn the user that they are not logged out when the auth provider is offline", async () => {
    authProvider = fakeAuthProvider({
      enabledUsers,
      hasLoggedUser: adminUserWithValidCredentials.credentials,
      offline: true,
    });
    const initialState: AppState = {
      user: adminUserWithValidCredentials.user,
      warningMessage: null,
      notification: null,
    };
    adminApp = configureAdminApp({ authProvider, initialState });

    const expectedAdminUser = adminUserWithValidCredentials.user;
    const expectedMessage = "Connection Error!!. You have not logged out.";

    await onUserSignOutUseCase(adminApp, authProvider);

    const currentUser = selectAdimnUser(adminApp);
    const currentWarningMessage = selectWarningMessage(adminApp);

    expect(currentUser).to.deep.equal(expectedAdminUser);
    expect(currentWarningMessage).equal(expectedMessage);
  });
});
