import React from "react";
import { Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

function Sell({ sell }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ISIN</TableCell>
          <TableCell>Stock Name</TableCell>
          <TableCell>Quantity</TableCell>
          <TableCell>Total Value</TableCell>
          <TableCell>Sell Date</TableCell>
         
        </TableRow>
      </TableHead>
      <TableBody>
        {sell.map((s, index) => (
          <TableRow key={index}>
            <TableCell>{s.ISIN}</TableCell>
            <TableCell>{s.stockName}</TableCell>
            <TableCell>{s.quantity}</TableCell>
            <TableCell>{s.totalCost}</TableCell>
            <TableCell>{s.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default Sell;