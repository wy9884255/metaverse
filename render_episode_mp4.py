import argparse
import http.server
import json
import math
import os
import pathlib
import re
import subprocess
import tempfile
import threading
import time
import urllib.parse
import wave
import imageio_ffmpeg
import numpy as np
from build_interstellar_bgm import synthesize_interstellar_masterpiece

ROOT = pathlib.Path(__file__).resolve().parent
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
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


def build_master_soundtrack(ep_dir: pathlib.Path, manifest: dict, out_wav: pathlib.Path) -> float:
    total_dur = float(manifest["totalDuration"])
    bgm = synthesize_interstellar_masterpiece(total_dur)
    n_samples = len(bgm)
    voice_track = np.zeros((n_samples, 2), dtype=np.float32)
    voice_activity = np.zeros(n_samples, dtype=np.float32)

    for seg in manifest["segments"]:
        mp3_path = ep_dir / f"seg_{int(seg['index']) + 1:02d}.mp3"
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
    parser = argparse.ArgumentParser()
    parser.add_argument("--ep-id", required=True)
    parser.add_argument("--ep-index", type=int, required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    ep_dir = ROOT / "episodes" / args.ep_id
    manifest = json.loads((ep_dir / "manifest.json").read_text(encoding="utf-8"))
    out_mp4 = ROOT / args.out
    master_wav = pathlib.Path(tempfile.gettempdir()) / f"{args.ep_id}_piano_master.wav"

    print(f"[1/3] Synthesizing Vivienne narration + Solo Piano Interstellar soundtrack for {args.ep_id}...", flush=True)
    total_dur = build_master_soundtrack(ep_dir, manifest, master_wav)
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
        str(out_mp4),
    ]
    ff_log_path = pathlib.Path(tempfile.gettempdir()) / f"{args.ep_id}_ffmpeg.log"
    ff_log = open(ff_log_path, "wb")
    ff_proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=ff_log)

    done_event = threading.Event()
    write_lock = threading.Lock()
    state = {"count": 0, "error": None, "t_start": time.time()}

    # Strip 58MB base64 MP3 blobs from episodes_audio.js for instant (<0.1s) headless Chrome frame-render boot!
    raw_ep_js = (ROOT / "episodes_audio.js").read_text(encoding="utf-8")
    slim_ep_js = re.sub(r'"audioDataUri":\s*"data:audio/[^"]*"', '"audioDataUri": ""', raw_ep_js)
    slim_ep_js = re.sub(r'"interstellarBgmDataUri":\s*"data:audio/[^"]*"', '"interstellarBgmDataUri": ""', slim_ep_js)
    slim_ep_bytes = slim_ep_js.encode("utf-8")

    class FrameHandler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *a, **kw):
            super().__init__(*a, directory=str(ROOT), **kw)

        def log_message(self, fmt, *a):
            pass

        def do_GET(self):
            if self.path.split("?", 1)[0] == "/episodes_audio.js":
                self.send_response(200)
                self.send_header("Content-Type", "application/javascript; charset=utf-8")
                self.send_header("Content-Length", str(len(slim_ep_bytes)))
                self.end_headers()
                self.wfile.write(slim_ep_bytes)
                return
            super().do_GET()

        def do_POST(self):
            parsed = urllib.parse.urlparse(self.path)
            length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(length) if length > 0 else b""

            if parsed.path == "/frame":
                with write_lock:
                    ff_proc.stdin.write(body)
                    state["count"] += 1
                    cnt = state["count"]
                if cnt % 200 == 0 or cnt == total_frames:
                    elapsed = time.time() - state["t_start"]
                    fps_eff = cnt / max(0.01, elapsed)
                    print(f"      [{args.ep_id}] {cnt}/{total_frames} frames ({cnt*100//total_frames}%) - {fps_eff:.1f} fps", flush=True)
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
    threading.Thread(target=httpd.serve_forever, daemon=True).start()

    chrome_candidates = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    ]
    browser_exe = next((p for p in chrome_candidates if os.path.exists(p)), None)
    if not browser_exe:
        raise RuntimeError("No Chrome/Edge executable found for WebGL2 GPU rendering.")

    user_data_dir = pathlib.Path(tempfile.mkdtemp(prefix=f"webgl_exp_{args.ep_id}_"))
    url = f"http://127.0.0.1:{port}/index.html?batch_export=1&ep={args.ep_index}&fps={FPS}"
    print(f"[2/3] Rendering 1080x1920 WebGL2 frames via GPU ({os.path.basename(browser_exe)})...", flush=True)
    b_proc = subprocess.Popen(
        [
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
            "--window-size=1200,1920",
            url,
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    try:
        finished = done_event.wait(timeout=3200)
        if not finished:
            raise RuntimeError(f"Timed out after rendering {state['count']}/{total_frames} frames.")
        if state["error"]:
            raise RuntimeError(f"Browser batch export error: {state['error']}")
    finally:
        b_proc.terminate()
        httpd.shutdown()

    print(f"[3/3] Finalizing H.264 + AAC 1080x1920 MP4 container -> {out_mp4.name}...", flush=True)
    ff_proc.stdin.close()
    ff_proc.wait()
    ff_log.close()
    if ff_proc.returncode != 0:
        err_txt = ff_log_path.read_text(encoding="utf-8", errors="replace")[-1500:]
        raise RuntimeError(f"FFmpeg muxing failed:\n{err_txt}")

    size_mb = out_mp4.stat().st_size / (1024 * 1024)
    print(f"SUCCESS! Saved: {out_mp4} ({size_mb:.2f} MB)", flush=True)


if __name__ == "__main__":
    main()
