import { gql } from "@apollo/client";

export const GET_BOOKS = gql`
  query GetBooks {
    books {
      title
      author
      text
    }
  }
`;

export const ADD_BOOK = gql`
  mutation AddBook($book: BookInput!) {
    addBook(book: $book) {
      title
      author
      text
    }
  }
`;

export const BOOK_ADDED = gql`
  subscription BookAdded {
    bookAdded {
      title
      author
      text
    }
  }
`;
