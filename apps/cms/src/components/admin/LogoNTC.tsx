/**
 * Logo do header do admin Grupo NTC.
 *
 * Renderiza o monograma `logo-dark.svg` (versão escura para fundo claro)
 * com altura controlada. Usado em `admin.components.graphics.Logo` do
 * payload.config.ts.
 *
 * Sem alt repetindo "logo" — a marca já é nomeada pelo aria-label do
 * cabeçalho do admin (CLAUDE.md §10).
 */
export const LogoNTC = () => {
  return (
    <img
      src="/logo-ntc.svg"
      alt="Grupo NTC — Núcleo de Tecnologia e Conhecimento"
      style={{
        height: "2rem",
        width: "auto",
        display: "block",
      }}
    />
  );
};

export default LogoNTC;
