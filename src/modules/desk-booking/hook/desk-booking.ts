import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../services/booking.service';

export const useCaptchaVerification = (code: string) => {
  return useQuery({
    queryKey: ['captcha-verification', code],
    queryFn: () => bookingService.captchaVerification(code),
    enabled: !!code,
    refetchOnMount: 'always',
  });
};
export const useGetRole = () => {
  return useQuery({
    queryKey: ['user-role'],
    queryFn: () => bookingService.getRole(),
    refetchOnMount: 'always',
  });
};
