import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  createOrderController,
  getUserOrdersController,
  getOrderDetailController,
  cancelOrderController,
} from "../controllers/order.controller.js";

const orderRouter = Router();

// Tạo đơn hàng mới
orderRouter.post("/create", auth, createOrderController);

// Lấy tất cả đơn hàng của người dùng
orderRouter.get("/my-orders", auth, getUserOrdersController);

// Lấy chi tiết đơn hàng
orderRouter.get("/detail/:orderId", auth, getOrderDetailController);

// Hủy đơn hàng
orderRouter.put("/cancel", auth, cancelOrderController);

export default orderRouter;
