import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    orderId: {
      type: String,
      required: [true, "Provide orderId"],
      // Loại bỏ unique index
    },
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: "product",
    },
    product_details: {
      name: String,
      image: Array,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    price_per_unit: {
      type: Number,
      default: 0,
    },
    itemTotal: {
      type: Number,
      default: 0,
    },
    paymentId: {
      type: String,
      default: "",
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "Online"],
      default: "COD",
    },
    payment_status: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    order_status: {
      type: String,
      enum: ["Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
    delivery_address: {
      type: mongoose.Schema.ObjectId,
      ref: "address",
    },
    subTotalAmt: {
      type: Number,
      default: 0,
    },
    totalAmt: {
      type: Number,
      default: 0,
    },
    invoice_receipt: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Xóa các chỉ mục hiện có nếu có thể
// Lưu ý: Đây chỉ là chỉ dẫn, không phải code thực thi
// Bạn sẽ cần chạy một lệnh trực tiếp trong MongoDB để xóa chỉ mục này

const OrderModel = mongoose.model("order", orderSchema);

export default OrderModel;
