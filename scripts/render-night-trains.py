"""Render Night Trains to public/audio/night-trains.mp3.

Authoring only: python -m pip install numpy lameenc
"""

from pathlib import Path

import numpy as np
from listening_audio import write_mp3


RATE = 44100
BEAT = 60 / 78
BAR = 4 * BEAT
TAU = 2 * np.pi
FRAMES = round((48 * BAR + 4) * RATE)

# The bass register and the upper voicing are separated to keep the mix open.
CHORDS = {
    "Bm9": (35, (54, 57, 61, 62)),
    "Gmaj7": (31, (54, 55, 59, 62)),
    "Dmaj9": (38, (54, 57, 61, 64)),
    "Aadd9": (33, (52, 57, 59, 61)),
    "Em9": (40, (55, 59, 62, 66)),
    "F#sus": (30, (54, 59, 61, 64)),
    "F#7": (30, (54, 58, 61, 64)),
}

# Each bar of the lead lists (beat, MIDI note, length in beats).
WINDOW = [
    [(0.5, 66, 1), (2, 69, .55), (2.75, 73, 1.3)],
    [(1, 71, .8), (2.5, 66, .8)],
    [(0.5, 69, 1.1), (2.5, 64, .65), (3.25, 66, .72)],
    [(1, 61, 1.6)],
    [(0.5, 66, .7), (1.5, 69, .7), (2.75, 74, 1.1)],
    [(0, 73, .75), (1, 71, 1.4), (3, 66, .55)],
    [(0.5, 69, 1.4), (2.75, 73, .6)],
    [(0, 71, .8), (1.25, 69, .6), (2.5, 64, 1.0)],
]
SIGNAL = [
    [(0, 67, .8), (1.25, 71, .6), (2.25, 74, .8), (3.5, 78, .48)],
    [(0.5, 76, .65), (1.5, 74, .65), (2.5, 71, 1.2)],
    [(0, 69, .5), (0.75, 73, .55), (1.5, 76, 1.7)],
    [(0, 73, .9), (1.75, 71, .58), (2.75, 70, 1.05)],
    [(0.5, 66, .65), (1.5, 71, .75), (2.75, 78, 1.1)],
    [(0, 76, .65), (1.5, 74, .65), (2.75, 71, 1.0)],
    [(0.5, 73, 1.25), (2.5, 76, .55), (3.25, 78, .7)],
    [(0.5, 73, .65), (1.5, 71, .65), (2.75, 70, 1.1)],
]
ARRIVAL = [
    [(0.5, 78, 1.9), (3, 76, 1.2)],
    [(0.5, 74, 1.5), (2.75, 71, .7)],
    [(0, 73, 1.35), (2.5, 69, .8)],
    [(0.75, 71, 1.25), (3, 69, .8)],
    [(0.75, 66, 1.3), (3, 69, .7)],
    [(0.5, 71, 2.15)],
    [(1.25, 73, 1.0), (2.75, 69, 1.2)],
    [(0.5, 66, 1.65)],
]


def progression(bar):
    if bar < 16:
        return ("Bm9", "Gmaj7", "Dmaj9", "Aadd9")[bar % 4]
    if bar < 32:
        return ("Em9", "Gmaj7", "Dmaj9", "F#7" if bar % 8 == 7 else "F#sus")[bar % 4]
    return ("Dmaj9", "Gmaj7", "Bm9", "Aadd9",
            "Bm9", "Gmaj7", "Dmaj9", "Bm9")[(bar - 32) % 8]


def timeline(length):
    return np.arange(round(length * RATE), dtype=np.float32) / RATE


def hz(note):
    return 440 * 2 ** ((note - 69) / 12)


def articulation(t, attack, hold, release):
    return np.clip(t / attack, 0, 1) * np.clip((hold + release - t) / release, 0, 1)


def piano(note, hold, bright):
    t = timeline(hold + 1.45)
    p = TAU * hz(note) * t
    fm = (0.7 if bright else 0.37) * np.exp(-t * 3.5) * np.sin(p * 2.002)
    body = np.sin(p + fm) * np.exp(-t * 1.45)
    tine = np.sin(p * 2.011) * np.exp(-t * 3.25) * (0.25 if bright else 0.16)
    dust = np.sin(p * 6.987) * np.exp(-t * 31) * 0.07
    return (body + tine + dust) * articulation(t, 0.013, hold, 1.45)


def pad(note, hold):
    t = timeline(hold + 1.85)
    p = TAU * hz(note) * t
    tremolo = 0.85 + 0.15 * np.sin(TAU * 0.34 * t + note)
    blend = 0.55 * np.sin(p) + 0.33 * np.sin(p * 1.003) + 0.12 * np.sin(p * 2.001)
    return blend * tremolo * articulation(t, 0.68, hold, 1.85)


def bass(note, hold):
    t = timeline(hold + 0.21)
    phase = TAU * hz(note) * t
    return (np.sin(phase) + 0.15 * np.sin(phase * 2)) * np.exp(-t * 1.4) * articulation(t, 0.036, hold, 0.21)


def lay(stereo, start, signal, volume, pan=0.0):
    first = round(start * RATE)
    last = min(first + len(signal), len(stereo))
    if first >= last:
        return
    gains = (np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4))
    stereo[first:last] += signal[:last - first, None] * (volume * np.array(gains, dtype=np.float32))


def render(output):
    rng = np.random.default_rng(571)
    mix = np.zeros((FRAMES, 2), dtype=np.float32)
    keys = np.zeros_like(mix)
    t = timeline(0.36)
    drum = np.sin(TAU * (47 * t + 2.9 * (1 - np.exp(-t * 24)))) * np.exp(-t * 15)
    drum *= articulation(t, 0.009, 0.27, 0.09)
    t = timeline(0.14)
    grain = rng.uniform(-1, 1, len(t))
    click = (0.7 * grain + 0.3 * np.sin(TAU * 990 * t)) * np.exp(-t * 40) * articulation(t, .006, .11, .03)

    for bar in range(48):
        start = bar * BAR
        root, voicing = CHORDS[progression(bar)]
        station = bar // 16
        exit_fade = min(1.0, (48 - bar) / 5)
        pattern = (WINDOW, SIGNAL, ARRIVAL)[station][bar % 8]
        for index, note in enumerate(voicing):
            lay(mix, start + index * 0.055, pad(note - (12 if index % 2 == 0 else 0), BAR - .15),
                (0.105 if station == 2 else 0.086) * exit_fade, (index - 1.5) * .34)
            if bar < 44 or index % 2 == 0:
                offset = (0, .78, 1.98, 3.2)[index]
                softness = 0.089 if bar % 4 == 0 else .073
                lay(keys, start + offset * BEAT, piano(note, .63, False),
                    softness * exit_fade, (index - 1.5) * .19)

        for index, (beat, note, held) in enumerate(pattern):
            # The opening bars make room for the pulse before stating the motif.
            if bar < 2 and index > 0:
                continue
            timing = rng.uniform(.004, .029)
            strength = (0.19 if station == 1 else 0.175) * (0.84 + 0.14 * rng.random())
            lay(keys, start + beat * BEAT + timing, piano(note, held * BEAT, station == 1),
                strength * max(.47, exit_fade), (-0.09, 0.15, -0.18)[index % 3])
            if station == 1 and bar % 4 == 0 and index == 0:
                lay(keys, start + (beat + 0.015) * BEAT, piano(note + 12, held * BEAT, False), 0.055, 0.42)

        if bar < 45:
            lay(mix, start, bass(root, 1.7 * BEAT), 0.17 * exit_fade)
            if bar >= 3:
                lay(mix, start + (2.5 if station == 1 else 2.0) * BEAT, bass(root + 7, .8 * BEAT), 0.1 * exit_fade)

        if 2 <= bar < 44:
            for beat in ((0, 2.5) if station == 1 else (0, 2)):
                lay(mix, start + beat * BEAT, drum, (0.20 if station == 1 else 0.139) * exit_fade)
            for step in range(8):
                beat = step / 2 + (0.05 if step % 2 else 0)
                volume = (0.051 if step in (2, 6) else 0.027) * exit_fade * rng.uniform(.7, 1.1)
                lay(mix, start + beat * BEAT, click, volume, -.48 if step % 2 else .35)

    # Reflections of the keys spill across the stereo field like passing lights.
    mix += keys
    for delay, gain in [(0.112, .16), (0.49 * BEAT, .23), (1.49 * BEAT, .12), (2.48 * BEAT, .06)]:
        offset = round(delay * RATE)
        mix[offset:, 0] += keys[:-offset, 1] * gain
        mix[offset:, 1] += keys[:-offset, 0] * gain * .92
    del keys

    # A low, synthesized rail texture swells underneath the middle movement.
    time = np.arange(FRAMES, dtype=np.float32) / RATE
    low_noise = rng.uniform(-1, 1, FRAMES // 65 + 2).astype(np.float32)
    rumble = np.interp(time, np.arange(len(low_noise)) * 65 / RATE, low_noise)
    motion = 0.48 + 0.52 * (0.5 + 0.5 * np.sin(TAU * 2 / BEAT * time - 0.4)) ** 2
    swell = 0.55 + 0.45 * np.exp(-((time - 71) / 37) ** 2)
    texture = ((rumble * 0.033 + np.sin(TAU * 44.5 * time) * 0.012) * motion * swell).astype(np.float32)
    mix[:, 0] += texture * .92
    mix[:, 1] += texture * 1.08

    fade_in = round(RATE * 1.05)
    fade_out = round(RATE * 4.3)
    mix[:fade_in] *= np.linspace(0, 1, fade_in, dtype=np.float32)[:, None]
    mix[-fade_out:] *= np.linspace(1, 0, fade_out, dtype=np.float32)[:, None] ** 2
    mix = np.tanh(mix * 2.3)
    mix *= 0.84 / np.max(np.abs(mix))

    write_mp3(output, [mix], RATE)
    starts = [round(bar * BAR * RATE) for bar in (0, 16, 32)] + [FRAMES]
    for index, slug in enumerate(("window-seat", "passing-signal", "before-the-name")):
        piece = mix[starts[index]:starts[index + 1]].copy()
        # Avoid a click at the edit when a movement is played on its own.
        edge = round(.025 * RATE)
        ramp = np.linspace(0, 1, edge, dtype=np.float32)[:, None]
        if index > 0:
            piece[:edge] *= ramp
        if index < 2:
            piece[-edge:] *= ramp[::-1]
        write_mp3(output.parent / "tracks" / f"{slug}.mp3", [piece], RATE)

    rms = 20 * np.log10(np.sqrt(np.mean(mix ** 2)))
    print(f"{output.name}: {FRAMES / RATE:.2f} s stereo, {rms:.1f} dBFS RMS, {output.stat().st_size:,} bytes")
    print("Movement starts:", ", ".join(f"{bar * BAR:.3f}s" for bar in (0, 16, 32)))


if __name__ == "__main__":
    render(Path(__file__).resolve().parents[1] / "public" / "audio" / "night-trains.mp3")
