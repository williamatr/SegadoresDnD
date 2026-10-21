# Especificaciones del Sistema y Entorno de Desarrollo

Este documento registra las características técnicas del equipo del usuario, sistema operativo, gestores de paquetes y entorno gráfico para que cualquier modelo de IA o desarrollador ejecute comandos y configure herramientas de forma 100% compatible.

---

## 🖥️ Resumen del Sistema

* **Sistema Operativo:** Arch Linux (Rolling release)
* **Kernel:** Linux 6.18.40-2-lts (x86_64)
* **Entorno de Escritorio:** KDE Plasma
* **Compositor / Sesión:** Wayland (`kwin_wayland`, `XDG_SESSION_TYPE=wayland`)
* **Procesador (CPU):** Intel(R) Core(TM) i7-4790 @ 3.60GHz (4 núcleos / 8 hilos)
* **Tarjeta Gráfica (GPU):** NVIDIA GeForce GTX 1660 SUPER (TU116)
* **Memoria RAM:** 32 GiB (31 GiB detectados)
* **Almacenamiento:** Partición principal de 931 GiB montada en `/`

---

## 📦 Gestores de Paquetes y Herramientas CLI

* **Gestor Oficial:** `pacman` (`sudo pacman -S ...`)
* **AUR Helper Instalado:** **`yay`** (versión 13.0.1 detectada en `/usr/bin/yay`).
* **Node.js / Entorno JS:**
  * **Node.js:** `v26.11.1` (`/usr/bin/node`)
  * **pnpm:** `v11.28.5` (`/usr/bin/pnpm`)
  * **npm:** No instalado por separado (en Arch Linux requiere `sudo pacman -S npm` si se necesita). Se prioriza `pnpm`.

---

## 🎮 Periféricos Conectados

* **Teclado:** Razer BlackWidow V3 Tenkeyless (usar OpenRazer / Polychromatic si aplica)
* **Ratón:** Razer Basilisk V3
* **Cámara Web:** Microdia NEXIGO HD Webcam
* **Micrófono:** DCMT Technology USB Condenser Microphone
* **Gamepad / Mando:** 8BitDo Ultimate 2C Wired Controller

---

## ⚙️ Reglas de Compatibilidad para Asistentes y Modelos

1. **Gestión de Paquetes:** Nunca sugerir comandos de Debian/Ubuntu (`apt`), Fedora (`dnf`), ni asumir `paru`. Usar siempre `pacman` o `yay`.
2. **Wayland Nativo:** No asumir X11 (`xdotool`, `xmodmap`, etc. no aplican). Priorizar aplicaciones y configuraciones nativas de Wayland y KWin.
3. **IDEs / Editores:** El usuario prefiere herramientas de la suite **JetBrains** (WebStorm / IntelliJ) o editores modernos nativos (Zed, Kate).
