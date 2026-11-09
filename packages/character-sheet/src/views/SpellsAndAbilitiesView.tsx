import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Search,
  CheckCircle2,
  TrendingUp,
  Flame,
  Shield,
  HeartHandshake,
  Compass,
  Zap,
  RotateCcw
} from 'lucide-react';
import { DndBadge, TaperedRule } from '@segadores/ui';
import type { BaseViewProps } from '../types.ts';

interface SpellDisplayItem {
  name: string;
  level: number;
  school: string;
  role: 'daño' | 'soporte' | 'control' | 'utilidad';
  components: { v: boolean; s: boolean; m: boolean; c: boolean; r: boolean };
  prepared: boolean;
  description: string;
}

// Catálogo enriquecido de conjuros oficiales de los 5 personajes reales
const SPELL_CATALOG: Record<string, Omit<SpellDisplayItem, 'name' | 'prepared'>> = {
  'Látigo de espinas': {
    level: 0,
    school: 'Transmutación',
    role: 'daño',
    components: { v: true, s: true, m: true, c: false, r: false },
    description: 'Ataque cuerpo a cuerpo de conjuro a 30 pies. Inflige 2d6 perforante y atrae al objetivo hasta 10 pies hacia ti.'
  },
  'Piedad con los moribundos': {
    level: 0,
    school: 'Nigromancia',
    role: 'soporte',
    components: { v: true, s: true, m: false, c: false, r: false },
    description: 'Tocas a una criatura viva a 0 PG para estabilizarla al instante sin tirada de salvación.'
  },
  'Curar heridas': {
    level: 1,
    school: 'Evocación',
    role: 'soporte',
    components: { v: true, s: true, m: false, c: false, r: false },
    description: 'Tocas a una criatura para curarle 1d8 + modificador de aptitud mágica en puntos de golpe.'
  },
  'Rayo nauseabundo': {
    level: 1,
    school: 'Nigromancia',
    role: 'daño',
    components: { v: true, s: true, m: false, c: false, r: false },
    description: 'Rayo a distancia. Inflige 2d8 de daño por veneno y envenena a la criatura si falla TS de Constitución.'
  },
  'Esfera flamígera': {
    level: 2,
    school: 'Conjuración',
    role: 'daño',
    components: { v: true, s: true, m: true, c: true, r: false },
    description: 'Esfera de fuego rodante de 5 pies. Inflige 2d6 de fuego a quien termine a 5 pies o al chocar como acción adicional.'
  },
  'Flecha ácida de Melf': {
    level: 2,
    school: 'Evocación',
    role: 'daño',
    components: { v: true, s: true, m: true, c: false, r: false },
    description: 'Flecha ácida centelleante. 4d4 de ácido al impacto + 2d4 de ácido al final de su próximo turno.'
  },
  'Mano de mago marcial': {
    level: 0,
    school: 'Conjuración',
    role: 'utilidad',
    components: { v: false, s: false, m: false, c: false, r: false },
    description: 'Prótesis espectral permanente de Eru entrenada con Honiel. Funciona con FUE 20 sin límite ni concentración.'
  },
  'Impacto certero': {
    level: 0,
    school: 'Adivinación',
    role: 'soporte',
    components: { v: false, s: true, m: false, c: true, r: false },
    description: 'Obtienes ventaja en tu próxima tirada de ataque contra el objetivo en tu siguiente turno.'
  },
  'Agarre electrizante': {
    level: 0,
    school: 'Evocación',
    role: 'daño',
    components: { v: true, s: true, m: false, c: false, r: false },
    description: 'Toque eléctrico de 2d8 relámpago con ventaja contra enemigos con armadura metálica. Impide reacciones.'
  },
  'Luces danzantes': {
    level: 0,
    school: 'Evocación',
    role: 'utilidad',
    components: { v: true, s: true, m: true, c: true, r: false },
    description: 'Creas hasta cuatro luces flotantes que iluminan un área de 20 pies.'
  },
  'Fuego sagrado': {
    level: 0,
    school: 'Evocación',
    role: 'daño',
    components: { v: true, s: true, m: false, c: false, r: false },
    description: 'Llama radiante que desciende sobre una criatura (TS Destreza o 2d8 radiante sin beneficio de cobertura).'
  },
  'Prestidigitación': {
    level: 0,
    school: 'Transmutación',
    role: 'utilidad',
    components: { v: true, s: true, m: false, c: false, r: false },
    description: 'Truco arcano menor: encender velas, limpiar ropa, perfumar o crear chispas e ilusiones táctiles.'
  },
  'Rociada venenosa': {
    level: 0,
    school: 'Conjuración',
    role: 'daño',
    components: { v: true, s: true, m: false, c: false, r: false },
    description: 'Chorro de gas tóxico a 10 pies. TS de Constitución o sufre 2d12 de daño de veneno.'
  },
  'Falsa vida': {
    level: 1,
    school: 'Nigromancia',
    role: 'soporte',
    components: { v: true, s: true, m: true, c: false, r: false },
    description: 'Te imbuyes de una farsa nigromántica que te otorga 1d4 + 4 puntos de golpe temporales.'
  },
  'Manos ardientes': {
    level: 1,
    school: 'Evocación',
    role: 'daño',
    components: { v: true, s: true, m: false, c: false, r: false },
    description: 'Cono de llamas de 15 pies. Inflige 3d6 de fuego a todas las criaturas (TS Destreza mitad).'
  },
  'Hechizar persona': {
    level: 1,
    school: 'Encantamiento',
    role: 'control',
    components: { v: true, s: true, m: false, c: false, r: false },
    description: 'Intentas hechizar a un humanoide a 30 pies (TS Sabiduría o queda hechizado durante 1 hora).'
  },
  'Sirviente invisible': {
    level: 1,
    school: 'Conjuración',
    role: 'utilidad',
    components: { v: true, s: true, m: true, c: false, r: true },
    description: 'Invoca una fuerza invisible que obedece tus órdenes sencillas durante 1 hora (Ritual).'
  },
  'Disfrazarse': {
    level: 1,
    school: 'Ilusión',
    role: 'utilidad',
    components: { v: true, s: true, m: false, c: false, r: false },
    description: 'Transformas mágicamente tu aspecto físico, ropa y armas durante 1 hora.'
  },
  'Caída de pluma': {
    level: 1,
    school: 'Transmutación',
    role: 'soporte',
    components: { v: false, s: true, m: true, c: false, r: false },
    description: 'Reacción al caer. Ralentiza la caída de hasta 5 criaturas para que no sufran ningún daño de caída.'
  },
  'Hacer añicos': {
    level: 2,
    school: 'Evocación',
    role: 'daño',
    components: { v: true, s: true, m: true, c: false, r: false },
    description: 'Ruido atronador doloroso en esfera de 10 pies. 3d8 de daño de trueno (desventaja a criaturas inorgánicas).'
  },
  'Arma mágica': {
    level: 2,
    school: 'Transmutación',
    role: 'soporte',
    components: { v: true, s: true, m: false, c: true, r: false },
    description: 'Imbuyes un arma no mágica para que gane un bonificador +1 al ataque y daño durante 1 hora.'
  },
  'Ilusión menor': {
    level: 0,
    school: 'Ilusión',
    role: 'utilidad',
    components: { v: false, s: true, m: true, c: false, r: false },
    description: 'Creas un sonido o imagen de un objeto no mayor a un cubo de 5 pies durante 1 minuto.'
  },
  'Saber druídico': {
    level: 0,
    school: 'Transmutación',
    role: 'utilidad',
    components: { v: true, s: true, m: false, c: false, r: false },
    description: 'Predices el clima, haces florecer brotes o enciendes fuegos pequeños con magia de la naturaleza.'
  },
  'Infestación': {
    level: 0,
    school: 'Conjuración',
    role: 'daño',
    components: { v: true, s: true, m: true, c: false, r: false },
    description: 'Enjambre de ácaros y parásitos. 2d6 veneno y mueve al objetivo 5 pies en dirección aleatoria.'
  },
  'Guía': {
    level: 0,
    school: 'Adivinación',
    role: 'soporte',
    components: { v: true, s: true, m: false, c: true, r: false },
    description: 'Tocas a una criatura para que sume 1d4 a una prueba de característica a su elección.'
  },
  'Tocar a los muertos': {
    level: 0,
    school: 'Nigromancia',
    role: 'daño',
    components: { v: true, s: true, m: false, c: false, r: false },
    description: 'Campana fúnebre mágica a 60 pies. TS Sabiduría o 2d8 necrótico (2d12 si la víctima está herida).'
  },
  'Toque helado': {
    level: 0,
    school: 'Nigromancia',
    role: 'daño',
    components: { v: true, s: true, m: false, c: false, r: false },
    description: 'Mano esquelética fantasmal a 120 pies. 2d8 necrótico e impide que el objetivo recupere PG hasta tu próximo turno.'
  },
  'Palabra de curación': {
    level: 1,
    school: 'Evocación',
    role: 'soporte',
    components: { v: true, s: false, m: false, c: false, r: false },
    description: 'Acción adicional a 60 pies. Cura 1d4 + modificador de Sabiduría en puntos de golpe.'
  },
  'Enmarañar': {
    level: 1,
    school: 'Conjuración',
    role: 'control',
    components: { v: true, s: true, m: false, c: true, r: false },
    description: 'Maleza fúngica y enredaderas en cuadrado de 20 pies. Apresa a las criaturas que fallen TS Fuerza.'
  },
  'Cuchillo de hielo': {
    level: 1,
    school: 'Conjuración',
    role: 'daño',
    components: { v: false, s: true, m: true, c: false, r: false },
    description: 'Proyectil de hielo a 60 pies. 1d10 perforante al impacto y explota en 2d6 frío en radio de 5 pies.'
  },
  'Saeta guía': {
    level: 1,
    school: 'Evocación',
    role: 'daño',
    components: { v: true, s: true, m: false, c: false, r: false },
    description: 'Rayo radiante a 120 pies. 4d6 de daño radiante y otorga ventaja en el próximo ataque contra el objetivo.'
  },
  'Crecimiento espinoso': {
    level: 2,
    school: 'Transmutación',
    role: 'control',
    components: { v: true, s: true, m: true, c: true, r: false },
    description: 'Terreno difícil espinoso de 20 pies. Inflige 2d4 de daño perforante por cada 5 pies que una criatura recorra.'
  },
  'Rayo de luna': {
    level: 2,
    school: 'Evocación',
    role: 'daño',
    components: { v: true, s: true, m: true, c: true, r: false },
    description: 'Cilindro plateado de 5 pies de radio. Inflige 2d10 de daño radiante (desventaja para cambiaformas).'
  },
  'Potenciar característica': {
    level: 2,
    school: 'Transmutación',
    role: 'soporte',
    components: { v: true, s: true, m: true, c: true, r: false },
    description: 'Otorga ventaja en pruebas de una característica elegida y beneficios secundarios durante 1 hora.'
  },
  'Ceguera/Sordera': {
    level: 2,
    school: 'Nigromancia',
    role: 'control',
    components: { v: true, s: false, m: false, c: false, r: false },
    description: 'Cegas o ensordeces a un objetivo a 30 pies (TS Constitución al final de cada turno para terminar).'
  },
  'Rayo debilitador': {
    level: 2,
    school: 'Nigromancia',
    role: 'control',
    components: { v: true, s: true, m: false, c: true, r: false },
    description: 'Rayo negruzco que reduce a la mitad el daño de ataques basados en Fuerza del objetivo.'
  },
  'Maremoto': {
    level: 3,
    school: 'Conjuración',
    role: 'control',
    components: { v: true, s: true, m: true, c: false, r: false },
    description: 'Ola colosal de 30x10 pies. Inflige 4d8 contundente y derriba a las criaturas afectadas.'
  },
  'Animar a los muertos': {
    level: 3,
    school: 'Nigromancia',
    role: 'soporte',
    components: { v: true, s: true, m: true, c: false, r: false },
    description: 'Alza un esqueleto o zombi a partir de restos óseos bajo tu mando durante 24 horas.'
  },
  'Forma gaseosa': {
    level: 3,
    school: 'Transmutación',
    role: 'utilidad',
    components: { v: true, s: true, m: true, c: true, r: false },
    description: 'Transforma a una criatura en una nube brumosa con resistencia a daño de armas y velocidad de vuelo.'
  },
  'Marchitar': {
    level: 4,
    school: 'Nigromancia',
    role: 'daño',
    components: { v: true, s: true, m: false, c: false, r: false },
    description: 'Absorbe la humedad vital de una criatura a 30 pies. 8d8 necrótico (daño máximo contra plantas).'
  },
  'Confusión': {
    level: 4,
    school: 'Encantamiento',
    role: 'control',
    components: { v: true, s: true, m: true, c: true, r: false },
    description: 'Esfera de 10 pies. Las criaturas deben tirar 1d10 cada turno para determinar si actúan erráticamente.'
  },
  'Mano de mago': {
    level: 0,
    school: 'Conjuración',
    role: 'utilidad',
    components: { v: true, s: true, m: false, c: false, r: false },
    description: 'Mano espectral invisible para Zuma. Puede forzar cerraduras, robar objetos y guardar provisiones a 30 pies.'
  },
  'Burlar': {
    level: 0,
    school: 'Encantamiento',
    role: 'daño',
    components: { v: true, s: false, m: false, c: false, r: false },
    description: 'Insulto hiriente cargado de magia. 2d4 psíquico y desventaja en la próxima tirada de ataque del objetivo.'
  },
  'Susurros disonantes': {
    level: 1,
    school: 'Encantamiento',
    role: 'daño',
    components: { v: true, s: false, m: false, c: false, r: false },
    description: 'Melodía discordante. 3d6 psíquico y obliga a la criatura a usar su reacción para huir inmediatamente.'
  },
  'Ola atronadora': {
    level: 1,
    school: 'Evocación',
    role: 'daño',
    components: { v: true, s: true, m: false, c: false, r: false },
    description: 'Onda de trueno en cubo de 15 pies. 2d8 trueno y empuja 10 pies lejos a quienes fallen TS Constitución.'
  },
  'Invisibilidad': {
    level: 2,
    school: 'Ilusión',
    role: 'utilidad',
    components: { v: true, s: true, m: true, c: true, r: false },
    description: 'Tocas a una criatura para volverla invisible durante 1 hora (termina si ataca o lanza un conjuro).'
  },
  'Sugestión': {
    level: 2,
    school: 'Encantamiento',
    role: 'control',
    components: { v: true, s: false, m: true, c: true, r: false },
    description: 'Sugieres un curso de acción de apariencia razonable a una criatura que deba obedecer hasta por 8 horas.'
  }
};

export function SpellsAndAbilitiesView({
  character,
  readOnly = false,
  onUpdateSpellSlot,
  onToggleConcentration
}: BaseViewProps) {
  const [subTab, setSubTab] = useState<'learned' | 'progression'>('learned');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [filterComponent, setFilterComponent] = useState<string>('all');

  const knownSpells = character.known_spells || [];
  const preparedSpells = character.prepared_spells || [];

  // Construir lista unificada de conjuros con metadatos
  const spellItems: SpellDisplayItem[] = knownSpells.map(name => {
    const meta = SPELL_CATALOG[name] || {
      level: 1,
      school: 'Arcana',
      role: 'utilidad',
      components: { v: true, s: true, m: false, c: false, r: false },
      description: 'Conjuro de clase de la campaña.'
    };

    return {
      name,
      level: meta.level,
      school: meta.school,
      role: meta.role,
      components: meta.components,
      prepared: preparedSpells.includes(name) || meta.level === 0,
      description: meta.description
    };
  });

  // Filtrado de conjuros
  const filteredSpells = spellItems.filter(sp => {
    if (searchQuery.trim() && !sp.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedLevel !== 'all') {
      const lvlNum = selectedLevel === '0' ? 0 : parseInt(selectedLevel, 10);
      if (sp.level !== lvlNum) return false;
    }
    if (selectedRole !== 'all' && sp.role !== selectedRole) {
      return false;
    }
    if (filterComponent !== 'all') {
      if (filterComponent === 'v' && !sp.components.v) return false;
      if (filterComponent === 's' && !sp.components.s) return false;
      if (filterComponent === 'm' && !sp.components.m) return false;
      if (filterComponent === 'c' && !sp.components.c) return false;
      if (filterComponent === 'r' && !sp.components.r) return false;
    }
    return true;
  });

  // Agrupar por nivel ordenado
  const spellsByLevel = filteredSpells.reduce((acc, sp) => {
    const key = sp.level === 0 ? 'Trucos (Cantrips)' : `Conjuros de Nivel ${sp.level}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(sp);
    return acc;
  }, {} as Record<string, SpellDisplayItem[]>);

  // Helper para renderizar espacios de conjuro por nivel
  const renderSlotTracker = (levelNum: number) => {
    if (levelNum === 0) return null;
    const levelKey = String(levelNum);
    const slotPool = character.spell_slots?.[levelKey];
    if (!slotPool || slotPool.total === 0) return null;

    const total = slotPool.total;
    const used = slotPool.used || 0;
    const available = Math.max(0, total - used);

    return (
      <div className="flex items-center gap-2 bg-[#ede2cb] px-2.5 py-1 rounded-sm border border-[#d4c2a5] shadow-xs">
        <span className="text-[10px] font-dnd-title font-bold text-[#58180D] uppercase tracking-wider">
          Espacios:
        </span>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, idx) => {
            const isSlotAvailable = idx < available;
            return (
              <button
                key={idx}
                type="button"
                disabled={readOnly || !onUpdateSpellSlot}
                onClick={() => {
                  if (readOnly || !onUpdateSpellSlot) return;
                  const newUsed = isSlotAvailable ? used + 1 : Math.max(0, used - 1);
                  onUpdateSpellSlot(levelKey, newUsed);
                }}
                title={
                  isSlotAvailable
                    ? `Espacio ${idx + 1} disponible (clic para consumir)`
                    : `Espacio ${idx + 1} consumido (clic para recuperar)`
                }
                className={`w-3.5 h-3.5 rounded-full border transition flex items-center justify-center text-[9px] font-bold ${
                  isSlotAvailable
                    ? 'bg-[#15803d] border-[#166534] text-white shadow-xs hover:scale-110 cursor-pointer'
                    : 'bg-[#d4c2a5] border-[#a89b88] text-[#58544d] opacity-60 hover:opacity-100 cursor-pointer'
                }`}
              >
                {isSlotAvailable ? '●' : '○'}
              </button>
            );
          })}
        </div>
        <span className="text-[10px] font-dnd-body font-bold text-[#58544d]">
          ({available}/{total})
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Selector de Sub-Pestaña: Grimorio vs Árbol de Progresión */}
      <div className="flex items-center justify-between border-b border-[#d4c2a5]/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSubTab('learned')}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-dnd-title font-bold transition border ${
              subTab === 'learned'
                ? 'bg-[#fdf6ea] border-[#b45309] text-[#58180D] shadow-sm'
                : 'bg-[#ede2cb] border-[#d4c2a5] text-[#58544d] hover:text-[#242528]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#b45309]" />
            Grimorio y Conjuros Adquiridos ({knownSpells.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('progression')}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-dnd-title font-bold transition border ${
              subTab === 'progression'
                ? 'bg-[#fdf6ea] border-[#b45309] text-[#58180D] shadow-sm'
                : 'bg-[#ede2cb] border-[#d4c2a5] text-[#58544d] hover:text-[#242528]'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-[#78350f]" />
            Árbol de Aprendizaje & Progresión
          </button>
        </div>
      </div>

      {subTab === 'learned' ? (
        <div className="space-y-6">
          {/* 2. Barra de Búsqueda y Filtros de Manual */}
          <div className="p-4 rounded-sm bg-[#fdf6ea] text-[#242528] border-2 border-[#d4c2a5] dnd-notched space-y-3 shadow-md">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Búsqueda por Texto */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8a7f72]" />
                <input
                  type="text"
                  placeholder="Buscar en el grimorio (nombre, escuela)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-sm bg-[#ede2cb] border border-[#d4c2a5] text-xs text-[#242528] placeholder-[#8a7f72] font-dnd-body focus:outline-none focus:border-[#b45309]"
                />
              </div>

              {/* Filtro por Nivel de Conjuro */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['all', '0', '1', '2', '3', '4'].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedLevel(lvl)}
                    className={`px-2.5 py-1 rounded-sm text-xs font-dnd-title font-bold border transition ${
                      selectedLevel === lvl
                        ? 'bg-[#58180D] border-[#7a2021] text-[#fdf6ea] shadow-xs'
                        : 'bg-[#ede2cb] border-[#d4c2a5] text-[#58544d] hover:text-[#242528]'
                    }`}
                  >
                    {lvl === 'all' ? 'Todos' : lvl === '0' ? 'Trucos' : `Nv ${lvl}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtros Secundarios: Función y Sellos de Componente */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-[#d4c2a5]/80 text-xs">
              {/* Filtro por Rol / Función */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-[#58544d] font-dnd-title mr-1 uppercase">Rol:</span>
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'daño', label: 'Daño' },
                  { id: 'soporte', label: 'Soporte' },
                  { id: 'control', label: 'Control' },
                  { id: 'utilidad', label: 'Utilidad' }
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id)}
                    className={`px-2 py-0.5 rounded-sm text-[11px] font-dnd-body border capitalize ${
                      selectedRole === r.id
                        ? 'bg-[#78350f] border-[#451a03] text-[#fdf6ea] font-bold'
                        : 'bg-[#ede2cb] border-[#d4c2a5] text-[#58544d] hover:text-[#242528]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Filtro por Componentes Mágicos V, S, M, C, R */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-[#58544d] font-dnd-title mr-1 uppercase">Sellos:</span>
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'v', label: 'V' },
                  { id: 's', label: 'S' },
                  { id: 'm', label: 'M' },
                  { id: 'c', label: 'C (Conc.)' },
                  { id: 'r', label: 'R (Ritual)' }
                ].map(cmp => (
                  <button
                    key={cmp.id}
                    type="button"
                    onClick={() => setFilterComponent(cmp.id)}
                    className={`px-2 py-0.5 rounded-sm text-[11px] font-mono border ${
                      filterComponent === cmp.id
                        ? 'bg-[#b45309] border-[#92400e] text-[#fdf6ea] font-bold'
                        : 'bg-[#ede2cb] border-[#d4c2a5] text-[#58544d] hover:text-[#242528]'
                    }`}
                  >
                    {cmp.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Secciones de Conjuros Agrupados por Nivel */}
          {Object.keys(spellsByLevel).length > 0 ? (
            Object.entries(spellsByLevel).map(([groupTitle, spells]) => {
              const sampleLevel = spells[0]?.level ?? 0;

              return (
                <div key={groupTitle} className="space-y-4">
                  {/* Encabezado Editorial con TaperedRule y Contador de Slots */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#b45309]" />
                        <h4 className="font-dnd-title font-bold text-sm uppercase tracking-wider text-[#58180D]">
                          {groupTitle}
                        </h4>
                        <span className="text-[11px] text-[#58544d] font-dnd-body font-semibold">
                          ({spells.length} {spells.length === 1 ? 'conjuro' : 'conjuros'})
                        </span>
                      </div>

                      {/* Gestor interactivo de espacios del nivel */}
                      {renderSlotTracker(sampleLevel)}
                    </div>
                    <TaperedRule variant="crimson" />
                  </div>

                  {/* Tarjetas de Conjuros en Estilo Manual Oficial */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {spells.map(spell => (
                      <div
                        key={spell.name}
                        className="p-4 rounded-sm bg-[#fdf6ea] text-[#242528] border-2 border-[#d4c2a5] dnd-notched-sm flex flex-col justify-between space-y-3 shadow-sm hover:border-[#b45309] transition"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 border-b border-[#d4c2a5]/80 pb-2">
                            <div>
                              <span className="font-dnd-title font-bold text-sm text-[#58180D] block">
                                {spell.name}
                              </span>
                              <span className="text-[11px] text-[#78350f] font-dnd-body italic block">
                                {spell.school} &bull; <span className="capitalize">{spell.role}</span>
                              </span>
                            </div>

                            {/* Sellos de Componentes V, S, M, C, R */}
                            <div className="flex items-center gap-1">
                              {spell.components.v && (
                                <span
                                  className="px-1.5 py-0.5 rounded-sm bg-[#ede2cb] border border-[#d4c2a5] text-[#58544d] text-[10px] font-mono font-bold"
                                  title="Componente Verbal"
                                >
                                  V
                                </span>
                              )}
                              {spell.components.s && (
                                <span
                                  className="px-1.5 py-0.5 rounded-sm bg-[#ede2cb] border border-[#d4c2a5] text-[#58544d] text-[10px] font-mono font-bold"
                                  title="Componente Somático"
                                >
                                  S
                                </span>
                              )}
                              {spell.components.m && (
                                <span
                                  className="px-1.5 py-0.5 rounded-sm bg-[#ede2cb] border border-[#d4c2a5] text-[#58544d] text-[10px] font-mono font-bold"
                                  title="Componente Material"
                                >
                                  M
                                </span>
                              )}
                              {spell.components.c && (
                                <span
                                  className="w-5 h-5 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#d97706] text-[10px] font-mono font-black flex items-center justify-center shadow-xs"
                                  title="Requiere Concentración (C)"
                                >
                                  C
                                </span>
                              )}
                              {spell.components.r && (
                                <span
                                  className="w-5 h-5 rounded-full bg-[#e0f2fe] text-[#0369a1] border border-[#0284c7] text-[10px] font-mono font-black flex items-center justify-center shadow-xs"
                                  title="Puede lanzarse como Ritual (R)"
                                >
                                  R
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Descripción con tipografía editorial */}
                          <p className="text-xs text-[#242528]/90 mt-2 font-dnd-body leading-relaxed">
                            {spell.description}
                          </p>
                        </div>

                        {/* Pie de Tarjeta */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#d4c2a5]/80 text-[11px]">
                          <span className="text-[#58544d] font-dnd-title uppercase tracking-wider text-[10px]">
                            {spell.level === 0 ? 'Truco a Voluntad' : `Espacio de Nivel ${spell.level}`}
                          </span>
                          {spell.prepared ? (
                            <DndBadge variant="gold" size="sm" icon={<CheckCircle2 className="w-3 h-3 text-[#15803d]" />}>
                              Preparado
                            </DndBadge>
                          ) : (
                            <span className="text-[#58544d] font-dnd-body italic text-xs">Conocido</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 rounded-sm bg-[#fdf6ea] border-2 border-[#d4c2a5] dnd-notched text-center text-xs text-[#58544d] font-dnd-body">
              No se encontraron conjuros en el grimorio que coincidan con los filtros seleccionados.
            </div>
          )}
        </div>
      ) : (
        /* 4. Sub-Pestaña: Árbol de Progresión y Subidas de Nivel */
        <div className="p-6 rounded-sm bg-[#fdf6ea] text-[#242528] border-2 border-[#d4c2a5] dnd-notched space-y-6 shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#b45309]" />
              <h3 className="font-dnd-title font-bold text-base text-[#58180D] uppercase tracking-wide">
                Progresión y Árbol de Aprendizaje Futuro
              </h3>
            </div>
            <p className="text-xs text-[#58544d] font-dnd-body">
              Planificación táctica de mejoras de característica, dotes y rasgos para los siguientes niveles de campaña (Niveles 8, 9 y 10).
            </p>
            <TaperedRule variant="crimson" />
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-sm bg-[#ede2cb] border border-[#d4c2a5] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-dnd-title font-bold text-xs text-[#58180D] uppercase tracking-wider">
                  Nivel 8 (Hito Actual / Próximo)
                </span>
                <DndBadge variant="gold" size="sm">
                  Mejora de Característica o Dote
                </DndBadge>
              </div>
              <p className="text-xs text-[#242528]/90 font-dnd-body leading-relaxed">
                Aumento de Puntuación de Característica (+2 a un atributo o +1 a dos atributos) o elección de una dote general de D&D 5.5e (ej. <em>Combatiente con dos armas</em>, <em>Resiliente</em>, <em>Iniciativa Rápida</em>, <em>Alerta</em>).
              </p>
            </div>

            <div className="p-4 rounded-sm bg-[#ede2cb] border border-[#d4c2a5] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-dnd-title font-bold text-xs text-[#58180D] uppercase tracking-wider">
                  Nivel 9
                </span>
                <DndBadge variant="parchment" size="sm">
                  Bonificador de Competencia +4
                </DndBadge>
              </div>
              <p className="text-xs text-[#242528]/90 font-dnd-body leading-relaxed">
                Tu bonificador por competencia asciende automáticamente a <strong className="text-[#58180D] font-dnd-title">+4</strong>, incrementando todas tus tiradas de salvación competentes, habilidades, CD de conjuros y tiradas de ataque con armas.
              </p>
            </div>

            <div className="p-4 rounded-sm bg-[#ede2cb] border border-[#d4c2a5] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-dnd-title font-bold text-xs text-[#58180D] uppercase tracking-wider">
                  Nivel 10
                </span>
                <DndBadge variant="crimson" size="sm">
                  Rasgos Avanzados de Subclase
                </DndBadge>
              </div>
              <p className="text-xs text-[#242528]/90 font-dnd-body leading-relaxed">
                {character.slug === 'alizar' && 'Artificiero: Tu límite de sintonización mágica aumenta de 3 a 4 objetos mágicos simultáneos.'}
                {character.slug === 'eru' && 'Guerrero: Rasgo marcial adicional de arquetipo e inmunidad a condiciones adicionales.'}
                {character.slug === 'honiel' && 'Mago: Magia potenciada de la Escuela de Evocación (suma modificador de Inteligencia al daño de conjuros).'}
                {character.slug === 'solaria' && 'Druida: Esporas expansivas (puedes lanzar tu Halo de Esporas a un punto a distancia como acción adicional).'}
                {character.slug === 'zuma' && 'Pícaro: Mejora de característica adicional (ASI) o dote adicional de pícaro.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
