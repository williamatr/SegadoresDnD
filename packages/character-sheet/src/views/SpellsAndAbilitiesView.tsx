import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  TrendingUp,
  Layers,
  Flame,
  Shield,
  HeartHandshake,
  Compass
} from 'lucide-react';
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
  readOnly = false
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

  // Agrupar por nivel
  const spellsByLevel = filteredSpells.reduce((acc, sp) => {
    const key = sp.level === 0 ? 'Trucos (Cantrips)' : `Nivel ${sp.level}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(sp);
    return acc;
  }, {} as Record<string, SpellDisplayItem[]>);

  return (
    <div className="space-y-6">
      {/* Selector de Sub-Pestaña: Aprendidas vs Progresión */}
      <div className="flex items-center justify-between border-b border-dnd-border/60 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('learned')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-fantasy font-bold transition border ${
              subTab === 'learned'
                ? 'bg-dnd-surface border-dnd-gold text-dnd-gold shadow-sm'
                : 'bg-dnd-card border-dnd-border text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-dnd-gold" />
            Conjuros y Rasgos Adquiridos ({knownSpells.length})
          </button>
          <button
            onClick={() => setSubTab('progression')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-fantasy font-bold transition border ${
              subTab === 'progression'
                ? 'bg-dnd-surface border-dnd-gold text-dnd-gold shadow-sm'
                : 'bg-dnd-card border-dnd-border text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-purple-400" />
            Árbol de Aprendizaje & Subidas de Nivel
          </button>
        </div>
      </div>

      {subTab === 'learned' ? (
        <div className="space-y-5">
          {/* Barra de Búsqueda y Filtros */}
          <div className="p-4 rounded-2xl bg-dnd-card border border-dnd-border space-y-3 shadow-md">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Búsqueda por Texto */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar conjuro o rasgo..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-dnd-gold"
                />
              </div>

              {/* Filtro por Nivel */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['all', '0', '1', '2', '3', '4'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevel(lvl)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border transition ${
                      selectedLevel === lvl
                        ? 'bg-dnd-gold/20 border-dnd-gold text-dnd-gold-light'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lvl === 'all' ? 'Todos' : lvl === '0' ? 'Trucos' : `Nv ${lvl}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtros Secundarios: Función y Componentes */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-dnd-border/60 text-xs">
              {/* Filtro por Rol / Función */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-500 mr-1">Función:</span>
                {[
                  { id: 'all', label: 'Cualquiera' },
                  { id: 'daño', label: 'Daño' },
                  { id: 'soporte', label: 'Soporte' },
                  { id: 'control', label: 'Control' },
                  { id: 'utilidad', label: 'Utilidad' }
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    className={`px-2 py-0.5 rounded text-[11px] border capitalize ${
                      selectedRole === r.id
                        ? 'bg-purple-950 border-purple-600 text-purple-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Filtro por Componentes Mágicos V, S, M, C, R */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-500 mr-1">Comp:</span>
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
                    onClick={() => setFilterComponent(cmp.id)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
                      filterComponent === cmp.id
                        ? 'bg-amber-950 border-amber-600 text-amber-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cmp.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grilla de Conjuros Agrupados */}
          {Object.keys(spellsByLevel).length > 0 ? (
            Object.entries(spellsByLevel).map(([groupTitle, spells]) => (
              <div key={groupTitle} className="space-y-3">
                <div className="flex items-center gap-2 border-b border-dnd-border/60 pb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-dnd-gold" />
                  <h4 className="font-fantasy font-bold text-xs uppercase tracking-wider text-slate-200">
                    {groupTitle}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">({spells.length})</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {spells.map(spell => (
                    <div
                      key={spell.name}
                      className="p-3.5 rounded-2xl bg-dnd-card border border-dnd-border flex flex-col justify-between space-y-2.5 hover:border-dnd-gold/60 transition"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-fantasy font-bold text-sm text-slate-100 block">
                              {spell.name}
                            </span>
                            <span className="text-[11px] text-purple-300 block">
                              {spell.school} &bull; <span className="capitalize">{spell.role}</span>
                            </span>
                          </div>

                          {/* Componentes V, S, M, C, R */}
                          <div className="flex items-center gap-1 font-mono text-[10px]">
                            {spell.components.v && (
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300" title="Verbal">V</span>
                            )}
                            {spell.components.s && (
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300" title="Somático">S</span>
                            )}
                            {spell.components.m && (
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300" title="Material">M</span>
                            )}
                            {spell.components.c && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-950 border border-amber-700 text-amber-300 font-bold" title="Concentración">C</span>
                            )}
                            {spell.components.r && (
                              <span className="px-1.5 py-0.2 rounded bg-blue-950 border border-blue-700 text-blue-300 font-bold" title="Ritual">R</span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                          {spell.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-dnd-border/60 text-[11px]">
                        <span className="text-slate-500 font-mono">
                          {spell.level === 0 ? 'Truco a voluntad' : `Espacio de Nivel ${spell.level}`}
                        </span>
                        {spell.prepared ? (
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Preparado
                          </span>
                        ) : (
                          <span className="text-slate-500">Conocido</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 rounded-2xl bg-dnd-card border border-dnd-border text-center text-xs text-slate-500">
              No se encontraron conjuros que coincidan con los filtros seleccionados.
            </div>
          )}
        </div>
      ) : (
        /* Sub-Pestaña: Árbol de Aprendizaje / Subida de Nivel */
        <div className="p-6 rounded-2xl bg-dnd-card border border-dnd-border space-y-6 shadow-md">
          <div className="border-b border-dnd-border/60 pb-3">
            <h3 className="font-fantasy font-bold text-base text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-dnd-gold" />
              Progresión y Árbol de Aprendizaje Futuro
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Planificación táctica de mejoras de característica, dotes y rasgos para los niveles siguientes (Nivel 8, 9 y 10).
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-dnd-surface border border-dnd-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-fantasy font-bold text-sm text-dnd-gold-light">
                  Nivel 8 (Hito Actual / Próximo)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                  Mejora de Característica o Dote
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Aumento de Puntuación de Característica (+2 a un atributo o +1 a dos atributos) o elección de una dote general de D&D 5.5e (ej. <em>Combatiente con dos armas</em>, <em>Resiliente</em>, <em>Iniciativa Rápida</em>, <em>Alerta</em>).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-dnd-surface border border-dnd-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-fantasy font-bold text-sm text-purple-300">
                  Nivel 9
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                  Bonificador de Competencia +4
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tu bonificador por competencia asciende automáticamente a <strong className="text-dnd-gold">+4</strong>, incrementando todas tus tiradas de salvación competentes, habilidades, CD de conjuros y ataques con armas.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-dnd-surface border border-dnd-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-fantasy font-bold text-sm text-emerald-300">
                  Nivel 10
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                  Rasgos Avanzados de Subclase
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
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
