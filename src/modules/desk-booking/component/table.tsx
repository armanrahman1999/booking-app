import { useEffect, useState } from 'react';
import { Button } from '@/components/ui-kit/button';
import { Trash } from 'lucide-react';
import { useMutation } from '@apollo/client';
import { useAuthStore } from '@/state/store/auth';
import API_CONFIG from '@/config/api';
import { DELETE_RESERVATION } from '../services/desk-booking';
import { useGetAccount } from '@/modules/profile/hooks/use-account';

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
  userId: string;
  __typename: string;
}

interface IReservationProps {
  data: Reservation[];
  selectedChair: string | null;
  onChairSelect: (chairId: string | null) => void;
}

export const RoomArea = ({ data, selectedChair, onChairSelect }: IReservationProps) => {
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
        <Table
          key={tableName}
          tableName={tableName}
          data={tableData}
          selectedChair={selectedChair}
          onChairSelect={onChairSelect}
        />
      ))}
    </div>
  );
};

interface TableProps {
  tableName: string;
  data: Reservation[];
  selectedChair: string | null;
  onChairSelect: (chairId: string | null) => void;
}

const Table = ({ tableName, data, selectedChair, onChairSelect }: TableProps) => {
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
          <Chair
            key={item.ItemId}
            reservation={item}
            isSelected={selectedChair === item.ItemId}
            onSelect={onChairSelect}
          />
        ))}
      </div>
    </div>
  );
};

interface ChairProps {
  reservation: Reservation;
  isSelected: boolean;
  onSelect: (chairId: string | null) => void;
}

const Chair = ({ reservation, isSelected, onSelect }: ChairProps) => {
  const { chair, ItemId, userId } = reservation;
  const [occupied, setOccupied] = useState(false);
  const { data: userData } = useGetAccount();

  // FIX: Proper occupied logic
  useEffect(() => {
    if (reservation.endTime) {
      const end = new Date(reservation.endTime);
      setOccupied(end > new Date());
    }
  }, [reservation.endTime]);

  const checkUser = () => {
    return userId === userData?.itemId;
  };

  const getChairColor = () => {
    if (isSelected) return 'bg-blue-200 border-blue-500 border-2';
    if (occupied) return 'bg-red-100 border-red-300';
    return 'bg-green-100 border-green-300';
  };

  const getChairTextColor = () => {
    if (isSelected) return 'text-blue-800';
    if (occupied) return 'text-red-800';
    return 'text-green-800';
  };

  const handleChairClick = () => {
    if (!occupied) {
      if (isSelected) {
        onSelect(null); // Deselect
      } else {
        onSelect(ItemId); // Select
      }
    }
  };

  const chairState = !checkUser() && occupied ? 'Booked' : chair;

  return (
    <Button
      onClick={handleChairClick}
      className={`h-20 w-20 ${getChairColor()} ${getChairTextColor()} font-medium border`}
      disabled={occupied}
      variant={isSelected ? 'default' : 'outline'}
    >
      <div className="flex flex-col items-center">
        <span>{chairState}</span>
        {isSelected && <span className="text-xs mt-1">Selected</span>}
      </div>
    </Button>
  );
};
