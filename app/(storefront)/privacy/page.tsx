export default function PrivacyPage() {
  return (
    <div className="flex flex-col gap-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium text-primary uppercase tracking-widest">
            Legal
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-muted-foreground">Last updated: April 2026</p>
        </div>
      </section>

      {/* Body */}
      <section className="py-16 px-4 border-t border-border">
        <div className="mx-auto max-w-3xl">
          <p className="mb-10 text-sm text-muted-foreground leading-relaxed rounded-md border border-border bg-card p-4">
            Your privacy matters to us. This Privacy Policy explains how Seller
            collects, uses, and protects information about you when you use our
            marketplace. Please read it carefully.
          </p>

          <LegalSection number="1" title="Information We Collect">
            <p>We collect the following categories of information:</p>
            <h3 className="font-semibold text-foreground">Account information</h3>
            <p>
              Name, email address, username, profile picture, and password
              (stored as a hashed value) when you create an account.
            </p>
            <h3 className="font-semibold text-foreground">Payment information</h3>
            <p>
              We do not store your card details. Payment data is handled
              directly by Paddle, our payment processor. We receive only
              transaction identifiers and summary information needed to fulfil
              your order.
            </p>
            <h3 className="font-semibold text-foreground">Usage data</h3>
            <p>
              Pages visited, products viewed, search queries, purchase history,
              device type, browser, IP address, and referral source. This data
              is collected automatically when you interact with the Service.
            </p>
            <h3 className="font-semibold text-foreground">Creator information</h3>
            <p>
              If you register as a creator, we also collect payout details (bank
              account or PayPal), tax identification information where required
              by law, and your store profile information.
            </p>
          </LegalSection>

          <LegalSection number="2" title="How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul>
              <li>Create and manage your account.</li>
              <li>Process purchases and deliver digital products.</li>
              <li>Send transactional emails (receipts, download links).</li>
              <li>
                Communicate with you about updates, new features, or support
                requests.
              </li>
              <li>
                Personalise your experience on the platform (e.g., recommended
                products).
              </li>
              <li>
                Detect and prevent fraud, abuse, and security incidents.
              </li>
              <li>
                Comply with legal obligations, including tax reporting
                requirements.
              </li>
              <li>
                Analyse and improve the performance and features of our Service.
              </li>
            </ul>
            <p>
              We will not use your personal information for any purpose not
              described in this policy without obtaining your prior consent.
            </p>
          </LegalSection>

          <LegalSection number="3" title="Information Sharing">
            <p>
              We do <strong>not</strong> sell, rent, or trade your personal
              information to third parties. We share information only in the
              following limited circumstances:
            </p>
            <ul>
              <li>
                <strong>Payment processors:</strong> We share necessary
                transaction data with Paddle to process payments.
              </li>
              <li>
                <strong>Service providers:</strong> Trusted providers who help
                us operate the platform (e.g., cloud hosting, email delivery,
                analytics) under strict data processing agreements.
              </li>
              <li>
                <strong>Legal requirements:</strong> We may disclose information
                if required by law, court order, or governmental authority.
              </li>
              <li>
                <strong>Business transfers:</strong> In the event of a merger,
                acquisition, or sale of assets, your data may be transferred as
                part of that transaction.
              </li>
            </ul>
          </LegalSection>

          <LegalSection number="4" title="Data Security">
            <p>
              We implement industry-standard security measures to protect your
              personal information, including:
            </p>
            <ul>
              <li>
                TLS/HTTPS encryption for all data transmitted between your
                browser and our servers.
              </li>
              <li>
                Passwords hashed using bcrypt — we cannot retrieve your
                plaintext password.
              </li>
              <li>
                Access controls limiting employee access to personal data on a
                need-to-know basis.
              </li>
              <li>Regular security audits and vulnerability assessments.</li>
            </ul>
            <p>
              No method of transmission over the internet is 100% secure. While
              we strive to protect your data, we cannot guarantee absolute
              security.
            </p>
          </LegalSection>

          <LegalSection number="5" title="Cookies">
            <p>We use cookies and similar tracking technologies to:</p>
            <ul>
              <li>
                <strong>Essential cookies:</strong> Keep you logged in and
                maintain your shopping session. These are required for the
                Service to function.
              </li>
              <li>
                <strong>Analytics cookies:</strong> Understand how visitors use
                our platform so we can improve it. We use privacy-preserving
                analytics that do not track you across other websites.
              </li>
            </ul>
            <p>
              You can control cookie settings through your browser preferences.
              Disabling essential cookies may affect your ability to use the
              Service.
            </p>
          </LegalSection>

          <LegalSection number="6" title="Your Rights">
            <p>
              Depending on your location, you may have the following rights
              regarding your personal information:
            </p>
            <ul>
              <li>
                <strong>Access:</strong> Request a copy of the personal data we
                hold about you.
              </li>
              <li>
                <strong>Correction:</strong> Request that we correct inaccurate
                or incomplete data.
              </li>
              <li>
                <strong>Deletion:</strong> Request that we delete your personal
                data (&quot;right to be forgotten&quot;).
              </li>
              <li>
                <strong>Portability:</strong> Receive your data in a structured,
                machine-readable format.
              </li>
              <li>
                <strong>Objection:</strong> Object to processing of your data
                for direct marketing purposes.
              </li>
              <li>
                <strong>Restriction:</strong> Request that we restrict how we
                process your data in certain circumstances.
              </li>
            </ul>
            <p>
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:privacy@onedollarsell.com">
                privacy@onedollarsell.com
              </a>
              . We will respond within 30 days. If you are in the EU/EEA, you
              also have the right to lodge a complaint with your local data
              protection authority.
            </p>
          </LegalSection>

          <LegalSection number="7" title="Data Retention">
            <p>
              We retain your personal data for as long as your account is active
              or as needed to provide the Service. We retain purchase records
              for a minimum of seven years to comply with financial regulations.
              Upon account deletion, personal data is removed from our active
              systems within 90 days, after which it may remain in encrypted
              backups for up to 12 months.
            </p>
          </LegalSection>

          <LegalSection number="8" title="Children's Privacy">
            <p>
              The Seller marketplace is not directed at children under the age
              of 13. We do not knowingly collect personal information from
              children under 13. If you believe we have inadvertently collected
              information from a child under 13, please contact us immediately
              and we will delete it promptly.
            </p>
          </LegalSection>

          <LegalSection number="9" title="Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. When we make
              material changes, we will notify you via email or a prominent
              notice on the platform at least 14 days before the changes take
              effect. Your continued use of the Service after changes take effect
              constitutes your acceptance of the revised policy.
            </p>
          </LegalSection>

          <LegalSection number="10" title="Contact">
            <p>
              If you have any questions or concerns about this Privacy Policy or
              our data practices, please contact our privacy team:
            </p>
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:privacy@onedollarsell.com">
                privacy@onedollarsell.com
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
      <div className="flex flex-col gap-3 text-muted-foreground leading-relaxed [&_a]:text-primary [&_a]:hover:underline [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1 [&_ol]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_strong]:text-foreground [&_em]:text-foreground/70 [&_h3]:text-foreground [&_h3]:font-semibold [&_h3]:mt-2">
        {children}
      </div>
    </section>
  );
}
