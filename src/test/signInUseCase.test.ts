import { expect } from "chai";
import {
  configureAdminApp,
  fakeAuthProvider,
  onUserSignInUseCase,
  selectAdimnUser,
  selectWarningMessage,
} from "../signInUseCase";

describe("Sign In Use Case", () => {
  const enabledUsers = [
    {
      uid: "rt4-5eiug-uyt5",
      email: "leoquiroga@gmail.com",
      username: "Leo Quiroga",
      password: "leo2022",
      photoUrl: "https://potho-leo.io",
    },
    {
      uid: "n98-poh7t-98u",
      username: "Vasco Indaburu",
      email: "indabumotorstore@gmail.com",
      password: "store2022",
      photoUrl: "https://potho-vasco.io",
    },
  ];
  const validCredentetials = {
    email: "leoquiroga@gmail.com",
    password: "leo2022",
  };
  const invalidCredentials = {
    email: "nonenabled@gmail.com",
    password: "blablebli",
  };

  it("should logged-in a user that already exist in the list of enabled users", () => {
    // given an auth provider that already has a user enabled
    const authProvider = fakeAuthProvider({
      enabledUsers,
    });

    // given an admin-app without a logged-in user
    const adminApp = configureAdminApp({ authProvider });

    // expected result
    const expectedAdminUser = {
      uid: enabledUsers[0].uid,
      email: enabledUsers[0].email,
      username: enabledUsers[0].username,
      photoUrl: enabledUsers[0].photoUrl,
    };

    // use case
    onUserSignInUseCase(adminApp, authProvider, validCredentetials);

    adminApp.onUserChange((adminUser) => {
      expect(adminUser).to.deep.equal(expectedAdminUser);
    });
  });

  it("should inform the user that he/she does not have permission to log in", () => {
    // given an auth provider that already has a user enabled
    const authProvider = fakeAuthProvider({
      enabledUsers,
    });

    // given an admin-app without a logged-in user
    const adminApp = configureAdminApp({ authProvider });

    // expected result
    const expectedAdminUser = null;
    const expectedMessage =
      "You do not have permission to enter the application. Check your email and password.";

    // use case
    onUserSignInUseCase(adminApp, authProvider, invalidCredentials);

    adminApp.onMessageChange((warningMessage) => {
      const adminUser = selectAdimnUser(adminApp);

      expect(adminUser).to.deep.equal(expectedAdminUser);
      expect(warningMessage).to.equal(expectedMessage);
    });
  });

  it("should inform the user that something has gona wrong with the connection", async () => {
    // given an auth provider that is offline
    const authProvider = fakeAuthProvider({
      enabledUsers,
      offline: true,
    });

    // given an admin-app without a logged-in user
    const adminApp = configureAdminApp({ authProvider });

    // expected result
    const expectedAdminUser = null;
    const expectedMessage =
      "Something went wrong with the connection. Please try again in a few minutes.";

    // use case
    await onUserSignInUseCase(adminApp, authProvider, validCredentetials);

    const adminUser = selectAdimnUser(adminApp);
    const warningMessage = selectWarningMessage(adminApp);

    expect(adminUser).to.deep.equal(expectedAdminUser);
    expect(warningMessage).to.equal(expectedMessage);
  });

  it("should resume the session where it left off last time", () => {
    // given an auth provider that holds a user logged on
    const authProvider = fakeAuthProvider({
      enabledUsers,
      hasLoggedUser: validCredentetials,
    });

    // given the admin-app starts
    const adminApp = configureAdminApp({ authProvider });

    // expected result
    const expectedAdminUser = {
      uid: enabledUsers[0].uid,
      email: enabledUsers[0].email,
      username: enabledUsers[0].username,
      photoUrl: enabledUsers[0].photoUrl,
    };

    const adminUser = selectAdimnUser(adminApp);

    expect(adminUser).to.deep.equal(expectedAdminUser);
  });
});
