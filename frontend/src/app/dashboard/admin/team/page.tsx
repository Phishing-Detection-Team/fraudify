"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Search, Users as UsersIcon, ShieldCheck, User as UserIcon, Loader2 } from "lucide-react";
import { getUsers, type BackendUser } from "@/lib/admin-api";

function Initials({ name }: { name: string }) {
  const chars = name.split(/\s+/).map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");
  return (
    <div className="w-9 h-9 rounded-full bg-accent-cyan/20 text-accent-cyan flex items-center justify-center text-sm font-bold flex-shrink-0">
      {chars}
    </div>
  );
}

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-accent-cyan/10 text-accent-cyan",
  super_admin: "bg-purple-500/10 text-purple-400",
  user: "bg-muted text-muted-foreground",
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!session?.accessToken || !session.user?.fromBackend) {
      setLoading(false);
      return;
    }
    getUsers(session.accessToken)
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [session]);

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground mt-1">
          All registered accounts on this platform.
        </p>
      </div>

      {/* Search + summary */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-cyan"
          />
        </div>
        {!loading && (
          <span className="text-sm text-muted-foreground flex-shrink-0">
            {filtered.length} / {users.length} users
          </span>
        )}
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border/50 bg-card/30 flex items-center gap-2">
          <UsersIcon size={16} className="text-accent-cyan" />
          <h3 className="font-semibold">All Users</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
            <Loader2 size={16} className="animate-spin" />
            Loading users…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground space-y-2">
            <UserIcon size={28} className="mx-auto" />
            <p className="text-sm font-medium">
              {query ? "No users match your search." : "No users found."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-background/50 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Roles</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Initials name={user.username} />
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {user.roles.map((role) => (
                          <span
                            key={role}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              ROLE_COLORS[role] ?? "bg-muted text-muted-foreground"
                            }`}
                          >
                            {(role === "admin" || role === "super_admin") && (
                              <ShieldCheck size={9} />
                            )}
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.is_active
                            ? "bg-accent-green/10 text-accent-green"
                            : "bg-accent-red/10 text-accent-red"
                        }`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
