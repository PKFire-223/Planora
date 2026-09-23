import nodemailer from 'nodemailer';

export interface SendResetEmailParams {
  toEmail: string;
  userName: string;
  resetCode: string;
  expiresInMinutes: number;
}

export interface SendResetEmailResult {
  success: boolean;
  message: string;
  messageId?: string;
  previewUrl?: string | false;
  isRealSmtp: boolean;
}

let cachedTestAccount: nodemailer.TestAccount | null = null;

/**
 * Creates nodemailer transport based on environment variables or Ethereal test inbox
 */
async function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const service = process.env.SMTP_SERVICE; // e.g. 'gmail'

  // 1. If custom SMTP or Gmail credentials exist
  if (user && pass) {
    if (service) {
      return {
        transporter: nodemailer.createTransport({
          service,
          auth: { user, pass }
        }),
        isRealSmtp: true,
        fromEmail: process.env.EMAIL_FROM || user
      };
    }

    if (host) {
      return {
        transporter: nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass }
        }),
        isRealSmtp: true,
        fromEmail: process.env.EMAIL_FROM || `Planora LMS <${user}>`
      };
    }
  }

  // 2. Automated Ethereal account for testing when SMTP not yet configured
  try {
    if (!cachedTestAccount) {
      cachedTestAccount = await nodemailer.createTestAccount();
    }
    const testAccount = cachedTestAccount;
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    return {
      transporter,
      isRealSmtp: false,
      fromEmail: `Planora LMS Security <${testAccount.user}>`
    };
  } catch (err: any) {
    console.warn('[EmailService] Could not create Ethereal account, using stream transport:', err.message);
    const transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });
    return {
      transporter,
      isRealSmtp: false,
      fromEmail: 'Planora LMS <security@planora.edu.vn>'
    };
  }
}

/**
 * Sends real email with password reset OTP code
 */
export async function sendPasswordResetEmail(params: SendResetEmailParams): Promise<SendResetEmailResult> {
  const { toEmail, userName, resetCode, expiresInMinutes } = params;

  try {
    const { transporter, isRealSmtp, fromEmail } = await getTransporter();

    const mailOptions = {
      from: fromEmail,
      to: toEmail,
      subject: `[Planora LMS] Mã Xác Nhận Đặt Lại Mật Khẩu: ${resetCode}`,
      text: `Xin chào ${userName},\n\nBạn đã yêu cầu đặt lại mật khẩu cho tài khoản tại Planora LMS.\nMã xác nhận OTP của bạn là: ${resetCode}\n\nMã này có hiệu lực trong vòng ${expiresInMinutes} phút.\nNếu bạn không yêu cầu hành động này, vui lòng bỏ qua email.\n\nTrân trọng,\nĐội ngũ Planora LMS`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
            .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            .header { background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
            .content { padding: 32px 24px; }
            .otp-box { background: #f1f5f9; border: 2px dashed #6366f1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
            .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4338ca; font-family: monospace; }
            .badge { display: inline-block; padding: 4px 12px; background: #e0e7ff; color: #3730a3; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
            .footer { background: #f8fafc; padding: 20px 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Planora LMS</h1>
              <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">Bảo Mật & Khôi Phục Tài Khoản</p>
            </div>
            <div class="content">
              <span class="badge">Xác Thực An Toàn</span>
              <h2 style="font-size: 18px; margin: 0 0 12px 0; color: #0f172a;">Xin chào, ${userName}!</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 16px 0;">
                Hệ thống nhận được yêu cầu đặt lại mật khẩu cho tài khoản Planora liên kết với email <strong>${toEmail}</strong>.
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0;">
                Vui lòng sử dụng mã OTP 6 chữ số dưới đây để hoàn tất việc thiết lập mật khẩu mới:
              </p>
              
              <div class="otp-box">
                <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; margin-bottom: 6px;">MÃ XÁC NHẬN CỦA BẠN</div>
                <div class="otp-code">${resetCode}</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 8px;">Hiệu lực trong vòng <strong>${expiresInMinutes} phút</strong></div>
              </div>

              <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px; font-size: 12px; color: #92400e; line-height: 1.5;">
                ⚠️ <strong>Quy định mật khẩu mới:</strong> Phải chứa tối thiểu 8 ký tự, ít nhất 1 chữ cái in hoa (A-Z), 1 chữ số (0-9) và 1 ký tự đặc biệt (ví dụ: @, #, $, %).
              </div>

              <p style="font-size: 12px; line-height: 1.5; color: #94a3b8; margin: 20px 0 0 0;">
                Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email. Tài khoản của bạn vẫn được bảo mật an toàn.
              </p>
            </div>
            <div class="footer">
              © ${new Date().getFullYear()} Planora LMS Platform v1.5. Hệ thống Quản lý Học tập Cá nhân Thông minh.
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);

    console.log(`[EmailService] 📧 Email đã được gửi thành công tới: ${toEmail}`);
    console.log(`[EmailService] 🔑 Mã OTP khôi phục: [ ${resetCode} ]`);
    if (previewUrl) {
      console.log(`[EmailService] 🔗 Link xem hòm thư ảo Ethereal: ${previewUrl}`);
    }

    return {
      success: true,
      message: `Đã gửi mã xác nhận 6 số đến email ${toEmail}`,
      messageId: info.messageId,
      previewUrl,
      isRealSmtp
    };
  } catch (error: any) {
    console.error('[EmailService] ❌ Lỗi gửi email:', error);
    return {
      success: false,
      message: `Lỗi gửi email: ${error?.message || 'Không thể kết nối máy chủ gửi thư'}`,
      isRealSmtp: false
    };
  }
}
