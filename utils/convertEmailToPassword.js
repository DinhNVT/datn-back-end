export const convertEmailToPassword = (email) => {
  email = email.toLowerCase();
  email = email.replace(/\b\w/g, (char, index) => {
    if (index === 0) {
      return char.toUpperCase();
    }
    return char.toLowerCase();
  });
  email += "123";

  return email;
};
