const router = require("express").Router();
const authRoutes = require("./modules/auth/auth.routes");
const productRoutes = require("./modules/product/product.routes");
const cartRoutes = require("./modules/cart/cart.routes");
const orderRoutes = require("./modules/order/order.routes");
const userRoutes = require("./modules/user/user.routes");
const wishlistRoutes = require("./modules/wishlist/wishlist.routes");
const eventRoutes = require("./modules/event/event.routes");
const bookingRoutes = require("./modules/booking/booking.routes");
const categoryRoutes = require("./modules/category/category.routes");
const bannerRoutes = require("./modules/banner/banner.routes");
const adminRoutes = require("./modules/admin/admin.routes");
const chatRoutes = require("./modules/chat/chat.routes");

const routeRegistry = [
  ["/auth", authRoutes],
  ["/products", productRoutes],
  ["/cart", cartRoutes],
  ["/orders", orderRoutes],
  ["/users", userRoutes],
  ["/wishlist", wishlistRoutes],
  ["/events", eventRoutes],
  ["/bookings", bookingRoutes],
  ["/categories", categoryRoutes],
  ["/banners", bannerRoutes],
  ["/admin", adminRoutes],
  ["/chat", chatRoutes],
];

routeRegistry.forEach(([path, routes]) => router.use(path, routes));

module.exports = router;

export {};
