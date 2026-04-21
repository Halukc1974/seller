import { Mail, Clock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "support@onedollarsell.com",
    sub: "We read every message.",
  },
  {
    icon: Clock,
    label: "Response time",
    value: "< 24 hours",
    sub: "On business days.",
  },
  {
    icon: Globe,
    label: "Office",
    value: "Remote — Global team",
    sub: "No physical HQ.",
  },
];

const faqs = [
  {
    q: "How do I become a creator on Seller?",
    a: "Head to your dashboard and click \"Become a Creator\". After a quick profile setup and identity check, you can start listing products immediately.",
  },
  {
    q: "What payment methods do you support?",
    a: "We accept all major credit and debit cards, PayPal, and bank transfers in select regions. Payouts are sent via Stripe, Wise, or PayPal.",
  },
  {
    q: "Can I get a refund on a digital product?",
    a: "Yes. We offer a 30-day no-questions-asked refund policy on all purchases. Contact support with your order ID and we'll process it within 24 hours.",
  },
  {
    q: "How does Seller handle copyright disputes?",
    a: "We take IP seriously. If you believe a listing infringes your copyright, submit a DMCA notice via our contact form and our team will respond within 48 hours.",
  },
];

export default function ContactPage() {
  return (
    <div className="flex flex-col gap-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium text-primary uppercase tracking-widest">
            Contact
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Get in touch</h1>
          <p className="mt-5 text-lg text-muted-foreground">
            We&apos;d love to hear from you. Fill out the form or reach us directly.
          </p>
        </div>
      </section>

      {/* Two-column: form + info */}
      <section className="py-16 px-4 border-t border-border">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Contact form */}
            <div className="rounded-md border border-border bg-card p-8">
              <h2 className="text-xl font-bold mb-6">Send us a message</h2>
              <form className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" htmlFor="name">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    className="rounded-sm border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="rounded-sm border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" htmlFor="subject">
                    Subject
                  </label>
                  <select
                    id="subject"
                    className="rounded-sm border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="">Select a topic</option>
                    <option value="general">General inquiry</option>
                    <option value="billing">Billing &amp; payments</option>
                    <option value="creator">Creator support</option>
                    <option value="refund">Refund request</option>
                    <option value="dmca">Copyright / DMCA</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Tell us how we can help…"
                    className="rounded-sm border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full sm:w-auto self-start">
                  Send message
                </Button>
              </form>
            </div>

            {/* Contact info */}
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold mb-6">Contact information</h2>
                <div className="flex flex-col gap-4">
                  {contactInfo.map(({ icon: Icon, label, value, sub }) => (
                    <div
                      key={label}
                      className="rounded-md border border-border bg-card p-5 flex items-start gap-4"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                        <p className="font-medium text-sm">{value}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social links */}
              <div className="rounded-md border border-border bg-card p-5">
                <p className="text-sm font-medium mb-3">Follow us</p>
                <div className="flex flex-wrap gap-3">
                  {["Twitter / X", "LinkedIn", "GitHub"].map((platform) => (
                    <span
                      key={platform}
                      className="rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs text-muted-foreground"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-secondary/30 py-20 px-4 border-t border-border">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold">Frequently asked questions</h2>
            <p className="mt-3 text-muted-foreground">
              Quick answers to common questions.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {faqs.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-md border border-border bg-card overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer font-medium text-foreground select-none list-none">
                  {q}
                  <span className="text-primary group-open:rotate-45 transition-transform duration-200 shrink-0 text-xl leading-none">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
