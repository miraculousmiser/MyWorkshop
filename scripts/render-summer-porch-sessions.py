"""Render two original, unhurried bluegrass instrumentals."""

from pathlib import Path

import numpy as np
from bluegrass_strings import RATE, TAU, lay, pluck
from listening_audio import write_mp3

# Each chord lists an upright bass root and fifth, then a guitar voicing.
CHORDS = {
    "D": (38, 45, (57, 62, 66, 69)),
    "G": (43, 38, (55, 59, 62, 67)),
    "A": (45, 40, (57, 61, 64, 69)),
    "Bm": (47, 42, (54, 59, 62, 66)),
    "Em7": (40, 47, (55, 59, 62, 64)),
    "Cadd9": (48, 43, (55, 60, 62, 64)),
}

LANTERN_HARMONY = ("D", "G", "Bm", "A", "D", "G", "A", "D")
STARS_HARMONY = ("G", "Em7", "Cadd9", "D", "G", "Cadd9", "D", "G")
# Beat offsets, MIDI notes, and note lengths in beats.
LANTERN = (
    ((.1, 69, .62), (.82, 74, .60), (1.60, 78, .78), (2.68, 76, .85)),
    ((0, 74, 1.35), (1.81, 71, .46), (2.60, 69, .81)),
    ((.12, 66, .73), (1.01, 71, .70), (2.14, 74, .57), (2.89, 78, .91)),
    ((.1, 76, 1.28), (2.10, 73, .57), (2.91, 69, .76)),
    ((.2, 69, .66), (1.1, 74, .90), (2.45, 78, 1.17)),
    ((0, 79, .75), (1.06, 78, .63), (2.21, 74, 1.32)),
    ((0, 73, .88), (1.35, 71, .60), (2.31, 69, 1.32)),
    ((.15, 74, 1.92),),
)
STARS = (
    ((.65, 67, 1.28), (2.44, 71, 1.21)),
    ((.1, 76, 1.46), (2.5, 74, .88)),
    ((.2, 72, 1.66), (2.77, 67, .84)),
    ((1.03, 69, .92), (2.56, 66, 1.21)),
    ((.68, 67, 1.08), (2.3, 71, 1.34)),
    ((.1, 72, 1.62), (2.53, 76, 1.1)),
    ((.33, 74, 1.22), (2.02, 69, 1.13)),
    ((.2, 67, 2.21),),
)


def fiddle(note, duration, rng):
    release = .32
    t = np.arange(round((duration + release) * RATE), dtype=np.float32) / RATE
    pitch = 440 * 2 ** ((note - 69) / 12)
    # A gentle slide into the pitch, then vibrato takes a moment to develop.
    settle = -.49 * (1 - np.exp(-19 * t))
    vibrato = .125 * np.sin(TAU * rng.uniform(4.5, 5.0) * t) * np.clip((t - .27) / .65, 0, 1)
    phase = TAU * pitch * t + settle + vibrato
    tone = np.zeros_like(t)
    for harmonic, weight in enumerate((1, .43, .30, .19, .12, .079, .044, .027), 1):
        tone += weight * np.sin(harmonic * phase + (.25 if harmonic % 2 else -.2))
    rise = np.sin(np.clip(t / .18, 0, 1) * np.pi / 2) ** 2
    fall = np.clip((duration + release - t) / release, 0, 1) ** 2
    bow = .93 + .07 * np.sin(TAU * .51 * t + 1.1)
    return tone * rise * fall * bow


def mix_song(melody, harmony, bpm, bars, seconds, rng, *, swing):
    beat = 60 / bpm
    audio = np.zeros((seconds * RATE, 2), dtype=np.float32)
    strings = np.zeros_like(audio)

    for bar in range(bars):
        start = bar * 4 * beat
        phrase_bar = bar % len(melody)
        final = bar == bars - 1
        closing = bar >= bars - 4
        chord = harmony[-1] if final else harmony[phrase_bar]
        root, fifth, voicing = CHORDS[chord]
        energy = np.interp(bar, [0, 4, bars // 2, bars - 5, bars - 1], [.73, .92, 1, .83, .64])

        picking = [(0, root), (.60, voicing[0]), (1.29, voicing[1]), (1.78, voicing[2]),
                   (2, fifth), (2.62, voicing[1]), (3.30, voicing[2]), (3.77, voicing[3])]
        if not swing:
            picking = [(0, root), (.63, voicing[1]), (1.21, voicing[2]), (2.05, fifth),
                       (2.65, voicing[0]), (3.32, voicing[2])]
        if final:
            picking = [(0, root), (.19, voicing[0]), (.34, voicing[1]), (.52, voicing[2]), (.69, voicing[3])]
        for offset, note in picking:
            volume = .17 if note in (root, fifth) else .118
            lay(strings, start + offset * beat + rng.uniform(.006, .022),
                pluck(note, 1.5 if final else .82, "guitar", rng), volume * energy, -.43)

        if 2 <= bar < bars - 1:
            lay(audio, start + .014, pluck(root - 12, .75, "bass", rng), .165 * energy, .02)
            lay(audio, start + beat * 2.03, pluck(fifth - 12, .63, "bass", rng), .134 * energy, .03)

        if swing and 3 <= bar < bars - 4:
            # Just a few soft syncopations leave the arrangement open.
            for at, note in ((1.53, voicing[2]), (2.38, voicing[1]), (3.53, voicing[3])):
                if phrase_bar in (1, 5) or at == 3.53:
                    lay(strings, start + at * beat, pluck(note, .34, "banjo", rng), .09 * energy, .47)

        if bar < 2:
            continue
        phrase = melody[phrase_bar]
        if final:
            phrase = ((.24, 74 if swing else 67, 1.62),)

        for note_index, (at, note, length) in enumerate(phrase):
            touch = .82 if note_index == 0 else .70 + .10 * rng.random()
            position = start + at * beat + rng.uniform(.007, .026)
            if not swing and (8 <= bar < 20 or phrase_bar in (1, 5)):
                lay(strings, position, fiddle(note, length * beat, rng), .15 * touch * energy, .33)
                if at == phrase[0][0] and not closing:
                    lay(strings, position + .10, pluck(note - 12, .58, "mandolin", rng), .12 * energy, -.08)
            else:
                lay(strings, position, pluck(note, length * beat, "mandolin", rng),
                    (.33 if swing else .268) * touch * energy, .07)

        if swing and 8 <= bar < bars - 4 and phrase_bar in (1, 3, 5, 7):
            answer = voicing[1] if phrase_bar == 7 else voicing[2]
            lay(strings, start + 2.05 * beat, fiddle(answer, 1.12 * beat, rng), .083 * energy, .34)

    audio += strings
    for delay, gain in ((.038, .16), (.081, .10), (.169, .062)):
        sample = round(delay * RATE)
        audio[sample:] += gain * strings[:-sample, ::-1]
    edge = round(.12 * RATE)
    audio[:edge] *= np.linspace(0, 1, edge, dtype=np.float32)[:, None]
    edge = round(2.3 * RATE)
    audio[-edge:] *= np.linspace(1, 0, edge, dtype=np.float32)[:, None]
    audio = np.tanh(audio * 1.28)
    audio *= min(.76 / np.abs(audio).max(), .126 / np.sqrt(np.mean(audio ** 2)))
    return audio


if __name__ == "__main__":
    directory = Path(__file__).resolve().parents[1] / "public" / "audio"
    pieces = [
        ("lantern-swing", mix_song(LANTERN, LANTERN_HARMONY, 72, 24, 82, np.random.default_rng(273), swing=True)),
        ("one-more-under-the-stars", mix_song(STARS, STARS_HARMONY, 66, 28, 105, np.random.default_rng(746), swing=False)),
    ]
    for slug, song in pieces:
        write_mp3(directory / "tracks" / f"{slug}.mp3", [song], RATE)
        rms = 20 * np.log10(np.sqrt(np.mean(song ** 2)))
        print(f"{slug}: {len(song) / RATE:.0f}s stereo, {rms:.1f} dBFS RMS")
    write_mp3(directory / "summer-porch-sessions.mp3", (song for _, song in pieces), RATE)
