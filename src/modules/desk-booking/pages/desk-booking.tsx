import { UnitSelector } from '../component/unit-selector';

export const DeskBookingPage = () => {
  return (
    <div className="flex flex-col w-full gap-5">
      <div className="flex justify-between">
        <h1 className="text-lg font-semibold">Desk Booking</h1>
        <UnitSelector />
      </div>
    </div>
  );
};
