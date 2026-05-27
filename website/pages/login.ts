import { send } from "clientUtilities";

const usernameInput = document.querySelector<HTMLInputElement>("#usernameInput")!;
const passwordInput = document.querySelector<HTMLInputElement>("#passwordInput")!;
const submitButton = document.querySelector<HTMLButtonElement>("#submitButton")!;
const errorDiv = document.querySelector<HTMLDivElement>("#errorDiv")!;

submitButton.onclick = async function () {

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  errorDiv.innerText = "";

  if (!username) {
    errorDiv.innerText = "Please enter a username.";
    return;
  }

  if (!password) {
    errorDiv.innerText = "Please enter a password.";
    return;
  }

  const token = await send<string | null>(
    "logIn",
    username,
    password
  );

  if (token === null) {
    errorDiv.innerText = "Wrong username or password.";
    return;
  }

  localStorage.setItem("userToken", token);

  // מעבר ל־index.html אחרי התחברות
  location.href = "index.html";
};