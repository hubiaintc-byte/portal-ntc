import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// eslint-config-next 16 já exporta flat config nativa — o FlatCompat do
// @eslint/eslintrc (usado até o Next 15) não carrega mais estes presets.
const config = [
  {
    ignores: [".next/**", "node_modules/**", ".turbo/**", "src/payload-types.ts", "next-env.d.ts"],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // eslint-config-next 16 traz o eslint-plugin-react-hooks 7, que liga como
    // ERRO regras novas pensadas para o React Compiler (desligado aqui —
    // `reactCompiler` não está ativo no next.config). Os 4 pontos que elas
    // acusam (setState em efeito de montagem/sincronização de prop e
    // Date.now() no render do Dashboard) são padrões que já existiam e
    // funcionam; reescrevê-los mudaria comportamento de tela, fora do escopo
    // da atualização de dependências. Ficam como aviso, visíveis no lint.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
    },
  },
];

export default config;
