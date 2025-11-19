import { clients } from '@/lib/https';

class BookingService {
  async captchaVerification(code: string) {
    const url = `/captcha/v1/Captcha/Verify?VerificationCode
=${code}&ConfigurationName=reCaptcha-v2-checkbox`;
    return clients.get<any>(url);
  }
}

export const bookingService = new BookingService();
