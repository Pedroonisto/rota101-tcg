"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bebas_Neue, Barlow } from "next/font/google";
import { supabase } from "@/lib/supabase";

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-barlow",
});

type Colecao = {
  id: number;
  nome: string;
  imagem: string | null;
  produtosDisponiveis: number;
};

type Produto = {
  colecao_id: number | null;
  estoque: number | null;
};

export default function Home() {
  const [colecoes, setColecoes] = useState<Colecao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [filtro, setFiltro] = useState<"disponiveis" | "todos">(
    "disponiveis"
  );

  useEffect(() => {
    async function carregarColecoes() {
      setCarregando(true);
      setErro("");

      const [
        { data: colecoesData, error: colecoesError },
        { data: produtosData, error: produtosError },
      ] = await Promise.all([
        supabase
          .from("colecoes")
          .select("id, nome, imagem")
          .order("created_at", { ascending: false }),

        supabase
          .from("produtos")
          .select("colecao_id, estoque"),
      ]);

      if (colecoesError) {
        console.error(colecoesError);
        setErro("Não foi possível carregar as coleções.");
        setCarregando(false);
        return;
      }

      if (produtosError) {
        console.error(produtosError);
        setErro("Não foi possível carregar os produtos.");
        setCarregando(false);
        return;
      }

      const produtos = (produtosData || []) as Produto[];

      const colecoesComEstoque: Colecao[] = (colecoesData || []).map(
        (colecao) => {
          const produtosDisponiveis = produtos.filter(
            (produto) =>
              produto.colecao_id === colecao.id &&
              Number(produto.estoque || 0) > 0
          ).length;

          return {
            id: colecao.id,
            nome: colecao.nome,
            imagem: colecao.imagem,
            produtosDisponiveis,
          };
        }
      );

      setColecoes(colecoesComEstoque);
      setCarregando(false);
    }

    carregarColecoes();
  }, []);

  /*
   * DISPONÍVEIS:
   * - Somente coleções com pelo menos 1 produto disponível
   * - Ordenadas pela quantidade de produtos disponíveis
   *
   * TODOS:
   * - Todas as coleções cadastradas
   * - Mantém a ordem original de cadastro
   */
  const colecoesExibidas =
    filtro === "disponiveis"
      ? [...colecoes]
          .filter((colecao) => colecao.produtosDisponiveis > 0)
          .sort(
            (a, b) =>
              b.produtosDisponiveis - a.produtosDisponiveis
          )
      : colecoes;

  return (
    <main
      className={`${bebas.variable} ${barlow.variable} min-h-screen overflow-x-hidden bg-[#141619] text-[#E8E4D8]`}
      style={{ fontFamily: "var(--font-barlow)" }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="relative h-36 overflow-hidden border-b border-white/[0.06] bg-[#181a1d]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(214,184,90,0.08),transparent_50%)]" />

        <div className="pokemon-area absolute inset-0 z-10 overflow-hidden">
          <img
            src="/pokemon/pikachu.png"
            alt=""
            className="pokemon pokemon-1"
          />
          <img
            src="/pokemon/gengar.png"
            alt=""
            className="pokemon pokemon-2"
          />
          <img
            src="/pokemon/typhlosion.png"
            alt=""
            className="pokemon pokemon-3"
          />
          <img
            src="/pokemon/eevee.png"
            alt=""
            className="pokemon pokemon-4"
          />
          <img
            src="/pokemon/charizard.png"
            alt=""
            className="pokemon pokemon-5"
          />
          <img
            src="/pokemon/mewtwo.png"
            alt=""
            className="pokemon pokemon-6"
          />
          <img
            src="/pokemon/mew.png"
            alt=""
            className="pokemon pokemon-7"
          />
          <img
            src="/pokemon/rayquaza.png"
            alt=""
            className="pokemon pokemon-8"
          />
          <img
            src="/pokemon/zapdos.png"
            alt=""
            className="pokemon pokemon-9"
          />
          <img
            src="/pokemon/lucario.png"
            alt=""
            className="pokemon pokemon-10"
          />
          <img
            src="/pokemon/greninja.png"
            alt=""
            className="pokemon pokemon-11"
          />
          <img
            src="/pokemon/darkrai.png"
            alt=""
            className="pokemon pokemon-12"
          />
        </div>

        <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-r from-[#181a1d] via-transparent to-[#181a1d]" />

        <div className="relative z-30 mx-auto flex h-full max-w-7xl items-center justify-between px-5 sm:px-6">
          <Link href="/" className="group flex items-center">
            <img
              src="/logo.png"
              alt="Rota 101 TCG"
              className="h-30 w-auto object-contain drop-shadow-2xl transition duration-300 group-hover:scale-105"
            />
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="#colecoes"
              className="hidden rounded-full px-5 py-3 text-[13px] font-extrabold uppercase tracking-[0.12em] text-[#AAA69C] transition hover:text-[#E8E4D8] sm:block"
            >
              Coleções
            </Link>

            <Link
              href="/carrinho"
              className="group flex items-center gap-2 rounded-full border border-[#d6b85a]/40 bg-[#222529]/90 px-5 py-3 text-[13px] font-extrabold uppercase tracking-[0.08em] text-[#e8cf73] shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:rotate-[-1deg] hover:border-[#e8cf73]"
            >
              <span className="text-base transition-transform duration-300 group-hover:rotate-[-8deg]">
                🛒
              </span>
              Carrinho
            </Link>
          </nav>
        </div>

        <style jsx>{`
          .pokemon-area {
            pointer-events: none;
          }

          .pokemon {
            position: absolute;
            display: block;
            object-fit: contain;
            pointer-events: none;
            opacity: 0.8;
            animation-name: passarPokemon;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
          }

          .pokemon-1 {
            width: 94px;
            height: 94px;
            top: 0;
            animation-duration: 34s;
            animation-delay: -3s;
          }

          .pokemon-2 {
            width: 94px;
            height: 94px;
            top: 52px;
            animation-duration: 39s;
            animation-delay: -21s;
          }

          .pokemon-3 {
            width: 140px;
            height: 140px;
            top: -4px;
            opacity: 0.9;
            animation-duration: 43s;
            animation-delay: -34s;
          }

          .pokemon-4 {
            width: 90px;
            height: 90px;
            top: 53px;
            animation-duration: 37s;
            animation-delay: -12s;
          }

          .pokemon-5 {
            width: 112px;
            height: 112px;
            top: -2px;
            animation-duration: 41s;
            animation-delay: -29s;
          }

          .pokemon-6 {
            width: 104px;
            height: 104px;
            top: 47px;
            animation-duration: 38s;
            animation-delay: -38s;
          }

          .pokemon-7 {
            width: 88px;
            height: 88px;
            top: 0;
            animation-duration: 35s;
            animation-delay: -17s;
          }

          .pokemon-8 {
            width: 126px;
            height: 126px;
            top: 24px;
            animation-duration: 52s;
            animation-delay: -44s;
          }

          .pokemon-9 {
            width: 108px;
            height: 108px;
            top: -2px;
            animation-duration: 40s;
            animation-delay: -8s;
          }

          .pokemon-10 {
            width: 102px;
            height: 102px;
            top: 49px;
            animation-duration: 45s;
            animation-delay: -31s;
          }

          .pokemon-11 {
            width: 102px;
            height: 102px;
            top: 1px;
            animation-duration: 48s;
            animation-delay: -23s;
          }

          .pokemon-12 {
            width: 110px;
            height: 110px;
            top: 47px;
            animation-duration: 44s;
            animation-delay: -15s;
          }

          @keyframes passarPokemon {
            0% {
              left: -180px;
              transform: translateY(0) rotate(-3deg);
            }

            25% {
              transform: translateY(-7px) rotate(2deg);
            }

            50% {
              transform: translateY(5px) rotate(-2deg);
            }

            75% {
              transform: translateY(-5px) rotate(3deg);
            }

            100% {
              left: calc(100% + 180px);
              transform: translateY(0) rotate(-3deg);
            }
          }

          .decorativo {
            position: absolute;
            z-index: 5;
            pointer-events: none;
            object-fit: contain;
            filter: drop-shadow(0 22px 24px rgba(0, 0, 0, 0.55));
          }

          .decorativo-a {
            animation: flutuarA 6s ease-in-out infinite;
          }

          .decorativo-b {
            animation: flutuarB 7s ease-in-out infinite;
          }

          .decorativo-c {
            animation: flutuarC 8s ease-in-out infinite;
          }

          @keyframes flutuarA {
            0%,
            100% {
              transform: translateY(0) rotate(-4deg);
            }

            50% {
              transform: translateY(-14px) rotate(4deg);
            }
          }

          @keyframes flutuarB {
            0%,
            100% {
              transform: translateY(0) rotate(5deg);
            }

            50% {
              transform: translateY(-18px) rotate(-4deg);
            }
          }

          @keyframes flutuarC {
            0%,
            100% {
              transform: translateY(0) rotate(-2deg);
            }

            50% {
              transform: translateY(-11px) rotate(5deg);
            }
          }
        `}</style>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden bg-[#181a1d]">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-[8%] top-20 h-px w-32 rotate-[-18deg] bg-[#d6b85a]/30" />
          <div className="absolute right-[12%] top-32 h-px w-48 rotate-[14deg] bg-[#d6b85a]/20" />
          <div className="absolute bottom-16 left-[30%] h-px w-24 rotate-[8deg] bg-white/10" />
        </div>

        <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-[#d6b85a]/5 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#d6b85a]/5 blur-3xl" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-6 md:py-28 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="inline-flex -rotate-2 items-center gap-3 rounded-full border border-[#d6b85a]/30 bg-[#222529] px-4 py-2 shadow-xl">
              <span className="text-sm text-[#e8cf73]">✦</span>

              <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-[#e2c867]">
                Pokémon TCG
              </p>

              <span className="text-sm text-[#e8cf73]">✦</span>
            </div>

            <h1
              className="mt-7 max-w-3xl text-[4.5rem] leading-[0.82] tracking-[0.01em] text-[#E8E4D8] sm:text-[5.5rem] md:text-[6.8rem]"
              style={{ fontFamily: "var(--font-bebas)" }}
            >
              Bora encontrar
              <br />
              sua próxima
              <br />

              <span className="relative ml-1 inline-block rotate-[-2deg] text-[#e5cb6d]">
                coleção

                <span className="absolute -right-6 -top-4 rotate-12 text-xl text-[#d6b85a]">
                  ✦
                </span>

                <span className="absolute -bottom-1 left-0 h-[5px] w-full rotate-[-1deg] rounded-full bg-[#d6b85a]/40" />
              </span>

              <span className="ml-1">?</span>
            </h1>

            <p className="mt-8 max-w-xl text-[17px] font-medium leading-8 tracking-[-0.01em] text-[#AAA69C]">
              Produtos lacrados, coleções e lançamentos de Pokémon TCG para
              quem gosta de abrir, colecionar e jogar.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#colecoes"
                className="group relative overflow-hidden rounded-full border border-[#d6b85a] bg-[#d0b65b] px-7 py-4 text-center text-[15px] font-extrabold tracking-[0.01em] text-[#17181a] shadow-[0_12px_40px_rgba(214,184,90,0.12)] transition duration-300 hover:-translate-y-1 hover:rotate-[-1.5deg] hover:bg-[#e0c873]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Explorar produtos

                  <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </a>

              <Link
                href="/carrinho"
                className="rounded-full border border-white/10 bg-[#222529] px-7 py-4 text-center text-[15px] font-bold tracking-[0.01em] text-[#E8E4D8] transition duration-300 hover:-translate-y-1 hover:rotate-[1deg] hover:border-[#d6b85a]/50"
              >
                🛒 Meu carrinho
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#77746D]">
              <span className="flex items-center gap-2">
                <span className="text-[#d6b85a]">◆</span>
                Produtos lacrados
              </span>

              <span className="hidden text-zinc-800 sm:block">/</span>

              <span className="flex items-center gap-2">
                <span className="text-[#d6b85a]">◆</span>
                Pokémon TCG
              </span>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute h-80 w-80 rotate-[9deg] rounded-[3rem] border border-[#d6b85a]/10" />
            <div className="absolute h-72 w-72 -rotate-[8deg] rounded-[3rem] border border-white/[0.04]" />
            <div className="absolute h-60 w-60 rotate-3 rounded-[2.5rem] border border-[#d6b85a]/5" />
            <div className="absolute h-52 w-52 rounded-full bg-[#d6b85a]/5 blur-2xl" />

            <div className="relative z-10 rotate-[-3deg]">
              <img
                src="/logo.png"
                alt="Rota 101 TCG"
                className="w-full max-w-md object-contain drop-shadow-[0_30px_35px_rgba(0,0,0,0.55)] transition duration-500 hover:rotate-3 hover:scale-105"
              />

              <div
                className="absolute -right-8 -top-6 rotate-[12deg] rounded-lg border border-[#d6b85a]/30 bg-[#202327] px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-[#d6b85a] shadow-xl"
                style={{ fontFamily: "var(--font-bebas)" }}
              >
                TCG
              </div>

              <div
                className="absolute -bottom-4 -left-8 -rotate-[9deg] rounded-lg border border-white/10 bg-[#202327] px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-[#77746D] shadow-xl"
                style={{ fontFamily: "var(--font-bebas)" }}
              >
                COLLECT
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          COLEÇÕES
      ===================================================== */}

      <section id="colecoes" className="relative bg-[#141619]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-28">
          <div className="relative z-20 mb-16 flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <div>
              <div className="inline-flex -rotate-2 items-center gap-2 rounded-full border border-[#d6b85a]/20 bg-[#1e2125] px-4 py-2 shadow-lg">
                <span className="text-sm">🃏</span>

                <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-[#e2c867]">
                  Escolha sua próxima
                </p>
              </div>

              <h2
                className="mt-5 text-[4.8rem] leading-none tracking-[0.01em] text-[#E8E4D8] md:text-[6rem]"
                style={{ fontFamily: "var(--font-bebas)" }}
              >
                Coleções <span className="ml-2 text-[#d6b85a]">.</span>
              </h2>

              <p className="mt-3 max-w-xl text-[15px] font-medium text-[#AAA69C]">
                Lacrados, lançamentos e produtos para aumentar sua coleção.
              </p>
            </div>

            <div
              className="rotate-[2deg] rounded-xl border border-[#d6b85a]/20 bg-[#1e2125] px-5 py-3 text-[14px] uppercase tracking-[0.16em] text-[#d6b85a] shadow-lg"
              style={{ fontFamily: "var(--font-bebas)" }}
            >
              ✦ Colecione do seu jeito
            </div>
          </div>

          {/* =====================================================
              FILTRO
          ===================================================== */}

          {!carregando && !erro && colecoes.length > 0 && (
            <div className="relative z-30 mb-10 flex justify-center">
              <div className="flex w-full max-w-md rounded-full border border-white/10 bg-[#1e2125] p-1.5 shadow-xl">
                <button
                  type="button"
                  onClick={() => setFiltro("disponiveis")}
                  className={`flex-1 rounded-full px-5 py-3 text-[12px] font-extrabold uppercase tracking-[0.14em] transition duration-300 ${
                    filtro === "disponiveis"
                      ? "bg-[#d0b65b] text-[#17181a] shadow-lg"
                      : "text-[#AAA69C] hover:text-[#E8E4D8]"
                  }`}
                >
                  Disponíveis
                </button>

                <button
                  type="button"
                  onClick={() => setFiltro("todos")}
                  className={`flex-1 rounded-full px-5 py-3 text-[12px] font-extrabold uppercase tracking-[0.14em] transition duration-300 ${
                    filtro === "todos"
                      ? "bg-[#d0b65b] text-[#17181a] shadow-lg"
                      : "text-[#AAA69C] hover:text-[#E8E4D8]"
                  }`}
                >
                  Todos
                </button>
              </div>
            </div>
          )}

          <div className="relative">
            <div className="pointer-events-none absolute inset-0 z-0 hidden xl:block">
              <img
                src="/pokemon/gengar.png"
                alt=""
                className="decorativo decorativo-a absolute -left-[250px] top-[-90px] w-48 rotate-[-27deg] opacity-40"
              />

              <img
                src="/pokemon/lucario.png"
                alt=""
                className="decorativo decorativo-b absolute -left-[370px] top-[230px] w-44 rotate-[31deg] opacity-35"
              />

              <img
                src="/pokemon/zapdos.png"
                alt=""
                className="decorativo decorativo-c absolute -left-[205px] top-[510px] w-48 rotate-[14deg] opacity-32"
              />

              <img
                src="/pokemon/rayquaza.png"
                alt=""
                className="decorativo decorativo-a absolute -left-[390px] top-[760px] w-56 rotate-[-32deg] opacity-28"
              />

              <img
                src="/pokemon/eevee.png"
                alt=""
                className="decorativo decorativo-b absolute -right-[215px] top-[35px] w-40 rotate-[19deg] opacity-40"
              />

              <img
                src="/pokemon/greninja.png"
                alt=""
                className="decorativo decorativo-c absolute -right-[385px] top-[300px] w-48 rotate-[-29deg] opacity-35"
              />

              <img
                src="/pokemon/darkrai.png"
                alt=""
                className="decorativo decorativo-a absolute -right-[215px] top-[545px] w-48 rotate-[164deg] opacity-30"
              />

              <img
                src="/pokemon/mewtwo.png"
                alt=""
                className="decorativo decorativo-b absolute -right-[400px] top-[805px] w-48 rotate-[28deg] opacity-28"
              />
            </div>

            <div className="relative z-10">
              {carregando ? (
                <div className="rounded-[2rem] border border-white/10 bg-[#1e2125] p-12 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-[#d6b85a]" />

                  <p className="mt-4 text-sm text-[#AAA69C]">
                    Procurando as coleções...
                  </p>
                </div>
              ) : erro ? (
                <div className="rounded-[2rem] border border-red-900/40 bg-[#211d1e] p-10 text-center">
                  <p className="font-semibold text-red-400">{erro}</p>
                </div>
              ) : colecoesExibidas.length === 0 ? (
                <div className="rounded-[2rem] border border-white/10 bg-[#1e2125] p-12 text-center">
                  <div className="text-5xl opacity-50">
                    {filtro === "disponiveis" ? "📦" : "🗂️"}
                  </div>

                  <h3
                    className="mt-5 text-[2rem] leading-none text-[#E8E4D8]"
                    style={{ fontFamily: "var(--font-bebas)" }}
                  >
                    {filtro === "disponiveis"
                      ? "Nenhum produto disponível"
                      : "Ainda não tem coleção por aqui"}
                  </h3>

                  <p className="mt-2 text-sm text-[#AAA69C]">
                    {filtro === "disponiveis"
                      ? "No momento não temos produtos disponíveis em estoque."
                      : "Assim que você cadastrar uma, ela aparece aqui."}
                  </p>

                  {filtro === "disponiveis" && colecoes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFiltro("todos")}
                      className="mt-6 rounded-full border border-[#d6b85a] bg-[#d0b65b] px-6 py-3 text-sm font-extrabold text-[#17181a] transition hover:-translate-y-1 hover:bg-[#e0c873]"
                    >
                      Ver todas as coleções
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 lg:gap-8">
                  {colecoesExibidas.map((colecao, index) => (
                    <Link
                      key={colecao.id}
                      href={`/colecao/${colecao.id}`}
                      className="group relative"
                    >
                      <div className="absolute -inset-3 rounded-[2rem] bg-[#d6b85a]/0 blur-2xl transition duration-500 group-hover:bg-[#d6b85a]/10" />

                      <div
                        className={`relative overflow-hidden rounded-[1rem] border border-white/[0.08] bg-[#1e2125] shadow-[0_20px_50px_rgba(0,0,0,0.25)] transition duration-500 group-hover:-translate-y-2 group-hover:border-[#d6b85a]/30 group-hover:shadow-[0_30px_70px_rgba(0,0,0,0.4)] sm:rounded-[1.65rem] sm:group-hover:-translate-y-3 ${
                          index % 3 === 1
                            ? "rotate-[0.7deg] group-hover:rotate-[-1deg]"
                            : index % 3 === 2
                              ? "rotate-[-0.7deg] group-hover:rotate-[1deg]"
                              : "rotate-0"
                        }`}
                      >
                        <div
                          className="absolute left-2 top-2 z-20 rounded-md border border-white/10 bg-[#17191c]/90 px-1.5 py-1 text-[7px] uppercase tracking-[0.12em] text-[#77746D] backdrop-blur sm:left-5 sm:top-5 sm:px-2.5 sm:py-1.5 sm:text-[10px] sm:tracking-[0.18em]"
                          style={{ fontFamily: "var(--font-bebas)" }}
                        >
                          SEALED
                        </div>

                        <div className="absolute right-2 top-2 z-20 text-xs text-[#d6b85a]/30 transition group-hover:text-[#d6b85a] sm:right-5 sm:top-5 sm:text-base">
                          ✦
                        </div>

                        <div className="relative m-1.5 flex h-40 items-center justify-center overflow-hidden rounded-[0.8rem] border border-white/[0.05] bg-[#272a2e] p-3 sm:m-2.5 sm:h-72 sm:rounded-[1.3rem] sm:p-7">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(214,184,90,0.10),transparent_65%)]" />

                          <div className="absolute -right-16 -top-16 h-40 w-40 rotate-12 rounded-[2rem] border border-[#d6b85a]/10" />

                          <div className="absolute -bottom-20 -left-16 h-44 w-44 -rotate-12 rounded-[2rem] border border-white/[0.04]" />

                          {colecao.imagem ? (
                            <img
                              src={colecao.imagem}
                              alt={colecao.nome}
                              className="relative z-10 max-h-full max-w-full object-contain drop-shadow-2xl transition duration-500 group-hover:scale-110 group-hover:rotate-2"
                            />
                          ) : (
                            <span className="relative z-10 text-4xl opacity-30 sm:text-6xl">
                              🗂️
                            </span>
                          )}
                        </div>

                        <div className="px-2.5 pb-3 pt-1.5 sm:px-6 sm:pb-7 sm:pt-3">
                          <div className="flex items-center justify-between gap-1">
                            <p
                              className="text-[9px] uppercase tracking-[0.08em] text-[#d6b85a] sm:text-[15px] sm:tracking-[0.12em]"
                              style={{ fontFamily: "var(--font-bebas)" }}
                            >
                              Coleção #
                              {String(index + 1).padStart(2, "0")}
                            </p>

                            <span
                              className="text-[9px] tracking-[0.08em] text-zinc-700 sm:text-[14px] sm:tracking-[0.12em]"
                              style={{ fontFamily: "var(--font-bebas)" }}
                            >
                              R101
                            </span>
                          </div>

                          <h3
                            className="mt-1.5 line-clamp-2 text-[1.35rem] leading-none tracking-[0.01em] text-[#E8E4D8] transition group-hover:text-[#e8cf73] sm:mt-3 sm:text-[2.2rem]"
                            style={{ fontFamily: "var(--font-bebas)" }}
                          >
                            {colecao.nome}
                          </h3>

                          <p className="mt-1.5 line-clamp-2 text-[9px] font-medium leading-4 text-[#AAA69C] sm:mt-3 sm:text-[13px] sm:leading-6">
                            Produtos lacrados dessa coleção.
                          </p>

                          <div className="mt-3 flex items-center justify-between sm:mt-6">
                            <span
                              className="text-[10px] uppercase tracking-[0.06em] text-[#AAA69C] sm:text-[16px] sm:tracking-[0.1em]"
                              style={{ fontFamily: "var(--font-bebas)" }}
                            >
                              Explorar
                            </span>

                            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#292c30] text-sm text-[#AAA69C] transition duration-300 group-hover:border-[#d6b85a] group-hover:bg-[#d6b85a] group-hover:text-[#17181a] sm:h-10 sm:w-10 sm:text-lg">
                              →
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL
      ===================================================== */}

      <section className="relative overflow-hidden border-y border-white/[0.06] bg-[#111315]">
        <img
          src="/pokemon/rayquaza.png"
          alt=""
          className="decorativo decorativo-a absolute -left-12 top-12 w-44 rotate-[-12deg] opacity-25 sm:w-56"
        />

        <img
          src="/pokemon/darkrai.png"
          alt=""
          className="decorativo decorativo-b absolute -right-10 bottom-0 w-40 rotate-[18deg] opacity-20 sm:w-52"
        />

        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#d6b85a]/5 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-5 py-20 text-center sm:px-6">
          <div
            className="inline-flex rotate-[-2deg] rounded-md border border-[#d6b85a]/20 bg-[#1e2125] px-4 py-2 text-[14px] uppercase tracking-[0.2em] text-[#e2c867]"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            ✦ Rota 101 TCG ✦
          </div>

          <img
            src="/logo.png"
            alt="Rota 101 TCG"
            className="mx-auto mt-6 h-24 w-auto object-contain opacity-90"
          />

          <div className="mx-auto mt-6 flex items-center justify-center gap-3 text-[#d6b85a]/50">
            <span>◆</span>
            <div className="h-px w-16 bg-[#d6b85a]/40" />
            <span>✦</span>
            <div className="h-px w-16 bg-[#d6b85a]/40" />
            <span>◆</span>
          </div>

          <h2
            className="mt-7 text-[3.8rem] leading-none tracking-[0.01em] text-[#E8E4D8] md:text-[5rem]"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            Achou sua próxima coleção?
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-sm font-medium text-[#AAA69C]">
            Então bora completar essa coleção.
          </p>

          <a
            href="#colecoes"
            className="group mt-7 inline-flex items-center gap-2 rounded-full border border-[#d6b85a] bg-[#d0b65b] px-7 py-3.5 text-[15px] font-extrabold tracking-[0.01em] text-[#17181a] shadow-lg shadow-[#d6b85a]/10 transition duration-300 hover:-translate-y-1 hover:rotate-[-1deg] hover:bg-[#e0c873]"
          >
            Explorar produtos

            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-white/[0.04] px-5 py-10 text-center sm:px-6">
        <img
          src="/logo.png"
          alt="Rota 101 TCG"
          className="mx-auto h-14 w-auto object-contain opacity-50"
        />

        <div
          className="mx-auto mt-4 flex items-center justify-center gap-3 text-[13px] uppercase tracking-[0.16em] text-zinc-700"
          style={{ fontFamily: "var(--font-bebas)" }}
        >
          <span>ROTA 101</span>
          <span>•</span>
          <span>POKÉMON TCG</span>
          <span>•</span>
          <span>SEALED PRODUCTS</span>
        </div>

        <p className="mt-4 text-[10px] text-zinc-700">
          © 2026 Rota 101 TCG
        </p>
      </footer>
    </main>
  );
}