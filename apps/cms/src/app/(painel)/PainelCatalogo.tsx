"use client";

import { useState, useTransition } from "react";

import type {
  AreaOpcao,
  ModuloCatalogoDetalhe,
  ModuloCrmResumo,
  ProgramaCatalogoDetalhe,
  ProgramaCrmResumo,
} from "@/lib/cms/catalogoCrm";

import { carregarModuloCatalogoCrm, carregarProgramaCatalogoCrm } from "./acoesCatalogo";
import { AvisoForm } from "./crm/CamposCrm";
import { DetalheModuloCatalogo } from "./DetalheModuloCatalogo";
import { DetalheProgramaCatalogo } from "./DetalheProgramaCatalogo";
import { TelaModulos } from "./TelaModulos";
import { TelaProgramas } from "./TelaProgramas";

/**
 * Telas Programas e Módulos do módulo Site (o catálogo saiu do CRM em
 * 05/11/2026): lista e detalhe em tela cheia. O `ShellCms` remonta este
 * componente a cada navegação pela sidebar, o que fecha o detalhe aberto.
 */

export type TelaCatalogo = "programas" | "modulos";

interface PainelCatalogoProps {
  /** A tela ativa na sidebar; fechar um detalhe volta à lista dela. */
  tela: TelaCatalogo;
  programas: ProgramaCrmResumo[];
  modulos: ModuloCrmResumo[];
  areas: AreaOpcao[];
  /** `capacidades.editarProgramas` / `editarModulos` — a guarda das actions segue sendo a barreira. */
  podeEditarProgramas: boolean;
  podeEditarModulos: boolean;
}

type DetalheAberto =
  | { tipo: "programa"; programa: ProgramaCatalogoDetalhe | null }
  | { tipo: "modulo"; modulo: ModuloCatalogoDetalhe | null; programaIdInicial?: string };

export function PainelCatalogo({
  tela,
  programas,
  modulos,
  areas,
  podeEditarProgramas,
  podeEditarModulos,
}: PainelCatalogoProps) {
  const [det, setDet] = useState<DetalheAberto | null>(null);
  /** Sobe a cada detalhe recarregado, para o formulário remontar com os dados novos. */
  const [versao, setVersao] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  /** Salvo, mas o site pode demorar a mostrar (revalidação falhou). */
  const [aviso, setAviso] = useState<string | null>(null);
  const [carregando, iniciar] = useTransition();

  function fechar(avisoExclusao?: string) {
    setDet(null);
    setErro(null);
    setAviso(avisoExclusao ?? null);
  }

  function abrirPrograma(id: string, avisoSalvo?: string) {
    iniciar(async () => {
      const d = await carregarProgramaCatalogoCrm(id);
      if (d) {
        setErro(null);
        setAviso(avisoSalvo ?? null);
        setDet({ tipo: "programa", programa: d });
        setVersao((v) => v + 1);
      } else setErro("Não foi possível abrir o programa.");
    });
  }

  function abrirModulo(id: string, avisoSalvo?: string) {
    iniciar(async () => {
      const d = await carregarModuloCatalogoCrm(id);
      if (d) {
        setErro(null);
        setAviso(avisoSalvo ?? null);
        setDet({ tipo: "modulo", modulo: d });
        setVersao((v) => v + 1);
      } else setErro("Não foi possível abrir o módulo.");
    });
  }

  const avisos = (
    <>
      <AvisoForm erro={erro} />
      {aviso && (
        <p className="pcms-form-aviso" role="status">
          {aviso}
        </p>
      )}
      {carregando && (
        <p className="pcms-form-aviso" role="status">
          Carregando…
        </p>
      )}
    </>
  );

  if (det?.tipo === "programa") {
    return (
      <>
        {avisos}
        <DetalheProgramaCatalogo
          key={`${det.programa?.id ?? "novo"}:${versao}`}
          programa={det.programa}
          areas={areas}
          onVoltar={() => fechar()}
          onSalvo={abrirPrograma}
          onExcluido={fechar}
          onAbrirModulo={(id) => abrirModulo(id)}
          onNovoModulo={(programaId) => {
            fechar();
            setDet({ tipo: "modulo", modulo: null, programaIdInicial: programaId });
          }}
          podeEditar={podeEditarProgramas}
        />
      </>
    );
  }

  if (det?.tipo === "modulo") {
    return (
      <>
        {avisos}
        <DetalheModuloCatalogo
          key={`${det.modulo?.id ?? `novo-${det.programaIdInicial ?? ""}`}:${versao}`}
          modulo={det.modulo}
          programaIdInicial={det.programaIdInicial}
          programas={programas}
          onVoltar={() => fechar()}
          onSalvo={abrirModulo}
          onExcluido={fechar}
          podeEditar={podeEditarModulos}
        />
      </>
    );
  }

  return (
    <>
      {avisos}
      {tela === "programas" ? (
        <TelaProgramas
          programas={programas}
          areas={areas}
          onAbrir={(id) => abrirPrograma(id)}
          onNovo={() => setDet({ tipo: "programa", programa: null })}
          podeEditar={podeEditarProgramas}
        />
      ) : (
        <TelaModulos
          modulos={modulos}
          programas={programas}
          onAbrir={(id) => abrirModulo(id)}
          onNovo={() => setDet({ tipo: "modulo", modulo: null })}
          podeEditar={podeEditarModulos}
        />
      )}
    </>
  );
}
