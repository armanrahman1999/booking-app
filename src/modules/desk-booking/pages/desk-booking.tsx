import { useQuery } from '@apollo/client';
import { UnitSelector } from '../component/unit-selector';
import CreateTable from '../component/create-table';
import { useAuthStore } from '@/state/store/auth';
import API_CONFIG from '@/config/api';
import { GET_RESERVATIONS } from '../services/desk-booking';
import { RoomArea } from '../component/table';
import { useEffect, useState } from 'react';
import { BookChairButton } from '../component/book-chair-button';
import { getTargetUtcTime } from '../utils/getTime';
// import { useGetRole } from '../hook/desk-booking';

// Define the GraphQL query

export const DeskBookingPage = () => {
  // const { data: roleData } = useGetRole();
  // console.log(roleData, 'roleData');
  const date = new Date(getTargetUtcTime());
  const formatted = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const [unit, setUnit] = useState('blocks');
  const accessToken = useAuthStore((state) => state.accessToken);
  const BLOCKS_KEY = API_CONFIG.blocksKey;
  const [selectedChair, setSelectedChair] = useState<string | null>(null);

  // Use the query hook with headers
  const { data, refetch } = useQuery(GET_RESERVATIONS, {
    variables: {
      filter: JSON.stringify({ Unit: unit }),
      sort: JSON.stringify({ chair: 1 }),
      pageNo: 1,
      pageSize: 100,
    },
    context: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-blocks-key': BLOCKS_KEY,
      },
    },
  });

  // Refetch when unit changes
  useEffect(() => {
    refetch();
  }, [unit, refetch]);

  const count = (data?.getReservations?.totalCount || 0) / 8 + 1;

  return (
    <div className="flex flex-col w-full gap-5">
      <div className="flex justify-between">
        <h1 className="text-lg font-semibold">Desk Booking for {formatted}</h1>
        <UnitSelector value={unit} onValueChange={setUnit} />
      </div>

      <div className="flex gap-2">
        <CreateTable unit={unit} count={count} onTableCreated={refetch} />
        <BookChairButton
          selectedChair={selectedChair}
          onClearSelection={() => setSelectedChair(null)}
          onBookingComplete={refetch}
        />
      </div>
      <div>
        <RoomArea
          data={data?.getReservations?.items || []}
          selectedChair={selectedChair}
          onChairSelect={setSelectedChair}
        />
      </div>
    </div>
  );
};
