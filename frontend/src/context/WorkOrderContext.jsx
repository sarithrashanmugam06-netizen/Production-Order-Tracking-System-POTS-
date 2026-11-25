import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";
import { useAuth } from "./AuthContext";

const WorkOrderContext = createContext(null);

export function WorkOrderProvider({ children }) {
  const { user } = useAuth();
  const [workOrders, setWorkOrders] = useState([]);

  const refreshWorkOrders = useCallback(async () => {
    try {
      const response = await api.get("/workorders/");

      setWorkOrders(
        response.data.map((item) => ({
          ...item,
          product: item.product_name ?? `Product ${item.product_id}`,
        }))
      );
    } catch (error) {
      console.error("Error fetching work orders:", error);
    }
  }, []);

  // Load real data as soon as someone is logged in, so the dashboard is
  // correct without having to visit the Work Orders page first.
  useEffect(() => {
    if (user) {
      refreshWorkOrders();
    }
  }, [user, refreshWorkOrders]);

  return (
    <WorkOrderContext.Provider
      value={{ workOrders, setWorkOrders, refreshWorkOrders }}
    >
      {children}
    </WorkOrderContext.Provider>
  );
}

export function useWorkOrders() {
  return useContext(WorkOrderContext);
}
