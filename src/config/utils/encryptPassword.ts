import bcrypt from 'bcrypt';

export const encryptPassword = (password: string): string => {
  const response = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

  return response;
};

export const comparePassword = (
  currentPassword: string,
  password: string
): boolean => {
  const isMatch = bcrypt.compareSync(currentPassword, password);

  return isMatch;
};
