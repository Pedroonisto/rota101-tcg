"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Pedido = {
  id: number;
  created_at: string;
  status: string;
  total: number;
  total_original: number | null;
  desconto_percentual: number | null;
  desconto_valor: number | null;
};

type PedidoItem = {
  id: number;
  created_at: string;
  pedido_id: number;
  produto_id: number;
  nome_produto: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
};

export default function PedidoPage() {
  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [itens, setItens] = useState<PedidoItem[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [aplicandoDesconto, setAplicandoDesconto] = useState(false);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [descontoInput, setDescontoInput] = useState("");

  useEffect(() => {
    async function carregarPedido() {
      if (!id) {
        setErro("Pedido não encontrado.");
        setCarregando(false);
        return;
      }

      const pedidoId = Number(id);

      if (Number.isNaN(pedidoId)) {
        setErro("Pedido não encontrado.");
        setCarregando(false);
        return;
      }

      const { data: pedidoData, error: pedidoError } = await supabase
        .from("pedidos")
        .select(
          "id, created_at, status, total, total_original, desconto_percentual, desconto_valor"
        )
        .eq("id", pedidoId)
        .single();

      if (pedidoError || !pedidoData) {
        console.error(pedidoError);
        setErro("Pedido não encontrado.");
        setCarregando(false);
        return;
      }

      const { data: itensData, error: itensError } = await supabase
        .from("pedido_itens")
        .select(
          "id, created_at, pedido_id, produto_id, nome_produto, quantidade, preco_unitario, subtotal"
        )
        .eq("pedido_id", pedidoId)
        .order("id", { ascending: true });

      if (itensError) {
        console.error("Erro ao carregar itens:", itensError);

        setErro(
          "Não foi possível carregar os itens do pedido."
        );

        setCarregando(false);
        return;
      }

      const totalAtual = Number(pedidoData.total);

      const pedidoFinal: Pedido = {
        ...pedidoData,
        total_original:
          pedidoData.total_original !== null
            ? Number(pedidoData.total_original)
            : totalAtual,
        desconto_percentual:
          pedidoData.desconto_percentual !== null
            ? Number(pedidoData.desconto_percentual)
            : 0,
        desconto_valor:
          pedidoData.desconto_valor !== null
            ? Number(pedidoData.desconto_valor)
            : 0,
      };

      setPedido(pedidoFinal);

      setDescontoInput(
        Number(pedidoFinal.desconto_percentual || 0) > 0
          ? String(pedidoFinal.desconto_percentual)
          : ""
      );

      setItens(itensData || []);
      setCarregando(false);
    }

    carregarPedido();
  }, [id]);

  async function alterarStatus(novoStatus: string) {
    if (!pedido || salvando || excluindo || aplicandoDesconto) {
      return;
    }

    setSalvando(true);
    setMensagem("");
    setErro("");

    try {
      /*
       * PAGAMENTO
       *
       * Quando o pedido passa para "pago",
       * usamos a função do Supabase.
       *
       * Ela:
       * 1. verifica o estoque;
       * 2. diminui o estoque;
       * 3. altera o pedido para pago;
       * 4. impede desconto duplicado.
       */

      if (
        novoStatus === "pago" &&
        pedido.status !== "pago"
      ) {
        const { error } = await supabase.rpc(
          "marcar_pedido_pago",
          {
            p_pedido_id: pedido.id,
          }
        );

        if (error) {
          console.error(
            "Erro ao marcar pedido como pago:",
            error
          );

          setErro(
            error.message ||
              "Não foi possível marcar o pedido como pago."
          );

          return;
        }

        setPedido({
          ...pedido,
          status: "pago",
        });

        setMensagem(
          "Pedido marcado como pago e estoque atualizado com sucesso."
        );

        return;
      }

      /*
       * OUTROS STATUS
       */

      const { error } = await supabase
        .from("pedidos")
        .update({
          status: novoStatus,
        })
        .eq("id", pedido.id);

      if (error) {
        console.error(
          "Erro ao atualizar status:",
          error
        );

        setErro(
          error.message ||
            "Não foi possível atualizar o status."
        );

        return;
      }

      setPedido({
        ...pedido,
        status: novoStatus,
      });

      setMensagem("Status atualizado com sucesso.");
    } finally {
      setSalvando(false);
    }
  }

  async function aplicarDesconto() {
    if (!pedido) {
      return;
    }

    if (
      salvando ||
      excluindo ||
      aplicandoDesconto
    ) {
      return;
    }

    /*
     * Não permitimos alterar o desconto
     * depois que o pedido já foi pago.
     */
    if (pedido.status === "pago") {
      setErro(
        "Não é possível alterar o desconto de um pedido que já foi pago."
      );

      return;
    }

    setAplicandoDesconto(true);
    setMensagem("");
    setErro("");

    try {
      let percentual = Number(
        descontoInput.replace(",", ".")
      );

      if (!Number.isFinite(percentual)) {
        percentual = 0;
      }

      if (percentual < 0 || percentual > 100) {
        setErro(
          "O desconto deve estar entre 0% e 100%."
        );

        return;
      }

      /*
       * Se o pedido antigo ainda não tiver
       * total_original salvo, usamos o total
       * atual como base.
       */
      const totalOriginal =
        pedido.total_original !== null
          ? Number(pedido.total_original)
          : Number(pedido.total);

      const descontoValor =
        totalOriginal * (percentual / 100);

      const novoTotal =
        totalOriginal - descontoValor;

      const { data, error } = await supabase
        .from("pedidos")
        .update({
          total_original: totalOriginal,
          desconto_percentual: percentual,
          desconto_valor: descontoValor,
          total: novoTotal,
        })
        .eq("id", pedido.id)
        .select(
          "id, created_at, status, total, total_original, desconto_percentual, desconto_valor"
        )
        .single();

      if (error) {
        console.error(
          "Erro ao aplicar desconto:",
          error
        );

        setErro(
          error.message ||
            "Não foi possível aplicar o desconto."
        );

        return;
      }

      setPedido({
        ...data,
        total_original:
          data.total_original !== null
            ? Number(data.total_original)
            : totalOriginal,
        desconto_percentual:
          data.desconto_percentual !== null
            ? Number(data.desconto_percentual)
            : percentual,
        desconto_valor:
          data.desconto_valor !== null
            ? Number(data.desconto_valor)
            : descontoValor,
      });

      setMensagem(
        percentual === 0
          ? "Desconto removido com sucesso."
          : `Desconto de ${percentual}% aplicado com sucesso.`
      );
    } finally {
      setAplicandoDesconto(false);
    }
  }

  async function removerDesconto() {
    if (!pedido) {
      return;
    }

    if (
      salvando ||
      excluindo ||
      aplicandoDesconto
    ) {
      return;
    }

    if (pedido.status === "pago") {
      setErro(
        "Não é possível alterar o desconto de um pedido que já foi pago."
      );

      return;
    }

    const confirmou = window.confirm(
      "Deseja remover o desconto deste pedido?"
    );

    if (!confirmou) {
      return;
    }

    setAplicandoDesconto(true);
    setMensagem("");
    setErro("");

    try {
      const totalOriginal =
        pedido.total_original !== null
          ? Number(pedido.total_original)
          : Number(pedido.total);

      const { data, error } = await supabase
        .from("pedidos")
        .update({
          total_original: totalOriginal,
          desconto_percentual: 0,
          desconto_valor: 0,
          total: totalOriginal,
        })
        .eq("id", pedido.id)
        .select(
          "id, created_at, status, total, total_original, desconto_percentual, desconto_valor"
        )
        .single();

      if (error) {
        console.error(
          "Erro ao remover desconto:",
          error
        );

        setErro(
          error.message ||
            "Não foi possível remover o desconto."
        );

        return;
      }

      setPedido({
        ...data,
        total_original: Number(
          data.total_original ?? totalOriginal
        ),
        desconto_percentual: 0,
        desconto_valor: 0,
      });

      setDescontoInput("");

      setMensagem(
        "Desconto removido com sucesso. O valor original foi restaurado."
      );
    } finally {
      setAplicandoDesconto(false);
    }
  }

  async function excluirPedido() {
    if (
      !pedido ||
      pedido.status !== "cancelado"
    ) {
      return;
    }

    const confirmou = window.confirm(
      `Tem certeza que deseja excluir o pedido #${pedido.id}?\n\nEssa ação não pode ser desfeita.`
    );

    if (!confirmou) {
      return;
    }

    setExcluindo(true);
    setMensagem("");
    setErro("");

    try {
      const { error } = await supabase.rpc(
        "excluir_pedido_cancelado",
        {
          p_pedido_id: pedido.id,
        }
      );

      if (error) {
        console.error(
          "Erro ao excluir pedido:",
          error
        );

        setErro(
          error.message ||
            "Não foi possível excluir o pedido."
        );

        setExcluindo(false);

        return;
      }

      router.push("/admin/pedidos");
    } catch (error) {
      console.error(error);

      setErro(
        "Ocorreu um erro ao excluir o pedido."
      );

      setExcluindo(false);
    }
  }

  function formatarData(data: string) {
    return new Date(data).toLocaleString(
      "pt-BR",
      {
        dateStyle: "short",
        timeStyle: "short",
      }
    );
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
        return "border-green-500/20 bg-green-500/10 text-green-300";

      case "enviado":
        return "border-blue-500/20 bg-blue-500/10 text-blue-300";

      case "concluido":
        return "border-[#d6b85a]/20 bg-[#d6b85a]/10 text-[#e8cf73]";

      case "cancelado":
        return "border-red-500/20 bg-red-500/10 text-red-300";

      default:
        return "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";
    }
  }

  function formatarMoeda(valor: number) {
    return Number(valor)
      .toFixed(2)
      .replace(".", ",");
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-[#111315] text-[#E8E4D8]">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="text-5xl">
              🛒
            </div>

            <p className="mt-4 text-sm text-[#77746D]">
              Carregando pedido...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (erro && !pedido) {
    return (
      <main className="min-h-screen bg-[#111315] text-[#E8E4D8]">
        <div className="flex min-h-screen items-center justify-center px-5">
          <div className="text-center">
            <div className="text-5xl">
              🛒
            </div>

            <h1 className="mt-5 text-3xl font-black">
              Pedido não encontrado
            </h1>

            <p className="mt-3 text-sm text-red-300">
              {erro ||
                "O pedido solicitado não existe."}
            </p>

            <Link
              href="/admin/pedidos"
              className="mt-7 inline-flex rounded-full border border-white/[0.08] bg-[#1e2125] px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-[#AAA69C] transition hover:border-[#d6b85a]/40 hover:text-[#E8E4D8]"
            >
              ← Voltar para pedidos
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!pedido) {
    return null;
  }

  const totalOriginal =
    pedido.total_original !== null
      ? Number(pedido.total_original)
      : Number(pedido.total);

  const descontoPercentual = Number(
    pedido.desconto_percentual || 0
  );

  const descontoValor = Number(
    pedido.desconto_valor || 0
  );

  const totalFinal = Number(pedido.total);

  return (
    <main className="min-h-screen bg-[#111315] text-[#E8E4D8]">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="border-b border-white/[0.06] bg-[#181a1d]">

        <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-5 sm:px-6">

          <div>

            <p className="text-xs font-extrabold uppercase tracking-widest text-[#77746D]">
              Rota 101 TCG
            </p>

            <h1 className="mt-1 text-2xl font-black">
              Pedido #{pedido.id}
            </h1>

          </div>

          <div className="flex items-center gap-3">

            <Link
              href="/admin/pedidos"
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold transition hover:bg-zinc-900"
            >
              ← Pedidos
            </Link>

            <Link
              href="/admin"
              className="hidden rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold transition hover:bg-zinc-900 sm:block"
            >
              Painel
            </Link>

          </div>

        </div>

      </header>

      {/* =====================================================
          CONTEÚDO
          ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 md:py-14">

        {/* VOLTAR */}

        <Link
          href="/admin/pedidos"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#1e2125] px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-[#AAA69C] transition hover:border-[#d6b85a]/30 hover:text-[#E8E4D8]"
        >
          ← Voltar para pedidos
        </Link>

        {/* =====================================================
            CABEÇALHO DO PEDIDO
            ===================================================== */}

        <div className="rounded-[2rem] border border-white/[0.07] bg-[#1e2125] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)] sm:p-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#77746D]">
                ✦ Pedido
              </p>

              <h2 className="mt-3 text-4xl font-black">
                #{pedido.id}
              </h2>

              <p className="mt-2 text-sm text-[#77746D]">
                Realizado em{" "}
                {formatarData(
                  pedido.created_at
                )}
              </p>

            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

              <span
                className={`rounded-full border px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider ${classeStatus(
                  pedido.status
                )}`}
              >
                {formatarStatus(
                  pedido.status
                )}
              </span>

              <select
                value={pedido.status}
                onChange={(event) =>
                  alterarStatus(
                    event.target.value
                  )
                }
                disabled={
                  salvando ||
                  excluindo ||
                  aplicandoDesconto
                }
                className="rounded-full border border-white/[0.08] bg-[#222529] px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-[#E8E4D8] outline-none transition focus:border-[#d6b85a]/50 disabled:cursor-not-allowed disabled:opacity-50"
              >

                <option value="pendente">
                  Pendente
                </option>

                <option value="pago">
                  Pago
                </option>

                <option value="enviado">
                  Enviado
                </option>

                <option value="concluido">
                  Concluído
                </option>

                <option value="cancelado">
                  Cancelado
                </option>

              </select>

            </div>

          </div>

          {/* =====================================================
              MENSAGENS
              ===================================================== */}

          {mensagem && (
            <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
              {mensagem}
            </div>
          )}

          {erro && (
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {erro}
            </div>
          )}

          {/* =====================================================
              EXCLUIR
              ===================================================== */}

          {pedido.status ===
            "cancelado" && (
            <div className="mt-7 flex flex-col gap-4 rounded-2xl border border-red-500/15 bg-red-500/5 p-5 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="font-bold text-red-300">
                  Pedido cancelado
                </p>

                <p className="mt-1 text-xs leading-5 text-[#77746D]">
                  Este pedido pode ser
                  excluído permanentemente.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  excluirPedido
                }
                disabled={
                  excluindo ||
                  salvando ||
                  aplicandoDesconto
                }
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {excluindo
                  ? "Excluindo..."
                  : "🗑️ Excluir pedido"}
              </button>

            </div>
          )}

        </div>

        {/* =====================================================
            GRID
            ===================================================== */}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* ===================================================
              ITENS
              =================================================== */}

          <section className="rounded-[2rem] border border-white/[0.07] bg-[#1e2125] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)] sm:p-8">

            <div className="mb-7 flex items-center justify-between">

              <div>

                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#77746D]">
                  ✦ Itens do pedido
                </p>

                <h3 className="mt-2 text-2xl font-black">
                  Produtos
                </h3>

              </div>

              <span className="rounded-full border border-white/[0.08] bg-[#222529] px-4 py-2 text-xs font-bold text-[#AAA69C]">
                {itens.length}{" "}
                {itens.length === 1
                  ? "item"
                  : "itens"}
              </span>

            </div>

            {itens.length === 0 ? (

              <div className="rounded-2xl border border-white/[0.06] bg-[#222529] p-10 text-center">

                <div className="text-5xl opacity-40">
                  📦
                </div>

                <p className="mt-4 text-sm text-[#77746D]">
                  Nenhum item encontrado
                  neste pedido.
                </p>

              </div>

            ) : (

              <div className="space-y-4">

                {itens.map((item) => (

                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/[0.06] bg-[#222529] p-5"
                  >

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                      <div>

                        <h4 className="text-lg font-black">
                          {item.nome_produto}
                        </h4>

                        <p className="mt-1 text-xs text-[#77746D]">
                          Produto #
                          {item.produto_id}
                        </p>

                      </div>

                      <div className="grid grid-cols-3 gap-6 sm:text-right">

                        <div>

                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#77746D]">
                            Quantidade
                          </p>

                          <p className="mt-1 font-black">
                            {item.quantidade}
                          </p>

                        </div>

                        <div>

                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#77746D]">
                            Unitário
                          </p>

                          <p className="mt-1 font-black">
                            R${" "}
                            {formatarMoeda(
                              Number(
                                item.preco_unitario
                              )
                            )}
                          </p>

                        </div>

                        <div>

                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#77746D]">
                            Subtotal
                          </p>

                          <p className="mt-1 font-black text-[#e8cf73]">
                            R${" "}
                            {formatarMoeda(
                              Number(
                                item.subtotal
                              )
                            )}
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </section>

          {/* ===================================================
              RESUMO
              =================================================== */}

          <aside className="lg:sticky lg:top-6 lg:h-fit">

            <div className="rounded-[2rem] border border-[#d6b85a]/15 bg-[#1e2125] p-7 shadow-[0_25px_60px_rgba(0,0,0,0.3)]">

              <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#77746D]">
                ✦ Resumo
              </p>

              <h3 className="mt-3 text-3xl font-black">
                Pedido #{pedido.id}
              </h3>

              <div className="my-7 border-t border-white/[0.07]" />

              {/* PRODUTOS */}

              <div className="flex items-center justify-between">

                <span className="text-sm font-bold text-[#77746D]">
                  Produtos
                </span>

                <span className="text-sm font-black">
                  {itens.reduce(
                    (total, item) =>
                      total +
                      item.quantidade,
                    0
                  )}
                </span>

              </div>

              {/* ITENS DIFERENTES */}

              <div className="mt-4 flex items-center justify-between">

                <span className="text-sm font-bold text-[#77746D]">
                  Itens diferentes
                </span>

                <span className="text-sm font-black">
                  {itens.length}
                </span>

              </div>

              <div className="my-7 border-t border-white/[0.07]" />

              {/* =================================================
                  DESCONTO
                  ================================================= */}

              <div className="rounded-2xl border border-white/[0.07] bg-[#222529] p-5">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#77746D]">
                      Desconto
                    </p>

                    <p className="mt-1 text-sm font-black">
                      Dar desconto ao cliente
                    </p>

                  </div>

                  {descontoPercentual >
                    0 && (
                    <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-extrabold text-green-300">
                      -{formatarMoeda(
                        descontoPercentual
                      )}%
                    </span>
                  )}

                </div>

                {pedido.status ===
                "pago" ? (

                  <div className="mt-5 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">

                    <p className="text-xs font-bold leading-5 text-yellow-300">
                      Este pedido já foi
                      pago. O desconto não
                      pode mais ser alterado.
                    </p>

                  </div>

                ) : (

                  <>

                    <div className="mt-5">

                      <label
                        htmlFor="desconto"
                        className="mb-2 block text-[10px] font-extrabold uppercase tracking-widest text-[#77746D]"
                      >
                        Desconto em %
                      </label>

                      <div className="flex gap-2">

                        <div className="relative flex-1">

                          <input
                            id="desconto"
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={
                              descontoInput
                            }
                            onChange={(event) =>
                              setDescontoInput(
                                event.target.value
                              )
                            }
                            placeholder="Ex.: 20"
                            disabled={
                              aplicandoDesconto ||
                              salvando ||
                              excluindo
                            }
                            className="w-full rounded-xl border border-white/[0.08] bg-[#181a1d] px-4 py-3 pr-10 text-sm font-bold text-[#E8E4D8] outline-none transition focus:border-[#d6b85a]/50 disabled:cursor-not-allowed disabled:opacity-50"
                          />

                          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-[#77746D]">
                            %
                          </span>

                        </div>

                        <button
                          type="button"
                          onClick={
                            aplicarDesconto
                          }
                          disabled={
                            aplicandoDesconto ||
                            salvando ||
                            excluindo
                          }
                          className="rounded-xl border border-[#d6b85a]/30 bg-[#d6b85a]/10 px-4 py-3 text-xs font-extrabold uppercase tracking-wider text-[#e8cf73] transition hover:bg-[#d6b85a]/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {aplicandoDesconto
                            ? "Salvando..."
                            : "Aplicar"}
                        </button>

                      </div>

                    </div>

                    {descontoPercentual >
                      0 && (

                      <button
                        type="button"
                        onClick={
                          removerDesconto
                        }
                        disabled={
                          aplicandoDesconto ||
                          salvando ||
                          excluindo
                        }
                        className="mt-3 w-full rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Remover desconto
                      </button>

                    )}

                  </>

                )}

              </div>

              {/* =================================================
                  VALORES
                  ================================================= */}

              <div className="mt-6 space-y-4">

                <div className="flex items-center justify-between">

                  <span className="text-sm font-bold text-[#77746D]">
                    Total dos produtos
                  </span>

                  <span className="text-sm font-black">
                    R${" "}
                    {formatarMoeda(
                      totalOriginal
                    )}
                  </span>

                </div>

                {descontoValor >
                  0 && (

                  <div className="flex items-center justify-between">

                    <span className="text-sm font-bold text-green-400">
                      Desconto (
                      {formatarMoeda(
                        descontoPercentual
                      )}
                      %)
                    </span>

                    <span className="text-sm font-black text-green-400">
                      - R${" "}
                      {formatarMoeda(
                        descontoValor
                      )}
                    </span>

                  </div>

                )}

              </div>

              <div className="my-7 border-t border-white/[0.07]" />

              {/* TOTAL FINAL */}

              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#77746D]">
                Total final do pedido
              </p>

              <p className="mt-2 text-4xl font-black text-[#e8cf73]">
                R${" "}
                {formatarMoeda(
                  totalFinal
                )}
              </p>

              {descontoValor >
                0 && (

                <p className="mt-2 text-xs text-green-400">
                  Cliente economizou R${" "}
                  {formatarMoeda(
                    descontoValor
                  )}
                </p>

              )}

              {/* STATUS */}

              <div className="mt-6 rounded-xl border border-white/[0.06] bg-[#222529] p-4">

                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#77746D]">
                  Status atual
                </p>

                <p className="mt-2 text-sm font-black">
                  {formatarStatus(
                    pedido.status
                  )}
                </p>

              </div>

            </div>

          </aside>

        </div>

      </section>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="border-t border-white/[0.04] px-5 py-10 text-center">

        <p className="text-xs uppercase tracking-widest text-[#77746D]">
          Pokémon TCG • Sealed Products
        </p>

        <p className="mt-4 text-xs text-zinc-700">
          © 2026 Rota 101 TCG
        </p>

      </footer>

    </main>
  );
}