import { useMutation } from '@apollo/client';
import { useAuthStore } from '@/state/store/auth';
import API_CONFIG from '@/config/api';
import { Button } from '@/components/ui-kit/button';
import { v4 as uuidv4 } from 'uuid';
import { INSERT_RESERVATION } from '../services/desk-booking';

export const CreateTable = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const BLOCKS_KEY = API_CONFIG.blocksKey;

  const [insertReservation, { loading }] = useMutation(INSERT_RESERVATION);

  const handleCreateRow = async () => {
    try {
      const tableName = 'table-1';
      const chairsCount = 8;

      // Generate tableId once
      const tableId = uuidv4();

      // Fixed endTime for all entries
      const endTime = new Date(0).toISOString(); // "1970-01-01T00:00:00.000Z"

      const insertionPromises = [];

      for (let i = 1; i <= chairsCount; i++) {
        const chairName = `chair-${i}`;

        insertionPromises.push(
          insertReservation({
            variables: {
              input: {
                Unit: 'blks',
                Table: tableName,
                chair: chairName,
                tableId: tableId, // ⬅️ NEW
                endTime: endTime, // ⬅️ NEW
                userId: '',
              },
            },
            context: {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'x-blocks-key': BLOCKS_KEY,
              },
            },
          })
        );
      }

      const results = await Promise.all(insertionPromises);
      console.error('results', results);
    } catch (err) {
      console.error('Error creating reservations:', err);
    }
  };

  return (
    <Button onClick={handleCreateRow} disabled={loading}>
      {loading ? 'Creating Table...' : 'Create Table with 8 Chairs'}
    </Button>
  );
};

export default CreateTable;
