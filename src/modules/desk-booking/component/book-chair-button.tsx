import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui-kit/button';
import { Captcha, useCaptcha } from '@/components/core';
import { useCaptchaVerification } from '../hook/desk-booking';
import { useReservationCleanupAndUpdate } from './update_chair';

const siteKey = import.meta.env.VITE_CAPTCHA_SITE_KEY;

interface BookChairButtonProps {
  selectedChair: string | null;
  onClearSelection: () => void;
  onBookingComplete?: () => void;
  name: string;
}

export const BookChairButton = ({
  selectedChair,
  onClearSelection,
  onBookingComplete,
  name,
}: BookChairButtonProps) => {
  const [showCaptcha, setShowCaptcha] = useState(false);
  const { captcha, code, reset } = useCaptcha({
    siteKey,
    type: 'reCaptcha-v2-checkbox',
  });

  const { isLoading: captchaLoading } = useCaptchaVerification(code);
  const { cleanupAndUpdate, isUpdating } = useReservationCleanupAndUpdate();

  // Track if booking is in progress to prevent duplicate calls
  const isBookingRef = useRef(false);
  const processedCodeRef = useRef<string | null>(null);

  // Reset captcha when component mounts or when selection changes
  useEffect(() => {
    reset();
    setShowCaptcha(false);
    isBookingRef.current = false;
    processedCodeRef.current = null;
  }, [selectedChair, reset]);

  const handleBookChair = () => {
    if (selectedChair) {
      setShowCaptcha(true);
      isBookingRef.current = false;
      processedCodeRef.current = null;
    }
  };

  // Auto-trigger booking when captcha is completed
  useEffect(() => {
    const completeCaptcha = async () => {
      // Prevent duplicate calls
      if (!code || !showCaptcha || !selectedChair) return;
      if (isBookingRef.current) return;
      if (processedCodeRef.current === code) return;

      isBookingRef.current = true;
      processedCodeRef.current = code;

      try {
        await cleanupAndUpdate(selectedChair, name);

        if (onBookingComplete) {
          onBookingComplete();
        }

        onClearSelection();
        setShowCaptcha(false);
        reset();
      } catch (error) {
        console.error(error);
        // Reset on error so user can retry
        isBookingRef.current = false;
      }
    };

    completeCaptcha();
  }, [
    code,
    showCaptcha,
    selectedChair,
    cleanupAndUpdate,
    onBookingComplete,
    onClearSelection,
    reset,
    name,
  ]);

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleBookChair}
        disabled={!selectedChair || isUpdating || isBookingRef.current}
        className="min-w-[160px]"
      >
        {isUpdating || isBookingRef.current ? 'Booking...' : 'Book Selected Chair'}
      </Button>

      {showCaptcha && (
        <div className="flex flex-col gap-2 p-4 border rounded-lg bg-gray-50">
          <p className="text-sm font-medium">Complete the captcha to confirm booking:</p>
          <Captcha {...captcha} />
          {captchaLoading && <span className="text-sm text-blue-600">Verifying captcha...</span>}
        </div>
      )}
    </div>
  );
};
