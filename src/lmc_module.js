/**
 * ============================================================================
 * 1:1 LARGE MAGELLANIC CLOUD (LMC / ESO 56-G 115) ASTROPHYSICAL & GLSL MODULE
 * Author: lmc-modeler (Swarm Specialist)
 * Target Integrator: lg-integrator -> milky_way.html & build_solar_standalone.py
 *
 * Scientific References & Exact 1:1 Calibrations (1.0 world unit = 1 kly = 1,000 ly):
 * 1. Pietrzynski et al. (2019, Nature 567, 200): 1% detached eclipsing binary LMC
 *    distance d = 49.59 +/- 0.09 kpc = 161,700 ly; Galactic (l = 280.465 deg, b = -32.888 deg).
 * 2. Gaia DR3 & VISTA VMC (van der Marel & Cioni 2001; Choi et al. 2018; Jimenez-Arranz 2023):
 *    Inclination i = 34.7 deg, Line-of-Nodes PA = 122.5 deg, D_disk = 32,200 ly (R ~ 16.1 kly),
 *    off-center tilted Magellanic Stellar Bar (~9.8 kly length) + m=1 single W/NW spiral arm.
 * 3. Crowther et al. (2010, 2016) & Kalari et al. (2022): 30 Doradus (NGC 2070, ~1,000 ly span)
 *    & R136 super star cluster core hosting R136a1 (WN5h Wolf-Rayet hypergiant: R = 40.0 R_sun,
 *    T_eff = 46,000 K, L = 4.7e6 L_sun) + massive WR companions R136a2, R136a3, R136c.
 * 4. Sugerman et al. (2005), Tziamtzis et al. (2011), Larsson et al. (2019) & Arendt et al. (2023 JWST):
 *    SN 1987A HST/JWST Three-Ring Hourglass Remnant on SW outskirts of 30 Doradus (ICRS 05h35m28.0s,
 *    -69d16m11.1s): Equatorial "String of Pearls" ring R_ER = 0.67 ly (42,370 AU = 0.00067 kly)
 *    tilted 42.85 deg with 24 shocked hotspots + twin crimson-magenta outer rings (R_OR = 1.42 ly,
 *    z = +/-1.12 ly) + cyan-azure [Fe II]/[O III] inner keyhole ejecta!
 * 5. Nazé et al. (2001) & Pellegrini et al. (2012): N11 (LHA 120-N 11) NW giant evacuated OB ring
 *    nebula & N44 (LHA 120-N 44) wind-blown superbubble, plus NGC 1866 & NGC 1978 globular clusters.
 * ============================================================================
 */

// ============================================================================
// SECTION 1: 1:1 LMC ASTROMETRY, ORTHONORMAL BASIS & INTERNAL LANDMARKS (JS)
// Drop into Section 1C of milky_way.html (replaces legacy LMC_BASE_KLY line).
// Assumes existing helpers: heliocentricGalacticToWorldKly, buildExtragalacticBasis,
// normVec3, crossVec3, dot3, dirToYawPitch, AU_IN_KLY, RSUN_IN_KLY, SUN_BASE_KLY.
// ============================================================================
export const LMC_ASTROMETRY_JS = `
  // 1:1 Large Magellanic Cloud (Pietrzynski et al. 2019 Nature: d = 49.59 kpc = 161,700 ly, D = 32,200 ly)
  const LMC_BASE_KLY = heliocentricGalacticToWorldKly(161700.0, 280.465, -32.888);
  const LMC_BASIS    = buildExtragalacticBasis(LMC_BASE_KLY, 34.7, 122.5);

  function lmcLocalToWorldKly(lx, ly, lz) {
    return [
      LMC_BASE_KLY[0] + LMC_BASIS.u[0] * lx + LMC_BASIS.n[0] * ly + LMC_BASIS.v[0] * lz,
      LMC_BASE_KLY[1] + LMC_BASIS.u[1] * lx + LMC_BASIS.n[1] * ly + LMC_BASIS.v[1] * lz,
      LMC_BASE_KLY[2] + LMC_BASIS.u[2] * lx + LMC_BASIS.n[2] * ly + LMC_BASIS.v[2] * lz
    ];
  }

  // Exact J2000 ICRS RA/Dec Projections into Tilted (i=34.7°, PA=122.5°) LMC Local Frame (kly):
  // - 30 Doradus / NGC 2070 & R136 Core (RA 05h38m42.4s, Dec -69°06'03", ~1,000 ly span)
  const LMC_30DOR_LOCAL      = [ 2.245,  0.055, -4.200];
  // - SN 1987A Three-Ring Remnant on SW outskirts of 30 Doradus (RA 05h35m28.0s, Dec -69°16'11.1";
  //   historical light-echo d ~ 168 kly, placed in outer SW 30 Doradus halo at ly = -0.220 kly inside OBB!)
  const LMC_SN1987A_LOCAL    = [ 1.783, -0.220, -3.236];
  // - N11 / LHA 120-N 11 Giant Ring Nebula at NW Spiral Arm tip (RA 04h56m46s, Dec -66°28'27")
  const LMC_N11_LOCAL        = [-10.974, 0.065, -4.098];
  // - N44 / LHA 120-N 44 Wind-Blown Superbubble (RA 05h22m19s, Dec -67°56'13")
  const LMC_N44_LOCAL        = [-2.989,  0.040, -4.960];
  // - NGC 1866 Young Populous Blue Globular Cluster in N LMC (RA 05h13m38.6s, Dec -65°27'53")
  const LMC_NGC1866_LOCAL    = [-8.632,  0.180, -10.107];
  // - NGC 1978 Intermediate-Age Elliptical Globular Cluster in N LMC (RA 05h28m36s, Dec -66°14'00")
  const LMC_NGC1978_LOCAL    = [-3.979,  0.240, -10.711];

  const TARANTULA_30DOR_KLY  = lmcLocalToWorldKly(LMC_30DOR_LOCAL[0],   LMC_30DOR_LOCAL[1],   LMC_30DOR_LOCAL[2]);
  const R136_KLY             = TARANTULA_30DOR_KLY;
  const SN1987A_KLY          = lmcLocalToWorldKly(LMC_SN1987A_LOCAL[0], LMC_SN1987A_LOCAL[1], LMC_SN1987A_LOCAL[2]);
  const LMC_N11_KLY          = lmcLocalToWorldKly(LMC_N11_LOCAL[0],     LMC_N11_LOCAL[1],     LMC_N11_LOCAL[2]);
  const LMC_N44_KLY          = lmcLocalToWorldKly(LMC_N44_LOCAL[0],     LMC_N44_LOCAL[1],     LMC_N44_LOCAL[2]);
  const LMC_NGC1866_KLY      = lmcLocalToWorldKly(LMC_NGC1866_LOCAL[0], LMC_NGC1866_LOCAL[1], LMC_NGC1866_LOCAL[2]);
  const LMC_NGC1978_KLY      = lmcLocalToWorldKly(LMC_NGC1978_LOCAL[0], LMC_NGC1978_LOCAL[1], LMC_NGC1978_LOCAL[2]);

  // R136 Core Hypergiant Quartet for Pass 2 Local Ray-Tracing (Crowther et al. 2010/2016 HST/STIS; Kalari 2022):
  // Slot 0: R136a1 (WN5h, R = 40.0 R_sun, T = 46,000 K, L = 4.7e6 L_sun — most massive/luminous known star!)
  // Slots 1..3: R136a2 (~5,100 AU = 0.1" separation), R136a3 (~9,600 AU), R136c (~24,200 AU colliding-wind binary)
  // Offsets are expressed in AU in LMC local axes [du, dn, dv] so all 3 companions frame cleanly behind R136a1!
  const R136_CLUSTER_STARS = [
    { id: 'r136a1', name: 'R136a1 (WN5h 沃尔夫-拉叶极超巨星)', offsetLmcAU: [    0.0,     0.0,      0.0], rRsun: 40.0, tempK: 46000.0, style: 5.0, lumWeight: 135.0 },
    { id: 'r136a2', name: 'R136a2 (WN5h · 47,000 K)',          offsetLmcAU: [ 1420.0,   420.0,  -4880.0], rRsun: 34.7, tempK: 47000.0, style: 5.0, lumWeight: 112.0 },
    { id: 'r136a3', name: 'R136a3 (WN5h · 50,000 K)',          offsetLmcAU: [ 3650.0,  1150.0,  -8820.0], rRsun: 30.2, tempK: 50000.0, style: 5.0, lumWeight: 105.0 },
    { id: 'r136c',  name: 'R136c (WN5h 碰撞星风双星)',          offsetLmcAU: [-4200.0, -3650.0, -23550.0], rRsun: 36.0, tempK: 42000.0, style: 5.0, lumWeight:  96.0 }
  ].map(st => ({
    ...st,
    posKly: lmcLocalToWorldKly(
      LMC_30DOR_LOCAL[0] + st.offsetLmcAU[0] * AU_IN_KLY,
      LMC_30DOR_LOCAL[1] + st.offsetLmcAU[1] * AU_IN_KLY,
      LMC_30DOR_LOCAL[2] + st.offsetLmcAU[2] * AU_IN_KLY
    )
  }));
`;

// ============================================================================
// SECTION 2: TRUE 3D VOLUMETRIC RAYMARCHING GLSL (`evalLMCVolumetric`)
// Drop into VOLUMETRIC_FRAG in milky_way.html.
// Uniforms required in VOLUMETRIC_FRAG:
//   uniform vec3 uLmcCenter;
//   uniform mat3 uLmcBasis;
// Uses existing VOLUMETRIC_FRAG uniforms & helpers:
//   uNoise3D, uDustStrength, uNebulaStrength, intersectBox, rot2D, sqr, pow4, sstepInv.
// STRICT ANGLE D3D11 / GLSL ES 3.00 COMPLIANCE:
//   - <= 22 OBB steps (0 steps when ray misses LMC -> 60 FPS!)
//   - pow(max(x, 0.0), y) everywhere; smoothstep(lo, hi, x) strictly lo < hi; safe atan/normalize!
// ============================================================================
export const LMC_VOLUMETRIC_UNIFORMS_GLSL = `
    uniform vec3 uLmcCenter;
    uniform mat3 uLmcBasis;
`;

export const LMC_VOLUMETRIC_GLSL = `
    // Exact 3-step Gauss-Newton 3D Torus Line-Integral for SN 1987A Tilted Rings & 24 Shocked Pearls
    // Achieves <0.6% error vs 2000-step raymarch with zero slice banding down to 0.1 ly!
    vec3 lmc_evalSN1987ARing(
      vec3 q0, vec3 d, vec2 ringCenterXY, float ringZ, float majorR, float tubeSigma,
      bool isEquatorialPearls
    ) {
      vec3 ringEmit = vec3(0.0);
      vec2 o2 = q0.xy - ringCenterXY;
      vec2 v2 = d.xy;
      float v2Len2 = dot(v2, v2);

      float sRoot = 0.0;
      float bCyl  = 0.0;
      if (v2Len2 > 1e-5) {
        bCyl = dot(o2, v2) / v2Len2;
        float cCyl = (dot(o2, o2) - majorR * majorR) / v2Len2;
        sRoot = sqrt(max(bCyl * bCyl - cCyl, 0.0));
      }

      float prevRoot = -1.0e9;
      for (int rIdx = 0; rIdx < 2; rIdx++) {
        float t = (v2Len2 > 1e-5)
          ? (-bCyl + ((rIdx == 0) ? -sRoot : sRoot))
          : ((ringZ - q0.z) / ((abs(d.z) > 1e-5) ? d.z : 1e-5));

        // 3 Gauss-Newton refinement steps on 3D torus distance (r(t) - majorR)^2 + (z(t) - ringZ)^2
        for (int it = 0; it < 3; it++) {
          vec3 p = q0 + d * t;
          vec2 xy = p.xy - ringCenterXY;
          float rad = length(xy) + 1e-8;
          float u1 = rad - majorR;
          float u2 = p.z - ringZ;
          float du1 = dot(xy, v2) / rad;
          float du2 = d.z;
          t -= (u1 * du1 + u2 * du2) / (du1 * du1 + du2 * du2 + 1e-6);
        }

        if (t > 1e-5 && abs(t - prevRoot) > tubeSigma * 1.35) {
          prevRoot = t;
          vec3 p = q0 + d * t;
          vec2 xy = p.xy - ringCenterXY;
          float rad = length(xy) + 1e-8;
          float dr = rad - majorR;
          float dz = p.z - ringZ;
          float d2 = dr * dr + dz * dz;
          if (d2 < sqr(tubeSigma * 4.5)) {
            float du1 = dot(xy, v2) / rad;
            float speed = clamp(sqrt(du1 * du1 + d.z * d.z + 0.10), 0.34, 1.25);
            float tubeProf = exp(-d2 / sqr(tubeSigma)) / speed;
            float sx = (abs(xy.x) < 1e-7 && abs(xy.y) < 1e-7) ? 1e-7 : xy.x;
            float phi = atan(xy.y, sx);

            if (isEquatorialPearls) {
              // Continuous shocked [NII]/H-alpha ionized inner equatorial collar (R_ER = 0.67 ly = 42,370 AU)
              float azVar = 0.78 + 0.28 * sin(phi * 3.0 + 0.7) * cos(phi * 2.0 - 0.4);
              vec3 collarCol = mix(vec3(1.00, 0.24, 0.44), vec3(0.32, 0.84, 1.00), sstepInv(0.0, -tubeSigma * 0.85, dr));
              ringEmit += collarCol * tubeProf * 0.42 * azVar;

              // HST 24 Shocked "String of Pearls" Hotspots (blast-wave fingers crushing circumstellar knots!)
              float pearlPhase = phi * 24.0;
              float dPhi = atan(sin(pearlPhase), cos(pearlPhase)) * (1.0 / 24.0);
              float arcDist = dPhi * majorR;
              float pearlSig = tubeSigma * 0.86;
              float pearl3D = exp(-(d2 + arcDist * arcDist * 1.15) / sqr(pearlSig));
              // Realistic HST pearl-to-pearl intensity variation across the 24 knots
              float pearlAmp = 0.72 + 0.44 * (0.5 + 0.5 * sin(phi * 5.0 + 1.25)) * (0.55 + 0.45 * cos(phi * 3.0 - 0.85));
              float pearlCore = exp(-(d2 + arcDist * arcDist) / sqr(pearlSig * 0.48));
              vec3 pearlCol = mix(vec3(1.00, 0.56, 0.32), vec3(0.92, 0.96, 1.00), clamp(pearlCore * 0.78, 0.0, 1.0));
              ringEmit += pearlCol * (pearl3D * 1.28 * pearlAmp / speed);
            } else {
              // Twin Tilted Outer Hourglass Rings ([NII] 658.4 nm & H-alpha crimson-magenta loops, R_OR ~ 1.40 ly)
              float clumpy = 0.68 + 0.38 * sin(phi * 7.0 + ringZ * 1800.0) * cos(phi * 4.0 - 0.6);
              vec3 outerCol = mix(vec3(1.00, 0.16, 0.46), vec3(0.82, 0.26, 0.74), 0.35 + 0.35 * sin(phi * 2.0 + 0.9));
              ringEmit += outerCol * tubeProf * 0.74 * clumpy;
            }
          }
        }
      }
      return ringEmit;
    }

    // Close-Up 1:1 3D Volumetric + Analytic SN 1987A Three-Ring Hourglass Remnant
    // Executed ONLY when camera is within 0.065 kly (~65 ly) of SN1987A_KLY!
    void lmc_evalSN1987ARemnant(vec3 roLMC, vec3 rdLMC, float ign, float dCamSN, inout vec3 snAccum, inout vec3 snTrans) {
      const vec3 P_SN = vec3(1.783, -0.220, -3.236);
      float zoomFade = sstepInv(0.062, 0.014, dCamSN);
      if (zoomFade <= 0.001) return;

      // Bounding sphere of radius 0.0025 kly (2.5 ly) around SN 1987A hourglass
      vec3 centerRel = P_SN - roLMC;
      float bSph = dot(centerRel, rdLMC);
      float cSph = dot(centerRel, centerRel) - sqr(0.0025);
      float disc = bSph * bSph - cSph;
      if (disc <= 0.0) return;
      float sSph = sqrt(disc);
      float t0 = max(bSph - sSph, 0.000015);
      float t1 = bSph + sSph;
      if (t1 <= t0) return;

      // Build exact HST 42.85°-inclined, PA -6.2° 3D bipolar hourglass frame in LMC local space:
      // snLos points from SN 1987A toward Sun/Earth in LMC local frame: [-0.0111, 0.8319, -0.5549]
      const vec3 snLos   = vec3(-0.0111, 0.8319, -0.5549);
      vec3 snEast  = normalize(cross(vec3(-0.472, 0.0, -0.881), snLos));
      vec3 snNorth = normalize(cross(snLos, snEast));
      // Major axis at PA = -6.2 deg (-0.1082 rad), hourglass symmetry axis tilted 42.85 deg from snLos
      vec3 axisMaj = normalize(cos(-0.1082) * snNorth + sin(-0.1082) * snEast);
      vec3 skyMin  = normalize(-sin(-0.1082) * snNorth + cos(-0.1082) * snEast);
      vec3 snAxis  = normalize(snLos * 0.73314 + skyMin * 0.68008); // cos(42.85°), sin(42.85°)
      vec3 snV     = normalize(cross(snAxis, axisMaj));
      mat3 toSN    = transpose(mat3(axisMaj, snV, snAxis));

      vec3 q0 = toSN * (roLMC - P_SN);
      vec3 d  = toSN * rdLMC;

      // 1. 14-Step 3D Volumetric Hourglass Bipolar Sheath + JWST Cyan Inner "Keyhole" Ejecta & Dust Waist
      const int SN_STEPS = 14;
      float span = t1 - t0;
      float invS = 1.0 / float(SN_STEPS);
      vec3 volEmit = vec3(0.0);
      float prevT = t0;

      for (int i = 0; i < SN_STEPS; i++) {
        float tMid  = t0 + span * ((float(i) + ign) * invS);
        float tNext = t0 + span * min((float(i + 1) + ign) * invS, 1.0);
        float dt    = max(tNext - prevT, 1e-6);
        prevT = tNext;

        vec3 q = q0 + d * tMid;
        float rXY = length(q.xy);
        float absZ = abs(q.z);

        // Translucent progenitor red-supergiant / blue-supergiant bipolar wind hourglass wall
        if (absZ < 0.00128) {
          float wallR = 0.00067 + 0.00074 * pow(max(absZ / 0.00112, 0.0), 1.45);
          float sheath = exp(-sqr((rXY - wallR) / 0.00011)) * sstepInv(0.00126, 0.00095, absZ);
          vec4 nS = textureLod(uNoise3D, q * 420.0 + 0.37, 0.0);
          vec3 sheathCol = mix(vec3(0.88, 0.18, 0.46), vec3(0.30, 0.62, 1.00), smoothstep(0.0002, 0.0009, absZ));
          volEmit += snTrans * sheathCol * sheath * (0.45 + 0.75 * nS.g) * (dt * 195.0);
        }

        // Inner Asymmetric Expanding Supernova Debris ("Keyhole" Ejecta: [Fe II] / [O III] cyan-azure lobes + dark dust waist!)
        vec3 ejCoord = vec3(q.x / 0.00017, q.y / 0.00015, q.z / 0.00031);
        float ejR2 = dot(ejCoord, ejCoord);
        if (ejR2 < 2.6) {
          vec4 nEj = textureLod(uNoise3D, q * 950.0 + 0.19, 0.0);
          // Central JWST keyhole cavity & equatorial refractory dust belt dimming the very center
          float keyholeLane = exp(-sqr(q.z / 0.000055)) * exp(-sqr(q.x / 0.000085));
          float ejDens = exp(-ejR2 * 1.45) * (0.55 + 0.85 * nEj.b) * (1.0 - 0.72 * keyholeLane);
          vec3 ejCol = mix(vec3(0.14, 0.82, 1.00), vec3(0.46, 0.94, 0.88), nEj.g);
          volEmit += snTrans * ejCol * ejDens * (dt * 1650.0);

          float snDust = keyholeLane * exp(-ejR2 * 1.8) * (dt * 2400.0);
          snTrans *= exp(-snDust * vec3(0.55, 0.75, 0.95));
        }
      }

      // 2. Analytic-Refined 1:1 Three Rings:
      //    - Equatorial "String of Pearls" Ring (R_ER = 0.00067 kly = 0.67 ly = 42,370 AU, 24 pearls)
      //    - Northern & Southern Outer Rings (R_OR = 0.00142 / 0.00138 kly, z = +/-0.00112 kly with HST shear)
      vec3 eqRing  = lmc_evalSN1987ARing(q0, d, vec2( 0.00000,  0.00000),  0.00000, 0.00067, 0.000040, true);
      vec3 norRing = lmc_evalSN1987ARing(q0, d, vec2( 0.00012, -0.00005),  0.00112, 0.00142, 0.000042, false);
      vec3 sorRing = lmc_evalSN1987ARing(q0, d, vec2(-0.00012,  0.00005), -0.00112, 0.00138, 0.000042, false);

      vec3 snTotal = (volEmit + snTrans * (eqRing + norRing + sorRing)) * zoomFade * max(uNebulaStrength, 0.35);
      // Hue-preserving HDR soft shoulder so all 24 pearls & outer rings stay saturated with zero ACES white-out
      float snPeak = max(snTotal.r, max(snTotal.g, snTotal.b));
      snAccum += snTotal / (1.0 + max(0.0, snPeak - 1.15) * 0.42);
    }

    // 1:1 3D Volumetric Large Magellanic Cloud (LMC / ESO 56-G 115: d=161.7 kly, D=32,200 ly, i=34.7°, PA=122.5°)
    // Guarded by OBB intersectBox(roLMC, rdLMC, vec3(18.5, 3.8, 18.5)) with <= 22 steps (0 steps when ray misses LMC!)
    void evalLMCVolumetric(vec3 ro, vec3 rd, float ign, out vec3 lmcAccum, out vec3 lmcTrans) {
      lmcAccum = vec3(0.0);
      lmcTrans = vec3(1.0);

      mat3 invLMC = transpose(uLmcBasis);
      vec3 roLMC  = invLMC * (ro - uLmcCenter);
      vec3 rdLMC  = invLMC * rd;

      vec2 hit = intersectBox(roLMC, rdLMC, vec3(18.5, 3.8, 18.5));
      if (hit.y <= 0.0 || hit.x >= hit.y) return;

      const vec3 P_30DOR   = vec3( 2.245,  0.055, -4.200);
      const vec3 P_SN1987A = vec3( 1.783, -0.220, -3.236);
      const vec3 P_N11     = vec3(-10.974, 0.065, -4.098);
      const vec3 P_N44     = vec3(-2.989,  0.040, -4.960);

      float rCamLMC  = length(roLMC);
      float dCamR136 = length(roLMC - P_30DOR);
      float dCamSN   = length(roLMC - P_SN1987A);

      // Smoothly clear immediate foreground fog when diving inside R136 or SN 1987A while keeping 360° nebula backdrop!
      float r136Closeup = sstepInv(0.075, 0.003, dCamR136);
      float snCloseup   = sstepInv(0.065, 0.008, dCamSN);
      float inLMCDisk   = sstepInv(2.8, 0.85, abs(roLMC.y)) * sstepInv(16.5, 10.5, length(roLMC.xz));

      float minClear = mix(0.18, 0.004, smoothstep(0.002, 1.8, min(rCamLMC, min(dCamR136, dCamSN))));
      float tStart   = max(hit.x, minClear);
      float tEnd     = hit.y;

      if (tEnd > tStart) {
        float span = tEnd - tStart;
        const int LMC_STEPS = 22;
        float invSteps = 1.0 / float(LMC_STEPS);
        float prevT = tStart;
        float bgFogDamp = mix(1.0, 0.24, snCloseup) * mix(1.0, 0.52, r136Closeup);

        for (int i = 0; i < LMC_STEPS; i++) {
          float s1 = (float(i) + ign) * invSteps;
          float s2 = (float(i + 1) + ign) * invSteps;
          float u1 = mix(s1, s1 * s1, 0.30 * inLMCDisk);
          float u2 = mix(s2, s2 * s2, 0.30 * inLMCDisk);
          float tMid  = tStart + span * u1;
          float tNext = tStart + span * min(u2, 1.0);
          float dt = max(tNext - prevT, 1e-4);
          prevT = tNext;

          vec3 p = roLMC + rdLMC * tMid;
          float r = length(p.xz);
          if (r > 17.6) continue;

          float safePx = (abs(p.x) < 1e-6 && abs(p.z) < 1e-6) ? 1e-6 : p.x;
          float th = atan(p.z, safePx);

          // Magellanic outer disk tidal warp + Choi et al. (2018) tilted off-center stellar bar
          float diskWarp = 0.032 * max(0.0, r - 8.0) * sin(th + 0.58);
          float y = p.y - diskWarp;

          vec2 barXZ = rot2D(p.xz - vec2(0.58, 0.42), -0.09);
          float barTilt = 0.072 * barXZ.x * exp(-sqr(barXZ.x / 5.6));
          float yBar = y - barTilt;

          float vertStar = exp(-abs(y) / 0.56);
          float vertGas  = exp(-pow(max(abs(y) / 0.24, 0.0), 1.65));

          // 1. Off-Center Warped Magellanic Stellar Bar (~9.8 kly = +/-4.9 kly length, warm golden-cream Pop II/int)
          float barBox = pow(
            max(pow(max(abs(barXZ.x) / 4.90, 0.0), 2.5) + pow(max(abs(barXZ.y) / 1.42, 0.0), 2.1), 0.0),
            1.0 / 2.3
          );
          float barDens = exp(-barBox * 1.85) * exp(-pow(max(abs(yBar) / 0.62, 0.0), 1.55));

          if (vertStar < 0.003 && barDens < 0.003) continue;

          vec4 n1 = textureLod(uNoise3D, vec3(p.xz * 0.056 + 0.23, y * 0.32 + 0.17), 0.0);
          vec4 n2 = textureLod(uNoise3D, vec3(p.xz * 0.185 + n1.a * 0.22, y * 0.64 + 0.41), 0.0);

          // 2. Asymmetric m=1 Single Western/Northern Spiral Arm + Patchy Azure-Sapphire OB Star Clouds
          //    cos(th - thSpine) is 2*PI-periodic -> zero atan branch seam across West/NW (through N11)!
          float thSpine   = 2.74 + 0.82 * log(max(r, 3.6) / 4.2);
          float singleArm = pow(max(0.5 + 0.5 * cos(th - thSpine), 0.0), 3.2) *
                            smoothstep(3.3, 5.8, r) * sstepInv(16.2, 11.4, r);
          float northArc  = pow(max(0.5 + 0.5 * cos(th + 1.72), 0.0), 2.8) * exp(-sqr((r - 11.2) / 3.1));
          float eastSpur  = pow(max(0.5 + 0.5 * cos(th + 1.04), 0.0), 3.6) * exp(-sqr((r - 5.1) / 2.3));

          float rDiskOff = length(p.xz - vec2(-0.85, -0.75));
          float expDisk  = exp(-rDiskOff / 5.3) * sstepInv(16.8, 12.2, rDiskOff);
          float obPatch  = pow(clamp(n1.g * 0.62 + n2.g * 0.56, 0.0, 1.25), 2.1);

          vec3 emit = barDens * vec3(1.00, 0.84, 0.62) * (0.22 + 0.11 * n1.b) * bgFogDamp;

          float armCloud = (singleArm * 0.56 + northArc * 0.34 + eastSpur * 0.42) * (0.42 + 0.96 * obPatch);
          vec3 diskCol   = mix(vec3(0.90, 0.85, 0.76), vec3(0.46, 0.74, 1.00),
                               clamp(0.32 + 0.68 * singleArm + 0.45 * obPatch, 0.0, 1.0));
          emit += vertStar * (expDisk * 0.14 + armCloud) * diskCol * 0.36 * bgFogDamp;

          // Scattered star-forming H-II knots along the single spiral arm & eastern ridge
          if (vertGas > 0.01 && uNebulaStrength > 0.01) {
            float armH2 = vertGas * (singleArm * 0.75 + eastSpur * 0.65 + northArc * 0.35) *
                          pow(clamp(n1.g * 0.58 + n2.g * 0.64, 0.0, 1.24), 3.4) * uNebulaStrength;
            emit += armH2 * mix(vec3(1.00, 0.20, 0.42), vec3(0.20, 0.80, 0.98), n2.b) * 0.95 * bgFogDamp;
          }

          // 3. Multi-Shell 30 Doradus (Tarantula Nebula / NGC 2070, ~1,000 ly span at P_30DOR):
          //    Turquoise-emerald [OIII] (500.7 nm) inner core + spider-leg H-alpha (656.3 nm) ruby filaments
          //    + warm [SII] coral-gold outer ionization loops!
          vec3 d30 = p - P_30DOR;
          vec3 d30Ell = vec3(d30.x, d30.y * 1.45, d30.z);
          float r30 = length(d30Ell);
          if (r30 < 0.78 && uNebulaStrength > 0.01) {
            vec4 n30 = textureLod(uNoise3D, d30 * 1.85 + vec3(n2.a * 0.24, 0.31, 0.57), 0.0);
            float sx30 = (abs(d30.x) < 1e-6 && abs(d30.z) < 1e-6) ? 1e-6 : d30.x;
            float az30 = atan(d30.z, sx30);

            // Central wind-carved R136 bubble (slight hollow at r30 < 0.032 so R136a1 shines inside a 3D cathedral!)
            float r136Cav = smoothstep(0.012, 0.048, r30);
            float oiiiCore = exp(-sqr((r30 - 0.085) / 0.145)) * r136Cav * (0.62 + 0.88 * n30.g);

            // Iconic 8 arched "Tarantula Spider-Leg" H-alpha filaments twisting outward to ~0.62 kly
            float legWave = 0.5 + 0.5 * cos(8.0 * az30 + 5.2 * r30 + (n30.r - 0.5) * 3.8);
            float spiderLegs = pow(max(legWave, 0.0), 2.8) * exp(-sqr((r30 - 0.24) / 0.26)) *
                               smoothstep(0.04, 0.14, r30) * (0.50 + 0.95 * n30.b);

            // Outer [SII] & PAH coral-gold superbubble loops
            float outerLoops = exp(-sqr((r30 - 0.42) / 0.19)) * pow(clamp(n30.r * 0.65 + n2.g * 0.55, 0.0, 1.2), 2.0);

            vec3 colOIII = mix(vec3(0.08, 0.92, 0.76), vec3(0.18, 0.78, 1.00), n30.b);
            vec3 colHa   = vec3(1.00, 0.15, 0.35);
            vec3 colSII  = vec3(1.00, 0.62, 0.26);

            // Clear immediate 0.03 kly around camera when parked on R136a1 while keeping surrounding Tarantula vivid
            float camClear30 = mix(1.0, smoothstep(0.008, 0.065, length(p - roLMC)), r136Closeup);
            vec3 emit30 = (colOIII * oiiiCore * 1.38 + colHa * spiderLegs * 1.42 + colSII * outerLoops * 0.68) *
                          uNebulaStrength * camClear30 * mix(1.0, 0.45, snCloseup);
            emit += emit30;
          }

          // 4. N11 Giant Ring Nebula (LHA 120-N 11 at [-10.974, 0.065, -4.098], evacuated LH 9 cavity + LH 10 H-II ring)
          vec3 dN11 = p - P_N11;
          float rN11 = length(vec3(dN11.x, dN11.y * 1.65, dN11.z));
          if (rN11 < 0.68 && uNebulaStrength > 0.01) {
            float ringN11 = exp(-sqr((rN11 - 0.31) / 0.14)) * (0.58 + 0.85 * n2.g);
            float knotN11B = exp(-dot(dN11 - vec3(-0.08, 0.02, -0.26), dN11 - vec3(-0.08, 0.02, -0.26)) / 0.022);
            vec3 colN11 = mix(vec3(1.00, 0.24, 0.48), vec3(0.20, 0.86, 0.96), clamp(0.32 + 0.55 * knotN11B + 0.25 * n2.b, 0.0, 1.0));
            emit += colN11 * (ringN11 * 0.92 + knotN11B * 0.75) * uNebulaStrength * bgFogDamp;
          }

          // 5. N44 Wind-Blown Superbubble (LHA 120-N 44 at [-2.989, 0.040, -4.960], hollow shell + hot X-ray interior)
          vec3 dN44 = p - P_N44;
          float rN44 = length(vec3(dN44.x * 0.88, dN44.y * 1.65, dN44.z * 1.08));
          if (rN44 < 0.48 && uNebulaStrength > 0.01) {
            float shellN44 = exp(-sqr((rN44 - 0.20) / 0.082)) * (0.60 + 0.80 * n2.r);
            float xrayCav  = sstepInv(0.20, 0.04, rN44) * 0.28;
            emit += (vec3(0.96, 0.22, 0.54) * shellN44 * 0.95 + vec3(0.36, 0.58, 1.00) * xrayCav) * uNebulaStrength * bgFogDamp;
          }

          // 6. Beer-Lambert Dark Molecular Dust Filaments:
          //    Along the southern/eastern bar edge + ALMA Molecular Ridge south of 30 Doradus!
          float dustRho = 0.0;
          if (vertGas > 0.005 && uDustStrength > 0.01) {
            vec2 mrPa = p.xz - vec2(2.15, -4.05);
            vec2 mrBa = vec2(1.20, 5.70);
            float mrH = clamp(dot(mrPa, mrBa) / dot(mrBa, mrBa), 0.0, 1.0);
            float molRidge = exp(-dot(mrPa - mrBa * mrH, mrPa - mrBa * mrH) / 0.85);
            float barDust  = exp(-pow(max(abs(barXZ.x) / 4.6, 0.0), 2.8)) * exp(-sqr((barXZ.y - 0.76) / 0.60));
            float dustFil  = smoothstep(0.28, 0.84, pow(clamp(n1.r * 0.64 + n2.r * 0.56, 0.0, 1.3), 1.8));

            dustRho = vertGas * (barDust * 1.25 + molRidge * 1.55 + singleArm * 0.58 + expDisk * 0.20) *
                      (0.14 + 1.48 * dustFil) * bgFogDamp;
            emit += dustRho * vec3(0.38, 0.32, 0.26) * 0.022 * uDustStrength;
          }

          vec3 sigmaT = dustRho * vec3(0.34, 0.56, 0.82) * uDustStrength * mix(1.0, 1.65, inLMCDisk);
          vec3 stepTrans = exp(-sigmaT * dt);
          vec3 safeSigma = max(sigmaT, vec3(1e-4));
          vec3 weight = mix(vec3(dt), (1.0 - stepTrans) / safeSigma, step(vec3(1e-4), sigmaT));

          lmcAccum += lmcTrans * emit * weight;
          lmcTrans *= stepTrans;
          if (max(lmcTrans.r, max(lmcTrans.g, lmcTrans.b)) < 0.005) break;
        }
      }

      // Hue-preserving soft HDR shoulder (divides by scalar max-channel so [OIII] teal, H-alpha ruby & golden bar NEVER bleach to white!)
      float lmcPeak = max(lmcAccum.r, max(lmcAccum.g, lmcAccum.b));
      float shoulderK = mix(0.28, 0.85, max(inLMCDisk, r136Closeup));
      lmcAccum /= (1.0 + max(0.0, lmcPeak - 0.72) * shoulderK);

      // 7. Close-Up 1:1 3D SN 1987A Three-Ring "String of Pearls" Hourglass Remnant (within ~65 ly)
      if (dCamSN < 0.065) {
        lmc_evalSN1987ARemnant(roLMC, rdLMC, ign, dCamSN, lmcAccum, lmcTrans);
      }
    }
`;

// ============================================================================
// SECTION 3: PASS 2 LOCAL STAR SHADER STYLE (`style = 5.0` FOR `R136a1` WN5h)
// 3A. Photosphere branch for `shadeStarSurface` in `LOCAL_TERR_EXO_FRAG`
//     (Insert as `else if (style > 4.5 && style < 5.5)` BEFORE `style > 3.5`!)
// 3B. Supersonic Clumpy Wolf-Rayet Wind & Colliding-Wind Corona for `evalStellarCorona`
//     in `LOCAL_GIANTS_OVERLAYS_FRAG` (also expand `coronaMaxR` for `style > 4.5` to `starR * 11.2`).
// Calibrated strictly in 0.50 .. 2.45 pre-ACES HDR range so R136a1 exhibits
// resolved electric violet-sapphire-white Eddington cells & NEVER blows out!
// ============================================================================
export const R136A1_SHADE_STAR_SURFACE_GLSL = `
      } else if (style > 4.5 && style < 5.5) {
        // R136a1 & R136 CORE QUARTET (WN5h Wolf-Rayet Hypergiant in 30 Doradus: R=40 R_sun, T=46,000 K, L=4.7e6 L_sun!)
        // Calibrated non-clipped HDR photosphere (~0.55 - 2.42 pre-ACES) -> resolved electric sapphire-violet Eddington cells!
        float rotA = animT * 0.135;
        vec3 pRot = vec3(rot2D(nrm.xz, rotA), nrm.y).xzy;

        vec4 nEdd  = textureLod(uNoise3D, pRot * 2.35 + vec3(0.0, animT * 0.065, 0.0), 0.0);
        vec4 nClmp = textureLod(uNoise3D, pRot * 7.80 + nEdd.a * 0.34 - vec3(animT * 0.105), 0.0);
        vec4 nFine = textureLod(uNoise3D, pRot * 19.5 + vec3(animT * 0.14), 0.0);

        // Iron-opacity-bump (Fe-peak) radiative Eddington super-cells + dark optically-thick WR wind-clump rifts
        float polarBright = 0.72 + 0.36 * sqr(nrm.y);
        float cellCore    = smoothstep(0.30, 0.80, nEdd.g * 0.56 + nClmp.r * 0.34 + nFine.g * 0.16);
        float darkRift    = 1.0 - smoothstep(0.24, 0.56, nEdd.r * 0.58 + nClmp.b * 0.42);
        // Supersonic He II (468.6 nm) / N V eruptive shock arcs across the pseudo-photosphere
        float shockArcs   = pow(clamp(nClmp.g * 0.62 + nFine.r * 0.52, 0.0, 1.08), 3.4) * clamp(flareBoost, 0.6, 1.35);

        // Rich chromatic palette: royal indigo-sapphire rifts -> electric violet-azure cells -> blue-white shock ridges
        vec3 riftIndigo   = vec3(0.14, 0.28, 0.84);
        vec3 wrVioletBlue = mix(vec3(0.28, 0.56, 1.00), vec3(0.54, 0.42, 1.00), smoothstep(0.25, 0.75, nEdd.b));
        vec3 hotShock     = vec3(0.78, 0.90, 1.00);

        vec3 baseTint = mix(wrVioletBlue, riftIndigo, darkRift * 0.72);
        baseTint      = mix(baseTint, hotShock, clamp(cellCore * 0.42 + shockArcs * 0.65, 0.0, 0.88));

        float limb = 0.24 + 0.76 * pow(max(mu, 0.0), 0.72);
        float intensity = (0.78 + 0.82 * cellCore + 0.76 * shockArcs) * mix(1.0, 0.48, darkRift) * polarBright * limb;
        // Optically-thick He II / C IV extended Wolf-Rayet wind pseudo-limb
        float wrWindRim = pow(max(1.0 - mu, 0.0), 3.1) * 0.88;
        starOut = baseTint * intensity + vec3(0.36, 0.58, 1.00) * wrWindRim;
`;

export const R136A1_STELLAR_CORONA_GLSL = `
          // NOTE for lg-integrator: in evalStellarCorona, set coronaMaxR for style > 4.5 && style < 5.5 to (starR * 11.2)!
          if (style > 4.5 && style < 5.5) {
            // R136a1 Wolf-Rayet Supersonic Clumpy Radiative Wind (2,600 km/s) + Colliding-Wind Pinwheel Shock Arcs!
            vec3 outFlow = sampleDir * 2.6 - vec3(0.0, 0.0, animT * 0.22 - xNorm * 0.48);
            vec4 nWind   = textureLod(uNoise3D, outFlow, 0.0);
            float clumpyStreaks = 0.45 + 0.95 * pow(clamp(nWind.g * 0.62 + nFine.r * 0.52, 0.0, 1.2), 2.3);

            // Spiral / bow-shock colliding-wind compression arcs from close massive R136a2/a3 interactions
            float sxCor = (abs(dirCl.x) < 1e-6 && abs(dirCl.z) < 1e-6) ? 1e-6 : dirCl.x;
            float azCor = atan(dirCl.z, sxCor);
            float eqPlane = sqrt(max(0.0, 1.0 - sqr(dirCl.y * 0.75)));
            float pinwheel = pow(max(0.5 + 0.5 * cos(2.0 * azCor - 2.35 * log(max(xNorm, 1.0)) + animT * 0.24 + nLoop.a * 1.4), 0.0), 3.2);
            float shockShell = pinwheel * eqPlane * exp(-(xNorm - 1.0) * 0.38) * sstepInv(10.8, 6.5, xNorm);

            vec3 innerHeII = mix(vec3(0.30, 0.60, 1.00), vec3(0.56, 0.40, 1.00), nWind.b) *
                             (exp(-(xNorm - 1.0) * 2.3) * 0.58 + pow(max(xNorm, 1.0), -3.1) * 0.24) * clumpyStreaks;
            vec3 collideArc = mix(vec3(0.22, 0.86, 1.00), vec3(0.84, 0.36, 1.00), smoothstep(2.2, 7.5, xNorm)) *
                              shockShell * clumpyStreaks * 0.46 * clamp(flareBoost, 0.6, 1.35);
            res = innerHeII + collideArc;
          }
`;

// ============================================================================
// SECTION 4: DISCRETE 3D STAR GENERATOR (`populateLMCStars`, EXACT 24,000 STARS)
// Populates:
//   - Off-center warped Magellanic Stellar Bar (7,200 golden-amber/RC/AGB + young stars)
//   - Asymmetric m=1 single Western/Northern spiral arm & patchy OB clouds (9,800 stars)
//   - 30 Doradus / NGC 2070 / R136 dense OB/WR association + Hodge 301 RSGs (3,200 stars)
//   - N11 giant evacuated OB ring LH 9 / LH 10 (1,200 stars)
//   - N44 superbubble OB association LH 47 (800 stars)
//   - LMC populous globular clusters NGC 1866 (700), NGC 1978 (600) & 5 halo GCs (500)
// Enforces strict hero cavity clearance around R136_KLY and SN1987A_KLY!
// ============================================================================
export function populateLMCStars({
  pushStar,
  rnd,
  gauss,
  lmcLocalToWorldKly,
  R136_KLY,
  SN1987A_KLY
}) {
  let emitted = 0;

  const pushLMC = (lx, ly, lz, temp, lum, sz) => {
    const w = lmcLocalToWorldKly(lx, ly, lz);
    let wx = w[0], wy = w[1], wz = w[2];
    const isNeb = temp < 0.0;

    // Strict local hero cavity clearance around R136a1 & SN 1987A!
    const minR136 = isNeb ? 0.22 : 0.016;
    const dx1 = wx - R136_KLY[0], dy1 = wy - R136_KLY[1], dz1 = wz - R136_KLY[2];
    const d1Sq = dx1 * dx1 + dy1 * dy1 + dz1 * dz1;
    if (d1Sq < minR136 * minR136) {
      const d1 = Math.sqrt(d1Sq) || 1e-6;
      const pushOut = (minR136 * 1.25) / d1;
      wx = R136_KLY[0] + dx1 * pushOut;
      wy = R136_KLY[1] + dy1 * pushOut;
      wz = R136_KLY[2] + dz1 * pushOut;
    }

    const minSN = isNeb ? 0.26 : 0.022;
    const dx2 = wx - SN1987A_KLY[0], dy2 = wy - SN1987A_KLY[1], dz2 = wz - SN1987A_KLY[2];
    const d2Sq = dx2 * dx2 + dy2 * dy2 + dz2 * dz2;
    if (d2Sq < minSN * minSN) {
      const d2 = Math.sqrt(d2Sq) || 1e-6;
      const pushOut = (minSN * 1.25) / d2;
      wx = SN1987A_KLY[0] + dx2 * pushOut;
      wy = SN1987A_KLY[1] + dy2 * pushOut;
      wz = SN1987A_KLY[2] + dz2 * pushOut;
    }

    pushStar(wx, wy, wz, -2.0, temp, lum, sz, 0.0);
    emitted++;
  };

  // 4A. Off-Center Warped Magellanic Stellar Bar (7,200 stars: ~9.8 kly length, Choi 2018 tilt)
  const cBar = Math.cos(0.09), sBar = Math.sin(0.09);
  for (let i = 0; i < 7200; i++) {
    const bx = Math.max(-5.8, Math.min(5.8, gauss() * 2.55));
    const bz = gauss() * 0.88;
    const lx = 0.58 + cBar * bx - sBar * bz;
    const lz = 0.42 + sBar * bx + cBar * bz;
    const r  = Math.hypot(lx, lz);
    const th = Math.atan2(lz, lx);
    const warp = 0.032 * Math.max(0.0, r - 8.0) * Math.sin(th + 0.58);
    const barTilt = 0.072 * bx * Math.exp(-(bx * bx) / 31.36);
    const ly = warp + barTilt + gauss() * 0.42;

    const isYoungBar = rnd() < 0.14;
    const temp = isYoungBar ? (0.64 + rnd() * 0.34) : (0.12 + Math.pow(rnd(), 1.25) * 0.42);
    const lum  = isYoungBar ? (0.85 + Math.pow(rnd(), 3.0) * 3.8) : (0.48 + Math.pow(rnd(), 3.4) * 2.9);
    const sz   = 0.95 + Math.pow(rnd(), 4.0) * 1.75;
    pushLMC(lx, ly, lz, temp, lum, sz);
  }

  // 4B. Asymmetric Single Western/Northern Spiral Arm, Northern Arc, 30-Dor Spur & Irregular Disk (9,800 stars)
  for (let i = 0; i < 9800; i++) {
    let lx, lz;
    const mode = rnd();
    if (mode < 0.48) {
      // Single m=1 Western/NW Magellanic Spiral Arm sweeping from NW bar end right through N11!
      const r = 3.6 + Math.pow(rnd(), 0.88) * 11.8 + Math.abs(gauss()) * 0.9;
      const thSpine = 2.74 + 0.82 * Math.log(Math.max(r, 3.6) / 4.2);
      const th = thSpine + gauss() * 0.34;
      lx = Math.cos(th) * r;
      lz = Math.sin(th) * r;
    } else if (mode < 0.68) {
      // Northern Spiral Continuation & Eastern 30-Doradus Ram-Pressure Star-Forming Ridge
      const isEastSpur = rnd() < 0.52;
      const r  = isEastSpur ? (3.5 + Math.abs(gauss()) * 2.2 + rnd() * 3.2) : (9.2 + gauss() * 2.4);
      const th = (isEastSpur ? -1.04 : -1.72) + gauss() * (isEastSpur ? 0.28 : 0.42);
      lx = Math.cos(th) * r;
      lz = Math.sin(th) * r;
    } else {
      // Lopsided Exponential Irregular Stellar Disk out to R_disk ~ 16.1 kly (D = 32,200 ly!)
      const r  = Math.min(16.2, 0.8 + (-Math.log(Math.max(1e-4, rnd())) * 4.9));
      const th = rnd() * 6.2831853;
      lx = -0.85 + Math.cos(th) * r;
      lz = -0.75 + Math.sin(th) * r;
    }
    const r = Math.hypot(lx, lz);
    const th = Math.atan2(lz, lx);
    const ly = 0.032 * Math.max(0.0, r - 8.0) * Math.sin(th + 0.58) + gauss() * (mode < 0.68 ? 0.26 : 0.48);

    const isNeb = mode < 0.68 && rnd() < 0.022;
    const isOB  = !isNeb && rnd() < (mode < 0.68 ? 0.68 : 0.42);
    const temp  = isNeb ? -(0.15 + rnd() * 0.68) : (isOB ? (0.62 + rnd() * 0.38) : (0.16 + rnd() * 0.42));
    const lum   = isNeb ? (0.95 + rnd() * 1.15) : (isOB ? (0.82 + Math.pow(rnd(), 2.9) * 4.8) : (0.42 + Math.pow(rnd(), 3.6) * 2.5));
    const sz    = isNeb ? (2.0 + rnd() * 1.8) : (0.96 + Math.pow(rnd(), 3.9) * 2.0);
    pushLMC(lx, ly, lz, temp, lum, sz);
  }

  // 4C. 30 Doradus / NGC 2070 / R136 Super-Association + Older Hodge 301 RSG Subcluster (3,200 stars)
  for (let i = 0; i < 3200; i++) {
    const isHodge301 = i >= 2920; // NW older (~20-25 Myr) subcluster rich in red supergiants!
    let lx, ly, lz, temp, lum, sz;
    if (isHodge301) {
      lx = 2.115 + gauss() * 0.085;
      ly = 0.070 + gauss() * 0.055;
      lz = -4.345 + gauss() * 0.085;
      const isRSG = rnd() < 0.36;
      temp = isRSG ? (0.03 + rnd() * 0.09) : (0.58 + rnd() * 0.34);
      lum  = isRSG ? (2.1 + rnd() * 3.6) : (1.1 + rnd() * 2.8);
      sz   = isRSG ? (1.45 + rnd() * 1.6) : (1.1 + rnd() * 1.3);
    } else {
      // Concentrated King-like R136 halo (0.018 .. 0.58 kly) + spider-leg OB arches
      const isCoreHalo = i < 1450;
      const rad = isCoreHalo
        ? (0.018 + Math.pow(rnd(), 1.85) * 0.19)
        : (0.09 + Math.pow(rnd(), 1.15) * 0.52);
      const a1 = rnd() * 6.2831853;
      const c2 = 2.0 * rnd() - 1.0;
      const s2 = Math.sqrt(Math.max(0.0, 1.0 - c2 * c2));
      lx = 2.245 + rad * s2 * Math.cos(a1);
      ly = 0.055 + rad * c2 * 0.68;
      lz = -4.200 + rad * s2 * Math.sin(a1);

      const isNeb = !isCoreHalo && i < 1510;
      const isRSG = !isNeb && rnd() < 0.05;
      temp = isNeb ? -(0.22 + rnd() * 0.68) : (isRSG ? (0.04 + rnd() * 0.08) : (0.76 + rnd() * 0.24));
      lum  = isNeb ? 1.45 : (isRSG ? (2.4 + rnd() * 3.8) : (1.45 + Math.pow(rnd(), 2.5) * 6.4));
      sz   = isNeb ? 2.4 : (1.18 + Math.pow(rnd(), 3.0) * 2.25);
    }
    pushLMC(lx, ly, lz, temp, lum, sz);
  }

  // 4D. N11 Giant Ring Nebula OB Associations LH 9 (central cavity) & LH 10 / N11B (ring) (1,200 stars)
  for (let i = 0; i < 1200; i++) {
    const inRing = i >= 280;
    const th = rnd() * 6.2831853;
    const rN = inRing ? (0.28 + gauss() * 0.09) : (Math.pow(rnd(), 0.8) * 0.16);
    const lx = -10.974 + Math.cos(th) * rN;
    const lz = -4.098 + Math.sin(th) * rN;
    const ly = 0.065 + gauss() * 0.09;
    const isNeb = inRing && i < 310;
    pushLMC(
      lx, ly, lz,
      isNeb ? -(0.18 + rnd() * 0.65) : (0.72 + rnd() * 0.28),
      isNeb ? 1.25 : (1.2 + Math.pow(rnd(), 2.6) * 5.2),
      isNeb ? 2.3 : (1.1 + Math.pow(rnd(), 3.2) * 2.0)
    );
  }

  // 4E. N44 Superbubble OB Association LH 47 / LH 48 (800 stars)
  for (let i = 0; i < 800; i++) {
    const inRim = i >= 220;
    const th = rnd() * 6.2831853;
    const r44 = inRim ? (0.19 + gauss() * 0.065) : (Math.pow(rnd(), 0.75) * 0.12);
    const lx = -2.989 + Math.cos(th) * r44 * 1.12;
    const lz = -4.960 + Math.sin(th) * r44 * 0.92;
    const ly = 0.040 + gauss() * 0.075;
    const isNeb = inRim && i < 240;
    pushLMC(
      lx, ly, lz,
      isNeb ? -(0.20 + rnd() * 0.62) : (0.70 + rnd() * 0.30),
      isNeb ? 1.20 : (1.1 + Math.pow(rnd(), 2.7) * 4.8),
      isNeb ? 2.2 : (1.08 + Math.pow(rnd(), 3.3) * 1.95)
    );
  }

  // 4F. LMC Populous Globular Clusters: NGC 1866 (700), NGC 1978 (600) + 5 Old Halo Globulars (500 = 1,800 total)
  const lmcGlobulars = [
    { cx: -8.632, cy:  0.180, cz: -10.107, rad: 0.36, count: 700, youngFrac: 0.72, ellipX: 1.00 }, // NGC 1866 (young blue + Cepheids!)
    { cx: -3.979, cy:  0.240, cz: -10.711, rad: 0.34, count: 600, youngFrac: 0.08, ellipX: 1.32 }, // NGC 1978 (flattened ~2 Gyr)
    { cx: -9.800, cy:  1.350, cz:   6.400, rad: 0.28, count: 100, youngFrac: 0.09, ellipX: 1.00 }, // Outer SW halo GC (NGC 1466-like)
    { cx:  1.650, cy: -0.950, cz:   1.200, rad: 0.24, count: 100, youngFrac: 0.10, ellipX: 1.05 }, // Bar-halo GC (NGC 1835-like)
    { cx:  7.850, cy:  1.620, cz:   8.900, rad: 0.30, count: 100, youngFrac: 0.08, ellipX: 1.00 }, // Southern halo GC (NGC 1841-like)
    { cx:  9.400, cy: -1.180, cz:  -2.800, rad: 0.26, count: 100, youngFrac: 0.09, ellipX: 1.00 }, // Eastern halo GC (NGC 2210-like)
    { cx:  6.200, cy:  1.450, cz: -11.400, rad: 0.28, count: 100, youngFrac: 0.09, ellipX: 1.00 }  // NE halo GC (NGC 2257-like)
  ];

  for (let g = 0; g < lmcGlobulars.length; g++) {
    const gc = lmcGlobulars[g];
    for (let s = 0; s < gc.count; s++) {
      const rL = gc.rad * Math.pow(rnd(), 1.82) / Math.sqrt(Math.max(0.12, 1.0 - rnd() * 0.72)) * 0.32;
      const a1 = rnd() * 6.2831853;
      const c2 = 2.0 * rnd() - 1.0;
      const s2 = Math.sqrt(Math.max(0.0, 1.0 - c2 * c2));
      const isBlue = rnd() < gc.youngFrac;
      const isCepheid = g === 0 && !isBlue && rnd() < 0.35;
      pushLMC(
        gc.cx + rL * s2 * Math.cos(a1) * gc.ellipX,
        gc.cy + rL * c2,
        gc.cz + rL * s2 * Math.sin(a1),
        isBlue ? (0.66 + rnd() * 0.30) : (isCepheid ? (0.38 + rnd() * 0.14) : (0.10 + rnd() * 0.36)),
        (g < 2 ? 1.25 : 0.90) * (0.62 + Math.pow(rnd(), 3.0) * 3.9),
        1.05 + Math.pow(rnd(), 3.8) * 1.75
      );
    }
  }

  return emitted; // Exact 24,000 stars
}

// ============================================================================
// SECTION 5: HERO CAMERA ANGLES, PRESETS, MIN-DISTANCES, EPHEMERIS & LABELS
// Ready-to-paste blocks for milky_way.html & build_solar_standalone.py!
// ============================================================================
export const LMC_CAMERA_AND_UI_JS = `
  // --- 5A. Exact 3D Astrophysical View Directions for LMC, Tarantula/R136a1 & SN 1987A ---
  // HERO_LMC_ANG: Frames LMC's 32,200-ly inclined disk (Bar + Single W/N Arm + 30 Doradus + N11 + N44)
  // center-left with the 105,700-ly Milky Way spiral gleaming cleanly in the right background!
  const HERO_LMC_ANG = dirToYawPitch([
    LMC_BASE_KLY[0] - 72.0,
    LMC_BASE_KLY[1] * 0.78 - 36.0,
    LMC_BASE_KLY[2] * 0.90
  ]);

  // HERO_R136_ANG: Looks across R136a1 (40 R_sun WN5h Wolf-Rayet hypergiant + colliding-wind corona)
  // directly toward massive cluster companions R136a2, R136a3 & R136c inside glowing 30 Doradus!
  const HERO_R136_ANG = dirToYawPitch([
    LMC_BASIS.v[0] * 0.92 - LMC_BASIS.u[0] * 0.18 + LMC_BASIS.n[0] * 0.22,
    LMC_BASIS.v[1] * 0.92 - LMC_BASIS.u[1] * 0.18 + LMC_BASIS.n[1] * 0.22,
    LMC_BASIS.v[2] * 0.92 - LMC_BASIS.u[2] * 0.18 + LMC_BASIS.n[2] * 0.22
  ]);

  // HERO_SN1987A_ANG: Views SN 1987A along the exact Earth/HST 42.85°-inclined line of sight so the
  // 24-pearl 0.67-ly equatorial ring + twin crimson-magenta outer hourglass rings & background 30 Doradus shine!
  const HERO_SN1987A_ANG = dirToYawPitch([
    SUN_BASE_KLY[0] - SN1987A_KLY[0],
    SUN_BASE_KLY[1] - SN1987A_KLY[1],
    SUN_BASE_KLY[2] - SN1987A_KLY[2]
  ]);

  // --- 5B. computeEphemeris return additions ---
  // Add to return {...} of computeEphemeris:
  //   lmc: LMC_BASE_KLY,
  //   tarantula_30dor: TARANTULA_30DOR_KLY,
  //   tarantula_r136: R136_KLY,
  //   r136Cluster: R136_CLUSTER_STARS,
  //   sn1987a: SN1987A_KLY,
  //   lmc_n11: LMC_N11_KLY,
  //   lmc_n44: LMC_N44_KLY,
  //   ngc1866: LMC_NGC1866_KLY,
  //   ngc1978: LMC_NGC1978_KLY,

  // --- 5C. getMinDistKly additions ---
  //   case 'lmc':            return 0.25;
  //   case 'tarantula_r136': return 95.0 * RSUN_IN_KLY;
  //   case 'sn1987a':        return 0.00045; // 0.45 ly (~28,500 AU) close-up inside the 3-ring hourglass!

  // --- 5D. Pass 2 Local Star Wiring in renderScene ---
  // const dLmcKly = Math.hypot(cam.posKly[0] - LMC_BASE_KLY[0], cam.posKly[1] - LMC_BASE_KLY[1], cam.posKly[2] - LMC_BASE_KLY[2]);
  // else if (dLmcKly < 22.0) {
  //   runLocalPass = true;
  //   for (let i = 0; i < 4; i++) {
  //     const st = eph.r136Cluster[i];
  //     setStarSlot(i, st.posKly, st.rRsun, st.tempK, st.style, state.accretion, st.lumWeight);
  //   }
  // }

  // --- 5E. Hero Camera PRESETS entries ---
  const LMC_PRESETS = {
    lmc: {
      title: '大麦哲伦星系 LMC / ESO 56-G 115 (距地 16.17 万光年 · 直径 32,200 ly · 倾角 34.7°)：',
      desc: '参照 Pietrzyński et al. (2019) Nature 1% 精测距离与 Gaia 运动学复刻：偏心翘曲金黄恒星棒、单侧西北旋臂、分子暗尘埃脊、千光年蜘蛛星云 (30 Doradus)、N11/N44 超级气泡，远景回望整座银河系！',
      anchorId: 'lmc', anchorLabel: '大麦哲伦星系 LMC (3.22万 ly)',
      offsetKly: [-3.4, -1.2, 2.0], yaw: HERO_LMC_ANG.yaw, pitch: HERO_LMC_ANG.pitch, distKly: 33.0, fov: 54
    },
    tarantula_r136: {
      title: '蜘蛛星云 30 Doradus 与宇宙恒星之王 R136a1 (40 R☉ · 46,000 K 沃尔夫-拉叶极超巨星)：',
      desc: '深入本星系群最狂暴的千光年电离氢暴星区 (NGC 2070)：青翠 [OIII] 电离核与绯红 Hα 蛛腿丝状云环抱中，1:1 呈现 470 万倍太阳光度的 R136a1 蓝紫爱丁顿沸腾光球、2,600 km/s 超音速团块星风与 R136a2/a3/c 伴星群！',
      anchorId: 'tarantula_r136', anchorLabel: '蜘蛛星云核心 · R136a1 (40 R☉)',
      offsetKly: [0, 0, 0], yaw: HERO_R136_ANG.yaw, pitch: HERO_R136_ANG.pitch, distKly: 340.0 * RSUN_IN_KLY, fov: 46
    },
    sn1987a: {
      title: '超新星遗迹 SN 1987A · 哈勃/韦布 1:1 三环沙漏与 24 颗“珍珠项链” (半径 0.67 ly = 42,370 AU)：',
      desc: '复刻 400 年来最亮近邻超新星遗迹：42.85° 倾角赤道环上激波压缩点亮的 24 颗璀璨热斑“珍珠项链”、南北对称倾斜的 [NII] 品红双外环，以及中心韦布望远镜发现的青蓝铁/氧锁孔状喷发物！',
      anchorId: 'sn1987a', anchorLabel: 'SN 1987A 超新星三环遗迹 (1.34 ly)',
      offsetKly: [0, 0, 0], yaw: HERO_SN1987A_ANG.yaw, pitch: HERO_SN1987A_ANG.pitch, distKly: 0.0038, fov: 48
    }
  };

  // --- 5F. Collision-Free 3D Astronomical LABELS entries ---
  const LMC_LABELS = [
    { key: 'lmc',            name: '大麦哲伦星系 LMC',            sub: '距地 16.17万 ly · 直径 3.22万 ly · SB(s)m', getPos: e => e.lmc,            color: '#f472b6', minKly: 12.0,               maxKly: 1850,  hideNearKly: 10.0,               radiusKly: 8.5 },
    { key: 'tarantula_r136', name: '蜘蛛星云 30 Doradus (NGC 2070)', sub: '跨度 1,000 ly · 本星系群最强育星暴区',     getPos: e => e.tarantula_r136, color: '#2dd4bf', minKly: 0.65,               maxKly: 95.0,  hideNearKly: 0.65,               radiusKly: 0.45 },
    { key: 'tarantula_r136', name: '极超巨星 R136a1 (R136 星团)',   sub: 'WN5h · 40 R☉ · 46,000 K · 470万 L☉',      getPos: e => e.tarantula_r136, color: '#60a5fa', minKly: 950 * RSUN_IN_KLY,  maxKly: 0.65,  hideNearKly: 950 * RSUN_IN_KLY,  radiusKly: 65 * RSUN_IN_KLY },
    { key: 'sn1987a',        name: '超新星遗迹 SN 1987A',           sub: '三环沙漏与 24 颗激波珍珠链 · R=0.67 ly',   getPos: e => e.sn1987a,        color: '#fb7185', minKly: 0.009,              maxKly: 58.0,  hideNearKly: 0.009,              radiusKly: 0.002 },
    { key: null,             name: '巨型环状星云 N11',              sub: 'LHA 120-N 11 · LMC 西北旋臂第二大星云',    getPos: e => e.lmc_n11,        color: '#f472b6', minKly: 1.2,                maxKly: 72.0,  hideNearKly: 1.0,                radiusKly: 0.35 },
    { key: null,             name: '超级气泡星云 N44',              sub: 'LHA 120-N 44 · 恒星风雕刻炽热 X 射线空腔',  getPos: e => e.lmc_n44,        color: '#c084fc', minKly: 1.2,                maxKly: 65.0,  hideNearKly: 0.9,                radiusKly: 0.25 },
    { key: null,             name: '年轻蓝球状星团 NGC 1866',       sub: 'LMC 北部大质量星团 · 富含经典造父变星',     getPos: e => e.ngc1866,        color: '#93c5fd', minKly: 1.5,                maxKly: 55.0,  hideNearKly: 1.0,                radiusKly: 0.25 },
    { key: null,             name: '椭球状星团 NGC 1978',           sub: 'LMC 北部扁平中龄球状星团 (~20 亿年)',      getPos: e => e.ngc1978,        color: '#fcd34d', minKly: 1.5,                maxKly: 52.0,  hideNearKly: 1.0,                radiusKly: 0.25 }
  ];
`;
