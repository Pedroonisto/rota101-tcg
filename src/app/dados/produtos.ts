export type Produto = {
  id: string;
  nome: string;
  colecao: string;
  tipo: string;
  preco: number;
  estoque: number;
  imagem: string;
  descricao: string;
};

export type Colecao = {
  id: string;
  nome: string;
  imagem: string;
  descricao: string;
};

export const colecoes: Colecao[] = [
  {
    id: "parceiros-iniciais",
    nome: "Parceiros Iniciais",
    imagem: "/parceiros iniciais.png",
    descricao:
      "Produtos da coleção Parceiros Iniciais de Pokémon TCG.",
  },
];

export const produtos: Produto[] = [
  {
    id: "parceiros-iniciais-2",
    nome: "Série 2 - Parceiros Iniciais",
    colecao: "parceiros-iniciais",
    tipo: "Box - Coleção Especial",
    preco: 150,
    estoque: 2,
    imagem: "/parceiros iniciais 2.png",
    descricao:
      "Box da coleção Parceiros Iniciais, perfeito para colecionadores e fãs de Pokémon TCG. Produto lacrado e disponível para envio.",
  },

  {
    id: "parceiros-iniciais-1",
    nome: "Série 1 - Parceiros Iniciais",
    colecao: "parceiros-iniciais",
    tipo: "Box - Coleção Especial",
    preco: 150,
    estoque: 2,
    imagem: "/parceiros iniciais 2.png",
    descricao:
      "Produto lacrado da coleção Parceiros Iniciais.",
  },

  {
    id: "booster-parceiros-iniciais",
    nome: "Booster - Parceiros Iniciais",
    colecao: "parceiros-iniciais",
    tipo: "Booster",
    preco: 15,
    estoque: 10,
    imagem: "/parceiros iniciais 2.png",
    descricao:
      "Booster lacrado da coleção Parceiros Iniciais.",
  },
];