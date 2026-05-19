/**
 * Ícone exibido na tela de login do admin Grupo NTC.
 *
 * Versão maior do monograma (~56px) para a tela `/admin/login` e
 * `/admin/create-first-user`. Usado em `admin.components.graphics.Icon`
 * do payload.config.ts.
 */
export const IconNTC = () => {
  return (
    <img
      src="/logo-ntc.svg"
      alt="Grupo NTC"
      style={{
        height: "3.5rem",
        width: "auto",
        display: "block",
        margin: "0 auto",
      }}
    />
  );
};

export default IconNTC;
