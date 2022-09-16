import { expect } from "chai";
import {
  configureAdminApp,
  fakeAuthProvider,
  onUserSignInUseCase,
  selectAdimnUser,
} from "../signInUseCase";

describe("Sign In with Google Use Case", () => {
  const anAdminUser = {
    username: "Leo Quiroga",
    email: "leoquiroga@gmail.com",
    photoUrl: "https://potho-leo.io",
  };

  it("Should logged-in a user that already exist in the list of enabled users", () => {
    // given a google provider that already has a user enabled
    // and the admin will sign in with that user
    const authProvider = fakeAuthProvider({
      enabledUsers: [anAdminUser],
      requestSignInFor: anAdminUser.email,
    });

    // given an admin-app without a logged-in user
    const adminApp = configureAdminApp({
      authProvider: authProvider,
    });

    // expected result
    const expectedAdminUser = anAdminUser;

    // use case
    onUserSignInUseCase(authProvider);

    const adminUser = selectAdimnUser(adminApp);

    expect(adminUser).to.deep.equal(expectedAdminUser);
  });
});
