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
