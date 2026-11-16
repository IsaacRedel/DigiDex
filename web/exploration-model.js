import { attributeLabels } from "./data.js";
export const collectionLabels = {
  adventure: "Adventure",
  "02": "Adventure 02",
  tamers: "Tamers",
};
export function comparisonRows(pair) {
  return [
    { label: "Estágio", values: pair.map((d) => d.level) },
    {
      label: "Atributo",
      values: pair.map((d) => attributeLabels[d.attribute] || d.attribute),
    },
    { label: "Tipo", values: pair.map((d) => d.type) },
    {
      label: "Coleção",
      values: pair.map((d) => collectionLabels[d.collection]),
    },
    { label: "Perfil", values: pair.map((d) => d.description) },
    { label: "Técnicas", values: pair.map((d) => d.attacks.join(" / ")) },
  ];
}
export const attributeNotes = {
  Vaccine:
    "Vacina identifica uma classificação de dados do Digimon. Não determina seu comportamento nem garante vantagem em todas as obras.",
  Data: "Dados identifica uma classificação do Digimon. As regras de afinidade variam conforme o jogo ou a obra.",
  Virus:
    "Vírus é uma classificação de dados. Ela não significa que o Digimon seja necessariamente maligno.",
  Free: "Livre é uma classificação presente em determinadas fichas. Não deve ser confundida com ausência de estágio evolutivo.",
};
export const levelNotes = {
  Rookie:
    "Forma conhecida como Child na classificação japonesa. É um estágio de desenvolvimento, não uma medida universal de força.",
  Champion: "Equivale ao estágio Adult na classificação japonesa.",
  Ultimate:
    "Equivale a Perfect na classificação japonesa. Não confundir com o termo japonês Ultimate, correspondente a Mega.",
  Mega: "Equivale a Ultimate na classificação japonesa. Diferentes Digimon deste estágio podem ter capacidades muito distintas.",
};
