/**
 * ============================================================================
 * MILKY WAY ICONIC NEBULAE & PULSAR 1:1 ASTROPHYSICAL MODULE
 * (`mw_nebulae_module.js`) — Authored by `mw-nebulae-modeler`
 * ============================================================================
 * Targets:
 *   1. Crab Nebula & Pulsar (`蟹状星云脉冲星 M1 / SN 1054 / PSR B0531+21`):
 *      - d = 6,500 ly (6.500 kly), l = 184.557°, b = -5.784°
 *      - 1:1 11.0 × 7.6 × 7.6 ly Rayleigh-Taylor filamentary cage ([O III], [N II]/Hα, [S II])
 *        + Sapphire-Cyan Optical Synchrotron PWN + 28°-tilted Chandra Equatorial Wisps/Rings
 *        (R = 0.35–1.35 ly) + Twin Curved S-Shaped Relativistic Polar Jets (±4.2 ly)
 *        + Pass 2 `style = 9.0` Spinning Relativistic Lighthouse Pulsar (`rRsun = 0.018`).
 *   2. Orion Nebula & Trapezium (`猎户座大星云 M42 / NGC 1976 & θ¹ Orionis`):
 *      - d = 1,344 ly (1.344 kly), l = 209.014°, b = -19.382°
 *      - 1:1 24.0 ly Concave Huygens Blister Wall opening toward Sun + Diagonal Golden-Coral
 *        Orion Bar + Beer-Lambert Foreground Dark "Fish's Mouth" Bay + Sweeping Great Orion
 *        Wings + Northern M43 Comma Nebula + 4 Resolved Trapezium OB Stars (`θ¹ Ori C1, A1, D, B`)
 *        + 5 Analytic 3D Photoevaporating Teardrop Protoplanetary Disks (`Proplyds`).
 *   3. Eagle Nebula & "Pillars of Creation" (`鹰状星云 M16 / NGC 6611 & 创生之柱`):
 *      - d = 5,700 ly (5.700 kly), l = 16.954°, b = +0.793° (Sagittarius–Carina Arm)
 *      - Macro 70 × 55 ly M16 Turquoise [O III] & Terracotta Hα/[S II] Cavity + NGC 6611 OB Source
 *      - 1:1 3D Volumetric "Pillars of Creation" (Pillar I = 4.50 ly, II = 3.20 ly, III = 1.95 ly
 *        + Western Spire, Forked Crown & EGG Fingertips) with Opaque Beer-Lambert Dust Extinction
 *        (`sigmaT = vec3(1.35, 1.05, 0.82) * density`), Directional UV-Self-Shadowed Golden-Amber
 *        & Cyan Photoevaporating Rims, and Crimson JWST Herbig-Haro Protostellar Shock Tips.
 *   4. Discrete Star Catalog (`populateMilkyWayFamousStars`):
 *      - Exact 18,000 co-rotating `w = 1.0` polar-disk stars (6,500 Orion OB1/M42 + 6,500 M16/NGC 6611
 *        + 2,500 Crab Taurus field + 2,500 Solar–Orion neighborhood) with strict >= 16 ly (> 15 ly)
 *        hero cavities around Trapezium, Pillars, Crab Pulsar, Betelgeuse, Sirius, Vega, Sun & Proxima.
 * ============================================================================
 */

// ============================================================================
// 1. EXACT MILKY WAY CO-ROTATING ASTROMETRY (`MW_NEBULAE_ASTROMETRY_JS`)
//    Drop into Section 1C of `milky_way.html` (uses existing `SUN_BASE_KLY`,
//    `AU_IN_KLY`, `RSUN_IN_KLY`, `galacticToSunOffsetKly`, `rotateGalacticDiskKly`,
//    `normVec3`, `dot3`, `crossVec3`, `dirToYawPitch`).
// ============================================================================

const _mwNeb_SUN_BASE_KLY = [26.673, 0.0678, 0.0];
const _mwNeb_KM_PER_KLY   = 9460730472580.8 * 1000.0;
const _mwNeb_RSUN_IN_KLY  = 695700.0 / _mwNeb_KM_PER_KLY;

function _mwNeb_galacticToSunOffsetKly(distLy, lDeg, bDeg) {
  const dKly = distLy * 0.001;
  const l = (lDeg * Math.PI) / 180.0;
  const b = (bDeg * Math.PI) / 180.0;
  const cb = Math.cos(b);
  return [
    -dKly * cb * Math.cos(l),
     dKly * Math.sin(b),
     dKly * cb * Math.sin(l)
  ];
}

function _mwNeb_heliocentricToWorldKly(distLy, lDeg, bDeg) {
  const off = _mwNeb_galacticToSunOffsetKly(distLy, lDeg, bDeg);
  return [
    _mwNeb_SUN_BASE_KLY[0] + off[0],
    _mwNeb_SUN_BASE_KLY[1] + off[1],
    _mwNeb_SUN_BASE_KLY[2] + off[2]
  ];
}

function _mwNeb_norm3(v) {
  const len = Math.hypot(v[0], v[1], v[2]) || 1.0;
  return [v[0] / len, v[1] / len, v[2] / len];
}

function _mwNeb_rotateDiskKly(basePos, galAngle) {
  const c = Math.cos(galAngle), s = Math.sin(galAngle);
  return [
    c * basePos[0] - s * basePos[2],
    basePos[1],
    s * basePos[0] + c * basePos[2]
  ];
}

function _mwNeb_warpHeightJS(x, z) {
  const r = Math.hypot(x, z);
  const w = Math.max(0.0, r - 30.0);
  if (w <= 0.0) return 0.0;
  const th = Math.atan2(z, x);
  return 0.0040 * Math.pow(w, 1.58) * Math.sin(th - 0.35);
}

// 1A. Crab Nebula (M1 / NGC 1952 / SN 1054 天关客星) & Crab Pulsar (PSR B0531+21)
//     d = 6500.0 ly (6.500 kly), l = 184.557°, b = -5.784°
//     1:1 Span: 11.0 × 7.6 × 7.6 ly (semi-axes = [0.0055, 0.0038, 0.0038] kly), tilted ~32° NW–SE
const CRAB_BASE_KLY = _mwNeb_heliocentricToWorldKly(6500.0, 184.557, -5.784);
// Exact Ng & Romani (2004) Chandra/HST Pulsar Spin & Relativistic Jet Axis (tilted 28° to sky plane):
const CRAB_SPIN_AXIS_BASE = [-0.515040, 0.236222, -0.823974];
const CRAB_SEMI_AXES_KLY  = [0.0055, 0.0038, 0.0038];
const CRAB_PULSAR_SPEC = {
  id: 'crab_pulsar',
  name: 'PSR B0531+21 (蟹状星云脉冲星 · 30.2 Hz)',
  rRsun: 0.018,     // ~12,523 km force-free light-cylinder magnetosphere around ~10 km neutron star
  tempK: 38000.0,
  style: 9.0,
  lumWeight: 42.0
};

// 1B. Orion Nebula (M42 / NGC 1976) & Trapezium Cluster (θ¹ Orionis C1, A1, D, B)
//     d = 1344.0 ly (1.344 kly), l = 209.014°, b = -19.382°
//     1:1 Span: 24.0 ly diameter (R = 0.012 kly Huygens blister + Great Orion Wings + M43)
const M42_BASE_KLY       = _mwNeb_heliocentricToWorldKly(1344.0, 209.014, -19.382);
const TRAPEZIUM_BASE_KLY = M42_BASE_KLY;

// Local M42 camera-aligned orthonormal triad [m42X (screen-right), m42Y (screen-up), m42Z (toSun)]:
const M42_LOCAL_X = [ 0.485023, 0.000000,  0.874501];
const M42_LOCAL_Y = [ 0.290216, 0.943327, -0.160962];
const M42_LOCAL_Z = [-0.824941, 0.331865,  0.457536]; // Exact unit vector M42 -> Sun!

function m42LocalToBaseKly(lx, ly, lz) {
  return [
    M42_BASE_KLY[0] + M42_LOCAL_X[0] * lx + M42_LOCAL_Y[0] * ly + M42_LOCAL_Z[0] * lz,
    M42_BASE_KLY[1] + M42_LOCAL_X[1] * lx + M42_LOCAL_Y[1] * ly + M42_LOCAL_Z[1] * lz,
    M42_BASE_KLY[2] + M42_LOCAL_X[2] * lx + M42_LOCAL_Y[2] * ly + M42_LOCAL_Z[2] * lz
  ];
}

// 1:1 Trapezium Quartet (θ¹ Orionis C1, A1, D, B — ~0.15–0.32 ly physical 3D trapezoid spacing!):
const TRAPEZIUM_STARS_BASE = [
  {
    id: 'theta1_ori_c',
    name: 'θ¹ Ori C1 (O6Vp · 33 M☉ · 20万 L☉ 主电离源)',
    localKly: [-0.000015, -0.000060,  0.000020],
    rRsun: 10.6, tempK: 39000.0, style: 5.0, lumWeight: 18.0
  },
  {
    id: 'theta1_ori_a',
    name: 'θ¹ Ori A1 (B0.5V · 6.3 R☉ · 30,000 K)',
    localKly: [ 0.000105,  0.000088, -0.000032],
    rRsun: 6.3,  tempK: 30000.0, style: 2.0, lumWeight: 7.5
  },
  {
    id: 'theta1_ori_d',
    name: 'θ¹ Ori D (B0.5V · 5.6 R☉ · 32,000 K)',
    localKly: [-0.000148,  0.000052,  0.000038],
    rRsun: 5.6,  tempK: 32000.0, style: 2.0, lumWeight: 8.2
  },
  {
    id: 'theta1_ori_b',
    name: 'θ¹ Ori B (B1V · 4.2 R☉ · BM Ori 食双星)',
    localKly: [ 0.000038,  0.000168, -0.000024],
    rRsun: 4.2,  tempK: 24000.0, style: 2.0, lumWeight: 4.8
  }
].map(st => ({
  ...st,
  basePosKly: m42LocalToBaseKly(st.localKly[0], st.localKly[1], st.localKly[2])
}));

// 1C. Eagle Nebula (M16 / NGC 6611) & 1:1 "Pillars of Creation" (创生之柱)
//     d = 5700.0 ly (5.700 kly), l = 16.954°, b = +0.793° (Sagittarius–Carina Arm)
//     Macro M16 cavity: 70 × 55 ly (R ~ 0.035 kly); NGC 6611 OB cluster +8.0 ly NW inside cavity;
//     Pillars of Creation ~4.18 ly SE of M16 center pointing directly toward NGC 6611 UV source!
const M16_BASE_KLY         = _mwNeb_heliocentricToWorldKly(5700.0, 16.954, 0.793);
const NGC6611_BASE_KLY     = [21.2221440, 0.1542079, 1.6645619];
const PILLARS_M16_BASE_KLY = [21.2219491, 0.1429116, 1.6603432];

// Reference Solar-Orion neighborhood landmarks for strict 16 ly star-free hero cavities:
const _MW_SIRIUS_BASE_KLY     = _mwNeb_heliocentricToWorldKly(8.601,   227.230, -8.890);
const _MW_VEGA_BASE_KLY       = _mwNeb_heliocentricToWorldKly(25.04,    67.448, 19.237);
const _MW_BETELGEUSE_BASE_KLY = _mwNeb_heliocentricToWorldKly(548.0,   199.787, -8.959);
const _MW_PROXIMA_BASE_KLY    = _mwNeb_heliocentricToWorldKly(4.2465,  313.925, -1.918);
const _MW_ALPHACEN_BASE_KLY   = _mwNeb_heliocentricToWorldKly(4.3441,  315.730, -0.680);

const MW_HERO_CAVITY_CENTERS_KLY = [
  _mwNeb_SUN_BASE_KLY,
  _MW_PROXIMA_BASE_KLY,
  _MW_ALPHACEN_BASE_KLY,
  _MW_SIRIUS_BASE_KLY,
  _MW_VEGA_BASE_KLY,
  _MW_BETELGEUSE_BASE_KLY,
  M42_BASE_KLY,
  CRAB_BASE_KLY,
  PILLARS_M16_BASE_KLY,
  M16_BASE_KLY
];

// Ephemeris helper to call inside `computeEphemeris(galTime, ...)`:
function computeMwNebulaeEphemeris(galAngle) {
  const crabKly    = _mwNeb_rotateDiskKly(CRAB_BASE_KLY, galAngle);
  const m42Kly     = _mwNeb_rotateDiskKly(M42_BASE_KLY, galAngle);
  const m16Kly     = _mwNeb_rotateDiskKly(M16_BASE_KLY, galAngle);
  const ngc6611Kly = _mwNeb_rotateDiskKly(NGC6611_BASE_KLY, galAngle);
  const pillarsKly = _mwNeb_rotateDiskKly(PILLARS_M16_BASE_KLY, galAngle);
  const trapeziumStars = TRAPEZIUM_STARS_BASE.map(st => ({
    ...st,
    posKly: _mwNeb_rotateDiskKly(st.basePosKly, galAngle)
  }));
  return {
    crab_nebula: crabKly,
    crab_pulsar: crabKly,
    crabPulsarSpec: CRAB_PULSAR_SPEC,
    orion_m42: m42Kly,
    trapezium: m42Kly,
    trapeziumStars,
    eagle_m16: m16Kly,
    ngc6611: ngc6611Kly,
    pillars_of_creation: pillarsKly
  };
}

// Copy-ready snippet string for direct insertion into `milky_way.html` Section 1C:
const MW_NEBULAE_ASTROMETRY_JS = `
  // ============================================================================
  // 1D. 1:1 MILKY WAY ICONIC NEBULAE & PULSAR ASTROMETRY (CRAB M1, ORION M42, EAGLE M16 & PILLARS)
  // ============================================================================
  const CRAB_BASE_KLY        = heliocentricGalacticToWorldKly(6500.0, 184.557, -5.784);
  const CRAB_SPIN_AXIS_BASE  = [-0.515040, 0.236222, -0.823974];
  const CRAB_PULSAR_SPEC     = { id: 'crab_pulsar', name: 'PSR B0531+21 (蟹状星云脉冲星)', rRsun: 0.018, tempK: 38000.0, style: 9.0, lumWeight: 42.0 };

  const M42_BASE_KLY         = heliocentricGalacticToWorldKly(1344.0, 209.014, -19.382);
  const TRAPEZIUM_BASE_KLY   = M42_BASE_KLY;
  const M42_LOCAL_X          = [ 0.485023, 0.000000,  0.874501];
  const M42_LOCAL_Y          = [ 0.290216, 0.943327, -0.160962];
  const M42_LOCAL_Z          = [-0.824941, 0.331865,  0.457536];
  function m42LocalToBaseKly(lx, ly, lz) {
    return [
      M42_BASE_KLY[0] + M42_LOCAL_X[0] * lx + M42_LOCAL_Y[0] * ly + M42_LOCAL_Z[0] * lz,
      M42_BASE_KLY[1] + M42_LOCAL_X[1] * lx + M42_LOCAL_Y[1] * ly + M42_LOCAL_Z[1] * lz,
      M42_BASE_KLY[2] + M42_LOCAL_X[2] * lx + M42_LOCAL_Y[2] * ly + M42_LOCAL_Z[2] * lz
    ];
  }
  const TRAPEZIUM_STARS_BASE = [
    { id: 'theta1_ori_c', name: 'θ¹ Ori C1 (O6Vp · 33 M☉ · 39,000 K)', localKly: [-0.000015, -0.000060,  0.000020], rRsun: 10.6, tempK: 39000.0, style: 5.0, lumWeight: 18.0 },
    { id: 'theta1_ori_a', name: 'θ¹ Ori A1 (B0.5V · 6.3 R☉)',          localKly: [ 0.000105,  0.000088, -0.000032], rRsun: 6.3,  tempK: 30000.0, style: 2.0, lumWeight: 7.5 },
    { id: 'theta1_ori_d', name: 'θ¹ Ori D (B0.5V · 5.6 R☉)',           localKly: [-0.000148,  0.000052,  0.000038], rRsun: 5.6,  tempK: 32000.0, style: 2.0, lumWeight: 8.2 },
    { id: 'theta1_ori_b', name: 'θ¹ Ori B (B1V · 4.2 R☉)',             localKly: [ 0.000038,  0.000168, -0.000024], rRsun: 4.2,  tempK: 24000.0, style: 2.0, lumWeight: 4.8 }
  ].map(st => ({ ...st, basePosKly: m42LocalToBaseKly(st.localKly[0], st.localKly[1], st.localKly[2]) }));

  const M16_BASE_KLY         = heliocentricGalacticToWorldKly(5700.0, 16.954, 0.793);
  const NGC6611_BASE_KLY     = [21.2221440, 0.1542079, 1.6645619];
  const PILLARS_M16_BASE_KLY = [21.2219491, 0.1429116, 1.6603432];
`;


// ============================================================================
// 2. PASS 1 GLSL VOLUMETRIC SHADER (`MW_NEBULAE_VOLUMETRIC_GLSL` for `VOLUMETRIC_FRAG`)
//    - 0 extra uniforms required (`uGalAngle`, `uNoise3D`, `uDustStrength`,
//      `uNebulaStrength`, `uBhPhase`, `uTanHalfFov` are already in `VOLUMETRIC_FRAG`!).
//    - 0 raymarch steps on ray-sphere miss!
//    - Strict GLSL ES 3.00 / ANGLE D3D11 compliance:
//      * 0 preprocessor `##` token-pasting
//      * 0 negative `pow(x, y)`
//      * 0 inverted `smoothstep(hi, lo, x)`
//      * Chroma-preserving scalar-peak HDR shoulder (`mwNeb_chromaShoulder`)
//
//    Integration in `VOLUMETRIC_FRAG` `main()` (right after `mwTotal` at line ~3009):
//      vec3 mwNebAccum = vec3(0.0);
//      vec3 mwNebTrans = vec3(1.0);
//      evalMilkyWayIconicNebulae(ro, rd, uGalAngle, ign, mwNebAccum, mwNebTrans);
//      mwTotal  = mwTotal * mwNebTrans + mwNebAccum * bhFogScale;
//      galTrans *= mwNebTrans;
//      skyMask  *= clamp(dot(mwNebTrans, vec3(0.3333)), 0.05, 1.0);
// ============================================================================

const MW_NEBULAE_VOLUMETRIC_GLSL = `
    precision highp float;
    precision highp sampler3D;

    in vec2 vUv;
    out vec4 fragColor;

    uniform sampler3D uNoise3D;
    uniform vec3 uCamPos;
    uniform vec3 uCamRelCrabGal;
    uniform vec3 uCamRelM42Gal;
    uniform vec3 uCamRelM16Gal;
    uniform vec3 uCamRelPillarsGal;
    uniform mat3 uCamBasis;
    uniform float uTanHalfFov;
    uniform float uAspect;
    uniform float uGalAngle;
    uniform float uBhPhase;
    uniform float uDustStrength;
    uniform float uNebulaStrength;
    uniform float uHdrScale;
    uniform int uStepCount;

    ${GALAXY_COMMON_GLSL}

    vec2 intersectBox(vec3 ro, vec3 rd, vec3 boxMax) {
      vec3 inv = 1.0 / (rd + sign(rd + 1e-8) * 1e-8);
      vec3 t0 = (-boxMax - ro) * inv;
      vec3 t1 = ( boxMax - ro) * inv;
      vec3 tmin = min(t0, t1);
      vec3 tmax = max(t0, t1);
      return vec2(max(max(tmin.x, tmin.y), tmin.z), min(min(tmax.x, tmax.y), tmax.z));
    }

    float mwNeb_safeAtan(float y, float x) {
      float sx = (abs(x) < 1e-7 && abs(y) < 1e-7) ? 1e-7 : x;
      return atan(y, sx);
    }

    vec3 mwNeb_chromaShoulder(vec3 c, float knee, float asymCap) {
      float pk = max(c.r, max(c.g, c.b));
      if (pk <= knee) return c;
      float ex = pk - knee;
      float span = max(asymCap - knee, 0.05);
      float comp = knee + span * (ex / (ex + span));
      return c * (comp / max(pk, 1e-6));
    }

    float mwNeb_seg2D(vec2 p, vec2 a, vec2 b, out float hFrac) {
      vec2 pa = p - a;
      vec2 ba = b - a;
      hFrac = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-9), 0.0, 1.0);
      return length(pa - ba * hFrac);
    }

    vec3 mwNeb_evalGalacticBeacon(vec3 toC, vec3 rdGal, float physR, float dCam, vec3 coreCol, vec3 outerCol, float gain) {
      if (dCam < physR * 2.4 || dCam > 34.0) return vec3(0.0);
      float tCl = dot(toC, rdGal);
      if (tCl <= 0.0) return vec3(0.0);
      vec3 perpB = toC - rdGal * tCl;
      float b2 = dot(perpB, perpB);
      float angSig = max(physR * 0.75, dCam * uTanHalfFov * 0.0065);
      if (b2 > sqr(angSig * 4.5)) return vec3(0.0);
      float nearCrossFade = smoothstep(physR * 2.4, physR * 7.5, dCam);
      float farFade       = sstepInv(34.0, 8.5, dCam);
      float dustDim       = exp(-min(dCam * 0.045 * uDustStrength, 1.15));
      float u2 = b2 / sqr(angSig);
      float core = exp(-u2 * 1.65);
      float halo = exp(-u2 * 0.32) * 0.36;
      return mix(outerCol, coreCol, core) * (core + halo) * (gain * nearCrossFade * farFade * dustDim);
    }

    // A. CRAB NEBULA (M1 / SN 1054 天关客星: 11.0 x 7.6 x 7.6 ly) — Open Lacy Multicolor Filaments + Broad Sapphire PWN Core
    void mwNeb_evalCrabM1(vec3 camRelCrabGal, vec3 rdGal, float ign, float nebStr, int zeroU, inout vec3 accum, inout vec3 trans) {
      const float R_BOUND = 0.0078;

      vec3 toC = -camRelCrabGal;
      float dCam = length(toC);
      if (dCam > R_BOUND * 2.4 && dCam < 32.0) {
        accum += trans * mwNeb_evalGalacticBeacon(
          toC, rdGal, 0.0052, dCam, vec3(0.28, 0.76, 1.00), vec3(0.96, 0.24, 0.38), 0.28 * nebStr
        );
      }

      float bSph = dot(toC, rdGal);
      vec3 perpSph = toC - rdGal * bSph;
      float disc = R_BOUND * R_BOUND - dot(perpSph, perpSph);
      if (disc <= 0.0) return;
      float sDisc = sqrt(disc);
      float tEnd = bSph + sDisc;
      if (tEnd <= 1.0e-9) return;
      float tStart = max(bSph - sDisc, 1.0e-9);

      const vec3 CR_X = vec3(-0.515040,  0.236222, -0.823974);
      const vec3 CR_Y = vec3(-0.115195, -0.971631, -0.206549);
      const vec3 CR_Z = vec3(-0.849391, -0.011463,  0.527640);
      const vec3 CR_TOSUN = vec3(-0.991764, 0.100778, 0.079046);
      mat3 toCrab = transpose(mat3(CR_X, CR_Y, CR_Z));

      vec3 q0 = toCrab * camRelCrabGal;
      vec3 d  = toCrab * rdGal;

      vec3 crabEmit  = vec3(0.0);
      vec3 crabTrans = vec3(1.0);

      int crabSteps = (dCam < 0.0012) ? min(uStepCount, 8) : min(uStepCount, 22);
      float span = tEnd - tStart;
      float invS = 1.0 / float(max(crabSteps, 1));
      float prevT = tStart;
      float jitter = 0.85 * ign;
      float pulsarInsideClear = smoothstep(0.00002, 0.00022, dCam);

      for (int i = zeroU; i < crabSteps; i++) {
        float tMid  = tStart + span * ((float(i) + jitter) * invS);
        float tNext = tStart + span * min((float(i + 1) + jitter) * invS, 1.0);
        float dt    = max(tNext - prevT, 1e-7);
        prevT = tNext;

        vec3 q = q0 + d * tMid;
        vec3 qEll = vec3(q.x / 0.0055, q.y / 0.0038, q.z / 0.0038);
        float rEll = length(qEll);
        if (rEll > 1.28) continue;

        vec4 n0 = textureLod(uNoise3D, qEll * 0.24 + vec3(0.17, 0.41, 0.29), 0.0);
        vec3 qD = qEll + (n0.rgb - 0.5) * 0.56;
        vec4 n1 = textureLod(uNoise3D, qD * 0.56 + vec3(0.31, -0.19, 0.53), 0.0);
        vec4 n2 = textureLod(uNoise3D, qD * 1.32 + (n1.gbr - 0.5) * 0.28 + 0.13, 0.0);

        float azEq = mwNeb_safeAtan(qEll.z, qEll.y);
        float ewBays = 0.16 * exp(-sqr(qEll.x * 1.6)) * cos(2.0 * azEq + 0.5) +
                       (n0.a - 0.5) * 0.34 + (n1.b - 0.5) * 0.18;
        float rWarp  = rEll + ewBays;

        float ridge1 = 1.0 - abs(n1.r * 2.0 - 1.0);
        float ridge2 = 1.0 - abs(n1.g * 2.0 - 1.0);
        float ridge3 = 1.0 - abs(n2.r * 2.0 - 1.0);
        float ridge4 = 1.0 - abs(n2.g * 2.0 - 1.0);

        // Crisp ~32% open lacy filament web (dark transparent gaps reveal glowing sapphire synchrotron core!)
        float majorRibs = smoothstep(0.66, 0.96, ridge1 * ridge2 * 1.18);
        float minorRibs = smoothstep(0.70, 0.97, ridge2 * ridge3 * 1.20) * (0.45 + 0.75 * ridge4);
        float outerTips = smoothstep(0.68, 0.96, ridge1 * ridge3 * 1.18) * smoothstep(0.70, 0.98, rWarp);

        float cageEnv = smoothstep(0.42, 0.68, rWarp) * sstepInv(1.16, 0.85, rWarp);
        float nearPsrClear = (dCam < 0.0012) ? smoothstep(0.0005, 0.0024, tMid) : 1.0;
        float filDens = (majorRibs * 1.10 + minorRibs * 0.95 + outerTips * 0.85) * cageEnv * nearPsrClear;

        // Pure 2-stop spectral ramp: Emerald [O III] -> Golden-Amber [S II] -> Crimson-Ruby [N II]/Hα (ZERO chalky green+red grey!)
        vec3 colEmerald = vec3(0.04, 0.92, 0.50);
        vec3 colAmber   = vec3(1.00, 0.58, 0.10);
        vec3 colCrimson = vec3(1.00, 0.10, 0.24);
        float ionPhase  = clamp(smoothstep(0.50, 0.98, rWarp) * 0.72 + (n0.r - 0.35) * 0.48 + (n1.a - 0.45) * 0.28, 0.0, 1.0);
        vec3 filCol     = (ionPhase < 0.5)
          ? mix(colEmerald, colAmber, ionPhase * 2.0)
          : mix(colAmber, colCrimson, (ionPhase - 0.5) * 2.0);

        // Broad, vivid cobalt-sapphire Pulsar Wind Nebula (PWN) synchrotron core (shines out to rWarp ~ 0.76!)
        float pwnEnv   = exp(-pow(max(rWarp / 0.70, 0.0), 2.05)) * sstepInv(1.02, 0.62, rEll) *
                         mix(0.45, 1.0, pulsarInsideClear) * nearPsrClear;
        float magWisps = 0.76 + 0.34 * sin(length(qEll.yz) * 16.0 - uBhPhase * 0.9 + n1.r * 2.2);
        vec3  pwnCol   = mix(vec3(0.08, 0.44, 1.00), vec3(0.24, 0.70, 1.00), exp(-rEll * 2.0));

        float jetEmitVol = 0.0;
        if (abs(q.x) < 0.0044) {
          float sNorm = q.x / 0.0042;
          vec2 jetSpine = vec2(0.00026 * sin(sNorm * 3.1 + 0.35), 0.00018 * (1.0 - cos(sNorm * 2.6)));
          float dJet = length(q.yz - jetSpine);
          float jetW = 0.00014 + 0.00032 * abs(sNorm);
          jetEmitVol = exp(-sqr(dJet / jetW)) * smoothstep(0.00012, 0.00045, abs(q.x)) *
                       sstepInv(0.0044, 0.0031, abs(q.x)) * (0.72 + 0.40 * n2.a) * nearPsrClear;
        }

        vec3 stepEmit = filCol * (filDens * 430.0) +
                        pwnCol * (pwnEnv * magWisps * 84.0) +
                        vec3(0.20, 0.66, 1.00) * (jetEmitVol * 195.0);

        vec3 sigmaT = (filDens * vec3(44.0, 50.0, 58.0) + pwnEnv * vec3(42.0, 34.0, 20.0)) * max(uDustStrength, 0.45);
        vec3 stepTr = exp(-sigmaT * dt);
        crabEmit  += crabTrans * stepEmit * dt;
        crabTrans *= stepTr;
      }

      float safeDx = (abs(d.x) > 0.055) ? d.x : (d.x >= 0.0 ? 0.055 : -0.055);
      float tEq = -q0.x / safeDx;
      vec3 chandraEmit = vec3(0.0);
      if (tEq > 1.0e-9 && tEq < tEnd + 0.002) {
        vec3 pEq = q0 + d * tEq;
        float rEq = length(pEq.yz);
        if (rEq > 0.00016 && rEq < 0.00185) {
          float azW = mwNeb_safeAtan(pEq.z, pEq.y);
          float innerShock = exp(-sqr((rEq - 0.00038) / 0.000058)) * 1.35;
          float wispPhase  = rEq * 21500.0 - uBhPhase * 2.2 + 0.45 * sin(azW * 2.0 - 0.6);
          float wispRings  = pow(max(0.5 + 0.5 * cos(wispPhase), 0.0), 3.4) *
                             smoothstep(0.00032, 0.00044, rEq) * sstepInv(0.00155, 0.00100, rEq);
          float torusGlow  = exp(-sqr((rEq - 0.00078) / 0.00040)) * 0.48;

          vec3 eqWorldDir = normalize(CR_Y * pEq.y + CR_Z * pEq.z + 1e-8);
          float doppler   = 0.68 + 0.62 * clamp(dot(eqWorldDir, CR_TOSUN), -0.65, 0.95);
          float slantLim  = 1.0 / clamp(abs(d.x), 0.24, 1.0);
          vec3 wispCol    = mix(vec3(0.14, 0.54, 1.00), vec3(0.48, 0.82, 1.00), clamp(innerShock * 0.50 + wispRings * 0.45, 0.0, 0.80));
          chandraEmit    += wispCol * ((innerShock + wispRings * 0.98 + torusGlow) * doppler * slantLim * 0.62);
        }
      }

      float dDotX = d.x;
      float denomJ = max(1.0 - dDotX * dDotX, 0.045);
      float sJet = clamp((dot(q0, d) * dDotX - q0.x) / denomJ, -0.0042, 0.0042);
      float tJet = max(1.0e-9, -dot(q0, d) + sJet * dDotX);
      vec3  pJet = q0 + d * tJet;
      float sJNorm = pJet.x / 0.0042;
      vec2  spineYZ = vec2(0.00026 * sin(sJNorm * 3.1 + 0.35), 0.00018 * (1.0 - cos(sJNorm * 2.6)));
      float rJetPerp = length(pJet.yz - spineYZ);
      float jetRad = 0.000048 + 0.00022 * abs(sJNorm);
      float jetCore = exp(-sqr(rJetPerp / jetRad)) * smoothstep(0.000015, 0.00022, abs(pJet.x)) *
                      sstepInv(0.0043, 0.0030, abs(pJet.x));
      float jetKnots = 0.72 + 0.38 * sin(abs(pJet.x) * 9200.0 - uBhPhase * 2.6);
      float jetDoppler = (pJet.x > 0.0) ? 1.24 : 0.82;
      chandraEmit += mix(vec3(0.20, 0.64, 1.00), vec3(0.52, 0.48, 1.00), abs(sJNorm)) * (jetCore * jetKnots * jetDoppler * 0.52);

      float fgDust = exp(-min(tStart * 0.042 * uDustStrength, 0.95));
      vec3 totalCrab = mwNeb_chromaShoulder((crabEmit + crabTrans * chandraEmit) * nebStr * fgDust, 0.64, 1.20);
      accum += trans * totalCrab;
      trans *= mix(vec3(1.0), crabTrans, fgDust);
    }

    // B. ORION NEBULA (M42: Filamentary Sweeping Butterfly Wings, Crenellated Orion Bar & True Cometary Teardrop Proplyds)
    void mwNeb_evalSingleProplyd(
      vec3 q0, vec3 d, vec3 pHead, vec3 qOriC, float rHead, float tailLen,
      inout vec3 propEmit, inout vec3 propTrans
    ) {
      vec3 uAway = normalize(pHead - qOriC);
      vec3 pMid  = pHead + uAway * (tailLen * 0.42);
      vec3 toM   = pMid - q0;
      float projM = dot(toM, d);
      if (projM <= 0.0) return;
      vec3 perpM = toM - d * projM;
      if (dot(perpM, perpM) > sqr(tailLen * 0.78)) return;

      vec3 oa = q0 - pHead;
      float da = dot(d, uAway);
      float denom = max(1.0 - da * da, 0.045);
      // Exact closest-approach parameter along uAway (+s = cometary tail streaming away from θ¹ Ori C1!)
      float sRaw = (dot(oa, uAway) - dot(oa, d) * da) / denom;
      if (sRaw < -rHead * 1.05 || sRaw > tailLen * 1.05) return;
      float s = clamp(sRaw, -rHead * 0.90, tailLen);
      float t = -dot(oa, d) + s * da;
      if (t <= 1.0e-7) return;

      vec3 pCl = oa + d * t;
      vec3 radVec = pCl - uAway * s;
      float rPerp = length(radVec);

      // Parabolic bow-shock nose (s < 0) smoothly tapering into a long 50-90px cometary teardrop tail (s > 0)!
      float uNose = max(0.0, (s + rHead * 0.90) / (rHead * 1.20));
      float tailTaper = (s > 0.0) ? exp(-s / (tailLen * 0.62)) : 1.0;
      float profR = rHead * (0.14 + 0.92 * sqrt(min(uNose, 1.30))) * (0.28 + 0.72 * tailTaper);

      if (rPerp < profR * 1.65) {
        float uR = rPerp / max(profR, 1e-7);
        // 1) Filled parabolic sunlit ionization cap on the θ¹ Ori C1-facing nose (s < rHead * 0.45, zero hollow washer!)
        float noseAxial = sstepInv(rHead * 0.48, -rHead * 0.30, s) * smoothstep(-rHead * 0.90, -rHead * 0.52, s);
        float noseCap   = (0.55 + 0.55 * uR * uR) * sstepInv(1.12, 0.76, uR) * noseAxial;

        // 2) Long, filled misty cometary plume streaming away from θ¹ Ori C1
        float tailAxial = smoothstep(-rHead * 0.65, rHead * 0.15, s) * exp(-max(s, 0.0) / (tailLen * 0.50)) *
                          sstepInv(tailLen, tailLen * 0.55, s);
        float tailPlume = exp(-uR * uR * 1.60) * tailAxial;

        vec3 noseCol = mix(vec3(1.00, 0.68, 0.22), vec3(0.20, 0.92, 0.96), smoothstep(0.45, 1.05, uR));
        vec3 tailCol = mix(vec3(0.22, 0.86, 0.82), vec3(0.98, 0.32, 0.46), smoothstep(0.0, tailLen * 0.55, max(s, 0.0)));

        // 3) Compact dark protoplanetary dust-core silhouette inside the head (rHead * 0.14)
        float tHead = max(1e-7, -dot(oa, d));
        vec3  pKnot = oa + d * tHead - uAway * (rHead * 0.06);
        float dKnot2 = sqr(dot(pKnot, uAway) / (rHead * 0.13)) +
                       dot(pKnot - uAway * dot(pKnot, uAway), pKnot - uAway * dot(pKnot, uAway)) / sqr(rHead * 0.15);
        float tauKnot = 1.85 * exp(-dKnot2);
        vec3  knotAtten = exp(-tauKnot * vec3(1.15, 1.08, 1.00));

        vec3 addGlow = noseCol * (noseCap * 1.18) + tailCol * (tailPlume * 1.02);
        propEmit  = propEmit * knotAtten + addGlow;
        propTrans *= knotAtten;
      }
    }

    void mwNeb_evalOrionM42(vec3 camRelM42Gal, vec3 rdGal, float ign, float nebStr, int zeroU, inout vec3 accum, inout vec3 trans) {
      const float R_BOUND = 0.0185;

      vec3 toC = -camRelM42Gal;
      float dCam = length(toC);
      if (dCam > R_BOUND * 2.4 && dCam < 32.0) {
        accum += trans * mwNeb_evalGalacticBeacon(
          toC, rdGal, 0.0120, dCam, vec3(0.24, 0.90, 0.84), vec3(0.98, 0.22, 0.48), 0.42 * nebStr
        );
      }

      float bSph = dot(toC, rdGal);
      vec3 perpSph = toC - rdGal * bSph;
      float disc = R_BOUND * R_BOUND - dot(perpSph, perpSph);
      if (disc <= 0.0) return;
      float sDisc = sqrt(disc);
      float tEnd = bSph + sDisc;
      if (tEnd <= 1.0e-7) return;
      float tStart = max(bSph - sDisc, 1.0e-7);

      const vec3 M42_X = vec3( 0.485023, 0.000000,  0.874501);
      const vec3 M42_Y = vec3( 0.290216, 0.943327, -0.160962);
      const vec3 M42_Z = vec3(-0.824941, 0.331865,  0.457536);
      mat3 toM42 = transpose(mat3(M42_X, M42_Y, M42_Z));

      vec3 q0 = toM42 * camRelM42Gal;
      vec3 d  = toM42 * rdGal;

      vec3 propEmit  = vec3(0.0);
      vec3 propTrans = vec3(1.0);
      float propFade = sstepInv(0.0026, 0.0009, dCam);
      if (propFade > 0.001) {
        const vec3 Q_ORIC = vec3(-0.000015, -0.000060, 0.000020);
        // 5 Explicitly Unrolled HST Cometary Teardrop Proplyds (50-90px tails pointing radially away from θ¹ Ori C1!)
        mwNeb_evalSingleProplyd(q0, d, vec3( 0.000072, -0.000010, 0.000046), Q_ORIC, 0.0000068, 0.000056, propEmit, propTrans);
        mwNeb_evalSingleProplyd(q0, d, vec3(-0.000076, -0.000034, 0.000032), Q_ORIC, 0.0000064, 0.000052, propEmit, propTrans);
        mwNeb_evalSingleProplyd(q0, d, vec3(-0.000028,  0.000062, 0.000052), Q_ORIC, 0.0000060, 0.000048, propEmit, propTrans);
        mwNeb_evalSingleProplyd(q0, d, vec3( 0.000108,  0.000040, 0.000064), Q_ORIC, 0.0000072, 0.000046, propEmit, propTrans);
        mwNeb_evalSingleProplyd(q0, d, vec3( 0.000026, -0.000124, 0.000036), Q_ORIC, 0.0000066, 0.000054, propEmit, propTrans);
        propEmit  = mwNeb_chromaShoulder(propEmit * propFade, 0.68, 1.22);
        propTrans = mix(vec3(1.0), propTrans, propFade);
      }

      vec2 obbM42 = intersectBox(q0 - vec3(0.0, 0.0, 0.0005), d, vec3(0.0158, 0.0154, 0.0068));
      float tStartM42 = max(tStart, obbM42.x);
      float tEndM42   = min(tEnd, obbM42.y);

      vec3 m42Emit  = vec3(0.0);
      vec3 m42Trans = vec3(1.0);

      if (tEndM42 > tStartM42) {
        int m42Steps = (dCam < 0.0020) ? min(uStepCount, 10) : min(uStepCount, 12);
        float span = tEndM42 - tStartM42;
        float invS = 1.0 / float(max(m42Steps, 1));
        float prevT = tStartM42;
        float jitter = 0.85 * ign;
        float coreSubtleDamp = mix(0.42, 1.0, smoothstep(0.00035, 0.0032, dCam));

        for (int i = zeroU; i < m42Steps; i++) {
          float tMid  = tStartM42 + span * ((float(i) + jitter) * invS);
          float tNext = tStartM42 + span * min((float(i + 1) + jitter) * invS, 1.0);
          float dt    = max(tNext - prevT, 1e-7);
          prevT = tNext;

          vec3 q = q0 + d * tMid;
          vec3 u = q / 0.0120;
          float rU = length(u.xy);
          if (rU > 1.38) continue;

          // Multi-scale macro + fine filamentary striations (carves crisp radial Huygens wisps & crenellated Orion Bar!)
          vec4 n0 = textureLod(uNoise3D, u * 0.28 + vec3(0.19, 0.37, 0.51), 0.0);
          vec3 uD = u + (n0.rgb - 0.5) * 0.52;
          vec4 n1 = textureLod(uNoise3D, uD * 0.95 + vec3(0.41, 0.13, 0.27), 0.0);
          vec4 n2 = textureLod(uNoise3D, uD * 3.10 + (n1.gbr - 0.5) * 0.32, 0.0);
          vec2 xyW = u.xy + (n0.rg - 0.5) * 0.30 + (n1.gb - 0.5) * 0.14;
          float rW2 = dot(xyW, xyW);
          float rW  = sqrt(rW2);

          float foldA = 1.0 - abs(n1.r * 2.0 - 1.0);
          float foldB = 1.0 - abs(n2.g * 2.0 - 1.0);
          float fineWisp = 1.0 - abs(n2.r * 2.0 - 1.0);
          float radAng = mwNeb_safeAtan(xyW.y, xyW.x);
          float radFan = 0.65 + 0.35 * sin(radAng * 14.0 + n1.g * 5.0 + n2.b * 2.5);
          float drapes = (0.30 + 1.15 * pow(clamp(foldA * 0.52 + foldB * 0.42 + fineWisp * 0.32, 0.0, 1.0), 2.15)) * radFan;

          // 1) 3D Concave Warped Huygens Blister Cavity with crisp radial photoevaporation striations
          float zBlister = -0.0018 + 0.0058 * (rW2 * 0.85) + (n0.b - 0.5) * 0.0020 + (n1.r - 0.5) * 0.0006;
          float dWall    = q.z - zBlister;
          float wallThick = 0.0011 + 0.0015 * rW;
          float wallSheet = exp(-sqr(dWall / wallThick)) * sstepInv(1.18, 0.62, rW);
          float huygensCore = wallSheet * exp(-dot(xyW * vec2(0.92, 1.18), xyW * vec2(0.92, 1.18)) / 0.13);

          // 2) Sweeping Filamentary Great Orion Butterfly Wings (sharp crimson-magenta arcs + cobalt-violet veil)
          float wingSpineY = -0.08 - 0.48 * xyW.x * xyW.x + 0.14 * xyW.x;
          float dWingArc   = abs(xyW.y - wingSpineY) / (0.19 + 0.22 * abs(xyW.x));
          float southOpen  = 1.0 - 0.78 * exp(-sqr((xyW.x + 0.08) / 0.34)) * smoothstep(-0.12, -0.64, xyW.y);
          float greatWings = exp(-dWingArc * dWingArc * 1.28) * smoothstep(0.15, 0.42, rW) * sstepInv(1.36, 0.80, rW) *
                             exp(-sqr((q.z - 0.0010) / 0.0036)) * southOpen * drapes;
          float outerVeil  = exp(-sqr((rW - 0.92) / 0.26)) * exp(-sqr((q.z - 0.0018) / 0.0040)) *
                             (0.35 + 0.85 * pow(foldB, 1.8)) * southOpen;

          // 3) Jagged, Crenellated Sunlit Ionization Cliff ("Orion Bar") merging continuously SE into the crimson wing!
          vec2 dBar = q.xy - vec2(-0.00165, -0.00155);
          float sBar = dBar.x * (-0.660) + dBar.y * 0.751;
          float nBar = -(dBar.x * 0.751 + dBar.y * 0.660) + 0.00075 * sqr(sBar / 0.0030) +
                       (n1.r - 0.5) * 0.00075 + (n2.g - 0.5) * 0.00042;
          float barAlong = sstepInv(0.0046, 0.0015, abs(sBar)) * exp(-sqr((q.z - (-0.0002)) / 0.0017));
          float barCrest = exp(-sqr(nBar / 0.00024)) * barAlong * (0.42 + 0.95 * pow(fineWisp, 1.6));
          float barScarp = smoothstep(-0.00018, 0.00018, nBar) * exp(-max(nBar, 0.0) / 0.0024) * barAlong * drapes;

          // 4) De Mairan's Nebula M43 & Ragged Tendril-Edged Fish's Mouth Dark Molecular Bay
          vec3 dM43 = q - vec3(0.0036, 0.0041, 0.0005);
          float rM43 = length(dM43 + (n1.rgb - 0.5) * 0.0009 + (n2.gbr - 0.5) * 0.0004);
          float m43Comma = exp(-sqr(rM43 / 0.00180)) * drapes;

          float hFish = 0.0;
          vec2 qFishW = q.xy + (n0.gb - 0.5) * 0.0026 + (n1.rg - 0.5) * 0.0018 + (n2.rg - 0.5) * 0.00085;
          float dFish = mwNeb_seg2D(qFishW, vec2(-0.00035, 0.00042), vec2(-0.00740, 0.00315), hFish);
          float fishRad = mix(0.00045, 0.00185, hFish) + (n1.b - 0.5) * 0.00055 + (n2.b - 0.5) * 0.00032;
          float fishTendril = smoothstep(0.26, 0.80, n1.a * 0.52 + fineWisp * 0.48);
          float fishMask = sstepInv(fishRad * 1.85, fishRad * 0.25, dFish) *
                           exp(-sqr((q.z - 0.0019) / 0.0019)) * (0.35 + 1.10 * fishTendril);
          float darkDustRho = fishMask * 1.35 + barScarp * 0.45 * n2.a;
          float bgOmcDust   = smoothstep(0.0008, 0.0028, -dWall) * sstepInv(1.25, 0.55, rW) * 0.72;

          vec3 colCore  = mix(vec3(0.06, 0.84, 0.78), vec3(0.24, 0.78, 0.98), exp(-rW2 * 8.5));
          colCore       = mix(colCore, vec3(0.96, 0.28, 0.46), smoothstep(0.18, 0.44, rW));
          vec3 colScarp = mix(vec3(1.00, 0.52, 0.20), vec3(0.94, 0.16, 0.34), smoothstep(-0.00005, 0.00085, nBar));
          vec3 colWings = mix(vec3(0.96, 0.14, 0.38), vec3(0.86, 0.28, 0.56), n1.b * 0.6 + foldB * 0.4);
          vec3 colVeil  = mix(vec3(0.24, 0.44, 0.96), vec3(0.54, 0.34, 0.88), n0.a);
          float fishRim = exp(-sqr((dFish - fishRad * 0.92) / 0.00034)) * exp(-sqr((q.z - 0.0015) / 0.0016)) *
                          smoothstep(0.0, 0.6, hFish) * fishTendril;

          vec3 stepEmit = colCore  * (huygensCore * drapes * 118.0 * coreSubtleDamp) +
                          colScarp * ((barCrest * 86.0 + barScarp * 76.0)) +
                          colWings * (greatWings * 105.0 + m43Comma * 92.0) +
                          colVeil  * (outerVeil * 48.0) +
                          vec3(1.00, 0.44, 0.18) * (fishRim * 58.0) +
                          vec3(0.07, 0.04, 0.03) * (darkDustRho * 5.0);

          vec3 sigmaT = (darkDustRho * 620.0 + bgOmcDust * 320.0 + huygensCore * 90.0 + greatWings * 38.0) *
                        vec3(1.32, 1.06, 0.84) * max(uDustStrength, 0.45);
          vec3 stepTr = exp(-sigmaT * dt);
          vec3 safeSig = max(sigmaT, vec3(1e-4));
          vec3 wInt = mix(vec3(dt), (1.0 - stepTr) / safeSig, step(vec3(1e-4), sigmaT));

          m42Emit  += m42Trans * stepEmit * wInt;
          m42Trans *= stepTr;
          if (max(m42Trans.r, max(m42Trans.g, m42Trans.b)) < 0.015) break;
        }
      }

      float fgDust = exp(-min(tStart * 0.038 * uDustStrength, 0.65));
      vec3 combinedM42 = propEmit + propTrans * m42Emit;
      vec3 totalTrans  = propTrans * m42Trans;
      accum += trans * mwNeb_chromaShoulder(combinedM42 * nebStr * fgDust, 0.66, 1.24);
      trans *= mix(vec3(1.0), totalTrans, fgDust);
    }

    // C. EAGLE NEBULA (M16: 70 x 55 ly) & 3 S-CURVED CRAGGY "PILLARS OF CREATION" CONNECTED TO M16'S SE MOLECULAR CLIFF!
    float mwNeb_pillarsBaseSdf(vec3 q, vec4 nLow, vec4 nMid, out float hOut, out float uvFace) {
      float crag = (nMid.r - 0.48) * 0.00018 + (nLow.g - 0.50) * 0.00014;

      // Pillar I (Left, 4.50 ly tall): Broad S-curved trunk, sculpted waist & gnarled multi-cusp sunlit head!
      float h1 = clamp((q.y - (-0.00225)) / 0.00460, 0.0, 1.0);
      float sBend1 = 0.00024 * sin(h1 * 3.5 - 0.35) - 0.00016 * h1 * h1;
      float fork1  = smoothstep(0.74, 0.98, h1) * 0.00024;
      float x1Sp   = -0.00126 + sBend1;
      float x1Near = (q.x < x1Sp) ? (x1Sp - fork1 * 0.95) : (x1Sp + fork1 * 0.75);
      vec3  c1 = vec3(x1Near, -0.00225 + 0.00460 * h1, 0.00014 + 0.00012 * cos(h1 * 3.0));
      float r1 = mix(0.00054, 0.00023, h1) - 0.000075 * sin(h1 * PI) +
                 0.000085 * exp(-sqr((h1 - 0.89) / 0.11)) + crag * (0.55 + 0.45 * h1);
      float bestD = length(q - c1) - max(r1, 0.00008);
      hOut   = h1;
      uvFace = clamp(0.45 + 0.55 * ((q.y - c1.y) / max(r1, 1e-5)) + 0.35 * ((q.z - c1.z) / max(r1, 1e-5)), 0.0, 1.25);

      // Pillar II (Center, 3.25 ly tall): Tilted S-curved trunk leaning slightly NW with pinched neck & bulbous head!
      float h2 = clamp((q.y - (-0.00235)) / 0.00350, 0.0, 1.0);
      float sBend2 = -0.00022 * h2 + 0.00016 * sin(h2 * 4.2 + 0.9);
      vec3  c2 = vec3(0.00014 + sBend2, -0.00235 + 0.00350 * h2, -0.00010 + 0.00010 * sin(h2 * 3.4));
      float r2 = mix(0.00040, 0.00019, h2) - 0.000065 * sin(h2 * PI * 1.1) +
                 0.000065 * exp(-sqr((h2 - 0.91) / 0.11)) + crag * 0.85;
      float d2 = length(q - c2) - max(r2, 0.00007);
      if (d2 < bestD) {
        bestD  = d2;
        hOut   = h2;
        uvFace = clamp(0.45 + 0.55 * ((q.y - c2.y) / max(r2, 1e-5)) + 0.35 * ((q.z - c2.z) / max(r2, 1e-5)), 0.0, 1.25);
      }

      // Pillar III (Right, 2.00 ly tall): Shorter ragged spire sloping SE into M16's molecular promontory!
      float h3 = clamp((q.y - (-0.00255)) / 0.00245, 0.0, 1.0);
      float sBend3 = -0.00022 * h3 + 0.00013 * sin(h3 * 3.9 + 2.1);
      vec3  c3 = vec3(0.00124 + sBend3, -0.00255 + 0.00245 * h3, 0.00008 - 0.00006 * h3);
      float r3 = mix(0.00032, 0.000125, h3) + 0.000040 * exp(-sqr((h3 - 0.90) / 0.12)) + crag * 0.75;
      float d3 = length(q - c3) - max(r3, 0.00006);
      if (d3 < bestD) {
        bestD  = d3;
        hOut   = h3;
        uvFace = clamp(0.45 + 0.55 * ((q.y - c3.y) / max(r3, 1e-5)) + 0.35 * ((q.z - c3.z) / max(r3, 1e-5)), 0.0, 1.25);
      }

      // Diagonally sloping SE molecular ridge root (merges seamlessly down-SE into M16's macro SE promontory cliff!)
      float hRoot = clamp((q.x + 0.0015) / 0.0038, 0.0, 1.0);
      vec3  cRoot = vec3(-0.0015 + 0.0038 * hRoot, -0.00225 - 0.00115 * hRoot, 0.00004);
      float rRoot = mix(0.00058, 0.00095, hRoot) + (nLow.r - 0.45) * 0.00045 + (nMid.g - 0.48) * 0.00022;
      float rootSdf = length(vec3(q.x - cRoot.x, (q.y - cRoot.y) * 1.15, (q.z - cRoot.z) * 1.25)) - rRoot;

      float hSmooth = clamp(0.5 + 0.5 * (rootSdf - bestD) / 0.00045, 0.0, 1.0);
      bestD  = mix(rootSdf, bestD, hSmooth) - 0.00045 * hSmooth * (1.0 - hSmooth);
      hOut   = mix(0.04, hOut, hSmooth);
      uvFace = mix(0.30 + 0.34 * nMid.b, uvFace, hSmooth);

      float eggWave = max(0.0, sin(q.x * 13500.0 + nLow.b * 5.0 + q.z * 6200.0));
      float eggTips = smoothstep(0.78, 0.99, hOut) * eggWave * eggWave * 0.000125;
      return bestD - eggTips;
    }

    void mwNeb_evalEagleM16AndPillars(
      vec3 camRelM16Gal, vec3 camRelPillarsGal, vec3 rdGal, float ign, float nebStr, int zeroU,
      inout vec3 accum, inout vec3 trans
    ) {
      const float R_M16 = 0.0460;
      const float R_PIL = 0.0046;

      vec3 toM16 = -camRelM16Gal;
      float dCamM16 = length(toM16);
      if (dCamM16 > R_M16 * 2.2 && dCamM16 < 34.0) {
        accum += trans * mwNeb_evalGalacticBeacon(
          toM16, rdGal, 0.0320, dCamM16, vec3(0.14, 0.84, 0.90), vec3(1.00, 0.52, 0.26), 0.38 * nebStr
        );
      }

      float bM = dot(toM16, rdGal);
      vec3 perpM = toM16 - rdGal * bM;
      float discM = R_M16 * R_M16 - dot(perpM, perpM);
      if (discM <= 0.0) return;
      float sM = sqrt(discM);
      float tM1 = bM + sM;
      if (tM1 <= 1.0e-7) return;
      float tM0 = max(bM - sM, 1.0e-7);

      const vec3 PIL_X = vec3(-0.269611, 0.340977, -0.900580);
      const vec3 PIL_Y = vec3( 0.016159, 0.936682,  0.349808);
      const vec3 PIL_Z = vec3( 0.962834, 0.079759, -0.258049);
      mat3 toPil = transpose(mat3(PIL_X, PIL_Y, PIL_Z));

      vec3 qM0 = toPil * camRelM16Gal;
      vec3 qP0 = toPil * camRelPillarsGal;
      vec3 dL  = toPil * rdGal;

      vec3 toPilC = -camRelPillarsGal;
      float dCamPil = length(toPilC);
      float bP = dot(toPilC, rdGal);
      vec3 perpP = toPilC - rdGal * bP;
      float discP = R_PIL * R_PIL - dot(perpP, perpP);
      bool hitPillars = false;
      float tP0 = 0.0, tP1 = 0.0;
      if (discP > 0.0) {
        float sP = sqrt(discP);
        vec2 obb = intersectBox(qP0, dL, vec3(0.00295, 0.00335, 0.00108));
        tP0 = max(max(bP - sP, obb.x), 1.0e-7);
        tP1 = min(bP + sP, obb.y);
        hitPillars = (tP1 > tP0);
      }

      float jitter = 0.85 * ign;
      vec3 pilEmit  = vec3(0.0);
      vec3 pilTrans = vec3(1.0);
      if (hitPillars) {
        int pilSteps = (dCamPil < 0.018) ? min(uStepCount, 22) : min(uStepCount, 14);
        float spanP = tP1 - tP0;
        float invP  = 1.0 / float(max(pilSteps, 1));
        float prevT = tP0;

        for (int i = zeroU; i < pilSteps; i++) {
          float tMid  = tP0 + spanP * ((float(i) + jitter) * invP);
          float tNext = tP0 + spanP * min((float(i + 1) + jitter) * invP, 1.0);
          float dt    = max(tNext - prevT, 1e-7);
          prevT = tNext;

          vec3 q = qP0 + dL * tMid;

          vec4 nLow = textureLod(uNoise3D, q * 128.0 + vec3(0.19, 0.37, 0.53), 0.0);
          vec4 nMid = textureLod(uNoise3D, q * 380.0 + (nLow.rgb - 0.5) * 0.42 + 0.11, 0.0);

          float billowA = 1.0 - abs(nLow.r * 2.0 - 1.0);
          float billowB = 1.0 - abs(nMid.g * 2.0 - 1.0);
          float billowC = 1.0 - abs(nMid.a * 2.0 - 1.0);
          float cauli   = billowA * 0.48 + billowB * 0.36 + billowC * 0.16;

          vec3 qWarp = q + (nLow.rgb - 0.5) * vec3(0.00062, 0.00028, 0.00048) +
                       (nMid.gbr - 0.5) * vec3(0.00024, 0.00014, 0.00022);

          float hFrac = 0.0, uvFace = 0.0;
          float sdf = mwNeb_pillarsBaseSdf(qWarp, nLow, nMid, hFrac, uvFace) - (cauli - 0.38) * 0.00024;
          // Diagonally sloped handoff into M16's macro SE molecular promontory cliff (never a flat floating bottom!)
          float diagFloor    = q.y + 0.32 * q.x + (nLow.g - 0.5) * 0.00055;
          float wideRootSoft = mix(1.0, smoothstep(-0.0031, -0.0019, diagFloor), smoothstep(0.015, 0.036, dCamPil) * 0.85);
          float baseFade     = smoothstep(-0.00325, -0.00175, diagFloor) * sstepInv(0.00285, 0.00185, abs(q.x - 0.0002)) * wideRootSoft;

          if (sdf < 0.00032 && baseFade > 0.01) {
            float uvExposed = clamp(uvFace * (0.30 + 0.70 * smoothstep(0.06, 0.78, hFrac)) * (0.55 + 0.65 * nMid.r), 0.0, 1.25);

            float coreMask = sstepInv(0.000055, -0.000180, sdf) * baseFade;
            float dustDens = coreMask * (0.74 + 0.58 * cauli) * 7200.0 * max(uDustStrength, 0.65);

            float goldW    = max(0.000058, dt * 0.55);
            float cyanW    = max(0.000098, dt * 0.82);
            float goldRim  = exp(-sqr((sdf - (-0.000010)) / goldW)) * uvExposed * (0.62 + 0.75 * billowB) * baseFade;
            float cyanHalo = exp(-sqr((sdf - 0.000072) / cyanW)) * uvExposed *
                             (0.50 + 0.68 * (1.0 - abs(nMid.b * 2.0 - 1.0))) * baseFade;
            float crownStream = exp(-sqr(max(sdf, 0.0) / 0.00018)) * smoothstep(0.72, 0.98, hFrac) *
                                uvExposed * sqr(clamp(nLow.a * 0.65 + billowB * 0.5, 0.0, 1.1)) * baseFade;

            float hhShock = exp(-sqr(length(q - vec3(-0.00138, 0.00222, 0.00016)) / 0.000115)) +
                            exp(-sqr(length(q - vec3(-0.00096, 0.00214, 0.00008)) / 0.000095)) * 0.85 +
                            exp(-sqr(length(q - vec3(-0.00008, 0.00108, -0.00004)) / 0.000100)) * 0.90;
            hhShock *= (0.65 + 0.75 * billowC) * baseFade;

            vec3 darkOchre = mix(vec3(0.018, 0.010, 0.006), vec3(0.088, 0.044, 0.018), billowB * 0.62 + uvExposed * 0.34);
            vec3 stepEmit  = darkOchre * (dustDens * 0.085) +
                             vec3(1.00, 0.60, 0.15) * (goldRim * (1950.0 * (0.000058 / goldW))) +
                             vec3(0.10, 0.86, 0.96) * ((cyanHalo * 460.0 + crownStream * 360.0)) +
                             vec3(1.00, 0.12, 0.22) * (hhShock * 2100.0);

            vec3 sigmaT  = vec3(1.38, 1.08, 0.86) * dustDens;
            vec3 stepTr  = exp(-sigmaT * dt);
            vec3 safeSig = max(sigmaT, vec3(1e-4));
            vec3 wInt    = mix(vec3(dt), (1.0 - stepTr) / safeSig, step(vec3(1e-4), sigmaT));

            pilEmit  += pilTrans * stepEmit * wInt;
            pilTrans *= stepTr;
            if (max(pilTrans.r, max(pilTrans.g, pilTrans.b)) < 0.004) break;
          }
        }
        pilEmit = mwNeb_chromaShoulder(pilEmit, 0.68, 1.24);
      }

      int m16Steps = min(uStepCount, 14);
      float spanM = tM1 - tM0;
      float invM  = 1.0 / float(max(m16Steps, 1));
      float prevM = tM0;
      float fgCavClear = smoothstep(0.0045, 0.0240, dCamPil);
      float widePromBlend = smoothstep(0.015, 0.036, dCamPil);
      // Offset between M16 center and Pillars center in local toPil coordinates
      vec3 pilInM16 = qM0 - qP0;

      vec3 m16Emit  = vec3(0.0);
      vec3 m16Trans = vec3(1.0);
      bool splicedPillars = !hitPillars;

      for (int i = zeroU; i < m16Steps; i++) {
        float tMid  = tM0 + spanM * ((float(i) + jitter) * invM);
        float tNext = tM0 + spanM * min((float(i + 1) + jitter) * invM, 1.0);
        float dt    = max(tNext - prevM, 1e-7);
        prevM = tNext;

        if (!splicedPillars && tMid >= tP0) {
          m16Emit  += m16Trans * pilEmit;
          m16Trans *= pilTrans;
          splicedPillars = true;
        }

        vec3 qM16 = qM0 + dL * tMid;
        vec3 qRelPil = qM16 - pilInM16;

        vec4 n0 = textureLod(uNoise3D, qM16 * 9.2 + vec3(0.27, 0.13, 0.49), 0.0);
        vec3 qMWarp = qM16 + (n0.rgb - 0.5) * 0.0145;
        vec3 qNorm  = vec3(qMWarp.x / 0.028, qMWarp.y / 0.035, qMWarp.z / 0.026);
        float rEll  = length(qNorm);
        if (rEll > 1.20) continue;

        vec4 n1 = textureLod(uNoise3D, qMWarp * 26.0 + 0.31, 0.0);
        vec4 n2 = textureLod(uNoise3D, qMWarp * 72.0 + (n1.rgb - 0.5) * 0.35, 0.0);
        float billow = 1.0 - abs(n2.g * 2.0 - 1.0);
        float rW = rEll + (n1.r - 0.5) * 0.24 + (billow - 0.5) * 0.12;
        float envTaper = sstepInv(1.16, 0.80, length(vec3(qM16.x / 0.029, qM16.y / 0.036, qM16.z / 0.027)));

        // Craggy same-depth (z = -0.0004) Beer-Lambert SE Molecular Promontory cradling the Pillars root into M16's SE cliffShell!
        float hProm = 0.0;
        vec2 promA = vec2(0.0003, -0.0027);
        vec2 promB = vec2(0.0085, -0.0165);
        vec2 qPromXY = qRelPil.xy + (n1.gb - 0.5) * 0.0038 + (n2.rg - 0.5) * 0.0018;
        float dProm   = mwNeb_seg2D(qPromXY, promA, promB, hProm);
        float promRad = mix(0.0018, 0.0072, pow(hProm, 0.85)) + (n1.r - 0.5) * 0.0018;
        float promZ   = exp(-sqr((qRelPil.z - (-0.0004)) / mix(0.0045, 0.0082, hProm)));
        float promShellTaper = sstepInv(0.92, 0.56, rEll) * widePromBlend;
        float promCore = sstepInv(promRad * 1.35, promRad * 0.25, dProm) * promZ * promShellTaper * (0.68 + 0.72 * billow);
        vec2 promSpine = mix(promA, promB, hProm);
        float uvProm   = smoothstep(-0.45, 0.72, dot(qPromXY - promSpine, vec2(-0.42, 0.91)) / max(promRad, 1e-4));
        float promRim  = exp(-sqr((dProm - promRad * 0.86) / 0.0015)) * promZ * promShellTaper *
                         smoothstep(-0.016, 0.002, qRelPil.y) * (0.35 + 0.85 * uvProm) * (0.55 + 0.75 * billow);

        if (hitPillars && tMid >= tP0 && tMid <= tP1 && promCore < 0.02) continue;

        float d6611 = length((qMWarp - vec3(0.0, 0.0080, 0.0)) / vec3(0.021, 0.026, 0.021));
        float oiiiCore = exp(-sqr(d6611 / 0.78)) * (0.62 + 0.65 * n1.g + 0.35 * billow);
        float behindPillarsGlow = exp(-sqr(length(qRelPil - vec3(0.0, 0.0012, -0.0055)) / 0.0145)) *
                                  (0.85 + 0.50 * n2.b) * (1.0 - 0.55 * clamp(promCore, 0.0, 1.0));

        float cliffShell = exp(-sqr((rW - 0.82) / 0.20)) * (0.45 + 0.85 * sqr(clamp(billow * 0.7 + n1.b * 0.45, 0.0, 1.1)));
        float northArch  = smoothstep(-0.005, 0.022, qMWarp.y) * cliffShell;

        vec3 colOIII  = mix(vec3(0.03, 0.64, 0.88), vec3(0.08, 0.84, 0.76), n2.r);
        vec3 colCliff = mix(vec3(0.96, 0.48, 0.18), vec3(0.94, 0.18, 0.32), smoothstep(0.72, 1.02, rW));
        vec3 darkPromCol = mix(vec3(0.032, 0.018, 0.011), vec3(0.14, 0.068, 0.030), billow * 0.65 + 0.25 * n1.g);

        float clearMod = (qRelPil.z > -0.0008) ? mix(0.02, 1.0, fgCavClear) : 1.0;
        vec3 cavEmit = (colOIII * ((oiiiCore * 9.5 + behindPillarsGlow * 13.0) * sstepInv(1.02, 0.58, rW)) +
                        colCliff * ((cliffShell * 11.8 + northArch * 7.5))) * clearMod * envTaper;

        float cavDust = exp(-rEll * rEll * 1.5) * 22.0;
        float rimDust = (cavDust + smoothstep(0.74, 1.04, rW) * (0.4 + 0.9 * billow) * 24.0) *
                        envTaper * max(uDustStrength, 0.45) * clearMod;
        float promDust  = promCore * 240.0 * envTaper * max(uDustStrength, 0.55);
        float totalDust = rimDust + promDust;
        vec3 promEmit   = darkPromCol * (promDust * 0.14) + vec3(1.00, 0.58, 0.18) * (promRim * 24.0 * envTaper);

        vec3 sigmaT  = totalDust * vec3(1.32, 1.06, 0.84);
        vec3 stepTr  = exp(-sigmaT * dt);
        vec3 safeSig = max(sigmaT, vec3(1e-4));
        vec3 wInt    = mix(vec3(dt), (1.0 - stepTr) / safeSig, step(vec3(1e-4), sigmaT));

        m16Emit  += m16Trans * (cavEmit + promEmit) * wInt;
        m16Trans *= stepTr;
      }

      if (!splicedPillars) {
        m16Emit  += m16Trans * pilEmit;
        m16Trans *= pilTrans;
      }

      float fgDust = exp(-min(tM0 * 0.040 * uDustStrength, 0.88));
      accum += trans * mwNeb_chromaShoulder(m16Emit * nebStr * fgDust, 0.60, 1.16);
      trans *= mix(vec3(1.0), m16Trans, fgDust);
    }

    void main() {
      float rCam = length(uCamPos);
      float regionMask = smoothstep(0.08, 0.45, rCam) * sstepInv(115.0, 48.0, rCam);
      float nebStr = max(uNebulaStrength, 0.30) * regionMask;
      if (nebStr <= 0.002) discard;

      vec2 ndc = vUv * 2.0 - 1.0;
      vec3 rd = normalize(
        uCamBasis[2] +
        uCamBasis[0] * (ndc.x * uAspect * uTanHalfFov) +
        uCamBasis[1] * (ndc.y * uTanHalfFov)
      );
      vec2 rdXZ = advectGalactic(rd.xz, uGalAngle);
      vec3 rdGal = vec3(rdXZ.x, rd.y, rdXZ.y);
      float ign = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
      int zeroU = min(uStepCount, 0);

      vec3 mwNebAccum = vec3(0.0);
      vec3 mwNebTrans = vec3(1.0);
      mwNeb_evalCrabM1(uCamRelCrabGal, rdGal, ign, nebStr, zeroU, mwNebAccum, mwNebTrans);
      mwNeb_evalOrionM42(uCamRelM42Gal, rdGal, ign, nebStr, zeroU, mwNebAccum, mwNebTrans);
      mwNeb_evalEagleM16AndPillars(uCamRelM16Gal, uCamRelPillarsGal, rdGal, ign, nebStr, zeroU, mwNebAccum, mwNebTrans);

      mwNebTrans = mix(vec3(1.0), mwNebTrans, regionMask);
      if (dot(mwNebAccum, vec3(1.0)) < 1e-6 && min(mwNebTrans.r, min(mwNebTrans.g, mwNebTrans.b)) > 0.999) discard;

      float meanTr = clamp(dot(mwNebTrans, vec3(0.333333)), 0.05, 1.0);
      fragColor = vec4(mwNebAccum * regionMask * uHdrScale, 1.0 - meanTr);
    }
  `;


// ============================================================================
// 3. PASS 2 `style == 9.0` — CRAB PULSAR `PSR B0531+21` MAGNETOSPHERE (`CRAB_PULSAR_PASS2_GLSL`)
//    - `CRAB_PULSAR_SHADE_SURFACE_GLSL`: add as `else if (style > 8.5 && style < 9.5)`
//      inside `shadeStarSurface(...)` in `LOCAL_TERR_EXO_FRAG`.
//    - `CRAB_PULSAR_CORONA_GLSL`: add as `else if (style > 8.5 && style < 9.5)`
//      inside `evalStellarCorona(...)` in `LOCAL_GIANTS_OVERLAYS_FRAG`, AND ensure
//      `corMult` (line ~6115) & `coronaMaxR` (line ~5620) use `13.5` / `starR * 13.2`
//      when `style > 8.5 && style < 9.5`!
// ============================================================================

const CRAB_PULSAR_SHADE_SURFACE_GLSL = `
      } else if (style > 8.5 && style < 9.5) {
        // CRAB PULSAR PSR B0531+21 (SN 1054 Neutron Star & Inner Force-Free Magnetosphere, rRsun = 0.018 ~ 12,500 km)
        vec3 psrSpin = vec3(-0.515040,  0.236222, -0.823974);
        vec3 psrU    = vec3(-0.115195, -0.971631, -0.206549);
        vec3 psrV    = vec3(-0.849391, -0.011463,  0.527640);

        // Smooth non-seizure cinematic relativistic spin (rotPhase = animT * 9.5) with 52° oblique magnetic dipole!
        float rotPhase = animT * 9.5;
        float cR = cos(rotPhase), sR = sin(rotPhase);
        vec3 eqRot    = cR * psrU + sR * psrV;
        vec3 eqOrtho  = -sR * psrU + cR * psrV;
        vec3 magAxis  = psrSpin * 0.6156615 + eqRot * 0.7880108;
        vec3 magMerid = psrSpin * 0.7880108 - eqRot * 0.6156615;

        float cosMag = clamp(dot(nrm, magAxis), -1.0, 1.0);
        float absMag = abs(cosMag);
        float sinMag = sqrt(max(0.0, 1.0 - cosMag * cosMag));
        float azMag  = atan(dot(nrm, eqOrtho), dot(nrm, magMerid) + 1e-6);

        // Resolved ~1,500 km inner neutron-star core gleam + dipole pair-cascade polar hot-caps + closed field-line arcs!
        float innerCrustGleam = pow(max(mu, 0.0), 4.2);
        float polarCap        = smoothstep(0.74, 0.96, absMag);
        float auroralRing     = exp(-sqr((absMag - 0.82) / 0.075));
        float fieldRibs       = pow(max(0.5 + 0.5 * cos(azMag * 10.0), 0.0), 3.2) * pow(max(sinMag, 0.0), 1.6);

        vec4 nPl = textureLod(uNoise3D, vec3(cosMag * 4.5, sin(azMag * 2.0 + animT * 0.8), cos(azMag * 2.0)) * 1.8, 0.0);
        float spark = 0.72 + 0.45 * nPl.g;

        vec3 coreSapphire = vec3(0.46, 0.84, 1.95);
        vec3 magViolet    = vec3(0.48, 0.34, 1.82);
        vec3 hotCapCyan   = vec3(0.68, 0.95, 2.20);

        float limb = 0.26 + 0.74 * pow(max(mu, 0.0), 0.65);
        vec3 surf = mix(magViolet * 0.55, coreSapphire, innerCrustGleam * 0.78) * limb;
        surf += hotCapCyan * (polarCap * 0.92 + auroralRing * 0.58) * spark;
        surf += vec3(0.28, 0.72, 1.65) * (fieldRibs * 0.62 * spark);
        surf += vec3(0.32, 0.68, 1.55) * pow(max(1.0 - mu, 0.0), 2.8) * 0.75;

        // Chroma-preserving pre-ACES ceiling <= 2.28 -> zero white blowout!
        float pkP = max(surf.r, max(surf.g, surf.b));
        if (pkP > 1.45) {
          float exP = pkP - 1.45;
          surf *= (1.45 + 0.83 * (exP / (exP + 0.83))) / pkP;
        }
        starOut = surf;
`;

const CRAB_PULSAR_CORONA_GLSL = `
          } else if (style > 8.5 && style < 9.5) {
            // CRAB PULSAR PSR B0531+21 MAGNETOSPHERE: Sweeping Twin Oblique Lighthouse Beams & 3D Dipole Arcs!
            vec3 psrSpin = vec3(-0.515040,  0.236222, -0.823974);
            vec3 psrU    = vec3(-0.115195, -0.971631, -0.206549);
            vec3 psrV    = vec3(-0.849391, -0.011463,  0.527640);

            float rotPhase = animT * 9.5;
            float cR = cos(rotPhase), sR = sin(rotPhase);
            vec3 eqRot    = cR * psrU + sR * psrV;
            vec3 eqOrtho  = -sR * psrU + cR * psrV;
            vec3 magAxis  = psrSpin * 0.6156615 + eqRot * 0.7880108;
            vec3 magMerid = psrSpin * 0.7880108 - eqRot * 0.6156615;

            // 1. 3D Closed Dipole Magnetic Field Loops (r / sin^2(theta_m) = L_shell) inside Light Cylinder!
            float cosM  = clamp(dot(dirCl, magAxis), -1.0, 1.0);
            float sinM2 = max(0.06, 1.0 - cosM * cosM);
            float lShell = xNorm / sinM2;
            float azD   = atan(dot(dirCl, eqOrtho), dot(dirCl, magMerid) + 1e-6);

            float shellWave = pow(max(0.5 + 0.5 * cos(lShell * 4.2 - 0.6), 0.0), 3.4);
            float azBundles = 0.45 + 0.55 * pow(max(0.5 + 0.5 * cos(azD * 8.0 + nLoop.r * 1.2), 0.0), 2.4);
            float dipoleArcs = shellWave * azBundles * sinM2 * exp(-(xNorm - 1.0) * 0.42) * sstepInv(7.2, 4.2, lShell);

            // Equatorial Relativistic Striped-Wind Current Sheet outside Light Cylinder
            float spinEq = 1.0 - abs(dot(dirCl, psrSpin));
            float stripedSheet = pow(max(spinEq, 0.0), 6.0) * exp(-(xNorm - 1.0) * 0.22) *
                                 (0.55 + 0.45 * cos(xNorm * 2.8 - rotPhase * 2.0)) * sstepInv(13.0, 8.5, xNorm);

            // 2. Exact 3D Ray-Cone Integration for Twin Oblique Relativistic Lighthouse Beams (+magAxis & -magAxis)!
            vec3 oNorm = -starPos / max(starR, 1e-8);
            vec3 beamSum = vec3(0.0);
            for (int bSign = 0; bSign < 2; bSign++) {
              vec3 bAx = (bSign == 0) ? magAxis : (-magAxis);
              float bd = dot(rd, bAx);
              float den = max(1.0 - bd * bd, 0.035);
              float sB = clamp((dot(oNorm, rd) * bd - dot(oNorm, bAx)) / den, 1.0, 12.8);
              float tB = -dot(oNorm, rd) + sB * bd;
              if (tB > 0.0 && tB * starR <= maxT + starR * 0.5) {
                vec3 pB = oNorm + rd * tB;
                float rPerp = length(pB - bAx * sB);
                float coneW = 0.16 + 0.145 * (sB - 1.0);
                float coreB = exp(-sqr(rPerp / coneW));
                // Hollow-cone curvature-radiation rim + relativistic Doppler beaming when sweeping toward camera!
                float rimB  = exp(-sqr((rPerp - coneW * 0.68) / (coneW * 0.36))) * 0.45;
                float doppB = 0.72 + 0.68 * max(0.0, -bd);
                float lenFade = exp(-(sB - 1.0) * 0.21) * sstepInv(12.8, 9.2, sB);
                vec3 bCol = mix(vec3(0.26, 0.78, 1.00), vec3(0.66, 0.56, 1.00), smoothstep(1.5, 9.5, sB));
                beamSum += bCol * ((coreB * 0.92 + rimB) * doppB * lenFade);
              }
            }

            vec3 innerHalo = vec3(0.32, 0.74, 1.00) * (exp(-(xNorm - 1.0) * 2.4) * 0.52 + pow(max(xNorm, 1.0), -3.2) * 0.18);
            vec3 rawCor = innerHalo +
                          mix(vec3(0.24, 0.72, 1.00), vec3(0.56, 0.38, 1.00), 0.45) * (dipoleArcs * 0.78) +
                          vec3(0.28, 0.66, 1.00) * (stripedSheet * 0.34) +
                          beamSum * 0.92;

            float pkC = max(rawCor.r, max(rawCor.g, rawCor.b));
            if (pkC > 0.98) {
              float exC = pkC - 0.98;
              rawCor *= (0.98 + 0.88 * (exC / (exC + 0.88))) / pkC;
            }
            res = rawCor;
`;

const CRAB_PULSAR_PASS2_GLSL = {
  shadeStarSurfaceBranch: CRAB_PULSAR_SHADE_SURFACE_GLSL,
  evalStellarCoronaBranch: CRAB_PULSAR_CORONA_GLSL,
  corMultRule: 'Update corMult in LOCAL_GIANTS_OVERLAYS_FRAG main() & coronaMaxR in evalStellarCorona(): when style > 8.5 && style < 9.5, use corMult = 13.5 and coronaMaxR = starR * 13.2.'
};


// ============================================================================
// 4. DISCRETE CO-ROTATING STAR CATALOG (`populateMilkyWayFamousStars` — EXACT 18,000 STARS)
//    - Emits exact 18,000 `w = 1.0` polar-disk stars `(r, theta0, zRel, 1.0)`:
//        * 6,500 Orion OB1 Association & M42 Sword Cluster
//        * 6,500 Eagle Nebula M16 / NGC 6611 OB Cluster & Serpens OB1
//        * 2,500 Crab Nebula Taurus / Anticenter Outer Field
//        * 2,500 Sirius / Vega / Betelgeuse Solar–Orion Neighborhood
//    - Strict >= 16.0 ly (> 15 ly) cavities around Trapezium/M42, Pillars, Crab Pulsar,
//      Betelgeuse, Sirius, Vega, Sun, Proxima & Alpha Cen!
//    - Calibrated inner-cluster `sizeClass` (`0.007–0.022`) so `STAR_VERT` renders crisp
//      2–5 px jewel-like pinpoint OB stars at 15–80 ly with ZERO bloom white-out!
//    - Supports BOTH calling conventions:
//        a) `idx = populateMilkyWayFamousStars(orbitBuf, propsBuf, idx, TOTAL_STARS)`
//        b) `populateMilkyWayFamousStars(pushStar)`
// ============================================================================

const MW_FAMOUS_STAR_COUNT = 18000;

function populateMilkyWayFamousStars(orbitBufOrPushFn, propsBuf, startIdx = 0, maxStars = Infinity) {
  let seed = 20261054;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const gauss = () => {
    const u1 = Math.max(1e-7, rnd());
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(6.28318530718 * rnd());
  };

  const isCallbackMode = typeof orbitBufOrPushFn === 'function';
  let idx = startIdx;
  let emitted = 0;

  const enforceHeroCavities = (wx, wy, wz) => {
    // Enforce strict >= 16.2 ly (0.0162 kly > 15 ly) cavity around every Milky Way hero landmark!
    for (let pass = 0; pass < 2; pass++) {
      for (let k = 0; k < MW_HERO_CAVITY_CENTERS_KLY.length; k++) {
        const c = MW_HERO_CAVITY_CENTERS_KLY[k];
        const minR = (k === 9) ? 0.010 : 0.0165; // 16.5 ly around Pillars, Trapezium, Crab, Betelgeuse, Sirius, Vega, Sun!
        const dx = wx - c[0], dy = wy - c[1], dz = wz - c[2];
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < minR * minR) {
          const d = Math.sqrt(d2) || 1e-6;
          const push = (minR * (1.08 + 0.35 * rnd())) / d;
          wx = c[0] + dx * push;
          wy = c[1] + dy * push;
          wz = c[2] + dz * push;
        }
      }
    }
    return [wx, wy, wz];
  };

  const emitDiskWorld = (rawX, rawY, rawZ, temp, lum, sz) => {
    if (emitted >= MW_FAMOUS_STAR_COUNT || (!isCallbackMode && idx >= maxStars)) return;
    const p = enforceHeroCavities(rawX, rawY, rawZ);
    const wx = p[0], wy = p[1], wz = p[2];
    const r = Math.max(0.08, Math.hypot(wx, wz));
    const theta0 = Math.atan2(wz, wx);
    const zRel = wy - _mwNeb_warpHeightJS(wx, wz);
    const phase = rnd() * 6.2831853;

    if (isCallbackMode) {
      orbitBufOrPushFn(r, theta0, zRel, 1.0, temp, lum, sz, phase);
    } else {
      const b = idx * 4;
      orbitBufOrPushFn[b]     = r;
      orbitBufOrPushFn[b + 1] = theta0;
      orbitBufOrPushFn[b + 2] = zRel;
      orbitBufOrPushFn[b + 3] = 1.0;
      propsBuf[b]     = temp;
      propsBuf[b + 1] = lum;
      propsBuf[b + 2] = sz;
      propsBuf[b + 3] = phase;
      idx++;
    }
    emitted++;
  };

  // --------------------------------------------------------------------------
  // A. 6,500 Stars — Orion OB1 Association (Belt/Sword/Gould Belt) & Outer ONC/M42 Shell
  // --------------------------------------------------------------------------
  for (let i = 0; i < 6500; i++) {
    let wx, wy, wz, temp, lum, sz;
    if (i < 650) {
      // Outer Orion Nebula Cluster (ONC: 16.5–58 ly shell around M42) — pinpoint crisp jewels, zero bloom veil!
      const rShell = 0.0168 + Math.pow(rnd(), 1.35) * 0.042;
      const a1 = rnd() * 6.2831853;
      const c2 = 2.0 * rnd() - 1.0;
      const s2 = Math.sqrt(Math.max(0.0, 1.0 - c2 * c2));
      wx = M42_BASE_KLY[0] + rShell * s2 * Math.cos(a1);
      wy = M42_BASE_KLY[1] + rShell * c2 * 0.85;
      wz = M42_BASE_KLY[2] + rShell * s2 * Math.sin(a1);
      const isHotB = rnd() < 0.62;
      temp = isHotB ? (0.68 + rnd() * 0.32) : (0.14 + rnd() * 0.42);
      lum  = isHotB ? (0.18 + Math.pow(rnd(), 2.6) * 0.42) : (0.10 + rnd() * 0.22);
      sz   = 0.007 + Math.pow(rnd(), 2.2) * 0.012;
    } else if (i < 2450) {
      // Orion's Sword & Belt OB1b/OB1c Sub-Associations (Alnitak/Alnilam/Mintaka corridor, 60–240 ly)
      const beltT = rnd();
      const cx = M42_BASE_KLY[0] * (1.0 - beltT * 0.18) + _MW_BETELGEUSE_BASE_KLY[0] * (beltT * 0.18);
      const cy = M42_BASE_KLY[1] + beltT * 0.095;
      const cz = M42_BASE_KLY[2] + beltT * 0.085;
      const spread = 0.045 + 0.095 * rnd();
      wx = cx + gauss() * spread;
      wy = cy + gauss() * (spread * 0.65);
      wz = cz + gauss() * spread;
      const isSuperOB = rnd() < 0.72;
      temp = isSuperOB ? (0.72 + rnd() * 0.28) : (0.12 + rnd() * 0.44);
      lum  = isSuperOB ? (0.42 + Math.pow(rnd(), 2.8) * 1.65) : (0.22 + rnd() * 0.55);
      sz   = 0.018 + Math.pow(rnd(), 2.8) * 0.14;
    } else {
      // Extended Orion OB1a / Radcliffe Wave / Orion Spur Star Cloud (120–520 ly)
      wx = M42_BASE_KLY[0] - 0.12 + gauss() * 0.28;
      wy = M42_BASE_KLY[1] + 0.08 + gauss() * 0.16;
      wz = M42_BASE_KLY[2] + 0.06 + gauss() * 0.28;
      const isOB = rnd() < 0.56;
      const isRSG = !isOB && rnd() < 0.05;
      temp = isRSG ? (0.04 + rnd() * 0.08) : (isOB ? (0.64 + rnd() * 0.36) : (0.18 + rnd() * 0.46));
      lum  = isRSG ? (0.85 + rnd() * 1.45) : (isOB ? (0.48 + Math.pow(rnd(), 3.0) * 2.10) : (0.26 + rnd() * 0.68));
      sz   = 0.045 + Math.pow(rnd(), 3.2) * 0.55;
    }
    emitDiskWorld(wx, wy, wz, temp, lum, sz);
  }

  // --------------------------------------------------------------------------
  // B. 6,500 Stars — Eagle Nebula M16 / NGC 6611 Young OB Cluster & Serpens OB1 Arm
  // --------------------------------------------------------------------------
  for (let i = 0; i < 6500; i++) {
    let wx, wy, wz, temp, lum, sz;
    if (i < 720) {
      // Young OB Cluster NGC 6611 inside NW M16 cavity (strictly >= 16.2 ly clear of Pillars!)
      const rCl = 0.0125 + Math.pow(rnd(), 1.45) * 0.048;
      const a1 = rnd() * 6.2831853;
      const c2 = 2.0 * rnd() - 1.0;
      const s2 = Math.sqrt(Math.max(0.0, 1.0 - c2 * c2));
      // Bias slightly NW (+Y/+Z in world) away from SE Pillars so NGC 6611 sparkles cleanly above Pillars!
      wx = NGC6611_BASE_KLY[0] + rCl * s2 * Math.cos(a1);
      wy = NGC6611_BASE_KLY[1] + Math.abs(rCl * c2) * 0.55 + rCl * c2 * 0.45 + 0.004;
      wz = NGC6611_BASE_KLY[2] + rCl * s2 * Math.sin(a1) + 0.002;
      const isOStar = rnd() < 0.74;
      temp = isOStar ? (0.76 + rnd() * 0.24) : (0.20 + rnd() * 0.42);
      lum  = isOStar ? (0.18 + Math.pow(rnd(), 2.5) * 0.46) : (0.10 + rnd() * 0.24);
      sz   = 0.0065 + Math.pow(rnd(), 2.3) * 0.011;
    } else if (i < 2600) {
      // Surrounding M16 Corona & Omega/Serpens OB1 Star-Forming Ridge (60–280 ly)
      const rOut = 0.058 + Math.pow(rnd(), 1.15) * 0.22;
      const a1 = rnd() * 6.2831853;
      const c2 = 2.0 * rnd() - 1.0;
      const s2 = Math.sqrt(Math.max(0.0, 1.0 - c2 * c2));
      wx = M16_BASE_KLY[0] + rOut * s2 * Math.cos(a1);
      wy = M16_BASE_KLY[1] + rOut * c2 * 0.58;
      wz = M16_BASE_KLY[2] + rOut * s2 * Math.sin(a1);
      const isOB = rnd() < 0.64;
      temp = isOB ? (0.68 + rnd() * 0.32) : (0.12 + rnd() * 0.44);
      lum  = isOB ? (0.38 + Math.pow(rnd(), 2.9) * 1.75) : (0.22 + rnd() * 0.62);
      sz   = 0.018 + Math.pow(rnd(), 3.0) * 0.22;
    } else {
      // Sagittarius–Carina Spiral Arm Rich Star Cloud around l ~ 14°–20° (250–750 ly)
      wx = M16_BASE_KLY[0] + gauss() * 0.42;
      wy = M16_BASE_KLY[1] + gauss() * 0.15;
      wz = M16_BASE_KLY[2] + gauss() * 0.42;
      const isHot = rnd() < 0.52;
      const isRSG = !isHot && rnd() < 0.06;
      temp = isRSG ? (0.04 + rnd() * 0.08) : (isHot ? (0.62 + rnd() * 0.38) : (0.14 + rnd() * 0.46));
      lum  = isRSG ? (0.90 + rnd() * 1.65) : (isHot ? (0.45 + Math.pow(rnd(), 3.0) * 2.25) : (0.28 + rnd() * 0.72));
      sz   = 0.055 + Math.pow(rnd(), 3.4) * 0.68;
    }
    emitDiskWorld(wx, wy, wz, temp, lum, sz);
  }

  // --------------------------------------------------------------------------
  // C. 2,500 Stars — Crab Nebula Outer Taurus / Perseus-Anticenter Stellar Field
  // --------------------------------------------------------------------------
  for (let i = 0; i < 2500; i++) {
    let wx, wy, wz, temp, lum, sz;
    if (i < 550) {
      // Near-Crab background/surrounding star field (18–95 ly — crisp HST Taurus field stars!)
      const rShell = 0.0185 + Math.pow(rnd(), 1.25) * 0.078;
      const a1 = rnd() * 6.2831853;
      const c2 = 2.0 * rnd() - 1.0;
      const s2 = Math.sqrt(Math.max(0.0, 1.0 - c2 * c2));
      wx = CRAB_BASE_KLY[0] + rShell * s2 * Math.cos(a1);
      wy = CRAB_BASE_KLY[1] + rShell * c2 * 0.75;
      wz = CRAB_BASE_KLY[2] + rShell * s2 * Math.sin(a1);
      const isBlue = rnd() < 0.38;
      temp = isBlue ? (0.62 + rnd() * 0.34) : (0.14 + rnd() * 0.48);
      lum  = 0.16 + Math.pow(rnd(), 2.8) * 0.48;
      sz   = 0.008 + Math.pow(rnd(), 2.5) * 0.018;
    } else {
      // Wider Anticenter / Gem OB1 / Perseus Arm outskirts (100–650 ly)
      wx = CRAB_BASE_KLY[0] + gauss() * 0.38;
      wy = CRAB_BASE_KLY[1] + gauss() * 0.18;
      wz = CRAB_BASE_KLY[2] + gauss() * 0.38;
      const isHot = rnd() < 0.46;
      temp = isHot ? (0.58 + rnd() * 0.40) : (0.14 + rnd() * 0.48);
      lum  = isHot ? (0.42 + Math.pow(rnd(), 3.0) * 1.95) : (0.25 + rnd() * 0.65);
      sz   = 0.040 + Math.pow(rnd(), 3.4) * 0.62;
    }
    emitDiskWorld(wx, wy, wz, temp, lum, sz);
  }

  // --------------------------------------------------------------------------
  // D. 2,500 Stars — Sirius / Vega / Betelgeuse / Solar–Orion Gould Belt Neighborhood
  // --------------------------------------------------------------------------
  for (let i = 0; i < 2500; i++) {
    let wx, wy, wz, temp, lum, sz;
    if (i < 950) {
      // Local Interstellar Bubble & Sirius/Vega Extended Neighborhood (22–280 ly around Sun)
      const rLoc = 0.022 + Math.pow(rnd(), 1.15) * 0.26;
      const a1 = rnd() * 6.2831853;
      const c2 = 2.0 * rnd() - 1.0;
      const s2 = Math.sqrt(Math.max(0.0, 1.0 - c2 * c2));
      wx = _mwNeb_SUN_BASE_KLY[0] + rLoc * s2 * Math.cos(a1);
      wy = _mwNeb_SUN_BASE_KLY[1] + rLoc * c2 * 0.68;
      wz = _mwNeb_SUN_BASE_KLY[2] + rLoc * s2 * Math.sin(a1);
      const isAF = rnd() < 0.42;
      temp = isAF ? (0.56 + rnd() * 0.38) : (0.14 + rnd() * 0.44);
      lum  = 0.20 + Math.pow(rnd(), 2.9) * 0.85;
      sz   = 0.010 + Math.pow(rnd(), 2.8) * 0.085;
    } else {
      // Sun -> Betelgeuse (548 ly) Orion-Taurus Bridge & Gould Belt Ring (40–480 ly)
      const u = rnd();
      const cx = _mwNeb_SUN_BASE_KLY[0] * (1.0 - u) + _MW_BETELGEUSE_BASE_KLY[0] * u;
      const cy = _mwNeb_SUN_BASE_KLY[1] * (1.0 - u) + _MW_BETELGEUSE_BASE_KLY[1] * u;
      const cz = _mwNeb_SUN_BASE_KLY[2] * (1.0 - u) + _MW_BETELGEUSE_BASE_KLY[2] * u;
      const spread = 0.045 + 0.16 * Math.sin(u * Math.PI) + 0.06 * rnd();
      wx = cx + gauss() * spread;
      wy = cy + gauss() * (spread * 0.62);
      wz = cz + gauss() * spread;
      const isOB = rnd() < 0.54;
      temp = isOB ? (0.64 + rnd() * 0.36) : (0.14 + rnd() * 0.46);
      lum  = isOB ? (0.36 + Math.pow(rnd(), 2.9) * 1.65) : (0.22 + rnd() * 0.58);
      sz   = 0.022 + Math.pow(rnd(), 3.1) * 0.28;
    }
    emitDiskWorld(wx, wy, wz, temp, lum, sz);
  }

  return idx;
}


// ============================================================================
// 5. PRESETS, `getMinDistKly` & COLLISION-FREE 3D `LABELS` (`MW_NEBULAE_PRESETS_LABELS_JS`)
//    Note for `@mw-integrator`:
//    In `applyPreset(key)`, include `crab_nebula`, `crab_pulsar`, `orion_m42`,
//    `trapezium`, `eagle_m16`, `pillars_of_creation` in the co-rotating yaw rule:
//      `let targetYaw = p.yaw + (CO_ROTATING_MW_PRESET_KEYS.has(key) ? latestEph.galAngle : 0.0);`
//    so even when `galTime > 0`, every Milky Way nebula preset locks onto its exact
//    Earth-facing HST/JWST hero orientation!
// ============================================================================

const HERO_CRAB_ANG        = { yaw:  3.062058, pitch:  0.100950 };
const HERO_CRAB_PULSAR_ANG = { yaw:  2.912544, pitch:  0.322153 };
const HERO_M42_ANG         = { yaw:  2.635203, pitch:  0.338280 };
const HERO_TRAPEZIUM_ANG   = { yaw:  2.588802, pitch:  0.415023 };
const HERO_M16_ANG         = { yaw: -0.295903, pitch: -0.013840 };
const HERO_PILLARS_ANG     = { yaw: -0.295903, pitch: -0.013840 };

const MW_NEBULAE_MIN_DIST_KLY = {
  crab_nebula:         0.0012,
  crab_pulsar:         0.055 * _mwNeb_RSUN_IN_KLY,
  orion_m42:           0.0015,
  trapezium:           32.0 * _mwNeb_RSUN_IN_KLY,
  eagle_m16:           0.0080,
  pillars_of_creation: 0.0012
};

const MW_NEBULAE_PRESETS = {
  pillars_of_creation: {
    title: '鹰状星云 M16 核心 ·“创生之柱” Pillars of Creation (1:1 真实 4.5 / 3.2 / 1.95 光年分子云柱)：',
    desc: '参照哈勃 2014 与韦布 NIRCam 复刻：三座高耸的不透明冷分子暗尘埃巨柱背衬 M16 绿松石色 [O III] 电离腔，顶端受 NGC 6611 紫外辐射光致蒸发闪耀金珀青蓝电离锋、指状蒸发气态球粒 (EGGs) 与韦布绯红原恒星激波尖端！',
    anchorId: 'pillars_of_creation', anchorLabel: '鹰状星云 · 创生之柱 (高 4.5 ly)',
    offsetKly: [0, 0, 0], yaw: HERO_PILLARS_ANG.yaw, pitch: HERO_PILLARS_ANG.pitch, distKly: 0.0052, fov: 52
  },
  eagle_m16: {
    title: '鹰状星云 M16 与年轻 OB 星团 NGC 6611 (距地 5,700 光年 · 跨度 70 × 55 ly · 人马-船底臂)：',
    desc: '深入人马-船底旋臂育星工厂：西北部炽热 O 型星团 NGC 6611 吹蚀出璀璨青翠 [O III] 电离空腔与赤金 Hα/[S II] 分子悬崖，东南部矗立着著名的“创生之柱”（点击核心标签即可一键潜入 5.2 ly 近景）！',
    anchorId: 'eagle_m16', anchorLabel: '鹰状星云 M16 (NGC 6611 · 70 ly)',
    offsetKly: [0, 0, 0], yaw: HERO_M16_ANG.yaw, pitch: HERO_M16_ANG.pitch, distKly: 0.068, fov: 50
  },
  orion_m42: {
    title: '猎户座大星云 M42 / NGC 1976 (距地 1,344 光年 · 直径 24 ly 三维凹面惠更斯电离腔)：',
    desc: '距太阳系最近的大质量恒星诞生区：朝向地球敞开的三维凹面 [O III] 绿松石惠更斯碗、斜向金珊瑚色猎户座电离锋脊 (Orion Bar)、前景暗尘埃“鱼口湾” (Fish\'s Mouth)、北侧 M43 逗点星云与 24 光年展翅双翼！',
    anchorId: 'orion_m42', anchorLabel: '猎户座大星云 M42 (直径 24 ly)',
    offsetKly: [0, 0, 0], yaw: HERO_M42_ANG.yaw, pitch: HERO_M42_ANG.pitch, distKly: 0.028, fov: 50
  },
  trapezium: {
    title: '猎户座四合星团 Trapezium (θ¹ Orionis C1/A1/D/B) 与泪滴状光致蒸发原行星盘 (Proplyds)：',
    desc: '潜入 M42 核心 0.55 光年：同屏呈现 20 万倍太阳光度的 O6Vp 主星 θ¹ Ori C1 (39,000 K) 等四颗炽热 OB 恒星，以及 5 枚背向主星拖曳电离彗尾、内含暗尘埃盘剪影的哈勃泪滴状原行星盘 (Proplyds)！',
    anchorId: 'trapezium', anchorLabel: '猎户座四合星团 Trapezium & 原行星盘',
    offsetKly: [0, 0, 0], yaw: HERO_TRAPEZIUM_ANG.yaw, pitch: HERO_TRAPEZIUM_ANG.pitch, distKly: 0.00055, fov: 50
  },
  crab_nebula: {
    title: '蟹状星云 M1 / NGC 1952 · 宋至和元年“天关客星” SN 1054 (距地 6,500 ly · 11.0 × 7.6 ly)：',
    desc: '公元 1054 年超新星爆发遗迹 1:1 复刻：外层翡翠绿 [O III]、绯红 [N II]/Hα 与金珀 [S II] 交织的三维瑞利-泰勒丝状笼，内部幽蓝光学同步辐射脉冲星风星云、28° 倾角钱德拉赤道环纹与 ±4.2 ly 相对论极向喷流！',
    anchorId: 'crab_nebula', anchorLabel: '蟹状星云 M1 (SN 1054 · 11×7.6 ly)',
    offsetKly: [0, 0, 0], yaw: HERO_CRAB_ANG.yaw, pitch: HERO_CRAB_ANG.pitch, distKly: 0.0155, fov: 48
  },
  crab_pulsar: {
    title: '蟹状星云脉冲星 PSR B0531+21 (高速自转磁层灯塔 · 钱德拉同步辐射环与极向喷流中心)：',
    desc: '深入蟹状星云最核心的光速圆柱磁层 (~12,500 km)：展现炽热蓝紫中子星极冠、倾斜偶极磁力线拱弧与高速扫掠的相对论双极灯塔辐射束，四周环绕三维钱德拉同步辐射环纹与天关客星丝状遗迹！',
    anchorId: 'crab_pulsar', anchorLabel: '蟹状脉冲星 PSR B0531+21 (磁层灯塔)',
    offsetKly: [0, 0, 0], yaw: HERO_CRAB_PULSAR_ANG.yaw, pitch: HERO_CRAB_PULSAR_ANG.pitch, distKly: 0.14 * _mwNeb_RSUN_IN_KLY, fov: 48
  }
};

// Hierarchical collision-free 3D `LABELS` definitions (parent nebula labels auto-hide when entering nebula;
// child core labels `pillars_of_creation`, `trapezium`, `crab_pulsar` appear inside the parent view and auto-hide on close-up!):
const MW_NEBULAE_LABELS_JS = `
    { key: 'pillars_of_creation', name: '创生之柱 Pillars of Creation', sub: 'M16 核心 · 4.5 / 3.2 / 1.95 ly 分子云柱', getPos: e => e.pillars_of_creation, color: '#fbbf24', minKly: 0.0095,              maxKly: 0.35, hideNearKly: 0.0095,              radiusKly: 0.0028 },
    { key: 'eagle_m16',           name: '鹰状星云 M16 (NGC 6611)',      sub: '距地 5,700 ly · 创生之柱母星云',           getPos: e => e.eagle_m16,           color: '#2dd4bf', minKly: 0.14,                maxKly: 92.0, hideNearKly: 0.14,                radiusKly: 0.035 },
    { key: 'trapezium',           name: '猎户座四合星团 Trapezium',      sub: 'θ¹ Ori C1 (39,000 K) · 泪滴原行星盘',      getPos: e => e.trapezium,           color: '#38bdf8', minKly: 0.0016,              maxKly: 0.12, hideNearKly: 0.0016,              radiusKly: 0.00035 },
    { key: 'orion_m42',           name: '猎户座大星云 M42 (NGC 1976)',   sub: '距地 1,344 ly · 24 ly 惠更斯电离腔',       getPos: e => e.orion_m42,           color: '#f472b6', minKly: 0.065,               maxKly: 92.0, hideNearKly: 0.065,               radiusKly: 0.012 },
    { key: 'crab_pulsar',         name: '蟹状脉冲星 PSR B0531+21',       sub: 'SN 1054 中子星磁层 · 同步辐射风源',        getPos: e => e.crab_pulsar,         color: '#60a5fa', minKly: 2.0 * RSUN_IN_KLY,   maxKly: 0.055,hideNearKly: 2.0 * RSUN_IN_KLY,   radiusKly: 0.04 * RSUN_IN_KLY },
    { key: 'crab_nebula',         name: '蟹状星云 M1 (天关客星)',        sub: '距地 6,500 ly · 11×7.6 ly 超新星遗迹',     getPos: e => e.crab_nebula,         color: '#34d399', minKly: 0.035,               maxKly: 92.0, hideNearKly: 0.035,               radiusKly: 0.0055 }
`;

const MW_NEBULAE_PRESETS_LABELS_JS = {
  HERO_CRAB_ANG,
  HERO_CRAB_PULSAR_ANG,
  HERO_M42_ANG,
  HERO_TRAPEZIUM_ANG,
  HERO_M16_ANG,
  HERO_PILLARS_ANG,
  MW_NEBULAE_MIN_DIST_KLY,
  MW_NEBULAE_PRESETS,
  MW_NEBULAE_LABELS_JS
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CRAB_BASE_KLY,
    CRAB_SPIN_AXIS_BASE,
    CRAB_SEMI_AXES_KLY,
    CRAB_PULSAR_SPEC,
    M42_BASE_KLY,
    TRAPEZIUM_BASE_KLY,
    TRAPEZIUM_STARS_BASE,
    M16_BASE_KLY,
    NGC6611_BASE_KLY,
    PILLARS_M16_BASE_KLY,
    MW_HERO_CAVITY_CENTERS_KLY,
    computeMwNebulaeEphemeris,
    MW_NEBULAE_ASTROMETRY_JS,
    MW_NEBULAE_VOLUMETRIC_GLSL,
    CRAB_PULSAR_SHADE_SURFACE_GLSL,
    CRAB_PULSAR_CORONA_GLSL,
    CRAB_PULSAR_PASS2_GLSL,
    MW_FAMOUS_STAR_COUNT,
    populateMilkyWayFamousStars,
    MW_NEBULAE_PRESETS_LABELS_JS
  };
}
