import { gql, useMutation } from '@apollo/client';
import { Button } from '@/components/ui-kit/button';

// 1. Define mutation using gql
const CREATE_RESERVATION = gql`
  mutation CreateReservation($input: CreateReservationInput!) {
    createReservation(input: $input) {
      id
      unit
      table
      user
      occupiedTime
    }
  }
`;

export const CreateTable = () => {
  // 2. Apollo useMutation hook
  const [createReservation, { loading, error }] = useMutation(CREATE_RESERVATION);

  // 3. Function that calls the mutation
  const handleCreateRow = async () => {
    try {
      await createReservation({
        variables: {
          input: {
            unit: 'blocks',
            table: '',
            user: '',
            occupiedTime: '',
            isOccupied: false,
          },
        },
      });

      alert('Row created successfully!');
    } catch (err) {
      console.error('Error creating row:', err);
      alert('Failed to create row');
    }
  };

  return (
    <>
      <Button onClick={handleCreateRow} disabled={loading}>
        {loading ? 'Adding...' : 'Add Table'}
      </Button>

      {error && <p className="text-red-500 text-sm mt-2">{error.message}</p>}
    </>
  );
};

export default CreateTable;
