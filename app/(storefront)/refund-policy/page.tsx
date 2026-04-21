export default function RefundPolicyPage() {
  return (
    <div className="flex flex-col gap-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium text-primary uppercase tracking-widest">
            Legal
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Refund Policy
          </h1>
          <p className="mt-4 text-muted-foreground">Last updated: April 2026</p>
        </div>
      </section>

      {/* Body */}
      <section className="py-16 px-4 border-t border-border">
        <div className="mx-auto max-w-3xl prose-styles">
          <LegalSection number="1" title="Overview">
            <p>
              We want you to be completely satisfied with every purchase on
              Seller. Most digital products are covered by a{" "}
              <strong>30-day money-back guarantee</strong>. If you are not happy
              with a purchase for any reason, contact us within 30 days of the
              transaction date and we will issue a full refund — no questions
              asked.
            </p>
          </LegalSection>

          <LegalSection number="2" title="Eligibility">
            <p>To be eligible for a refund, the following conditions must be met:</p>
            <ul>
              <li>The refund request is made within 30 days of the purchase date.</li>
              <li>
                The product is a digital download sold through the Seller
                marketplace.
              </li>
              <li>
                The request is submitted via email to{" "}
                <a href="mailto:support@onedollarsell.com">
                  support@onedollarsell.com
                </a>{" "}
                with your order ID included.
              </li>
            </ul>
          </LegalSection>

          <LegalSection number="3" title="Non-Refundable Items">
            <p>The following are generally not eligible for refunds:</p>
            <ul>
              <li>
                Products where the primary file has been downloaded and the buyer
                cannot demonstrate a legitimate technical defect.
              </li>
              <li>
                Subscription plans after the billing period has been used or
                features have been accessed.
              </li>
              <li>
                Products that were purchased more than 30 days before the refund
                request.
              </li>
              <li>
                Requests made solely because the buyer changed their mind after
                full download and use.
              </li>
              <li>Gift cards and promotional credits.</li>
            </ul>
            <p>
              We reserve the right to deny refunds that we determine are being
              abused or made in bad faith.
            </p>
          </LegalSection>

          <LegalSection number="4" title="How to Request a Refund">
            <p>To request a refund:</p>
            <ol>
              <li>
                Email{" "}
                <a href="mailto:support@onedollarsell.com">
                  support@onedollarsell.com
                </a>{" "}
                with the subject line <em>"Refund Request – [Order ID]"</em>.
              </li>
              <li>
                Include your order ID (found in your Dashboard → Purchases or in
                your confirmation email).
              </li>
              <li>
                Briefly describe the reason for the refund (optional but
                helpful).
              </li>
            </ol>
            <p>
              Our team will review your request and respond within two business
              days.
            </p>
          </LegalSection>

          <LegalSection number="5" title="Processing Time">
            <p>
              Once a refund is approved, it will be processed back to your
              original payment method within{" "}
              <strong>5–10 business days</strong>, depending on your bank or
              payment provider. You will receive a confirmation email when the
              refund has been issued.
            </p>
          </LegalSection>

          <LegalSection number="6" title="Chargebacks">
            <p>
              We strongly encourage customers to contact us before initiating a
              chargeback with their bank or payment provider. Chargebacks
              typically take significantly longer to resolve and may result in
              account suspension while the dispute is investigated.
            </p>
            <p>
              If you have already filed a chargeback and believe it was made in
              error, please email us and we will work to resolve the situation as
              quickly as possible.
            </p>
          </LegalSection>

          <LegalSection number="7" title="Contact">
            <p>
              For all refund-related enquiries, please contact our support team:
            </p>
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:support@onedollarsell.com">
                support@onedollarsell.com
              </a>
            </p>
            <p>
              We aim to respond to all support requests within one business day.
            </p>
          </LegalSection>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared section component
// ---------------------------------------------------------------------------

function LegalSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 flex items-baseline gap-3 text-xl font-bold text-foreground border-b border-border pb-2">
        <span className="text-primary text-base font-semibold">{number}.</span>
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-muted-foreground leading-relaxed [&_a]:text-primary [&_a]:hover:underline [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1 [&_ol]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_strong]:text-foreground [&_em]:text-foreground/70">
        {children}
      </div>
    </section>
  );
}
