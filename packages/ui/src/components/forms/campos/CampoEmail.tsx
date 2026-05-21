"use client";

import { CampoTexto } from "./CampoTexto";
import type { CampoBaseProps } from "../tipos";

export function CampoEmail(props: CampoBaseProps) {
  return <CampoTexto {...props} type="email" autoComplete="email" />;
}
