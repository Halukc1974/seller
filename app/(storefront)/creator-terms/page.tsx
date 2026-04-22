import Link from "next/link";

export const metadata = {
  title: "Creator Terms",
  description:
    "Terms that apply to creators selling digital products on Seller.",
};

export default function CreatorTermsPage() {
  return (
    <div className="flex flex-col gap-0">
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium text-primary uppercase tracking-widest">
            Legal
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Creator Terms
          </h1>
          <p className="mt-4 text-muted-foreground">Last updated: April 2026</p>
        </div>
      </section>

      <section className="py-16 px-4 border-t border-border">
        <div className="mx-auto max-w-3xl prose-styles">
          <LegalSection number="1" title="Who This Applies To">
            <p>
              These Creator Terms apply to every user who opens a store on
              Seller and lists one or more digital products for sale. Opening a
              creator profile, listing a product, or accepting a payout means
              you agree to this document in addition to our general{" "}
              <Link href="/terms">Terms of Service</Link> and{" "}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </LegalSection>

          <LegalSection number="2" title="What You May Sell">
            <p>You may only list products that:</p>
            <ul>
              <li>
                You fully own, or for which you hold all required licences and
                written permissions from every rights holder.
              </li>
              <li>
                Are delivered as a downloadable digital file (templates,
                software, assets, courses, licences or similar).
              </li>
              <li>Comply with applicable law in both the buyer&apos;s and your jurisdictions.</li>
              <li>
                Are accurately described — the public listing must match the
                delivered file in every material respect.
              </li>
            </ul>
          </LegalSection>

          <LegalSection number="3" title="What You Must Not Sell">
            <ul>
              <li>
                Content that infringes any copyright, trademark, patent, trade
                secret, publicity or privacy right.
              </li>
              <li>
                Content you do not have clean provenance for (AI-generated
                training sets trained on third-party material without licence,
                scraped data, leaked source code, etc.).
              </li>
              <li>
                Adult content, illegal goods, malware, phishing kits, or any
                material designed to harm third parties.
              </li>
              <li>
                Products that require you to deliver a physical good, a service,
                or ongoing manual work — Seller is a digital-only marketplace.
              </li>
            </ul>
          </LegalSection>

          <LegalSection number="4" title="Revenue Share and Payouts">
            <p>
              Unless a different arrangement is agreed in writing, Seller takes
              a platform fee equal to <strong>20%</strong> of the gross sale
              price and remits the remaining <strong>80%</strong> to you. The
              platform fee covers payment processing, hosting, fraud review and
              distribution bandwidth.
            </p>
            <p>
              Payouts are calculated on completed, non-refunded transactions.
              We hold earnings for a minimum clearance period after each sale
              to cover potential refunds, chargebacks and fraud investigation.
              Payouts are made to the email address on your creator profile in
              the payment method nominated when payouts begin.
            </p>
            <p>
              Chargebacks, fraud reversals and refunds are deducted from your
              next payout cycle. If your balance is insufficient, the amount is
              recovered from subsequent sales.
            </p>
          </LegalSection>

          <LegalSection number="5" title="Refund Policy for Your Buyers">
            <p>
              Seller&apos;s <Link href="/refund-policy">refund policy</Link>{" "}
              applies to every sale. Buyers consent at checkout that digital
              goods are non-refundable once delivered. You may not promise a
              separate refund policy to buyers; any such promise is void.
            </p>
            <p>
              In the narrow technical-issue cases described in the refund
              policy, Seller will coordinate with you to provide a replacement
              file. If a replacement cannot be delivered, Seller may issue a
              store credit at its discretion and deduct the amount from your
              pending payout.
            </p>
          </LegalSection>

          <LegalSection number="6" title="Licence You Grant to Seller">
            <p>
              You grant Seller a non-exclusive, worldwide, royalty-free licence
              to host, reproduce, display, transmit and distribute your
              product files and listing materials solely for the purpose of
              operating the marketplace and delivering purchased files to
              buyers. You retain ownership of your intellectual property.
            </p>
          </LegalSection>

          <LegalSection number="7" title="Licence Buyers Receive">
            <p>
              Unless you specify a stricter licence in your listing, buyers
              receive a personal, non-transferable licence to use the
              downloaded file for their own purposes. They may not
              redistribute, resell, sublicence or bundle your file into a new
              product. You may attach a stricter commercial or restricted
              licence — Seller will display and enforce it as written on the
              listing.
            </p>
          </LegalSection>

          <LegalSection number="8" title="Moderation, Suspension and Removal">
            <p>
              Seller may remove any listing, pause payouts, or suspend a
              creator account without prior notice when we reasonably believe a
              product or the creator&apos;s conduct violates these terms, our
              Terms of Service, or applicable law. Repeat or serious violations
              may result in permanent termination and forfeiture of pending
              earnings related to the violating sales.
            </p>
          </LegalSection>

          <LegalSection number="9" title="Taxes">
            <p>
              You are solely responsible for determining, reporting and paying
              any income, VAT/GST, sales or other taxes that apply to your
              earnings. Seller may collect and remit consumption taxes to
              jurisdictions where required by law; these are separate from the
              revenue share above.
            </p>
          </LegalSection>

          <LegalSection number="10" title="Changes to These Terms">
            <p>
              Seller may update these Creator Terms from time to time. Material
              changes will be communicated through the creator dashboard or by
              email. Continued use of the platform after the effective date of
              any update constitutes acceptance.
            </p>
          </LegalSection>

          <LegalSection number="11" title="Contact">
            <p>
              Questions about these terms? Email{" "}
              <a href="mailto:creators@onedollarsell.com">
                creators@onedollarsell.com
              </a>
              .
            </p>
          </LegalSection>
        </div>
      </section>
    </div>
  );
}

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
