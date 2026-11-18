import json
import math
import pathlib
import shutil
import subprocess
import tempfile
import wave
import imageio_ffmpeg
import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
SR = 44100

EP_ID = "ep01_jupiter_empire"
EP_DIR = ROOT / "episodes" / EP_ID
MANIFEST_PATH = EP_DIR / "manifest.json"
VIDEO_MP4 = ROOT / "douyin_jupiter_empire_9x16.mp4"
BGM_PIANO_MP3 = ROOT / "bgm_interstellar_piano.mp3"
BGM_COMPAT_MP3 = ROOT / "bgm_interstellar_cornfield.mp3"


def midi_to_hz(m: float) -> float:
    return 440.0 * (2.0 ** ((m - 69.0) / 12.0))


# Exact MIDI notes in A Minor (Hans Zimmer / Patrik Pietschmann - Interstellar Solo Concert Grand Piano)
N = {
    "E1": 28, "F1": 29, "G1": 31, "A1": 33, "B1": 35,
    "C2": 36, "D2": 38, "E2": 40, "F2": 41, "G2": 43, "A2": 45, "B2": 47,
    "C3": 48, "D3": 50, "E3": 52, "F3": 53, "G3": 55, "A3": 57, "B3": 59,
    "C4": 60, "D4": 62, "E4": 64, "F4": 65, "G4": 67, "A4": 69, "B4": 71,
    "C5": 72, "D5": 74, "E5": 76, "F5": 77, "G5": 79, "A5": 81, "B5": 83,
    "C6": 84, "D6": 86, "E6": 88,
}


def fft_convolve_stereo(dry: np.ndarray, ir: np.ndarray) -> np.ndarray:
    n_out = len(dry) + len(ir) - 1
    n_fft = 1 << (n_out - 1).bit_length()
    wet = np.zeros((len(dry), 2), dtype=np.float32)
    for ch in range(2):
        D = np.fft.rfft(dry[:, ch], n=n_fft)
        H = np.fft.rfft(ir[:, ch], n=n_fft)
        y = np.fft.irfft(D * H, n=n_fft)[:len(dry)]
        wet[:, ch] = y.astype(np.float32)
    return wet


def make_concert_hall_piano_ir(rt60: float = 2.85) -> np.ndarray:
    """Warm wooden Concert Hall (Musikverein style) stereo impulse response for Solo Steinway D."""
    n = int(rt60 * SR)
    t = np.arange(n, dtype=np.float32) / SR
    rng = np.random.default_rng(20261117)
    ir = np.zeros((n, 2), dtype=np.float32)

    # Warm wooden stage & sidewall early reflections (14ms - 92ms)
    early = [
        (0.015, 0.36, 0.20),
        (0.024, 0.19, 0.35),
        (0.039, 0.28, 0.16),
        (0.056, 0.15, 0.27),
        (0.078, 0.21, 0.19),
        (0.104, 0.14, 0.22),
    ]
    for delay_s, gl, gr in early:
        idx = int(delay_s * SR)
        if idx < n:
            ir[idx, 0] += gl
            ir[idx, 1] += gr

    decay = np.exp(-6.91 * t / rt60) * (1.0 - np.exp(-t / 0.028))
    k = np.array([0.10, 0.22, 0.36, 0.22, 0.10], dtype=np.float32)
    for ch in range(2):
        noise = rng.standard_normal(n).astype(np.float32)
        # 3-pass smoothing -> silky warm ~2.2 kHz wooden hall tail (zero metallic fizz!)
        smooth = np.convolve(noise, k, mode="same")
        smooth = np.convolve(smooth, k, mode="same")
        smooth = np.convolve(smooth, k, mode="same")
        ir[:, ch] += smooth * decay * 0.0175

    return ir


def render_steinway_d_note(midi_note: int, dur_s: float, vel: float = 0.80) -> tuple[np.ndarray, np.ndarray]:
    """
    Physically modeled Steinway Model D Concert Grand Piano note:
    - Weinreich two-stage soundboard decay (prompt bridge coupling + long singing sustain)
    - Stiff-string dispersion inharmonicity f_h = h * f0 * sqrt(1 + B * h^2)
    - 3-string trichord unison detuning (+/- 0.85 cents) with stereo soundboard spread
    - Soft felt-hammer transient & spruce soundboard body knock
    """
    freq = midi_to_hz(midi_note)
    n = int(dur_s * SR)
    t = np.arange(n, dtype=np.float32) / SR

    # Stiff-string inharmonicity coefficient B (higher in bass wound strings & high treble)
    if midi_note < 44:
        inharm_b = 0.00016
        tau_slow_base = 4.2
        tau_fast_base = 0.22
        max_h = 10
    elif midi_note < 68:
        inharm_b = 0.00022
        tau_slow_base = 2.6
        tau_fast_base = 0.15
        max_h = 8
    else:
        inharm_b = 0.00038
        tau_slow_base = 1.65
        tau_fast_base = 0.095
        max_h = 6

    # Smooth hammer-string contact attack (faster on forte, gentler felt cushion on piano)
    atk_tau = 0.0028 + 0.0038 * (1.0 - vel)
    atk = 1.0 - np.exp(-t / atk_tau)

    sig_l = np.zeros(n, dtype=np.float32)
    sig_r = np.zeros(n, dtype=np.float32)

    for h in range(1, max_h + 1):
        f_h = freq * h * math.sqrt(1.0 + inharm_b * (h * h))
        if f_h > 10800.0:
            break

        # Bass strings have stronger 2nd & 3rd partials than 1st; treble rolls off smoothly with hammer felt!
        if midi_note < 44:
            base_w = [0.68, 1.00, 0.78, 0.52, 0.34, 0.22, 0.14, 0.09, 0.05, 0.03][h - 1]
        else:
            vel_tilt = (0.48 + 0.52 * vel) ** (h - 1)
            base_w = (1.0 / (h ** 1.38)) * vel_tilt

        # Higher partials decay much faster (gives the natural warm mellowing after initial pearl attack!)
        h_decay_scale = 1.0 / (h ** 0.88)
        tau_fast = max(0.025, tau_fast_base * h_decay_scale)
        tau_slow = max(0.090, tau_slow_base * h_decay_scale)

        # Weinreich two-stage piano bridge envelope
        env_h = atk * (0.40 * np.exp(-t / tau_fast) + 0.60 * np.exp(-t / tau_slow))

        # 3-string trichord unison (or 2-string bichord in low bass)
        if midi_note < 40:
            c1 = np.sin(2.0 * np.pi * (f_h * 0.99965) * t + h * 0.17)
            c2 = np.sin(2.0 * np.pi * (f_h * 1.00035) * t + h * 0.63)
            w_l = 0.58 * c1 + 0.42 * c2
            w_r = 0.42 * c1 + 0.58 * c2
        else:
            c1 = np.sin(2.0 * np.pi * (f_h * 0.99948) * t + h * 0.11)
            c2 = np.sin(2.0 * np.pi * f_h * t + h * 0.47)
            c3 = np.sin(2.0 * np.pi * (f_h * 1.00055) * t + h * 0.89)
            w_l = 0.44 * c1 + 0.36 * c2 + 0.20 * c3
            w_r = 0.20 * c1 + 0.36 * c2 + 0.44 * c3

        sig_l += base_w * w_l * env_h
        sig_r += base_w * w_r * env_h

    # Subtle spruce soundboard woody knock + soft felt hammer brush on first 11ms
    body_f = min(max(freq * 0.5, 95.0), 230.0)
    knock = (
        np.sin(2.0 * np.pi * body_f * t) * np.exp(-t / 0.009) * 0.085
        + np.sin(2.0 * np.pi * (body_f * 2.35) * t) * np.exp(-t / 0.0045) * 0.035
    ) * (0.45 + 0.55 * vel)

    # Smooth damper-felt release over final 85ms (prevents any clicks at pedal changes!)
    damper_rel = np.clip((dur_s - t) / 0.085, 0.0, 1.0)
    level = (0.35 + 0.65 * (vel ** 1.15))

    # Natural pianist stereo perspective: low bass slightly left (0.35), treble slightly right (0.64)
    pan = float(np.clip(0.34 + 0.32 * ((midi_note - 29.0) / 56.0), 0.30, 0.68))
    gl = math.sqrt(1.0 - pan) * level
    gr = math.sqrt(pan) * level
    return (sig_l + knock) * damper_rel * gl, (sig_r + knock) * damper_rel * gr


def eval_piano_expression(t_sec: float, total_dur: float) -> float:
    """7-Act solo piano dynamic curve (pp = 0.20 -> mp = 0.48 -> mf = 0.72 -> ff climax = 1.00 -> pp coda)."""
    if t_sec < 15.0:
        # Cycle 0: intimate, delicate solo right-hand + single deep bass notes
        return 0.22 + 0.16 * (t_sec / 15.0)
    elif t_sec < 45.0:
        # Approach to Jupiter: singing melody enters
        return 0.38 + 0.26 * ((t_sec - 15.0) / 30.0)
    elif t_sec < 82.5:
        # Act 2 (Super-lightning, 8km Great Red Spot, Polar Aurora): dramatic first piano wave!
        return 0.64 + 0.22 * math.sin(math.pi * (t_sec - 45.0) / 37.5)
    elif t_sec < 160.8:
        # Acts 3 & 4 (Io & Europa subsurface ocean): crystalline, luminous starlight piano!
        return 0.44 + 0.16 * (0.5 + 0.5 * math.sin(2.0 * math.pi * (t_sec - 82.5) / 42.0))
    elif t_sec < 197.3:
        # Act 5 (Ganymede & Callisto): building left-hand octave momentum!
        return 0.54 + 0.30 * ((t_sec - 160.8) / 36.5)
    elif t_sec < total_dur - 27.0:
        # Act 6 (Voyager 1, Juno 4,200km polar dive, Galileo Grand Plunge): FULL CONCERT GRAND CLIMAX!
        u = (t_sec - 197.3) / max(1.0, (total_dur - 27.0) - 197.3)
        return 0.88 + 0.12 * math.sin(math.pi * min(1.0, u))
    else:
        # Act 7 (Finale pullback toward Saturn): gentle solo piano resolution
        u = (t_sec - (total_dur - 27.0)) / 27.0
        return max(0.20, 0.82 * (1.0 - 0.76 * min(1.0, u)))


def synthesize_interstellar_masterpiece(duration_sec: float) -> np.ndarray:
    """100% Pure Concert Grand Piano (Steinway D) arrangement of Hans Zimmer's Interstellar."""
    n_samples = int(math.ceil(duration_sec * SR))
    dry = np.zeros((n_samples, 2), dtype=np.float32)
    rng = np.random.default_rng(421700)

    # Stately, deeply emotional solo piano tempo: 94 BPM in 3/4 time
    # Quarter = 0.6383s | 8th = 0.31915s | 16th = 0.15957s | 2-bar chord = 3.8298s | 8-bar cycle = 15.319s!
    dt_q = 60.0 / 94.0
    dt_8 = dt_q * 0.5
    dt_16 = dt_q * 0.25
    chord_dur = dt_q * 6.0
    cycle_dur = chord_dur * 4.0

    progression = [
        {
            "name": "Fmaj7",
            "oct_bass": (N["F1"], N["F2"]),
            "lh_arp":   [N["F2"], N["C3"], N["F3"], N["A3"], N["C4"], N["F3"]],
            "ost8":     [N["A4"], N["E5"]] * 6,
            "star_hi":  [N["A5"], N["E6"]] * 6,
            "cas16":    [N["E4"], N["A4"], N["C5"], N["E5"], N["A5"], N["E5"], N["C5"], N["A4"], N["E4"], N["A4"], N["C5"], N["E5"]] * 2,
        },
        {
            "name": "G6",
            "oct_bass": (N["G1"], N["G2"]),
            "lh_arp":   [N["G2"], N["D3"], N["G3"], N["B3"], N["D4"], N["G3"]],
            "ost8":     [N["B4"], N["E5"]] * 6,
            "star_hi":  [N["B5"], N["E6"]] * 6,
            "cas16":    [N["E4"], N["B4"], N["D5"], N["E5"], N["B5"], N["E5"], N["D5"], N["B4"], N["E4"], N["B4"], N["D5"], N["E5"]] * 2,
        },
        {
            "name": "Am",
            "oct_bass": (N["A1"], N["A2"]),
            "lh_arp":   [N["A2"], N["E3"], N["A3"], N["C4"], N["E4"], N["A3"]],
            "ost8":     [N["C5"], N["E5"]] * 6,
            "star_hi":  [N["C6"], N["E6"]] * 6,
            "cas16":    [N["E4"], N["C5"], N["E5"], N["A5"], N["C6"], N["A5"], N["E5"], N["C5"], N["E4"], N["C5"], N["E5"], N["A5"]] * 2,
        },
        {
            "name": "Em_G",
            "oct_bass": (N["E1"], N["E2"]),
            "lh_arp":   [N["G2"], N["B2"], N["E3"], N["G3"], N["B3"], N["E3"]],
            "ost8":     [N["D5"], N["E5"]] * 3 + [N["B4"], N["E5"]] * 3,
            "star_hi":  [N["D6"], N["E6"]] * 3 + [N["B5"], N["E6"]] * 3,
            "cas16": (
                [N["E4"], N["D5"], N["E5"], N["G5"], N["B5"], N["G5"], N["E5"], N["D5"], N["E4"], N["D5"], N["E5"], N["G5"]]
                + [N["E4"], N["B4"], N["D5"], N["E5"], N["G5"], N["E5"], N["D5"], N["B4"], N["E4"], N["B4"], N["D5"], N["E5"]]
            ),
        },
    ]

    # Exact Hans Zimmer "First Step" right-hand singing melody (beat_offset_in_cycle, beat_duration, midi_note)
    melody_beats = [
        (0.0,  5.0, N["A5"]),
        (5.0,  1.0, N["B5"]),
        (6.0,  5.0, N["B5"]),
        (11.0, 1.0, N["C6"]),
        (12.0, 4.0, N["C6"]),
        (16.0, 1.0, N["D6"]),
        (17.0, 1.0, N["E6"]),
        (18.0, 3.0, N["D6"]),
        (21.0, 3.0, N["B5"]),
    ]

    def add_note(t0_s: float, sig_lr: tuple[np.ndarray, np.ndarray], gain: float = 1.0):
        sl, sr_ = sig_lr
        i0 = int(round(t0_s * SR))
        if i0 >= n_samples or i0 + len(sl) <= 0:
            return
        s0 = max(0, -i0)
        d0 = max(0, i0)
        ln = min(len(sl) - s0, n_samples - d0)
        if ln > 0:
            dry[d0:d0 + ln, 0] += sl[s0:s0 + ln] * gain
            dry[d0:d0 + ln, 1] += sr_[s0:s0 + ln] * gain

    # Pre-render multi-velocity Steinway D note bank (pedaled long, medium ostinato, crisp 16th, singing melody)
    cache = {}
    all_notes = sorted(set(N.values()))
    for m in all_notes:
        cache[(m, "bass_long")] = render_steinway_d_note(m, chord_dur + 0.28, vel=0.78)
        cache[(m, "bass_med")]  = render_steinway_d_note(m, chord_dur * 0.52, vel=0.84)
        cache[(m, "lh_arp")]    = render_steinway_d_note(m, dt_q * 2.4, vel=0.64)
        cache[(m, "ost_soft")]  = render_steinway_d_note(m, dt_8 * 3.6, vel=0.58)
        cache[(m, "ost_med")]   = render_steinway_d_note(m, dt_8 * 3.4, vel=0.76)
        cache[(m, "cas_16")]    = render_steinway_d_note(m, dt_16 * 3.8, vel=0.82)
        cache[(m, "mel_sing")]  = render_steinway_d_note(m, dt_q * 5.2, vel=0.88)
        cache[(m, "mel_short")] = render_steinway_d_note(m, dt_q * 2.2, vel=0.84)

    # 1. Render all 2-bar (3.83s) harmonic blocks with sustain-pedal realism & human micro-timing!
    n_chords = int(math.ceil(duration_sec / chord_dur))
    for c_idx in range(n_chords):
        t_ch = c_idx * chord_dur
        if t_ch >= duration_sec:
            break
        ch = progression[c_idx % 4]
        dyn = eval_piano_expression(t_ch + 1.5, duration_sec)
        cyc_idx = c_idx // 4

        # A) Left-Hand Steinway Bass Pedals & Octaves
        b_lo, b_hi = ch["oct_bass"]
        if cyc_idx == 0:
            # Intro Cycle 0: single soft, warm F2 / G2 / A2 / E2 bass note
            add_note(t_ch + 0.004, cache[(b_hi, "bass_long")], gain=0.46)
        elif dyn < 0.72:
            # Sustained rolled Steinway bass octave (low thumb 18ms after pinky — classic concert pianist roll!)
            add_note(t_ch,         cache[(b_lo, "bass_long")], gain=0.42 + 0.25 * dyn)
            add_note(t_ch + 0.018, cache[(b_hi, "bass_long")], gain=0.48 + 0.24 * dyn)
        else:
            # Climax (Act 2 peak & Act 6 Spacecraft): Re-struck Bar 1 & Bar 2 deep thunderous Steinway bass octaves!
            for bar_sub in range(2):
                tb = t_ch + bar_sub * (chord_dur * 0.5)
                if tb < duration_sec:
                    add_note(tb,         cache[(b_lo, "bass_med")], gain=0.66 * dyn)
                    add_note(tb + 0.014, cache[(b_hi, "bass_med")], gain=0.68 * dyn)

        # B) Left-Hand Flowing Broken-Chord Accompaniment (from Cycle 1 onward, quarter-note pulse = 6 notes per 2 bars!)
        if cyc_idx >= 1:
            for q_i in range(6):
                tq = t_ch + q_i * dt_q + float(rng.uniform(-0.003, 0.003))
                if tq >= duration_sec:
                    break
                m_lh = ch["lh_arp"][q_i % len(ch["lh_arp"])]
                # Gentle 3/4 waltz-pulse breath (beat 1 stronger, beats 2-3 flowing)
                beat_w = 1.05 if (q_i % 3 == 0) else 0.78
                add_note(tq, cache[(m_lh, "lh_arp")], gain=(0.24 + 0.22 * dyn) * beat_w)

        # C) Signature Interstellar Right-Hand Alternating Ostinato (A4-E5 / B4-E5 / C5-E5 / D5-E5-B4-E5)!
        is_starlight_europa = (95.0 <= t_ch <= 156.0)
        for s8, m_ost in enumerate(ch["ost8"]):
            tn = t_ch + s8 * dt_8 + float(rng.uniform(-0.0035, 0.0035))
            if tn >= duration_sec:
                break
            is_pedal = (s8 % 2 == 1)
            # Expressive phrase arch across the 12 eighth-notes of each 2-bar chord!
            phrase_arch = 0.88 + 0.18 * math.sin(math.pi * (s8 / 11.0))
            accent = (0.70 if is_pedal else 1.06) * phrase_arch
            bank_key = "ost_soft" if dyn < 0.48 else "ost_med"
            ost_gain = (0.36 + 0.16 * dyn) * accent * (0.72 if dyn > 0.78 else 1.0)
            add_note(tn, cache[(m_ost, bank_key)], gain=ost_gain)

            # Over Io & Europa's icy subsurface ocean (95s-156s), add delicate upper-octave starlight piano shimmer!
            if is_starlight_europa and (s8 % 2 == 0):
                m_hi = ch["star_hi"][s8]
                add_note(tn + 0.010, cache[(m_hi, "ost_soft")], gain=0.18 * phrase_arch)

        # D) Virtuosic Patrik Pietschmann Climax: Cascading 16th-Note Steinway Arpeggios (Act 2 GRS & Act 6 Spacecraft Climax!)
        if dyn > 0.62:
            cas_amt = ((dyn - 0.62) / 0.38) ** 1.15
            for s16, m_cas in enumerate(ch["cas16"]):
                tn = t_ch + s16 * dt_16 + float(rng.uniform(-0.0025, 0.0025))
                if tn >= duration_sec:
                    break
                wave_accent = 1.08 if (s16 % 4 == 0) else (0.92 if (s16 % 2 == 0) else 0.76)
                add_note(tn, cache[(m_cas, "cas_16")], gain=0.30 * cas_amt * wave_accent)

    # 2. Singing Right-Hand Steinway Octave/Solo Melody ("First Step" theme, from Cycle 1 = 15.3s onward!)
    n_cycles = int(math.ceil(duration_sec / cycle_dur))
    for cyc in range(1, n_cycles):
        t_cyc = cyc * cycle_dur
        if t_cyc >= duration_sec - 14.0:
            break
        for b_off, b_dur, m_mel in melody_beats:
            tm = t_cyc + b_off * dt_q + float(rng.uniform(-0.004, 0.004))
            if tm >= duration_sec:
                break
            dyn = eval_piano_expression(tm, duration_sec)
            b_key = "mel_sing" if b_dur >= 2.5 else "mel_short"
            # Lower octave (A4..E5) warm singing thumb + upper octave (A5..E6) bell-clear pinky!
            m_low = m_mel - 12
            if dyn < 0.60:
                add_note(tm, cache[(m_mel, b_key)], gain=0.34 + 0.18 * dyn)
            else:
                # Rolled concert-grand right-hand octave melody in emotional peaks!
                add_note(tm,         cache[(m_low, b_key)], gain=0.32 * dyn)
                add_note(tm + 0.015, cache[(m_mel, b_key)], gain=0.44 * dyn)

    # 3. Final Warm Rolled Amadd9 Chord on Last 4 Seconds so ending rings peacefully!
    t_end_chord = max(0.0, duration_sec - 4.5)
    for idx_n, m_final in enumerate([N["A1"], N["E2"], N["A2"], N["E3"], N["A3"], N["B3"], N["C4"], N["E4"], N["A4"]]):
        if (m_final, "bass_long") in cache:
            add_note(t_end_chord + idx_n * 0.032, cache[(m_final, "bass_long")], gain=0.22)

    # 4. Convolve with Warm 2.85s Stereo Wooden Concert Hall Impulse Response!
    ir = make_concert_hall_piano_ir(rt60=2.85)
    wet = fft_convolve_stereo(dry, ir)
    bgm = dry * 0.74 + wet * 0.58

    # 5. Immediate crisp 0.25s fade-in (so first A4-E5 piano notes sparkle right at 0.0s!) & smooth 2.8s fade-out
    t = np.arange(n_samples, dtype=np.float32) / SR
    fade_in = np.minimum(1.0, t / 0.25)[:, None]
    fade_out = np.minimum(1.0, (duration_sec - t) / 2.8)[:, None]
    bgm *= np.clip(fade_in * fade_out, 0.0, 1.0)

    # Pure linear dynamic range with gentle analog peak ceiling at 0.88 (keeps piano crystal-clear, zero distortion!)
    peak = float(np.max(np.abs(bgm)))
    if peak > 1e-6:
        bgm *= 0.88 / peak
    return bgm


def decode_mp3_to_float_stereo(mp3_path: pathlib.Path) -> np.ndarray:
    cmd = [
        FFMPEG, "-y", "-i", str(mp3_path),
        "-f", "f32le", "-acodec", "pcm_f32le",
        "-ar", str(SR), "-ac", "2", "-"
    ]
    proc = subprocess.run(cmd, capture_output=True, check=True)
    return np.frombuffer(proc.stdout, dtype=np.float32).reshape(-1, 2)


def save_wav_16(path: pathlib.Path, audio: np.ndarray):
    pcm16 = np.clip(audio * 32767.0, -32768, 32767).astype(np.int16)
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(pcm16.tobytes())


def main():
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    total_dur = float(manifest["totalDuration"])
    print(f"[1/3] Synthesizing Solo Concert Grand Piano Interstellar ('First Step / Cornfield Chase', {total_dur:.2f}s)...", flush=True)
    bgm = synthesize_interstellar_masterpiece(total_dur)

    tmp_bgm_wav = pathlib.Path(tempfile.gettempdir()) / "bgm_interstellar_piano_raw.wav"
    save_wav_16(tmp_bgm_wav, bgm)
    subprocess.run(
        [FFMPEG, "-y", "-i", str(tmp_bgm_wav), "-c:a", "libmp3lame", "-b:a", "192k", str(BGM_PIANO_MP3)],
        check=True,
        capture_output=True,
    )
    shutil.copy2(BGM_PIANO_MP3, BGM_COMPAT_MP3)
    print(f"      Saved Solo Piano BGM: {BGM_PIANO_MP3} ({BGM_PIANO_MP3.stat().st_size // 1024} KB)", flush=True)

    print("[2/3] Mixing VivienneMultilingual narration + sidechain-ducked Solo Grand Piano Interstellar...", flush=True)
    n_samples = len(bgm)
    voice_track = np.zeros((n_samples, 2), dtype=np.float32)
    voice_activity = np.zeros(n_samples, dtype=np.float32)

    for seg in manifest["segments"]:
        mp3_path = EP_DIR / f"seg_{int(seg['index']) + 1:02d}.mp3"
        pcm = decode_mp3_to_float_stereo(mp3_path)
        i0 = int(float(seg["t0"]) * SR)
        i1 = min(n_samples, i0 + len(pcm))
        seg_len = i1 - i0
        if seg_len > 0:
            voice_track[i0:i1] += pcm[:seg_len] * 1.05
            env = np.mean(np.abs(pcm[:seg_len]), axis=1)
            voice_activity[i0:i1] = np.maximum(voice_activity[i0:i1], (env > 0.010).astype(np.float32))

    win = int(0.32 * SR)
    kernel = np.ones(win, dtype=np.float32) / win
    smooth_act = np.clip(np.convolve(voice_activity, kernel, mode="same") * 1.7, 0.0, 1.0)
    # Solo piano sits naturally around female voice without muddying speech: 0.60 in pauses, 0.34 during speech!
    duck_gain = (0.60 - 0.26 * smooth_act)[:, None]

    mix = voice_track + bgm * duck_gain
    peak_mix = float(np.max(np.abs(mix)))
    if peak_mix > 0.94:
        mix *= 0.94 / peak_mix

    master_wav = pathlib.Path(tempfile.gettempdir()) / "ep01_jupiter_piano_master.wav"
    save_wav_16(master_wav, mix)

    print("[3/3] Remuxing H.264 video stream with Solo Grand Piano Interstellar soundtrack...", flush=True)
    tmp_mp4 = pathlib.Path(tempfile.gettempdir()) / "douyin_jupiter_piano_remux.mp4"
    subprocess.run(
        [
            FFMPEG, "-y",
            "-i", str(VIDEO_MP4),
            "-i", str(master_wav),
            "-map", "0:v:0",
            "-map", "1:a:0",
            "-c:v", "copy",
            "-c:a", "aac",
            "-b:a", "192k",
            "-movflags", "+faststart",
            "-shortest",
            str(tmp_mp4),
        ],
        check=True,
        capture_output=True,
    )
    shutil.move(str(tmp_mp4), str(VIDEO_MP4))
    # Also save a dedicated copy named douyin_jupiter_empire_piano_9x16.mp4 so the user has an explicit filename too!
    piano_mp4_copy = ROOT / "douyin_jupiter_empire_piano_9x16.mp4"
    shutil.copy2(VIDEO_MP4, piano_mp4_copy)
    print(f"SUCCESS! Updated {VIDEO_MP4} & saved {piano_mp4_copy} ({VIDEO_MP4.stat().st_size / (1024*1024):.2f} MB)!", flush=True)


if __name__ == "__main__":
    main()
