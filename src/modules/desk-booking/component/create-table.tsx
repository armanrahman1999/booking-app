import React from 'react';
import { useMutation } from '@apollo/client';
import { useAuthStore } from '@/state/store/auth';
import API_CONFIG from '@/config/api';
import { Button } from '@/components/ui-kit/button';
import { v4 as uuidv4 } from 'uuid';
import { INSERT_RESERVATION } from '../services/desk-booking';
import { useGetAccount } from '@/modules/profile/hooks/use-account';

interface CreateTableProps {
  unit: string;
  count: number;
  onTableCreated: () => void; // Add this prop
}

export const CreateTable = ({ unit, count, onTableCreated }: CreateTableProps) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const BLOCKS_KEY = API_CONFIG.blocksKey;
  const [insertReservation, { loading }] = useMutation(INSERT_RESERVATION);
  const { data: userData } = useGetAccount();

  // State for dynamic rows and columns
  const [rows, setRows] = React.useState(2);
  const [columns, setColumns] = React.useState(4);

  const isAdmin = Array.isArray(userData?.roles) && userData.roles.includes('admin');

  const handleCreateTable = async () => {
    try {
      const tableName = `table-${count}`;
      const tableId = uuidv4();
      const endTime = new Date(0).toISOString();
      const insertionPromises = [];

      const totalChairs = rows * columns;
      for (let i = 1; i <= totalChairs; i++) {
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
                Name: '',
                startTime: new Date().toISOString(),
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
      onTableCreated();
    } catch (err) {
      console.error('Error creating reservations:', err);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="flex flex-col gap-2 max-w-xs">
      <div className="flex gap-2">
        <label className="flex flex-col text-xs font-medium">
          Rows
          <input
            type="number"
            min={1}
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
            className="border rounded px-2 py-1"
          />
        </label>
        <label className="flex flex-col text-xs font-medium">
          Columns
          <input
            type="number"
            min={1}
            value={columns}
            onChange={(e) => setColumns(Number(e.target.value))}
            className="border rounded px-2 py-1"
          />
        </label>
      </div>
      <Button onClick={handleCreateTable} disabled={loading}>
        {loading ? 'Creating Table...' : `Create Table (${rows} x ${columns})`}
      </Button>
    </div>
  );
};

export default CreateTable;
