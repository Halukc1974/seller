import { CartView } from "@/components/cart/cart-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your cart",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Your cart</h1>
      <CartView />
    </div>
  );
}
