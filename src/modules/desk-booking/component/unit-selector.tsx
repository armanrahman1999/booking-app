import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui-kit/select';

import { useQuery } from '@apollo/client';
import { GET_UNITS } from '../services/desk-booking';

interface UnitSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const UnitSelector = ({ value, onValueChange }: UnitSelectorProps) => {
  const { data, loading } = useQuery(GET_UNITS, {
    variables: {
      filter: '{}',
      sort: '{}',
      pageNo: 1,
      pageSize: 100,
    },
    fetchPolicy: 'cache-and-network',
  });

  const units = data?.getUnits?.items || [];

  return (
    <Select value={value} onValueChange={onValueChange} disabled={loading}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select unit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {units.map((unit: { value: string; name: string; ItemId: string }) => (
            <SelectItem key={unit.value} value={unit.value}>
              {unit.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
