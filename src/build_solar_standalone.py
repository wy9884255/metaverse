import pathlib

src_path = pathlib.Path(r"C:\Users\Administrator\.gemini\antigravity\brain\c13a1843-7a2e-49cd-ba94-16fefaed64ef\milky_way.html")
dst_path = pathlib.Path(r"e:\anti\universe\solar_system_1to1.html")

raw = src_path.read_text(encoding="utf-8")
script_idx = raw.index("<script>\n(() => {")
script_part = raw[script_idx:]

header_html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" href="data:," />
  <title>1:1 本星系群全成员 · 大小麦哲伦星系 (LMC/SMC) · 仙女座星系群 &amp; 银河系太阳系</title>
  <style>
    :root {
      --bg-panel: rgba(10, 15, 28, 0.74);
      --bg-panel-hover: rgba(24, 35, 62, 0.88);
      --border-glass: rgba(148, 163, 184, 0.20);
      --text-main: #f1f5f9;
      --text-muted: #94a3b8;
      --accent: #38bdf8;
      --accent-solid: #0284c7;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #020308;
      color: var(--text-main);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      user-select: none;
      -webkit-user-select: none;
    }
    #glCanvas {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
      cursor: grab;
    }
    #glCanvas:active { cursor: grabbing; }

    .glass {
      background: var(--bg-panel);
      border: 1px solid var(--border-glass);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
    }
    .fade-ui {
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    .ui-hidden .fade-ui {
      opacity: 0;
      pointer-events: none !important;
    }

    /* Compact Top-Left HUD */
    .hud-left {
      position: fixed;
      top: 12px;
      left: 12px;
      z-index: 20;
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 296px;
      max-width: calc(100vw - 180px);
      pointer-events: none;
    }
    .telemetry-card {
      border-radius: 12px;
      padding: 10px 14px;
      pointer-events: auto;
    }
    .title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .title-row h1 {
      margin: 0;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.02em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .fps-badge {
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 12px;
      padding: 2px 6px;
      border-radius: 6px;
      background: rgba(56, 189, 248, 0.15);
      color: #7dd3fc;
      border: 1px solid rgba(56, 189, 248, 0.25);
      white-space: nowrap;
    }
    .stats-list {
      display: flex;
      flex-direction: column;
      gap: 3px;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid var(--border-glass);
      font-size: 12px;
    }
    .stat-item {
      display: flex;
      justify-content: space-between;
      gap: 8px;
    }
    .stat-label { color: var(--text-muted); white-space: nowrap; }
    .stat-val {
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-weight: 500;
      text-align: right;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .desc-card {
      border-radius: 12px;
      padding: 8px 12px;
      font-size: 12px;
      line-height: 1.5;
      color: var(--text-muted);
    }
    .desc-card strong { color: var(--text-main); }
    @media (max-width: 720px) {
      .hud-left { width: 240px; max-width: calc(100vw - 275px); }
      .desc-card { display: none; }
      .btn-shot { display: none; }
      #btnRecordVideo { display: none; }
    }

    /* Cinema Showcase Bar & Video Preview Modal */
    .btn-primary {
      background: var(--accent-solid);
      color: #ffffff;
      border-color: rgba(56, 189, 248, 0.45);
      font-weight: 600;
    }
    .btn-primary:hover {
      background: #0369a1;
      border-color: rgba(125, 211, 252, 0.65);
    }
    .cinema-wrap {
      position: fixed;
      bottom: 12px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 20;
      width: min(96vw, 840px);
    }
    .cinema-card {
      border-radius: 16px;
      padding: 10px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .cinema-top {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .cinema-title-group {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }
    .ch-badge {
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 12px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;
      background: var(--accent-solid);
      color: #ffffff;
      flex-shrink: 0;
    }
    .ch-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .param-badge {
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 6px;
      background: rgba(56, 189, 248, 0.16);
      color: #7dd3fc;
      border: 1px solid rgba(56, 189, 248, 0.35);
      white-space: nowrap;
    }
    .cinema-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }
    .cinema-sub {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.45;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cinema-scrubber {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .time-readout {
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 12px;
      color: var(--text-muted);
      white-space: nowrap;
      flex-shrink: 0;
    }
    .ch-list {
      display: flex;
      align-items: center;
      gap: 4px;
      overflow-x: auto;
      padding-top: 2px;
    }
    .ch-jump-btn {
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-muted);
      font-size: 12px;
      font-weight: 500;
      padding: 3px 8px;
      border-radius: 6px;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .ch-jump-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-main);
    }
    .ch-jump-btn.active {
      background: var(--accent-solid);
      color: #ffffff;
      font-weight: 600;
    }
    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 40;
      background: rgba(2, 4, 12, 0.82);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .modal-card {
      width: min(94vw, 820px);
      border-radius: 16px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .modal-video {
      width: 100%;
      max-height: 60vh;
      border-radius: 12px;
      border: 1px solid var(--border-glass);
      background: #000000;
    }
    .dl-link {
      text-decoration: none;
      display: inline-flex;
      align-items: center;
    }
    @keyframes recPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.35; transform: scale(0.82); }
    }
    .rec-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: #ef4444;
      margin-right: 5px;
      animation: recPulse 1.1s ease-in-out infinite;
      pointer-events: none;
    }

    /* Compact Top-Right Controls */
    .hud-right {
      position: fixed;
      top: 12px;
      right: 12px;
      z-index: 20;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
      max-height: calc(100vh - 88px);
    }
    .action-bar { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px; }
    .btn {
      color: var(--text-main);
      font-size: 12px;
      font-weight: 500;
      padding: 6px 10px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.18s ease, border-color 0.18s ease;
    }
    .btn:hover {
      background: var(--bg-panel-hover);
      border-color: rgba(148, 163, 184, 0.38);
    }
    .controls-drawer {
      width: 288px;
      max-width: calc(100vw - 24px);
      border-radius: 12px;
      padding: 14px;
      overflow-y: auto;
      display: none;
      flex-direction: column;
      gap: 11px;
    }
    .ctrl-sep {
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border-glass);
    }
    .ctrl-row label {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      margin-bottom: 4px;
    }
    .ctrl-val {
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      color: var(--text-muted);
    }
    input[type="range"] {
      width: 100%;
      height: 5px;
      accent-color: var(--accent);
      cursor: pointer;
    }
    .ctrl-footer {
      padding-top: 9px;
      border-top: 1px solid var(--border-glass);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
    }
    .chk-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
    }
    select {
      background: rgba(30, 41, 59, 0.85);
      color: var(--text-main);
      border: 1px solid var(--border-glass);
      border-radius: 6px;
      padding: 3px 7px;
      font-size: 12px;
      outline: none;
      cursor: pointer;
    }
    .help-tip {
      padding-top: 8px;
      border-top: 1px solid var(--border-glass);
      font-size: 12px;
      line-height: 1.45;
      color: var(--text-muted);
    }

    /* Bottom Preset Bar */
    .preset-wrap {
      position: fixed;
      bottom: 12px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 20;
      max-width: 96vw;
    }
    .preset-bar {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 6px 8px;
      border-radius: 15px;
      overflow-x: auto;
    }
    .preset-btn {
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-main);
      font-size: 12px;
      font-weight: 500;
      padding: 6px 10px;
      border-radius: 10px;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.18s ease;
    }
    .preset-btn:hover {
      background: rgba(255, 255, 255, 0.08);
    }
    .preset-btn.active {
      background: var(--accent-solid);
      color: #ffffff;
      box-shadow: 0 2px 10px rgba(2, 132, 199, 0.45);
    }

    /* 3D Projected Labels */
    #labelsLayer {
      position: fixed;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
    }
    .astro-label {
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: opacity 0.15s ease;
      pointer-events: none;
    }
    .astro-label.clickable {
      pointer-events: auto;
      cursor: pointer;
    }
    .marker-dot {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      flex-shrink: 0;
      box-shadow: 0 0 8px currentColor;
    }
    .label-box {
      padding: 3px 8px;
      border-radius: 7px;
      background: rgba(8, 12, 24, 0.72);
      border: 1px solid rgba(255, 255, 255, 0.16);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      transition: background 0.15s ease, border-color 0.15s ease;
    }
    .astro-label.clickable:hover .label-box {
      background: rgba(16, 26, 48, 0.90);
      border-color: rgba(125, 211, 252, 0.55);
    }
    .label-title {
      font-size: 12px;
      font-weight: 500;
      color: #f8fafc;
      line-height: 1.25;
      white-space: nowrap;
    }
    .label-sub {
      font-size: 12px;
      color: rgba(203, 213, 225, 0.85);
      line-height: 1.25;
      white-space: nowrap;
    }

    /* Loading Overlay */
    #loadingOverlay {
      position: fixed;
      inset: 0;
      z-index: 50;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #03050c;
      color: #f8fafc;
      transition: opacity 0.5s ease;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid rgba(56, 189, 248, 0.25);
      border-top-color: #38bdf8;
      animation: spin 0.9s linear infinite;
      margin-bottom: 14px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <canvas id="glCanvas"></canvas>

  <div id="labelsLayer" class="fade-ui"></div>

  <!-- Compact Top-Left 1:1 Telemetry -->
  <div id="hudLeftBox" class="hud-left fade-ui">
    <div class="telemetry-card glass">
      <div class="title-row">
        <h1>1:1 本星系群 · 仙女座星系群 &amp; 银河系</h1>
        <span id="fpsBadge" class="fps-badge">60 FPS</span>
      </div>
      <div class="stats-list">
        <div class="stat-item">
          <span class="stat-label">观测目标:</span>
          <span id="hudAnchor" class="stat-val">仙女座大星系 M31</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">当前视距:</span>
          <span id="hudDist" class="stat-val">192,000 ly</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">距太阳系:</span>
          <span id="hudSunDist" class="stat-val">253.7 万ly</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">距银心黑洞:</span>
          <span id="hudGalDist" class="stat-val">254.0 万ly</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">距仙女座 M31:</span>
          <span id="hudM31Dist" class="stat-val">192,000 ly</span>
        </div>
      </div>
    </div>

    <div id="presetDescCard" class="desc-card glass">
      <strong id="presetTitle">俯瞰全景：</strong>
      <span id="presetDesc">1:1 展现 253.7 万光年仙女座大星系群 (M31/M32/M110/M33) 与银河系本星系群三维宇宙结构。</span>
    </div>
  </div>

  <!-- Compact Top-Right Controls -->
  <div id="hudRightBox" class="hud-right">
    <div class="action-bar">
      <button id="btnStartTourEp2" class="btn glass btn-primary fade-ui" title="播放第二期 92 秒《飞出银河系 → 大小麦哲伦星系 · 本星系群与仙女座大星系群》电影巡礼">🚀 飞出银河·本星系群与仙女座大片</button>
      <button id="btnStartTour" class="btn glass fade-ui" title="播放第一期 72 秒《银河系·太阳系与卡冈图雅黑洞》全功能大片">🎬 第一期：银河太阳系</button>
      <button id="btnRecordVideo" class="btn glass fade-ui" title="一键录制并导出当前巡礼大片 MP4/WebM 高清视频素材">⏺ 导出视频素材</button>
      <button id="btnToggleUI" class="btn glass" title="隐藏或显示界面 (快捷键 H) — 适合直接录制纯净无水印空镜素材">纯净视野 (H)</button>
      <button id="btnScreenshot" class="btn glass btn-shot fade-ui">截图</button>
      <button id="btnTogglePanel" class="btn glass fade-ui">调控面板 ▸</button>
    </div>

    <div id="controlsDrawer" class="controls-drawer glass fade-ui">
      <div class="ctrl-row ctrl-sep">
        <label>
          <strong>对数无级缩放 (10³ km ↔ 420万 ly)</strong>
          <span id="valZoomScale" class="ctrl-val">192,000 ly</span>
        </label>
        <input id="sliderZoomLog" type="range" min="0" max="1000" step="1" value="880" />
      </div>

      <div class="ctrl-row">
        <label>
          <span>黑洞吸积盘与耀斑光度</span>
          <span id="valAccretion" class="ctrl-val">1.15</span>
        </label>
        <input id="sliderAccretion" type="range" min="0.2" max="2.5" step="0.05" value="1.15" />
      </div>

      <div class="ctrl-row">
        <label>
          <span>星际尘埃消光 (暗裂谷/尘埃环)</span>
          <span id="valDust" class="ctrl-val">1.00</span>
        </label>
        <input id="sliderDust" type="range" min="0" max="2.2" step="0.05" value="1.00" />
      </div>

      <div class="ctrl-row">
        <label>
          <span>H-II 发射星云强度 (Hα/OIII)</span>
          <span id="valNebula" class="ctrl-val">1.20</span>
        </label>
        <input id="sliderNebula" type="range" min="0" max="2.5" step="0.05" value="1.20" />
      </div>

      <div class="ctrl-row">
        <label>
          <span>HDR 曝光增益</span>
          <span id="valExposure" class="ctrl-val">1.08</span>
        </label>
        <input id="sliderExposure" type="range" min="0.4" max="2.2" step="0.05" value="1.08" />
      </div>

      <div class="ctrl-row">
        <label>
          <span>轨道与流体演化速率</span>
          <span id="valSpeed" class="ctrl-val">1.0x</span>
        </label>
        <input id="sliderSpeed" type="range" min="0" max="5" step="0.1" value="1.0" />
      </div>

      <div class="ctrl-footer">
        <label class="chk-wrap">
          <input id="chkLabels" type="checkbox" checked />
          <span>天体标签与轨道线</span>
        </label>
        <select id="selQuality">
          <option value="low">流畅档</option>
          <option value="med" selected>高清档</option>
          <option value="ultra">极致档</option>
        </select>
      </div>

      <div class="help-tip">
        左键旋转 · 滚轮跨 18 数量级无断层缩放 · 右键平移 · H 键纯净空镜录制
      </div>
    </div>
  </div>

  <!-- Bottom 1:1 Astrophysical Destinations Bar (Shown in Free Exploration Mode) -->
  <div id="hudBottomBox" style="display: none;" class="preset-wrap fade-ui">
    <div id="presetBar" class="preset-bar glass">
      <button data-preset="localgroup" class="preset-btn">本星系群全景 (300万ly)</button>
      <button data-preset="lmc" class="preset-btn">大麦哲伦星系 LMC · 3.2万 ly</button>
      <button data-preset="tarantula_r136" class="preset-btn">蜘蛛星云 30 Dor · R136a1 恒星之王</button>
      <button data-preset="sn1987a" class="preset-btn">SN 1987A 超新星三环珍珠链</button>
      <button data-preset="smc" class="preset-btn">小麦哲伦星系 SMC · 杜鹃座47</button>
      <button data-preset="ngc346" class="preset-btn">SMC 育星暴区 NGC 346</button>
      <button data-preset="barnard_ngc6822" class="preset-btn">巴纳德星系 NGC 6822</button>
      <button data-preset="ic10" class="preset-btn">本星系群星暴星系 IC 10</button>
      <button data-preset="andromeda_group" class="preset-btn">仙女座大星系群</button>
      <button data-preset="m31" class="preset-btn active">仙女座大星系 M31</button>
      <button data-preset="m32" class="preset-btn">致密伴星系 M32</button>
      <button data-preset="m110" class="preset-btn">矮椭圆伴星系 M110</button>
      <button data-preset="m33" class="preset-btn">三角座星系 M33·NGC 604</button>
      <button data-preset="mayall2" class="preset-btn">梅耶尔 II (G1) 巨星团</button>
      <button data-preset="ngc206" class="preset-btn">NGC 206 蓝超巨星云</button>
      <button data-preset="hubble_v1" class="preset-btn">哈勃造父变星 M31-V1</button>
      <button data-preset="ae_and" class="preset-btn">高光度蓝变星 AE And</button>
      <button data-preset="m31_bh" class="preset-btn">仙女座双核 P1/P2·M31*黑洞</button>
      <button data-preset="pa99n2b" class="preset-btn">河外行星 PA-99-N2 b</button>
      <button data-preset="overview" class="preset-btn">银河全景</button>
      <button data-preset="sgra" class="preset-btn">银心黑洞 Sgr A*</button>
      <button data-preset="scluster" class="preset-btn">S2 恒星轨道</button>
      <button data-preset="solarsystem" class="preset-btn">太阳系全景 (60.2°)</button>
      <button data-preset="sun" class="preset-btn">太阳 Sol</button>
      <button data-preset="mercury" class="preset-btn">水星·卡洛里/蜘蛛纹</button>
      <button data-preset="venus" class="preset-btn">金星·硫酸Y波云</button>
      <button data-preset="earth" class="preset-btn">地球·卫星锋面云与夜光</button>
      <button data-preset="earthrise" class="preset-btn">地月同框·阿波罗地出</button>
      <button data-preset="moon" class="preset-btn">月球·正面月海与辐射坑</button>
      <button data-preset="mars" class="preset-btn">火星·奥林匹斯/水手谷雾</button>
      <button data-preset="jupiter" class="preset-btn">木星·大红斑与凌木影</button>
      <button data-preset="io" class="preset-btn">木卫一 Io</button>
      <button data-preset="europa" class="preset-btn">木卫二 Europa</button>
      <button data-preset="ganymede" class="preset-btn">木卫三 Ganymede</button>
      <button data-preset="callisto" class="preset-btn">木卫四 Callisto</button>
      <button data-preset="saturn" class="preset-btn">土星·扁球与卡西尼环</button>
      <button data-preset="enceladus" class="preset-btn">土卫二 Enceladus</button>
      <button data-preset="titan" class="preset-btn">土卫六 Titan</button>
      <button data-preset="uranus" class="preset-btn">天王星·2024真彩九环</button>
      <button data-preset="neptune" class="preset-btn">海王星·2024真彩与环弧</button>
      <button data-preset="triton" class="preset-btn">海卫一 Triton</button>
      <button data-preset="pluto" class="preset-btn">冥王星·斯普特尼克之心</button>
      <button data-preset="proxima" class="preset-btn">比邻星 Proxima</button>
      <button data-preset="proximab" class="preset-btn">比邻星 b</button>
      <button data-preset="localstars" class="preset-btn">恒星邻域</button>
      <button data-preset="nightsky" class="preset-btn">地球夜空银河</button>
      <button data-preset="edge" class="preset-btn">侧视银盘</button>
    </div>
  </div>

  <!-- Cinema Showcase Video Player Bar -->
  <div id="cinemaBar" class="cinema-wrap fade-ui">
    <div class="cinema-card glass">
      <div class="cinema-top">
        <div class="cinema-title-group">
          <span id="tourChapterBadge" class="ch-badge">01 / 13</span>
          <span id="tourChapterTitle" class="ch-title">从蔚蓝地球起飞 · 掠过 60.19° 黄道八大行星全景</span>
          <span id="tourParamBadge" style="display: none;" class="param-badge"></span>
        </div>
        <div class="cinema-actions">
          <button id="btnSwitchEpisode" class="btn glass" title="在《第二期：飞出银河系→大小麦哲伦·本星系群与仙女座》与《第一期：银河系与太阳系》之间切换">🎞 切换第一期 (银河系)</button>
          <button id="btnTourAudio" class="btn glass" title="开启或关闭实时合成宇宙交响配乐">🔇 开启配乐</button>
          <button id="btnCinemaRecord" class="btn glass btn-primary" title="录制当前完整大片高清视频素材并下载为 MP4/WebM">⏺ 导出高清视频</button>
          <button id="btnExitTour" class="btn glass" title="退出视频巡礼，进入全本星系群自由交互探索模式">自由探索 ✕</button>
        </div>
      </div>

      <div id="tourChapterSub" class="cinema-sub">
        跨越 18 个数量级：从地球大气层冲出银河系，穿越大小麦哲伦星系与本星系群，飞抵 254 万光年仙女座大星系群
      </div>

      <div class="cinema-scrubber">
        <button id="btnTourPlayPause" class="btn glass" style="flex-shrink: 0;">⏸ 暂停</button>
        <span id="tourTimeText" class="time-readout">00:00 / 01:32</span>
        <input id="sliderTourTime" type="range" min="0" max="92" step="0.05" value="0" />
      </div>

      <div id="tourChapterList" class="ch-list"></div>
    </div>
  </div>

  <!-- Recorded HD Video Preview & Download Modal -->
  <div id="videoPreviewModal" class="modal-backdrop">
    <div class="modal-card glass">
      <div class="cinema-top">
        <div class="cinema-title-group">
          <span class="ch-title" style="font-size: 14px;">🎬 1:1 本星系群 · 大小麦哲伦星系 · 仙女座与银河系高清视频已生成</span>
          <span id="videoMetaBadge" class="fps-badge">MP4 · 60 FPS</span>
        </div>
        <button id="btnCloseVideoModal" class="btn glass">关闭 ✕</button>
      </div>
      <video id="recordedVideoEl" controls playsinline loop class="modal-video"></video>
      <div class="cinema-top">
        <span style="font-size: 12px; color: var(--text-muted);">已内嵌 1:1 物理遥测、18 数量级比例尺、真彩天体渲染与科学字幕（如需纯净无字幕画面可按 H 键录屏）。</span>
        <div class="cinema-actions">
          <a id="downloadVideoLink" href="#" download="andromeda-local-group-1to1-ep2.mp4" class="btn glass btn-primary dl-link">⬇ 下载保存视频文件</a>
          <button id="btnCloseVideoModal2" class="btn glass">返回场景</button>
        </div>
      </div>
    </div>
  </div>

  <div id="loadingOverlay">
    <div class="spinner"></div>
    <div style="font-size:14px; font-weight:500;">正在构建 1:1 大小麦哲伦星系 (LMC/SMC)、完整本星系群、仙女座星系群与 45 万颗三维恒星...</div>
    <div style="font-size:12px; color:#94a3b8; margin-top:6px;">3.04 Mly Local Group ↔ 161.7/203.7 kly LMC &amp; SMC ↔ SN 1987A · R136a1 &amp; Solar System</div>
  </div>

"""

replacements = [
    (
        """'<div class="text-sm px-6 text-center">当前环境不支持 WebGL 2.0，请使用现代浏览器打开。</div>';""",
        """'<div style="font-size:14px;color:#f87171;padding:24px;text-align:center;">当前环境不支持 WebGL 2.0，请使用现代浏览器打开。</div>';"""
    ),
    (
        """    document.querySelectorAll('.preset-btn').forEach(btn => {
      const active = btn.dataset.preset === key;
      btn.className = active
        ? 'preset-btn px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap bg-[var(--primary)] text-[var(--primary-foreground)] transition'
        : 'preset-btn px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap hover:bg-[var(--secondary)] text-[var(--foreground)] transition';
    });""",
        """    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.preset === key);
    });"""
    ),
    (
        """    el.className = 'absolute top-0 left-0 flex items-center gap-1.5 select-none transition-opacity duration-150 ' +
                   (item.key ? 'pointer-events-auto cursor-pointer group' : 'pointer-events-none');
    el.innerHTML = `
      <span class="w-2 h-2 rounded-full marker-dot shrink-0" style="background:${item.color}; color:${item.color}"></span>
      <div class="label-pill px-2 py-0.5 rounded-md border border-[var(--border)] shadow-sm transition">
        <div class="text-xs font-medium text-[var(--foreground)] leading-tight whitespace-nowrap">${item.name}</div>
        <div class="text-xs text-[var(--muted-foreground)] leading-tight whitespace-nowrap">${item.sub}</div>
      </div>
    `;""",
        """    el.className = 'astro-label' + (item.key ? ' clickable' : '');
    el.innerHTML = `
      <span class="marker-dot" style="background:${item.color}; color:${item.color}"></span>
      <div class="label-box">
        <div class="label-title">${item.name}</div>
        <div class="label-sub">${item.sub}</div>
      </div>
    `;"""
    ),
    (
        """drawer.style.display = panelOpen ? 'block' : 'none';""",
        """drawer.style.display = panelOpen ? 'flex' : 'none';"""
    ),
    (
        """return `<button data-ch="${idx}" class="ch-jump-btn px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap hover:bg-[var(--secondary)] text-[var(--muted-foreground)] transition">${label}</button>`;""",
        """return `<button data-ch="${idx}" class="ch-jump-btn">${label}</button>`;"""
    ),
    (
        """    document.querySelectorAll('.ch-jump-btn').forEach(btn => {
      const active = parseInt(btn.dataset.ch, 10) === chIdx;
      btn.className = active
        ? 'ch-jump-btn px-2 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap bg-[var(--primary)] text-[var(--primary-foreground)] transition'
        : 'ch-jump-btn px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap hover:bg-[var(--secondary)] text-[var(--muted-foreground)] transition';
    });""",
        """    document.querySelectorAll('.ch-jump-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.ch, 10) === chIdx);
    });"""
    ),
    (
        """const html = `<span class="inline-block w-2 h-2 rounded-full bg-red-500 rec-dot mr-1 pointer-events-none"></span><span class="pointer-events-none">完成保存 (${tStr}/${durStr})</span>`;""",
        """const html = `<span class="rec-dot"></span><span style="pointer-events:none">完成保存 (${tStr}/${durStr})</span>`;"""
    ),
]

for old, new in replacements:
    assert old in script_part, f"Missing target snippet:\n{old[:120]}"
    script_part = script_part.replace(old, new, 1)

dst_path.write_text(header_html + script_part, encoding="utf-8")
print(f"Successfully generated {dst_path} ({len((header_html + script_part).splitlines())} lines)")
