/**
 * Ambient reference para que o TypeScript reconheça o módulo `payload`
 * antes da declaração de augmentação no final do `payload-types.ts`
 * gerado automaticamente (`declare module 'payload'`).
 *
 * Sem essa importação explícita, o tsc do package `@ntc/types` falha
 * com `TS2664: Invalid module name in augmentation, module 'payload'
 * cannot be found` — o módulo está instalado mas não é "conhecido"
 * pelo TS no escopo onde a augmentação aparece.
 */
import "payload";
