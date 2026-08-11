"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Colecao = {
id: number;
nome: string;
};

export default function NovoProdutoPage() {
const router = useRouter();

const [nome, setNome] = useState("");
const [colecaoId, setColecaoId] = useState("");
const [tipo, setTipo] = useState("");
const [preco, setPreco] = useState("");
const [estoque, setEstoque] = useState("");
const [descricao, setDescricao] = useState("");

const [colecoes, setColecoes] = useState<Colecao[]>([]);
const [arquivo, setArquivo] = useState<File | null>(null);
const [preview, setPreview] = useState("");

const [carregandoColecoes, setCarregandoColecoes] =
useState(true);

const [cadastrando, setCadastrando] = useState(false);
const [erro, setErro] = useState("");
const [mensagem, setMensagem] = useState("");

useEffect(() => {
carregarColecoes();
}, []);

useEffect(() => {
if (!arquivo) {
setPreview("");
return;
}

const url = URL.createObjectURL(arquivo);
setPreview(url);

return () => {
  URL.revokeObjectURL(url);
};

}, [arquivo]);

async function carregarColecoes() {
setCarregandoColecoes(true);
setErro("");

const { data, error } = await supabase
  .from("colecoes")
  .select("id, nome")
  .order("nome", { ascending: true });

if (error) {
  console.error("Erro ao carregar coleções:", error);
  setErro("Não foi possível carregar as coleções.");
  setColecoes([]);
} else {
  setColecoes(data || []);
}

setCarregandoColecoes(false);

}

function selecionarImagem(
event: React.ChangeEvent<HTMLInputElement>
) {
const file = event.target.files?.[0];

if (!file) {
  setArquivo(null);
  return;
}

if (!file.type.startsWith("image/")) {
  setErro("Selecione um arquivo de imagem válido.");
  setArquivo(null);
  return;
}

if (file.size > 5 * 1024 * 1024) {
  setErro("A imagem deve ter no máximo 5 MB.");
  setArquivo(null);
  return;
}

setErro("");
setArquivo(file);

}

function limparFormulario() {
setNome("");
setColecaoId("");
setTipo("");
setPreco("");
setEstoque("");
setDescricao("");
setArquivo(null);
setPreview("");
}

async function cadastrarProduto(
event: React.FormEvent<HTMLFormElement>
) {
event.preventDefault();

if (cadastrando) {
  return;
}

setErro("");
setMensagem("");

const precoNumerico = Number(preco);
const estoqueNumerico = Number(estoque);

if (!nome.trim()) {
  setErro("Informe o nome do produto.");
  return;
}

if (!colecaoId) {
  setErro("Selecione uma coleção.");
  return;
}

if (!tipo.trim()) {
  setErro("Informe o tipo do produto.");
  return;
}

if (
  !preco ||
  Number.isNaN(precoNumerico) ||
  precoNumerico < 0
) {
  setErro("Informe um preço válido.");
  return;
}

if (
  estoque === "" ||
  Number.isNaN(estoqueNumerico) ||
  estoqueNumerico < 0
) {
  setErro("Informe um estoque válido.");
  return;
}

if (!arquivo) {
  setErro("Selecione uma imagem para o produto.");
  return;
}

setCadastrando(true);

let caminhoArquivo = "";

try {
  /*
   * =====================================================
   * UPLOAD DA IMAGEM
   * =====================================================
   */

  const extensao =
    arquivo.name.split(".").pop()?.toLowerCase() || "jpg";

  const nomeArquivo = `${crypto.randomUUID()}.${extensao}`;

  caminhoArquivo = nomeArquivo;

  const { error: uploadError } = await supabase.storage
    .from("produtos")
    .upload(caminhoArquivo, arquivo, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Erro no upload:", uploadError);

    throw new Error(
      `Não foi possível enviar a imagem: ${uploadError.message}`
    );
  }

  /*
   * =====================================================
   * URL PÚBLICA DA IMAGEM
   * =====================================================
   */

  const { data: imagemData } = supabase.storage
    .from("produtos")
    .getPublicUrl(caminhoArquivo);

  const urlImagem = imagemData.publicUrl;

  /*
   * =====================================================
   * CADASTRO DO PRODUTO
   * =====================================================
   */

  const { error: produtoError } = await supabase
    .from("produtos")
    .insert({
      nome: nome.trim(),
      colecao_id: Number(colecaoId),
      tipo: tipo.trim(),
      preco: precoNumerico,
      estoque: estoqueNumerico,
      imagem: urlImagem,
      descricao: descricao.trim(),
    });

  if (produtoError) {
    console.error(
      "Erro ao cadastrar produto:",
      produtoError
    );

    /*
     * Se o produto não foi criado,
     * removemos a imagem que acabou de ser enviada.
     */

    await supabase.storage
      .from("produtos")
      .remove([caminhoArquivo]);

    throw new Error(
      `Não foi possível cadastrar o produto: ${produtoError.message}`
    );
  }

  /*
   * =====================================================
   * SUCESSO
   * =====================================================
   */

  setMensagem("Produto cadastrado com sucesso!");

  limparFormulario();

  setTimeout(() => {
    router.push("/admin/produtos");
  }, 1000);
} catch (error) {
  console.error(error);

  setErro(
    error instanceof Error
      ? error.message
      : "Ocorreu um erro inesperado ao cadastrar o produto."
  );
} finally {
  setCadastrando(false);
}

}

return (
<main className="min-h-screen bg-[#111315] text-[#E8E4D8]">

  {/* =====================================================
      HEADER
      ===================================================== */}

  <header className="border-b border-white/[0.06] bg-[#181a1d]">

    <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-5 sm:px-6">

      <div className="flex items-center gap-4">

        <img
          src="/logo.png"
          alt="Rota 101 TCG"
          className="h-[55px] w-auto object-contain"
        />

        <div className="hidden border-l border-white/[0.08] pl-4 sm:block">

          <p className="text-xs font-extrabold uppercase tracking-widest text-[#77746D]">
            Administração
          </p>

          <h1 className="mt-1 text-xl font-black">
            Novo produto
          </h1>

        </div>

      </div>

      <Link
        href="/admin/produtos"
        className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold transition hover:border-[#d6b85a]/40 hover:bg-[#d6b85a]/10 hover:text-[#e8cf73]"
      >
        ← Voltar
      </Link>

    </div>

  </header>

  {/* =====================================================
      CONTEÚDO
      ===================================================== */}

  <section className="mx-auto max-w-4xl px-5 py-10 sm:px-6 md:py-14">

    <div className="mb-10">

      <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#77746D]">
        ✦ Catálogo ✦
      </p>

      <h2 className="mt-3 text-4xl font-black">
        Cadastrar produto
      </h2>

      <p className="mt-2 text-sm leading-6 text-[#77746D]">
        Preencha as informações do produto para adicioná-lo
        ao catálogo da Rota 101 TCG.
      </p>

    </div>

    {/* =====================================================
        MENSAGENS
        ===================================================== */}

    {erro && (
      <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 px-5 py-4 text-sm font-medium text-red-300">
        {erro}
      </div>
    )}

    {mensagem && (
      <div className="mb-6 rounded-2xl border border-green-400/20 bg-green-400/5 px-5 py-4 text-sm font-medium text-green-300">
        {mensagem}
      </div>
    )}

    {/* =====================================================
        FORMULÁRIO
        ===================================================== */}

    <form
      onSubmit={cadastrarProduto}
      className="space-y-8 rounded-[2rem] border border-white/[0.07] bg-[#1e2125] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.25)] sm:p-8"
    >

      {/* NOME */}

      <div>

        <label className="mb-2 block text-sm font-bold">
          Nome do produto
        </label>

        <input
          type="text"
          value={nome}
          onChange={(event) =>
            setNome(event.target.value)
          }
          placeholder="Ex.: Box Série 3 - Parceiros Iniciais"
          required
          className="w-full rounded-xl border border-white/[0.08] bg-[#111315] px-4 py-3 outline-none transition focus:border-[#d6b85a]/50"
        />

      </div>

      {/* COLEÇÃO + TIPO */}

      <div className="grid gap-6 md:grid-cols-2">

        <div>

          <label className="mb-2 block text-sm font-bold">
            Coleção
          </label>

          <select
            value={colecaoId}
            onChange={(event) =>
              setColecaoId(event.target.value)
            }
            required
            disabled={carregandoColecoes}
            className="w-full rounded-xl border border-white/[0.08] bg-[#111315] px-4 py-3 outline-none transition focus:border-[#d6b85a]/50 disabled:opacity-50"
          >

            <option value="">
              {carregandoColecoes
                ? "Carregando coleções..."
                : "Selecione uma coleção"}
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

          <label className="mb-2 block text-sm font-bold">
            Tipo do produto
          </label>

          <input
            type="text"
            value={tipo}
            onChange={(event) =>
              setTipo(event.target.value)
            }
            placeholder="Ex.: Box, Booster, Deck, Kit..."
            required
            className="w-full rounded-xl border border-white/[0.08] bg-[#111315] px-4 py-3 outline-none transition focus:border-[#d6b85a]/50"
          />

        </div>

      </div>

      {/* PREÇO + ESTOQUE */}

      <div className="grid gap-6 md:grid-cols-2">

        <div>

          <label className="mb-2 block text-sm font-bold">
            Preço
          </label>

          <div className="relative">

            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#77746D]">
              R$
            </span>

            <input
              type="number"
              step="0.01"
              min="0"
              value={preco}
              onChange={(event) =>
                setPreco(event.target.value)
              }
              placeholder="150.00"
              required
              className="w-full rounded-xl border border-white/[0.08] bg-[#111315] py-3 pl-11 pr-4 outline-none transition focus:border-[#d6b85a]/50"
            />

          </div>

        </div>

        <div>

          <label className="mb-2 block text-sm font-bold">
            Estoque
          </label>

          <input
            type="number"
            min="0"
            value={estoque}
            onChange={(event) =>
              setEstoque(event.target.value)
            }
            placeholder="10"
            required
            className="w-full rounded-xl border border-white/[0.08] bg-[#111315] px-4 py-3 outline-none transition focus:border-[#d6b85a]/50"
          />

        </div>

      </div>

      {/* IMAGEM */}

      <div>

        <label className="mb-2 block text-sm font-bold">
          Imagem do produto
        </label>

        <div className="rounded-2xl border border-dashed border-white/[0.12] bg-[#111315] p-5">

          <input
            type="file"
            accept="image/*"
            onChange={selecionarImagem}
            required
            className="block w-full cursor-pointer text-sm text-[#AAA69C] file:mr-4 file:rounded-lg file:border-0 file:bg-[#d0b65b] file:px-4 file:py-2 file:font-bold file:text-[#17181a] hover:file:bg-[#e0c873]"
          />

          <p className="mt-3 text-xs text-[#77746D]">
            Formatos de imagem aceitos. Tamanho máximo: 5 MB.
          </p>

          {arquivo && (
            <p className="mt-2 text-xs font-semibold text-[#e8cf73]">
              Arquivo selecionado: {arquivo.name}
            </p>
          )}

        </div>

        {/* PREVIEW */}

        {preview && (
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#222529]">

            <div className="flex min-h-64 items-center justify-center p-6">

              <img
                src={preview}
                alt="Pré-visualização do produto"
                className="max-h-64 max-w-full object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.45)]"
              />

            </div>

          </div>
        )}

      </div>

      {/* DESCRIÇÃO */}

      <div>

        <label className="mb-2 block text-sm font-bold">
          Descrição
        </label>

        <textarea
          value={descricao}
          onChange={(event) =>
            setDescricao(event.target.value)
          }
          placeholder="Descrição do produto..."
          rows={6}
          required
          className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#111315] px-4 py-3 outline-none transition focus:border-[#d6b85a]/50"
        />

      </div>

      {/* BOTÕES */}

      <div className="flex flex-col-reverse gap-3 border-t border-white/[0.07] pt-6 sm:flex-row sm:justify-end">

        <Link
          href="/admin/produtos"
          className="rounded-xl border border-white/[0.08] px-6 py-3 text-center text-sm font-extrabold text-[#AAA69C] transition hover:bg-[#222529] hover:text-[#E8E4D8]"
        >
          Cancelar
        </Link>

        <button
          type="submit"
          disabled={cadastrando}
          className="rounded-xl border border-[#d6b85a] bg-[#d0b65b] px-7 py-3 text-sm font-extrabold text-[#17181a] transition hover:-translate-y-0.5 hover:bg-[#e0c873] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {cadastrando
            ? "Cadastrando..."
            : "Cadastrar produto"}
        </button>

      </div>

    </form>

  </section>

</main>
);
}