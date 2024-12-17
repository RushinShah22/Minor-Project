// Group transactions by ISIN and calculate aggregated data for Buy/Sell
import axios from "axios";

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

    return data["data"][0]["close"] || 0;
  } catch (err) {
    console.log(err.message);
  }
}

export function groupByISIN(transactions, type) {
  const filtered = transactions.filter((t) => t.type === type);

  return Object.values(filtered);
}

// Calculate Day-to-Day CAGR for each transaction and compute Portfolio CAGR
export async function calculateCAGRAndPortfolio(transactions) {
  const buys = {}; // Track remaining buy quantities and costs
  const realized = [];
  const holdings = {};
  const cagrList = []; // List to store individual CAGRs for portfolio CAGR calculation

  transactions.forEach((t) => {
    if (t.type === "Buy") {
      if (!buys[t.ISIN]) buys[t.ISIN] = [];
      buys[t.ISIN].push({
        quantity: +t.quantity,
        cost: +t.totalCost,
        date: t.date,
      });

      if (!holdings[t.ISIN]) {
        holdings[t.ISIN] = {
          ISIN: t.ISIN,
          stockName: t.stockName,
          quantity: 0,
          totalCost: 0,
          avgCost: 0,
          valuation: 0,
          startDate: t.date, // Save the start date of the stock purchase
        };
      }

      holdings[t.ISIN].quantity += Number(t.quantity);
      holdings[t.ISIN].totalCost += Number(t.totalCost);
      holdings[t.ISIN].avgCost =
        holdings[t.ISIN].totalCost / holdings[t.ISIN].quantity;
    } else if (t.type === "Sell") {
      let sellQuantity = +t.quantity;
      let sellValue = +t.totalCost;
      let buyCost = 0;

      while (sellQuantity > 0 && buys[t.ISIN]?.length > 0) {
        const buy = buys[t.ISIN][0];
        const usedQuantity = Math.min(sellQuantity, buy.quantity);

        buyCost += (usedQuantity / buy.quantity) * buy.cost;
        buy.cost -= (usedQuantity / buy.quantity) * buy.cost;
        buy.quantity -= usedQuantity;
        sellQuantity -= usedQuantity;

        if (buy.quantity === 0) {
          buys[t.ISIN].shift();
        }
      }

      const profit = sellValue - buyCost;
      realized.push({
        ISIN: t.ISIN,
        stockName: t.stockName,
        sellQuantity: t.quantity,
        sellValue,
        buyCost,
        profit,
        date: t.date,
        dayToDayCAGR: 0,
        valuation: 0,
      });

      // Update holdings
      if (holdings[t.ISIN]) {
        holdings[t.ISIN].quantity -= +t.quantity;
        holdings[t.ISIN].totalCost -= +buyCost;

        if (holdings[t.ISIN].quantity === 0) {
          delete holdings[t.ISIN];
        } else {
          holdings[t.ISIN].avgCost =
            holdings[t.ISIN].totalCost / holdings[t.ISIN].quantity;
        }
      }
    }
  });

  // Calculate Day-to-Day CAGR
  const updateCAGR = async function () {
    for await (const h of Object.values(holdings)) {
      const startDate = new Date(h.startDate);
      let endDate = new Date();
      endDate.setDate(endDate.getDate() - 1);
      if (endDate.getDay() === 0) endDate.setDate(endDate.getDate() - 1);
      if (endDate.getDay() === 6) endDate.setDate(endDate.getDate() - 1);
      const daysHeld = (endDate - startDate) / (1000 * 3600 * 24); // Calculate days
      const stockPrice = await getStockPrice(endDate, h.stockName);

      const cagr = Math.pow(stockPrice / h.totalCost, 1 / daysHeld) - 1; // Replace this logic to handle daily calculations better
      cagrList.push(cagr);
      h.dayToDayCAGR = cagr.toFixed(4); // Adding the Day-to-Day CAGR to holdings
      h.valuation = stockPrice;
    }

    for await (const r of realized) {
      const startDate = new Date(r.date);
      let endDate = new Date();
      endDate.setDate(endDate.getDate() - 1);
      if (endDate.getDay() === 0) endDate.setDate(endDate.getDate() - 1);
      if (endDate.getDay() === 6) endDate.setDate(endDate.getDate() - 1);
      const daysHeld = (endDate - startDate) / (1000 * 3600 * 24); // Calculate days
      const stockPrice = await getStockPrice(endDate, r.stockName);

      const cagr =
        Math.pow(stockPrice / (r.buyCost / r.sellQuantity), 1 / daysHeld) - 1; // Replace this logic to handle daily calculations better
      cagrList.push(cagr);
      r.dayToDayCAGR = cagr.toFixed(4); // Adding the Day-to-Day CAGR to holdings
      r.valuation = stockPrice;
    }
  };

  await updateCAGR();

  // Portfolio CAGR (RMS of individual CAGRs)
  const portfolioCAGR = Math.sqrt(
    cagrList.reduce((acc, c) => acc + Math.pow(c, 2), 0) / cagrList.length
  );

  return { holdings: Object.values(holdings), realized, portfolioCAGR };
}
