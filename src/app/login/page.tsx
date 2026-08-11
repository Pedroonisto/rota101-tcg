"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
const router = useRouter();

const [email, setEmail] = useState("");
const [senha, setSenha] = useState("");
const [carregando, setCarregando] = useState(false);
const [erro, setErro] = useState("");

async function entrar(event: FormEvent<HTMLFormElement>) {
event.preventDefault();

if (carregando) {
  return;
}

setCarregando(true);
setErro("");

try {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: senha,
  });

  if (error) {
    console.error("Erro no login:", error);
    setErro("E-mail ou senha incorretos.");
    setCarregando(false);
    return;
  }

  if (!data.session) {
    setErro("Não foi possível criar a sessão.");
    setCarregando(false);
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, 300));

  window.location.href = "/admin";
} catch (error) {
  console.error("Erro inesperado no login:", error);
  setErro("Não foi possível entrar. Tente novamente.");
  setCarregando(false);
}

}

return (
<main className="min-h-screen overflow-hidden bg-[#141619] text-[#E8E4D8]">

  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute left-[-120px] top-[10%] h-80 w-80 rounded-full bg-[#d6b85a]/5 blur-3xl" />
    <div className="absolute right-[-120px] bottom-[10%] h-80 w-80 rounded-full bg-[#d6b85a]/5 blur-3xl" />
  </div>

  <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">

    <div className="w-full max-w-md">

      <div className="mb-8 text-center">

        <img
          src="/logo.png"
          alt="Rota 101 TCG"
          className="mx-auto h-[75px] w-auto object-contain"
        />

        <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#77746D]">
          ✦ Área administrativa ✦
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight text-[#E8E4D8]">
          Bem-vindo de volta
        </h1>

        <p className="mt-3 text-sm font-medium text-[#77746D]">
          Entre para administrar sua Rota 101.
        </p>

      </div>

      <div className="rounded-[2rem] border border-white/[0.07] bg-[#1e2125] p-7 shadow-[0_30px_80px_rgba(0,0,0,0.4)] sm:p-8">

        <form onSubmit={entrar} className="space-y-5">

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-[10px] font-extrabold uppercase tracking-widest text-[#77746D]"
            >
              E-mail
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
              className="w-full rounded-xl border border-white/[0.08] bg-[#17191c] px-4 py-4 text-sm font-medium text-[#E8E4D8] outline-none transition placeholder:text-[#55534e] focus:border-[#d6b85a]/50 focus:ring-2 focus:ring-[#d6b85a]/10"
            />
          </div>

          <div>
            <label
              htmlFor="senha"
              className="mb-2 block text-[10px] font-extrabold uppercase tracking-widest text-[#77746D]"
            >
              Senha
            </label>

            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Digite sua senha"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-white/[0.08] bg-[#17191c] px-4 py-4 text-sm font-medium text-[#E8E4D8] outline-none transition placeholder:text-[#55534e] focus:border-[#d6b85a]/50 focus:ring-2 focus:ring-[#d6b85a]/10"
            />
          </div>

          {erro && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm font-bold text-red-300">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-xl border border-[#d6b85a] bg-[#d0b65b] px-6 py-4 text-sm font-extrabold text-[#17181a] shadow-lg transition hover:-translate-y-1 hover:bg-[#e0c873] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {carregando ? "Entrando..." : "Entrar no painel →"}
          </button>

        </form>

      </div>

      <div className="mt-6 text-center">

        <button
          type="button"
          onClick={() => {
            window.location.href = "/";
          }}
          className="text-xs font-extrabold uppercase tracking-wider text-[#77746D] transition hover:text-[#E8E4D8]"
        >
          ← Voltar para a loja
        </button>

      </div>

    </div>

  </div>
</main>
);
}