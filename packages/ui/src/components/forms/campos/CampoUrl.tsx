"use client";

import { CampoTexto } from "./CampoTexto";
import type { CampoBaseProps } from "../tipos";

export function CampoUrl(props: CampoBaseProps) {
  return <CampoTexto {...props} type="url" autoComplete="url" />;
}
