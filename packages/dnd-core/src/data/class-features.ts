export interface ClassFeatureItem {
  id: string;
  name: string;
  level: number;
  className: string;
  subclass?: string;
  prerequisites?: string;
  gearRestrictions?: string;
  resourceCost?: string;
  description: string;
}

export const CANONICAL_CLASS_FEATURES: Record<string, ClassFeatureItem[]> = {
  // ==========================================
  // MAGO (WIZARD) - Escuela de Evocación
  // ==========================================
  mago: [
    {
      id: 'wiz-spellcasting',
      name: 'Lanzamiento de Conjuros & Grimorio',
      level: 1,
      className: 'Mago',
      prerequisites: 'Inteligencia 13 para multiclase',
      gearRestrictions: 'No puedes lanzar conjuros vistiendo armaduras con las que no seas competente',
      resourceCost: 'Espacios de conjuro',
      description: 'Como estudiante de la magia arcana, posees un libro de conjuros (Grimorio) con tus secretos. Puedes preparar cada día un número de conjuros igual a tu Nivel de Mago + Modificador de Inteligencia. Puedes lanzar conjuros de ritual directamente desde tu grimorio sin prepararlos sumando 10 minutos.'
    },
    {
      id: 'wiz-arcane-recovery',
      name: 'Recuperación Arcana',
      level: 1,
      className: 'Mago',
      resourceCost: '1 vez al día tras Descanso Corto',
      description: 'Una vez por día al finalizar un descanso corto, puedes recuperar espacios de conjuros gastados con un nivel combinado de hasta la mitad de tu nivel de Mago (redondeado hacia arriba, máx. nivel 5).'
    },
    {
      id: 'wiz-evocation-savant',
      name: 'Experto en Evocación',
      level: 2,
      className: 'Mago',
      subclass: 'Evocación',
      description: 'El oro y tiempo requeridos para transcribir conjuros de la escuela de Evocación a tu grimorio se reducen a la mitad (1 hora y 25 po por nivel de conjuro).'
    },
    {
      id: 'wiz-sculpt-spells',
      name: 'Esculpir Conjuros',
      level: 2,
      className: 'Mago',
      subclass: 'Evocación',
      description: 'Al lanzar un conjuro de Evocación que afecte a un área (como Bola de Fuego o Relámpago), puedes elegir un número de criaturas aliadas igual a 1 + nivel del conjuro. Esos aliados superan automáticamente la tirada de salvación y sufren 0 puntos de daño.'
    },
    {
      id: 'wiz-potent-cantrip',
      name: 'Truco Potenciado',
      level: 6,
      className: 'Mago',
      subclass: 'Evocación',
      description: 'Tus trucos dañinos afectan incluso a criaturas que superan la tirada de salvación: reciben la mitad del daño en vez de ninguno (ej. Rociada Venenosa).'
    },
    {
      id: 'wiz-empowered-evocation',
      name: 'Evocación Potenciada',
      level: 10,
      className: 'Mago',
      subclass: 'Evocación',
      description: 'Sumas tu modificador de Inteligencia a una tirada de daño de cualquier conjuro de mago de evocación que lances.'
    },
    {
      id: 'wiz-overchannel',
      name: 'Sobrecargar (Overchannel)',
      level: 14,
      className: 'Mago',
      subclass: 'Evocación',
      resourceCost: 'Daño necrótico propio acumulativo al repetir sin descanso largo',
      description: 'Al lanzar un conjuro de mago de nivel 1 a 5 que inflija daño, puedes maximizar el daño de los dados del conjuro en lugar de tirarlos. El primer uso no tiene coste; usos posteriores antes de un descanso largo te infligen 2d12 de daño necrótico por nivel del conjuro.'
    },
    {
      id: 'wiz-spell-mastery',
      name: 'Maestría de Conjuros',
      level: 18,
      className: 'Mago',
      description: 'Eliges un conjuro de nivel 1 y uno de nivel 2 de tu grimorio; puedes lanzarlos a su nivel más bajo sin gastar ranuras de conjuro mientras los lleves preparados.'
    },
    {
      id: 'wiz-signature-spells',
      name: 'Conjuros Personales',
      level: 20,
      className: 'Mago',
      resourceCost: '1 lanzamiento gratuito por descanso corto para cada uno',
      description: 'Eliges dos conjuros de nivel 3 de tu libro de conjuros como tus conjuros insignia. Siempre los tienes preparados sin contar contra tu límite y puedes lanzar cada uno una vez a nivel 3 sin gastar espacio entre descansos cortos.'
    }
  ],

  // ==========================================
  // MONJE (MONK)
  // ==========================================
  monje: [
    {
      id: 'mnk-unarmored-defense',
      name: 'Defensa sin Armadura',
      level: 1,
      className: 'Monje',
      prerequisites: 'Destreza 13 y Sabiduría 13 para multiclase',
      gearRestrictions: 'Sin armadura ni escudo',
      description: 'Mientras no vistas ninguna armadura ni empuñes un escudo, tu Clase de Armadura es igual a 10 + Modificador de Destreza + Modificador de Sabiduría.'
    },
    {
      id: 'mnk-martial-arts',
      name: 'Artes Marciales',
      level: 1,
      className: 'Monje',
      gearRestrictions: 'Sin armadura ni escudo, usando armas de monje o desarmado',
      description: 'Puedes usar Destreza en lugar de Fuerza para ataques y daño de golpes desarmados y armas de monje. Puedes tirar 1d6 (escalando a 1d8 en Nv.5, 1d10 en Nv.11 y 1d12 en Nv.17) para el daño. Al atacar en tu turno con golpe desarmado o arma de monje, puedes realizar un golpe desarmado como Acción Adicional gratis.'
    },
    {
      id: 'mnk-ki',
      name: 'Puntos de Concentración (Ki / Enfoque)',
      level: 2,
      className: 'Monje',
      resourceCost: 'Reserva de Ki (recupera en Descanso Corto)',
      description: 'Canalizas tu energía mística interior (CD = 8 + PB + SAB): Ráfaga de Golpes (1 Ki: 2 ataques desarmados como acción adicional), Defensa Paciente (Destrabarse gratis, o 1 Ki para Destrabarse + Esquivar simultáneamente), Paso del Viento (Correr gratis, o 1 Ki para Destrabarse + Correr duplicando el salto).'
    },
    {
      id: 'mnk-unarmored-movement',
      name: 'Movimiento sin Armadura',
      level: 2,
      className: 'Monje',
      gearRestrictions: 'Sin armadura ni escudo',
      description: 'Tu velocidad de movimiento aumenta en +10 pies mientras no vistas armadura ni lleves escudo (escalando hasta +30 pies a nivel 18).'
    },
    {
      id: 'mnk-uncanny-metabolism',
      name: 'Metabolismo Prodigioso (PHB 2024)',
      level: 2,
      className: 'Monje',
      resourceCost: '1 vez por Descanso Largo al tirar Iniciativa',
      description: 'Al tirar Iniciativa en combate, recuperas instantáneamente todos tus Puntos de Ki gastados y sanas 1d6 + tu nivel de Monje en puntos de golpe.'
    },
    {
      id: 'mnk-deflect-attacks',
      name: 'Desviar Proyectiles / Ataques',
      level: 3,
      className: 'Monje',
      resourceCost: '1 reacción (y opcional 1 Ki para devolver proyectil)',
      description: 'Puedes usar tu reacción para reducir el daño de un ataque a distancia o cuerpo a cuerpo en 1d10 + Mod. Destreza + Nivel de Monje. Si reduces el daño a 0, puedes atrapar el proyectil y relanzarlo gastando 1 Ki.'
    },
    {
      id: 'mnk-slow-fall',
      name: 'Caída Lenta',
      level: 4,
      className: 'Monje',
      resourceCost: '1 reacción',
      description: 'Puedes usar tu reacción al caer para reducir el daño de caída en una cantidad igual a 5 veces tu nivel de Monje.'
    },
    {
      id: 'mnk-extra-attack',
      name: 'Ataque Extra',
      level: 5,
      className: 'Monje',
      description: 'Puedes atacar dos veces en lugar de una siempre que realices la acción de Atacar en tu turno.'
    },
    {
      id: 'mnk-stunning-strike',
      name: 'Golpe Aturdidor',
      level: 5,
      className: 'Monje',
      resourceCost: '1 Punto de Ki por impacto',
      description: 'Al impactar a otra criatura con un ataque de arma cuerpo a cuerpo o desarmado, puedes gastar 1 Ki para obligarla a superar una salvación de Constitución o quedar Aturdida hasta el final de tu siguiente turno.'
    },
    {
      id: 'mnk-ki-empowered',
      name: 'Golpes Potenciados con Ki',
      level: 6,
      className: 'Monje',
      description: 'Tus ataques desarmados cuentan como mágicos a efectos de superar la resistencia e inmunidad a los ataques no mágicos.'
    },
    {
      id: 'mnk-evasion',
      name: 'Evasión',
      level: 7,
      className: 'Monje',
      description: 'Cuando eres sometido a un efecto que te permite hacer una salvación de Destreza para sufrir solo la mitad del daño, no sufres ningún daño si tienes éxito, y solo la mitad si fallas.'
    },
    {
      id: 'mnk-diamond-soul',
      name: 'Alma Diamantina',
      level: 14,
      className: 'Monje',
      resourceCost: 'Opcional 1 Ki para repetir salvación',
      description: 'Ganas competencia en todas las tiradas de salvación. Además, si fallas una tirada de salvación, puedes gastar 1 Ki para volver a tirarla y quedarte con el segundo resultado.'
    },
    {
      id: 'mnk-empty-body',
      name: 'Cuerpo Vacío',
      level: 18,
      className: 'Monje',
      resourceCost: '4 Puntos de Ki',
      description: 'Ganas invisibilidad y resistencia a todo daño excepto daño de fuerza durante 1 minuto.'
    }
  ],

  // ==========================================
  // GUERRERO (FIGHTER) - Guerrero Arcano
  // ==========================================
  guerrero: [
    {
      id: 'ftr-fighting-style',
      name: 'Estilo de Combate',
      level: 1,
      className: 'Guerrero',
      prerequisites: 'Fuerza 13 o Destreza 13 para multiclase',
      description: 'Adoptas un estilo marcial especializado (Combate con dos armas: suma tu modificador de característica al daño del segundo ataque; Defensa: +1 a la CA con armadura; Duelo: +2 al daño a una mano).'
    },
    {
      id: 'ftr-second-wind',
      name: 'Nuevas Energías (Second Wind)',
      level: 1,
      className: 'Guerrero',
      resourceCost: '1 Acción Adicional (recupera en Descanso Corto)',
      description: 'Posees una reserva de resistencia para escapar del peligro. Como acción adicional, recuperas puntos de golpe iguales a 1d10 + tu nivel de Guerrero.'
    },
    {
      id: 'ftr-action-surge',
      name: 'Acción Súbita (Action Surge)',
      level: 2,
      className: 'Guerrero',
      resourceCost: '1 uso por Descanso Corto',
      description: 'Puedes sobrepasar tus límites por un instante. En tu turno, puedes realizar una Acción Adicional completa además de tu acción regular.'
    },
    {
      id: 'ftr-weapon-bond',
      name: 'Vínculo con el Arma',
      level: 3,
      className: 'Guerrero',
      subclass: 'Guerrero Arcano',
      description: 'Realizas un ritual de 1 hora para vincularte con hasta dos armas. No puedes ser desarmado de ellas y puedes invocarlas instantáneamente a tu mano como acción adicional.'
    },
    {
      id: 'ftr-eldritch-magic',
      name: 'Lanzamiento de Conjuros Arcanos',
      level: 3,
      className: 'Guerrero',
      subclass: 'Guerrero Arcano',
      description: 'Aprendes trucos y conjuros de la lista de Mago (prioritariamente Abjuración y Evocación). Tu aptitud mágica es Inteligencia.'
    },
    {
      id: 'ftr-extra-attack',
      name: 'Ataque Extra (x2 y x3)',
      level: 5,
      className: 'Guerrero',
      description: 'Puedes atacar dos veces al realizar la acción de Atacar (tres veces a nivel 11 y cuatro a nivel 20).'
    },
    {
      id: 'ftr-war-magic',
      name: 'Magia de Guerra',
      level: 7,
      className: 'Guerrero',
      subclass: 'Guerrero Arcano',
      description: 'Cuando usas tu acción para lanzar un truco, puedes realizar un ataque de arma como Acción Adicional.'
    },
    {
      id: 'ftr-indomitable',
      name: 'Indomable',
      level: 9,
      className: 'Guerrero',
      resourceCost: '1 uso por Descanso Largo (escala a 2 y 3 usos)',
      description: 'Puedes repetir una tirada de salvación que hayas fallado. En 5.5e, sumas tu nivel de Guerrero al segundo intento.'
    }
  ],

  // ==========================================
  // PALADÍN (PALADIN)
  // ==========================================
  paladin: [
    {
      id: 'pal-lay-on-hands',
      name: 'Imposición de Manos',
      level: 1,
      className: 'Paladín',
      prerequisites: 'Fuerza 13 y Carisma 13 para multiclase',
      resourceCost: 'Reserva de PG = 5 x Nivel de Paladín (recupera en Descanso Largo)',
      description: 'Tu toque bendito puede sanar heridas. Posees una reserva de puntos de golpe curativos. Puedes gastar 5 puntos de tu reserva para curar una enfermedad o neutralizar un veneno.'
    },
    {
      id: 'pal-divine-sense',
      name: 'Sentido Divino',
      level: 1,
      className: 'Paladín',
      resourceCost: '1 + Mod. Carisma usos por Descanso Largo',
      description: 'Abres tu conciencia celestial para detectar celestiales, infernales, muertos vivientes o lugares consagrados a 60 pies.'
    },
    {
      id: 'pal-divine-smite',
      name: 'Castigo Divino (Divine Smite)',
      level: 2,
      className: 'Paladín',
      resourceCost: 'Espacios de conjuro',
      description: 'Al impactar a una criatura con un ataque de arma cuerpo a cuerpo, puedes gastar una ranura de conjuro para infligir 2d8 de daño radiante extra (más 1d8 por cada nivel de ranura superior al 1º, +1d8 adicional contra muertos vivientes e infernales).'
    },
    {
      id: 'pal-aura-of-protection',
      name: 'Aura de Protección',
      level: 6,
      className: 'Paladín',
      description: 'Tú y los aliados a 10 pies de ti sumáis vuestro modificador de Carisma (mínimo +1) a todas las tiradas de salvación.'
    }
  ],

  // ==========================================
  // DRUIDA (DRUID) - Círculo de las Esporas
  // ==========================================
  druida: [
    {
      id: 'dru-druidic',
      name: 'Druídico',
      level: 1,
      className: 'Druida',
      prerequisites: 'Sabiduría 13 para multiclase',
      description: 'Conoces el idioma secreto de los druidas y puedes dejar mensajes ocultos en la naturaleza.'
    },
    {
      id: 'dru-spellcasting',
      name: 'Lanzamiento de Conjuros Naturales',
      level: 1,
      className: 'Druida',
      description: 'Preparas diariamente un número de conjuros igual a tu Nivel de Druida + Modificador de Sabiduría. Puedes cambiarlos tras un descanso largo.'
    },
    {
      id: 'dru-wild-shape',
      name: 'Forma Salvaje',
      level: 2,
      className: 'Druida',
      resourceCost: '2 usos por Descanso Corto o Largo',
      description: 'Puedes usar tu acción para asumir mágicamente la forma de una bestia que hayas visto, o canalizar sus usos en rasgos de círculo.'
    },
    {
      id: 'dru-halo-of-spores',
      name: 'Halo de Esporas',
      level: 2,
      className: 'Druida',
      subclass: 'Círculo de las Esporas',
      resourceCost: '1 Reacción',
      description: 'Estás rodeado por esporas fúngicas invisibles. Cuando una criatura entra a 10 pies de ti o empieza su turno allí, puedes usar tu reacción para forzar una salvación de Constitución o sufrir 1d4 de daño necrótico (escala a 1d6 en Nv.6, 1d8 en Nv.10, 1d10 en Nv.14).'
    },
    {
      id: 'dru-symbiotic-entity',
      name: 'Entidad Simbiótica',
      level: 2,
      className: 'Druida',
      subclass: 'Círculo de las Esporas',
      resourceCost: '1 uso de Forma Salvaje como Acción Adicional',
      description: 'Despiertas las esporas: ganas 4 puntos de golpe temporales por cada nivel de Druida (ej. 28 PG a Nv.7). Mientras conserves estos PG temporales, tu Halo de Esporas tira sus dados dos veces y tus impactos con armas cuerpo a cuerpo infligen +1d6 de daño necrótico extra.'
    },
    {
      id: 'dru-fungal-infestation',
      name: 'Infección Fúngica',
      level: 6,
      className: 'Druida',
      subclass: 'Círculo de las Esporas',
      resourceCost: '1 Reacción al morir una bestia o humanoide cercano',
      description: 'Tus esporas animan a un cadáver fresco convirtiéndolo en un zombi con 1 punto de golpe que te obedece durante 1 hora.'
    },
    {
      id: 'dru-spreading-spores',
      name: 'Esporas Dispersas',
      level: 10,
      className: 'Druida',
      subclass: 'Círculo de las Esporas',
      description: 'Lanzas un cubo de esporas de 10 pies a 30 pies de ti que persiste dañando a enemigos con Halo de Esporas sin gastar tu reacción.'
    }
  ],

  // ==========================================
  // ARTIFICIERO (ARTIFICER) - Alquimista
  // ==========================================
  artificiero: [
    {
      id: 'art-magical-tinkering',
      name: 'Chapucería Mágica',
      level: 1,
      className: 'Artificiero',
      prerequisites: 'Inteligencia 13 para multiclase',
      description: 'Imbuyes una chispa de magia en objetos mundanos diminutos para emitir luz, reproducir mensajes de voz, olores o imágenes estáticas.'
    },
    {
      id: 'art-spellcasting',
      name: 'Conjuración de Artífice',
      level: 1,
      className: 'Artificiero',
      gearRestrictions: 'Requiere herramientas de artesano o infusión en mano para todos los conjuros',
      description: 'Preparas conjuros igual a ⌊Nivel de Artificiero / 2⌋ + Mod. Inteligencia. Todos tus conjuros tienen componente Material obligatorio.'
    },
    {
      id: 'art-infusions',
      name: 'Infusiones Arcanas',
      level: 2,
      className: 'Artificiero',
      resourceCost: 'Objetos imbuidos activos según nivel',
      description: 'Transformas objetos mundanos en objetos mágicos permanentes mientras mantengas la infusión activa (Arma mejorada, Defensa mejorada, Mente concentrada, etc.).'
    },
    {
      id: 'art-experimental-elixir',
      name: 'Elixir Experimental',
      level: 3,
      className: 'Artificiero',
      subclass: 'Alquimista',
      resourceCost: '1 frasco gratuito por descanso largo, o gastando 1 espacio de conjuro por frasco',
      description: 'Creas brebajes mágicos: Curación (2d4+Int PG), Celeridad (+10 pies velocidad), Resiliencia (+1 CA), Audacia (+1d4 a ataques y salvaciones), Vuelo (10 pies) o Transformación (Alterar aspecto).'
    },
    {
      id: 'art-alchemical-savant',
      name: 'Tratamiento Alquímico',
      level: 5,
      className: 'Artificiero',
      subclass: 'Alquimista',
      description: 'Al lanzar un conjuro usando tus suministros de alquimista como foco, sumas tu modificador de Inteligencia (+4) a una tirada que restaure PG o que cause daño de ácido, fuego, necrótico o veneno.'
    },
    {
      id: 'art-flash-of-genius',
      name: 'Destello de Genialidad',
      level: 7,
      className: 'Artificiero',
      resourceCost: 'Mod. Inteligencia usos por Descanso Largo como Reacción',
      description: 'Cuando tú o una criatura que puedas ver a 30 pies hagáis una prueba de característica o tirada de salvación, puedes usar tu reacción para sumar tu modificador de Inteligencia (+4) a la tirada.'
    }
  ],

  // ==========================================
  // PÍCARO (ROGUE) - Embaucador Arcano
  // ==========================================
  pícaro: [
    {
      id: 'rog-sneak-attack',
      name: 'Ataque Furtivo',
      level: 1,
      className: 'Pícaro',
      prerequisites: 'Destreza 13 para multiclase',
      gearRestrictions: 'Arma sutil (precisión) o a distancia',
      description: 'Infliges daño adicional (escala de 1d6 a 10d6 según nivel; +4d6 a Nivel 7) a una criatura si tienes ventaja en la tirada, o si un aliado está a 5 pies de ella y tú no tienes desventaja.'
    },
    {
      id: 'rog-cunning-action',
      name: 'Acción Astuta',
      level: 2,
      className: 'Pícaro',
      resourceCost: '1 Acción Adicional en tu turno',
      description: 'Puedes realizar la acción de Correr, Destrabarse o Esconderse como Acción Adicional en cada uno de tus turnos.'
    },
    {
      id: 'rog-mage-hand-legerdemain',
      name: 'Mano de Mago Embaucadora',
      level: 3,
      className: 'Pícaro',
      subclass: 'Embaucador Arcano',
      description: 'Tu truco Mano de Mago es invisible y puedes usarla para guardar o hurtar objetos de bolsillos ajenos o forzar cerraduras a distancia usando herramientas de ladrón.'
    },
    {
      id: 'rog-uncanny-dodge',
      name: 'Esquiva Asombrosa',
      level: 5,
      className: 'Pícaro',
      resourceCost: '1 Reacción al recibir impacto de ataque visible',
      description: 'Cuando un atacante que puedes ver te impacta con un ataque, puedes usar tu reacción para reducir a la mitad el daño que sufras.'
    },
    {
      id: 'rog-evasion',
      name: 'Evasión',
      level: 7,
      className: 'Pícaro',
      description: 'Si superas una salvación de Destreza que inflige la mitad de daño, recibes 0 daño; si la fallas, solo recibes la mitad.'
    }
  ],

  // ==========================================
  // BARDO (BARD)
  // ==========================================
  bardo: [
    {
      id: 'brd-bardic-inspiration',
      name: 'Inspiración Bárdica',
      level: 1,
      className: 'Bardo',
      prerequisites: 'Carisma 13 para multiclase',
      resourceCost: 'Mod. Carisma usos por Descanso Largo (Corto a Nv.5)',
      description: 'Inspiras a otros a través de palabras o música. Como acción adicional, otorgas un dado de Inspiración Bárdica (1d6, luego 1d8, 1d10, 1d12) a una criatura a 60 pies para sumarlo a una tirada de d20.'
    },
    {
      id: 'brd-jack-of-all-trades',
      name: 'Aprendiz de Mucho',
      level: 2,
      className: 'Bardo',
      description: 'Sumas la mitad de tu bonificador de competencia (redondeado hacia abajo) a cualquier prueba de característica que no incluya ya tu bonificador de competencia.'
    },
    {
      id: 'brd-song-of-rest',
      name: 'Canción de Descanso',
      level: 2,
      className: 'Bardo',
      description: 'Tú y tus aliados recuperáis 1d6 puntos de golpe adicionales al gastar Dados de Golpe durante un descanso corto.'
    },
    {
      id: 'brd-expertise',
      name: 'Pericia (Expertise)',
      level: 3,
      className: 'Bardo',
      description: 'Eliges dos de tus habilidades con las que seas competente; tu bonificador de competencia se duplica para cualquier prueba que hagas con ellas.'
    }
  ]
};

export function getClassFeatures(className: string): ClassFeatureItem[] {
  const norm = (className || '').toLowerCase().trim();
  for (const [key, features] of Object.entries(CANONICAL_CLASS_FEATURES)) {
    if (norm.includes(key) || key.includes(norm)) {
      return features;
    }
  }
  return [];
}
