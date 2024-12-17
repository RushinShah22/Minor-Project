import React from "react";
import { Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

function RealizedPnL({ realizedPnL }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ISIN</TableCell>
          <TableCell>Stock Name</TableCell>
          <TableCell>Sell Quantity</TableCell>
          <TableCell>Sell Value</TableCell>
          <TableCell>Buy Cost</TableCell>
          <TableCell>Profit / Loss</TableCell>
          <TableCell>Valuation</TableCell>
          <TableCell>Day-to-Day CAGR</TableCell>
          <TableCell>Date</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {realizedPnL.map((r, index) => (
          <TableRow key={index}>
            <TableCell>{r.ISIN}</TableCell>
            <TableCell>{r.stockName}</TableCell>
            <TableCell>{r.sellQuantity}</TableCell>
            <TableCell>{r.sellValue.toFixed(2)}</TableCell>
            <TableCell>{r.buyCost.toFixed(2)}</TableCell>
            <TableCell style={{ color: r.profit >= 0 ? "green" : "red" }}>
              {r.profit.toFixed(2)}
            </TableCell>
            <TableCell>{r.valuation.toFixed(2)}</TableCell>
            <TableCell>{r.dayToDayCAGR || "0.00"}</TableCell> {/* Display Day-to-Day CAGR */}
            <TableCell>{r.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default RealizedPnL;