export interface PasswordValidationResult {
  valid: boolean;
  message: string;
  rules: {
    minLength: boolean; // >= 8 ký tự
    hasUpper: boolean;   // Chữ cái in hoa (A-Z)
    hasNumber: boolean;  // Số (0-9)
    hasSpecial: boolean; // Ký tự đặc biệt (như @, #, $, %, ...)
  };
}

export function validatePassword(password: string): PasswordValidationResult {
  const pwd = typeof password === 'string' ? password : '';
  const minLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pwd);

  const valid = minLength && hasUpper && hasNumber && hasSpecial;

  let message = 'Mật khẩu hợp lệ';
  if (!minLength) {
    message = 'Mật khẩu phải có tối thiểu 8 ký tự';
  } else if (!hasUpper) {
    message = 'Mật khẩu phải chứa ít nhất 1 chữ cái in hoa (A-Z)';
  } else if (!hasNumber) {
    message = 'Mật khẩu phải chứa ít nhất 1 chữ số (0-9)';
  } else if (!hasSpecial) {
    message = 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (ví dụ: @, #, $, %, !)';
  }

  return {
    valid,
    message,
    rules: {
      minLength,
      hasUpper,
      hasNumber,
      hasSpecial
    }
  };
}
