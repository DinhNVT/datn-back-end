import validator from "validator";

export const isPasswordValid = (password) => {
  // Check password length from 8 to 50 characters
  if (!validator.isLength(password, { min: 8, max: 50 })) {
    return false;
  }

  // Check password contains special characters
  if (!/[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(password)) {
    return false;
  }

  // Check password contains at least one uppercase character
  if (!/[A-Z]/.test(password)) {
    return false;
  }

  // Check password contains at least one lowercase character
  if (!/[a-z]/.test(password)) {
    return false;
  }

  // Check password contains at least one number
  if (!/[0-9]/.test(password)) {
    return false;
  }

  return true;
};

export const isEmailValid = (email) => {
  return validator.isEmail(email);
};

// export const isFullNameValid = (fullName) => {
//   // Convert fullName to string and remove extra spaces
//   fullName = validator.trim(validator.toString(fullName));

//   // Check length of fullName from 3 to 100 characters
//   if (!validator.isLength(fullName, { min: 3, max: 100 })) {
//     return false;
//   }

//   // Check fullName contains only alphanumeric characters and spaces
//   if (!validator.matches(fullName, /^[a-zA-Z\s]+$/)) {
//     return false;
//   }

//   return true;
// };

export const isFullNameValid = (fullName) => {
  return (
    validator.isLength(fullName, { min: 2, max: 100 }) &&
    validator.matches(fullName, /^[a-zA-ZÀ-ỹ ]+$/)
  );
};

export const capitalizeFirstName = (fullName) => {
  const names = fullName.trim().split(' ');
  const capitalizedNames = names.map(name => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase());
  return capitalizedNames.join(' ');
}
