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
import { useAuthStore } from '@/state/store/auth';
import API_CONFIG from '@/config/api';
import { useMutation } from '@apollo/client';
import { UPDATE_RESERVATION } from '../services/desk-booking';

interface BookChairProps {
  itemId: string;
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation;
}

const siteKey = import.meta.env.VITE_CAPTCHA_SITE_KEY;

// Update mutation

export function getTargetUtcTime(): string {
  const now = new Date();

  // Define today's 10:30 AM
  const today1030 = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 10, 30)
  );

  // Define today's 22:30
  let target = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 22, 30)
  );

  // If current time is after 10:30, move target to next day
  if (now.getTime() >= today1030.getTime()) {
    target = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 22, 30)
    );
  }

  return target.toISOString(); // Final UTC timestamp
}

export const BookChair = ({ itemId, isOpen, onClose, reservation }: BookChairProps) => {
  const { captcha, code, reset } = useCaptcha({
    siteKey: siteKey,
    type: 'reCaptcha-v2-checkbox',
  });
  const { isLoading } = useCaptchaVerification(code);

  const accessToken = useAuthStore((state) => state.accessToken);
  const BLOCKS_KEY = API_CONFIG.blocksKey;

  const [updateReservation, { loading: isUpdating }] = useMutation(UPDATE_RESERVATION);

  const handleConfirmBooking = () => {
    if (!code) return;

    const filter = JSON.stringify({
      _id: itemId,
    });

    const input = {
      endTime: getTargetUtcTime(),
    };

    updateReservation({
      variables: {
        filter,
        input,
      },
      context: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'x-blocks-key': BLOCKS_KEY,
        },
      },
      onCompleted: () => {
        onClose();
        reset();
      },
      onError: (error) => {
        console.error('Error updating reservation:', error);
      },
    });
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
          <Button onClick={handleConfirmBooking} disabled={!code || isLoading || isUpdating}>
            {isUpdating ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
