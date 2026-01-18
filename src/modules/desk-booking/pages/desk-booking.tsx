import { useQuery } from '@apollo/client';
import { UnitSelector } from '../component/unit-selector';
// import CreateTable from '../component/create-table';
import { useAuthStore } from '@/state/store/auth';
import API_CONFIG from '@/config/api';
import { GET_RESERVATIONS } from '../services/desk-booking';
import { RoomArea } from '../component/table';
import { useEffect, useState } from 'react';
import { BookChairButton } from '../component/book-chair-button';
import { getTargetUtcTime } from '../utils/getTime';
import { useGetAccount } from '@/modules/profile/hooks/use-account';
import CreateTable from '../component/create-table';

export const DeskBookingPage = () => {
  const { data: userData } = useGetAccount();

  const name = userData?.firstName + ' ' + userData?.lastName;
  const time = getTargetUtcTime();
  const date = new Date(time);
  const formatted = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Dhaka', // ✅ Add this
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
      <CreateTable unit={unit} count={count} onTableCreated={refetch} />
      <div className="flex gap-2">
        {/* <CreateTable unit={unit} count={count} onTableCreated={refetch} /> */}
        <BookChairButton
          selectedChair={selectedChair}
          onClearSelection={() => setSelectedChair(null)}
          onBookingComplete={refetch}
          name={name}
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
