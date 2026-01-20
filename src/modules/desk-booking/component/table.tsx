import { useEffect, useState } from 'react';
import { Button } from '@/components/ui-kit/button';
import { Trash } from 'lucide-react';
import { useMutation } from '@apollo/client';
import { useAuthStore } from '@/state/store/auth';
import API_CONFIG from '@/config/api';
import { DELETE_RESERVATION } from '../services/desk-booking';
import { useGetAccount } from '@/modules/profile/hooks/use-account';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui-kit/tooltip';

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
  Name: string;
  startTime: Date;
  __typename: string;
  row: number;
  column: number;
  tableName: string;
}

interface IReservationProps {
  data: Reservation[];
  selectedChair: string | null;
  onChairSelect: (chairId: string | null) => void;
  onTableDeleted?: () => void;
}

export const RoomArea = ({
  data,
  selectedChair,
  onChairSelect,
  onTableDeleted,
}: IReservationProps) => {
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
          onTableDeleted={onTableDeleted}
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
  onTableDeleted?: () => void;
}

const Table = ({ tableName, data, selectedChair, onChairSelect, onTableDeleted }: TableProps) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const BLOCKS_KEY = API_CONFIG.blocksKey;
  const { data: userData } = useGetAccount();

  const [deleteReservation, { loading }] = useMutation(DELETE_RESERVATION);

  const handleDelete = async () => {
    if (data.length === 0) return;
    try {
      // Create delete promises for each item using their unique properties
      const deletePromises = data.map((item) => {
        const filter = JSON.stringify({ _id: item.ItemId });
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
      if (onTableDeleted) onTableDeleted();
    } catch (error) {
      console.error('Error deleting reservations:', error);
    }
  };

  const isAdmin = Array.isArray(userData?.roles) && userData.roles.includes('admin');

  // Use tableName from data if available, otherwise use the prop
  const displayTableName = data[0]?.tableName || tableName;

  // Get max row and column to create grid
  const maxRow = Math.max(...data.map((item) => item.row || 1), 1);
  const maxColumn = Math.max(...data.map((item) => item.column || 1), 1);

  // Create a map of chairs by row and column for easy lookup
  const chairMap = new Map<string, Reservation>();
  data.forEach((item) => {
    const key = `${item.row}-${item.column}`;
    chairMap.set(key, item);
  });

  // Create grid rows
  const gridRows = Array.from({ length: maxRow }, (_, rowIdx) => {
    const row = rowIdx + 1;
    return Array.from({ length: maxColumn }, (_, colIdx) => {
      const col = colIdx + 1;
      const key = `${row}-${col}`;
      return chairMap.get(key) || null;
    });
  });

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold mb-4">Table: {displayTableName}</h3>
        {isAdmin && (
          <Trash
            className={`w-5 h-5 ${
              loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:text-red-600'
            }`}
            onClick={loading ? undefined : handleDelete}
          />
        )}
      </div>

      <div className="space-y-2">
        {gridRows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-2">
            {row.map((item, colIdx) => (
              <div key={`${rowIdx}-${colIdx}`} className="flex-1 min-w-24">
                {item ? (
                  <Chair
                    reservation={item}
                    isSelected={selectedChair === item.ItemId}
                    onSelect={onChairSelect}
                  />
                ) : (
                  <div className="h-20 bg-gray-100 rounded border border-dashed border-gray-300" />
                )}
              </div>
            ))}
          </div>
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
  const name = reservation.Name || '';
  const seat = chair.replace('chair', 'Seat');

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

  const isBookedByMe = checkUser() && occupied;
  const isBookedByOther = !checkUser() && occupied;

  const getChairColor = () => {
    if (isSelected) return 'bg-blue-300 border-blue-500 border-2 ';
    if (isBookedByOther) return 'bg-red-100 border-red-300';
    if (isBookedByMe) return 'bg-green-200 border-green-400';
    return 'bg-blue-100 border-blue-300'; // Available
  };

  const getChairTextColor = () => {
    if (isSelected) return 'text-blue-900';
    if (isBookedByOther) return 'text-red-800';
    if (isBookedByMe) return 'text-green-800';
    return 'text-blue-800';
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

  const formatStartTime = (isoString: string | Date) => {
    if (!isoString) return 'N/A';

    try {
      const date = typeof isoString === 'string' ? new Date(isoString) : isoString;

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }

      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Dhaka',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const startTime = reservation?.startTime || new Date(0);

  const chairButton = (
    <Button
      onClick={handleChairClick}
      className={`h-20 w-full ${getChairColor()} ${getChairTextColor()} font-medium border hover:opacity-100 hover:scale-100`}
      disabled={occupied}
      variant="outline"
    >
      <div className="flex flex-col items-center">
        <span>{seat}</span>
        {isSelected && <span className="text-xs mt-1">Selected</span>}
        {isBookedByMe && <span className="text-xs mt-1">Your Seat</span>}
      </div>
    </Button>
  );

  // Only wrap with tooltip if booked by someone else
  if (isBookedByOther) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {/* Wrap button in a span to enable pointer events */}
            <span className="inline-block w-full">{chairButton}</span>
          </TooltipTrigger>
          <TooltipContent className="bg-background">
            <div className="text-sm">
              <p className="font-semibold text-high-emphasis">{name}</p>
              <p className="text-xs text-low-emphasis">Booked: {formatStartTime(startTime)}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return chairButton;
};
