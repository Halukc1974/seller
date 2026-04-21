import Link from "next/link";
import { Globe, Clock, Heart, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const perks = [
  {
    icon: Globe,
    title: "Remote First",
    description:
      "Work from anywhere in the world. We&apos;ve been fully remote since day one, with async-friendly processes.",
  },
  {
    icon: Clock,
    title: "Flexible Hours",
    description:
      "Own your schedule. We care about output, not clocking in. Overlap windows keep collaboration easy.",
  },
  {
    icon: Heart,
    title: "Health & Wellness",
    description:
      "Generous health coverage plus a monthly wellness stipend for gym memberships, therapy, or whatever recharges you.",
  },
  {
    icon: GraduationCap,
    title: "Learning Budget",
    description:
      "$2,000 per year for courses, books, conferences, and anything that sharpens your craft.",
  },
];

interface Job {
  title: string;
  department: string;
  location: string;
  type: string;
}

const jobs: Job[] = [
  {
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Developer Advocate",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Data Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Customer Success Manager",
    department: "Support",
    location: "Remote",
    type: "Full-time",
  },
];

const DEPT_COLORS: Record<string, "default" | "secondary" | "outline"> = {
  Engineering: "default",
  Design: "secondary",
  Marketing: "outline",
  Support: "secondary",
};

export default function CareersPage() {
  return (
    <div className="flex flex-col gap-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-24 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium text-primary uppercase tracking-widest">
            Careers
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Join our team
          </h1>
          <p className="mt-4 text-xl text-muted-foreground font-medium">
            Help us build the future of digital commerce.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed max-w-xl mx-auto">
            We&apos;re a remote-first team of builders, designers, and creators passionate about empowering
            independent creators worldwide. We move fast, ship often, and celebrate wins together
            across time zones.
          </p>
        </div>
      </section>

      {/* Perks */}
      <section className="py-20 px-4 border-t border-border">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Why you&apos;ll love it here</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-md border border-border bg-card p-6 flex flex-col gap-4 hover:border-primary/40 hover:shadow-md transition-all duration-200"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="font-semibold">{title}</h3>
                <p
                  className="text-sm text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open positions */}
      <section className="bg-secondary/30 py-20 px-4 border-t border-border">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold">Open positions</h2>
            <p className="mt-3 text-muted-foreground">
              All roles are fully remote and open to candidates worldwide.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {jobs.map((job) => (
              <div
                key={job.title}
                className="rounded-md border border-border bg-card p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:shadow-md hover:border-primary/40 transition-all duration-200"
              >
                <div className="flex flex-col gap-2">
                  <h3 className="font-semibold text-foreground">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={DEPT_COLORS[job.department] ?? "outline"}>
                      {job.department}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{job.location}</span>
                    <span className="text-muted-foreground text-xs">·</span>
                    <span className="text-sm text-muted-foreground">{job.type}</span>
                  </div>
                </div>
                <Link href={`mailto:careers@onedollarsell.com?subject=Application: ${encodeURIComponent(job.title)}`}>
                  <Button variant="outline" size="sm" className="shrink-0">
                    Apply Now
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Don't see your role CTA */}
      <section className="py-20 px-4 border-t border-border">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold">Don&apos;t see your role?</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            We&apos;re always on the lookout for exceptional people. If you believe you can make Seller
            better, send us your resume and a short note about what you&apos;d love to work on.
          </p>
          <div className="mt-6">
            <Link href="mailto:careers@onedollarsell.com">
              <Button size="lg">
                Email careers@onedollarsell.com
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
