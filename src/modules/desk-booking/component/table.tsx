import { useEffect, useState } from 'react';
import { Button } from '@/components/ui-kit/button';
// import { Trash } from 'lucide-react';
// import { useMutation } from '@apollo/client';
// import { useAuthStore } from '@/state/store/auth';
// import API_CONFIG from '@/config/api';
// import { DELETE_RESERVATION } from '../services/desk-booking';
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
  name: string;
  startTime: Date;
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
  // const accessToken = useAuthStore((state) => state.accessToken);
  // const BLOCKS_KEY = API_CONFIG.blocksKey;

  // const [deleteReservation, { loading }] = useMutation(DELETE_RESERVATION);

  // const handleDelete = async () => {
  //   if (data.length === 0) return;

  //   try {
  //     // Create delete promises for each item using their unique properties
  //     const deletePromises = data.map((item) => {
  //       const filter = JSON.stringify({
  //         _id: item.ItemId,
  //       });

  //       return deleteReservation({
  //         variables: { filter },
  //         context: {
  //           headers: {
  //             Authorization: `Bearer ${accessToken}`,
  //             'x-blocks-key': BLOCKS_KEY,
  //           },
  //         },
  //       });
  //     });

  //     // Execute all deletions in parallel
  //     const results = await Promise.all(deletePromises);
  //     if (!results) console.error('Error deleting reservations');
  //   } catch (error) {
  //     console.error('Error deleting reservations:', error);
  //   }
  // };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold mb-4">Table: {tableName}</h3>
        {/* <Trash
          className={`w-5 h-5 ${
            loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:text-red-600'
          }`}
          onClick={loading ? undefined : handleDelete}
        /> */}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
  const name = reservation.name;

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
        <span>{chair}</span>
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
          <TooltipTrigger asChild>{chairButton}</TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p className="font-semibold">{name}</p>
              <p className="text-xs text-gray-500">Booked: {formatStartTime(startTime)}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return chairButton;
};
