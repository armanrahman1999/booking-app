import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui-kit/select';

const Units = [
  { value: 'blocks', name: 'Blocks' },
  { value: 'retail', name: 'Retail' },
  { value: 'genesis', name: 'Genesis X' },
  { value: 'inb', name: 'INB' },
  { value: 'consulting', name: 'Consulting' },
];
export const UnitSelector = () => {
  return (
    <Select>
      {' '}
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select unit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {Units.map((unit) => (
            <SelectItem key={unit.value} value={unit.value}>
              {unit.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
