import React, { useEffect, useState } from "react";
import { database, auth } from "./firebase";
import "./Inventory.css";

const Inventory = ({ user }) => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", stock: 0, min: 0, max: 0 });
  const [error, setError] = useState(""); // State for error message

  const userInventoryRef = database.ref(`inventory/${user.uid}`);

  useEffect(() => {
    userInventoryRef.on("value", (snapshot) => {
      const data = snapshot.val();
      const inventory = data ? Object.entries(data).map(([id, item]) => ({ id, ...item })) : [];
      setItems(inventory);
    });
    return () => userInventoryRef.off();
  }, [userInventoryRef]);

  const addItem = () => {
    if (items.some((item) => item.name.toLowerCase() === newItem.name.toLowerCase())) {
      setError("An item with this name already exists.");
      return;
    }

    if (!newItem.name || newItem.stock < 0 || newItem.min < 0 || newItem.max <= 0) {
      setError("Please fill in all fields with valid values.");
      return;
    }

    userInventoryRef.push(newItem);
    setNewItem({ name: "", stock: 0, min: 0, max: 0 });
    setError(""); // Clear error message
  };

  const deleteItem = (id) => {
    userInventoryRef.child(id).remove();
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      window.location.reload();
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h2>Welcome, {user.email}</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div className="inventory-form">
        {error && <p className="error-message">{error}</p>}
        <input
          type="text"
          placeholder="Item Name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          className="inventory-input"
        />
        <input
          type="number"
          placeholder="Stock"
          value={newItem.stock}
          onChange={(e) => setNewItem({ ...newItem, stock: parseInt(e.target.value, 10) })}
          className="inventory-input"
        />
        <input
          type="number"
          placeholder="Min"
          value={newItem.min}
          onChange={(e) => setNewItem({ ...newItem, min: parseInt(e.target.value, 10) })}
          className="inventory-input"
        />
        <input
          type="number"
          placeholder="Max"
          value={newItem.max}
          onChange={(e) => setNewItem({ ...newItem, max: parseInt(e.target.value, 10) })}
          className="inventory-input"
        />
        <button className="add-btn" onClick={addItem}>
          Add Item
        </button>
      </div>
      <div className="inventory-list">
        <h3>Inventory Items</h3>
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Stock</th>
              <th>Min</th>
              <th>Max</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.stock}</td>
                <td>{item.min}</td>
                <td>{item.max}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => deleteItem(item.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
