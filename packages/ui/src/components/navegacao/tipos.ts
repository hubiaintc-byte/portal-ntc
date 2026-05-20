export interface ItemMenuFilho {
  rotulo: string;
  href: string;
  descricao?: string;
}

export interface ItemMenu {
  rotulo: string;
  href?: string;
  filhos?: ItemMenuFilho[];
}
