export enum AppErrorMessages {
  //General
  ERROR = "Error",
  INTERNAL_SERVER_ERROR = "Internal server error",
  TOKEN_MISSING = "Token missing!",
  INVALID_TOKEN = "Invalid token!",
  ACCESS_DENIED_NOT_LOGGED = "Access Denied: You must be logged in",
  ACCESS_DENIED_HAS_NO_PERMISSION = "Access Denied: You do not have permission to perform this action",

  //Account
  ROLE_ALREADY_EXISTS = "Role already exists!",
  GENDER_ALREADY_EXISTS = "Gender already exists!",
  GENDER_NOT_FOUND = "Gender not found!",
  STATE_ALREADY_EXISTS = "State already exists!",
  STATE_NOT_FOUND = "State not found!",
  CITY_ALREADY_EXISTS = "City already exists!",
  CITY_NOT_FOUND = "City not found!",
  NEIGHBORHOOD_ALREADY_EXISTS = "Neighborhood already exists!",
  NEIGHBORHOOD_NOT_FOUND = "Neighborhood not found!",
  USER_ADDRESS_NOT_FOUND = "Address not found!",
  USER_INVALID_AGE = "User age must be between 18 and 120",
  USER_PHONE_ALREADY_EXISTS = "Phone already exists!",
  USER_PHONE_ALREADY_IN_USE = "Phone already in use",
  USER_PHONE_NOT_FOUND = "Phone not found!",
  USER_ALREADY_EXISTS = "User already exists",
  USER_NOT_FOUND = "User not found",
  USER_INCORRECT_PASSWORD = "Incorrect password",
  USER_EMAIL_ALREADY_IN_USE = "Email already in use",

  //Auth
  INCORRECT_EMAIL_OR_PASSWORD = "Incorrect email or password",
  REFRESH_TOKEN_NOT_FOUND = "Refresh token not found",
  REFRESH_TOKEN_INVALID = "Invalid refresh token",
}
