import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { progress: true },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">Жеке кабинет</h1>

        <div className="space-y-4 text-slate-700">
          <div>
            <span className="font-semibold">Аты:</span>{" "}
            {user?.name || "Көрсетілмеген"}
          </div>

          <div>
            <span className="font-semibold">Email:</span>{" "}
            {user?.email || "Көрсетілмеген"}
          </div>

          <div>
            <span className="font-semibold">Соңғы бөлім:</span>{" "}
            {user?.progress?.lastMenu || "home"}
          </div>

          <div>
            <span className="font-semibold">Прогресс:</span>{" "}
            {user?.progress?.percent ?? 0}%
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <a
            href="/"
            className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white"
          >
            Басты бет
          </a>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="rounded-2xl bg-slate-200 px-5 py-3 font-semibold text-slate-900">
              Шығу
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}