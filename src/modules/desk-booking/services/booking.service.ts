import { clients } from '@/lib/https';

class BookingService {
  async captchaVerification(code: string) {
    const url = `/captcha/v1/Captcha/Verify?VerificationCode
=${code}&ConfigurationName=recaptcha`;
    return clients.get<any>(url);
  }
  async getRole() {
    const url = `/iam/v1/Resource/GetRoles`;
    return clients.get<any>(url);
  }
}

export const bookingService = new BookingService();
