"use client";

import Link from "next/link";
import { useState } from "react";
import { useCarrinho } from "../context/CarrinhoContext";
import { supabase } from "@/lib/supabase";

export default function CarrinhoPage() {
  const {
    itens,
    removerDoCarrinho,
    alterarQuantidade,
    limparCarrinho,
    valorTotal,
  } = useCarrinho();

  const [finalizando, setFinalizando] = useState(false);
  const [erroFinalizacao, setErroFinalizacao] = useState("");

  async function finalizarPedido() {
    if (itens.length === 0 || finalizando) {
      return;
    }

    setFinalizando(true);
    setErroFinalizacao("");

    try {
      const itensPedido = itens.map((item) => ({
        produto_id: Number(item.produto.id),
        nome_produto: item.produto.nome,
        quantidade: item.quantidade,
        preco_unitario: Number(item.produto.preco),
        subtotal: Number(
          (item.produto.preco * item.quantidade).toFixed(2)
        ),
      }));

      const { data: pedidoId, error: pedidoError } =
        await supabase.rpc("criar_pedido", {
          p_total: Number(valorTotal.toFixed(2)),
          p_itens: itensPedido,
        });

      if (pedidoError) {
        console.error("Erro ao criar pedido:", pedidoError);
        throw new Error(
          "Não foi possível registrar seu pedido."
        );
      }

      if (!pedidoId) {
        throw new Error(
          "O pedido não retornou um número válido."
        );
      }

      const numeroWhatsApp = "5519971019108";

      let mensagem =
        "Olá! Gostaria de finalizar um pedido na Rota 101 TCG.\n\n";

      mensagem += `🛒 *PEDIDO #${pedidoId}*\n\n`;

      itens.forEach((item) => {
        const subtotal =
          item.produto.preco * item.quantidade;

        mensagem += `📦 ${item.produto.nome}\n`;
        mensagem += `Quantidade: ${item.quantidade}\n`;
        mensagem += `Preço: R$ ${item.produto.preco
          .toFixed(2)
          .replace(".", ",")}\n`;
        mensagem += `Subtotal: R$ ${subtotal
          .toFixed(2)
          .replace(".", ",")}\n\n`;
      });

      mensagem += "━━━━━━━━━━━━━━━━\n";

      mensagem += `💰 *TOTAL: R$ ${valorTotal
        .toFixed(2)
        .replace(".", ",")}*\n\n`;

      mensagem += `📋 Status: Pedido pendente\n`;
      mensagem += `🔢 Número do pedido: #${pedidoId}\n\n`;

      mensagem +=
        "Aguardo as instruções para pagamento. Obrigado!";

      const url =
        `https://wa.me/${numeroWhatsApp}?text=` +
        encodeURIComponent(mensagem);

      limparCarrinho();

      window.open(url, "_blank");
    } catch (error) {
      console.error(error);

      setErroFinalizacao(
        error instanceof Error
          ? error.message
          : "Não foi possível finalizar o pedido. Tente novamente."
      );
    } finally {
      setFinalizando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#111315] text-[#E8E4D8]">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="relative border-b border-white/[0.06] bg-[#181a1d]">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(214,184,90,0.08),transparent_55%)]" />

        <div className="relative z-10 mx-auto flex h-28 max-w-7xl items-center justify-between px-5 sm:px-6">

          <Link
            href="/"
            className="group flex items-center"
          >
            <img
              src="/logo.png"
              alt="Rota 101 TCG"
              className="h-[75px] w-auto object-contain transition duration-300 group-hover:scale-105"
            />
          </Link>

          <nav className="flex items-center gap-2">

            <Link
              href="/"
              className="hidden rounded-full px-5 py-3 text-xs font-extrabold uppercase tracking-widest text-[#AAA69C] transition hover:text-[#E8E4D8] sm:block"
            >
              Início
            </Link>

            <div className="flex items-center gap-2 rounded-full border border-[#d6b85a]/40 bg-[#222529] px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-[#e8cf73]">
              🛒 Carrinho
            </div>

          </nav>
        </div>
      </header>

      {/* =====================================================
          CONTEÚDO
          ===================================================== */}

      <section className="relative overflow-hidden">

        <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#d6b85a]/5 blur-3xl" />

        <div className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-[#d6b85a]/5 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-6 md:py-16">

          {/* VOLTAR */}

          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#1e2125] px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-[#AAA69C] transition hover:-translate-y-1 hover:border-[#d6b85a]/30 hover:text-[#E8E4D8]"
          >
            ← Voltar para o catálogo
          </Link>

          {/* TÍTULO */}

          <div className="mb-12">

            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-[#77746D]">
              ✦ Rota 101 TCG ✦
            </p>

            <h1 className="mt-4 text-5xl font-black leading-none tracking-tight text-[#E8E4D8] sm:text-6xl md:text-7xl">
              Seu carrinho
            </h1>

            <p className="mt-5 max-w-xl text-base font-medium leading-7 text-[#AAA69C]">
              Tudo que você escolheu para sua próxima abertura está aqui.
            </p>

          </div>

          {/* =================================================
              ERRO DE FINALIZAÇÃO
              ================================================= */}

          {erroFinalizacao && (
            <div className="mb-8 rounded-2xl border border-red-400/20 bg-red-400/5 px-5 py-4 text-sm font-medium text-red-300">
              {erroFinalizacao}
            </div>
          )}

          {/* =================================================
              CARRINHO VAZIO
              ================================================= */}

          {itens.length === 0 ? (

            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.07] bg-[#1e2125] px-6 py-24 text-center shadow-[0_30px_80px_rgba(0,0,0,0.3)]">

              <div className="absolute left-10 top-10 rotate-[-12deg] text-2xl text-[#d6b85a]/20">
                ✦
              </div>

              <div className="absolute right-10 top-16 rotate-[12deg] text-xl text-[#d6b85a]/20">
                ◆
              </div>

              <div className="absolute bottom-10 left-20 rotate-[8deg] text-xl text-[#d6b85a]/15">
                ✦
              </div>

              <div className="relative z-10">

                <div className="text-7xl opacity-40">
                  🛒
                </div>

                <h2 className="mt-7 text-3xl font-black text-[#E8E4D8] sm:text-4xl">
                  Seu carrinho está vazio
                </h2>

                <p className="mx-auto mt-4 max-w-md text-sm font-medium leading-6 text-[#77746D]">
                  Escolha seus produtos lacrados favoritos e bora montar esse
                  pedido.
                </p>

                <Link
                  href="/"
                  className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#d6b85a] bg-[#d0b65b] px-8 py-4 text-sm font-extrabold text-[#17181a] shadow-lg transition hover:-translate-y-1 hover:bg-[#e0c873]"
                >
                  Explorar produtos →
                </Link>

              </div>

            </div>

          ) : (

            <div className="grid gap-8 lg:grid-cols-[1fr_390px]">

              {/* =================================================
                  PRODUTOS
                  ================================================= */}

              <div className="space-y-5">

                {itens.map((item, index) => {

                  const subtotal =
                    item.produto.preco * item.quantidade;

                  return (
                    <div
                      key={item.produto.id}
                      className={`group relative overflow-hidden rounded-[1.8rem] border border-white/[0.07] bg-[#1e2125] shadow-[0_20px_50px_rgba(0,0,0,0.25)] transition duration-500 hover:-translate-y-1 hover:border-[#d6b85a]/25 ${
                        index % 3 === 1
                          ? "rotate-[0.35deg]"
                          : index % 3 === 2
                          ? "rotate-[-0.35deg]"
                          : ""
                      }`}
                    >

                      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">

                        {/* IMAGEM */}

                        <Link
                          href={`/produto/${item.produto.id}`}
                          className="relative flex h-36 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.06] bg-[#222529] sm:h-36 sm:w-36"
                        >

                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(214,184,90,0.08),transparent_65%)]" />

                          <span className="absolute left-3 top-3 text-sm text-[#d6b85a]/20">
                            ✦
                          </span>

                          {item.produto.imagem ? (
                            <img
                              src={item.produto.imagem}
                              alt={item.produto.nome}
                              className="relative z-10 h-full w-full object-contain p-3 drop-shadow-[0_15px_15px_rgba(0,0,0,0.45)] transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <span className="relative z-10 text-5xl opacity-25">
                              📦
                            </span>
                          )}

                          <span className="absolute bottom-2 left-2 rounded-md border border-[#d6b85a]/20 bg-[#202327] px-2 py-1 text-[8px] font-black uppercase tracking-widest text-[#d6b85a]">
                            SEALED
                          </span>

                        </Link>

                        {/* INFORMAÇÕES */}

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <span className="rounded-md bg-[#d0b65b] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[#17181a]">
                              {item.produto.tipo}
                            </span>

                            {item.produto.colecao && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#77746D]">
                                {item.produto.colecao}
                              </span>
                            )}

                          </div>

                          <Link
                            href={`/produto/${item.produto.id}`}
                            className="mt-3 block text-2xl font-black leading-tight text-[#E8E4D8] transition hover:text-[#e8cf73]"
                          >
                            {item.produto.nome}
                          </Link>

                          <p className="mt-2 text-sm font-medium text-[#77746D]">
                            R${" "}
                            {item.produto.preco
                              .toFixed(2)
                              .replace(".", ",")}{" "}
                            por unidade
                          </p>

                          {/* CONTROLES */}

                          <div className="mt-5 flex flex-wrap items-center gap-5">

                            <div className="flex items-center overflow-hidden rounded-xl border border-white/[0.08] bg-[#222529]">

                              <button
                                type="button"
                                onClick={() =>
                                  alterarQuantidade(
                                    item.produto.id,
                                    item.quantidade - 1
                                  )
                                }
                                disabled={item.quantidade <= 1}
                                className="flex h-11 w-11 items-center justify-center text-xl font-bold text-[#AAA69C] transition hover:bg-[#2a2d31] hover:text-[#E8E4D8] disabled:cursor-not-allowed disabled:opacity-25"
                              >
                                −
                              </button>

                              <div className="flex h-11 min-w-12 items-center justify-center border-x border-white/[0.08] text-base font-black text-[#e8cf73]">
                                {item.quantidade}
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  alterarQuantidade(
                                    item.produto.id,
                                    item.quantidade + 1
                                  )
                                }
                                disabled={
                                  item.quantidade >=
                                  item.produto.estoque
                                }
                                className="flex h-11 w-11 items-center justify-center text-xl font-bold text-[#AAA69C] transition hover:bg-[#2a2d31] hover:text-[#E8E4D8] disabled:cursor-not-allowed disabled:opacity-25"
                              >
                                +
                              </button>

                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removerDoCarrinho(item.produto.id)
                              }
                              className="text-xs font-extrabold uppercase tracking-wider text-[#77746D] transition hover:text-red-300"
                            >
                              Remover
                            </button>

                          </div>

                        </div>

                        {/* SUBTOTAL */}

                        <div className="shrink-0 border-t border-white/[0.06] pt-5 sm:border-0 sm:pt-0 sm:text-right">

                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#77746D]">
                            Subtotal
                          </p>

                          <p className="mt-1 text-2xl font-black text-[#e8cf73]">
                            R${" "}
                            {subtotal
                              .toFixed(2)
                              .replace(".", ",")}
                          </p>

                        </div>

                      </div>

                    </div>
                  );
                })}

                {/* LIMPAR */}

                <div className="flex justify-end pt-3">

                  <button
                    type="button"
                    onClick={limparCarrinho}
                    className="rounded-full border border-white/[0.07] bg-[#1e2125] px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-[#77746D] transition hover:border-red-400/20 hover:text-red-300"
                  >
                    Limpar carrinho
                  </button>

                </div>

              </div>

              {/* =================================================
                  RESUMO
                  ================================================= */}

              <aside className="lg:sticky lg:top-6 lg:h-fit">

                <div className="relative overflow-hidden rounded-[2rem] border border-[#d6b85a]/15 bg-[#1e2125] p-7 shadow-[0_30px_70px_rgba(0,0,0,0.35)]">

                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#d6b85a]/5 blur-2xl" />

                  <div className="relative z-10">

                    <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#77746D]">
                      ✦ Resumo
                    </p>

                    <h2 className="mt-3 text-3xl font-black text-[#E8E4D8]">
                      Seu pedido
                    </h2>

                    <div className="my-7 border-t border-white/[0.07]" />

                    <div className="flex items-center justify-between gap-4">

                      <span className="text-sm font-bold text-[#77746D]">
                        Produtos
                      </span>

                      <span className="text-sm font-black text-[#E8E4D8]">
                        {itens.reduce(
                          (total, item) =>
                            total + item.quantidade,
                          0
                        )}
                      </span>

                    </div>

                    <div className="mt-4 flex items-center justify-between gap-4">

                      <span className="text-sm font-bold text-[#77746D]">
                        Frete
                      </span>

                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#AAA69C]">
                        A combinar
                      </span>

                    </div>

                    <div className="my-7 border-t border-white/[0.07]" />

                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#77746D]">
                      Total do pedido
                    </p>

                    <p className="mt-2 text-4xl font-black text-[#e8cf73]">
                      R${" "}
                      {valorTotal
                        .toFixed(2)
                        .replace(".", ",")}
                    </p>

                    <button
                      type="button"
                      onClick={finalizarPedido}
                      disabled={finalizando}
                      className="mt-7 flex w-full items-center justify-center gap-3 rounded-[1.2rem] border border-[#d6b85a] bg-[#d0b65b] px-6 py-5 text-sm font-extrabold text-[#17181a] shadow-[0_18px_40px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:bg-[#e0c873] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                      {finalizando
                        ? "Registrando pedido..."
                        : "Finalizar pedido"}

                      {!finalizando && (
                        <span className="text-lg">
                          →
                        </span>
                      )}
                    </button>

                    <p className="mt-4 text-center text-[10px] font-medium leading-5 text-[#77746D]">
                      Seu pedido será registrado antes de você ser
                      direcionado para o WhatsApp.
                    </p>

                  </div>

                </div>

              </aside>

            </div>

          )}

        </div>
      </section>

      {/* =====================================================
          FINAL
          ===================================================== */}

      <section className="border-t border-white/[0.05] bg-[#111315]">

        <div className="mx-auto max-w-7xl px-5 py-16 text-center sm:px-6">

          <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-[#77746D]">
            ✦ Rota 101 TCG ✦
          </p>

          <h2 className="mt-4 text-4xl font-black text-[#E8E4D8] md:text-5xl">
            Bora completar essa coleção?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-6 text-[#AAA69C]">
            Produtos Pokémon TCG lacrados para você abrir,
            colecionar e guardar.
          </p>

          <Link
            href="/"
            className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#d6b85a] bg-[#d0b65b] px-7 py-3.5 text-sm font-extrabold text-[#17181a] shadow-lg transition hover:-translate-y-1 hover:bg-[#e0c873]"
          >
            Explorar produtos →
          </Link>

        </div>

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