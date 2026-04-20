import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!me?.isAdmin) {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    include: {
      progress: true,
      chats: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">Админ панель</h1>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-slate-300 text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="border px-3 py-2">Аты</th>
                <th className="border px-3 py-2">Email</th>
                <th className="border px-3 py-2">Соңғы бөлім</th>
                <th className="border px-3 py-2">Прогресс</th>
                <th className="border px-3 py-2">Чат саны</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="border px-3 py-2">{u.name || "-"}</td>
                  <td className="border px-3 py-2">{u.email || "-"}</td>
                  <td className="border px-3 py-2">{u.progress?.lastMenu || "home"}</td>
                  <td className="border px-3 py-2">{u.progress?.percent ?? 0}%</td>
                  <td className="border px-3 py-2">{u.chats.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}