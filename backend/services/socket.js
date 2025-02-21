const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("Client connected");

    // Join rooms based on user role
    socket.on("join_role_room", ({ role, userId }) => {
      try {
        // Validate input
        if (!role || !userId) {
          throw new Error("Role and userId are required");
        }

        // Leave previous rooms except socket.id
        const currentRooms = Array.from(socket.rooms);
        currentRooms.forEach((room) => {
          if (room !== socket.id) {
            socket.leave(room);
          }
        });

        // Join role-specific room and user-specific room
        socket.join([role, `user_${userId}`]);
        console.log(`Client joined rooms: ${role}, user_${userId}`);
      } catch (error) {
        console.error("Error in join_role_room:", error.message);
      }
    });

    // Handle new orders
    socket.on("new_order", (order) => {
      try {
        if (!order || !order.orderNumber) {
          throw new Error("Invalid order data");
        }

        // Emit to kitchen staff and admin
        io.to(["chef", "admin"]).emit("new_order", order);

        // Also emit to the specific waiter who created the order
        if (order.server?._id) {
          io.to(`user_${order.server._id}`).emit("new_order", order);
        }

        console.log(
          `New order ${order.orderNumber} broadcasted to relevant staff`
        );
      } catch (error) {
        console.error("Error in new_order:", error.message);
      }
    });

    // Unified order status update handler
    socket.on("update_order_status", (data) => {
      try {
        if (!data?.orderId || !data?.status) {
          throw new Error("Invalid status update data");
        }

        const statusUpdate = {
          orderId: data.orderId,
          status: data.status,
          orderNumber: data.orderNumber,
          updatedAt: new Date(),
          message: getStatusMessage(data.status, data.orderNumber),
        };

        // Emit to all relevant roles
        io.to(["admin", "chef", "waiter"]).emit(
          "order_status_update",
          statusUpdate
        );
        console.log(
          `Order ${data.orderNumber} status updated to ${data.status}`
        );
      } catch (error) {
        console.error("Error in update_order_status:", error.message);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`Client disconnected. Reason: ${reason}`);
    });

    // Error handling for socket events
    socket.on("error", (error) => {
      console.error("Socket error:", error.message);
    });
  });
};

// Helper function to generate status messages
const getStatusMessage = (status, orderNumber) => {
  const messages = {
    pending: `Order #${orderNumber} is pending`,
    preparing: `Order #${orderNumber} is now being prepared`,
    ready: `Order #${orderNumber} is ready to serve`,
    completed: `Order #${orderNumber} has been completed`,
    cancelled: `Order #${orderNumber} has been cancelled`,
  };
  return (
    messages[status] || `Order #${orderNumber} status changed to ${status}`
  );
};

module.exports = initializeSocket;

module.exports = initializeSocket;
