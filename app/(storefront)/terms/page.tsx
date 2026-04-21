export default function TermsPage() {
  return (
    <div className="flex flex-col gap-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium text-primary uppercase tracking-widest">
            Legal
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-muted-foreground">Last updated: April 2026</p>
        </div>
      </section>

      {/* Body */}
      <section className="py-16 px-4 border-t border-border">
        <div className="mx-auto max-w-3xl">
          <p className="mb-10 text-sm text-muted-foreground leading-relaxed rounded-md border border-border bg-card p-4">
            Please read these Terms of Service carefully before using the Seller
            marketplace. By accessing or using our platform, you agree to be
            bound by these terms. If you disagree with any part of these terms,
            please do not use our services.
          </p>

          <LegalSection number="1" title="Acceptance of Terms">
            <p>
              These Terms of Service (&quot;Terms&quot;) constitute a legally
              binding agreement between you and Seller (&quot;we&quot;,
              &quot;us&quot;, or &quot;our&quot;) governing your access to and
              use of the Seller marketplace, website, and related services
              (collectively, the &quot;Service&quot;). By creating an account or
              making a purchase, you confirm that you have read, understood, and
              agree to these Terms.
            </p>
          </LegalSection>

          <LegalSection number="2" title="Account Registration">
            <p>
              To access certain features of the Service, you must register for
              an account. You agree to:
            </p>
            <ul>
              <li>
                Be at least <strong>18 years of age</strong> at the time of
                registration.
              </li>
              <li>
                Provide accurate, current, and complete information during the
                registration process.
              </li>
              <li>
                Maintain and promptly update your account information to keep it
                accurate.
              </li>
              <li>
                Keep your password confidential and not share access to your
                account with any third party.
              </li>
              <li>
                Notify us immediately of any unauthorised use of your account.
              </li>
            </ul>
            <p>
              We reserve the right to terminate accounts that violate these
              requirements or that have been inactive for an extended period.
            </p>
          </LegalSection>

          <LegalSection number="3" title="Purchases & Licences">
            <p>
              All purchases made on Seller are for{" "}
              <strong>digital products</strong> licensed to you by the
              respective creator. Unless stated otherwise on the product listing:
            </p>
            <ul>
              <li>
                <strong>Personal licence:</strong> You may use the product for
                personal, non-commercial projects only.
              </li>
              <li>
                <strong>Extended commercial licence:</strong> You may use the
                product in commercial projects. This licence must be purchased
                separately where applicable.
              </li>
            </ul>
            <p>
              Licences are non-transferable and may not be sublicensed, resold,
              or shared. Each licence grants access to a single end user unless
              explicitly stated as a team or multi-seat licence.
            </p>
            <p>
              Prices are displayed in USD. Applicable taxes may be added at
              checkout depending on your location. All sales are final subject to
              our Refund Policy.
            </p>
          </LegalSection>

          <LegalSection number="4" title="Intellectual Property">
            <p>
              Creators retain full ownership and intellectual property rights
              over the products they list on Seller. By purchasing a product,
              you receive only the licence rights expressly granted on the
              product listing page — no ownership of the underlying intellectual
              property is transferred.
            </p>
            <p>
              The Seller platform, branding, logos, and all associated
              technology remain the exclusive property of Seller and are
              protected by applicable intellectual property laws.
            </p>
          </LegalSection>

          <LegalSection number="5" title="Prohibited Conduct">
            <p>You agree not to:</p>
            <ul>
              <li>
                Redistribute, resell, or share purchased digital products with
                third parties without explicit permission from the creator.
              </li>
              <li>
                Reverse engineer, decompile, or disassemble any software
                product.
              </li>
              <li>
                Use purchased assets to create competing products or templates
                for resale without a licence that explicitly permits this.
              </li>
              <li>
                Attempt to circumvent, disable, or interfere with security
                features of the Service.
              </li>
              <li>
                Upload, post, or transmit any content that is unlawful,
                fraudulent, or infringes on third-party rights.
              </li>
              <li>
                Use automated tools (bots, scrapers) to access or collect data
                from the platform without our written consent.
              </li>
              <li>
                Engage in any conduct that could damage the reputation of Seller
                or any of its creators.
              </li>
            </ul>
          </LegalSection>

          <LegalSection number="6" title="Creator Terms">
            <p>
              If you apply to become a creator and are approved, additional
              terms apply:
            </p>
            <ul>
              <li>
                <strong>Content standards:</strong> All products must be
                original work or properly licensed for resale. Products that
                infringe on third-party rights will be removed immediately.
              </li>
              <li>
                <strong>Submission guidelines:</strong> Products must include
                accurate descriptions, preview images, and correct category
                tags.
              </li>
              <li>
                <strong>Revenue share:</strong> Seller retains a platform fee on
                each sale. Your applicable revenue share percentage is displayed
                in your Creator Dashboard.
              </li>
              <li>
                <strong>Payouts:</strong> Earnings are paid out on a rolling
                basis subject to the minimum payout threshold. Payouts require a
                verified identity and connected payment method.
              </li>
              <li>
                <strong>Content moderation:</strong> We reserve the right to
                remove any product that violates these Terms or our content
                guidelines, with or without prior notice.
              </li>
            </ul>
          </LegalSection>

          <LegalSection number="7" title="Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law, Seller shall
              not be liable for any indirect, incidental, special, consequential,
              or punitive damages, including but not limited to loss of profits,
              data, or goodwill, arising out of or in connection with your use of
              the Service.
            </p>
            <p>
              Our total aggregate liability for any claim arising under these
              Terms shall not exceed the total amount you paid to Seller in the
              12 months preceding the claim.
            </p>
          </LegalSection>

          <LegalSection number="8" title="Termination">
            <p>
              We may suspend or terminate your account at our sole discretion if
              you violate these Terms, engage in fraudulent activity, or if we
              are required to do so by law. Upon termination, your right to
              access the Service ceases immediately.
            </p>
            <p>
              You may terminate your account at any time by contacting support.
              Termination does not entitle you to a refund of any fees paid
              except as provided in our Refund Policy.
            </p>
          </LegalSection>

          <LegalSection number="9" title="Changes to Terms">
            <p>
              We reserve the right to update these Terms at any time. We will
              notify registered users of material changes via email or a
              prominent notice on the platform. Your continued use of the Service
              after changes take effect constitutes your acceptance of the
              revised Terms.
            </p>
          </LegalSection>

          <LegalSection number="10" title="Contact">
            <p>
              For legal enquiries related to these Terms, please contact:
            </p>
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:legal@onedollarsell.com">
                legal@onedollarsell.com
              </a>
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
