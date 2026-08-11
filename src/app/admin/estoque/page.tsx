"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Produto = {
  id: number;
  nome: string;
  estoque: number;
};

type ItemEntrada = {
  produto_id: number;
  quantidade: number;
  custo_unitario: number;
};

export default function EstoquePage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [descricao, setDescricao] = useState("");
  const [produtoId, setProdutoId] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [custoUnitario, setCustoUnitario] = useState("");

  const [itens, setItens] = useState<ItemEntrada[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    const { data, error } = await supabase
      .from("produtos")
      .select("id, nome, estoque")
      .order("nome");

    if (error) {
      console.error(error);
      setErro("Não foi possível carregar os produtos.");
    } else {
      setProdutos(data || []);
    }

    setCarregando(false);
  }

  function adicionarItem() {
    setErro("");
    setMensagem("");

    if (!produtoId) {
      setErro("Selecione um produto.");
      return;
    }

    const quantidadeNumero = Number(quantidade);
    const custoNumero = Number(custoUnitario);

    if (
      !Number.isFinite(quantidadeNumero) ||
      quantidadeNumero <= 0
    ) {
      setErro("Informe uma quantidade válida.");
      return;
    }

    if (!Number.isFinite(custoNumero) || custoNumero < 0) {
      setErro("Informe um custo unitário válido.");
      return;
    }

    const produto = produtos.find(
      (item) => item.id === Number(produtoId)
    );

    if (!produto) {
      setErro("Produto não encontrado.");
      return;
    }

    const novoItem: ItemEntrada = {
      produto_id: produto.id,
      quantidade: quantidadeNumero,
      custo_unitario: custoNumero,
    };

    setItens((atual) => [...atual, novoItem]);

    setProdutoId("");
    setQuantidade("");
    setCustoUnitario("");
  }

  function removerItem(index: number) {
    setItens((atual) =>
      atual.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function nomeProduto(produtoId: number) {
    return (
      produtos.find((produto) => produto.id === produtoId)?.nome ||
      `Produto #${produtoId}`
    );
  }

  function totalEntrada() {
    return itens.reduce(
      (total, item) =>
        total + item.quantidade * item.custo_unitario,
      0
    );
  }

  async function salvarEntrada() {
    setErro("");
    setMensagem("");

    if (!descricao.trim()) {
      setErro("Informe uma descrição para essa entrada.");
      return;
    }

    if (itens.length === 0) {
      setErro("Adicione pelo menos um produto.");
      return;
    }

    setSalvando(true);

    try {
      const { data: entrada, error: entradaError } =
        await supabase
          .from("entradas_estoque")
          .insert({
            descricao: descricao.trim(),
            valor_total: Number(totalEntrada().toFixed(2)),
          })
          .select("id")
          .single();

      if (entradaError || !entrada) {
        console.error(entradaError);
        throw new Error(
          entradaError?.message ||
            "Não foi possível criar a entrada."
        );
      }

      const itensParaSalvar = itens.map((item) => ({
        entrada_id: entrada.id,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        custo_unitario: Number(
          item.custo_unitario.toFixed(2)
        ),
      }));

      const { error: itensError } = await supabase
        .from("entradas_estoque_itens")
        .insert(itensParaSalvar);

      if (itensError) {
        console.error(itensError);

        await supabase
          .from("entradas_estoque")
          .delete()
          .eq("id", entrada.id);

        throw new Error(
          "Não foi possível salvar os produtos da entrada."
        );
      }

      for (const item of itens) {
        const produtoAtual = produtos.find(
          (produto) => produto.id === item.produto_id
        );

        if (!produtoAtual) {
          continue;
        }

        const novoEstoque =
          produtoAtual.estoque + item.quantidade;

        const { error: estoqueError } = await supabase
          .from("produtos")
          .update({
            estoque: novoEstoque,
          })
          .eq("id", item.produto_id);

        if (estoqueError) {
          console.error(estoqueError);

          throw new Error(
            `A entrada foi registrada, mas não foi possível atualizar o estoque de ${produtoAtual.nome}.`
          );
        }
      }

      setMensagem(
        `Entrada registrada com sucesso! Total: R$ ${totalEntrada()
          .toFixed(2)
          .replace(".", ",")}`
      );

      setDescricao("");
      setItens([]);

      await carregarProdutos();
    } catch (error) {
      console.error(error);

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a entrada."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#111315] text-[#E8E4D8]">
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
                Estoque
              </h1>
            </div>
          </div>

          <Link
            href="/admin"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold transition hover:bg-zinc-900"
          >
            ← Painel
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6">
        <div className="mb-10">
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#77746D]">
            ✦ Administração ✦
          </p>

          <h2 className="mt-3 text-4xl font-black">
            Entrada de estoque
          </h2>

          <p className="mt-2 text-sm text-[#77746D]">
            Registre os produtos que chegaram e quanto você pagou por eles.
          </p>
        </div>

        {erro && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {erro}
          </div>
        )}

        {mensagem && (
          <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 px-5 py-4 text-sm text-green-300">
            {mensagem}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="text-xl font-black">
                Nova compra
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                Identifique essa entrada de produtos.
              </p>

              <div className="mt-6">
                <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                  Descrição
                </label>

                <input
                  type="text"
                  value={descricao}
                  onChange={(event) =>
                    setDescricao(event.target.value)
                  }
                  placeholder="Ex.: Compra de produtos Pokémon - Agosto"
                  className="mt-2 w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 outline-none transition focus:border-[#d6b85a]"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="text-xl font-black">
                Produtos recebidos
              </h3>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                    Produto
                  </label>

                  <select
                    value={produtoId}
                    onChange={(event) =>
                      setProdutoId(event.target.value)
                    }
                    disabled={carregando}
                    className="mt-2 w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-[#d6b85a]"
                  >
                    <option value="">
                      {carregando
                        ? "Carregando..."
                        : "Selecione"}
                    </option>

                    {produtos.map((produto) => (
                      <option
                        key={produto.id}
                        value={produto.id}
                      >
                        {produto.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                    Quantidade
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(event) =>
                      setQuantidade(event.target.value)
                    }
                    placeholder="10"
                    className="mt-2 w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-[#d6b85a]"
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                    Custo unitário
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={custoUnitario}
                    onChange={(event) =>
                      setCustoUnitario(event.target.value)
                    }
                    placeholder="25.00"
                    className="mt-2 w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-[#d6b85a]"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={adicionarItem}
                className="mt-5 rounded-lg border border-[#d6b85a]/40 bg-[#d6b85a]/10 px-5 py-3 text-sm font-extrabold text-[#e8cf73] transition hover:bg-[#d6b85a]/20"
              >
                + Adicionar produto
              </button>
            </div>

            {itens.length > 0 && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
                <div className="border-b border-zinc-800 bg-zinc-900/50 px-6 py-4">
                  <h3 className="font-black">
                    Itens da compra
                  </h3>
                </div>

                <div className="divide-y divide-zinc-800">
                  {itens.map((item, index) => {
                    const subtotal =
                      item.quantidade *
                      item.custo_unitario;

                    return (
                      <div
                        key={`${item.produto_id}-${index}`}
                        className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-bold">
                            {nomeProduto(item.produto_id)}
                          </p>

                          <p className="mt-1 text-sm text-zinc-500">
                            {item.quantidade} unidades × R${" "}
                            {item.custo_unitario
                              .toFixed(2)
                              .replace(".", ",")}
                          </p>
                        </div>

                        <div className="flex items-center gap-5">
                          <p className="font-black text-[#e8cf73]">
                            R${" "}
                            {subtotal
                              .toFixed(2)
                              .replace(".", ",")}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              removerItem(index)
                            }
                            className="text-xs font-extrabold uppercase tracking-wider text-red-400 transition hover:text-red-300"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-6 lg:h-fit">
            <div className="rounded-2xl border border-[#d6b85a]/15 bg-[#1e2125] p-7">
              <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#77746D]">
                ✦ Resumo
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Compra
              </h2>

              <div className="my-7 border-t border-white/[0.07]" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#77746D]">
                  Produtos
                </span>

                <span className="font-black">
                  {itens.reduce(
                    (total, item) =>
                      total + item.quantidade,
                    0
                  )}
                </span>
              </div>

              <div className="my-7 border-t border-white/[0.07]" />

              <p className="text-xs font-extrabold uppercase tracking-widest text-[#77746D]">
                Total gasto
              </p>

              <p className="mt-2 text-4xl font-black text-[#e8cf73]">
                R${" "}
                {totalEntrada()
                  .toFixed(2)
                  .replace(".", ",")}
              </p>

              <button
                type="button"
                onClick={salvarEntrada}
                disabled={salvando || itens.length === 0}
                className="mt-7 w-full rounded-xl border border-[#d6b85a] bg-[#d0b65b] px-6 py-4 text-sm font-extrabold text-[#17181a] transition hover:bg-[#e0c873] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {salvando
                  ? "Salvando entrada..."
                  : "Registrar entrada"}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-[#77746D]">
                Ao registrar, o estoque dos produtos será
                atualizado automaticamente.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}