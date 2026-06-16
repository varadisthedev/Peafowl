const defaultLoginMessage =
  "Unable to sign in right now. Please check your details and try again.";
const defaultRegisterMessage =
  "Unable to create your account right now. Please try again.";

function getLoginMessageForCode(code) {
  switch (code) {
    case "ACCOUNT_NOT_FOUND":
      return "No account was found for that email address.";
    case "INVALID_CREDENTIALS":
      return "Incorrect password. Please try again.";
    case "MISSING_LOGIN_FIELDS":
      return "Email and password are required.";
    case "SERVER_ERROR":
      return defaultLoginMessage;
    default:
      return null;
  }
}

function getRegisterMessageForCode(code) {
  switch (code) {
    case "MISSING_REGISTRATION_FIELDS":
      return "Username, email, and password are required.";
    case "EMAIL_ALREADY_EXISTS":
      return "That email is already registered. Try logging in instead.";
    case "USERNAME_ALREADY_EXISTS":
      return "That username is already taken. Please choose another one.";
    case "DUPLICATE_FIELD":
      return "That account already exists. Please use different details.";
    case "SERVER_ERROR":
      return defaultRegisterMessage;
    default:
      return null;
  }
}

export function getLoginErrorMessage(error) {
  const code = error?.response?.data?.code;
  return (
    getLoginMessageForCode(code) ||
    error?.response?.data?.message ||
    defaultLoginMessage
  );
}

export function getRegisterErrorMessage(error) {
  const code = error?.response?.data?.code;
  return (
    getRegisterMessageForCode(code) ||
    error?.response?.data?.message ||
    defaultRegisterMessage
  );
}
