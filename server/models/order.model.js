import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: String,
      required: [true, "Provide orderId"],
      index: true, // Tạo index thường thay vì unique
    },
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: "product",
      required: true,
    },
    product_details: {
      name: {
        type: String,
        required: true,
      },
      image: {
        type: Array,
        default: [],
      },
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    price_per_unit: {
      type: Number,
      required: true,
      min: 0,
    },
    itemTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentId: {
      type: String,
      default: "",
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "Online"],
      default: "COD",
      required: true,
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
      required: true,
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
    // Thêm các trường mới để theo dõi thanh toán
    payment_date: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Tạo compound index cho hiệu suất truy vấn tốt hơn
orderSchema.index({ userId: 1, orderId: 1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderId: 1, createdAt: -1 });

// Middleware để tự động cập nhật payment_date khi payment_status thay đổi thành "Paid"
orderSchema.pre("save", function (next) {
  if (
    this.isModified("payment_status") &&
    this.payment_status === "Paid" &&
    !this.payment_date
  ) {
    this.payment_date = new Date();
  }
  next();
});

orderSchema.pre("updateOne", function (next) {
  const update = this.getUpdate();
  if (update.$set && update.$set.payment_status === "Paid") {
    update.$set.payment_date = new Date();
  }
  next();
});

orderSchema.pre("updateMany", function (next) {
  const update = this.getUpdate();
  if (update.$set && update.$set.payment_status === "Paid") {
    update.$set.payment_date = new Date();
  }
  next();
});

const OrderModel = mongoose.model("order", orderSchema);

export default OrderModel;
