/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global console, document, Excel, Office */

// 673b87984c1849.71141183

import axios from "axios";

const buySellColumns = ["ISIN", "Symbol", "Buy-Sell", "Quantity", "DD", "MM", "YYYY"];
const portofolioColumns = ["ISIN", "Symbol", "Quantity", "Date", "Net Amount", "Effective Unit Price"];

async function getStockPrice(date, symbol, ticker = "NSE") {
  try {
    let d = date.toISOString().split("T")[0]; //first split by T to get the date and then take the first element of the array and then split by -
    console.log(d);
    const data = await axios.get(
      `https://eodhd.com/api/eod/${symbol}.${ticker}?from=${String(
        d
      )}&to=${String(d)}&api_token=673b87984c1849.71141183&fmt=json`
      // "https://eodhd.com/api/eod/INFY.NSE?from=2024-11-13&to=2024-11-16&api_token=673b87984c1849.71141183&fmt=json"
    );

    return data["data"][0]["close"];
  } catch (err) {
    console.log(err.message);
  }
}

async function deleteSheet() {
  try {
    await Excel.run(async (context) => {
      try {
        let sheets = context.workbook.worksheets;
        sheets.load("items/name");
        await context.sync();

        let sheet = sheets.items.filter((sheet) => sheet.name === "Portfolio")[0];
        sheet.delete();
        await context.sync();
      } catch (err) {
        console.log(err.message);
      }
    });
  } catch (err) {
    console.log(err.message);
  }
}

async function createSheet() {
  try {
    await Excel.run(async (context) => {
      let buySellSheet = context.workbook.worksheets.getItem("Buy-Sell Entry");
      let portfolioSheet = context.workbook.worksheets.getItem("Portfolio Template");
      let copiedSheet = portfolioSheet.copy(Excel.WorksheetPositionType.after, buySellSheet);
      copiedSheet.name = "Portfolio";
      await context.sync();
    });
  } catch (err) {
    console.log(err.message);
  }
}

async function updateHoldings(context, ws, holding, realized) {
  try {
    let buy = [];

    // Flatten holdings
    for (let y of Object.values(holding)) {
      for (let x of y) {
        buy.push(x);
      }
    }

    // Sort transactions by purchase date
    buy.sort((a, b) => {
      let d1 = a[3];
      let d2 = b[3];
      let [dd1, mm1, yyyy1] = d1.split("/").map(Number);
      let [dd2, mm2, yyyy2] = d2.split("/").map(Number);
      return new Date(yyyy1, mm1 - 1, dd1) - new Date(yyyy2, mm2 - 1, dd2);
    });
    let cagrs = [];
    if (buy.length) {
      const basicDetailsRange = ws.getRange("Q4:U" + (buy.length + 3));
      const valuationDetailsRange = ws.getRange("W4:AA" + (buy.length + 3));
      const cagrRange = ws.getRange("AE4:AE" + (buy.length + 3)); // New columns for Profit/Loss and CAGR

      basicDetailsRange.load("values");
      valuationDetailsRange.load("values");
      cagrRange.load("values");

      await context.sync();

      // Prepare values for basic details and valuation
      basicDetailsRange.values = buy.map((b) => {
        b[b.length - 2] = b[b.length - 1] * b[2]; // Calculate total value (Net Amount)
        return b.slice(0, b.length - 1); // Drop the current price field for now
      });

      let valDetails = [];
      let cagrDetails = [];

      for (let x of buy) {
        let val = x[3].split("/"); // Valuation date
        let purchaseDate = x[3]; // Purchase date
        let effectivePrice = x[5]; // Effective Unit Price (Purchase Price)
        val.push(purchaseDate);

        // Get stock price on valuation date
        let endDate = new Date();
        endDate.setDate(endDate.getDate() - 1);
        if (endDate.getDay() === 0) endDate.setDate(endDate.getDate() - 1);
        if (endDate.getDay() === 6) endDate.setDate(endDate.getDate() - 1);
        const currentPrice = await getStockPrice(endDate, x[1]); // Pass date and symbol

        val.push(currentPrice); // Append to valuation details

        // Calculate CAGR (day-wise)
        let [dd, mm, yyyy] = purchaseDate.split("/").map(Number);
        let [ddv, mmv, yyyyv] = x[3].split("/").map(Number); // Valuation date
        const daysHeld = Math.max(
          1,
          (new Date(yyyyv, mmv - 1, ddv) - new Date(yyyy, mm - 1, dd)) / (1000 * 60 * 60 * 24)
        ); // Avoid 0 days

        const cagr = Math.pow(currentPrice / effectivePrice, 1 / daysHeld) - 1;

        // Append profit/loss and CAGR for this row
        cagrDetails.push([cagr]);
        cagrs.push(cagr);
        valDetails.push(val);
      }

      valuationDetailsRange.values = valDetails; // Write valuation details
      cagrRange.values = cagrDetails;
    }
    if (realized.length) {
      const basicBuyDetailsRange = ws.getRange("AH4:AL" + (realized.length + 3)); // Realized buy details
      const sellDetailsRange = ws.getRange("AN4:AS" + (realized.length + 3)); // Include Profit/Loss and CAGR for realized
      basicBuyDetailsRange.load("values");
      sellDetailsRange.load("values");
      await context.sync();
      let buyDetails = [];
      let sellDetails = [];

      // Process each realized transaction
      for (let x of realized) {
        let purchaseDate = x[3];
        let sellDate = x[5];
        let quantity = x[2];
        let purchasePrice = x[4];
        let sellPrice = x[6];

        // Calculate Profit/Loss
        const profitLoss = (sellPrice - purchasePrice / quantity) * quantity;
        let endDate = new Date();
        endDate.setDate(endDate.getDate() - 1);
        if (endDate.getDay() === 0) endDate.setDate(endDate.getDate() - 1);
        if (endDate.getDay() === 6) endDate.setDate(endDate.getDate() - 1);
        const currentPrice = await getStockPrice(endDate, x[1]);
        // Calculate CAGR (day-wise)
        let [ddp, mmp, yyyp] = purchaseDate.split("/").map(Number); // Purchase date
        let [dds, mms, yyys] = sellDate.split("/").map(Number); // Sell date
        const daysHeld = Math.max(
          1,
          (new Date(yyys, mms - 1, dds) - new Date(yyyp, mmp - 1, ddp)) / (1000 * 60 * 60 * 24)
        ); // Avoid division by 0

        const cagr = Math.pow(currentPrice / (purchasePrice / quantity), 1 / daysHeld) - 1;
        cagrs.push(cagr);
        // Append to details
        buyDetails.push(x.slice(0, 5)); // First 5 columns for buy details
        sellDetails.push([
          ...x.slice(5, 6),
          x[6] * quantity,
          sellPrice,
          profitLoss,
          Math.abs(profitLoss / purchasePrice) * 100,
          cagr,
        ]); // Sell details with Profit/Loss and CAGR
      }
      const portfolioCagrRange = ws.getRange("AF4:AF4");
      const portfolioCAGR = Math.sqrt(cagrs.reduce((acc, c) => acc + Math.pow(c, 2), 0) / cagrs.length);
      portfolioCagrRange.values = portfolioCAGR;

      // Write data to Excel
      if (buyDetails.length) basicBuyDetailsRange.values = buyDetails;
      if (sellDetails.length) sellDetailsRange.values = sellDetails;
    }
  } catch (err) {
    console.error("Error in updateHoldings:", err.message);
  }
}

async function run() {
  try {
    await Excel.run(async (context) => {
      await deleteSheet();
      await createSheet();

      let buySellSheet = context.workbook.worksheets.getItem("Buy-Sell Entry");
      let portfolioSheet = context.workbook.worksheets.getItem("Portfolio");

      let buySellRange = buySellSheet.getRange("B3:H100");
      let priceRange = buySellSheet.getRange("M3:N100");
      buySellRange.load("values");
      priceRange.load("values");

      await context.sync();

      let buy = [];
      let sell = [];
      let holding = {};
      let realized = [];
      let tmp = new Array(portofolioColumns.length);

      // Separating out transaction as either Buy or Sell with proper Formatting

      for (let i = 0; i < buySellRange.values.length; i++) {
        for (let j = 0; j < buySellColumns.length; j++) {
          if (j === 2) continue;
          if (j === 4) {
            let date =
              buySellRange.values[i][j] + "/" + buySellRange.values[i][j + 1] + "/" + buySellRange.values[i][j + 2];
            j += 2;
            tmp[portofolioColumns.indexOf("Date")] = date;
          } else {
            tmp[portofolioColumns.indexOf(buySellColumns[j])] = buySellRange.values[i][j];
          }
        }

        tmp[portofolioColumns.indexOf("Net Amount")] = priceRange.values[i][0];
        tmp[portofolioColumns.indexOf("Effective Unit Price")] = priceRange.values[i][1];

        if (buySellRange.values[i][2] === "B") {
          if (holding[tmp[0]]) holding[tmp[0]].push(tmp);
          else {
            holding[tmp[0]] = new Array();
            holding[tmp[0]].push([...tmp]);
          }
          buy.push([...tmp]);
        } else if (buySellRange.values[i][2] === "S") {
          let count = tmp[2];

          while (count > 0) {
            let aux = tmp.slice(0, 5);

            if (holding[tmp[0]][0][2] > count) {
              holding[tmp[0]][0][2] -= count;
              aux[2] = count;
              aux[3] = holding[tmp[0]][0][3];
              aux[4] = holding[tmp[0]][0][5] * count;
              aux[5] = tmp[3];
              aux[6] = tmp[5];
              realized.push(aux);
              count = 0;
            } else {
              count -= holding[tmp[0]][0][2];
              aux[2] = holding[tmp[0]][0][2];
              aux[3] = holding[tmp[0]][0][3];
              aux[4] = holding[tmp[0]][0][5] * holding[tmp[0]][0][2];
              aux[5] = tmp[3];
              aux[6] = tmp[5];
              realized.push(aux);
              holding[tmp[0]].shift();
            }
          }
          sell.push([...tmp]);
        } else break;

        tmp = new Array(portofolioColumns.length);
      }

      // Updating the Portfolio Buy Sell Tab

      if (buy.length > 0) {
        let portfolioBuyRange = portfolioSheet.getRange("C4:H" + (buy.length + 3));
        portfolioBuyRange.load("values");
        await context.sync();
        portfolioBuyRange.values = buy;
      }
      if (sell.length > 0) {
        let portfolioSellRange = portfolioSheet.getRange("J4:O" + (sell.length + 3));
        portfolioSellRange.load("values");
        await context.sync();
        portfolioSellRange.values = sell;
      }
      await updateHoldings(context, portfolioSheet, holding, realized);
    });
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  try {
    const info = await Office.onReady();
    if (info.host === "Excel") {
      document.getElementById("btn").onclick = run;
    }
  } catch (err) {
    console.log(err.message);
  }
}

main();
