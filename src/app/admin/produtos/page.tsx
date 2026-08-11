"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Produto = {
  id: number;
  nome: string;
  tipo: string;
  preco: number;
  estoque: number;
  imagem: string | null;
  descricao: string | null;
  colecao_id: number;
  colecoes?: {
    nome: string;
  } | null;
};

export default function AdminProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [excluindo, setExcluindo] = useState<number | null>(null);

  async function carregarProdutos() {
    setCarregando(true);
    setErro("");

    const { data, error } = await supabase
      .from("produtos")
      .select(`
        *,
        colecoes (
          nome
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setErro(error.message);
      setProdutos([]);
    } else {
      setProdutos(data || []);
    }

    setCarregando(false);
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function excluirProduto(id: number, nome: string) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir o produto "${nome}"?`
    );

    if (!confirmar) {
      return;
    }

    setExcluindo(id);
    setErro("");

    const { error } = await supabase
      .from("produtos")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      setErro(error.message);
      setExcluindo(null);
      return;
    }

    setProdutos((produtosAtuais) =>
      produtosAtuais.filter((produto) => produto.id !== id)
    );

    setExcluindo(null);
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-red-500">
              Rota 101 TCG
            </p>

            <h1 className="mt-1 text-2xl font-black">
              Produtos
            </h1>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin"
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold transition hover:bg-zinc-900"
            >
              Painel
            </Link>

            <Link
              href="/admin/produtos/novo"
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold transition hover:bg-red-500"
            >
              + Novo produto
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-black">
            Produtos cadastrados
          </h2>

          <p className="mt-2 text-zinc-400">
            Todos os produtos cadastrados na Rota 101 TCG.
          </p>
        </div>

        {erro && (
          <div className="mb-6 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-400">
            {erro}
          </div>
        )}

        {carregando && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-400">
            Carregando produtos...
          </div>
        )}

        {!carregando && produtos.length === 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-400">
            Nenhum produto cadastrado.
          </div>
        )}

        {!carregando && produtos.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {produtos.map((produto) => (
              <div
                key={produto.id}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950"
              >
                <div className="flex h-64 items-center justify-center bg-zinc-900 p-6">
                  {produto.imagem ? (
                    <img
                      src={produto.imagem}
                      alt={produto.nome}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-5xl">
                      📦
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <p className="text-sm text-zinc-500">
                    {produto.colecoes?.nome || "Sem coleção"}
                  </p>

                  <h3 className="mt-1 text-xl font-bold">
                    {produto.nome}
                  </h3>

                  <p className="mt-2 text-sm text-zinc-400">
                    {produto.tipo}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-black text-red-500">
                      R$ {Number(produto.preco).toFixed(2).replace(".", ",")}
                    </span>

                    <span className="text-sm text-zinc-400">
                      Estoque: {produto.estoque}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Link
                      href={`/admin/produtos/${produto.id}`}
                      className="rounded-lg border border-zinc-700 px-4 py-3 text-center font-bold transition hover:border-red-500 hover:bg-zinc-900"
                    >
                      ✏️ Editar
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        excluirProduto(produto.id, produto.nome)
                      }
                      disabled={excluindo === produto.id}
                      className="rounded-lg bg-red-600 px-4 py-3 font-bold transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {excluindo === produto.id
                        ? "Excluindo..."
                        : "🗑️ Excluir"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}