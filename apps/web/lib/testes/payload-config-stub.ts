// Stub de @ntc/cms/payload.config para testes puros. payloadClient.ts
// importa a config real da cms (buildConfig com adapter Postgres/S3) no
// topo do módulo só para repassar a getPayload() — os testes que mockam
// "./payloadClient" diretamente (padrão desta suíte) nunca chegam a
// avaliar essa cadeia, mas um teste futuro que esqueça o mock não deve
// conectar a nada nem exigir env vars: um objeto vazio é suficiente para
// o import resolver.
const configStub = {};
export default configStub;
