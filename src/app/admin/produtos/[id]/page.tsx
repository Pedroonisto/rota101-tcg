"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Colecao = {
  id: number;
  nome: string;
};

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

export default function EditarProdutoPage() {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);

  const [colecoes, setColecoes] = useState<Colecao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [preco, setPreco] = useState("");
  const [estoque, setEstoque] = useState("");
  const [imagem, setImagem] = useState("");
  const [descricao, setDescricao] = useState("");
  const [colecaoId, setColecaoId] = useState("");

  useEffect(() => {
    if (!id) return;

    carregarDados();
  }, [id]);

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    const [produtoResponse, colecoesResponse] = await Promise.all([
      supabase
        .from("produtos")
        .select("*")
        .eq("id", id)
        .single(),

      supabase
        .from("colecoes")
        .select("id, nome")
        .order("nome"),
    ]);

    if (produtoResponse.error) {
      console.error(produtoResponse.error);
      setErro("Não foi possível carregar o produto.");
      setCarregando(false);
      return;
    }

    if (colecoesResponse.error) {
      console.error(colecoesResponse.error);
      setErro("Não foi possível carregar as coleções.");
      setCarregando(false);
      return;
    }

    const produto = produtoResponse.data;

    setNome(produto.nome || "");
    setTipo(produto.tipo || "");
    setPreco(String(produto.preco ?? ""));
    setEstoque(String(produto.estoque ?? ""));
    setImagem(produto.imagem || "");
    setDescricao(produto.descricao || "");
    setColecaoId(String(produto.colecao_id ?? ""));

    setColecoes(colecoesResponse.data || []);
    setCarregando(false);
  }

  async function salvarProduto(e: React.FormEvent) {
    e.preventDefault();

    setSalvando(true);
    setMensagem("");
    setErro("");

    const { error } = await supabase
      .from("produtos")
      .update({
        nome,
        tipo,
        preco: Number(preco),
        estoque: Number(estoque),
        imagem,
        descricao,
        colecao_id: Number(colecaoId),
      })
      .eq("id", id);

    setSalvando(false);

    if (error) {
      console.error(error);
      setErro(error.message);
      return;
    }

    setMensagem("Produto atualizado com sucesso!");

    setTimeout(() => {
      router.push("/admin/produtos");
    }, 1000);
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <p className="text-zinc-400">
            Carregando produto...
          </p>
        </div>
      </main>
    );
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
              Editar produto
            </h1>
          </div>

          <Link
            href="/admin/produtos"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold transition hover:bg-zinc-900"
          >
            Voltar para produtos
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-2xl font-black">
            Editar informações
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            Altere as informações do produto e salve as mudanças.
          </p>

          {erro && (
            <div className="mt-6 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-400">
              {erro}
            </div>
          )}

          {mensagem && (
            <div className="mt-6 rounded-lg border border-green-900 bg-green-950/40 p-4 text-sm text-green-400">
              {mensagem}
            </div>
          )}

          <form
            onSubmit={salvarProduto}
            className="mt-8 space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Nome do produto
              </label>

              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Coleção
              </label>

              <select
                value={colecaoId}
                onChange={(e) => setColecaoId(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-red-500"
              >
                <option value="">
                  Selecione uma coleção
                </option>

                {colecoes.map((colecao) => (
                  <option
                    key={colecao.id}
                    value={colecao.id}
                  >
                    {colecao.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Tipo
              </label>

              <input
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-red-500"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Preço
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  required
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Estoque
                </label>

                <input
                  type="number"
                  min="0"
                  value={estoque}
                  onChange={(e) => setEstoque(e.target.value)}
                  required
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Caminho da imagem
              </label>

              <input
                value={imagem}
                onChange={(e) => setImagem(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-red-500"
                placeholder="/produto.png"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Descrição
              </label>

              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
                rows={5}
                className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={salvando}
              className="w-full rounded-lg bg-red-600 px-4 py-3 font-bold transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {salvando
                ? "Salvando..."
                : "Salvar alterações"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}