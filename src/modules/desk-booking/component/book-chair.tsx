import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui-kit/dialog';
import { Captcha, useCaptcha } from '@/components/core';
import { useCaptchaVerification } from '../hook/desk-booking';
import { Reservation } from './table';
import { Button } from '@/components/ui-kit/button';
import { useReservationCleanupAndUpdate } from './update_chair';

interface BookChairProps {
  itemId: string;
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation;
}

const siteKey = import.meta.env.VITE_CAPTCHA_SITE_KEY;

export const BookChair = ({ itemId, isOpen, onClose, reservation }: BookChairProps) => {
  const { captcha, code, reset } = useCaptcha({
    siteKey,
    type: 'reCaptcha-v2-checkbox',
  });

  const { isLoading: captchaLoading } = useCaptchaVerification(code);

  // ⭐ Our new hook
  const { cleanupAndUpdate, isUpdating } = useReservationCleanupAndUpdate();

  const handleConfirmBooking = async () => {
    if (!code) return;

    try {
      await cleanupAndUpdate(itemId);

      // Close modal & reset captcha
      onClose();
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book Chair</DialogTitle>
          <DialogDescription>
            You are booking {reservation.chair} at {reservation.Table}
          </DialogDescription>
        </DialogHeader>

        <Captcha {...captcha} />

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>

          <Button onClick={handleConfirmBooking} disabled={!code || captchaLoading || isUpdating}>
            {isUpdating ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
