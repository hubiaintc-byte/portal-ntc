export { tokens } from "./tokens";
export type { Tokens, CorSoberana, EscalaTipografica } from "./tokens";

// Layout primitives — doc 12 §3
export { Container } from "./components/layout/Container";
export type { ContainerProps, VarianteContainer } from "./components/layout/Container";

export { Secao } from "./components/layout/Secao";
export type {
  SecaoProps,
  FundoSecao,
  VerticalSecao,
  VertSecao,
} from "./components/layout/Secao";

export { Grade } from "./components/layout/Grade";
export type { GradeProps, ColunasGrade, GapGrade } from "./components/layout/Grade";

// Navegação — doc 12 §4
export { NavegacaoSoberana } from "./components/navegacao/NavegacaoSoberana";
export type { NavegacaoSoberanaProps } from "./components/navegacao/NavegacaoSoberana";

export { MenuMobileDrawer } from "./components/navegacao/MenuMobileDrawer";
export type { MenuMobileDrawerProps } from "./components/navegacao/MenuMobileDrawer";

export { Breadcrumbs } from "./components/navegacao/Breadcrumbs";
export type { BreadcrumbsProps, ItemBreadcrumb } from "./components/navegacao/Breadcrumbs";

export type { ItemMenu, ItemMenuFilho } from "./components/navegacao/tipos";

// Tipos e helpers compartilhados — doc 12 §5/§6
export type { Area, Modalidade, ImagemRef, CtaHero, AcentoArea } from "./components/heroes/tipos";
export {
  acentoPorArea,
  rotuloArea,
  rotuloModalidade,
  formatarData,
  formatarPeriodo,
} from "./components/heroes/tipos";

// Hero family — doc 12 §5
export { HeroInstitucional } from "./components/heroes/HeroInstitucional";
export type { HeroInstitucionalProps } from "./components/heroes/HeroInstitucional";

export { HeroArea } from "./components/heroes/HeroArea";
export type { HeroAreaProps } from "./components/heroes/HeroArea";

export { HeroPrograma } from "./components/heroes/HeroPrograma";
export type { HeroProgramaProps } from "./components/heroes/HeroPrograma";

export { HeroEvento } from "./components/heroes/HeroEvento";
export type { HeroEventoProps } from "./components/heroes/HeroEvento";

export { HeroConteudo } from "./components/heroes/HeroConteudo";
export type { HeroConteudoProps } from "./components/heroes/HeroConteudo";

// Cards editoriais — doc 12 §6
export { CardPrograma } from "./components/cards/CardPrograma";
export type { CardProgramaProps } from "./components/cards/CardPrograma";

export { CardEvento } from "./components/cards/CardEvento";
export type { CardEventoProps } from "./components/cards/CardEvento";

export { CardEspecialista } from "./components/cards/CardEspecialista";
export type { CardEspecialistaProps } from "./components/cards/CardEspecialista";

export { CardConteudo } from "./components/cards/CardConteudo";
export type { CardConteudoProps } from "./components/cards/CardConteudo";

export { CardCliente } from "./components/cards/CardCliente";
export type { CardClienteProps } from "./components/cards/CardCliente";
