import { AdminUser, Credentials } from "./User";

export interface AuthProvider {
  signInWithCredentials: (credentials: Credentials) => Promise<AdminUser>;
  signOut: () => Promise<void>;
  onLoggedUserChange: (
    listener: (user: AdminUser | null) => void
  ) => () => void;
}
