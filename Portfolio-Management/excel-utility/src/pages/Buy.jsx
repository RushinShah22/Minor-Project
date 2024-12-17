import React from "react";
import { Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

function Buy({ buy }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ISIN</TableCell>
          <TableCell>Stock Name</TableCell>
          <TableCell>Quantity</TableCell>
          <TableCell>Total Cost</TableCell>
          <TableCell>Bought Date</TableCell>

        </TableRow>
      </TableHead>
      <TableBody>
        {buy.map((b, index) => (
          <TableRow key={index}>
            <TableCell>{b.ISIN}</TableCell>
            <TableCell>{b.stockName}</TableCell>
            <TableCell>{b.quantity}</TableCell>
            <TableCell>{b.totalCost}</TableCell>
            <TableCell>{b.date}</TableCell>
  
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default Buy;