import { useEffect, useState } from 'react';
import { Button } from '@/components/ui-kit/button';
import { BookChair } from './book-chair';
import { Trash } from 'lucide-react';
import { useMutation } from '@apollo/client';
import { useAuthStore } from '@/state/store/auth';
import API_CONFIG from '@/config/api';
import { DELETE_RESERVATION } from '../services/desk-booking';
export interface Reservation {
  ItemId: string;
  CreatedDate: string;
  CreatedBy: string;
  LastUpdatedDate: string;
  LastUpdatedBy: string;
  IsDeleted: boolean;
  Language: string | null;
  OrganizationIds: string[];
  Tags: string[];
  DeletedDate: string | null;
  Unit: string;
  Table: string;
  occupied: boolean;
  chair: string;
  state: string;
  tableId: string;
  endTime: Date;
  __typename: string;
}

interface IReservationProps {
  data: Reservation[];
}

export const RoomArea = ({ data }: IReservationProps) => {
  const tables = data.reduce(
    (acc, item) => {
      if (!acc[item.Table]) {
        acc[item.Table] = [];
      }
      acc[item.Table].push(item);
      return acc;
    },
    {} as Record<string, Reservation[]>
  );

  return (
    <div className="space-y-8">
      {Object.entries(tables).map(([tableName, tableData]) => (
        <Table key={tableName} tableName={tableName} data={tableData} />
      ))}
    </div>
  );
};

interface TableProps {
  tableName: string;
  data: Reservation[];
}

const Table = ({ tableName, data }: TableProps) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const BLOCKS_KEY = API_CONFIG.blocksKey;

  const [deleteReservation, { loading }] = useMutation(DELETE_RESERVATION);

  const handleDelete = async () => {
    if (data.length === 0) return;

    try {
      // Create delete promises for each item using their unique properties
      const deletePromises = data.map((item) => {
        const filter = JSON.stringify({
          _id: item.ItemId,
        });

        return deleteReservation({
          variables: { filter },
          context: {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'x-blocks-key': BLOCKS_KEY,
            },
          },
        });
      });

      // Execute all deletions in parallel
      const results = await Promise.all(deletePromises);
      if (!results) console.error('Error deleting reservations');
    } catch (error) {
      console.error('Error deleting reservations:', error);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold mb-4">Table: {tableName}</h3>
        <Trash
          className={`w-5 h-5 ${
            loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:text-red-600'
          }`}
          onClick={loading ? undefined : handleDelete}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {data.map((item) => (
          <Chair key={item.ItemId} reservation={item} />
        ))}
      </div>
    </div>
  );
};
interface ChairProps {
  reservation: Reservation;
}

const Chair = ({ reservation }: ChairProps) => {
  const { chair, ItemId } = reservation;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [occupied, setOccupied] = useState(false);

  // FIX: Proper occupied logic
  useEffect(() => {
    if (reservation.endTime) {
      const end = new Date(reservation.endTime);
      setOccupied(end > new Date());
    }
  }, [reservation.endTime]);

  const getChairColor = () => {
    return occupied ? 'bg-red-100' : 'bg-green-100';
  };

  const handleChairClick = () => {
    if (!occupied) {
      setIsDialogOpen(true);
    }
  };

  return (
    <>
      <Button
        onClick={handleChairClick}
        className={`h-20 w-20 ${getChairColor()} text-high-emphasis border`}
        disabled={occupied}
      >
        {chair}
      </Button>

      <BookChair
        itemId={ItemId}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        reservation={reservation}
      />
    </>
  );
};
