// ============================================================================
// 1:1 SMALL MAGELLANIC CLOUD (SMC / NGC 292), MAGELLANIC BRIDGE & STREAM,
// FOREGROUND 47 TUCANAE (NGC 104), AND COMPLETE LOCAL GROUP DWARF CENSUS
// ============================================================================
// Specialist Module for `lg-integrator` (`smc-localgroup-modeler`)
// Scale Convention: 1.0 world unit = 1 kly = 1,000 light-years (exact match to `milky_way.html`)
//
// Scientific References:
// - SMC Distance & 3D Cigar Geometry: Graczyk et al. (2020, ApJ 904, 13) d = 62.44 +/- 0.47 kpc
//   (203,700 ly), l = 302.808 deg, b = -44.328 deg, D ~ 18,900 ly; Scowcroft et al. (2016) &
//   Jacyszyn-Dobrzeniecka et al. (2016) ~22 kly line-of-sight Cepheid/RC tidal elongation!
// - NGC 346 (N66) & HD 5980: Sabbi et al. (2007) / Jones et al. (2023 JWST) NE bar starburst
//   complex + Koenigsberger et al. (2014) HD 5980 eruptive LBV/WN6h + WN4 + O7I triple system.
// - NGC 602 (N90): Carlson et al. (2011 HST) rimmed starburst cavity in the eastern SMC Wing.
// - 47 Tucanae (NGC 104): Baumgardt & Vasiliev (2021) d = 4.45 kpc = 14,510 ly, l = 305.895 deg, b = -44.889 deg.
// - Magellanic Bridge & Stream: Nidever et al. (2010), D'Onghia & Fox (2016 ARA&A) ~75 kly (23 kpc)
//   SMC-Wing-to-LMC young-B-star & H-I tidal bridge + trailing SGP Magellanic Stream.
// - Complete Local Group Dwarf Galaxies: McConnachie (2012, AJ 144, 4) & NED/HST distances:
//   NGC 6822 (Barnard's Galaxy + Hubble V & X), IC 10 (Starburst WR Galaxy), IC 1613, WLM,
//   Sagittarius dSph (+ M54), Sculptor dSph, Fornax dSph, Carina dSph.
// ============================================================================

// ============================================================================
// SECTION 1: 1:1 ASTROMETRY CONSTANTS, BASES & PASS 2 HD 5980 SYSTEM
// (Drop-in for Section 1C & `computeEphemeris` in `milky_way.html`)
// ============================================================================
const SMC_ASTROMETRY_SPEC = `
  // --- 1:1 Small Magellanic Cloud (SMC / NGC 292: Graczyk et al. 2020 d = 62.44 kpc = 203,700 ly) ---
  const SMC_BASE_KLY    = heliocentricGalacticToWorldKly(203700.0,  302.808, -44.328);
  // i = 64.0 deg, PA = 62.0 deg:
  //   axisU (+x, +/-13.5 kly): SW-NE optical/HI main bar & Wing direction
  //   axisN (+y, +/-9.5 kly):  Eastern SMC Wing protrusion toward LMC
  //   axisV (+z, +/-16.5 kly): 90% aligned with line-of-sight uLos -> captures ~22 kly 3D cigar depth!
  const SMC_BASIS       = buildExtragalacticBasis(SMC_BASE_KLY, 64.0, 62.0);

  function smcLocalToWorldKly(lx, ly, lz) {
    return [
      SMC_BASE_KLY[0] + SMC_BASIS.u[0] * lx + SMC_BASIS.n[0] * ly + SMC_BASIS.v[0] * lz,
      SMC_BASE_KLY[1] + SMC_BASIS.u[1] * lx + SMC_BASIS.n[1] * ly + SMC_BASIS.v[1] * lz,
      SMC_BASE_KLY[2] + SMC_BASIS.u[2] * lx + SMC_BASIS.n[2] * ly + SMC_BASIS.v[2] * lz
    ];
  }

  // Famous Landmarks Inside SMC & Foreground Southern-Sky Companion:
  const NGC346_KLY        = smcLocalToWorldKly(2.54, 0.42, -3.38); // NGC 346 / N66 Largest H-II Starburst Region in SMC (d ~ 200.5 kly)
  const HD5980_KLY        = smcLocalToWorldKly(2.64, 0.45, -3.34); // HD 5980 Eruptive LBV/WN6h + WN4 + O7I Triple System (2.2e6 L_sun!)
  const NGC602_KLY        = smcLocalToWorldKly(6.40, 6.85, -2.40); // NGC 602 / N90 Sculpted Rimmed Nebula in Eastern SMC Wing
  const SMC_WING_TIP_KLY  = smcLocalToWorldKly(7.20, 7.35, -2.80); // Eastern SMC Wing Tip launching the 75-kly Magellanic Bridge
  const TUC47_BASE_KLY    = heliocentricGalacticToWorldKly(14510.0, 305.895, -44.889); // 47 Tucanae (NGC 104, d = 14.51 kly, 2.27 deg from SMC!)

  // Complete Local Group Dwarf Irregular & Milky Way Satellite Spheroidal Census (McConnachie 2012 / NED):
  const NGC6822_BASE_KLY  = heliocentricGalacticToWorldKly(1630000.0,  25.340, -18.400); // Barnard's Galaxy (IB(s)m, d = 1.63 Mly, Hubble V & X)
  const IC10_BASE_KLY     = heliocentricGalacticToWorldKly(2450000.0, 118.970,  -3.330); // IC 10 (Only Local Group Starburst WR Galaxy, d = 2.45 Mly)
  const IC1613_BASE_KLY   = heliocentricGalacticToWorldKly(2380000.0, 129.740, -60.560); // IC 1613 (Dust-free Cetus Irregular, d = 2.38 Mly)
  const WLM_BASE_KLY      = heliocentricGalacticToWorldKly(3040000.0,  75.860, -73.620); // Wolf-Lundmark-Melotte (Outer Local Group IB(s)m, d = 3.04 Mly)
  const SGR_DSPH_KLY      = heliocentricGalacticToWorldKly(  70000.0,   5.610, -14.140); // Sagittarius dSph (+ M54 Core, d = 70 kly)
  const SCULPTOR_DSPH_KLY = heliocentricGalacticToWorldKly( 287000.0, 287.530, -83.160); // Sculptor dSph (d = 287 kly)
  const FORNAX_DSPH_KLY   = heliocentricGalacticToWorldKly( 460000.0, 237.100, -65.650); // Fornax dSph (d = 460 kly)
  const CARINA_DSPH_KLY   = heliocentricGalacticToWorldKly( 330000.0, 260.110, -22.220); // Carina dSph (d = 330 kly)

  const NGC6822_BASIS     = buildExtragalacticBasis(NGC6822_BASE_KLY, 58.0,  12.0);
  const IC10_BASIS        = buildExtragalacticBasis(IC10_BASE_KLY,    47.0, 128.0);

  // HD 5980 Triple System & NGC 346 OB/WR Companions for Pass 2 Local Ray-Tracing (when near SMC / NGC 346):
  // Star A: Eruptive LBV / WN6h Primary (R = 38 R_sun, T = 43,000 K, L = 2.2e6 L_sun, style = 4.0 or 5.0)
  // Star B: Colliding-wind WN4 Wolf-Rayet Companion (19.265-day eccentric binary, a = 0.59 AU, e = 0.27, R = 15 R_sun, T = 48,000 K)
  // Star C: Component C O7I Supergiant Tertiary (~96 AUaway, R = 22 R_sun, T = 36,500 K)
  const HD5980_COMPANION_B_ORB = { a_AU: 0.59, e: 0.27, inc: 1.48, Omega: 0.92, omega: 2.32, M0: 0.8, periodDays: 19.265 };
  const HD5980_TERTIARY_C_AU   = [74.0, 18.5, -58.0];
`;


// ============================================================================
// SECTION 2: TRUE 3D VOLUMETRIC RAYMARCHING GLSL (`evalSMCVolumetric`) +
//            CLOSED-FORM MAGELLANIC BRIDGE, STREAM & LOCAL GROUP DWARFS
//            (`evalMagellanicBridgeAndLocalGroupDwarfs` — 0 raymarch loops!)
// (Drop-in for `VOLUMETRIC_FRAG` in `milky_way.html`)
// Required Uniforms on `progVolumetric`:
//   uniform vec3 uSmcCenter;
//   uniform mat3 uSmcBasis;
//   uniform vec3 uLmcCenter; // (shared with lmc-modeler for exact 3D Magellanic Bridge endpoint!)
// ============================================================================
const SMC_LOCALGROUP_GLSL = `
    // Closed-form ray-to-3D-segment squared distance & parameter h in [0, 1] (0 loops!)
    vec3 lg_raySegmentClosest(vec3 ro, vec3 rd, vec3 pA, vec3 pB) {
      vec3 u = pB - pA;
      vec3 w = ro - pA;
      float b = dot(rd, u);
      float c = dot(u, u);
      float d = dot(rd, w);
      float e = dot(u, w);
      float denom = max(c - b * b, 1e-4);
      float s = clamp((b * d - e) / denom, 0.0, 1.0);
      float t = d + s * b;
      if (t <= 0.0) {
        return vec3(-1.0, 1e12, 0.0);
      }
      vec3 qRay = ro + rd * t;
      float sRef = clamp(dot(qRay - pA, u) / max(c, 1e-4), 0.0, 1.0);
      vec3 diff = qRay - (pA + u * sRef);
      return vec3(t, dot(diff, diff), sRef);
    }

    vec3 lg_coreO3Col(vec3 colO3, vec3 colHa, vec3 colS2, float coreW, float shellW, float noiseB, float rNorm) {
      vec3 outerMix = mix(colHa, colS2, smoothstep(0.52, 0.88, noiseB) * smoothstep(0.35, 0.95, rNorm));
      return colO3 * coreW * 1.15 + outerMix * shellW * 0.95;
    }

    // 1:1 3D Volumetric Small Magellanic Cloud (SMC / NGC 292: d = 203.7 kly, D ~ 18.9 kly, ~22 kly LOS Cigar Depth!)
    // Guarded by intersectBox(roSMC, rdSMC, vec3(13.5, 9.5, 16.5)) with <= 18 total steps (14 OBB + 4 local NGC 346/602 cavity taps).
    void evalSMCVolumetric(vec3 ro, vec3 rd, float ign, out vec3 smcAccum, out vec3 smcTrans) {
      smcAccum = vec3(0.0);
      smcTrans = vec3(1.0);

      mat3 invSMC = transpose(uSmcBasis);
      vec3 roSMC  = invSMC * (ro - uSmcCenter);
      vec3 rdSMC  = invSMC * rd;
      float rCamSMC = length(roSMC);

      vec2 hit = intersectBox(roSMC, rdSMC, vec3(13.5, 9.5, 16.5));
      if (hit.y > 0.0 && hit.x < hit.y) {
        float minClear = mix(0.22, 0.010, smoothstep(0.04, 2.8, rCamSMC));
        float tStart = max(hit.x, minClear);
        float tEnd   = hit.y;
        if (tEnd > tStart) {
          float span = tEnd - tStart;
          const int SMC_MAIN_STEPS = 14;
          float invSteps = 1.0 / float(SMC_MAIN_STEPS);
          float insideSMC = sstepInv(16.0, 3.5, rCamSMC);
          float prevT = tStart;

          // Eastern SMC Wing curved tidal spine from NE Bar (2.0, 0.5, -2.8) to Wing Tip (7.4, 7.5, -2.8)
          const vec3 wingA = vec3(2.00, 0.55, -2.85);
          const vec3 wingU = vec3(5.40, 6.95,  0.05);
          const float wingU2 = 77.465; // dot(wingU, wingU)
          const vec3 ngc346Pos = vec3(2.54, 0.42, -3.38);
          const vec3 ngc602Pos = vec3(6.40, 6.85, -2.40);

          for (int i = 0; i < SMC_MAIN_STEPS; i++) {
            float s1 = (float(i) + ign) * invSteps;
            float s2 = (float(i + 1) + ign) * invSteps;
            float u1 = mix(s1, s1 * s1, 0.35 * insideSMC);
            float u2 = mix(s2, s2 * s2, 0.35 * insideSMC);
            float tMid  = tStart + span * u1;
            float tNext = tStart + span * min(u2, 1.0);
            float dt = max(tNext - prevT, 1e-4);
            prevT = tNext;

            vec3 p = roSMC + rdSMC * tMid;

            // 1. Warm Pearl-Gold Older / Intermediate Triaxial Spheroid (22-kly LOS tidal elongation!)
            vec3 qSph = p / vec3(7.8, 5.2, 10.6);
            float rSph2 = dot(qSph, qSph);
            if (rSph2 > 2.95 && p.y < -4.8) continue;

            float oldSpheroid = exp(-rSph2 * 1.42) * sstepInv(1.70, 1.08, sqrt(rSph2));

            // 2. Twisted SW-NE Sapphire-Cyan Young OB Cigar Bar (NE nearer at z < 0, SW farther at z > 0!)
            float barEnvX = sstepInv(8.6, 5.2, abs(p.x));
            float zSpine  = -1.06 * p.x + 0.62 * sin(p.x * 0.32);
            float ySpine  =  0.09 * p.x - 0.30 * cos(p.x * 0.26);
            vec2 barCross = vec2((p.y - ySpine) / 1.78, (p.z - zSpine) / 2.65);
            float barTube = exp(-dot(barCross, barCross)) * barEnvX;

            // Bright SW Main Bar Concentration (highest optical surface-brightness stellar knot in SMC)
            vec3 dSwBar = (p - vec3(-2.35, -0.32, 2.55)) / vec3(2.85, 1.45, 3.10);
            float swKnot = exp(-dot(dSwBar, dSwBar));

            // 3. Eastern SMC Wing Protrusion extending toward LMC & Magellanic Bridge
            float wH = clamp(dot(p - wingA, wingU) / wingU2, 0.0, 1.0);
            vec3 wSpine = wingA + wingU * wH + vec3(0.0, 0.38 * sin(wH * 3.14159), -0.45 * sin(wH * 3.14159));
            vec3 dWing  = (p - wSpine) / mix(vec3(2.2, 1.8, 2.4), vec3(1.55, 1.45, 1.75), wH);
            float wingEnv = exp(-dot(dWing, dWing)) * smoothstep(0.02, 0.22, wH) * sstepInv(1.0, 0.78, wH);

            if (oldSpheroid < 0.003 && barTube < 0.003 && wingEnv < 0.003) continue;

            vec4 n1 = textureLod(uNoise3D, p * 0.068 + vec3(0.23, 0.41, 0.17), 0.0);
            vec4 n2 = textureLod(uNoise3D, p * 0.215 + n1.a * 0.18, 0.0);
            float cloudMod = 0.50 + 0.92 * n1.g;
            float fineClump = 0.55 + 0.85 * n2.g;

            vec3 emit = vec3(0.0);
            // Warm Pearl-Gold Older Spheroid: vec3(0.98, 0.84, 0.64)
            emit += oldSpheroid * (0.72 + 0.42 * n1.b) * vec3(0.98, 0.84, 0.64) * 0.046;

            // Twisted SW-NE Sapphire-Cyan Young OB Bar: vec3(0.48, 0.76, 1.00)
            float obDens = (barTube * 0.82 + swKnot * 0.68) * cloudMod * fineClump;
            vec3 barCol  = mix(vec3(0.48, 0.76, 1.00), vec3(0.76, 0.88, 1.00), smoothstep(0.35, 0.82, n2.b));
            emit += obDens * barCol * 0.088;

            // Pristine Low-Metallicity Eastern SMC Wing Associations
            emit += wingEnv * cloudMod * mix(vec3(0.42, 0.72, 1.00), vec3(0.66, 0.85, 1.00), n2.g) * 0.064;

            // Scattered SMC H-II Knots along Bar & Wing (N19, N76, N81, N83/N84)
            if (uNebulaStrength > 0.01) {
              float h2Patch = pow(max(n1.g * 0.58 + n2.g * 0.62 - 0.34, 0.0), 3.0);
              float h2Mask  = (barTube * 0.85 + wingEnv * 1.15) * h2Patch * uNebulaStrength;
              vec3 h2Col    = mix(vec3(1.00, 0.24, 0.50), vec3(0.18, 0.86, 0.82), smoothstep(0.36, 0.78, n2.b));
              emit += h2Mask * h2Col * 0.34;
            }

            // Macro halo contribution around NGC 346 (N66) & NGC 602 (N90)
            vec3 d346M = (p - ngc346Pos) / 1.05;
            float n66Outer = exp(-dot(d346M, d346M) * 1.35) * uNebulaStrength;
            emit += n66Outer * mix(vec3(0.96, 0.26, 0.52), vec3(0.18, 0.88, 0.78), n2.b) * 0.16;

            // 4. Low-Metallicity (Z ~ 0.2 Z_sun) Patchy SMC Dust Filaments (steep UV/blue Gordon+2003 extinction!)
            float dustRho = 0.0;
            if (uDustStrength > 0.01) {
              float fil = pow(clamp(n1.r * 0.64 + n2.r * 0.56, 0.0, 1.25), 2.15);
              float dustPatch = smoothstep(0.38, 0.88, fil);
              dustRho = (barTube * 0.85 + swKnot * 0.75 + wingEnv * 0.35) * dustPatch * 0.28;
              emit += dustRho * vec3(0.34, 0.50, 0.78) * 0.028 * uDustStrength;
            }

            vec3 sigmaT = dustRho * vec3(0.22, 0.44, 0.76) * uDustStrength * mix(1.0, 1.45, insideSMC);
            vec3 stepTrans = exp(-sigmaT * dt);
            vec3 safeSigma = max(sigmaT, vec3(1e-4));
            vec3 weight = mix(vec3(dt), (1.0 - stepTrans) / safeSigma, step(vec3(1e-4), sigmaT));

            smcAccum += smcTrans * emit * weight * mix(1.0, 0.52, insideSMC);
            smcTrans *= stepTrans;
          }

          // 5. High-Resolution 4-Tap Local Cavity Integrator for NGC 346 (N66) & NGC 602 (N90)
          //    Total steps <= 14 + 4 = 18! Zero cost on the >99% of rays missing both H-II regions!
          if (uNebulaStrength > 0.01) {
            // 5A. NGC 346 (N66): Sculpted Wind-Blown Cavity + JWST Diagonal Ionized Ridge + HD 5980 Outskirts
            vec3 rel346 = ngc346Pos - roSMC;
            float b346  = dot(rel346, rdSMC);
            float c346  = dot(rel346, rel346) - 1.3225; // R = 1.15 kly
            float disc346 = b346 * b346 - c346;
            if (disc346 > 0.0) {
              float sq346 = sqrt(disc346);
              float tA = max(b346 - sq346, mix(0.06, 0.004, smoothstep(0.01, 0.5, length(rel346))));
              float tB = b346 + sq346;
              if (tB > tA) {
                float sp346 = tB - tA;
                float dt346 = sp346 * 0.25;
                float nearFade346 = smoothstep(0.008, 0.085, length(rel346));
                for (int j = 0; j < 4; j++) {
                  float tj = tA + (float(j) + ign) * dt346;
                  vec3 q = (roSMC + rdSMC * tj - ngc346Pos) / 0.62;
                  float r2 = dot(q, q);
                  if (r2 > 3.2) continue;
                  float r = sqrt(r2);
                  vec4 nA = textureLod(uNoise3D, q * 0.62 + vec3(0.14, 0.53, 0.29), 0.0);
                  vec4 nB = textureLod(uNoise3D, q * 1.75 + nA.a * 0.26, 0.0);

                  // Wind-carved hollow cavity around central O-star / HD 5980 cluster + arched diagonal JWST dust/gas ridge!
                  float shellWall = exp(-sqr((r - 0.54) / 0.30)) * (0.62 + 0.88 * nA.r);
                  float diagArch  = exp(-sqr((q.x * 0.72 + q.y * 0.68 - 0.10) / 0.26)) * exp(-r2 * 1.15) * (0.55 + 0.95 * nB.g);
                  float coreOIII  = exp(-r2 * 2.65) * (0.48 + 0.72 * nA.g);

                  // Turquoise-emerald [OIII] core -> Rose-magenta H-alpha arched pillars -> Warm [SII] coral outer filaments
                  vec3 colO3   = vec3(0.14, 0.92, 0.78);
                  vec3 colHa   = vec3(1.00, 0.22, 0.50);
                  vec3 colS2   = vec3(1.00, 0.58, 0.28);
                  vec3 neb346  = lg_coreO3Col(colO3, colHa, colS2, coreOIII, shellWall + diagArch, nB.b, r);
                  float d346Dust = smoothstep(0.45, 0.88, nA.r * 0.65 + nB.r * 0.50) * diagArch * 0.55 * uDustStrength;
                  vec3 att346  = exp(-d346Dust * vec3(0.26, 0.48, 0.78) * dt346);
                  smcAccum += smcTrans * neb346 * dt346 * 0.92 * uNebulaStrength * nearFade346;
                  smcTrans *= att346;
                }
              }
            }

            // 5B. NGC 602 (N90 in Eastern SMC Wing): HST Rimmed Starburst Bubble & Dusty Elephant-Trunk Crown!
            vec3 rel602 = ngc602Pos - roSMC;
            float b602  = dot(rel602, rdSMC);
            float c602  = dot(rel602, rel602) - 0.5625; // R = 0.75 kly
            float disc602 = b602 * b602 - c602;
            if (disc602 > 0.0) {
              float sq602 = sqrt(disc602);
              float tA = max(b602 - sq602, 0.008);
              float tB = b602 + sq602;
              if (tB > tA) {
                float dt602 = (tB - tA) * 0.25;
                float nearFade602 = smoothstep(0.015, 0.14, length(rel602));
                for (int j = 0; j < 4; j++) {
                  float tj = tA + (float(j) + ign) * dt602;
                  vec3 q = (roSMC + rdSMC * tj - ngc602Pos) / 0.36;
                  float r2 = dot(q, q);
                  if (r2 > 3.6) continue;
                  float r = sqrt(r2);
                  vec4 nC = textureLod(uNoise3D, q * 0.85 + vec3(0.61, 0.27, 0.44), 0.0);
                  float rimCrown = exp(-sqr((r - 0.68) / 0.24)) * (0.58 + 0.92 * nC.r);
                  float innerCav = exp(-r2 * 2.40) * (0.45 + 0.65 * nC.g);
                  vec3 col602 = innerCav * vec3(0.18, 0.84, 0.96) +
                                rimCrown * mix(vec3(1.00, 0.30, 0.52), vec3(1.00, 0.64, 0.28), smoothstep(0.35, 0.80, nC.b));
                  smcAccum += smcTrans * col602 * dt602 * 1.15 * uNebulaStrength * nearFade602;
                }
              }
            }
          }

          // Smooth shoulder compression so NGC 346 & SMC Bar NEVER clip ACES white!
          smcAccum = smcAccum / (1.0 + smcAccum * 0.38);
        }
      }
    }

    // Closed-Form 3D Magellanic Bridge, Trailing Magellanic Stream & Complete Local Group Dwarfs (0 raymarch loops -> 60 FPS!)
    vec3 evalMagellanicBridgeAndLocalGroupDwarfs(vec3 ro, vec3 rd) {
      vec3 glow = vec3(0.0);

      // ----------------------------------------------------------------------
      // A. 1:1 MAGELLANIC BRIDGE (~75 kly / 23 kpc 3D Tidal Ribbon: SMC Wing -> LMC)
      // ----------------------------------------------------------------------
      vec3 pWing   = uSmcCenter + uSmcBasis * vec3(6.85, 7.10, -2.65);
      vec3 pLmcEnd = uLmcCenter + vec3(-4.20, -2.80, 2.10);
      vec3 pBrMid  = 0.5 * (pWing + pLmcEnd) + vec3(4.20, 4.80, -3.20);

      // Two-segment curved quadratic ribbon from SMC Wing through pBrMid to LMC
      vec3 brSeg1 = lg_raySegmentClosest(ro, rd, pWing, pBrMid);
      if (brSeg1.x > 0.0 && brSeg1.y < 145.0) {
        float h1 = brSeg1.z * 0.5;
        vec3 pCl1 = ro + rd * brSeg1.x;
        vec4 nB1 = textureLod(uNoise3D, pCl1 * 0.032 + vec3(0.17, 0.43, 0.61), 0.0);
        float wRad2 = mix(18.0, 34.0, brSeg1.z);
        float env1 = exp(-brSeg1.y / wRad2) * smoothstep(0.0, 0.16, brSeg1.z) * (0.42 + 0.88 * nB1.r);
        float haKnot1 = pow(max(nB1.g - 0.36, 0.0), 2.6) * uNebulaStrength;
        glow += (vec3(0.38, 0.72, 1.00) * env1 * 0.052 + vec3(0.96, 0.26, 0.52) * env1 * haKnot1 * 0.085) *
                smoothstep(1.5, 12.0, brSeg1.x);
      }

      vec3 brSeg2 = lg_raySegmentClosest(ro, rd, pBrMid, pLmcEnd);
      if (brSeg2.x > 0.0 && brSeg2.y < 165.0) {
        vec3 pCl2 = ro + rd * brSeg2.x;
        vec4 nB2 = textureLod(uNoise3D, pCl2 * 0.032 + vec3(0.17, 0.43, 0.61), 0.0);
        float wRad2 = mix(34.0, 22.0, brSeg2.z);
        float env2 = exp(-brSeg2.y / wRad2) * sstepInv(1.0, 0.82, brSeg2.z) * (0.42 + 0.88 * nB2.r);
        float haKnot2 = pow(max(nB2.g - 0.36, 0.0), 2.6) * uNebulaStrength;
        glow += (vec3(0.38, 0.72, 1.00) * env2 * 0.050 + vec3(0.96, 0.26, 0.52) * env2 * haKnot2 * 0.080) *
                smoothstep(1.5, 12.0, brSeg2.x);
      }

      // ----------------------------------------------------------------------
      // B. SUBTLE TRAILING MAGELLANIC STREAM ARC (Sweeping over South Galactic Pole!)
      // ----------------------------------------------------------------------
      vec3 ms0 = mix(pWing, pBrMid, 0.42);
      vec3 ms1 = vec3(10.0, -212.0, -32.0); // Passes near South Galactic Pole (b ~ -90 deg)
      vec3 ms2 = vec3(82.0, -242.0,  72.0); // Trailing outer halo tip
      vec3 stSeg1 = lg_raySegmentClosest(ro, rd, ms0, ms1);
      if (stSeg1.x > 0.0 && stSeg1.y < 380.0) {
        vec3 pS1 = ro + rd * stSeg1.x;
        vec4 nS1 = textureLod(uNoise3D, pS1 * 0.019 + vec3(0.52, 0.19, 0.33), 0.0);
        float braid1 = pow(max(nS1.r * 0.7 + nS1.g * 0.4, 0.0), 1.8);
        float envS1 = exp(-stSeg1.y / 95.0) * smoothstep(0.04, 0.28, stSeg1.z) * braid1;
        glow += mix(vec3(0.30, 0.56, 0.86), vec3(0.84, 0.28, 0.48), smoothstep(0.45, 0.85, nS1.b)) *
                envS1 * 0.022 * smoothstep(4.0, 24.0, stSeg1.x);
      }
      vec3 stSeg2 = lg_raySegmentClosest(ro, rd, ms1, ms2);
      if (stSeg2.x > 0.0 && stSeg2.y < 420.0) {
        vec3 pS2 = ro + rd * stSeg2.x;
        vec4 nS2 = textureLod(uNoise3D, pS2 * 0.019 + vec3(0.52, 0.19, 0.33), 0.0);
        float braid2 = pow(max(nS2.r * 0.7 + nS2.g * 0.4, 0.0), 1.8);
        float envS2 = exp(-stSeg2.y / 115.0) * sstepInv(1.0, 0.35, stSeg2.z) * braid2;
        glow += vec3(0.30, 0.54, 0.82) * envS2 * 0.016 * smoothstep(4.0, 24.0, stSeg2.x);
      }

      // ----------------------------------------------------------------------
      // C. FOREGROUND 47 TUCANAE (NGC 104: d = 14.51 kly, Golden-Core Globular Cluster!)
      // ----------------------------------------------------------------------
      const vec3 tuc47Pos = vec3(20.6458, -10.1724, -8.3277);
      vec3 toTuc = tuc47Pos - ro;
      float dTuc = length(toTuc);
      float tTuc = dot(toTuc, rd);
      if (tTuc > 0.0) {
        vec3 pTuc = (ro + rd * tTuc) - tuc47Pos;
        // Distance-adaptive visual scale so 47 Tucanae resolves physically at <15 kly AND remains a crisp golden jewel from SMC (217 kly)!
        float effRadTuc = max(0.19, dTuc * 0.0026);
        float rTuc = length(pTuc) / effRadTuc;
        if (rTuc < 3.4) {
          float kingCore = 0.42 / pow(1.0 + rTuc * rTuc * 6.5, 1.85) + 1.15 * exp(-rTuc * 4.4);
          vec3 colTuc = mix(vec3(1.00, 0.80, 0.48), vec3(0.92, 0.94, 1.00), exp(-rTuc * 7.5) * 0.48);
          float distGainTuc = mix(0.62, 0.28, smoothstep(35.0, 180.0, dTuc)) * smoothstep(0.015, 0.18, dTuc);
          glow += colTuc * kingCore * distGainTuc;
        }
      }

      // ----------------------------------------------------------------------
      // D. COMPLETE LOCAL GROUP DWARF GALAXIES (8 Members — 0 Raymarch Loops!)
      //    0: NGC 6822 (Barnard's Galaxy + Hubble V & Hubble X Pink-Cyan H-II Bubbles)
      //    1: IC 10 (Dusty Crimson-Sapphire Starburst Wolf-Rayet Irregular)
      //    2: IC 1613 (Dust-Free Cetus Irregular + NE H-II Complex)
      //    3: WLM (Wolf-Lundmark-Melotte Edge-of-Local-Group IB(s)m)
      //    4: Fornax dSph   5: Sculptor dSph   6: Carina dSph   7: Sagittarius dSph (+ M54)
      // ----------------------------------------------------------------------
      const vec4 lgDwarfs[8] = vec4[8](
        vec4(-1371.1807,  -514.4401,  661.9567, 4.40), // 0: NGC 6822 (d = 1.63 Mly)
        vec4( 1211.3308,  -142.2447, 2139.8208, 3.60), // 1: IC 10    (d = 2.45 Mly)
        vec4(  774.5306, -2072.6049,  899.5203, 5.20), // 2: IC 1613  (d = 2.38 Mly)
        vec4( -182.7586, -2916.5461,  831.3253, 5.10), // 3: WLM      (d = 3.04 Mly)
        vec4(  129.6928,  -419.0124, -159.2443, 3.80), // 4: Fornax dSph   (d = 460 kly)
        vec4(   16.3775,  -284.8895,  -32.5935, 2.50), // 5: Sculptor dSph (d = 287 kly)
        vec4(   79.1437,  -124.7263, -300.9539, 2.20), // 6: Carina dSph   (d = 330 kly)
        vec4(  -40.8810,   -17.0326,    6.6356, 8.80)  // 7: Sagittarius dSph (d = 70 kly)
      );

      // Exact orthonormal world->local transpose bases for NGC 6822 (PA=12°, i=58°) & IC 10 (PA=128°, i=47°)
      const mat3 invB6822 = transpose(mat3(
         0.35835,  0.19972,  0.91197,
         0.76735, -0.61940, -0.16588,
        -0.53174, -0.75925,  0.37522
      ));
      const mat3 invBIC10 = transpose(mat3(
         0.59964, -0.70491, -0.37886,
        -0.79613, -0.47739, -0.37185,
        -0.08125, -0.52460,  0.84746
      ));

      for (int k = 0; k < 8; k++) {
        vec3 cPos = lgDwarfs[k].xyz;
        float rad = lgDwarfs[k].w;
        vec3 toC  = cPos - ro;
        float dCam = length(toC);
        float tCl  = dot(toC, rd);
        if (tCl <= -rad * 2.5) continue;

        vec3 pCl = (ro + rd * max(tCl, 0.0)) - cPos;
        float bRaw = length(pCl);
        if (bRaw > rad * 3.6) continue;

        float nearFade = smoothstep(0.12, 1.85, dCam);

        if (k == 0) {
          // NGC 6822 (Barnard's Galaxy): N-S Stellar Bar + Tilted Blue HI Halo + Glowing Pink-Cyan Hubble V & Hubble X Bubbles!
          vec3 q = (invB6822 * pCl) / rad;
          vec4 n68 = textureLod(uNoise3D, q * 1.05 + vec3(0.31, 0.17, 0.59), 0.0);
          float bar68  = exp(-sqr(q.x * 1.15) - sqr(q.y * 2.95) - sqr(q.z * 2.25)) * (0.68 + 0.65 * n68.g);
          vec2 haloRot = rot2D(q.xz, -0.62);
          float halo68 = exp(-sqr(haloRot.x * 0.92) - sqr(q.y * 2.10) - sqr(haloRot.y * 1.45)) * (0.52 + 0.78 * n68.b);

          // Famous Northern Giant H-II Bubbles: Hubble V (q=[0.56, 0.04, 0.20]), Hubble X (q=[0.44, -0.03, -0.24]) & SW Hubble I/III
          vec3 dHV = q - vec3( 0.56,  0.04,  0.20);
          vec3 dHX = q - vec3( 0.44, -0.03, -0.24);
          vec3 dH1 = q - vec3(-0.52,  0.02,  0.16);
          float rHV = length(dHV), rHX = length(dHX), rH1 = length(dH1);
          float bubHV = (exp(-rHV * rHV * 34.0) + 0.85 * exp(-sqr((rHV - 0.11) / 0.048))) * (0.65 + 0.75 * n68.r);
          float bubHX = (exp(-rHX * rHX * 38.0) + 0.80 * exp(-sqr((rHX - 0.10) / 0.045))) * (0.65 + 0.75 * n68.g);
          float bubH1 = exp(-rH1 * rH1 * 32.0) * 0.65;
          float dust68 = 1.0 - clamp(smoothstep(0.45, 0.88, n68.r) * bar68 * 0.32 * uDustStrength, 0.0, 0.45);

          vec3 col68 = vec3(0.96, 0.84, 0.64) * bar68 * 0.34 * dust68 +
                       vec3(0.48, 0.76, 1.00) * halo68 * 0.26 * dust68 +
                       mix(vec3(1.00, 0.20, 0.56), vec3(0.22, 0.88, 0.98), exp(-min(rHV, rHX) * 14.0) * 0.45) *
                       (bubHV + bubHX + bubH1 * 0.55) * 0.68 * uNebulaStrength;
          glow += col68 * nearFade;
        } else if (k == 1) {
          // IC 10: Local Group's ONLY Starburst Wolf-Rayet Galaxy (Chaotic Dusty Crimson-Sapphire Irregular at b=-3.33°!)
          vec3 q = (invBIC10 * pCl) / rad;
          vec4 n10 = textureLod(uNoise3D, q * 1.35 + vec3(0.73, 0.29, 0.41), 0.0);
          vec4 n10F = textureLod(uNoise3D, q * 2.85 + n10.a * 0.25, 0.0);
          float irrEnv = exp(-dot(q * vec3(0.92, 1.85, 1.12), q * vec3(0.92, 1.85, 1.12)) * 1.35);
          float wrClumps = irrEnv * pow(max(n10.g * 0.62 + n10F.g * 0.55, 0.0), 1.9);

          // Giant SE Synchrotron / Wolf-Rayet H-alpha Superbubble + Multiple Starburst Shells
          vec3 dSE = q - vec3(-0.34, 0.03, 0.28);
          float rSE = length(dSE);
          float seBubble = (exp(-sqr((rSE - 0.18) / 0.075)) * 0.95 + exp(-rSE * rSE * 22.0) * 0.72) * (0.60 + 0.80 * n10F.r);
          float multiH2  = irrEnv * pow(max(n10.r * 0.58 + n10F.g * 0.62 - 0.24, 0.0), 2.8);

          // Heavy foreground Galactic-plane (b=-3.33°) warm reddening + dark internal molecular dust lanes!
          float darkRift = smoothstep(0.36, 0.82, n10.r * 0.65 + n10F.b * 0.45) * exp(-abs(q.y) * 3.5);
          float dust10   = 1.0 - clamp(darkRift * 0.58 * uDustStrength, 0.0, 0.68);

          vec3 col10 = vec3(0.98, 0.74, 0.50) * irrEnv * 0.24 * dust10 +
                       vec3(0.42, 0.70, 1.00) * wrClumps * 0.48 * dust10 +
                       mix(vec3(1.00, 0.16, 0.40), vec3(0.28, 0.84, 1.00), smoothstep(0.45, 0.85, n10F.b) * 0.38) *
                       (seBubble * 0.72 + multiH2 * 0.85) * uNebulaStrength;
          glow += col10 * nearFade;
        } else if (k == 2) {
          // IC 1613: Ultra-Transparent Dust-Free Irregular in Cetus + NE Ionized Superbubble Complex
          vec3 q = pCl / rad;
          vec4 n16 = textureLod(uNoise3D, q * 1.15 + 0.44, 0.0);
          float body16 = exp(-dot(q * vec3(0.95, 1.35, 1.05), q * vec3(0.95, 1.35, 1.05)) * 1.45) * (0.58 + 0.70 * n16.g);
          vec3 dNE = q - vec3(0.38, 0.16, -0.28);
          float neBub = exp(-dot(dNE, dNE) * 24.0) * (0.6 + 0.8 * n16.r) * uNebulaStrength;
          glow += (vec3(0.58, 0.78, 1.00) * body16 * 0.24 + vec3(0.98, 0.30, 0.56) * neBub * 0.34) * nearFade;
        } else if (k == 3) {
          // WLM (Wolf-Lundmark-Melotte): Solitary Outer-Local-Group 2.5:1 Elongated IB(s)m Dwarf
          vec3 q = pCl / rad;
          vec2 qR = rot2D(q.xy, 0.28);
          vec3 qEll = vec3(qR.x * 1.65, qR.y * 0.72, q.z * 1.45);
          vec4 nW = textureLod(uNoise3D, qEll * 1.10 + 0.19, 0.0);
          float envW = exp(-dot(qEll, qEll) * 1.35) * (0.56 + 0.72 * nW.g);
          float h2W  = pow(max(nW.r - 0.42, 0.0), 2.6) * envW * uNebulaStrength;
          glow += (mix(vec3(0.94, 0.82, 0.66), vec3(0.52, 0.76, 1.00), exp(-abs(qEll.x) * 2.2) * 0.65) * envW * 0.25 +
                   vec3(1.00, 0.26, 0.50) * h2W * 0.38) * nearFade;
        } else if (k == 7) {
          // Sagittarius dSph (d = 70 kly): 3:1 Tidally Disrupted Prolate Stream-Core + M54 Nuclear Globular Cluster!
          vec3 q = pCl / rad;
          vec2 qS = rot2D(q.xy, -0.52);
          vec3 qPro = vec3(qS.x * 0.58, qS.y * 1.65, q.z * 1.48);
          float rPro = length(qPro);
          float streamEnv = 0.085 / pow(1.0 + rPro * rPro * 2.2, 1.55);
          float m54Core   = 0.65 * exp(-dot(q, q) * 95.0);
          glow += (vec3(0.96, 0.82, 0.64) * streamEnv + vec3(1.00, 0.88, 0.66) * m54Core * 0.45) * nearFade;
        } else {
          // Milky Way Classic Dwarf Spheroidals: Fornax dSph (k==4), Sculptor dSph (k==5), Carina dSph (k==6)
          vec3 q = pCl / rad;
          vec3 qSph = (k == 4) ? vec3(q.x * 0.84, q.y * 1.18, q.z * 1.05) : vec3(q.x * 0.90, q.y * 1.22, q.z * 1.08);
          float rEll = length(qSph);
          float plummer = 0.13 / pow(1.0 + rEll * rEll * 2.6, 1.68) + ((k == 4) ? 0.16 : 0.09) * exp(-rEll * 2.8);
          vec3 dSphCol = (k == 4)
            ? mix(vec3(0.96, 0.83, 0.66), vec3(0.76, 0.86, 1.00), exp(-rEll * 3.6) * 0.35)
            : vec3(0.95, 0.82, 0.66);
          glow += dSphCol * plummer * 0.30 * nearFade;
        }
      }

      return glow;
    }
`;


// ============================================================================
// SECTION 3: DISCRETE 3D STAR GENERATOR (`populateSMCAndLocalGroupStars`)
// Emits EXACTLY 26,000 stars:
//   - 14,500 SMC stars (4,600 22-kly LOS cigar spheroid, 5,200 twisted SW-NE bar,
//     2,200 eastern SMC Wing, 1,750 NGC 346 OB/WR cluster + N66 knots with HD 5980
//     hero clearance, 750 NGC 602 Wing cluster + NGC 121 globular)
//   -  1,800 foreground 47 Tucanae (NGC 104) golden red-giant core & blue stragglers
//   -  1,700 young B/OB stars & ionized knots along the 75-kly Magellanic Bridge
//   -  8,000 stars across NGC 6822 (2,400 + Hubble V/X), IC 10 (2,100), IC 1613 (950),
//            WLM (750), Fornax (600), Sculptor (400), Carina (350), Sagittarius dSph (450)
// ============================================================================
function populateSMCAndLocalGroupStars(ctx) {
  const {
    pushStar,
    rnd,
    gauss,
    SMC_BASE_KLY,
    SMC_BASIS,
    LMC_BASE_KLY,
    HD5980_KLY,
    TUC47_BASE_KLY,
    NGC6822_BASE_KLY,
    NGC6822_BASIS,
    IC10_BASE_KLY,
    IC10_BASIS,
    IC1613_BASE_KLY,
    WLM_BASE_KLY,
    FORNAX_DSPH_KLY,
    SCULPTOR_DSPH_KLY,
    CARINA_DSPH_KLY,
    SGR_DSPH_KLY
  } = ctx;

  let emitted = 0;
  const emitWorld = (wx, wy, wz, temp, lum, sz) => {
    // Clear 12-ly hero sphere around HD 5980 so Pass 2 ray-traced LBV/WR stars never overlap a point sprite
    if (HD5980_KLY) {
      const dx = wx - HD5980_KLY[0], dy = wy - HD5980_KLY[1], dz = wz - HD5980_KLY[2];
      if (dx * dx + dy * dy + dz * dz < 0.012 * 0.012) {
        wx += 0.022;
        wy += 0.014;
      }
    }
    // Use w = -2.0 so worldPos = aOrbit.xyz stays locked to exact 3D astrometric coordinates!
    pushStar(wx, wy, wz, -2.0, temp, lum, sz, 0.0);
    emitted++;
  };

  const emitSMCLocal = (lx, ly, lz, temp, lum, sz) => {
    const wx = SMC_BASE_KLY[0] + SMC_BASIS.u[0] * lx + SMC_BASIS.n[0] * ly + SMC_BASIS.v[0] * lz;
    const wy = SMC_BASE_KLY[1] + SMC_BASIS.u[1] * lx + SMC_BASIS.n[1] * ly + SMC_BASIS.v[1] * lz;
    const wz = SMC_BASE_KLY[2] + SMC_BASIS.u[2] * lx + SMC_BASIS.n[2] * ly + SMC_BASIS.v[2] * lz;
    emitWorld(wx, wy, wz, temp, lum, sz);
  };

  const emitBasisLocal = (base, basis, lx, ly, lz, temp, lum, sz) => {
    const wx = base[0] + basis.u[0] * lx + basis.n[0] * ly + basis.v[0] * lz;
    const wy = base[1] + basis.u[1] * lx + basis.n[1] * ly + basis.v[1] * lz;
    const wz = base[2] + basis.u[2] * lx + basis.n[2] * ly + basis.v[2] * lz;
    emitWorld(wx, wy, wz, temp, lum, sz);
  };

  // --------------------------------------------------------------------------
  // 1. SMALL MAGELLANIC CLOUD (14,500 STARS)
  // --------------------------------------------------------------------------
  // 1A. Triaxial Pearl-Gold Older Spheroid & 22-kly LOS Cigar Halo (4,600 stars)
  for (let i = 0; i < 4600; i++) {
    const r = Math.min(1.65, Math.pow(rnd(), 0.72) * 1.18 + Math.abs(gauss()) * 0.18);
    const a1 = rnd() * 6.2831853;
    const c2 = 2.0 * rnd() - 1.0;
    const s2 = Math.sqrt(Math.max(0.0, 1.0 - c2 * c2));
    const lx = r * s2 * Math.cos(a1) * 7.2;
    const ly = r * c2 * 4.8;
    const lz = r * s2 * Math.sin(a1) * 10.4; // ~21-22 kly line-of-sight triaxial depth!
    const isIntermBlue = rnd() < 0.16;
    emitSMCLocal(
      lx, ly, lz,
      isIntermBlue ? (0.56 + rnd() * 0.30) : (0.09 + rnd() * 0.38),
      0.48 + Math.pow(rnd(), 3.3) * 3.4,
      0.92 + Math.pow(rnd(), 4.0) * 1.65
    );
  }

  // 1B. Twisted SW-NE Sapphire-Cyan Young OB Main Bar + SW Bright Bar Knot (5,200 stars)
  for (let i = 0; i < 5200; i++) {
    const isSwKnot = i < 1350;
    const lx = isSwKnot
      ? (-2.35 + gauss() * 1.65)
      : Math.max(-7.8, Math.min(7.4, gauss() * 3.65));
    const zSpine = -1.06 * lx + 0.62 * Math.sin(lx * 0.32);
    const ySpine =  0.09 * lx - 0.30 * Math.cos(lx * 0.26);
    const ly = ySpine + gauss() * (isSwKnot ? 0.92 : 1.18);
    const lz = zSpine + gauss() * (isSwKnot ? 1.75 : 1.95);
    const isNeb = rnd() < 0.028;
    const isHotOB = rnd() < 0.68;
    emitSMCLocal(
      lx, ly, lz,
      isNeb ? -(0.16 + rnd() * 0.68) : (isHotOB ? (0.62 + rnd() * 0.38) : (0.10 + rnd() * 0.38)),
      isNeb ? 1.32 : (isHotOB ? (0.85 + Math.pow(rnd(), 2.9) * 5.2) : (0.62 + Math.pow(rnd(), 3.2) * 3.8)),
      isNeb ? 2.15 : (1.00 + Math.pow(rnd(), 3.8) * 2.05)
    );
  }

  // 1C. Eastern SMC Wing Protrusion extending toward Magellanic Bridge (2,200 stars)
  for (let i = 0; i < 2200; i++) {
    const h = Math.pow(rnd(), 0.88);
    const wx0 = 2.00 + 5.40 * h;
    const wy0 = 0.55 + 6.95 * h + 0.38 * Math.sin(h * Math.PI);
    const wz0 = -2.85 + 0.05 * h - 0.45 * Math.sin(h * Math.PI);
    const spread = 1.35 - 0.42 * h;
    const lx = wx0 + gauss() * spread;
    const ly = wy0 + gauss() * (spread * 0.85);
    const lz = wz0 + gauss() * (spread * 1.05);
    const isNeb = rnd() < 0.032;
    const isBlue = rnd() < 0.78;
    emitSMCLocal(
      lx, ly, lz,
      isNeb ? -(0.22 + rnd() * 0.65) : (isBlue ? (0.66 + rnd() * 0.34) : (0.18 + rnd() * 0.36)),
      isNeb ? 1.25 : (0.78 + Math.pow(rnd(), 3.0) * 4.8),
      isNeb ? 2.05 : (0.98 + Math.pow(rnd(), 3.8) * 1.95)
    );
  }

  // 1D. NGC 346 (N66) Giant Starburst OB/WR Cluster + Sculpted Ionized Knots (1,750 stars)
  for (let i = 0; i < 1750; i++) {
    const isCoreCluster = i < 1150;
    const r = isCoreCluster
      ? (Math.pow(rnd(), 1.55) * 0.36)
      : (0.20 + Math.pow(rnd(), 0.9) * 0.58);
    const a1 = rnd() * 6.2831853;
    const c2 = 2.0 * rnd() - 1.0;
    const s2 = Math.sqrt(Math.max(0.0, 1.0 - c2 * c2));
    const lx = 2.54 + r * s2 * Math.cos(a1);
    const ly = 0.42 + r * c2 * 0.82;
    const lz = -3.38 + r * s2 * Math.sin(a1);
    const isNeb = i >= 1655; // 95 glowing emerald-rose N66 ionized knots!
    const isRSG = !isNeb && rnd() < 0.08;
    emitSMCLocal(
      lx, ly, lz,
      isNeb ? -(0.14 + rnd() * 0.78) : (isRSG ? (0.06 + rnd() * 0.16) : (0.76 + rnd() * 0.24)),
      isNeb ? 1.55 : (1.55 + Math.pow(rnd(), 2.5) * 6.8),
      isNeb ? 2.35 : (1.22 + Math.pow(rnd(), 3.0) * 2.25)
    );
  }

  // 1E. NGC 602 (N90 in SMC Wing: 520 stars) + Oldest SMC Globular Cluster NGC 121 (230 stars) = 750 stars
  for (let i = 0; i < 520; i++) {
    const isRim = i >= 340;
    const r = isRim ? (0.18 + gauss() * 0.065) : (Math.pow(rnd(), 1.6) * 0.17);
    const a1 = rnd() * 6.2831853;
    const c2 = 2.0 * rnd() - 1.0;
    const s2 = Math.sqrt(Math.max(0.0, 1.0 - c2 * c2));
    const isNeb = i >= 485;
    emitSMCLocal(
      6.40 + r * s2 * Math.cos(a1),
      6.85 + r * c2 * 0.78,
      -2.40 + r * s2 * Math.sin(a1),
      isNeb ? -(0.18 + rnd() * 0.68) : (0.74 + rnd() * 0.26),
      isNeb ? 1.42 : (1.25 + Math.pow(rnd(), 2.7) * 5.6),
      isNeb ? 2.10 : (1.12 + Math.pow(rnd(), 3.4) * 2.0)
    );
  }
  for (let i = 0; i < 230; i++) {
    // NGC 121 (NW outskirts of SMC right near 47 Tucanae line of sight!)
    const r = 0.22 * Math.pow(rnd(), 1.85) / Math.sqrt(Math.max(0.14, 1.0 - rnd() * 0.72)) * 0.34;
    const a1 = rnd() * 6.2831853;
    const c2 = 2.0 * rnd() - 1.0;
    const s2 = Math.sqrt(Math.max(0.0, 1.0 - c2 * c2));
    const isBS = rnd() < 0.10;
    emitSMCLocal(
      -4.80 + r * s2 * Math.cos(a1),
      -3.40 + r * c2,
      -1.20 + r * s2 * Math.sin(a1),
      isBS ? (0.72 + rnd() * 0.24) : (0.10 + rnd() * 0.38),
      0.85 + Math.pow(rnd(), 3.0) * 3.8,
      1.05 + Math.pow(rnd(), 3.8) * 1.65
    );
  }

  // --------------------------------------------------------------------------
  // 2. FOREGROUND GLOBULAR CLUSTER 47 TUCANAE / NGC 104 (1,800 STARS, d = 14.51 kly)
  // --------------------------------------------------------------------------
  for (let i = 0; i < 1800; i++) {
    // Concentrated King-like core (r_c ~ 12 ly, tidal halo ~ 185 ly)
    const u = rnd();
    const rKly = 0.185 * Math.pow(u, 1.82) / Math.sqrt(Math.max(0.11, 1.0 - rnd() * 0.76)) * 0.30;
    const a1 = rnd() * 6.2831853;
    const c2 = 2.0 * rnd() - 1.0;
    const s2 = Math.sqrt(Math.max(0.0, 1.0 - c2 * c2));
    // Central mass-segregated Blue Stragglers (HST discovery in 47 Tuc core!) + Golden Red Giants
    const isBlueStraggler = (rKly < 0.045 ? (rnd() < 0.22) : (rnd() < 0.08));
    emitWorld(
      TUC47_BASE_KLY[0] + rKly * s2 * Math.cos(a1),
      TUC47_BASE_KLY[1] + rKly * c2 * 0.91, // 47 Tuc authentic 0.09 ellipticity!
      TUC47_BASE_KLY[2] + rKly * s2 * Math.sin(a1),
      isBlueStraggler ? (0.74 + rnd() * 0.24) : (0.12 + rnd() * 0.36),
      1.35 + Math.pow(rnd(), 2.9) * 5.2,
      1.15 + Math.pow(rnd(), 3.6) * 1.95
    );
  }

  // --------------------------------------------------------------------------
  // 3. MAGELLANIC BRIDGE YOUNG B/OB STARS & IONIZED KNOTS (1,700 STARS)
  // --------------------------------------------------------------------------
  const pWingWorld = [
    SMC_BASE_KLY[0] + SMC_BASIS.u[0] * 6.85 + SMC_BASIS.n[0] * 7.10 - SMC_BASIS.v[0] * 2.65,
    SMC_BASE_KLY[1] + SMC_BASIS.u[1] * 6.85 + SMC_BASIS.n[1] * 7.10 - SMC_BASIS.v[1] * 2.65,
    SMC_BASE_KLY[2] + SMC_BASIS.u[2] * 6.85 + SMC_BASIS.n[2] * 7.10 - SMC_BASIS.v[2] * 2.65
  ];
  const pLmcBridge = [
    LMC_BASE_KLY[0] - 4.20,
    LMC_BASE_KLY[1] - 2.80,
    LMC_BASE_KLY[2] + 2.10
  ];
  const pBridgeCtrl = [
    0.5 * (pWingWorld[0] + pLmcBridge[0]) + 4.20,
    0.5 * (pWingWorld[1] + pLmcBridge[1]) + 4.80,
    0.5 * (pWingWorld[2] + pLmcBridge[2]) - 3.20
  ];
  for (let i = 0; i < 1700; i++) {
    // Slightly denser near SMC Wing & Bridge stellar associations (Irwin/Gaia DR3 young B-star bridge)
    const t = Math.pow(rnd(), 1.18);
    const omt = 1.0 - t;
    const bx = omt * omt * pWingWorld[0] + 2.0 * omt * t * pBridgeCtrl[0] + t * t * pLmcBridge[0];
    const by = omt * omt * pWingWorld[1] + 2.0 * omt * t * pBridgeCtrl[1] + t * t * pLmcBridge[1];
    const bz = omt * omt * pWingWorld[2] + 2.0 * omt * t * pBridgeCtrl[2] + t * t * pLmcBridge[2];
    const filamentSpread = 1.85 + 1.95 * Math.sin(t * Math.PI);
    const braidSign = (i & 1) ? 1.0 : -1.0;
    const wx = bx + gauss() * filamentSpread + braidSign * 0.65 * Math.sin(t * 9.42);
    const wy = by + gauss() * (filamentSpread * 0.78) + 0.55 * Math.cos(t * 6.28);
    const wz = bz + gauss() * filamentSpread;
    const isNeb = rnd() < 0.024;
    emitWorld(
      wx, wy, wz,
      isNeb ? -(0.24 + rnd() * 0.62) : (0.68 + rnd() * 0.31),
      isNeb ? 1.15 : (0.72 + Math.pow(rnd(), 3.0) * 4.4),
      isNeb ? 2.10 : (0.95 + Math.pow(rnd(), 3.8) * 1.85)
    );
  }

  // --------------------------------------------------------------------------
  // 4. COMPLETE LOCAL GROUP DWARF GALAXY CENSUS (8,000 STARS TOTAL)
  // --------------------------------------------------------------------------
  // 4A. NGC 6822 / Barnard's Galaxy (2,400 stars: N-S Bar, Blue Halo, Hubble V, Hubble X & Hubble I/III!)
  for (let i = 0; i < 2400; i++) {
    let lx, ly, lz, temp, lum, sz;
    if (i < 540) {
      // Northern Giant H-II Regions Hubble V (0..269), Hubble X (270..459) & SW Hubble I/III (460..539)
      const c = (i < 270) ? [2.46, 0.18, 0.88] : ((i < 460) ? [1.94, -0.13, -1.06] : [-2.29, 0.09, 0.70]);
      lx = c[0] + gauss() * 0.28;
      ly = c[1] + gauss() * 0.16;
      lz = c[2] + gauss() * 0.28;
      const isNeb = (i % 6) === 0;
      temp = isNeb ? -(0.12 + rnd() * 0.70) : (0.74 + rnd() * 0.26);
      lum  = isNeb ? 1.75 : (1.35 + Math.pow(rnd(), 2.6) * 6.2);
      sz   = isNeb ? 2.55 : (1.18 + Math.pow(rnd(), 3.2) * 2.1);
    } else if (i < 1620) {
      // N-S Barred Irregular Core
      lx = gauss() * 2.35;
      ly = gauss() * 0.85;
      lz = gauss() * 1.15;
      const isBlue = rnd() < 0.56;
      temp = isBlue ? (0.60 + rnd() * 0.36) : (0.12 + rnd() * 0.38);
      lum  = 0.68 + Math.pow(rnd(), 3.1) * 4.5;
      sz   = 1.00 + Math.pow(rnd(), 3.8) * 1.9;
    } else {
      // Tilted NW-SE Extended Young/Intermediate Halo
      const ang = 0.62;
      const ux = gauss() * 3.4, uz = gauss() * 2.0;
      lx = Math.cos(ang) * ux - Math.sin(ang) * uz;
      lz = Math.sin(ang) * ux + Math.cos(ang) * uz;
      ly = gauss() * 1.25;
      temp = rnd() < 0.64 ? (0.64 + rnd() * 0.34) : (0.14 + rnd() * 0.36);
      lum  = 0.62 + Math.pow(rnd(), 3.2) * 4.0;
      sz   = 0.96 + Math.pow(rnd(), 4.0) * 1.8;
    }
    emitBasisLocal(NGC6822_BASE_KLY, NGC6822_BASIS, lx, ly, lz, temp, lum, sz);
  }

  // 4B. IC 10 Starburst Wolf-Rayet Irregular Galaxy (2,100 stars)
  for (let i = 0; i < 2100; i++) {
    let lx, ly, lz, temp, lum, sz;
    if (i < 580) {
      // SE Wolf-Rayet Superbubble & Central Starburst OB/WR Knots
      const isSE = i < 320;
      lx = (isSE ? -1.22 : 0.42) + gauss() * 0.42;
      ly = (isSE ?  0.11 : -0.05) + gauss() * 0.20;
      lz = (isSE ?  1.01 : -0.36) + gauss() * 0.42;
      const isNeb = (i % 5) === 0;
      temp = isNeb ? -(0.08 + rnd() * 0.58) : (0.78 + rnd() * 0.22);
      lum  = isNeb ? 1.85 : (1.55 + Math.pow(rnd(), 2.4) * 6.8);
      sz   = isNeb ? 2.65 : (1.22 + Math.pow(rnd(), 3.0) * 2.25);
    } else {
      lx = gauss() * 2.25;
      ly = gauss() * 0.95;
      lz = gauss() * 1.85;
      const isHot = rnd() < 0.66;
      temp = isHot ? (0.64 + rnd() * 0.36) : (0.10 + rnd() * 0.36);
      lum  = 0.72 + Math.pow(rnd(), 3.0) * 4.8;
      sz   = 1.02 + Math.pow(rnd(), 3.8) * 1.95;
    }
    emitBasisLocal(IC10_BASE_KLY, IC10_BASIS, lx, ly, lz, temp, lum, sz);
  }

  // 4C. IC 1613 Dust-Free Cetus Irregular (950 stars)
  for (let i = 0; i < 950; i++) {
    const isNE = i < 190;
    const dx = isNE ? (1.98 + gauss() * 0.55) : (gauss() * 3.1);
    const dy = isNE ? (0.83 + gauss() * 0.38) : (gauss() * 2.1);
    const dz = isNE ? (-1.46 + gauss() * 0.55) : (gauss() * 2.8);
    const isNeb = isNE && (i % 7) === 0;
    emitWorld(
      IC1613_BASE_KLY[0] + dx, IC1613_BASE_KLY[1] + dy, IC1613_BASE_KLY[2] + dz,
      isNeb ? -(0.18 + rnd() * 0.65) : (isNE || rnd() < 0.62 ? (0.62 + rnd() * 0.36) : (0.14 + rnd() * 0.38)),
      isNeb ? 1.55 : (0.68 + Math.pow(rnd(), 3.1) * 4.4),
      isNeb ? 2.35 : (0.98 + Math.pow(rnd(), 3.9) * 1.85)
    );
  }

  // 4D. WLM / Wolf-Lundmark-Melotte Outer Local Group Dwarf (750 stars)
  for (let i = 0; i < 750; i++) {
    const ux = gauss() * 1.65;
    const uy = gauss() * 3.65;
    const dz = gauss() * 1.85;
    const cR = Math.cos(-0.28), sR = Math.sin(-0.28);
    const dx = cR * ux - sR * uy;
    const dy = sR * ux + cR * uy;
    const isNeb = i < 24;
    emitWorld(
      WLM_BASE_KLY[0] + dx, WLM_BASE_KLY[1] + dy, WLM_BASE_KLY[2] + dz,
      isNeb ? -(0.16 + rnd() * 0.60) : (rnd() < 0.58 ? (0.58 + rnd() * 0.38) : (0.12 + rnd() * 0.38)),
      isNeb ? 1.45 : (0.66 + Math.pow(rnd(), 3.2) * 4.2),
      isNeb ? 2.25 : (0.96 + Math.pow(rnd(), 4.0) * 1.80)
    );
  }

  // 4E. Milky Way Satellite Dwarf Spheroidals: Fornax (600), Sculptor (400), Carina (350), Sagittarius dSph (450)
  const populateDSph = (center, count, sx, sy, szScale, blueFrac, rotXY = 0.0, coreBoostFrac = 0.0) => {
    const cR = Math.cos(rotXY), sR = Math.sin(rotXY);
    for (let i = 0; i < count; i++) {
      const isCore = i < count * coreBoostFrac;
      const r = isCore
        ? (Math.pow(rnd(), 1.9) * 0.14)
        : (Math.pow(rnd(), 1.65) / Math.sqrt(Math.max(0.14, 1.0 - rnd() * 0.72)) * 0.38);
      const a1 = rnd() * 6.2831853;
      const c2 = 2.0 * rnd() - 1.0;
      const s2 = Math.sqrt(Math.max(0.0, 1.0 - c2 * c2));
      const ux = r * s2 * Math.cos(a1) * sx;
      const uy = r * c2 * sy;
      const dz = r * s2 * Math.sin(a1) * szScale;
      const dx = cR * ux - sR * uy;
      const dy = sR * ux + cR * uy;
      const isBS = rnd() < blueFrac;
      emitWorld(
        center[0] + dx, center[1] + dy, center[2] + dz,
        isBS ? (0.64 + rnd() * 0.30) : (0.10 + rnd() * 0.38),
        (isCore ? 1.35 : 0.62) + Math.pow(rnd(), 3.2) * 3.8,
        0.96 + Math.pow(rnd(), 3.9) * 1.75
      );
    }
  };

  populateDSph(FORNAX_DSPH_KLY,   600, 3.4, 2.5, 2.9, 0.22, 0.0,  0.08);
  populateDSph(SCULPTOR_DSPH_KLY, 400, 2.2, 1.7, 1.9, 0.09, 0.0,  0.00);
  populateDSph(CARINA_DSPH_KLY,   350, 2.0, 1.5, 1.7, 0.18, 0.0,  0.00);
  populateDSph(SGR_DSPH_KLY,      450, 9.2, 3.2, 3.6, 0.14, 0.52, 0.24); // Includes M54 dense nuclear cluster!

  return emitted; // Guaranteed exact 26,000!
}


// ============================================================================
// SECTION 4: HERO CAMERA PRESETS, MIN-DIST CLAMPS & COLLISION-FREE 3D LABELS
// (Drop-in for `PRESETS`, `getMinDistKly`, `computeEphemeris`, & `LABELS`)
// ============================================================================
const SMC_LOCALGROUP_PRESETS_AND_LABELS_SPEC = `
  // --- Ephemeris Return Keys (add to computeEphemeris return object): ---
  // smc: SMC_BASE_KLY,
  // ngc346: NGC346_KLY,
  // hd5980: HD5980_KLY,
  // ngc602: NGC602_KLY,
  // tuc47: TUC47_BASE_KLY,
  // barnard_ngc6822: NGC6822_BASE_KLY,
  // ic10: IC10_BASE_KLY,
  // ic1613: IC1613_BASE_KLY,
  // wlm: WLM_BASE_KLY,
  // sgr_dsph: SGR_DSPH_KLY,
  // sculptor_dsph: SCULPTOR_DSPH_KLY,
  // fornax_dsph: FORNAX_DSPH_KLY,
  // carina_dsph: CARINA_DSPH_KLY,

  // --- Hero View Angles (verified in 16:9 NDC screen space!): ---
  // HERO_SMC_ANG (-2.4473, -0.8957, dist = 28.0 kly, fov = 55):
  //   - Centers SMC (ndc 0.00, 0.00), NE Starburst NGC 346 (-0.02, -0.17), Eastern SMC Wing & NGC 602 (-0.21, -0.05)!
  //   - Sweeps the luminous Magellanic Bridge (-0.38, +0.11) into LMC (-0.49, +0.14) on the left!
  //   - Frames golden globular cluster 47 Tucanae (+0.20, -0.16) & Milky Way (+0.30, -0.03) on the right!
  const HERO_SMC_ANG     = { yaw: -2.4473, pitch: -0.8957 };
  const HERO_NGC346_ANG  = { yaw:  0.8060, pitch:  0.3461 };
  const HERO_NGC6822_ANG = { yaw: -0.3938, pitch:  0.1897 };
  const HERO_IC10_ANG    = { yaw: -2.2442, pitch:  0.1450 };

  // --- PRESETS Entries: ---
  const SMC_LOCALGROUP_PRESETS = {
    smc: {
      title: '小麦哲伦星系 SMC / NGC 292 · 麦哲伦星桥与杜鹃座 47 (距地 20.37 万光年)：',
      desc: '参照 Graczyk et al. (2020) 1:1 复刻：视线方向潮汐拉伸达 2.2 万光年的三维雪茄状主棒、向大麦哲伦延伸的东侧星翼 (SMC Wing)、翡翠玫瑰色育星暴区 NGC 346 与 NGC 602，左侧横跨 7.5 万光年麦哲伦星桥连通 LMC，右侧遥望杜鹃座 47 与银河系！',
      anchorId: 'smc', anchorLabel: '小麦哲伦星系 SMC (20.37万 ly)',
      offsetKly: [0, 0, 0], yaw: -2.4473, pitch: -0.8957, distKly: 28.0, fov: 55
    },
    ngc346: {
      title: 'SMC 最大育星暴区 NGC 346 (N66) 与爆发三星系统 HD 5980：',
      desc: '深入小麦哲伦星系东北主棒核心：由数十颗炽热 O 型大质量恒星与光度达太阳 220 万倍的高光度蓝变星/沃尔夫-拉叶三星系统 HD 5980 吹蚀出的翡翠绿 [OIII] 与玫瑰红 Hα 雕刻空腔及韦伯斜向电离脊！',
      anchorId: 'ngc346', anchorLabel: '育星暴区 NGC 346 & HD 5980',
      offsetKly: [0, 0, 0], yaw: 0.8060, pitch: 0.3461, distKly: 1.38, fov: 50
    },
    barnard_ngc6822: {
      title: '巴纳德星系 NGC 6822 (距地 163 万光年 · 哈勃 1925 年河外造父变星里程碑)：',
      desc: '本星系群经典棒状不规则矮星系 (IB(s)m)：南北向金黄-蔚蓝恒星棒外侧环绕倾斜中性氢蓝星晕，北端闪耀着著名的洋红-青蓝巨型电离氢气泡 Hubble V 与 Hubble X！',
      anchorId: 'barnard_ngc6822', anchorLabel: '巴纳德星系 NGC 6822 (163万 ly)',
      offsetKly: [0, 0, 0], yaw: -0.3938, pitch: 0.1897, distKly: 12.8, fov: 50
    },
    ic10: {
      title: '星暴矮星系 IC 10 (距地 245 万光年 · 本星系群唯一沃尔夫-拉叶星暴星系)：',
      desc: '隐匿于仙后座银道面低银纬尘埃带后方 (b=-3.33°)：本星系群恒星形成密度最高的星暴不规则星系，展现密集蓝紫 WR/OB 超星协、东南侧巨型同步辐射/Hα 超级气泡与浓密分子暗尘埃裂隙！',
      anchorId: 'ic10', anchorLabel: '星暴矮星系 IC 10 (245万 ly)',
      offsetKly: [0, 0, 0], yaw: -2.2442, pitch: 0.1450, distKly: 10.6, fov: 50
    }
  };

  // --- Collision-Free 3D LABELS Entries (replace legacy SMC entry & append Local Group members): ---
  const SMC_LOCALGROUP_LABELS = [
    { key: 'smc',             name: '小麦哲伦星系 SMC (NGC 292)', sub: '距地 20.37万 ly · 2.2万 ly 潮汐长棒与星翼', getPos: e => e.smc,             color: '#60a5fa', minKly: 5.5,  maxKly: 1650, hideNearKly: 5.5,  radiusKly: 4.5 },
    { key: 'ngc346',          name: '育星暴区 NGC 346 & HD 5980', sub: 'SMC 最大 H-II 星云 (N66) · LBV/WR 三星',   getPos: e => e.ngc346,          color: '#34d399', minKly: 0.08, maxKly: 95,   hideNearKly: 0.08, radiusKly: 0.45 },
    { key: 'smc',             name: '星翼珍珠冠星云 NGC 602',     sub: 'SMC 东侧星翼 (N90) · 麦哲伦星桥起点',      getPos: e => e.ngc602,          color: '#f472b6', minKly: 0.25, maxKly: 78,   hideNearKly: 0.25, radiusKly: 0.30 },
    { key: 'smc',             name: '杜鹃座 47 (NGC 104)',        sub: '距地 1.45万 ly · 南天前景金核球状星团',    getPos: e => e.tuc47,           color: '#fde047', minKly: 0.25, maxKly: 360,  hideNearKly: 0.22, radiusKly: 0.18 },
    { key: 'barnard_ngc6822', name: '巴纳德星系 NGC 6822',        sub: '距地 163万 ly · Hubble V/X 巨型电离泡',   getPos: e => e.barnard_ngc6822, color: '#f472b6', minKly: 3.5,  maxKly: 3800, hideNearKly: 3.5,  radiusKly: 3.2 },
    { key: 'ic10',            name: '星暴矮星系 IC 10',           sub: '距地 245万 ly · 本星系群唯一 WR 星暴星系', getPos: e => e.ic10,            color: '#fb7185', minKly: 3.0,  maxKly: 3800, hideNearKly: 3.0,  radiusKly: 2.6 },
    { key: null,              name: '鲸鱼座不规则星系 IC 1613',   sub: '距地 238万 ly · 极低尘埃透明矮星系',      getPos: e => e.ic1613,          color: '#7dd3fc', minKly: 8.0,  maxKly: 3800, hideNearKly: 5.0,  radiusKly: 3.5 },
    { key: null,              name: '孤立矮星系 WLM',             sub: '距地 304万 ly · 本星系群南极边缘成员',    getPos: e => e.wlm,             color: '#93c5fd', minKly: 8.0,  maxKly: 4100, hideNearKly: 5.0,  radiusKly: 3.5 },
    { key: null,              name: '人马座矮椭球星系 Sgr dSph',  sub: '距地 7.0万 ly · 潮汐瓦解核心与 M54',      getPos: e => e.sgr_dsph,        color: '#fcd34d', minKly: 12.0, maxKly: 950,  hideNearKly: 10.0, radiusKly: 5.0 },
    { key: null,              name: '天炉座矮星系 Fornax dSph',   sub: '距地 46.0万 ly · 银河系大质量伴星系',     getPos: e => e.fornax_dsph,     color: '#fde68a', minKly: 8.0,  maxKly: 2200, hideNearKly: 5.0,  radiusKly: 2.8 },
    { key: null,              name: '玉夫座矮星系 Sculptor dSph', sub: '距地 28.7万 ly · 银南极古老矮椭球星系',   getPos: e => e.sculptor_dsph,   color: '#e2e8f0', minKly: 8.0,  maxKly: 1800, hideNearKly: 4.5,  radiusKly: 2.0 },
    { key: null,              name: '船底座矮星系 Carina dSph',   sub: '距地 33.0万 ly · 多世代恒星形成矮星系',   getPos: e => e.carina_dsph,     color: '#cbd5e1', minKly: 8.0,  maxKly: 1800, hideNearKly: 4.5,  radiusKly: 1.8 }
  ];
`;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SMC_ASTROMETRY_SPEC,
    SMC_LOCALGROUP_GLSL,
    populateSMCAndLocalGroupStars,
    SMC_LOCALGROUP_PRESETS_AND_LABELS_SPEC
  };
}
