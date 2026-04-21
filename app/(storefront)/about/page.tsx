import Link from "next/link";
import { Shield, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const missionCards = [
  {
    icon: Shield,
    title: "Quality First",
    description:
      "Every product is reviewed before listing. We maintain strict standards so buyers can purchase with confidence.",
  },
  {
    icon: Users,
    title: "Creator Focused",
    description:
      "Creators keep the lion's share of revenue. Our tools, analytics, and support are built around their success.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description:
      "From Jakarta to Berlin, creators sell to buyers in 180+ countries with localised payments and instant delivery.",
  },
];

const stats = [
  { value: "50K+", label: "Products" },
  { value: "10K+", label: "Creators" },
  { value: "180+", label: "Countries" },
  { value: "99.9%", label: "Uptime" },
];

const team = [
  {
    initials: "AK",
    name: "Alex Kim",
    role: "Co-founder & CEO",
    bio: "Previously led product at Gumroad. Passionate about empowering independent creators.",
  },
  {
    initials: "SM",
    name: "Sara Müller",
    role: "Co-founder & CTO",
    bio: "Ex-Stripe engineer. Obsessed with developer experience and payment infrastructure.",
  },
  {
    initials: "JL",
    name: "James Liu",
    role: "Head of Design",
    bio: "Designed products used by millions at Figma and Linear. Believes great UX is invisible.",
  },
  {
    initials: "PN",
    name: "Priya Nair",
    role: "Head of Creator Success",
    bio: "Former creator herself — sold 3 successful courses before joining the Seller team.",
  },
];

const values = [
  {
    title: "Innovation",
    description:
      "We ship fast and iterate faster. Every week brings new features that make buying and selling easier.",
  },
  {
    title: "Trust",
    description:
      "Transparent pricing, honest communication, and a money-back guarantee that we actually honour.",
  },
  {
    title: "Community",
    description:
      "Sellers and buyers form a community. We invest in forums, creator spotlights, and live events.",
  },
  {
    title: "Excellence",
    description:
      "From codebase to customer support, we hold ourselves to the same high bar we set for creators.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-24 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium text-primary uppercase tracking-widest">
            About Us
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Building the future of{" "}
            <span className="text-primary">digital commerce</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Seller is where independent creators turn their knowledge, designs, and software into
            sustainable businesses — and where buyers find the tools they need to do their best work.
          </p>
        </div>
      </section>

      {/* Mission cards */}
      <section className="py-20 px-4 border-t border-border">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Our mission</h2>
            <p className="mt-3 text-muted-foreground">
              Three principles that guide everything we build.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {missionCards.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-md border border-border bg-card p-8 flex flex-col gap-4 hover:border-primary/40 hover:shadow-md transition-all duration-200"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-primary text-primary-foreground py-14 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-2 gap-8 text-center sm:grid-cols-4">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-4xl font-bold">{value}</p>
                <p className="mt-1 text-sm text-primary-foreground/80">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 border-t border-border">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Meet the team</h2>
            <p className="mt-3 text-muted-foreground">
              A small, fully remote crew spread across four continents.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map(({ initials, name, role, bio }) => (
              <div
                key={name}
                className="rounded-md border border-border bg-card p-6 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                  {initials}
                </div>
                <div>
                  <p className="font-semibold">{name}</p>
                  <p className="text-xs text-primary mt-0.5">{role}</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-secondary/30 py-20 px-4 border-t border-border">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">What we believe in</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ title, description }) => (
              <div key={title} className="rounded-md border border-border bg-card p-6 flex flex-col gap-3">
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 border-t border-border">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Join our growing community</h2>
          <p className="mt-4 text-muted-foreground">
            Whether you create or consume, there&apos;s a place for you on Seller.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/dashboard/become-creator">
              <Button size="lg">Become a Creator</Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="outline">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
