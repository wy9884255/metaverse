import http.server
import json
import math
import os
import pathlib
import subprocess
import tempfile
import threading
import time
import urllib.parse
import wave
import imageio_ffmpeg
import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

EP_ID = "ep01_jupiter_empire"
EP_INDEX = 1
EP_DIR = ROOT / "episodes" / EP_ID
MANIFEST_PATH = EP_DIR / "manifest.json"
OUT_MP4 = ROOT / "douyin_jupiter_empire_9x16.mp4"
FPS = 30
SR = 44100


def decode_mp3_to_float_stereo(mp3_path: pathlib.Path) -> np.ndarray:
    cmd = [
        FFMPEG, "-y", "-i", str(mp3_path),
        "-f", "f32le", "-acodec", "pcm_f32le",
        "-ar", str(SR), "-ac", "2", "-"
    ]
    proc = subprocess.run(cmd, capture_output=True, check=True)
    arr = np.frombuffer(proc.stdout, dtype=np.float32)
    return arr.reshape(-1, 2)


def synthesize_interstellar_slow_bgm(duration_sec: float) -> np.ndarray:
    n_samples = int(math.ceil(duration_sec * SR))
    t = np.arange(n_samples, dtype=np.float32) / SR
    bgm = np.zeros((n_samples, 2), dtype=np.float32)

    # Interstellar "Cornfield Chase" 0.75x Slowed Chord Progression: Am -> Fmaj7 -> C -> Gsus4
    chords = [
        {"sub": 55.00, "organ": [110.00, 164.81, 220.00, 261.63], "arp": [440.00, 523.25, 659.25, 523.25, 493.88, 523.25, 659.25, 523.25]},
        {"sub": 43.65, "organ": [87.31, 130.81, 174.61, 220.00],  "arp": [440.00, 523.25, 659.25, 523.25, 587.33, 523.25, 659.25, 523.25]},
        {"sub": 65.41, "organ": [130.81, 196.00, 261.63, 329.63], "arp": [392.00, 523.25, 659.25, 523.25, 587.33, 523.25, 659.25, 523.25]},
        {"sub": 49.00, "organ": [98.00, 146.83, 196.00, 246.94],  "arp": [392.00, 493.88, 587.33, 493.88, 523.25, 493.88, 587.33, 493.88]},
    ]
    bar_dur = 7.4  # Lush slow cathedral chord cycle

    # 1. Warm Cathedral Pipe Organ Pad + Deep Sub-Bass
    n_bars = int(math.ceil(duration_sec / bar_dur)) + 1
    for b in range(n_bars):
        ch = chords[b % len(chords)]
        t0 = b * bar_dur
        t1 = min(duration_sec, (b + 1) * bar_dur + 1.2)
        i0 = int(t0 * SR)
        i1 = min(n_samples, int(t1 * SR))
        if i1 <= i0:
            continue
        lt = np.arange(i1 - i0, dtype=np.float32) / SR
        seg_len = t1 - t0
        env = np.minimum(1.0, lt / 1.1) * np.minimum(1.0, (seg_len - lt) / 1.2)
        env = np.clip(env, 0.0, 1.0)

        pad_l = 0.20 * np.sin(2.0 * np.pi * ch["sub"] * lt)
        pad_r = pad_l.copy()
        gains = [0.16, 0.12, 0.10, 0.08]
        for idx, freq in enumerate(ch["organ"]):
            det_l = freq * (1.0 - 0.0018 * (idx + 1))
            det_r = freq * (1.0 + 0.0018 * (idx + 1))
            w_l = np.sin(2.0 * np.pi * det_l * lt) + 0.28 * np.sin(4.0 * np.pi * det_l * lt) + 0.08 * np.sin(6.0 * np.pi * det_l * lt)
            w_r = np.sin(2.0 * np.pi * det_r * lt) + 0.28 * np.sin(4.0 * np.pi * det_r * lt) + 0.08 * np.sin(6.0 * np.pi * det_r * lt)
            pad_l += gains[idx] * w_l
            pad_r += gains[idx] * w_r

        bgm[i0:i1, 0] += pad_l * env
        bgm[i0:i1, 1] += pad_r * env

    # 2. Soft Felt Piano Arpeggio (0.75x Slowed Space-Sleep Tempo)
    step_dur = 0.58
    n_notes = int(duration_sec / step_dur)
    note_len_s = 2.4
    note_samples = int(note_len_s * SR)
    nt = np.arange(note_samples, dtype=np.float32) / SR
    note_env = (1.0 - np.exp(-nt / 0.018)) * np.exp(-nt / 0.82)

    for step in range(n_notes):
        nt0 = step * step_dur + 0.12
        i0 = int(nt0 * SR)
        if i0 >= n_samples:
            break
        bar_idx = int(nt0 / bar_dur) % len(chords)
        arp = chords[bar_idx]["arp"]
        freq = arp[step % len(arp)]
        i1 = min(n_samples, i0 + note_samples)
        cur_n = i1 - i0
        tone = (
            np.sin(2.0 * np.pi * freq * nt[:cur_n])
            + 0.22 * np.sin(4.0 * np.pi * freq * nt[:cur_n]) * np.exp(-nt[:cur_n] / 0.35)
        ) * note_env[:cur_n] * 0.15
        pan = 0.5 + 0.24 * math.sin(step * 0.9)
        bgm[i0:i1, 0] += tone * math.sqrt(1.0 - pan)
        bgm[i0:i1, 1] += tone * math.sqrt(pan)

    # 3. Lush Multi-Tap Deep-Space Stereo Shimmer Reverb
    taps = [
        (0.19, 0.30, True),
        (0.37, 0.24, False),
        (0.61, 0.19, True),
        (0.97, 0.14, False),
        (1.49, 0.10, True),
        (2.23, 0.07, False),
    ]
    wet = np.zeros_like(bgm)
    for delay_s, g, swap in taps:
        d = int(delay_s * SR)
        if d < n_samples:
            src = bgm[:-d, ::-1] if swap else bgm[:-d]
            wet[d:] += src * g
    bgm = bgm * 0.72 + wet * 0.55

    # Gentle fade-in (1.2s) and fade-out (2.2s)
    fade_in = np.minimum(1.0, t / 1.2)[:, None]
    fade_out = np.minimum(1.0, (duration_sec - t) / 2.2)[:, None]
    bgm *= np.clip(fade_in * fade_out, 0.0, 1.0)
    return bgm


from build_interstellar_bgm import synthesize_interstellar_masterpiece


def build_master_soundtrack(manifest: dict, out_wav: pathlib.Path) -> float:
    total_dur = float(manifest["totalDuration"])
    bgm = synthesize_interstellar_masterpiece(total_dur)
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
    duck_gain = (0.56 - 0.25 * smooth_act)[:, None]

    mix = np.tanh((voice_track + bgm * duck_gain) * 1.06) * 0.94

    pcm16 = np.clip(mix * 32767.0, -32768, 32767).astype(np.int16)
    with wave.open(str(out_wav), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(pcm16.tobytes())
    return total_dur


def main():
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    master_wav = pathlib.Path(tempfile.gettempdir()) / "ep01_jupiter_master.wav"
    print("[1/3] Synthesizing VivienneMultilingual narration + Interstellar 0.75x Slowed soundtrack...", flush=True)
    total_dur = build_master_soundtrack(manifest, master_wav)
    total_frames = int(math.ceil(total_dur * FPS))
    print(f"      Master audio ready: {total_dur:.2f}s ({total_frames} frames @ {FPS}fps)", flush=True)

    ffmpeg_cmd = [
        FFMPEG, "-y",
        "-f", "image2pipe",
        "-vcodec", "mjpeg",
        "-framerate", str(FPS),
        "-i", "-",
        "-i", str(master_wav),
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "17",
        "-pix_fmt", "yuv420p",
        "-r", str(FPS),
        "-c:a", "aac",
        "-b:a", "192k",
        "-movflags", "+faststart",
        "-shortest",
        str(OUT_MP4),
    ]
    ff_log_path = pathlib.Path(tempfile.gettempdir()) / "ep01_jupiter_ffmpeg.log"
    ff_log = open(ff_log_path, "wb")
    ff_proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=ff_log)

    done_event = threading.Event()
    write_lock = threading.Lock()
    state = {"count": 0, "error": None, "t_start": time.time()}

    class FrameHandler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(ROOT), **kwargs)

        def log_message(self, format, *args):
            pass

        def do_POST(self):
            parsed = urllib.parse.urlparse(self.path)
            length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(length) if length > 0 else b""

            if parsed.path == "/frame":
                with write_lock:
                    ff_proc.stdin.write(body)
                    state["count"] += 1
                    cnt = state["count"]
                if cnt % 150 == 0 or cnt == total_frames:
                    elapsed = time.time() - state["t_start"]
                    fps_eff = cnt / max(0.01, elapsed)
                    print(f"      Rendered {cnt}/{total_frames} frames ({cnt*100//total_frames}%) - {fps_eff:.1f} fps", flush=True)
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b"ok")
            elif parsed.path == "/done":
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b"done")
                done_event.set()
            elif parsed.path == "/error":
                qs = urllib.parse.parse_qs(parsed.query)
                state["error"] = qs.get("msg", ["unknown"])[0]
                self.send_response(200)
                self.end_headers()
                done_event.set()
            else:
                self.send_response(404)
                self.end_headers()

    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), FrameHandler)
    port = httpd.server_address[1]
    srv_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    srv_thread.start()

    chrome_candidates = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    ]
    browser_exe = next((p for p in chrome_candidates if os.path.exists(p)), None)
    if not browser_exe:
        raise RuntimeError("No Chrome/Edge executable found for WebGL2 GPU rendering.")

    user_data_dir = pathlib.Path(tempfile.mkdtemp(prefix="webgl_export_jup_"))
    url = f"http://127.0.0.1:{port}/index.html?batch_export=1&ep={EP_INDEX}&fps={FPS}"
    print(f"[2/3] Rendering 1080x1920 WebGL2 frames via GPU ({os.path.basename(browser_exe)})...", flush=True)
    browser_cmd = [
        browser_exe,
        f"--user-data-dir={user_data_dir}",
        "--headless=new",
        "--use-angle=d3d11",
        "--enable-webgl",
        "--ignore-gpu-blocklist",
        "--disable-background-timer-throttling",
        "--disable-renderer-backgrounding",
        "--no-first-run",
        "--no-default-browser-check",
        "--window-size=1440,1080",
        url,
    ]
    b_proc = subprocess.Popen(browser_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    try:
        finished = done_event.wait(timeout=2400)
        if not finished:
            raise RuntimeError(f"Timed out after rendering {state['count']}/{total_frames} frames.")
        if state["error"]:
            raise RuntimeError(f"Browser batch export error: {state['error']}")
    finally:
        b_proc.terminate()
        httpd.shutdown()

    print("[3/3] Finalizing H.264 + AAC 1080x1920 MP4 container...", flush=True)
    ff_proc.stdin.close()
    ff_proc.wait()
    ff_log.close()
    if ff_proc.returncode != 0:
        err_txt = ff_log_path.read_text(encoding="utf-8", errors="replace")[-1500:]
        raise RuntimeError(f"FFmpeg muxing failed:\n{err_txt}")

    size_mb = OUT_MP4.stat().st_size / (1024 * 1024)
    print(f"SUCCESS! Saved: {OUT_MP4} ({size_mb:.2f} MB)", flush=True)


if __name__ == "__main__":
    main()
