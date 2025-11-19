import { gql, useQuery } from '@apollo/client';

const GET_USER_IDENTITIES = gql`
  query GetUserIdentities($input: GetUserIdentitiesInput!) {
    getUserIdentities(input: $input) {
      totalCount
      items {
        userId
      }
    }
  }
`;

function UserExists({
  userId,
  accessToken,
  BLOCKS_KEY,
}: {
  userId: string;
  accessToken: string;
  BLOCKS_KEY: string;
}) {
  const filter = JSON.stringify({
    userId: userId,
  });

  const { data, loading, error } = useQuery(GET_USER_IDENTITIES, {
    variables: {
      input: {
        // Wrap variables in an "input" object
        filter: filter,
        pageNo: 1,
        pageSize: 1,
      },
    },
    context: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-blocks-key': BLOCKS_KEY,
      },
    },
    skip: !userId || !accessToken || !BLOCKS_KEY,
  });

  if (error) {
    console.error('Error checking user existence:', error);
  }

  // Return true if any user with that userId exists
  const exists = data?.getUserIdentities?.totalCount > 0;

  return { exists, loading, error };
}

export default UserExists;
