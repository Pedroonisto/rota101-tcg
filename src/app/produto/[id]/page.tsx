"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useCarrinho } from "../../context/CarrinhoContext";

type Produto = {
  id: number;
  nome: string;
  tipo: string;
  preco: number;
  estoque: number;
  imagem: string | null;
  descricao: string | null;
  colecao_id: number;
};

type Colecao = {
  id: number;
  nome: string;
};

export default function ProdutoPage() {
  const params = useParams();
  const { adicionarAoCarrinho } = useCarrinho();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [produto, setProduto] = useState<Produto | null>(null);
  const [colecao, setColecao] = useState<Colecao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [adicionado, setAdicionado] = useState(false);
  const [quantidade, setQuantidade] = useState(1);

  useEffect(() => {
    async function carregarProduto() {
      if (!id) {
        setErro("Produto não encontrado.");
        setCarregando(false);
        return;
      }

      const produtoId = Number(id);

      if (Number.isNaN(produtoId)) {
        setErro("Produto não encontrado.");
        setCarregando(false);
        return;
      }

      const { data: produtoData, error: produtoError } = await supabase
        .from("produtos")
        .select(
          "id, nome, tipo, preco, estoque, imagem, descricao, colecao_id"
        )
        .eq("id", produtoId)
        .single();

      if (produtoError || !produtoData) {
        console.error(produtoError);
        setErro("Produto não encontrado.");
        setCarregando(false);
        return;
      }

      setProduto(produtoData);

      const { data: colecaoData, error: colecaoError } = await supabase
        .from("colecoes")
        .select("id, nome")
        .eq("id", produtoData.colecao_id)
        .single();

      if (!colecaoError && colecaoData) {
        setColecao(colecaoData);
      }

      setCarregando(false);
    }

    carregarProduto();
  }, [id]);

  function diminuirQuantidade() {
    setQuantidade((valorAtual) => Math.max(1, valorAtual - 1));
  }

  function aumentarQuantidade() {
    if (!produto) return;

    setQuantidade((valorAtual) =>
      Math.min(produto.estoque, valorAtual + 1)
    );
  }

  function adicionarProduto() {
    if (!produto || produto.estoque <= 0) {
      return;
    }

    const produtoParaCarrinho = {
      id: String(produto.id),
      nome: produto.nome,
      imagem: produto.imagem || "",
      preco: Number(produto.preco),
      estoque: produto.estoque,
      colecao: colecao?.nome || "",
      tipo: produto.tipo,
      descricao: produto.descricao || "",
    };

    for (let i = 0; i < quantidade; i++) {
      adicionarAoCarrinho(produtoParaCarrinho);
    }

    setAdicionado(true);

    setTimeout(() => {
      setAdicionado(false);
    }, 2500);
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#141619] text-[#E8E4D8]">
        <div className="text-center">
          <div className="text-5xl">📦</div>

          <p className="mt-5 text-xl font-bold text-[#AAA69C]">
            Carregando produto...
          </p>
        </div>
      </main>
    );
  }

  if (erro || !produto) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#141619] px-6 text-[#E8E4D8]">
        <div className="text-center">
          <div className="text-6xl">📦</div>

          <h1 className="mt-6 text-4xl font-black">
            Produto não encontrado
          </h1>

          <p className="mt-3 text-[#AAA69C]">
            O produto "{id}" não foi encontrado.
          </p>

          <Link
            href="/"
            className="mt-7 inline-flex rounded-full bg-[#d0b65b] px-7 py-4 font-extrabold text-[#17181a] transition hover:-translate-y-1"
          >
            ← Voltar para o catálogo
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#141619] text-[#E8E4D8]">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="relative border-b border-white/[0.06] bg-[#181a1d]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(214,184,90,0.08),transparent_55%)]" />

        <div className="relative z-10 mx-auto flex h-28 max-w-7xl items-center justify-between px-5 sm:px-6">

          <Link href="/" className="group">
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

            <Link
              href="/carrinho"
              className="flex items-center gap-2 rounded-full border border-[#d6b85a]/40 bg-[#222529] px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-[#e8cf73] transition hover:-translate-y-1 hover:border-[#e8cf73]"
            >
              🛒 Carrinho
            </Link>

          </nav>
        </div>
      </header>

      {/* =====================================================
          PRODUTO
          ===================================================== */}

      <section className="relative overflow-hidden">

        <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#d6b85a]/5 blur-3xl" />

        <div className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-[#d6b85a]/5 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-6 md:py-16">

          <Link
            href={`/colecao/${produto.colecao_id}`}
            className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#1e2125] px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-[#AAA69C] transition hover:-translate-y-1 hover:border-[#d6b85a]/30 hover:text-[#E8E4D8]"
          >
            ← Voltar para a coleção
          </Link>

          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">

            {/* IMAGEM */}

            <div className="relative">

              <div className="absolute -inset-4 rotate-[2deg] rounded-[3rem] border border-[#d6b85a]/10" />

              <div className="relative flex min-h-[430px] items-center justify-center overflow-hidden rounded-[2.5rem] border border-white/[0.08] bg-[#1e2125] p-8 shadow-[0_35px_90px_rgba(0,0,0,0.4)] sm:min-h-[520px]">

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(214,184,90,0.12),transparent_62%)]" />

                <span className="absolute left-8 top-8 text-2xl text-[#d6b85a]/30">
                  ✦
                </span>

                <span className="absolute bottom-8 right-8 text-xl text-[#d6b85a]/20">
                  ◆
                </span>

                {produto.imagem ? (
                  <img
                    src={produto.imagem}
                    alt={produto.nome}
                    className="relative z-10 max-h-[410px] max-w-full object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.55)] transition duration-500 hover:scale-105"
                  />
                ) : (
                  <span className="relative z-10 text-8xl opacity-30">
                    📦
                  </span>
                )}

                <div className="absolute bottom-5 left-5 z-20 rotate-[-4deg] rounded-lg border border-[#d6b85a]/25 bg-[#202327] px-4 py-2 text-xs uppercase tracking-widest text-[#d6b85a] shadow-xl">
                  SEALED ✦
                </div>

              </div>
            </div>

            {/* INFORMAÇÕES */}

            <div>

              <Link
                href={`/colecao/${produto.colecao_id}`}
                className="inline-flex -rotate-2 rounded-full border border-[#d6b85a]/20 bg-[#222529] px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-[#e2c867] transition hover:border-[#d6b85a]/40"
              >
                🃏 {colecao?.nome || "Pokémon TCG"}
              </Link>

              <h1 className="mt-5 text-5xl font-black leading-none tracking-tight text-[#E8E4D8] sm:text-6xl md:text-7xl">
                {produto.nome}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-3">

                <span className="rounded-md bg-[#d0b65b] px-3 py-1.5 text-xs font-black uppercase tracking-wider text-[#17181a]">
                  {produto.tipo}
                </span>

                <span className="rotate-[2deg] rounded-md border border-white/[0.08] bg-[#1e2125] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#77746D]">
                  Pokémon TCG
                </span>

              </div>

              {produto.descricao && (
                <p className="mt-7 max-w-xl text-base font-medium leading-7 text-[#AAA69C]">
                  {produto.descricao}
                </p>
              )}

              {/* PREÇO */}

              <div className="mt-9 border-y border-white/[0.07] py-7">

                <p className="text-xs font-extrabold uppercase tracking-widest text-[#77746D]">
                  Preço
                </p>

                <p className="mt-2 text-5xl font-black text-[#e8cf73]">
                  R${" "}
                  {Number(produto.preco)
                    .toFixed(2)
                    .replace(".", ",")}
                </p>

              </div>

              {/* ESTOQUE */}

              <div className="mt-6 flex items-center gap-3">

                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    produto.estoque > 0
                      ? "bg-emerald-400"
                      : "bg-red-400"
                  }`}
                />

                <span className="text-sm font-bold text-[#AAA69C]">
                  {produto.estoque > 0
                    ? `${produto.estoque} unidade${
                        produto.estoque !== 1 ? "s" : ""
                      } disponível${
                        produto.estoque !== 1 ? "is" : ""
                      }`
                    : "Produto esgotado"}
                </span>

              </div>

              {/* QUANTIDADE */}

              {produto.estoque > 0 && (
                <div className="mt-7">

                  <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-[#77746D]">
                    Quantidade
                  </p>

                  <div className="flex w-fit items-center overflow-hidden rounded-xl border border-white/[0.08] bg-[#1e2125]">

                    <button
                      type="button"
                      onClick={diminuirQuantidade}
                      disabled={quantidade <= 1}
                      className="flex h-14 w-14 items-center justify-center text-2xl text-[#AAA69C] transition hover:bg-[#292c30] hover:text-[#E8E4D8] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      −
                    </button>

                    <div className="flex h-14 min-w-16 items-center justify-center border-x border-white/[0.08] text-xl font-black text-[#e8cf73]">
                      {quantidade}
                    </div>

                    <button
                      type="button"
                      onClick={aumentarQuantidade}
                      disabled={quantidade >= produto.estoque}
                      className="flex h-14 w-14 items-center justify-center text-2xl text-[#AAA69C] transition hover:bg-[#292c30] hover:text-[#E8E4D8] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      +
                    </button>

                  </div>
                </div>
              )}

              {/* BOTÃO */}

              <button
                type="button"
                onClick={adicionarProduto}
                disabled={produto.estoque <= 0}
                className="mt-7 flex w-full items-center justify-center gap-3 rounded-[1.2rem] border border-[#d6b85a] bg-[#d0b65b] px-6 py-5 text-base font-extrabold text-[#17181a] shadow-[0_18px_40px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:bg-[#e0c873] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-[#292c30] disabled:text-[#77746D]"
              >
                🛒

                {produto.estoque <= 0
                  ? "Produto esgotado"
                  : `Adicionar ${quantidade} ${
                      quantidade === 1 ? "unidade" : "unidades"
                    } ao carrinho`}

                {produto.estoque > 0 && " →"}
              </button>

              {/* CONFIRMAÇÃO */}

              {adicionado && (
                <div className="mt-4 rounded-xl border border-emerald-400/20 bg-[#17231e] px-5 py-4 text-center text-sm font-bold text-emerald-300">
                  ✓ {quantidade}{" "}
                  {quantidade === 1
                    ? "unidade adicionada"
                    : "unidades adicionadas"}{" "}
                  ao carrinho!
                </div>
              )}

              {/* CARRINHO */}

              <Link
                href="/carrinho"
                className="mt-3 flex w-full items-center justify-center rounded-[1.2rem] border border-white/[0.08] bg-[#1e2125] px-6 py-4 text-sm font-extrabold uppercase tracking-wider text-[#AAA69C] transition hover:-translate-y-1 hover:border-[#d6b85a]/30 hover:text-[#E8E4D8]"
              >
                🛒 Ver carrinho
              </Link>

            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL
          ===================================================== */}

      <section className="border-t border-white/[0.06] bg-[#111315]">

        <div className="mx-auto max-w-7xl px-5 py-16 text-center sm:px-6">

          <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-[#77746D]">
            ✦ Rota 101 TCG ✦
          </p>

          <h2 className="mt-4 text-4xl font-black text-[#E8E4D8] md:text-5xl">
            Bora colocar esse no carrinho?
          </h2>

          <p className="mt-3 text-sm font-medium text-[#AAA69C]">
            Produto lacrado, pronto para chegar na sua coleção.
          </p>

          <Link
            href={`/colecao/${produto.colecao_id}`}
            className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#d6b85a] bg-[#d0b65b] px-7 py-3.5 text-sm font-extrabold text-[#17181a] shadow-lg transition hover:-translate-y-1 hover:bg-[#e0c873]"
          >
            ← Ver mais produtos
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