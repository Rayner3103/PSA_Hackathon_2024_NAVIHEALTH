// src/PopoverExample.js
import React, { useState, useEffect } from "react";
import { Button, Popover, Typography } from "@mui/material";

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0'); // Get day and pad with leading zero if necessary
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month (0-indexed, so add 1) and pad
  const year = date.getFullYear(); // Get full year

  return `${day}/${month}/${year}`; // Return in DD/MM/YYYY format
}

const PopoverComponent = ({ open, setOpen, prediction }) => {
  console.log(prediction)
  
  return (
    <div>
      <Popover
        open={open}
        anchorEl={false}
        onClose={() => {setOpen(false)}}
        anchorOrigin={{
          vertical: "center",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Typography sx={{ p: 2 }} variant="h5">AGV-3345 Battery</Typography>
        <Typography sx={{ px: 2 }} variant="subtitle1">Serial No.: 12346789</Typography>
        <Typography sx={{ px: 2 }} variant="subtitle1">Type: Li-ion Rechargeable Battery</Typography>
        <Typography sx={{ px: 2 }} variant="subtitle1">Age: 1923 days</Typography>
        <Typography sx={{ px: 2 }} variant="subtitle1">Expected Age: 2556 days</Typography>
        <Typography sx={{ px: 2 }} variant="subtitle1">Average Working Temperature: 25°C</Typography>
        <Typography sx={{ px: 2 }} variant="subtitle1">Previous Replacement Date: {`${formatDate(new Date(new Date().getTime() - (1923 * 24 * 60 * 60 * 1000)))}`}</Typography>
        <Typography sx={{ px: 2 }} variant="subtitle1">Scehduled Replacement Date: {`${formatDate(new Date(new Date().getTime() + (633 * 24 * 60 * 60 * 1000)))}`}</Typography>
        <Typography sx={{ px: 2 }} variant="subtitle1">Predicted Replacement Date: 
           {`${formatDate(new Date(new Date().getTime() - (1923 * 24 * 60 * 60 * 1000) + ((prediction ? Math.round(prediction.prediction) : 1923) * 24 * 60 * 60 * 1000)))}`} </Typography>
      </Popover>
    </div>
  );
};

export default PopoverComponent;
