import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      console.log(`✅ User role detected: ${user.role}`);

      // Initialize socket connection with enhanced configuration
      const newSocket = io(
        import.meta.env.VITE_API_URL || "http://192.168.10.10:3000",
        {
          auth: {
            token: localStorage.getItem("token"),
          },
          withCredentials: true,
          transports: ["websocket"],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000,
        }
      );
      console.log(
        "called when token from storage: ",
        localStorage.getItem("token")
      );

      // Socket connection event handlers
      // Handle connection events
      newSocket.on("connect", () => {
        console.log("Socket connected successfully", newSocket);
        // Join appropriate rooms based on user role
        newSocket.emit("join_role_room", {
          role: user.role,
          userId: user.id,
        });

        // Order-related event handlers
        newSocket.on("new_order", (order) => {
          if (user.role === "chef" || user.role === "admin") {
            toast.info(`New order #${order.orderNumber} received!`);
          }
        });

        newSocket.on(
          "order_status_update",
          ({ orderId, status, orderNumber }) => {
            let message = "";
            switch (status) {
              case "preparing":
                if (user.role === "admin" || user.role === "waiter") {
                  message = `Order #${orderNumber} is being prepared`;
                }
                break;
              case "ready":
                if (user.role === "admin" || user.role === "waiter") {
                  message = `Order #${orderNumber} is ready to serve`;
                }
                break;
              default:
                break;
            }
            if (message) {
              toast.info(message);
            }
          }
        );
        toast.success("Connected to server");
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error, user);
        toast.error("Connection error. Retrying...");
      });

      newSocket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        if (reason === "io server disconnect") {
          // Server initiated disconnect, attempt reconnection
          newSocket.connect();
        }
        toast.warning("Disconnected from server. Attempting to reconnect...");
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        if (newSocket) {
          newSocket.disconnect();
        }
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
