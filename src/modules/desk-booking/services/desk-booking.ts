import { gql } from '@apollo/client';

export const GET_UNITS = gql`
  query GetUnits($filter: String!, $sort: String, $pageNo: Int, $pageSize: Int) {
    getUnits(input: { filter: $filter, sort: $sort, pageNo: $pageNo, pageSize: $pageSize }) {
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
        value
        name
      }
    }
  }
`;

export const INSERT_UNIT = gql`
  mutation InsertUnit($input: UnitInsertInput!) {
    insertUnit(input: $input) {
      acknowledged
      totalImpactedData
      itemId
    }
  }
`;

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
        userId
        Name
        startTime
        row
        column
      }
    }
  }
`;

export const INSERT_RESERVATION = gql`
  mutation InsertReservation($input: ReservationInsertInput!) {
    insertReservation(input: $input) {
      acknowledged
      totalImpactedData
      itemId
    }
  }
`;

export const DELETE_RESERVATION = gql`
  mutation DeleteReservation($filter: String!) {
    deleteReservation(filter: $filter) {
      acknowledged
      totalImpactedData
      itemId
    }
  }
`;
export const UPDATE_RESERVATION = gql`
  mutation UpdateReservation($filter: String!, $input: ReservationUpdateInput!) {
    updateReservation(filter: $filter, input: $input) {
      acknowledged
      totalImpactedData
      itemId
    }
  }
`;
export const DELETE_UNIT = gql`
  mutation DeleteUnit($filter: String!) {
    deleteUnit(filter: $filter) {
      acknowledged
      totalImpactedData
      itemId
    }
  }
`;
