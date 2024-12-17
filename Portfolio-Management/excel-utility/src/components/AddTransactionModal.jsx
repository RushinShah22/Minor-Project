import React, { useState } from "react";
import { Modal, Box, TextField, Button, MenuItem } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

function AddTransactionModal({ open, onClose, onAddTransaction }) {
  const [formData, setFormData] = useState({
    ISIN: "",
    stockName: "",
    quantity: "",
    date: "",
    type: "Buy", // Buy or Sell
    totalCost: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onAddTransaction(formData);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <h2>Add New Transaction</h2>
        <TextField
          label="ISIN"
          name="ISIN"
          fullWidth
          margin="normal"
          onChange={handleInputChange}
        />
        <TextField
          label="Stock Name"
          name="stockName"
          fullWidth
          margin="normal"
          onChange={handleInputChange}
        />
        <TextField
          label="Quantity"
          name="quantity"
          type="number"
          fullWidth
          margin="normal"
          onChange={handleInputChange}
        />
        <TextField
          label="Date"
          name="date"
          type="date"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          onChange={handleInputChange}
        />
        <TextField
          select
          label="Type"
          name="type"
          fullWidth
          margin="normal"
          value={formData.type}
          onChange={handleInputChange}
        >
          <MenuItem value="Buy">Buy</MenuItem>
          <MenuItem value="Sell">Sell</MenuItem>
        </TextField>
        <TextField
          label="Total Cost"
          name="totalCost"
          type="number"
          fullWidth
          margin="normal"
          onChange={handleInputChange}
        />
        
        <Button variant="contained" onClick={handleSubmit} sx={{ mt: 2 }}>
          Add Transaction
        </Button>
      </Box>
    </Modal>
  );
}

export default AddTransactionModal;