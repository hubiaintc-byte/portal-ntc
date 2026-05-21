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

export { HeroSliderPremium } from "./components/heroes/HeroSliderPremium";
export type {
  HeroSliderPremiumProps,
  SlidePremium,
  TipoSlide,
  VarianteCtaSlide,
  CtaSlide,
  EventoPillSlide,
} from "./components/heroes/HeroSliderPremium";

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

export { CardArea } from "./components/cards/CardArea";
export type { CardAreaProps } from "./components/cards/CardArea";

// Blocos editoriais — doc 12 §7
export type { FundoBloco, ClassesFundo } from "./components/blocos/tipos";
export { fundoPorTipo } from "./components/blocos/tipos";

export { BlocoNumeros } from "./components/blocos/BlocoNumeros";
export type { BlocoNumerosProps } from "./components/blocos/BlocoNumeros";

export { BlocoCitacao } from "./components/blocos/BlocoCitacao";
export type { BlocoCitacaoProps } from "./components/blocos/BlocoCitacao";

export { BlocoTexto } from "./components/blocos/BlocoTexto";
export type { BlocoTextoProps } from "./components/blocos/BlocoTexto";

export { BlocoCtaInstitucional } from "./components/blocos/BlocoCtaInstitucional";
export type { BlocoCtaInstitucionalProps, VarianteCta } from "./components/blocos/BlocoCtaInstitucional";

export { BlocoImagemLegenda } from "./components/blocos/BlocoImagemLegenda";
export type { BlocoImagemLegendaProps } from "./components/blocos/BlocoImagemLegenda";

export { BlocoFaq } from "./components/blocos/BlocoFaq";
export type { BlocoFaqProps } from "./components/blocos/BlocoFaq";

export { FaqAcordeao } from "./components/blocos/FaqAcordeao";
export type { FaqAcordeaoProps, FaqItem } from "./components/blocos/FaqAcordeao";

export { BlocoProgramacao } from "./components/blocos/BlocoProgramacao";
export type { BlocoProgramacaoProps, ItemProgramacao } from "./components/blocos/BlocoProgramacao";

// Listings — doc 12 §8
export type {
  ProgramaItem,
  EventoItem,
  EspecialistaItem,
  ModuloItem,
  FiltroEstado,
} from "./components/listings/tipos";
export { FILTRO_INICIAL } from "./components/listings/tipos";

export { GradeProgramas } from "./components/listings/GradeProgramas";
export type { GradeProgramasProps } from "./components/listings/GradeProgramas";

export { GradeEventos } from "./components/listings/GradeEventos";
export type { GradeEventosProps } from "./components/listings/GradeEventos";

export { GradeEspecialistas } from "./components/listings/GradeEspecialistas";
export type { GradeEspecialistasProps } from "./components/listings/GradeEspecialistas";

export { ListaModulos } from "./components/listings/ListaModulos";
export type { ListaModulosProps } from "./components/listings/ListaModulos";

export { FiltrosAgenda } from "./components/listings/FiltrosAgenda";
export type { FiltrosAgendaProps } from "./components/listings/FiltrosAgenda";

export { GradeClientes } from "./components/listings/GradeClientes";
export type { GradeClientesProps, ClienteItem } from "./components/listings/GradeClientes";

// Utilitários — doc 12 §10
export { Eyebrow } from "./components/utilitarios/Eyebrow";
export type { EyebrowProps } from "./components/utilitarios/Eyebrow";

export { TituloSecao } from "./components/utilitarios/TituloSecao";
export type { TituloSecaoProps } from "./components/utilitarios/TituloSecao";

export { LinkEditorial } from "./components/utilitarios/LinkEditorial";
export type { LinkEditorialProps } from "./components/utilitarios/LinkEditorial";

export { Selo } from "./components/utilitarios/Selo";
export type { SeloProps, VarianteSelo } from "./components/utilitarios/Selo";

// Helpers sistêmicos — doc 12 §12
export { ImagemSoberana } from "./components/helpers/ImagemSoberana";
export type { ImagemSoberanaProps, ProporcaoImagem } from "./components/helpers/ImagemSoberana";

export { JsonLd } from "./components/helpers/JsonLd";
export type { JsonLdProps } from "./components/helpers/JsonLd";

export { Revelar } from "./components/helpers/Revelar";
export type { RevelarProps } from "./components/helpers/Revelar";

export { RenderizadorLexical } from "./components/helpers/richtext/RenderizadorLexical";
export type { RenderizadorLexicalProps } from "./components/helpers/richtext/RenderizadorLexical";
export type { RichTextContent, LexicalNode } from "./components/helpers/richtext/tipos";

// Forms — doc 12 §9
export { FormularioSoberano } from "./components/forms/FormularioSoberano";
export { BotaoSoberano } from "./components/forms/BotaoSoberano";
export type { BotaoSoberanoProps } from "./components/forms/BotaoSoberano";
export { FormularioContexto, useFormulario } from "./components/forms/contexto";
export type {
  CampoBaseProps,
  FormularioContextValue,
  FormularioResposta,
  FormularioSucesso,
  FormularioErroValidacao,
  EstadoSucessoProps,
} from "./components/forms/tipos";

export { CampoTexto } from "./components/forms/campos/CampoTexto";
export { CampoEmail } from "./components/forms/campos/CampoEmail";
export { CampoUrl } from "./components/forms/campos/CampoUrl";
export { CampoTelefone } from "./components/forms/campos/CampoTelefone";
export { CampoSelect } from "./components/forms/campos/CampoSelect";
export { CampoSelectMulti } from "./components/forms/campos/CampoSelectMulti";
export { CampoTextarea } from "./components/forms/campos/CampoTextarea";
export { CampoNumber } from "./components/forms/campos/CampoNumber";
export { CampoUpload } from "./components/forms/campos/CampoUpload";
export { CampoCheckbox } from "./components/forms/campos/CampoCheckbox";

// Rodapé institucional — doc 12 §11.1
export { RodapeSoberano } from "./components/layout/RodapeSoberano";

// Banner LGPD e diálogo de política — doc 12 §9 e §12.3
export { BannerCookies } from "./components/helpers/BannerCookies";
export { DialogoPolitica } from "./components/helpers/DialogoPolitica";
