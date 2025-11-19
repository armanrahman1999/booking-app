import { useMutation } from '@apollo/client';
import { useAuthStore } from '@/state/store/auth';
import API_CONFIG from '@/config/api';
import { Button } from '@/components/ui-kit/button';
import { v4 as uuidv4 } from 'uuid';
import { INSERT_RESERVATION } from '../services/desk-booking';

interface CreateTableProps {
  unit: string;
  count: number;
  onTableCreated: () => void; // Add this prop
}

export const CreateTable = ({ unit, count, onTableCreated }: CreateTableProps) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const BLOCKS_KEY = API_CONFIG.blocksKey;

  const [insertReservation, { loading }] = useMutation(INSERT_RESERVATION);

  const handleCreateRow = async () => {
    try {
      const tableName = `table-${count}`;
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
                Unit: unit,
                Table: tableName,
                chair: chairName,
                tableId: tableId,
                endTime: endTime,
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

      if (!results) console.error('Error creating reservations');

      // Call the refetch function after successful creation
      onTableCreated();
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
