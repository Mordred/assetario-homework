import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import { SxProps } from "@mui/system";
import { useState } from "react";

interface Props {
  sx?: SxProps;
  onSubmit(value: string): void;
}

export default function SearchField({ sx, onSubmit }: Props) {
  const [value, setValue] = useState<string>("");

  return (
    <Paper
      component="form"
      sx={{
        p: "2px 4px",
        display: "flex",
        alignItems: "center",
        width: 400,
        ...sx,
      }}
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit?.(value);
      }}
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search Cities"
        inputProps={{ "aria-label": "search google maps", autoFocus: true }}
        value={value}
        onChange={(e) => {
          setValue(e.currentTarget.value);
        }}
      />
      <IconButton type="submit" sx={{ p: "10px" }} aria-label="search">
        <SearchIcon />
      </IconButton>
    </Paper>
  );
}
