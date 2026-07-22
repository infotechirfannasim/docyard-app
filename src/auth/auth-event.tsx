// auth/auth-events.ts
type LogoutListener = () => void;

let logoutListener: LogoutListener | null = null;

export function registerLogoutHandler(handler: LogoutListener) {
  logoutListener = handler;
}

export function triggerLogout() {
  if (logoutListener) {
    logoutListener();
  } else {
    console.warn("No logout handler registered");
  }
}