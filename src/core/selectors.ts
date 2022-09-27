import { AdminApp } from "./AdminApp";
import { AdminUser } from "./User";

// these functions are queries, they never change the state of the appn,
// they only return the answer to a question.

export function selectAdimnUser(app: AdminApp): AdminUser | null {
  return app.getState().user;
}
export function selectWarningMessage(app: AdminApp): string | null {
  return app.getState().warningMessage;
}
export function selectNotification(app: AdminApp): string | null {
  return app.getState().notification;
}
