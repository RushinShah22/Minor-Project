import React from "react";
import { Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

function Holdings({ holdings }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ISIN</TableCell>
          <TableCell>Stock Name</TableCell>
          <TableCell>Remaining Quantity</TableCell>
          <TableCell>Total Cost</TableCell>
          <TableCell>Average Cost</TableCell>
          <TableCell>Valuation</TableCell>
          <TableCell>Day-to-Day CAGR</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {holdings.map((h, index) => (
          <TableRow key={index}>
            <TableCell>{h.ISIN}</TableCell>
            <TableCell>{h.stockName}</TableCell>
            <TableCell>{h.quantity}</TableCell>
            <TableCell>{h.totalCost.toFixed(2)}</TableCell>
            <TableCell>{h.avgCost.toFixed(2)}</TableCell>
            <TableCell>{h.valuation.toFixed(2)}</TableCell>
            <TableCell>{h.dayToDayCAGR || "0.00"}</TableCell> {/* Display Day-to-Day CAGR */}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default Holdings;