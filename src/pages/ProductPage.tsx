import { useParams, Navigate } from "react-router-dom";
import Product from "@/components/product/Product";
import { getProductById } from "@/data/products";

const ProductPage = () => {
  const { productId } = useParams<{ productId: string }>();
  console.log("ProductPage loaded with productId:", productId);
  const product = productId ? getProductById(productId) : undefined;

  if (!product) {
    return <Navigate to="/qr/qr-standy" replace />;
  }

  return <Product key={product.id} product={product} />;
};

export default ProductPage;
