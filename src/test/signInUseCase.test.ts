import { expect } from "chai";
import { fakeAuthProvider } from "../infra/fakeAuthProvider";
import { configureAdminApp } from "../core/configureAdminApp";
import { selectAdimnUser, selectWarningMessage } from "../core/selectors";
import { onUserSignInUseCase } from "../core/usecases/signInUseCase";

describe("Sign In Use Case", () => {
  const enabledUsers = [
    {
      user: {
        uid: "rt4-5eiug-uyt5",
        email: "leoquiroga@gmail.com",
        username: "Leo Quiroga",
        photoUrl: "https://potho-leo.io",
      },
      credentials: {
        email: "leoquiroga@gmail.com",
        password: "leo2022",
      },
      id: "Oi6-kjG76-mA9",
    },
    {
      user: {
        uid: "n98-poh7t-98u",
        username: "Vasco Indaburu",
        email: "indabumotorstore@gmail.com",
        photoUrl: "https://potho-vasco.io",
      },
      credentials: {
        email: "indabumotorstore@gmail.com",
        password: "store2022",
      },
      id: "We4-08Yuh65-ñl34",
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
    const expectedAdminUser = enabledUsers[0].user;

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
    const expectedAdminUser = enabledUsers[0].user;

    const adminUser = selectAdimnUser(adminApp);

    expect(adminUser).to.deep.equal(expectedAdminUser);
  });
});
