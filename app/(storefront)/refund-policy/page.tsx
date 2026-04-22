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
          <LegalSection number="1" title="All Sales Are Final">
            <p>
              Every product sold through Seller is a{" "}
              <strong>digital good</strong> delivered as an instant download.
              Because digital files cannot be returned, once access has been
              granted the purchase is considered fulfilled and{" "}
              <strong>no refunds will be issued</strong>.
            </p>
            <p>
              By completing checkout you confirm that you have read this policy
              and expressly consent to the immediate performance of our services
              (delivery of the digital file), waiving any statutory right of
              withdrawal that might otherwise apply under consumer-protection
              laws for distance sales of digital content.
            </p>
          </LegalSection>

          <LegalSection number="2" title="Why We Cannot Accept Returns">
            <ul>
              <li>
                Digital files can be duplicated. Once a file leaves our server,
                we cannot verify whether it was retained, shared, or modified.
              </li>
              <li>
                Each sale is final at the moment payment is captured and the
                download link is generated, regardless of whether the file has
                been opened or used.
              </li>
              <li>
                This policy is applied equally to all customers and cannot be
                waived on a case-by-case basis.
              </li>
            </ul>
          </LegalSection>

          <LegalSection number="3" title="Technical Issues">
            <p>
              If a file is corrupted, fails to download, or does not match its
              public description, contact us within{" "}
              <strong>14 days of purchase</strong>. We will work with the
              creator to provide a working file or a replacement of equivalent
              value. In the rare case that a working copy cannot be delivered,
              we may issue a credit toward a future purchase at our sole
              discretion.
            </p>
            <p>
              Technical-issue requests must include your order ID and a clear
              description of the problem, ideally with a screenshot. Email{" "}
              <a href="mailto:support@onedollarsell.com">
                support@onedollarsell.com
              </a>
              .
            </p>
          </LegalSection>

          <LegalSection number="4" title="Unauthorised or Fraudulent Charges">
            <p>
              If you believe your account was used to make a purchase without
              your authorisation, email{" "}
              <a href="mailto:support@onedollarsell.com">
                support@onedollarsell.com
              </a>{" "}
              immediately. We will investigate the transaction and, if fraud is
              confirmed, reverse the charge and close the affected session.
            </p>
          </LegalSection>

          <LegalSection number="5" title="Chargebacks">
            <p>
              Before filing a chargeback with your bank or card issuer, please
              contact us first — in most cases we can resolve the matter faster
              directly. Chargebacks initiated without prior contact, or found to
              be without merit after investigation, may result in suspension of
              your Seller account and loss of access to previously purchased
              files.
            </p>
          </LegalSection>

          <LegalSection number="6" title="Your Acceptance of This Policy">
            <p>
              This policy is binding from the moment you place an order. A
              checkbox at checkout records your acknowledgement. If you do not
              accept these terms, please do not complete your purchase.
            </p>
          </LegalSection>

          <LegalSection number="7" title="Contact">
            <p>
              For all refund-related enquiries, please contact our support team
              at{" "}
              <a href="mailto:support@onedollarsell.com">
                support@onedollarsell.com
              </a>
              . We aim to respond within one business day.
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
