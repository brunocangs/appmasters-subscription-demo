import { ApolloProvider } from "@apollo/client";
import { client } from "../apollo";

const App = (props) => {
  const { Component, ...rest } = props;
  return (
    <ApolloProvider client={client}>
      <Component {...rest} />
    </ApolloProvider>
  );
};

export default App;
