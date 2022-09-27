export class AuthError extends Error {
  constructor(message: string) {
    super(message);
  }
}
export const AuthMessages = {
  INVALID_CREDENTIALS: "auth/credentials are invalid",
};

export class ConnectionError extends Error {
  constructor(message: string) {
    super(message);
  }
}
export const ConnectionMessages = {
  OFFLINE_SERVER: "connection/server is offline",
};
