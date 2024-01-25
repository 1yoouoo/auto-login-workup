function handleLogin() {
  try {
    chrome.storage.sync.get({ autoLoginEnabled: true }, (result) => {
      if (result.autoLoginEnabled) {
        chrome.storage.sync.get(["username", "password"], (credentials) => {
          if (credentials.username && credentials.password) {
            const usernameField = document.querySelector(
              "#userId"
            ) as HTMLInputElement;
            const passwordField = document.querySelector(
              "#passWord"
            ) as HTMLInputElement;
            const loginButton = document.querySelector(
              "#btnLogin"
            ) as HTMLButtonElement;

            if (usernameField && passwordField && loginButton) {
              usernameField.value = credentials.username;
              passwordField.value = credentials.password;
              loginButton.click();
            } else {
              console.error("로그인 폼을 찾을 수 없습니다.");
            }
          }
        });
      }
    });
  } catch (error) {
    console.error("Storage error");
  }
}

if (window.location.href.includes("https://hr.workup.plus/")) {
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    handleLogin();
  } else {
    document.addEventListener("DOMContentLoaded", handleLogin);
  }
}
