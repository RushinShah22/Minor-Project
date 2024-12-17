import React, { useState, useEffect } from "react";
import { Box, Typography, Tabs, Tab, Button } from "@mui/material";
import Transactions from "./pages/Transactions";
import Buy from "./pages/Buy";
import Sell from "./pages/Sell";
import Holdings from "./pages/Holdings";
import RealizedPnL from "./pages/RealizedPnL";
import AddTransactionModal from "./components/AddTransactionModal";
import { calculateCAGRAndPortfolio, groupByISIN } from "./utils/helpers"; // Import the helper function

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [buy, setBuy] = useState([]);
  const [sell, setSell] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [realizedPnL, setRealizedPnL] = useState([]);
  const [portfolioCAGR, setPortfolioCAGR] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  const handleAddTransaction = (newTransaction) => {
    setTransactions([...transactions, newTransaction]);
    setModalOpen(false);
  };

  useEffect(() => {
    (async function(){
      const { holdings, realized, portfolioCAGR } = await calculateCAGRAndPortfolio(transactions);
      setHoldings(holdings);
      setRealizedPnL(realized);
      setPortfolioCAGR(portfolioCAGR);  // Store the Portfolio CAGR
      setBuy(groupByISIN(transactions, "Buy"));
      setSell(groupByISIN(transactions, "Sell"));
    })();
  }, [transactions]);

 

  return (
    <Box sx={{ p: 3 }}>
  
      <Box sx={{ mb: 2, textAlign: "center", padding: "10px", backgroundColor: "#4caf50", borderRadius: "15px" }}>
        <Typography variant="h5" color="white">
          Portfolio CAGR: {portfolioCAGR.toFixed(4)}
        </Typography>
      </Box>

  
      <Button variant="contained" color="primary" onClick={() => setModalOpen(true)}>
        Add New Transaction
      </Button>

     
      <Tabs value={activeTab} onChange={handleTabChange} centered>
        <Tab label="Transactions" />
        <Tab label="Buy" />
        <Tab label="Sell" />
        <Tab label="Holdings" />
        <Tab label="Realized P&L" />
      </Tabs>

     
      {activeTab === 0 && <Transactions transactions={transactions} />}
      {activeTab === 1 && <Buy buy={buy} />}
      {activeTab === 2 && <Sell sell={sell} />}
      {activeTab === 3 && <Holdings holdings={holdings} />}
      {activeTab === 4 && <RealizedPnL realizedPnL={realizedPnL} />}


      <AddTransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAddTransaction={handleAddTransaction}
      />
    </Box>
  );
}

export default App;