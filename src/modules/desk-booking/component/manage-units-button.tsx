import React, { useState } from 'react';
import { useMutation, useQuery, useApolloClient } from '@apollo/client';
import { useAuthStore } from '@/state/store/auth';
import API_CONFIG from '@/config/api';
import { Button } from '@/components/ui-kit/button';
import { Input } from '@/components/ui-kit/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui-kit/dialog';
import { GET_UNITS, INSERT_UNIT, DELETE_UNIT } from '../services/desk-booking';

export const ManageUnitsButton = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [name, setName] = useState('');
  const accessToken = useAuthStore((state) => state.accessToken);
  const BLOCKS_KEY = API_CONFIG.blocksKey;
  const client = useApolloClient();

  const { data, loading: loadingUnits } = useQuery(GET_UNITS, {
    variables: {
      filter: '{}',
      sort: '{}',
      pageNo: 1,
      pageSize: 100,
    },
    fetchPolicy: 'cache-and-network',
    context: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-blocks-key': BLOCKS_KEY,
      },
    },
  });

  const [insertUnit, { loading: adding }] = useMutation(INSERT_UNIT, {
    context: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-blocks-key': BLOCKS_KEY,
      },
    },
    onCompleted: () => {
      refetchUnits();
    },
  });

  const [deleteUnit, { loading: deleting }] = useMutation(DELETE_UNIT, {
    context: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-blocks-key': BLOCKS_KEY,
      },
    },
    onCompleted: () => {
      refetchUnits();
    },
  });

  const refetchUnits = async () => {
    await client.refetchQueries({
      include: [GET_UNITS],
    });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || !name.trim()) return;
    try {
      const variables = { input: { value: value.trim(), name: name.trim() } };
      await insertUnit({ variables });
      setValue('');
      setName('');
    } catch (err) {
      console.error('Error adding unit:', err);
    }
  };

  const handleDelete = async (unitValue: string) => {
    try {
      await deleteUnit({ variables: { filter: JSON.stringify({ value: unitValue }) } });
    } catch (err) {
      console.error('Error deleting unit:', err);
    }
  };

  const units = data?.getUnits?.items || [];

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="ml-2">
        Manage Units
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Units</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="flex gap-2 mb-4">
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Unit value"
              required
            />
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Unit name"
              required
            />
            <Button type="submit" disabled={adding || !value.trim() || !name.trim()}>
              Add
            </Button>
          </form>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {loadingUnits ? (
              <div>Loading...</div>
            ) : (
              units.map((unit: { value: string; name: string }) => (
                <div
                  key={unit.value}
                  className="flex items-center justify-between border rounded px-2 py-1"
                >
                  <span>
                    {unit.name}{' '}
                    <span className="text-xs text-muted-foreground">({unit.value})</span>
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(unit.value)}
                    disabled={deleting}
                  >
                    Delete
                  </Button>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
