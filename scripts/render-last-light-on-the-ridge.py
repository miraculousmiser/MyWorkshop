"""Render Last Light on the Ridge with recorded acoustic mandolin."""

from argparse import ArgumentParser
from pathlib import Path

import numpy as np
from bluegrass_strings import RATE, lay, pluck
from listening_audio import write_mp3
from ridge_mandolin import RidgeMandolin

BEAT = 60 / 60
BAR = 4 * BEAT
LENGTH = 40 * BAR + 3

# Bass root and fifth, open-position guitar notes, and a quiet mandolin chop.
CHORDS = {
    "G": (43, 50, (55, 59, 62, 67), (55, 62, 71)),
    "Cadd9": (48, 43, (55, 60, 62, 64), (55, 62, 64)),
    "D": (50, 45, (57, 62, 66, 69), (57, 62, 66)),
    "Em7": (40, 47, (55, 59, 62, 64), (55, 59, 64)),
}
A_CHORDS = ("G", "Cadd9", "G", "D", "G", "Cadd9", "D", "G")
B_CHORDS = ("Em7", "Cadd9", "G", "D", "Em7", "Cadd9", "D", "G")

# Notes are given as (beat within the bar, MIDI note, length, touch).
A = (
    ((.50, 71, .72, .84), (1.5, 74, .45, .78), (2.25, 76, .52, .70), (3, 74, .90, .74)),
    ((0, 72, 1.05, .85), (1.75, 67, .55, .66), (2.5, 69, 1.17, .72)),
    ((.25, 71, 1.15, .83), (2, 67, .48, .62), (2.75, 69, .45, .68), (3.5, 71, .55, .73)),
    ((0, 69, 1.25, .80), (2.25, 66, .95, .66)),
    ((.5, 71, .75, .84), (1.5, 74, .50, .76), (2.25, 79, 1.25, .77)),
    ((.25, 76, 1.3, .74), (2, 74, .54, .65), (2.75, 72, .95, .72)),
    ((0, 69, .90, .79), (1.25, 66, .52, .65), (2, 69, .62, .72), (3.25, 74, .68, .74)),
    ((0, 67, 2.2, .76),),
)
B = (
    ((.25, 67, .75, .75), (1.25, 71, .72, .80), (2.5, 76, 1.3, .78)),
    ((.25, 76, .65, .72), (1.25, 74, .55, .68), (2.25, 72, 1.22, .74)),
    ((.5, 71, .85, .82), (2, 74, .58, .72), (2.85, 79, .90, .80)),
    ((0, 78, .83, .83), (1.25, 76, .55, .71), (2.5, 74, 1.08, .73)),
    ((0, 71, 1.08, .78), (1.7, 67, .53, .65), (2.75, 64, .85, .70)),
    ((.25, 67, .85, .75), (1.5, 69, .64, .70), (2.5, 72, 1.02, .75)),
    ((.25, 74, .85, .79), (1.5, 69, .55, .70), (2.75, 66, .85, .68)),
    ((0, 67, 1.75, .78), (.03, 71, 1.7, .42)),
)


def render(rng, mandolin):
    frame_count = round(LENGTH * RATE)
    guitar_track = np.zeros((frame_count, 2), dtype=np.float32)
    mandolin_track = np.zeros_like(guitar_track)
    bass_track = np.zeros_like(guitar_track)

    for bar in range(40):
        start = bar * BAR
        local = bar % 8
        bridge = 12 <= bar < 28
        root, fifth, guitar, chop = CHORDS["G" if bar == 39 else (B_CHORDS if bridge else A_CHORDS)[local]]
        energy = np.interp(bar, [0, 6, 12, 20, 28, 35, 39], [.73, .86, 1, .97, .84, .72, .62])

        # An unhurried boom-and-brush, with soft individual strings replacing hard strums.
        guitar_pattern = [(0, root), (.76, guitar[0]), (1.20, guitar[1]), (1.69, guitar[2]),
                          (2, fifth), (2.79, guitar[1]), (3.18, guitar[2]), (3.57, guitar[3])]
        if bar == 39:
            guitar_pattern = [(0, root), (.22, guitar[0]), (.43, guitar[1]), (.59, guitar[2]), (.77, guitar[3])]
        for index, (at, note) in enumerate(guitar_pattern):
            accent = .155 if index in (0, 4) else .091
            lay(guitar_track, start + at * BEAT + .008, pluck(note, 1.04 if bar == 39 else .72, "guitar", rng),
                accent * energy * rng.uniform(.90, 1.07), -.32 + (index % 3) * .04)

        if 2 <= bar < 39:
            bass_notes = [(0, root - 12), (2, fifth - 12)]
            if bridge and local in (2, 6):
                bass_notes[-1] = (2, root - 12)
            if local == 7 and bar < 34:
                bass_notes.append((3.38, 42))
            for at, note in bass_notes:
                lay(bass_track, start + at * BEAT + .014, pluck(note, .86 if at < 3 else .35, "bass", rng), .135 * energy, .03)

        if 5 <= bar < 34:
            for at in (1.04, 3.04):
                if local == 7 and at > 2:
                    continue
                for index, note in enumerate(chop):
                    lay(mandolin_track, start + at * BEAT + index * .014, mandolin.chop(note),
                        .062 * energy, .41)

        if bar < 2:
            continue
        phrase = (B if bridge else A)[local]
        if bar == 38:
            phrase = ((0, 74, .95, .72), (1.5, 69, .78, .61), (2.75, 66, .75, .65))
        if bar == 39:
            phrase = ((0, 67, 2.1, .71), (.045, 71, 1.8, .34))
        for at, note, length, touch in phrase:
            if bar in (15, 23) and at == 0:
                # Let the cadence grow from a gentle roll to a firmer recorded tremolo.
                lay(mandolin_track, start + at * BEAT, mandolin.tremolo(note, 1.10, firm=(bar == 23)),
                    .24 * touch * energy, .07)
            else:
                lay(mandolin_track, start + at * BEAT + rng.uniform(.009, .022),
                    mandolin.pluck(note, length * BEAT, touch), .56 * touch * energy, .08)

    mix = guitar_track + bass_track + mandolin_track
    for delay, guitar_gain, mandolin_gain in ((.032, .16, .09), (.067, .11, .055), (.119, .074, .027)):
        offset = round(delay * RATE)
        mix[offset:] += guitar_track[:-offset, ::-1] * guitar_gain
        mix[offset:] += mandolin_track[:-offset, ::-1] * mandolin_gain

    fade_samples = round(3.2 * RATE)
    mix[-fade_samples:] *= np.linspace(1, 0, fade_samples, dtype=np.float32)[:, None] ** 1.5
    mix = np.tanh(mix * 1.35)
    mix *= min(.78 / np.abs(mix).max(), .124 / np.sqrt(np.mean(mix ** 2)))
    return mix


if __name__ == "__main__":
    output = Path(__file__).resolve().parents[1] / "public" / "audio" / "tape-loop-at-dusk.mp3"
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path, help="Philharmonia Strings.zip or its inner mandolin.zip")
    parser.add_argument("--output", type=Path, default=output, help="Override the site's MP3 destination")
    args = parser.parse_args()
    audio = render(np.random.default_rng(461), RidgeMandolin(args.archive))
    write_mp3(args.output, [audio], RATE)
    rms_db = 20 * np.log10(np.sqrt(np.mean(audio ** 2)))
    peak_db = 20 * np.log10(np.max(np.abs(audio)))
    print(f"{args.output.name}: {len(audio) / RATE:.1f}s, 60 BPM, RMS {rms_db:.1f} dBFS, peak {peak_db:.1f} dBFS")
    print(f"Listening points: 0:00, {12 * BAR:.0f}s, {28 * BAR:.0f}s")
