"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAdminUsers,
  setUserBlocked,
  type AdminUser,
} from "@/lib/api/admin-api";

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminUsersList() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [target, setTarget] = useState<AdminUser | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(
    async (active: boolean, filters: { search?: string; role?: string }) => {
      setError(null);
      setRefreshing(true);

      try {
        const data = await getAdminUsers(filters);
        if (active) setUsers(data);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Could not load users.");
        }
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      void load(active, { search: debouncedSearch, role });
    });
    return () => {
      active = false;
    };
  }, [load, debouncedSearch, role]);

  const confirmToggle = async () => {
    if (!target) return;

    const nextBlocked = !target.isBlocked;
    setBusyId(target.id);
    setTarget(null);

    try {
      const updated = await setUserBlocked(target.id, nextBlocked);
      setUsers((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
      toast.success(nextBlocked ? "User blocked" : "User unblocked", {
        description: updated.email ?? undefined,
      });
    } catch (err) {
      toast.error("Could not update user", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setBusyId(null);
    }
  };

  if (error) {
    return (
      <Card className="theme-card flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 shrink-0 text-destructive" size={20} />
          <div>
            <p className="font-medium text-(--text-primary)">
              We couldn&apos;t load users
            </p>
            <p className="muted-text text-sm">{error}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSearch("");
            setDebouncedSearch("");
            setRole("");
          }}
          className="rounded-full"
        >
          <RefreshCw /> Reset
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="theme-card p-4 sm:p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="admin-user-search">Search by name or email</FieldLabel>
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-(--text-secondary)"
              />
              <Input
                id="admin-user-search"
                className="pl-9"
                placeholder="e.g. vendor@example.com"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="admin-user-role">Role</FieldLabel>
            <Select value={role} onValueChange={(value) => setRole(value ?? "")}>
              <SelectTrigger id="admin-user-role">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vendor">Vendor</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <p className="muted-text mt-4 text-xs">
          {refreshing ? "Searching users..." : `${users.length} user(s) found`}
        </p>
      </Card>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="theme-card h-24 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && users.length === 0 && (
        <div className="theme-card px-6 py-14 text-center">
          <p className="font-medium text-(--text-primary)">No users found</p>
          <p className="muted-text mt-1 text-sm">
            Try a different name, email or role.
          </p>
        </div>
      )}

      {!loading && users.length > 0 && (
        <div className="space-y-3">
          {users.map((user) => {
            const isOpen = expanded === user.id;

            return (
              <Card key={user.id} className="theme-card">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-(--brand-soft) text-(--brand)">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name ?? "User"}
                          width={40}
                          height={40}
                          unoptimized
                          className="size-10 object-cover"
                        />
                      ) : (
                        <UserRound size={18} />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-(--text-primary)">
                        {user.name || "Unnamed user"}
                      </p>
                      <p className="muted-text truncate text-xs">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {user.role === "admin" ? (
                        <ShieldCheck size={12} />
                      ) : user.role === "vendor" ? (
                        <Store size={12} />
                      ) : (
                        <UserRound size={12} />
                      )}
                      {user.role}
                    </Badge>
                    {user.isBlocked ? (
                      <Badge className="bg-destructive text-destructive-foreground">
                        <Ban size={12} /> Blocked
                      </Badge>
                    ) : (
                      <Badge className="bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]">
                        <CheckCircle2 size={12} /> Active
                      </Badge>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpanded(isOpen ? null : user.id)}
                      className="rounded-full"
                    >
                      {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      Details
                    </Button>

                    {user.role !== "admin" && (
                      <Button
                        size="sm"
                        variant={user.isBlocked ? "outline" : "destructive"}
                        disabled={busyId === user.id}
                        onClick={() => setTarget(user)}
                        className="rounded-full"
                      >
                        {user.isBlocked ? "Unblock" : "Block"}
                      </Button>
                    )}
                  </div>
                </CardContent>

                {isOpen && (
                  <div className="grid gap-3 border-t border-border bg-(--surface-muted)/40 px-4 py-4 text-xs sm:grid-cols-2 sm:px-5">
                    <p className="text-(--text-primary)">
                      <span className="muted-text block">User ID</span>
                      {user.id}
                    </p>
                    <p className="text-(--text-primary)">
                      <span className="muted-text block">Business name</span>
                      {user.businessName || "—"}
                    </p>
                    <p className="text-(--text-primary)">
                      <span className="muted-text block">Subscription</span>
                      <span className="capitalize">{user.subscriptionPlan}</span>
                    </p>
                    <p className="text-(--text-primary)">
                      <span className="muted-text block">Registered</span>
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open) setTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {target?.isBlocked ? "Unblock this user?" : "Block this user?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {target?.isBlocked
                ? `${target.name || target.email} will regain access to the platform.`
                : `${target?.name || target?.email} will immediately lose access to protected features.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmToggle()}>
              {target?.isBlocked ? "Unblock user" : "Block user"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
