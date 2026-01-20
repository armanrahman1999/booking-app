import React from 'react';
import { useMutation } from '@apollo/client';
import { Button } from '@/components/ui-kit/button';
import { Input } from '@/components/ui-kit/input';
import { INSERT_UNIT, GET_UNITS } from '../services/desk-booking';
import { useAuthStore } from '@/state/store/auth';
import API_CONFIG from '@/config/api';

export const AddUnit = () => {
  const [value, setValue] = React.useState('');
  const [name, setName] = React.useState('');
  const accessToken = useAuthStore((state) => state.accessToken);
  const BLOCKS_KEY = API_CONFIG.blocksKey;

  const [insertUnit, { loading }] = useMutation(INSERT_UNIT, {
    refetchQueries: [{ query: GET_UNITS }],
    context: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-blocks-key': BLOCKS_KEY,
      },
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || !name.trim()) return;
    try {
      await insertUnit({
        variables: { input: { value: value.trim(), name: name.trim() } },
      });
      setValue('');
      setName('');
    } catch (err) {
      // handle error
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div>
        <label className="block text-xs font-medium mb-1">Value</label>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Unit value"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Unit name"
          required
        />
      </div>
      <Button type="submit" disabled={loading || !value.trim() || !name.trim()}>
        {loading ? 'Adding...' : 'Add Unit'}
      </Button>
    </form>
  );
};
