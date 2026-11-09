import React, { useState } from 'react';
import {
  BookMarked,
  Calculator,
  Shield,
  Zap,
  Sparkles,
  Flame,
  Swords,
  Info,
  Scale
} from 'lucide-react';
import type { BaseViewProps } from '../types.ts';
import { calculateMulticlassLevelUpCost } from '@segadores/dnd-core';

export function ContextualRulesView({ character }: BaseViewProps) {
  // Inicialización inteligente basada en las clases del personaje
  const primaryClassEntry = character.multiclass && character.multiclass.length > 0
    ? [...character.multiclass].sort((a, b) => b.level - a.level)[0]
    : null;
  const secondaryClassEntry = character.multiclass && character.multiclass.length > 1
    ? [...character.multiclass].sort((a, b) => b.level - a.level)[1]
    : null;

  const defaultPrimaryLevel = primaryClassEntry ? primaryClassEntry.level : (character.level || 7);
  const defaultSecondaryCurrent = secondaryClassEntry ? secondaryClassEntry.level : 1;

  // Estado para la calculadora de Multiclase 50%
  const [calcPrimaryLevel, setCalcPrimaryLevel] = useState<number>(defaultPrimaryLevel);
  const [calcSecondaryCurrent, setCalcSecondaryCurrent] = useState<number>(defaultSecondaryCurrent);

  const calcSecondaryTarget = calcSecondaryCurrent + 1;
  const calcTotalLevel = calcPrimaryLevel + calcSecondaryCurrent;

  const catchUpResult = calculateMulticlassLevelUpCost(
    calcSecondaryTarget,
    calcPrimaryLevel,
    calcTotalLevel
  );

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="p-4 sm:p-5 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-1 shadow-md">
        <div className="flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-dnd-gold" />
          <h3 className="font-dnd-title font-bold text-base text-dnd-crimson uppercase tracking-wide">
            Compendio de Reglas Contextuales: {character.name}
          </h3>
        </div>
        <p className="text-xs text-dnd-ink-muted font-dnd-body">
          Esta vista filtra y sintetiza únicamente las reglas mecánicas oficiales y caseras que afectan directamente a la ficha de este héroe.
        </p>
      </div>

      {/* 1. Reglas Exclusivas del Personaje Activo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {character.slug === 'eru' && (
          <>
            <div className="p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-2.5 shadow-md">
              <div className="flex items-center gap-2 text-dnd-gold">
                <Sparkles className="w-4 h-4 text-dnd-gold" />
                <h4 className="font-dnd-title font-bold text-xs text-dnd-crimson uppercase tracking-wider">
                  Prótesis Arcana Permanente (FUE 20)
                </h4>
              </div>
              <p className="text-xs text-dnd-ink-muted font-dnd-body leading-relaxed">
                Fruto del adiestramiento conjunto con Honiel Spellbinder, la mano amputada de Eru ha sido sustituida por una prótesis espectral permanente. Funciona como una mano física con <strong className="text-dnd-ink">Fuerza 20 (+5)</strong>, sin requerir concentración ni tener límite de duración. Le permite empuñar sus dos espadas largas rúnicas o embrazar su escudo baluarte.
              </p>
            </div>

            <div className="p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-2.5 shadow-md">
              <div className="flex items-center gap-2 text-dnd-gold">
                <Zap className="w-4 h-4 text-dnd-terracotta" />
                <h4 className="font-dnd-title font-bold text-xs text-dnd-crimson uppercase tracking-wider">
                  Combo Rúnico de Gorthok (Resonancia Sónica)
                </h4>
              </div>
              <p className="text-xs text-dnd-ink-muted font-dnd-body leading-relaxed">
                Cuando <em>Rúthaglar</em> (Estruendo) y <em>Aerasúl</em> (Trueno) impactan al mismo objetivo en el mismo turno, se desata una onda de resonancia de trueno que obliga al enemigo a una tirada de salvación de Constitución CD 15 o sufrir el estado <strong className="text-dnd-crimson">Paralizado</strong> durante 1d4 turnos.
              </p>
            </div>
          </>
        )}

        {character.slug === 'alizar' && (
          <>
            <div className="p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-2.5 shadow-md">
              <div className="flex items-center gap-2 text-dnd-gold">
                <Sparkles className="w-4 h-4 text-dnd-gold" />
                <h4 className="font-dnd-title font-bold text-xs text-dnd-crimson uppercase tracking-wider">
                  Tratamiento Alquímico (+4 INT a Daño y Curación)
                </h4>
              </div>
              <p className="text-xs text-dnd-ink-muted font-dnd-body leading-relaxed">
                Al lanzar cualquier conjuro utilizando sus herramientas de alquimista como foco que cure puntos de golpe o inflija daño de ácido, fuego, necrótico o veneno, suma su modificador de <strong className="text-dnd-ink">Inteligencia (+4)</strong> a una tirada de daño o curación.
              </p>
            </div>

            <div className="p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-2.5 shadow-md">
              <div className="flex items-center gap-2 text-dnd-gold">
                <Shield className="w-4 h-4 text-dnd-gold" />
                <h4 className="font-dnd-title font-bold text-xs text-dnd-crimson uppercase tracking-wider">
                  Aguante Enano y Armadura Pesada
                </h4>
              </div>
              <p className="text-xs text-dnd-ink-muted font-dnd-body leading-relaxed">
                Como enano de la colina, la velocidad de movimiento de Alizar no se reduce en 10 pies al vestir armadura pesada (como su Armadura de placas enana de CA 20). Además, gana +1 PG extra por cada nivel de personaje (+7 PG a nivel 7).
              </p>
            </div>
          </>
        )}

        {character.slug === 'solaria' && (
          <>
            <div className="p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-2.5 shadow-md">
              <div className="flex items-center gap-2 text-dnd-gold">
                <Sparkles className="w-4 h-4 text-[#15803d]" />
                <h4 className="font-dnd-title font-bold text-xs text-dnd-crimson uppercase tracking-wider">
                  Entidad Simbiótica (Círculo de las Esporas)
                </h4>
              </div>
              <p className="text-xs text-dnd-ink-muted font-dnd-body leading-relaxed">
                Al gastar 1 uso de Forma Salvaje como acción, despierta las esporas fúngicas:
                gana <strong className="text-[#15803d]">28 puntos de golpe temporales</strong> (4 × nivel de druida), el daño de Halo de Esporas se duplica a <strong className="text-dnd-crimson">2d6 necrótico</strong>, y sus ataques cuerpo a cuerpo con armas infligen <strong className="text-dnd-crimson">+1d6 de daño necrótico</strong> adicional.
              </p>
            </div>

            <div className="p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-2.5 shadow-md">
              <div className="flex items-center gap-2 text-dnd-gold">
                <Flame className="w-4 h-4 text-dnd-terracotta" />
                <h4 className="font-dnd-title font-bold text-xs text-dnd-crimson uppercase tracking-wider">
                  Infección Fúngica (Reanimación Instantánea)
                </h4>
              </div>
              <p className="text-xs text-dnd-ink-muted font-dnd-body leading-relaxed">
                Cuando una criatura Pequeña o Mediana muere a 10 pies o menos de Solaria, puede utilizar su <strong className="text-dnd-ink">reacción</strong> para reanimarla inmediatamente como un zombi fúngico bajo su control con 1 PG durante 1 hora (hasta 5 veces por descanso largo).
              </p>
            </div>
          </>
        )}

        {character.slug === 'honiel' && (
          <>
            <div className="p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-2.5 shadow-md">
              <div className="flex items-center gap-2 text-dnd-gold">
                <Sparkles className="w-4 h-4 text-dnd-gold" />
                <h4 className="font-dnd-title font-bold text-xs text-dnd-crimson uppercase tracking-wider">
                  Esculpir Conjuros (Evocación Segura)
                </h4>
              </div>
              <p className="text-xs text-dnd-ink-muted font-dnd-body leading-relaxed">
                Al lanzar conjuros de evocación de área (como <em>Manos ardientes</em> o <em>Bola de fuego</em>), puede elegir hasta <strong className="text-dnd-ink">1 + nivel del conjuro</strong> criaturas aliadas para que superen automáticamente su tirada de salvación y no sufran ningún daño si normalmente recibirían la mitad.
              </p>
            </div>

            <div className="p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-2.5 shadow-md">
              <div className="flex items-center gap-2 text-dnd-gold">
                <Zap className="w-4 h-4 text-dnd-terracotta" />
                <h4 className="font-dnd-title font-bold text-xs text-dnd-crimson uppercase tracking-wider">
                  Truco Potenciado y Defensa sin Armadura
                </h4>
              </div>
              <p className="text-xs text-dnd-ink-muted font-dnd-body leading-relaxed">
                Sus trucos dañinos afectan incluso a criaturas que superen la tirada de salvación (reciben la mitad del daño en vez de ninguno). Gracias a su nivel de Monje, sin armadura su CA es 10 + DES + SAB (alcanzando CA 21 con sus protecciones mágicas).
              </p>
            </div>
          </>
        )}

        {character.slug === 'zuma' && (
          <>
            <div className="p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-2.5 shadow-md">
              <div className="flex items-center gap-2 text-dnd-gold">
                <Swords className="w-4 h-4 text-dnd-gold" />
                <h4 className="font-dnd-title font-bold text-xs text-dnd-crimson uppercase tracking-wider">
                  Ataque Furtivo con Fuerza (+4d6)
                </h4>
              </div>
              <p className="text-xs text-dnd-ink-muted font-dnd-body leading-relaxed">
                Según las reglas de D&D 5.5e y SRD, las armas con propiedad <em>Sutil (Finesse)</em> permiten elegir indistintamente Fuerza o Destreza sin perder el <strong className="text-dnd-crimson">Ataque Furtivo</strong>. Con los Guanteletes de Fuerza de Ogro (FUE 19), Zuma puede atacar con su estoque <em>Sa Yue</em> usando <strong className="text-dnd-ink">+4 de Fuerza</strong> y aplicar sus <strong className="text-dnd-crimson">+4d6 de furtivo</strong>.
              </p>
            </div>

            <div className="p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-2.5 shadow-md">
              <div className="flex items-center gap-2 text-dnd-gold">
                <Sparkles className="w-4 h-4 text-dnd-gold" />
                <h4 className="font-dnd-title font-bold text-xs text-dnd-crimson uppercase tracking-wider">
                  Mano de Mago Embaucadora y Afortunado
                </h4>
              </div>
              <p className="text-xs text-dnd-ink-muted font-dnd-body leading-relaxed">
                Su <em>Mano de mago</em> es completamente invisible y puede utilizarse mediante acción adicional de Acción Astuta para abrir cerraduras a 30 pies. Como mediano, si saca un 1 natural en cualquier tirada de ataque, salvación o habilidad, puede repetir el dado.
              </p>
            </div>
          </>
        )}
      </div>

      {/* 2. Reglas de Propiedades de Armas */}
      <div className="p-5 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-3 shadow-md">
        <div className="flex items-center gap-2 border-b border-dnd-border-antique/80 pb-2">
          <Swords className="w-4 h-4 text-dnd-gold" />
          <h4 className="font-dnd-title font-bold text-xs uppercase tracking-wider text-dnd-crimson">
            Glosario de Propiedades de Combate Aplicables
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-sm bg-dnd-parchment-dark border border-dnd-border-antique space-y-1">
            <span className="font-dnd-title font-bold text-dnd-crimson block">Sutil (Finesse)</span>
            <p className="text-dnd-ink-muted font-dnd-body leading-relaxed">
              Permite elegir libremente si sumar Fuerza o Destreza a la tirada de ataque y al daño.
            </p>
          </div>
          <div className="p-3 rounded-sm bg-dnd-parchment-dark border border-dnd-border-antique space-y-1">
            <span className="font-dnd-title font-bold text-dnd-terracotta block">Versátil</span>
            <p className="text-dnd-ink-muted font-dnd-body leading-relaxed">
              Puede empuñarse con 1 mano (daño estándar ej. 1d8) o a 2 manos (daño aumentado ej. 1d10).
            </p>
          </div>
          <div className="p-3 rounded-sm bg-dnd-parchment-dark border border-dnd-border-antique space-y-1">
            <span className="font-dnd-title font-bold text-dnd-gold block">Ligera</span>
            <p className="text-dnd-ink-muted font-dnd-body leading-relaxed">
              Permite realizar un ataque adicional con la mano torpe usando una acción adicional.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Calculadora Interactiva de la Regla de Multiclase al 50% */}
      <div className="p-5 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-dnd-border-antique/80 pb-2">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-dnd-gold" />
            <h4 className="font-dnd-title font-bold text-xs uppercase tracking-wider text-dnd-crimson">
              Calculadora Multiclase: Regla Oficial (RAW) vs. Regla de Campaña (50% Catch-Up)
            </h4>
          </div>
          <span className="text-[10px] font-dnd-title px-2 py-0.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-crimson font-bold">
            D&D 5.5e &bull; SRD 5.2.1
          </span>
        </div>

        <p className="text-xs text-dnd-ink-muted font-dnd-body leading-relaxed">
          En D&D oficial (SRD 5.2.1 pág. 27), la experiencia se unifica por <strong>Nivel Total de Personaje</strong>: subir cualquier clase secundaria cuesta exactamente lo mismo que subir la principal. Para evitar personajes estancados sin romper el balance con costes triviales (como 300 PX), la regla de campaña aplica el <strong>50% sobre el escalón de nivel del personaje</strong>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-dnd-title font-bold text-dnd-crimson block mb-1">
                Nivel Actual de la Clase Primaria:
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={calcPrimaryLevel}
                onChange={e => setCalcPrimaryLevel(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-1.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-xs font-dnd-title font-bold text-dnd-ink focus:outline-none focus:border-dnd-gold"
              />
            </div>

            <div>
              <label className="text-xs font-dnd-title font-bold text-dnd-crimson block mb-1">
                Nivel Actual de la Clase Secundaria:
              </label>
              <input
                type="number"
                min="0"
                max={calcPrimaryLevel}
                value={calcSecondaryCurrent}
                onChange={e => setCalcSecondaryCurrent(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-1.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-xs font-dnd-title font-bold text-dnd-ink focus:outline-none focus:border-dnd-gold"
              />
              <span className="text-[10px] text-dnd-ink-muted font-dnd-body mt-1 block">
                Subirá a: <strong className="text-dnd-gold font-dnd-title">Nivel {calcSecondaryTarget}</strong> en la clase secundaria
              </span>
            </div>

            <div className="p-2.5 rounded-sm bg-dnd-parchment-dark border border-dnd-border-antique text-[11px] text-dnd-ink-muted space-y-0.5 font-dnd-body">
              <div>Nivel Total Actual: <strong className="text-dnd-ink font-dnd-title">{calcTotalLevel}</strong></div>
              <div>Próximo Nivel de Personaje: <strong className="text-dnd-gold font-dnd-title">{catchUpResult.nextCharacterTotalLevel}</strong></div>
            </div>
          </div>

          <div className="p-4 rounded-sm bg-dnd-parchment-dark border border-dnd-border-antique flex flex-col justify-between space-y-3 shadow-inner">
            <div className="space-y-2">
              <span className="text-xs font-dnd-title font-bold text-dnd-crimson uppercase tracking-wide block border-b border-dnd-border-antique pb-1">
                Comparativa de Costes de PX
              </span>

              {/* Coste Oficial RAW */}
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-dnd-ink-muted font-dnd-body">1. Regla Oficial D&D (RAW):</span>
                <span className="font-dnd-title font-bold text-base text-dnd-ink-muted line-through">
                  {catchUpResult.officialRawCost.toLocaleString()} PX
                </span>
              </div>
              <p className="text-[10px] text-dnd-ink-muted font-dnd-body leading-tight">
                (Coste estándar para alcanzar Nivel Total {catchUpResult.nextCharacterTotalLevel}, sin descuentos por clase).
              </p>

              {/* Coste con Regla de Campaña */}
              <div className="pt-2 border-t border-dnd-border-antique">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-dnd-title font-bold text-dnd-crimson">2. Regla de Campaña (50%):</span>
                  <span className="font-dnd-title font-black text-xl text-dnd-gold">
                    {catchUpResult.xpCost.toLocaleString()} PX
                  </span>
                </div>
                {catchUpResult.isCatchUpHalfCost ? (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] font-dnd-title text-[#15803d] font-bold">
                      ¡50% de descuento aplicado!
                    </span>
                    <span className="text-[10px] text-dnd-ink-muted font-dnd-body">
                      (Ahorras {catchUpResult.savings.toLocaleString()} PX)
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] text-dnd-terracotta mt-0.5 block font-dnd-body">
                    Clases igualadas: aplica coste completo del escalón.
                  </span>
                )}
              </div>
            </div>

            <div className="p-2.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-[10px] text-dnd-ink-muted font-dnd-body leading-relaxed">
              <strong className="text-dnd-crimson font-dnd-title">Veredicto de Reglas:</strong> Subir Monje {calcSecondaryTarget} cuesta la mitad ({catchUpResult.xpCost.toLocaleString()} PX) de lo que costaría subir al Nivel {catchUpResult.nextCharacterTotalLevel} del héroe ({catchUpResult.officialRawCost.toLocaleString()} PX), protegiendo la matemática de D&D.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
