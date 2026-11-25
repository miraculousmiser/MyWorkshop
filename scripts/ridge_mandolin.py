"""Offline mandolin samples from the Philharmonia's Strings.zip archive."""

from zipfile import ZipFile

import miniaudio
import numpy as np

from bluegrass_strings import RATE

# MIDI note: (archive note name, start in milliseconds, measured tuning in cents).
# The markers skip the silence and handling noise before each recorded attack.
SOFT_PLUCKS = {
    55: ("G3", 225, 6), 57: ("A3", 224, 17), 59: ("B3", 253, 8),
    62: ("D4", 192, -5), 64: ("E4", 195, 6), 66: ("Fs4", 195, 4),
    67: ("G4", 223, 2), 69: ("A4", 322, 6), 71: ("B4", 195, 25),
    72: ("C5", 190, 31), 74: ("D5", 192, 31), 76: ("E5", 349, 5),
    78: ("Fs5", 194, 12), 79: ("G5", 192, 9),
}
# Stop before the second stroke so these can also be played as single accents.
FIRM_STROKES = {
    55: ("G3", 188, 2, 266), 67: ("G4", 186, -13, 261),
    69: ("A4", 314, 5, 406), 74: ("D5", 292, 23, 380),
    81: ("A5", 192, 11, 260),
}
SOFT_TREMOLOS = {66: ("Fs4", 715, 4), 71: ("B4", 721, 25)}


def load_sample(archive, entries, markers, articulation, level_window):
    name, start_ms, cents, *end_ms = markers
    filename = f"mandolin_{name}_very-long_{articulation}.mp3"
    data = miniaudio.decode(archive.read(entries[filename]), miniaudio.SampleFormat.FLOAT32, 1, RATE)
    start = round(start_ms * RATE / 1000)
    end = round(end_ms[0] * RATE / 1000) if end_ms else len(data.samples)
    signal = np.asarray(data.samples)[start:end].copy()
    signal -= signal.mean()
    attack = round(.004 * RATE)
    signal[:attack] *= np.linspace(0, 1, attack, dtype=np.float32)
    level = np.sqrt(np.mean(signal[:round(level_window * RATE)] ** 2))
    return signal * (.16 / level), cents


def play_sample(bank, note, seconds, release):
    root = min(bank, key=lambda pitch: abs(note - pitch))
    samples, cents = bank[root]
    step = 2 ** ((note - root - cents / 100) / 12)
    frames = min(round((seconds + release) * RATE), int((len(samples) - 1) / step))
    positions = np.arange(frames) * step
    indices = positions.astype(int)
    signal = samples[indices] + (positions - indices) * (samples[indices + 1] - samples[indices])
    fade = min(round(release * RATE), frames)
    signal[-fade:] *= np.linspace(1, 0, fade) ** 2
    return signal.astype(np.float32)


class RidgeMandolin:
    def __init__(self, archive_path):
        with ZipFile(archive_path) as archive:
            # Support the strings bundle and the smaller mandolin ZIP inside it.
            entries = {entry.rsplit("/", 1)[-1]: entry for entry in archive.namelist()}
            self.soft = {note: load_sample(archive, entries, markers, "piano_normal", .115)
                         for note, markers in SOFT_PLUCKS.items()}
            self.firm = {note: load_sample(archive, entries, markers, "forte_tremolo", .045)
                         for note, markers in FIRM_STROKES.items()}
            self.soft_tremolo = {note: load_sample(archive, entries, markers, "piano_tremolo", .23)
                                 for note, markers in SOFT_TREMOLOS.items()}
            self.firm_tremolo = {67: load_sample(archive, entries, FIRM_STROKES[67][:3], "forte_tremolo", .23)}

    def pluck(self, note, seconds, touch):
        ring = play_sample(self.soft, note, seconds, .16)
        if touch >= .78:
            # Bring a separately recorded firm pick into focus and let the soft take ring out.
            stroke = self.chop(note)
            blend = np.linspace(.13, 1, len(stroke), dtype=np.float32) ** 1.4
            ring[:len(stroke)] = ring[:len(stroke)] * blend + stroke * (1 - blend)
        return ring

    def chop(self, note):
        return play_sample(self.firm, note, .051, .021)

    def tremolo(self, note, seconds, firm):
        bank = self.firm_tremolo if firm else self.soft_tremolo
        return play_sample(bank, note, seconds, .27)
