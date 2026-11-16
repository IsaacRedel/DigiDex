const explanations = {
  "Pepper Breath": "Agumon lança uma pequena rajada de fogo pela boca.",
  "Blue Blaster": "Gabumon expulsa uma chama azul pela boca.",
  "Mega Flame": "Greymon lança uma chama de alta temperatura pela boca.",
  "Giga Destroyer": "MetalGreymon dispara armamentos do peito contra o alvo.",
  "Terra Force":
    "WarGreymon concentra energia atmosférica em uma esfera que lança contra o adversário.",
  "Gaia Force": "WarGreymon reúne energia em uma grande esfera para atacar.",
  "Great Tornado":
    "WarGreymon gira rapidamente para investir contra o adversário.",
  "Garuru Cannon":
    "Omegamon dispara a partir do braço associado a MetalGarurumon.",
  "Grey Sword": "Omegamon usa a espada do braço associado a WarGreymon.",
  "Rock Breaker": "Guilmon ataca com suas garras.",
  "Fire Ball": "Guilmon dispara uma bola de fogo pela boca.",
  "Diamond Storm": "Renamon lança uma chuva de projéteis cortantes.",
  "Lightning Paw": "Gatomon ataca rapidamente com as garras.",
  "Hand of Fate": "Angemon concentra energia sagrada em um golpe.",
  "Desperado Blaster":
    "Paildramon dispara uma sequência de tiros com seus canhões.",
  "Positron Laser":
    "Imperialdramon dispara energia com o armamento montado no corpo.",
  "Spiking Strike": "Stingmon perfura o alvo com uma lâmina de energia.",
};
const curiosities = {
  gatomon: "Apesar da aparência pequena, Gatomon pertence ao estágio Champion.",
  gallantmon:
    "Gallantmon é classificado como Vírus e, ao mesmo tempo, descrito como um cavaleiro sagrado. Atributo e personalidade não são equivalentes.",
  veemon:
    "O perfil oficial associa Veemon a uma espécie antiga com potencial para evolução Armor.",
  magnamon: "A armadura de Magnamon é associada ao Digiovo dos Milagres.",
  palmon:
    "A flor de Palmon participa de sua obtenção de energia por fotossíntese.",
  gabumon:
    "A pele vestida por Gabumon está relacionada à sua admiração por Garurumon.",
  omegamon:
    "A forma combina características de WarGreymon e MetalGarurumon. O nome Omnimon aparece na localização inglesa da enciclopédia.",
  imperialdramonfm:
    "Fighter Mode é uma mudança de modo de Imperialdramon, não um estágio evolutivo adicional.",
};
export function techniqueExplanation(name) {
  return explanations[name] || "";
}
export function curiosityFor(id) {
  return curiosities[id] || "";
}
