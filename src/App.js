import React, { useState } from "react";
import Auth from "./Auth";
import Inventory from "./Inventory";
import { auth } from "./firebase";

const App = () => {
  const [user, setUser] = useState(null);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <div>
      {user ? (
        <div>
          <button onClick={handleLogout}>Logout</button>
          <Inventory user={user} />
        </div>
      ) : (
        <Auth onLogin={(user) => setUser(user)} />
      )}
    </div>
  );
};

export default App;
