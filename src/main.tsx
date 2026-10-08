import { render } from 'preact'

// Tipografías auto-hospedadas para que la app funcione offline (PLAN.md §8).
import '@fontsource/newsreader/latin-400.css'
import '@fontsource/newsreader/latin-400-italic.css'
import '@fontsource/newsreader/latin-500.css'
import '@fontsource/newsreader/latin-600.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import 'katex/dist/katex.min.css'

import './estilos/tokens.css'
import './estilos/global.css'

import { App } from './app'

const raiz = document.getElementById('app')
if (!raiz) throw new Error('No existe el nodo #app en index.html')
render(<App />, raiz)
