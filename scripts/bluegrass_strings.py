"""Digital string voices used by the Workshop's bluegrass recordings."""

import numpy as np

RATE = 44_100
TAU = 2 * np.pi


def pluck(note, held, instrument, rng):
    release = {"mandolin": .24, "guitar": .52, "banjo": .24, "bass": .29}[instrument]
    time = np.arange(round((held + release) * RATE), dtype=np.float32) / RATE
    pitch = 440 * 2 ** ((note - 69) / 12)
    phase = TAU * pitch * time
    width = rng.uniform(.0017, .0031)
    tone = np.zeros_like(time)

    if instrument == "mandolin":
        # Paired courses beat gently against each other. The pick favors upper partials
        # at the start of the note, and the body keeps the decay warm.
        partials = (1, .56, .32, .29, .14, .11, .075, .050, .033)
        for harmonic, gain in enumerate(partials, 1):
            decay = np.exp(-(1.8 + harmonic ** 1.38 * .57) * time)
            struck = np.sin(phase * harmonic)
            paired = np.sin(phase * harmonic * (1 + width) + .23 * harmonic)
            tone += gain * decay * (.57 * struck + .43 * paired)
        tick = .043 * np.sin(TAU * 2180 * time) * np.exp(-140 * time)
        tone += tick
    elif instrument == "guitar":
        for harmonic, gain in enumerate((1, .44, .27, .14, .085, .057), 1):
            tone += gain * np.sin(phase * harmonic + .13 * harmonic) * np.exp(-(1.2 + .6 * harmonic) * time)
    elif instrument == "banjo":
        for harmonic, gain in enumerate((1, .38, .32, .22, .16, .093, .064), 1):
            tone += gain * np.sin(phase * harmonic + .11 * harmonic) * np.exp(-(3.0 + 1.05 * harmonic) * time)
        tone += .08 * np.sin(TAU * 835 * time) * np.exp(-49 * time)
    else:
        tone = (np.sin(phase) + .25 * np.sin(phase * 2) + .077 * np.sin(phase * 3)) * np.exp(-1.48 * time)

    attack = .0055 if instrument in ("mandolin", "banjo") else .012
    rise = np.sin(np.clip(time / attack, 0, 1) * np.pi / 2)
    fall = np.clip((held + release - time) / release, 0, 1) ** 2
    return tone * rise * fall


def lay(stereo, start, signal, volume, pan):
    first = round(start * RATE)
    last = min(first + len(signal), len(stereo))
    gains = np.array([np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)], dtype=np.float32)
    stereo[first:last] += signal[:last - first, None] * volume * gains
