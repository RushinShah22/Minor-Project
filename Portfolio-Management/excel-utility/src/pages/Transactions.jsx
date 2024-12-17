import React from "react";
import { Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

function Transactions({ transactions }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ISIN</TableCell>
          <TableCell>Stock Name</TableCell>
          <TableCell>Quantity</TableCell>
          <TableCell>Date</TableCell>
          <TableCell>Type</TableCell>
          <TableCell>Total Cost</TableCell>
          
        </TableRow>
      </TableHead>
      <TableBody>
        {transactions.map((t, index) => (
          <TableRow key={index}>
            <TableCell>{t.ISIN}</TableCell>
            <TableCell>{t.stockName}</TableCell>
            <TableCell>{t.quantity}</TableCell>
            <TableCell>{t.date}</TableCell>
            <TableCell>{t.type}</TableCell>
            <TableCell>{t.totalCost}</TableCell>
           
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default Transactions;