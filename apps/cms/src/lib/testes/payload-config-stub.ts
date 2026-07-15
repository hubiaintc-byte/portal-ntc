// Stub de @payload-config para testes puros. payloadClient.ts importa a
// config real (buildConfig com adapter Postgres/S3) no topo do módulo só
// para passar a getPayload() — os testes de painelCrmEscrita.ts exercitam
// apenas as funções puras (gerarCodigoOportunidade/numeroOuNulo) e nunca
// chamam obterPayload(), então um objeto vazio é suficiente para o import
// resolver sem conectar a nada.
const configStub = {};
export default configStub;
