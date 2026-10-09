---
id: t-condicionar-Nt
skills: [condicionar-Nt]
---
## Condicionar a N(t) = n

Esta propiedad es la más útil de la guía y la menos obvia:

> Si se sabe que en $(0, t]$ ocurrieron exactamente $n$ eventos, entonces sus
> tiempos de arribo son $n$ variables **uniformes independientes** en $(0, t]$.

Dicho de otro modo: condicionado al total, el proceso de Poisson se olvida de
ser un proceso. Quedan $n$ puntos tirados al azar en el intervalo, como si
hubieras dejado caer $n$ granos de arena.

La consecuencia práctica es fuerte: **la intensidad $\lambda$ desaparece de la
cuenta**. Si el enunciado dice "sabiendo que arribaron exactamente 3 llamadas",
el dato de 4 por hora deja de intervenir y todo se vuelve combinatoria con
uniformes. Si $\lambda$ aparece en tu resultado, probablemente no usaste esta
propiedad.

De ahí sale directamente que el conteo en un subintervalo sea binomial:

$$P(N(s) = k \mid N(t) = n) = \binom{n}{k}\left(\frac{s}{t}\right)^{k}\left(1 - \frac{s}{t}\right)^{n-k}$$

cada uno de los $n$ puntos cae en $(0, s]$ con probabilidad $s/t$,
independientemente de los demás.

Y las preguntas sobre el orden se traducen a conteos: "la primera llamada llegó
antes de $s$" es "al menos uno de los $n$ cayó antes de $s$"; "la segunda llegó
antes de $s$" es "al menos dos cayeron antes de $s$".
