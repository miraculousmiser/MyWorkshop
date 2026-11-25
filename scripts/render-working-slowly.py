"""Render Three Songs for Working Slowly. Requires NumPy and lameenc."""

from pathlib import Path

import numpy as np
from listening_audio import write_mp3

RATE = 44_100
TAU = 2 * np.pi

# The bass note comes first. The remaining notes are the upper voicing.
E_ADD9 = (40, 59, 64, 66, 68)
A_MAJ7 = (45, 57, 61, 64, 68)
C_SHARP_MINOR = (37, 56, 59, 61, 64)
B_SUS = (47, 59, 61, 64, 66)
D_MINOR9 = (38, 57, 60, 64, 65)
G6 = (43, 55, 59, 62, 64)
F_MAJ7 = (41, 57, 60, 64, 65)
A_MINOR7 = (45, 55, 57, 60, 64)
A_ADD9 = (45, 57, 61, 64, 71)
D_MAJ9 = (38, 57, 61, 64, 66)
F_SHARP_MINOR = (42, 57, 61, 64, 68)
E_SUS = (40, 59, 64, 66, 69)


def voice(note, held, kind):
    release = {"felt": 1.6, "mallet": 0.9, "nylon": 1.2, "reed": 1.4, "bass": 0.35}[kind]
    time = np.arange(round((held + release) * RATE), dtype=np.float32) / RATE
    phase = TAU * 440 * 2 ** ((note - 69) / 12) * time
    attack = 0.27 if kind == "reed" else 0.013
    envelope = np.clip(time / attack, 0, 1) * np.clip((held + release - time) / release, 0, 1)

    if kind == "felt":
        tone = (np.sin(phase) * np.exp(-1.50 * time)
                + 0.29 * np.sin(phase * 2.003) * np.exp(-3.8 * time)
                + 0.13 * np.sin(phase * 3.012) * np.exp(-6.5 * time)
                + 0.042 * np.sin(phase * 8.7) * np.exp(-47 * time))
    elif kind == "mallet":
        tone = (np.sin(phase) * np.exp(-2.75 * time)
                + 0.35 * np.sin(phase * 4.005) * np.exp(-15 * time)
                + 0.12 * np.sin(phase * 9.17) * np.exp(-27 * time))
    elif kind == "nylon":
        tone = (np.sin(phase) * np.exp(-1.55 * time)
                + 0.38 * np.sin(phase * 2) * np.exp(-2.55 * time)
                + 0.21 * np.sin(phase * 3) * np.exp(-4.0 * time)
                + 0.075 * np.sin(phase * 5) * np.exp(-9.2 * time))
    elif kind == "reed":
        sway = 0.1 * np.sin(TAU * 4.1 * time) * np.clip(time - .23, 0, .85)
        tone = 0.89 * np.sin(phase + sway) + .11 * np.sin(2 * phase + sway)
    else:
        tone = (np.sin(phase) + 0.18 * np.sin(phase * 2)) * np.exp(-1.6 * time)
    return tone * envelope


def add(stereo, time, signal, gain, pan):
    start = round(time * RATE)
    end = min(start + len(signal), len(stereo))
    if start < end:
        angle = (pan + 1) * np.pi / 4
        pair = np.array([np.cos(angle), np.sin(angle)], dtype=np.float32)
        stereo[start:end] += signal[:end - start, None] * gain * pair


def reflective_room(dry, taps):
    stereo = dry.copy()
    for delay, gain in taps:
        offset = round(delay * RATE)
        stereo[offset:] += dry[:-offset, ::-1] * np.array([gain, gain * 0.86], dtype=np.float32)
    return stereo


def finish(stereo):
    # Similar levels between tracks with room left for individual accents.
    fade_in = round(.07 * RATE)
    fade_out = round(.9 * RATE)
    stereo[:fade_in] *= np.linspace(0, 1, fade_in, dtype=np.float32)[:, None]
    stereo[-fade_out:] *= np.linspace(1, 0, fade_out, dtype=np.float32)[:, None]
    rms = np.sqrt(np.mean(stereo ** 2))
    stereo *= min(0.76 / np.abs(stereo).max(), 0.138 / rms)
    return stereo


def open_the_window():
    beat = 60 / 72
    stereo = np.zeros((62 * RATE, 2), dtype=np.float32)
    phrase = [
        [(0.5, 71), (1.5, 76), (2.75, 78)],
        [(0, 76), (2, 73), (3, 71)],
        [(0.75, 71), (2, 76), (3.25, 80)],
        [(0.5, 78), (2.5, 73)],
    ]
    for bar in range(18):
        start = bar * 4 * beat
        bass, *chord = (E_ADD9, A_MAJ7, C_SHARP_MINOR, B_SUS)[bar % 4] if bar < 16 else E_ADD9
        add(stereo, start, voice(bass, 1.9, "felt"), 0.33, -0.1)
        for index, note in enumerate(chord):
            add(stereo, start + (index * .68 + .12) * beat, voice(note, .85, "felt"), .14, (index - 1.4) * .24)
        if bar < 2:
            continue
        motif = phrase[bar % 4] if bar < 16 else ([(1.5, 71), (2.75, 76)] if bar == 16 else [(0, 76)])
        for index, (offset, note) in enumerate(motif):
            if 8 <= bar < 12 and index == len(motif) - 1:
                note -= 12
            add(stereo, start + offset * beat + .022, voice(note, 1.08, "felt"),
                .24 if index == 0 else .19, .21)
    return finish(reflective_room(stereo, [(0.073, .19), (0.177, .12), (.397, .09), (.91, .05)]))


def familiar_task():
    beat = 60 / 84
    stereo = np.zeros((54 * RATE, 2), dtype=np.float32)
    counter = ((0.5, 69), (1.5, 72), (2.5, 74))
    for bar in range(24):
        start = bar * 3 * beat
        bass, *chord = (D_MINOR9, G6, F_MAJ7, A_MINOR7)[bar % 4] if bar < 22 else D_MINOR9
        add(stereo, start + .03, voice(bass, 1.3, "bass"), .27, 0)
        for index, offset in enumerate((0.04, .81, 1.61)):
            note = chord[(index + (bar // 8)) % len(chord)]
            add(stereo, start + offset * beat, voice(note + (12 if index == 2 else 0), .52, "mallet"),
                .19 if index == 0 else .13, -.31 + index * .22)
        if 4 <= bar < 20:
            pick = counter[(bar // 2) % len(counter)]
            down = 2 if 8 <= bar < 12 else 0
            add(stereo, start + pick[0] * beat, voice(pick[1] - down, .76, "nylon"), .20, .39)
            if bar % 4 == 2:
                add(stereo, start + 2.38 * beat, voice(76, .43, "nylon"), .12, .18)
        if bar % 4 == 3 and bar < 20:
            add(stereo, start + 2.68 * beat, voice(bass + 12, .25, "bass"), .11, 0)
    return finish(reflective_room(stereo, [(0.061, .13), (.183, .12), (beat * 0.75, .10)]))


def leave_room():
    beat = 60 / 68
    stereo = np.zeros((60 * RATE, 2), dtype=np.float32)
    line = [
        [(1, 76, 2.0)],
        [(0.5, 78, 1.25), (2.5, 76, 1.0)],
        [(1.5, 73, 2.1)],
        [(0.75, 71, 2.0)],
        [(0.5, 76, 1.65), (2.75, 81, 1.1)],
        [(1, 78, 1.8)],
        [(0.75, 76, 1.15), (2.6, 73, 1.3)],
        [(0.5, 71, 1.4), (2.25, 69, 1.5)],
    ]
    for bar in range(16):
        start = bar * 4 * beat
        bass, *chord = (A_ADD9, D_MAJ9, F_SHARP_MINOR, E_SUS)[bar % 4] if bar < 15 else A_ADD9
        plucks = [(0, bass), (.62, chord[0]), (1.31, chord[1]), (2.1, chord[2]), (3.27, chord[3])]
        if bar == 15:
            plucks = [(0, bass), (.15, chord[0]), (.29, chord[1]), (.41, chord[2]), (.54, 69)]
        for index, (offset, note) in enumerate(plucks):
            light = .85 if bar >= 13 else 1
            add(stereo, start + offset * beat, voice(note, 1.35 if bar == 15 else .87, "nylon"),
                (.27 if index == 0 else .18) * light, (-.17, -.29, -.08, .13, .23)[index])
        if 2 <= bar < 15:
            for offset, note, length in line[bar % 8]:
                add(stereo, start + offset * beat, voice(note, length * beat, "reed"), .116, .28)
    return finish(reflective_room(stereo, [(0.088, .18), (.22, .11), (.47, .085), (.82, .055)]))


def main():
    output = Path(__file__).resolve().parents[1] / "public" / "audio" / "three-songs-for-working-slowly.mp3"
    start = 0

    def songs():
        nonlocal start
        for slug, synthesize in [
            ("open-the-window", open_the_window),
            ("a-familiar-task", familiar_task),
            ("leave-a-little-room", leave_room),
        ]:
            song = synthesize()
            print(f"{slug}: starts at {start:.0f}s, {len(song) / RATE:.0f}s, "
                  f"{20 * np.log10(np.sqrt(np.mean(song ** 2))):.1f} dBFS RMS")
            start += len(song) / RATE
            write_mp3(output.parent / "tracks" / f"{slug}.mp3", [song], RATE)
            yield song

    write_mp3(output, songs(), RATE)
    print(f"{output.name}: {start:.0f}s stereo, {output.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
