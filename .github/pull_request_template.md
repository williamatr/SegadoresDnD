## 📌 Descripción del Cambio
<!-- Proporciona un resumen claro de los cambios introducidos en este PR -->

## 🏷️ Tipo de Cambio
- [ ] 🚀 `feat`: Nueva funcionalidad o componente
- [ ] 🐛 `fix`: Corrección de errores
- [ ] 📝 `docs`: Cambios en la documentación o especificaciones
- [ ] 🎨 `style`: Formateo, estilos o UI sin cambios en la lógica
- [ ] ♻️ `refactor`: Reorganización o refactorización de código existente
- [ ] ⚙️ `chore`: Mantenimiento, dependencias o configuración del monorepo
- [ ] 🧪 `test`: Nuevas pruebas o ajustes de tests

## 📦 Paquetes y Módulos Afectados
- [ ] `apps/segadores-web` (Aplicación central orquestadora)
- [ ] `packages/dnd-core` (Lógica y reglas de D&D)
- [ ] `packages/character-sheet` (Componentes visuales de hoja)
- [ ] `packages/obsidian-engine` (Motor de Markdown / Wiki)
- [ ] `packages/ui` (Componentes compartidos)
- [ ] `content/` (Submódulo o documentación de contenido)
- [ ] Otro: <!-- especificar -->

## 📋 Entradas para el CHANGELOG
<!-- Resume brevemente qué líneas se añadieron o deben añadirse en CHANGELOG.md [Unreleased] -->
- **Añadido:**
- **Cambiado:**
- **Corregido:**

## ✅ Checklist de Verificación
- [ ] El código sigue las pautas de arquitectura de [PROJECT_SPEC.md](../PROJECT_SPEC.md).
- [ ] Los componentes de `packages/*` se mantienen agnósticos y desacoplados de la base de datos/infraestructura.
- [ ] No se exponen datos con copyright en repositorios o archivos públicos.
- [ ] Se actualizó el archivo `CHANGELOG.md` en la sección `[Unreleased]`.
- [ ] El proyecto compila localmente sin errores de TypeScript (`pnpm build` o `pnpm check`).
