"""Encode stereo PCM for the Listening Room authoring scripts."""

import lameenc


def write_mp3(output, blocks, rate):
    output.parent.mkdir(parents=True, exist_ok=True)
    encoder = lameenc.Encoder()
    encoder.set_bit_rate(160)
    encoder.set_in_sample_rate(rate)
    encoder.set_channels(2)
    encoder.set_quality(2)
    with output.open("wb") as recording:
        for samples in blocks:
            for first in range(0, len(samples), rate):
                pcm = (samples[first:first + rate] * 32767).astype("<i2")
                recording.write(encoder.encode(pcm.tobytes()))
        recording.write(encoder.flush())
