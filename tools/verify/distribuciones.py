# -*- coding: utf-8 -*-
"""
Valores de referencia de la calculadora de distribuciones (PLAN.md §12.4).

src/dominio/distribuciones.ts calcula probabilidades, densidades, funciones de
distribución, cuantiles y momentos con funciones especiales escritas a mano.
Este script calcula lo mismo con mpmath, con 30 dígitos, para una grilla de
parámetros y de puntos, y lo escribe en content/.verificacion/distribuciones.json;
tools/smoke.ts exige que la calculadora coincida. Así ningún número que
muestre la calculadora queda sin contrastar (CLAUDE.md).

Las fórmulas son las de la tabla de la cátedra
(fuentes/teoria/probabilidad_distribuciones.pdf), escritas acá de nuevo y de
forma independiente: sumas exactas y funciones de mpmath, no las fracciones
continuas de la app.

    .venv/Scripts/python tools/verify/distribuciones.py
"""
from __future__ import annotations

import json
import sys
from fractions import Fraction
from math import comb
from pathlib import Path

import mpmath as mp

mp.mp.dps = 30

RAIZ = Path(__file__).resolve().parents[2]
SALIDA = RAIZ / "content" / ".verificacion" / "distribuciones.json"

ALFAS = [0.05, 0.5, 0.95]


def f(x) -> float:
    return float(mp.mpf(x))


# ------------------------------------------------------------- discretas

def binomial(n, p):
    pmf = lambda k: comb(n, k) * mp.mpf(p) ** k * (1 - mp.mpf(p)) ** (n - k)
    return pmf, (0, n), n * mp.mpf(p), n * mp.mpf(p) * (1 - mp.mpf(p))


def geometrica(p):
    p = mp.mpf(p)
    return lambda k: (1 - p) ** (k - 1) * p, (1, None), 1 / p, (1 - p) / p**2


def pascal(k, p):
    p = mp.mpf(p)
    pmf = lambda x: comb(x - 1, k - 1) * p**k * (1 - p) ** (x - k)
    return pmf, (k, None), k / p, k * (1 - p) / p**2


def poisson(mu):
    mu = mp.mpf(mu)
    return lambda k: mp.exp(-mu) * mu**k / mp.factorial(k), (0, None), mu, mu


def hipergeometrica(N, d, n):
    pmf = lambda x: mp.mpf(comb(d, x) * comb(N - d, n - x)) / comb(N, n)
    soporte = (max(0, d + n - N), min(n, d))
    var = mp.mpf(n * d * (N - d) * (N - n)) / (N * N * (N - 1))
    return pmf, soporte, mp.mpf(n * d) / N, var


def bernoulli(p):
    p = mp.mpf(p)
    return lambda k: p if k == 1 else 1 - p, (0, 1), p, p * (1 - p)


DISCRETAS = [
    ("bernoulli", {"p": 0.3}, bernoulli(0.3), [0, 1]),
    ("bernoulli", {"p": 0.85}, bernoulli(0.85), [0, 1]),
    ("binomial", {"n": 10, "p": 0.3}, binomial(10, 0.3), [0, 3, 7]),
    ("binomial", {"n": 200, "p": 0.04}, binomial(200, 0.04), [2, 8, 15]),
    ("geometrica", {"p": 0.25}, geometrica(0.25), [1, 4, 12]),
    ("geometrica", {"p": 0.05}, geometrica(0.05), [3, 20, 60]),
    ("pascal", {"k": 3, "p": 0.4}, pascal(3, 0.4), [3, 7, 15]),
    ("pascal", {"k": 10, "p": 0.7}, pascal(10, 0.7), [10, 14, 20]),
    ("poisson", {"mu": 4}, poisson(4), [0, 4, 10]),
    ("poisson", {"mu": 37.5}, poisson("37.5"), [25, 37, 50]),
    ("hipergeometrica", {"N": 20, "d": 7, "n": 5}, hipergeometrica(20, 7, 5), [0, 2, 5]),
    ("hipergeometrica", {"N": 100, "d": 60, "n": 50}, hipergeometrica(100, 60, 50), [10, 30, 40]),
]


def casos_discretos():
    salida = []
    for id_, params, (pmf, (s0, s1), media, var), puntos in DISCRETAS:
        def F(x):
            if x < s0:
                return mp.mpf(0)
            tope = x if s1 is None else min(x, s1)
            return mp.fsum(pmf(k) for k in range(s0, tope + 1))

        def cuantil(alfa):
            k = s0
            acumulada = pmf(k)
            while acumulada < alfa:
                k += 1
                acumulada += pmf(k)
            return k

        salida.append({
            "id": id_,
            "parametros": params,
            "puntos": [{"x": x, "puntual": f(pmf(x)), "distribucion": f(F(x))} for x in puntos],
            "cuantiles": [{"alfa": a, "x": cuantil(a)} for a in ALFAS],
            "esperanza": f(media),
            "varianza": f(var),
        })
    return salida


# ------------------------------------------------------------- continuas

def continua(id_, params, pdf, cdf, soporte, media, var, puntos):
    def cuantil(alfa):
        a, b = soporte
        lo = mp.mpf(a) if a is not None else mp.mpf(-1)
        hi = mp.mpf(b) if b is not None else mp.mpf(1)
        while a is None and cdf(lo) > alfa:
            lo = 2 * lo - 1
        while b is None and cdf(hi) < alfa:
            hi = 2 * hi + 1
        # Bisección: lenta pero segura, y con 150 pasos sobran dígitos.
        for _ in range(150):
            m = (lo + hi) / 2
            if cdf(m) >= alfa:
                hi = m
            else:
                lo = m
        return (lo + hi) / 2

    return {
        "id": id_,
        "parametros": params,
        "puntos": [{"x": x, "puntual": f(pdf(mp.mpf(x))), "distribucion": f(cdf(mp.mpf(x)))} for x in puntos],
        "cuantiles": [{"alfa": a, "x": f(cuantil(mp.mpf(a)))} for a in ALFAS],
        "esperanza": media if isinstance(media, str) else f(media),
        "varianza": var if isinstance(var, str) else f(var),
    }


def casos_continuos():
    c = []
    # Uniforme
    for a, b, xs in [(0, 1, [0.1, 0.5, 0.9]), (-2, 5, [-1, 0, 4.5])]:
        a_, b_ = mp.mpf(a), mp.mpf(b)
        c.append(continua("uniforme", {"a": a, "b": b}, lambda x: 1 / (b_ - a_),
                          lambda x: (x - a_) / (b_ - a_), (a, b), (a_ + b_) / 2, (b_ - a_) ** 2 / 12, xs))
    # Exponencial
    for lam, xs in [(1, [0.2, 1, 3]), (0.25, [0.5, 4, 12])]:
        l = mp.mpf(lam)
        c.append(continua("exponencial", {"lambda": lam}, lambda x: l * mp.exp(-l * x),
                          lambda x: 1 - mp.exp(-l * x), (0, None), 1 / l, 1 / l**2, xs))
    # Gamma(nu, lambda): por la gamma incompleta de mpmath.
    for nu, lam, xs in [(3, 1, [0.5, 2.5, 7]), (2.5, 0.5, [1, 4, 12])]:
        n_, l = mp.mpf(nu), mp.mpf(lam)
        c.append(continua("gamma", {"nu": nu, "lambda": lam},
                          lambda x: l**n_ / mp.gamma(n_) * x ** (n_ - 1) * mp.exp(-l * x),
                          lambda x: mp.gammainc(n_, 0, l * x, regularized=True),
                          (0, None), n_ / l, n_ / l**2, xs))
    # Normal
    for mu, s2, xs in [(0, 1, [-1.96, 0, 0.8]), (30, 4, [26, 30.5, 35])]:
        m, s = mp.mpf(mu), mp.sqrt(mp.mpf(s2))
        c.append(continua("normal", {"mu": mu, "sigma2": s2}, lambda x: mp.npdf(x, m, s),
                          lambda x: mp.ncdf(x, m, s), (None, None), m, s**2, xs))
    # Chi cuadrado
    for k, xs in [(4, [1, 3.36, 9.49]), (17, [8, 16, 27.59])]:
        h = mp.mpf(k) / 2
        c.append(continua("chi2", {"k": k},
                          lambda x: x ** (h - 1) * mp.exp(-x / 2) / (2**h * mp.gamma(h)),
                          lambda x: mp.gammainc(h, 0, x / 2, regularized=True),
                          (0, None), mp.mpf(k), 2 * mp.mpf(k), xs))
    # t de Student: la distribución por integración numérica de la densidad.
    for nu, xs in [(5, [-2.015, 0.3, 2.571]), (2.5, [-1, 0.5, 4])]:
        n_ = mp.mpf(nu)
        cte = mp.gamma((n_ + 1) / 2) / (mp.sqrt(n_ * mp.pi) * mp.gamma(n_ / 2))
        pdf = lambda x, n_=n_, cte=cte: cte * (1 + x * x / n_) ** (-(n_ + 1) / 2)
        cdf = lambda x, pdf=pdf: mp.mpf(1) / 2 + mp.quad(pdf, [0, x])
        var = n_ / (n_ - 2)
        c.append(continua("t", {"nu": nu}, pdf, cdf, (None, None), mp.mpf(0), var, xs))
    # Weibull(c, alfa)
    for cc, al, xs in [(2, 1, [0.3, 1, 2]), (0.8, 3, [0.5, 3, 10])]:
        k, a = mp.mpf(cc), mp.mpf(al)
        c.append(continua("weibull", {"c": cc, "alfa": al},
                          lambda x: k / a * (x / a) ** (k - 1) * mp.exp(-((x / a) ** k)),
                          lambda x: 1 - mp.exp(-((x / a) ** k)), (0, None),
                          a * mp.gamma(1 + 1 / k), a**2 * (mp.gamma(1 + 2 / k) - mp.gamma(1 + 1 / k) ** 2), xs))
    # Rayleigh
    for sg, xs in [(1, [0.5, 1.2, 3]), (2.5, [1, 3, 7])]:
        s = mp.mpf(sg)
        c.append(continua("rayleigh", {"sigma": sg},
                          lambda x: x / s**2 * mp.exp(-(x**2) / (2 * s**2)),
                          lambda x: 1 - mp.exp(-(x**2) / (2 * s**2)), (0, None),
                          s * mp.sqrt(mp.pi / 2), (4 - mp.pi) / 2 * s**2, xs))
    # Pareto
    for m_, al, xs in [(1, 3, [1.2, 2, 5]), (2, 1.5, [2.5, 4, 20])]:
        m, a = mp.mpf(m_), mp.mpf(al)
        media = a * m / (a - 1)
        var = m**2 * a / ((a - 1) ** 2 * (a - 2)) if al > 2 else "infinita"
        c.append(continua("pareto", {"m": m_, "alfa": al},
                          lambda x: a * m**a / x ** (a + 1), lambda x: 1 - (m / x) ** a,
                          (m_, None), media, var, xs))
    # Beta: la distribución por la beta incompleta de mpmath.
    for a_, b_, xs in [(2, 5, [0.1, 0.3, 0.7]), (0.5, 0.5, [0.05, 0.5, 0.9])]:
        a, b = mp.mpf(a_), mp.mpf(b_)
        c.append(continua("beta", {"a": a_, "b": b_},
                          lambda x: x ** (a - 1) * (1 - x) ** (b - 1) / mp.beta(a, b),
                          lambda x: mp.betainc(a, b, 0, x, regularized=True), (0, 1),
                          a / (a + b), a * b / ((a + b) ** 2 * (a + b + 1)), xs))
    # Cauchy
    for x0, g, xs in [(0, 1, [-3, 0.5, 10]), (2, 0.5, [1, 2.2, 4])]:
        x0_, g_ = mp.mpf(x0), mp.mpf(g)
        c.append(continua("cauchy", {"x0": x0, "gamma": g},
                          lambda x: g_ / (mp.pi * ((x - x0_) ** 2 + g_**2)),
                          lambda x: mp.mpf(1) / 2 + mp.atan((x - x0_) / g_) / mp.pi,
                          (None, None), "no existe", "no existe", xs))
    return c


# --------------------------------------------------------- multivariadas

def casos_multinomial():
    salida = []
    for n, ps, xs in [(10, ["0.2", "0.3", "0.5"], [2, 3, 5]), (12, ["0.1", "0.2", "0.3", "0.4"], [1, 2, 4, 5])]:
        fr = [Fraction(p) for p in ps]
        coef = Fraction(1)
        resto = n
        for x in xs:
            coef *= comb(resto, x)
            resto -= x
        prob = coef
        for p, x in zip(fr, xs):
            prob *= p**x
        salida.append({"n": n, "ps": [float(p) for p in fr], "xs": xs, "prob": float(prob)})
    return salida


def casos_bivariada():
    """P(X1 <= a, X2 <= b) integrando la densidad conjunta en dos variables."""
    mp.mp.dps = 15
    salida = []
    for mu1, mu2, s1, s2, rho, a, b in [
        (0, 0, 1, 1, 0.5, 0, 0),
        (1, -2, 2, 0.5, -0.3, 2, -1.8),
        (10, 20, 3, 4, 0.8, 8, 22),
    ]:
        def dens(x, y):
            u, v = (x - mu1) / s1, (y - mu2) / s2
            q = (u * u - 2 * rho * u * v + v * v) / (1 - rho * rho)
            return mp.exp(-q / 2) / (2 * mp.pi * s1 * s2 * mp.sqrt(1 - rho * rho))
        prob = mp.quad(dens, [mu1 - 12 * s1, a], [mu2 - 12 * s2, b])
        salida.append({"mu1": mu1, "mu2": mu2, "s1": s1, "s2": s2, "rho": rho, "a": a, "b": b, "prob": float(prob)})
    mp.mp.dps = 30
    return salida


def coma(x, decimales: int) -> str:
    return f"{float(x):.{decimales}f}".replace(".", ",")


def numeros_de_los_tips() -> dict[str, list[str]]:
    """
    Los números que citan los tips de content/distribuciones.yaml, calculados
    acá; tools/check.ts exige que cada uno aparezca tal cual en el tip de su
    distribución. Las relaciones que los tips enuncian sin números se
    comprueban con valores concretos (un `assert` que falla corta el script).
    """
    cerca = lambda a, b, tol=mp.mpf("1e-20"): abs(a - b) <= tol * max(1, abs(b))

    # Exponencial: P(X > 1/lambda) = e^{-1}; la mediana ln 2 / lambda queda antes de la media.
    e1 = mp.e ** -1
    assert mp.log(2) < 1
    # Normal: la regla 68-95-99,7.
    Phi = lambda z: (1 + mp.erf(z / mp.sqrt(2))) / 2
    dentro = [2 * Phi(k) - 1 for k in (1, 2, 3)]
    # t de Student: cuantiles 0,975, por bisección sobre la distribución.
    def cdf_t(x, nu):
        return mp.quad(lambda u: mp.gamma((nu + 1) / mp.mpf(2)) / (mp.sqrt(nu * mp.pi) * mp.gamma(nu / mp.mpf(2)))
                       * (1 + u * u / nu) ** (-(nu + 1) / mp.mpf(2)), [-mp.inf, 0, x])
    def cuantil_t(alfa, nu):
        lo, hi = mp.mpf(0), mp.mpf(100)
        for _ in range(120):
            mid = (lo + hi) / 2
            lo, hi = (mid, hi) if cdf_t(mid, nu) < alfa else (lo, mid)
        return (lo + hi) / 2
    alfa = mp.mpf("0.975")
    t975 = [cuantil_t(alfa, nu) for nu in (1, 10, 30)]
    z975 = mp.sqrt(2) * mp.erfinv(2 * alfa - 1)
    # Pareto: con alpha = log_4 5, el 20 % más alto se lleva el 80 % del total.
    # La fracción del total que aporta la cola X > x_q, con P(X > x_q) = q, es q^(1 - 1/alpha).
    a8020 = mp.log(5) / mp.log(4)
    assert cerca(mp.mpf("0.2") ** (1 - 1 / a8020), mp.mpf("0.8"))
    # Rayleigh: la media sigma*sqrt(pi/2) y la moda en sigma (donde f' = 0).
    media_ray = mp.sqrt(mp.pi / 2)
    assert cerca(mp.diff(lambda x: x * mp.e ** (-x * x / 2), 1), mp.mpf(0))
    # Geométrica con p = 1/6: esperanza 6. chi2_2 = Gamma(1, 1/2): media 2.
    assert Fraction(1, 1) / Fraction(1, 6) == 6

    # Relaciones sin números, con valores concretos.
    # Pascal y binomial: P(Pas(k, p) <= n) = P(B(n, p) >= k).
    p = Fraction(3, 10)
    for k, n in [(3, 7), (5, 12), (1, 4)]:
        pas = sum(comb(x - 1, k - 1) * (1 - p) ** (x - k) * p**k for x in range(k, n + 1))
        bino = sum(comb(n, j) * p**j * (1 - p) ** (n - j) for j in range(k, n + 1))
        assert pas == bino, (k, n)
    # Weibull de forma 2 y Rayleigh: S(t) = e^{-(t/alpha)^2} = e^{-t^2/(2 sigma^2)} con sigma = alpha/sqrt(2).
    for al, t in [(1.5, 0.7), (3, 4.2)]:
        s = mp.mpf(al) / mp.sqrt(2)
        assert cerca(mp.e ** (-(mp.mpf(t) / al) ** 2), mp.e ** (-mp.mpf(t) ** 2 / (2 * s * s)))
    # Mínimo de n Weibull: S(t)^n = e^{-(t/(alpha n^{-1/c}))^c}.
    c, al, n, t = mp.mpf("1.7"), mp.mpf(2), 5, mp.mpf("0.9")
    assert cerca((mp.e ** (-(t / al) ** c)) ** n, mp.e ** (-(t / (al * mp.mpf(n) ** (-1 / c))) ** c))
    # Weibull como potencia de una exponencial: con X ~ E(1), P(alpha X^{1/c} > t) =
    # P(X > (t/alpha)^c) = e^{-(t/alpha)^c}, que tiene que ser la cola de la densidad de Wei(c, alpha).
    f_wei = lambda x: (c / al) * (x / al) ** (c - 1) * mp.e ** (-(x / al) ** c)
    assert cerca(mp.quad(f_wei, [t, mp.inf]), mp.e ** (-((t / al) ** c)), mp.mpf("1e-15"))
    # Rayleigh al cuadrado: P(X^2 > s) = P(X > sqrt(s)), integrando la densidad de Ray(sigma),
    # es e^{-s/(2 sigma^2)}, la cola de una exponencial de intensidad 1/(2 sigma^2).
    sg, s = mp.mpf("1.3"), mp.mpf("2.1")
    f_ray = lambda x: x / sg**2 * mp.e ** (-x * x / (2 * sg * sg))
    assert cerca(mp.quad(f_ray, [mp.sqrt(s), mp.inf]), mp.e ** (-s / (2 * sg * sg)), mp.mpf("1e-15"))
    # Cauchy: los cuartiles son x0 -+ gamma, el rango intercuartílico 2 gamma.
    x0, g = mp.mpf("1.5"), mp.mpf("0.8")
    F_cau = lambda x: mp.mpf(1) / 2 + mp.atan((x - x0) / g) / mp.pi
    assert cerca(F_cau(x0 + g), mp.mpf(3) / 4) and cerca(F_cau(x0 - g), mp.mpf(1) / 4)
    # Beta y estadísticos de orden: P(U_(k) <= x) = P(B(n, x) >= k) = I_x(k, n-k+1).
    for k, n, x in [(2, 5, mp.mpf("0.3")), (4, 6, mp.mpf("0.55"))]:
        orden = sum(mp.binomial(n, j) * x**j * (1 - x) ** (n - j) for j in range(k, n + 1))
        assert cerca(orden, mp.betainc(k, n - k + 1, 0, x, regularized=True), mp.mpf("1e-25"))
    # Pareto condicionada: P(X > s | X > t) = (t/s)^alpha.
    m, a, t, s = mp.mpf(2), mp.mpf("2.5"), mp.mpf(3), mp.mpf(7)
    assert cerca((m / s) ** a / (m / t) ** a, (t / s) ** a)

    return {
        "exponencial": [coma(100 * e1, 1) + " %", coma(e1, 3)],
        "normal": [coma(v, 3) for v in dentro],
        "t": [coma(v, 3) for v in t975] + [coma(z975, 3)],
        "pareto": [coma(a8020, 2)],
        "rayleigh": [coma(media_ray, 2)],
        "geometrica": ["6 tiradas"],
        "chi2": ["media 2"],
    }


def main() -> int:
    datos = {
        "univariadas": casos_discretos() + casos_continuos(),
        "multinomial": casos_multinomial(),
        "bivariada": casos_bivariada(),
        "tips": numeros_de_los_tips(),
    }
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(datos, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    n = sum(len(c["puntos"]) * 2 + len(c["cuantiles"]) + 2 for c in datos["univariadas"])
    print(f"distribuciones: {len(datos['univariadas'])} casos univariados ({n} valores), "
          f"{len(datos['multinomial'])} multinomiales y {len(datos['bivariada'])} bivariados.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
