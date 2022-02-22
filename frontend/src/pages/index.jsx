import { useQuery } from "@apollo/client";
import { useEffect } from "react";
import { BOOK_ADDED, GET_BOOKS } from "../queries";

const MainPage = () => {
  const { data, loading, subscribeToMore } = useQuery(GET_BOOKS);
  useEffect(() => {
    const unsub = subscribeToMore({
      document: BOOK_ADDED,
      updateQuery: ({ books }, { subscriptionData }) => {
        if (subscriptionData.data)
          return {
            books: books.concat(subscriptionData.data.bookAdded),
          };
        return { books };
      },
    });
    return unsub;
  }, [data, subscribeToMore]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>This is the main page!</h1>
      <div>
        <h2>Books</h2>
        {data.books.map((book, i) => (
          <div style={{ borderBottom: `1px solid #ccc` }} key={book.title + i}>
            <h3>{book.title}</h3>
            <p>Written by {book.author}</p>
            <p>{book.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainPage;
