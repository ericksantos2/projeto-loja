import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("produtos", "routes/products.tsx"),
  route("produtos/:slug", "routes/product-detail.tsx"),
] satisfies RouteConfig;
