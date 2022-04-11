import { Box, Container, Pagination, LinearProgress } from "@mui/material";
import CitiesTable, { City } from "./CitiesTable";
import SearchField from "./SearchField";
import { useEffect, useReducer } from "react";

/**
 * TODO: More features can be implemented
 *  e.g. sorting?, more data displayed?, page size?
 */

const ITEMS_PER_PAGE = 30;

interface State {
  status: "idle" | "loading" | "success" | "failure";
  error?: string;
  cities: City[];
  count: number;
  page: number;
  search: string;
}

async function load(
  search: string,
  page: number,
  dispatch: React.Dispatch<Action>
) {
  dispatch({ type: "LOADING", payload: { search, page } });

  try {
    const response = await fetch("http://localhost:8080/v1/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
      query Cities($where: cities_bool_exp, $offset: Int!) {
        cities(order_by: [{state_id: asc}, {county: {name: asc}}, {name: asc}], where: $where, limit: ${ITEMS_PER_PAGE}, offset: $offset) {
          id
          name
          county {
            name
          }
          state {
            name
          }
        }
        cities_aggregate(where: $where) {
          aggregate{
            count
          }
        }
      }
      `,
        variables: {
          where: search
            ? {
                _or: [
                  { name: { _ilike: `%${search}%` } },
                  { county: { name: { _ilike: `%${search}%` } } },
                  { state: { name: { _ilike: `%${search}%` } } },
                ],
              }
            : null,
          offset: (page - 1) * 30,
        },
      }),
    });

    const json = await response.json();

    dispatch({
      type: "SUCCESS",
      payload: {
        cities: json.data.cities as City[],
        count: json.data.cities_aggregate.aggregate.count,
        page,
        search,
      },
    });
  } catch (err: any) {
    dispatch({
      type: "FAILURE",
      error: err?.message ?? "Unknown error occurred!",
    });
  }
}

type Action =
  | { type: "LOADING"; payload: { search: string; page: number } }
  | {
      type: "SUCCESS";
      payload: { cities: City[]; count: number; page: number; search: string };
    }
  | { type: "FAILURE"; error: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOADING":
      return {
        ...state,
        status: "loading",
      };
    case "SUCCESS":
      return {
        ...state,
        status: "success",
        cities: action.payload.cities,
        count: action.payload.count,
        page: action.payload.page,
        search: action.payload.search,
      };
    case "FAILURE":
      return {
        ...state,
        status: "failure",
        error: action.error,
      };
    default: {
      throw new Error("Wrong action!");
    }
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, {
    status: "idle",
    cities: [],
    count: 0,
    page: 1,
    search: "",
  });

  useEffect(() => {
    load("", 1, dispatch);
  }, [dispatch]);

  return (
    <Container>
      <Box display="flex" flexDirection="column" mt={4} mb={4} alignItems="center">
        <SearchField onSubmit={(value) => load(value, 1, dispatch)} />
        {state.status === "loading" ? (
          <LinearProgress color="primary" sx={{ width: 400, mt: 1 }} />
        ) : (
          <Box height="4px" mt={1} />
        )}
        <Pagination
          count={Math.ceil(state.count / ITEMS_PER_PAGE)}
          page={state.page}
          sx={{ mt: 2 }}
          onChange={(event, page) => load(state.search, page, dispatch)}
        />
        <CitiesTable cities={state.cities} sx={{ mt: 2 }} />
      </Box>
    </Container>
  );
}

export default App;
