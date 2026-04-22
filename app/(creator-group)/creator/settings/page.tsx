"use client";

import { useEffect, useState } from "react";

interface CreatorProfile {
  id: string;
  storeName: string;
  slug: string;
  bio: string | null;
  payoutEmail: string | null;
  verified: boolean;
}

export default function CreatorSettingsPage() {
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form state
  const [storeName, setStoreName] = useState("");
  const [bio, setBio] = useState("");
  const [payoutEmail, setPayoutEmail] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/creator/settings");
        if (!res.ok) throw new Error("Failed to load profile");
        const data: CreatorProfile = await res.json();
        setProfile(data);
        setStoreName(data.storeName);
        setBio(data.bio ?? "");
        setPayoutEmail(data.payoutEmail ?? "");
      } catch {
        setToast({ type: "error", message: "Failed to load your profile." });
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!storeName.trim()) {
      setToast({ type: "error", message: "Store name cannot be empty." });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/creator/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeName, bio, payoutEmail }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }

      const updated: CreatorProfile = await res.json();
      setProfile(updated);
      setStoreName(updated.storeName);
      setBio(updated.bio ?? "");
      setPayoutEmail(updated.payoutEmail ?? "");
      setToast({ type: "success", message: "Settings saved successfully." });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save settings.";
      setToast({ type: "error", message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your creator profile</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-10 rounded-md bg-muted" />
          <div className="h-24 rounded-md bg-muted" />
          <div className="h-10 rounded-md bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your creator profile</p>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`rounded-md px-4 py-3 text-sm font-medium ${
            toast.type === "success"
              ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Form */}
      {profile && (
        <form onSubmit={handleSave} className="space-y-6 max-w-lg">
          {/* Store URL (read-only) */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Store URL</label>
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
              <span>/store/</span>
              <span>{profile.slug}</span>
            </div>
            <p className="text-xs text-muted-foreground">Store URL cannot be changed after creation.</p>
          </div>

          {/* Store Name */}
          <div className="space-y-1.5">
            <label htmlFor="storeName" className="block text-sm font-medium">
              Store Name
            </label>
            <input
              id="storeName"
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="My Awesome Store"
              required
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label htmlFor="bio" className="block text-sm font-medium">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell buyers about yourself and your products..."
              rows={4}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition resize-none"
            />
          </div>

          {/* Payout Email */}
          <div className="space-y-1.5">
            <label htmlFor="payoutEmail" className="block text-sm font-medium">
              Payout Email
            </label>
            <input
              id="payoutEmail"
              type="email"
              value={payoutEmail}
              onChange={(e) => setPayoutEmail(e.target.value)}
              placeholder="payouts@example.com"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
            />
            <p className="text-xs text-muted-foreground">
              Email address used for receiving payouts.
            </p>
          </div>

          {/* Save button */}
          <div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
