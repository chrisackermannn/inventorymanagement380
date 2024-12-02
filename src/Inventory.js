import React, { useEffect, useState } from "react";
import { database } from "./firebase";
import "./Inventory.css";

const Inventory = ({ user }) => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", stock: 0, min: 0, max: 0, link: "" });
  const [error, setError] = useState("");
  const [editingItem, setEditingItem] = useState(null); // To track which item is being edited

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
    setNewItem({ name: "", stock: 0, min: 0, max: 0, link: "" });
    setError("");
  };

  const deleteItem = (id) => {
    userInventoryRef.child(id).remove();
  };

  const updateItem = () => {
    if (editingItem) {
      const { id, ...updatedData } = editingItem;
      userInventoryRef.child(id).update(updatedData);
      setEditingItem(null); // Exit edit mode after saving
    }
  };

  // Determine the priority status of an item
  const getPriorityStatus = (item) => {
    if (item.stock < item.min || item.stock > item.max) return "priority-high";
    return "priority-normal";
  };

  return (
    <div className="inventory-container">
      <h2>Inventory Management</h2>
      <div className="inventory-form">
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label>Item Name</label>
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="inventory-input"
          />
        </div>
        <div className="form-group">
          <label>Quantity</label>
          <input
            type="number"
            value={newItem.stock}
            onChange={(e) => setNewItem({ ...newItem, stock: parseInt(e.target.value, 10) })}
            className="inventory-input"
          />
        </div>
        <div className="form-group">
          <label>Min</label>
          <input
            type="number"
            value={newItem.min}
            onChange={(e) => setNewItem({ ...newItem, min: parseInt(e.target.value, 10) })}
            className="inventory-input"
          />
        </div>
        <div className="form-group">
          <label>Max</label>
          <input
            type="number"
            value={newItem.max}
            onChange={(e) => setNewItem({ ...newItem, max: parseInt(e.target.value, 10) })}
            className="inventory-input"
          />
        </div>
        <div className="form-group">
          <label>Quick Order Link</label>
          <input
            type="url"
            value={newItem.link}
            onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
            className="inventory-input"
          />
        </div>
        <button className="add-btn" onClick={addItem}>
          Add Item
        </button>
      </div>

      <div className="inventory-list">
        <h3>Inventory Items</h3>
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Min</th>
              <th>Max</th>
              <th>Order Link</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <span className={`priority-dot ${getPriorityStatus(item)}`}></span>
                </td>
                <td>
                  {editingItem?.id === item.id ? (
                    <input
                      type="text"
                      value={editingItem.name}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, name: e.target.value })
                      }
                      className="edit-input"
                    />
                  ) : (
                    item.name
                  )}
                </td>
                <td>
                  {editingItem?.id === item.id ? (
                    <input
                      type="number"
                      value={editingItem.stock}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          stock: parseInt(e.target.value, 10),
                        })
                      }
                      className="edit-input"
                    />
                  ) : (
                    item.stock
                  )}
                </td>
                <td>{item.min}</td>
                <td>{item.max}</td>
                <td>
                  {editingItem?.id === item.id ? (
                    <input
                      type="url"
                      value={editingItem.link}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, link: e.target.value })
                      }
                      className="edit-input"
                    />
                  ) : (
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                      Order Now
                    </a>
                  )}
                </td>
                <td>
                  {editingItem?.id === item.id ? (
                    <>
                      <button className="save-btn" onClick={updateItem}>
                        Save
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={() => setEditingItem(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="edit-btn"
                        onClick={() => setEditingItem(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => deleteItem(item.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
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
