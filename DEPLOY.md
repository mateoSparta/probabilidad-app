# Publicar en GitHub Pages

Todo lo que se puede automatizar ya está hecho: hay un workflow en
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) que construye y
publica en cada push a `main`. Lo que falta son tres clics en la web de GitHub,
porque habilitar Pages no se puede hacer desde el repo.

## Antes de empezar: dos decisiones

### 1. Los PDF de la cátedra están en el repo

`fuentes/` tiene 48 PDF commiteados (guías, exámenes, resueltas, teoría) y el
repo pesa **332 MB**. El sitio publicado **no** los incluye —Pages sólo recibe
`dist/`— pero si el repositorio es público, los PDF son públicos.

Fijate en <https://github.com/mateoSparta/probabilidad-app/settings> qué dice
arriba, al lado del nombre: *Public* o *Private*. Si está en público y no
querés redistribuir el material de la cátedra, tenés dos opciones:

- **Dejar el repo privado.** GitHub Pages desde un repo privado requiere plan
  pago (Pro o superior). Si tenés plan gratis, no va.
- **Sacar los PDF del repo** y dejarlos sólo en tu máquina. Es lo que yo
  haría: agregás `fuentes/*.pdf` al `.gitignore`, y como ya están en el
  historial hay que reescribirlo con `git filter-repo`. El efecto secundario
  bueno es que el repo baja de 332 MB a unos pocos. Si querés, decime y lo
  preparo.

El pipeline de contenido necesita los PDF, pero sólo en tu máquina: el build
no los toca.

### 2. Qué rama publica

El workflow está configurado para `main`. Mis commits están en `fases-0-3`, así
que primero hay que mergear:

```bash
git checkout main
git merge --ff-only fases-0-3
```

## Los pasos

### 1. Habilitar Pages

Andá a **Settings → Pages** del repo
(<https://github.com/mateoSparta/probabilidad-app/settings/pages>) y en
**Source** elegí **GitHub Actions**.

No elijas "Deploy from a branch": eso sirve para sitios estáticos ya
construidos, y acá el sitio se construye en el workflow.

### 2. Pushear main

```bash
git push origin main
```

Eso dispara el workflow. Se ve correr en la pestaña **Actions**.

### 3. Esperar y abrir

El workflow tarda un par de minutos (instala dependencias, corre el validador,
el smoke, el render-check y recién después construye). Cuando termina, la app
queda en:

```
https://mateosparta.github.io/probabilidad-app/
```

La URL exacta también aparece en el resumen del workflow, en Actions.

## Si algo falla

**El workflow falla en `npm run build`.** No es un problema de deploy: es que
el contenido no pasa el validador. El log de Actions dice exactamente qué
ítem. Lo mismo se reproduce en tu máquina con `npm run check`.

**El workflow falla con "Resource not accessible by integration" o similar.**
Faltó el paso 1: Pages no está en modo GitHub Actions.

**La página carga en blanco.** Abrí la consola del navegador. Si hay 404 de
`assets/…`, es un problema de rutas; el build usa rutas relativas
(`base: './'` en `vite.config.ts`), así que no debería pasar. Lo verifiqué
sirviendo `dist/` desde un subdirectorio y los assets, el CSS y las fuentes de
KaTeX resuelven bien.

**Dice que el sitio está publicado pero veo la versión vieja.** Pages cachea.
Recargá con Ctrl+Shift+R.

## Cosas que conviene saber

**El progreso vive en el navegador.** Se guarda en `localStorage`, que está
atado al origen. O sea: lo que estudies en `localhost:5173` y lo que estudies
en `mateosparta.github.io` son dos progresos separados, y no se mezclan. Si
querés pasar uno al otro, usá Exportar / Importar JSON en el panel de skills.

**No hace falta publicarlo para usarlo.** `npm run dev` alcanza, y es más
rápido. Pages sirve para abrirlo desde el celular o desde otra máquina sin
instalar nada.

**El sitio es estático y sin backend**, así que no hay nada que se pueda
romper del lado del servidor ni nada que mantener.
