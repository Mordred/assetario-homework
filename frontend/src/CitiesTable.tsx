import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { SxProps } from "@mui/system";

export interface City {
  id: number;
  name: string;
  county: {
    fips: string;
    name: string;
  };
  state: {
    id: string;
    name: string;
  };
}

interface Props {
  sx?: SxProps;
  cities: City[];
}

export default function CitiesTable({ sx, cities }: Props) {
  return (
    <TableContainer component={Paper} sx={sx}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>City</TableCell>
            <TableCell>County</TableCell>
            <TableCell>State</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cities.map((city) => (
            <TableRow
              key={city.id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {city.id}
              </TableCell>
              <TableCell>{city.name}</TableCell>
              <TableCell>{city.county.name}</TableCell>
              <TableCell>{city.state.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
