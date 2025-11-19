import { gql } from '@apollo/client';

export const GET_RESERVATIONS = gql`
  query GetReservations($filter: String!, $sort: String, $pageNo: Int, $pageSize: Int) {
    getReservations(input: { filter: $filter, sort: $sort, pageNo: $pageNo, pageSize: $pageSize }) {
      totalCount
      totalPages
      hasNextPage
      hasPreviousPage
      items {
        ItemId
        CreatedDate
        CreatedBy
        LastUpdatedDate
        LastUpdatedBy
        IsDeleted
        Language
        OrganizationIds
        Tags
        DeletedDate
        Unit
        Table
        chair
        tableId
        endTime
      }
    }
  }
`;
