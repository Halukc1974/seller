import { CheckoutView } from "@/components/checkout/checkout-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Checkout</h1>
      <CheckoutView />
    </div>
  );
}
