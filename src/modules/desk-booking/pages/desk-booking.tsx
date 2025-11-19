import { useQuery } from '@apollo/client';
import { UnitSelector } from '../component/unit-selector';
import CreateTable from '../component/create-table';
import { useAuthStore } from '@/state/store/auth';
import API_CONFIG from '@/config/api';
import { GET_RESERVATIONS } from '../services/desk-booking';
import { RoomArea } from '../component/table';

// Define the GraphQL query

export const DeskBookingPage = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const BLOCKS_KEY = API_CONFIG.blocksKey;

  // Prepare the filter for Unit = "Sample text"
  const filter = JSON.stringify({ Unit: 'blocks' });
  const sort = JSON.stringify({ chair: 1 }); // 1 for ascending, -1 for descending

  // Use the query hook with headers
  const { data } = useQuery(GET_RESERVATIONS, {
    variables: {
      filter: filter,
      sort: sort,
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

  // You can access the data here

  return (
    <div className="flex flex-col w-full gap-5">
      <div className="flex justify-between">
        <h1 className="text-lg font-semibold">Desk Booking</h1>
        <UnitSelector />
      </div>
      <div>
        <CreateTable />
      </div>
      <div>
        <RoomArea data={data?.getReservations?.items || []} />
      </div>
    </div>
  );
};
