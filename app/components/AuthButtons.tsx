import { auth, signIn, signOut } from "@/auth";

export default async function AuthButtons() {
  const session = await auth();

  if (!session?.user) {
    return (
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/" });
        }}
      >
        <button className="rounded-xl bg-blue-600 px-4 py-2 text-white">
          Кіру
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm text-slate-700">
        {session.user.name || session.user.email}
      </div>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button className="rounded-xl bg-slate-200 px-4 py-2 text-slate-900">
          Шығу
        </button>
      </form>
    </div>
  );
}