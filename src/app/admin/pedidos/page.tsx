"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Pedido = {
id: number;
created_at: string;
status: string;
total: number;
};

const STATUS = [
"todos",
"pendente",
"pago",
"enviado",
"concluido",
"cancelado",
] as const;

type FiltroStatus = (typeof STATUS)[number];

export default function PedidosPage() {
const [pedidos, setPedidos] = useState<Pedido[]>([]);
const [carregando, setCarregando] = useState(true);
const [filtro, setFiltro] = useState<FiltroStatus>("todos");

async function carregarPedidos() {
setCarregando(true);

const { data, error } = await supabase
  .from("pedidos")
  .select("id, created_at, status, total")
  .order("created_at", { ascending: false });

if (error) {
  console.error("Erro ao carregar pedidos:", error);
  setPedidos([]);
  setCarregando(false);
  return;
}

setPedidos(data || []);
setCarregando(false);

}

useEffect(() => {
carregarPedidos();
}, []);

function formatarData(data: string) {
return new Date(data).toLocaleString("pt-BR", {
dateStyle: "short",
timeStyle: "short",
});
}

function formatarStatus(status: string) {
switch (status) {
case "pendente":
return "Pendente";
case "pago":
return "Pago";
case "enviado":
return "Enviado";
case "concluido":
return "Concluído";
case "cancelado":
return "Cancelado";
default:
return status;
}
}

function classeStatus(status: string) {
switch (status) {
case "pago":
return "border-green-500/30 bg-green-500/10 text-green-400";

  case "enviado":
    return "border-blue-500/30 bg-blue-500/10 text-blue-400";

  case "concluido":
    return "border-[#d6b85a]/30 bg-[#d6b85a]/10 text-[#e8cf73]";

  case "cancelado":
    return "border-red-500/30 bg-red-500/10 text-red-400";

  default:
    return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
}

}

const estatisticas = useMemo(() => {
return {
total: pedidos.length,

  pendentes: pedidos.filter(
    (pedido) => pedido.status === "pendente"
  ).length,

  pagos: pedidos.filter(
    (pedido) => pedido.status === "pago"
  ).length,

  enviados: pedidos.filter(
    (pedido) => pedido.status === "enviado"
  ).length,

  concluidos: pedidos.filter(
    (pedido) => pedido.status === "concluido"
  ).length,

  cancelados: pedidos.filter(
    (pedido) => pedido.status === "cancelado"
  ).length,

  vendas: pedidos
    .filter((pedido) => pedido.status !== "cancelado")
    .reduce(
      (total, pedido) => total + Number(pedido.total),
      0
    ),
};

}, [pedidos]);

const pedidosFiltrados = useMemo(() => {
if (filtro === "todos") {
return pedidos;
}

return pedidos.filter(
  (pedido) => pedido.status === filtro
);

}, [pedidos, filtro]);

return (
<main className="min-h-screen bg-[#111315] text-[#E8E4D8]">

  {/* =====================================================
      HEADER
      ===================================================== */}

  <header className="border-b border-white/[0.06] bg-[#181a1d]">

    <div className="mx-auto flex h-28 max-w-7xl items-center justify-between px-5 sm:px-6">

      <div className="flex items-center gap-5">

        <img
          src="/logo.png"
          alt="Rota 101 TCG"
          className="h-[65px] w-auto object-contain"
        />

        <div className="hidden border-l border-white/[0.08] pl-5 sm:block">

          <p className="text-xs font-extrabold uppercase tracking-widest text-[#77746D]">
            Rota 101 TCG
          </p>

          <h1 className="mt-1 text-2xl font-black">
            Pedidos
          </h1>

        </div>

      </div>

      <div className="flex items-center gap-3">

        <button
          type="button"
          onClick={carregarPedidos}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold transition hover:border-[#d6b85a]/50 hover:bg-[#d6b85a]/10 hover:text-[#e8cf73]"
        >
          ↻ Atualizar
        </button>

        <Link
          href="/admin"
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold transition hover:bg-zinc-900"
        >
          ← Painel
        </Link>

        <Link
          href="/"
          className="hidden rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold transition hover:bg-zinc-900 sm:block"
        >
          Loja
        </Link>

      </div>

    </div>

  </header>

  {/* =====================================================
      CONTEÚDO
      ===================================================== */}

  <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 md:py-14">

    <div className="mb-10">

      <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#77746D]">
        ✦ Administração ✦
      </p>

      <h2 className="mt-3 text-4xl font-black">
        Pedidos
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#77746D]">
        Acompanhe, filtre e gerencie todos os pedidos realizados
        na Rota 101 TCG.
      </p>

    </div>

    {/* =====================================================
        ESTATÍSTICAS
        ===================================================== */}

    <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

      <div className="rounded-2xl border border-white/[0.07] bg-[#1e2125] p-5">

        <p className="text-xs font-extrabold uppercase tracking-wider text-[#77746D]">
          Total de pedidos
        </p>

        <p className="mt-3 text-3xl font-black text-[#E8E4D8]">
          {estatisticas.total}
        </p>

      </div>

      <div className="rounded-2xl border border-yellow-500/10 bg-[#1e2125] p-5">

        <p className="text-xs font-extrabold uppercase tracking-wider text-[#77746D]">
          Pendentes
        </p>

        <p className="mt-3 text-3xl font-black text-yellow-400">
          {estatisticas.pendentes}
        </p>

      </div>

      <div className="rounded-2xl border border-green-500/10 bg-[#1e2125] p-5">

        <p className="text-xs font-extrabold uppercase tracking-wider text-[#77746D]">
          Pagos
        </p>

        <p className="mt-3 text-3xl font-black text-green-400">
          {estatisticas.pagos}
        </p>

      </div>

      <div className="rounded-2xl border border-[#d6b85a]/10 bg-[#1e2125] p-5">

        <p className="text-xs font-extrabold uppercase tracking-wider text-[#77746D]">
          Vendas
        </p>

        <p className="mt-3 text-3xl font-black text-[#e8cf73]">
          R${" "}
          {estatisticas.vendas
            .toFixed(2)
            .replace(".", ",")}
        </p>

      </div>

    </div>

    {/* =====================================================
        RESUMO DOS STATUS
        ===================================================== */}

    <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

      <div className="rounded-2xl border border-blue-500/10 bg-[#1e2125] p-5">

        <p className="text-xs font-extrabold uppercase tracking-wider text-[#77746D]">
          Enviados
        </p>

        <p className="mt-3 text-2xl font-black text-blue-400">
          {estatisticas.enviados}
        </p>

      </div>

      <div className="rounded-2xl border border-[#d6b85a]/10 bg-[#1e2125] p-5">

        <p className="text-xs font-extrabold uppercase tracking-wider text-[#77746D]">
          Concluídos
        </p>

        <p className="mt-3 text-2xl font-black text-[#e8cf73]">
          {estatisticas.concluidos}
        </p>

      </div>

      <div className="rounded-2xl border border-red-500/10 bg-[#1e2125] p-5">

        <p className="text-xs font-extrabold uppercase tracking-wider text-[#77746D]">
          Cancelados
        </p>

        <p className="mt-3 text-2xl font-black text-red-400">
          {estatisticas.cancelados}
        </p>

      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-[#1e2125] p-5">

        <p className="text-xs font-extrabold uppercase tracking-wider text-[#77746D]">
          Não cancelados
        </p>

        <p className="mt-3 text-2xl font-black text-[#E8E4D8]">
          {estatisticas.total - estatisticas.cancelados}
        </p>

      </div>

    </div>

    {/* =====================================================
        FILTROS
        ===================================================== */}

    <div className="mb-6 overflow-x-auto">

      <div className="flex min-w-max gap-2">

        {STATUS.map((status) => {

          const ativo = filtro === status;

          return (
            <button
              key={status}
              type="button"
              onClick={() =>
                setFiltro(status)
              }
              className={`rounded-full border px-5 py-3 text-xs font-extrabold uppercase tracking-wider transition ${
                ativo
                  ? "border-[#d6b85a]/50 bg-[#d6b85a]/10 text-[#e8cf73]"
                  : "border-white/[0.07] bg-[#1e2125] text-[#77746D] hover:border-white/[0.15] hover:text-[#E8E4D8]"
              }`}
            >
              {status === "todos"
                ? "Todos"
                : formatarStatus(status)}
            </button>
          );

        })}

      </div>

    </div>

    {/* =====================================================
        CARREGANDO
        ===================================================== */}

    {carregando ? (

      <div className="rounded-2xl border border-white/[0.07] bg-[#1e2125] p-16 text-center">

        <div className="text-5xl opacity-50">
          🛒
        </div>

        <p className="mt-4 text-sm text-[#77746D]">
          Carregando pedidos...
        </p>

      </div>

    ) : pedidosFiltrados.length === 0 ? (

      <div className="rounded-2xl border border-white/[0.07] bg-[#1e2125] p-16 text-center">

        <div className="text-6xl opacity-50">
          🛒
        </div>

        <h3 className="mt-6 text-2xl font-black">
          Nenhum pedido encontrado
        </h3>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#77746D]">
          Não existem pedidos com o filtro selecionado.
        </p>

      </div>

    ) : (

      /* ===================================================
         LISTA
         =================================================== */

      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#1e2125]">

        <div className="hidden border-b border-white/[0.06] bg-[#181a1d] px-6 py-4 md:grid md:grid-cols-[100px_1fr_180px_150px_120px] md:items-center md:gap-4">

          <span className="text-xs font-extrabold uppercase tracking-wider text-[#77746D]">
            Pedido
          </span>

          <span className="text-xs font-extrabold uppercase tracking-wider text-[#77746D]">
            Data
          </span>

          <span className="text-xs font-extrabold uppercase tracking-wider text-[#77746D]">
            Status
          </span>

          <span className="text-xs font-extrabold uppercase tracking-wider text-[#77746D]">
            Total
          </span>

          <span className="text-xs font-extrabold uppercase tracking-wider text-[#77746D]">
            Ação
          </span>

        </div>

        {pedidosFiltrados.map((pedido) => (

          <div
            key={pedido.id}
            className="border-b border-white/[0.06] p-5 last:border-b-0 transition hover:bg-[#222529] md:grid md:grid-cols-[100px_1fr_180px_150px_120px] md:items-center md:gap-4 md:px-6"
          >

            {/* ID */}

            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-[#77746D] md:hidden">
                Pedido
              </p>

              <p className="mt-1 font-black text-[#e8cf73]">
                #{pedido.id}
              </p>

            </div>

            {/* DATA */}

            <div className="mt-4 md:mt-0">

              <p className="text-xs font-bold uppercase tracking-wider text-[#77746D] md:hidden">
                Data
              </p>

              <p className="mt-1 text-sm text-[#AAA69C]">
                {formatarData(pedido.created_at)}
              </p>

            </div>

            {/* STATUS */}

            <div className="mt-4 md:mt-0">

              <p className="text-xs font-bold uppercase tracking-wider text-[#77746D] md:hidden">
                Status
              </p>

              <span
                className={`mt-1 inline-flex rounded-full border px-3 py-1 text-xs font-extrabold uppercase tracking-wider ${classeStatus(
                  pedido.status
                )}`}
              >
                {formatarStatus(pedido.status)}
              </span>

            </div>

            {/* TOTAL */}

            <div className="mt-4 md:mt-0">

              <p className="text-xs font-bold uppercase tracking-wider text-[#77746D] md:hidden">
                Total
              </p>

              <p className="mt-1 text-lg font-black text-[#E8E4D8]">
                R${" "}
                {Number(pedido.total)
                  .toFixed(2)
                  .replace(".", ",")}
              </p>

            </div>

            {/* AÇÃO */}

            <div className="mt-5 md:mt-0">

              <Link
                href={`/admin/pedidos/${pedido.id}`}
                className="inline-flex rounded-lg border border-white/[0.08] bg-[#222529] px-4 py-2 text-xs font-extrabold uppercase tracking-wider transition hover:border-[#d6b85a]/50 hover:bg-[#d6b85a]/10 hover:text-[#e8cf73]"
              >
                Ver pedido
              </Link>

            </div>

          </div>

        ))}

      </div>

    )}

  </section>

  {/* =====================================================
      FOOTER
      ===================================================== */}

  <footer className="border-t border-white/[0.04] px-5 py-10 text-center sm:px-6">

    <img
      src="/logo.png"
      alt="Rota 101 TCG"
      className="mx-auto h-[30px] w-auto object-contain opacity-90"
    />

    <p className="mt-3 text-xs uppercase tracking-widest text-[#77746D]">
      Pokémon TCG • Sealed Products
    </p>

    <p className="mt-4 text-xs text-zinc-700">
      © 2026 Rota 101 TCG
    </p>

  </footer>

</main>
);
}