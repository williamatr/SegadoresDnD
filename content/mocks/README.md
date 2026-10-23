# Datos Mock Públicos de D&D (SRD 5.1 / 5.2) 🛡️

Este directorio contiene notas en Markdown generadas **estrictamente a partir del documento oficial de reglas públicas (System Reference Document)** de Wizards of the Coast, amparadas bajo la licencia internacional **Creative Commons Atribución 4.0 (CC-BY-4.0)**.

## 🎯 Propósitos de este directorio
1. **Fallback para Portafolio Público:** Si un desarrollador o reclutador clona el proyecto público `SegadoresDnD`, no tiene acceso al repositorio privado de notas (`content/wiki`). El motor `@segadores/obsidian-engine` carga estas notas de demostración para permitir navegar y probar la aplicación web sin errores ni crasheos.
2. **Suite de Pruebas Unitarias y de Integración (CI/CD):** Proporciona fixtures estables, libres de derechos y predecibles para probar el parser de Markdown, wikilinks `[[...]]`, callouts temáticos (`[!statblock]`, `[!dnd-grid]`) y frontmatters YAML.

## 📜 Regla de Contenido para Agentes e Inteligencia Artificial
* **REGLA OBLIGATORIA:** Cualquier mock o fixture agregado a este directorio debe derivarse **exclusivamente** del archivo oficial `SP_SRD_CC_v5.2.1.pdf` (SRD CC-BY-4.0).
* **PROHIBICIÓN ESTRICTA:** Queda terminantemente prohibido incluir notas privadas de campaña, secretos del DM, o material sujeto a copyright comercial de libros no liberados (*Tasha*, *Xanathar*, *Monsters of the Multiverse*, etc.).
