import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">Тіркелу / Кіру</h1>
        <p className="mb-6 text-slate-600">
          Google аккаунт арқылы кіріңіз.
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <button className="w-full rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white">
            Google арқылы тіркелу / кіру
          </button>
        </form>
      </div>
    </div>
  );
}