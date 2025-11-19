import { useAuthStore } from '@/state/store/auth';
import API_CONFIG from '@/config/api';
import { useMutation, useLazyQuery } from '@apollo/client';
import { UPDATE_RESERVATION, GET_RESERVATIONS } from '../services/desk-booking';
import { useGetAccount } from '@/modules/profile/hooks/use-account';
import { getTargetUtcTime } from '../utils/getTime';

export function useReservationCleanupAndUpdate() {
  const endTime = new Date(0).toISOString();
  const { data: userData } = useGetAccount();
  const userId = userData?.itemId || '';

  const accessToken = useAuthStore((state) => state.accessToken);
  const BLOCKS_KEY = API_CONFIG.blocksKey;

  const [fetchReservations] = useLazyQuery(GET_RESERVATIONS);
  const [updateReservation, { loading: isUpdating }] = useMutation(UPDATE_RESERVATION);

  const cleanupAndUpdate = async (newReservationId: string, name: string) => {
    try {
      // 🔥 STEP 1 — Fetch all reservations belonging to this user
      const filter = JSON.stringify({ userId });
      const sort = JSON.stringify({ chair: 1 });

      const { data: res } = await fetchReservations({
        variables: {
          filter,
          sort,
          pageNo: 1,
          pageSize: 100,
        },
        fetchPolicy: 'network-only', ///might change this
        context: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'x-blocks-key': BLOCKS_KEY,
          },
        },
      });

      const oldReservations = res?.getReservations?.items || [];

      for (const reservation of oldReservations) {
        const oldId = reservation.ItemId;

        await updateReservation({
          variables: {
            filter: JSON.stringify({ _id: oldId }),
            input: { userId: 'empty', endTime: endTime },
          },
          context: {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'x-blocks-key': BLOCKS_KEY,
            },
          },
        });
      }

      // 🔥 STEP 3 — Book the new reservation
      const response = await updateReservation({
        variables: {
          filter: JSON.stringify({ _id: newReservationId }),
          input: {
            userId,
            endTime: getTargetUtcTime(),
            Name: name,
            startTime: new Date().toISOString(),
          },
        },
        context: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'x-blocks-key': BLOCKS_KEY,
          },
        },
      });

      return response;
    } catch (error) {
      console.error('Error in cleanupAndUpdate:', error);
      throw error;
    }
  };

  return { cleanupAndUpdate, isUpdating };
}
