export interface PasswordValidationResult {
  valid: boolean;
  message: string;
  rules: {
    minLength: boolean; // Minimum 8 characters
    hasUpper: boolean;   // Uppercase letter (A-Z)
    hasNumber: boolean;  // Number (0-9)
    hasSpecial: boolean; // Special character (@, #, $, %, etc.)
  };
}

export function validatePassword(password: string): PasswordValidationResult {
  const pwd = typeof password === 'string' ? password : '';
  const minLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pwd);

  const valid = minLength && hasUpper && hasNumber && hasSpecial;

  let message = 'Mật khẩu đạt tiêu chuẩn an toàn';
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
