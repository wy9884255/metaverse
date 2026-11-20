/**
 * ============================================================================
 * 1:1 MILKY WAY ICONIC STARS ASTROPHYSICAL & WEBGL2 MODULE
 *   - Betelgeuse (α Orionis · 参宿四: 764 R_sun = 3.553 AU, 3,600 K + 2019-2020 Great Dimming)
 *   - Sirius Binary System (α Canis Majoris A & White Dwarf B "The Pup": 5,844 km DA2, 25,200 K)
 *   - Vega (α Lyrae · 织女星: P_rot = 12.5 hr, f = 0.1702 Oblate Spheroid + von Zeipel + Debris Belt)
 *
 * Author: mw-stars-modeler
 * Target Integrator: mw-integrator -> milky_way.html & build_solar_standalone.py
 *
 * Scientific References & Exact 1:1 Calibrations (1.0 world unit = 1 kly = 1,000 ly):
 * 1. Joyce et al. (2020, ApJ 902, 63) & Montarges et al. (2021, Nature 594, 365):
 *    Betelgeuse d = 548.0 ly (168 pc), Galactic (l = 199.787 deg, b = -8.959 deg),
 *    R = 764.0 R_sun (3.553 AU — larger than Mars's orbit!), T_eff = 3,600 K, L ~ 126,000 L_sun;
 *    Schwarzschild/CO5BOLD 4-6 giant convective super-plumes + 2019-2020 SW silicate dust cloud.
 * 2. Bond et al. (2017, ApJ 840, 70) & Joyce et al. (2018, MNRAS 481, 2361 HST/STIS):
 *    Sirius AB d = 8.601 ly (2.637 pc), Galactic (l = 227.230 deg, b = -8.890 deg);
 *    P = 50.1284 yr, a_rel = 19.80 AU (a_A = 6.578 AU, a_B = 13.222 AU), e = 0.59142,
 *    i = 136.336 deg, Omega = 45.4 deg, omega_B = 149.2 deg (omega_A = 329.2 deg), M0 = 1.65 rad;
 *    Sirius A: M = 2.063 M_sun, R = 1.711 R_sun, T_eff = 9,940 K (A0mA1 Va);
 *    Sirius B: M = 1.018 M_sun, R = 0.00840 R_sun (5,844 km = 91.6% R_Earth!), T_eff = 25,200 K (DA2, log g = 8.57).
 * 3. Aufdenberg et al. (2006), Monnier et al. (2012 CHARA) & Su et al. (2024 JWST/ALMA):
 *    Vega d = 25.04 ly, Galactic (l = 67.448 deg, b = +19.237 deg), P_rot = 12.5 hr (v_eq = 236 km/s),
 *    R_eq = 2.726 R_sun, R_pol = 2.262 R_sun, flattening f = 0.1702, spin axis 5.7 deg from Earth LOS;
 *    von Zeipel gravity darkening (10,020 K pole -> 7,900 K equator) + 85-145 AU icy Kuiper-analog belt.
 * ============================================================================
 */

// ============================================================================
// 1. EXACT ASTROMETRY, KEPLERIAN BINARY ORBITS & GALACTIC CO-ROTATION (JS)
// Drop constants into Section 1 of milky_way.html (after ALPHACEN_BASE_KLY),
// ephemeris lines into computeEphemeris(), orbit VAOs into orbitMeshes, and
// star-slot priority checks into renderScene() BEFORE `else if (dSunKly < 0.065)`.
// ============================================================================
export const MW_STARS_ASTROMETRY_JS = `
  // --- 1A. Exact 1:1 Milky Way Co-Rotating Stellar Astrometry (t=0 Base Galactocentric kly) ---
  // Betelgeuse (alpha Orionis — Joyce et al. 2020: d = 548.0 ly, l = 199.787 deg, b = -8.959 deg, R = 764.0 R_sun)
  const BETELGEUSE_SUN_OFFSET = galacticToSunOffsetKly(548.0, 199.787, -8.959);
  const BETELGEUSE_BASE_KLY = [
    SUN_BASE_KLY[0] + BETELGEUSE_SUN_OFFSET[0],
    SUN_BASE_KLY[1] + BETELGEUSE_SUN_OFFSET[1],
    SUN_BASE_KLY[2] + BETELGEUSE_SUN_OFFSET[2]
  ];

  // Sirius Binary System (alpha Canis Majoris A & White Dwarf B — Bond et al. 2017 HST: d = 8.601 ly, l = 227.230 deg, b = -8.890 deg)
  const SIRIUS_SUN_OFFSET = galacticToSunOffsetKly(8.601, 227.230, -8.890);
  const SIRIUS_BASE_KLY = [
    SUN_BASE_KLY[0] + SIRIUS_SUN_OFFSET[0],
    SUN_BASE_KLY[1] + SIRIUS_SUN_OFFSET[1],
    SUN_BASE_KLY[2] + SIRIUS_SUN_OFFSET[2]
  ];

  // Exact Visual Binary Keplerian Elements around Sirius AB Barycenter (P = 50.1284 yr, a_rel = 19.80 AU, e = 0.59142)
  // omega_A = omega_B + 180 deg guarantees pos_A(t) = -(a_A / a_B) * pos_B(t) on opposite sides of barycenter at all epochs!
  const SIRIUS_A_ORBIT = {
    id: 'sirius_a', name: '天狼星 A (Sirius A · 2.063 M☉)',
    a_AU: 6.578, e: 0.59142,
    inc: (136.336 * Math.PI) / 180.0,
    Omega: (45.4 * Math.PI) / 180.0,
    omega: ((149.2 + 180.0) * Math.PI) / 180.0,
    M0: 1.65, periodYr: 50.1284,
    rRsun: 1.711, tempK: 9940.0, style: 7.0, lumWeight: 25.4
  };
  const SIRIUS_B_ORBIT = {
    id: 'sirius_b', name: '白矮星天狼星 B (The Pup · R=5,844 km)',
    a_AU: 13.222, e: 0.59142,
    inc: (136.336 * Math.PI) / 180.0,
    Omega: (45.4 * Math.PI) / 180.0,
    omega: (149.2 * Math.PI) / 180.0,
    M0: 1.65, periodYr: 50.1284,
    rRsun: 0.00840, tempK: 25200.0, style: 7.5, lumWeight: 2.2
  };

  // Vega (alpha Lyrae — Monnier et al. 2012 CHARA: d = 25.04 ly, l = 67.448 deg, b = +19.237 deg, R_eq = 2.726 R_sun, f = 0.1702)
  const VEGA_SUN_OFFSET = galacticToSunOffsetKly(25.04, 67.448, 19.237);
  const VEGA_BASE_KLY = [
    SUN_BASE_KLY[0] + VEGA_SUN_OFFSET[0],
    SUN_BASE_KLY[1] + VEGA_SUN_OFFSET[1],
    SUN_BASE_KLY[2] + VEGA_SUN_OFFSET[2]
  ];
  // Exact unit spin axis tilted 5.700 deg from Vega-Sun line of sight (matches GLSL const VEGA_SPIN_AXIS = vec3(-0.347767, 0.421621, 0.837433))
  const VEGA_SPIN_AXIS_JS = normVec3(unitGalacticDir(67.448, 19.237 + 5.700));

  // Hero Camera View Angles (computed analytically from 3D orbital & spin geometry):
  // 1) Vega at exact 58.0 deg inclination in the spin meridian plane -> zero roll, horizontal 17% bulge, upright 10,020 K North Pole!
  const _vegaHorizH = normVec3([VEGA_SPIN_AXIS_JS[0], 0.0, VEGA_SPIN_AXIS_JS[2]]);
  const _vegaCamTheta = ((24.937 - 58.0) * Math.PI) / 180.0;
  const HERO_VEGA_ANG = dirToYawPitch([
    Math.cos(_vegaCamTheta) * _vegaHorizH[0],
    Math.sin(_vegaCamTheta),
    Math.cos(_vegaCamTheta) * _vegaHorizH[2]
  ]);

  // 2) Sirius A & Sirius B hero angles (~26.17 AU separation at M0 = 1.65):
  //    HERO_SIRIUS_ANG centers Sirius A (1.711 R_sun) while framing Sirius B ("The Pup") + binary orbit loops cleanly on the right!
  //    HERO_SIRIUS_B_ANG centers Earth-sized White Dwarf Sirius B (5,844 km) while dazzling Sirius A shines in the right background sky!
  const _sirA0 = solveKepler3D(SIRIUS_A_ORBIT, 0.0);
  const _sirB0 = solveKepler3D(SIRIUS_B_ORBIT, 0.0);
  const _uSirAB = normVec3([_sirB0[0] - _sirA0[0], _sirB0[1] - _sirA0[1], _sirB0[2] - _sirA0[2]]);
  const _sideSirAB = normVec3(crossVec3(_uSirAB, [0.0, 1.0, 0.0]));
  const _upSirAB   = normVec3(crossVec3(_sideSirAB, _uSirAB));
  const _angSirA   = (23.5 * Math.PI) / 180.0;
  const HERO_SIRIUS_ANG = dirToYawPitch([
    -_uSirAB[0] * Math.cos(_angSirA) + _sideSirAB[0] * Math.sin(_angSirA) + _upSirAB[0] * 0.06,
    -_uSirAB[1] * Math.cos(_angSirA) + _sideSirAB[1] * Math.sin(_angSirA) + _upSirAB[1] * 0.06,
    -_uSirAB[2] * Math.cos(_angSirA) + _sideSirAB[2] * Math.sin(_angSirA) + _upSirAB[2] * 0.06
  ]);
  const _uSirBA    = [-_uSirAB[0], -_uSirAB[1], -_uSirAB[2]];
  const _sideSirBA = normVec3(crossVec3(_uSirBA, [0.0, 1.0, 0.0]));
  const _upSirBA   = normVec3(crossVec3(_sideSirBA, _uSirBA));
  const _angSirB   = (22.5 * Math.PI) / 180.0;
  const HERO_SIRIUS_B_ANG = dirToYawPitch([
    -_uSirBA[0] * Math.cos(_angSirB) + _sideSirBA[0] * Math.sin(_angSirB) - _upSirBA[0] * 0.05,
    -_uSirBA[1] * Math.cos(_angSirB) + _sideSirBA[1] * Math.sin(_angSirB) - _upSirBA[1] * 0.05,
    -_uSirBA[2] * Math.cos(_angSirB) + _sideSirBA[2] * Math.sin(_angSirB) - _upSirBA[2] * 0.05
  ]);
`;

export const MW_STARS_EPHEMERIS_SNIPPET_JS = `
    // --- Inside computeEphemeris(galTime, localDays, sStarYears, bhPhase, starAnim): ---
    // Co-rotate Betelgeuse, Sirius AB barycenter, and Vega with the Milky Way disk so they never drift vs Sun!
    const betelgeuseKly = rotateGalacticDiskKly(BETELGEUSE_BASE_KLY, galAngle);
    const siriusBaryKly = rotateGalacticDiskKly(SIRIUS_BASE_KLY, galAngle);
    const vegaKly       = rotateGalacticDiskKly(VEGA_BASE_KLY, galAngle);

    const siriusTimeYr  = localDays / 365.25;
    const siriusAAU     = solveKepler3D(SIRIUS_A_ORBIT, siriusTimeYr);
    const siriusBAU     = solveKepler3D(SIRIUS_B_ORBIT, siriusTimeYr);
    const siriusAKly = [
      siriusBaryKly[0] + siriusAAU[0] * AU_IN_KLY,
      siriusBaryKly[1] + siriusAAU[1] * AU_IN_KLY,
      siriusBaryKly[2] + siriusAAU[2] * AU_IN_KLY
    ];
    const siriusBKly = [
      siriusBaryKly[0] + siriusBAU[0] * AU_IN_KLY,
      siriusBaryKly[1] + siriusBAU[1] * AU_IN_KLY,
      siriusBaryKly[2] + siriusBAU[2] * AU_IN_KLY
    ];

    // Add to return { ... } of computeEphemeris:
    //   betelgeuse: betelgeuseKly,
    //   sirius:     siriusBaryKly,
    //   sirius_a:   siriusAKly,
    //   sirius_b:   siriusBKly,
    //   vega:       vegaKly,
`;

export const MW_STARS_RENDER_DISPATCH_SNIPPET_JS = `
    // --- 1) Add inside orbitMeshes = { ... }: ---
    // siriusA: { mesh: createOrbitLoopVAO(SIRIUS_A_ORBIT, 512), color: [0.44, 0.78, 1.00, 0.72] },
    // siriusB: { mesh: createOrbitLoopVAO(SIRIUS_B_ORBIT, 512), color: [0.58, 0.62, 1.00, 0.78] },

    // --- 2) In renderScene() Pass 2 star-slot dispatch (MUST come BEFORE \`else if (dSunKly < 0.065)\`!): ---
    const dSiriusKly = Math.hypot(
      cam.posKly[0] - eph.sirius[0],
      cam.posKly[1] - eph.sirius[1],
      cam.posKly[2] - eph.sirius[2]
    );
    const dVegaKly = Math.hypot(
      cam.posKly[0] - eph.vega[0],
      cam.posKly[1] - eph.vega[1],
      cam.posKly[2] - eph.vega[2]
    );
    const dBetelgeuseKly = Math.hypot(
      cam.posKly[0] - eph.betelgeuse[0],
      cam.posKly[1] - eph.betelgeuse[1],
      cam.posKly[2] - eph.betelgeuse[2]
    );

    if (dSiriusKly < 0.0025) {
      runLocalPass = true;
      setStarSlot(0, eph.sirius_a, 1.711,   9940.0,  7.0, 1.0,             25.4);
      setStarSlot(1, eph.sirius_b, 0.00840, 25200.0, 7.5, state.accretion,  2.2);
      setStarSlot(2, eph.sun,      1.0000,  5772.0,  0.0, 1.0,              1.0);
    } else if (dVegaKly < 0.0055) {
      runLocalPass = true;
      setStarSlot(0, eph.vega, 2.726,  9602.0, 8.0, 1.0, 40.1);
      setStarSlot(1, eph.sun,  1.0000, 5772.0, 0.0, 1.0,  1.0);
    } else if (dBetelgeuseKly < 0.06) {
      runLocalPass = true;
      setStarSlot(0, eph.betelgeuse, 764.0, 3600.0, 6.0, state.accretion, 95.0);
    }

    // --- 3) In renderScene() Pass 2B (progOrbit) — Dual Keplerian Orbit Loops for Sirius A & Sirius B: ---
    const dSiriusAU = dSiriusKly / AU_IN_KLY;
    if (dSiriusAU < 4500.0) {
      const sirCloseFade = (cam.anchorId === 'sirius_b')
        ? smoothstepJS(0.06 * RSUN_IN_KLY, 0.25 * RSUN_IN_KLY, cam.distKly)
        : smoothstepJS(2.0 * RSUN_IN_KLY, 3.8 * RSUN_IN_KLY, cam.distKly);
      const sirFade = (1.0 - smoothstepJS(900.0, 4500.0, dSiriusAU)) * sirCloseFade;
      if (sirFade > 0.01) {
        gl.uniform3f(
          uOrb.uParentRelCamAU,
          (eph.sirius[0] - cam.posKly[0]) / AU_IN_KLY,
          (eph.sirius[1] - cam.posKly[1]) / AU_IN_KLY,
          (eph.sirius[2] - cam.posKly[2]) / AU_IN_KLY
        );
        for (const item of [orbitMeshes.siriusA, orbitMeshes.siriusB]) {
          gl.uniform4f(uOrb.uOrbitColor, item.color[0], item.color[1], item.color[2], item.color[3] * sirFade);
          gl.bindVertexArray(item.mesh.vao);
          gl.drawArrays(gl.LINE_LOOP, 0, item.mesh.count);
        }
      }
    }
`;

// ============================================================================
// 2. GLSL PASS 2 SHADERS (`MW_STARS_GLSL`)
// Strict GLSL ES 3.00 / ANGLE D3D11 Safety:
//   - Every pow(x, y) guarded as pow(max(x, 0.0), y) or pow(clamp(...), y)
//   - Zero inverted smoothstep(edge0, edge1, x) (always edge0 < edge1 or sstepInv(hi, lo, x))
//   - Pre-ACES photosphere peak <= 2.35 with chroma-preserving RGB so pure-white == 0.00%!
// ============================================================================

// 2A. Patch for LOCAL_COMMON_GLSL (lines 3276-3302 of milky_way.html):
// Define VEGA_SPIN_AXIS & BETEL_DIMMING_DIR in LOCAL_COMMON_GLSL and upgrade findClosestLocalHit
// with the 3-line oblate intersection when abs(uStarMeta[i].y - 8.0) < 0.3!
export const MW_STARS_LOCAL_COMMON_PATCH_GLSL = `
    // Exact unit spin axis of rapid rotator Vega (5.70 deg from Vega-Sun LOS; R_eq=2.726 R_sun, R_pol=2.262 R_sun, f=0.1702)
    const vec3 VEGA_SPIN_AXIS    = vec3(-0.347767, 0.421621, 0.837433);
    // 2019-2020 Betelgeuse "Great Dimming" Southern-Western silicate mass-ejection axis (Montarges et al. 2021 VLT/SPHERE)
    const vec3 BETEL_DIMMING_DIR = vec3(0.684042, -0.703711, -0.192032);

    // Inside findClosestLocalHit(vec3 rd, out float bestT, out int hitKind, out int hitIdx),
    // replace \`vec2 ts = raySphere(uStarPosRad[i].xyz, rad, rd);\` with:
          vec2 ts = (abs(uStarMeta[i].y - 8.0) < 0.3)
            ? rayOblateSpheroid(uStarPosRad[i].xyz, rad, VEGA_SPIN_AXIS, 0.1702, rd)
            : raySphere(uStarPosRad[i].xyz, rad, rd);
`;

// 2B. Helper + shadeStarSurface branches + oblate normal patch for LOCAL_TERR_EXO_FRAG:
// Place mw_evalSupergiantPlumes right above shadeStarSurface() (hash33 is already in LOCAL_CRATER_GLSL),
// add the `style` branches inside shadeStarSurface(), and apply the 3-line oblate normal patch in main()!
export const MW_STARS_SHADE_SURFACE_GLSL = `
    // 3D Domain-Warped Cellular Super-Granulation for Red Supergiant Betelgeuse (Schwarzschild 1975 / CO5BOLD 3D RHD):
    // Low frequency (freq ~ 1.58) resolves ONLY 4-6 colossal boiling convective super-plumes across the hemisphere!
    // Returns vec3(plumeDome [0..1], tiODowndraftLane [0..1], cellHotspotId [0..1]).
    vec3 mw_evalSupergiantPlumes(vec3 pUnit, float animT) {
      vec4 wTex = textureLod(uNoise3D, pUnit * 0.68 + vec3(0.17, animT * 0.014, -0.23), 0.0);
      vec3 q = (pUnit + (wTex.rgb - 0.5) * 0.42) * 1.58 + vec3(0.0, -animT * 0.018, 0.0);
      vec3 cell0 = floor(q);
      vec3 f = q - cell0;
      vec3 stepDir = vec3(f.x < 0.5 ? -1.0 : 1.0, f.y < 0.5 ? -1.0 : 1.0, f.z < 0.5 ? -1.0 : 1.0);

      float d1 = 8.0;
      float d2 = 8.0;
      float hotId = 0.5;
      for (int ix = 0; ix < 2; ix++) {
        for (int iy = 0; iy < 2; iy++) {
          for (int iz = 0; iz < 2; iz++) {
            vec3 off = vec3(float(ix), float(iy), float(iz)) * stepDir;
            vec3 rnd = hash33(cell0 + off);
            vec3 jitter = 0.5 + 0.36 * sin(rnd * 6.2831853 + animT * 0.16);
            vec3 cPos = off + 0.16 + 0.68 * jitter;
            float dist = length(f - cPos);
            if (dist < d1) {
              d2 = d1;
              d1 = dist;
              hotId = fract(rnd.x * 3.71 + rnd.z * 5.13);
            } else if (dist < d2) {
              d2 = dist;
            }
          }
        }
      }
      float border = clamp(d2 - d1, 0.0, 1.0);
      float dome = smoothstep(0.04, 0.44, border) * sstepInv(0.76, 0.12, d1);
      float lane = sstepInv(0.22, 0.02, border);
      return vec3(dome, lane, hotId);
    }

    // --- Insert inside shadeStarSurface(...) BEFORE \`else if (style > 4.5 && style < 5.5)\` (or as top branches): ---
      if (abs(style - 6.0) < 0.3) {
        // === BETELGEUSE (alpha Orionis, M1-M2 Ia-ab Red Supergiant: R = 764 R_sun = 3.553 AU, T_eff = 3,600 K) ===
        // 4-6 colossal boiling Schwarzschild/VLTI convective super-plumes (~4,150 K molten amber-gold upwellings)
        // bounded by deep cherry-crimson TiO molecular absorption downdraft lanes (~3,050 K) + extended fuzzy limb!
        float rotA = animT * 0.012;
        vec3 pRot = vec3(rot2D(nrm.xz, rotA), nrm.y).xzy;

        vec3 sgCell = mw_evalSupergiantPlumes(pRot, animT);
        vec4 nMeso  = textureLod(uNoise3D, pRot * 3.65 + vec3(animT * 0.024, -animT * 0.019, 0.11), 0.0);
        vec4 nBoil  = textureLod(uNoise3D, pRot * 9.20 - vec3(0.0, animT * 0.036, animT * 0.022), 0.0);

        float mesoPlume = smoothstep(0.24, 0.80, nMeso.g * 0.64 + nBoil.r * 0.36);
        float hotSpot   = smoothstep(0.56, 0.90, sgCell.z) * sgCell.x; // 1-2 vigorous VLTI upwelling super-hotspots!
        float plumeHeat = clamp(sgCell.x * (0.62 + 0.38 * mesoPlume) + hotSpot * 0.34, 0.0, 1.0);
        float tioDark   = clamp(sgCell.y * 0.82 + sstepInv(0.38, 0.14, nMeso.r * 0.65 + nBoil.b * 0.35) * 0.48, 0.0, 1.0);
        float shockRim  = pow(clamp(nMeso.b * 0.58 + nBoil.g * 0.52, 0.0, 1.0), 3.4) * sgCell.x * clamp(flareBoost, 0.7, 1.25);

        // Calibrated zero-blowout HDR palette (peak <= 2.15, B <= 0.26 -> molten gold to deep cherry-crimson, 0% white!)
        vec3 tioCrimson   = vec3(0.48, 0.070, 0.030); // ~3,050 K TiO molecular downdraft sink lanes
        vec3 rsgVermilion = vec3(1.34, 0.390, 0.085); // ~3,600 K mean supergiant convective envelope
        vec3 amberPlume   = vec3(1.95, 0.880, 0.260); // ~4,150 K upwelling convective super-plume peaks

        vec3 convCol = mix(rsgVermilion, amberPlume, smoothstep(0.22, 0.92, plumeHeat + shockRim * 0.28));
        convCol      = mix(convCol, tioCrimson, tioDark * 0.88);

        // Extended red-supergiant H2O/TiO/AlO fuzzy MOLsphere limb roll-off + warm ruby chromospheric rim
        float fuzzyLimb = 0.16 + 0.84 * pow(max(mu, 0.0), 0.86);
        float molRim    = pow(max(1.0 - mu, 0.0), 2.85) * 0.62;
        starOut = convCol * fuzzyLimb * (0.90 + 0.18 * mesoPlume) + vec3(1.08, 0.22, 0.06) * molRim;

      } else if (abs(style - 7.0) < 0.25) {
        // === SIRIUS A (alpha Canis Majoris A, A0mA1 Va: R = 1.711 R_sun, T_eff = 9,940 K, L = 25.4 L_sun) ===
        // Crisp diamond-sapphire radiative envelope -> deep royal cobalt-blue Balmer limb darkening + micro-shimmer!
        float rotA = animT * 0.075;
        vec3 pRot = vec3(rot2D(nrm.xz, rotA), nrm.y).xzy;
        vec4 nRad1 = textureLod(uNoise3D, pRot * 6.8 + vec3(animT * 0.028, 0.19, -animT * 0.022), 0.0);
        vec4 nRad2 = textureLod(uNoise3D, pRot * 19.5 - vec3(animT * 0.045, 0.0, 0.31), 0.0);

        float microShimmer = smoothstep(0.24, 0.82, nRad1.g * 0.58 + nRad2.r * 0.42);
        float acousticWave = 0.5 + 0.5 * sin(pRot.y * 18.0 + nRad1.a * 4.2 + animT * 0.35);
        float limbPow      = pow(max(mu, 0.0), 0.62);

        vec3 coreDiamond = vec3(0.62, 0.82, 1.85); // Peak B <= 2.02 -> dazzling diamond-sapphire, zero white clip!
        vec3 cobaltLimb  = vec3(0.15, 0.35, 1.06); // Deep cobalt-sapphire radiative limb darkening
        vec3 photoA      = mix(cobaltLimb, coreDiamond, limbPow) * (0.91 + 0.15 * microShimmer + 0.05 * acousticWave);
        float balmerRim  = pow(max(1.0 - mu, 0.0), 3.6) * 0.52;
        starOut = photoA + vec3(0.26, 0.56, 1.38) * balmerRim;

      } else if (abs(style - 7.5) < 0.25) {
        // === SIRIUS B ("The Pup" 白矮星, Degenerate Carbon-Oxygen DA2 White Dwarf: R = 5,844 km, T_eff = 25,200 K, log g = 8.57) ===
        // Ultra-compact pure-H Stark-broadened photosphere + high-gravity indigo limb + subtle crystalline dipole polar glow!
        float rotA = animT * 0.16;
        vec3 pRot = vec3(rot2D(nrm.xz, rotA), nrm.y).xzy;
        vec4 nGmode = textureLod(uNoise3D, pRot * 8.4 + vec3(0.0, animT * 0.065, 0.27), 0.0);
        vec4 nCryst = textureLod(uNoise3D, pRot * 22.0 - vec3(animT * 0.085, 0.13, 0.0), 0.0);

        vec3 wdMagAxis   = normalize(vec3(0.22, 0.95, -0.22));
        float magPole    = pow(clamp(abs(dot(nrm, wdMagAxis)), 0.0, 1.0), 3.4);
        float gModePulse = smoothstep(0.28, 0.78, nGmode.r * 0.55 + nCryst.g * 0.45);
        float starkLimb  = pow(max(mu, 0.0), 0.56);

        vec3 uvSapphire  = vec3(0.42, 0.68, 2.15); // 25,200 K electric UV-sapphire core (pre-ACES <= 2.32, zero white clip!)
        vec3 starkIndigo = vec3(0.11, 0.22, 1.16); // High-gravity Stark-broadened deep indigo-violet limb
        vec3 wdPhoto     = mix(starkIndigo, uvSapphire, starkLimb) * (0.90 + 0.13 * gModePulse);
        wdPhoto         += vec3(0.20, 0.52, 1.15) * magPole * (0.14 + 0.08 * sin(animT * 0.9 + nGmode.b * 4.0));
        float degenRim   = pow(max(1.0 - mu, 0.0), 3.8) * 0.68;
        starOut = wdPhoto + vec3(0.30, 0.58, 1.62) * degenRim;

      } else if (abs(style - 8.0) < 0.3) {
        // === VEGA (alpha Lyrae, Rapidly Rotating Oblate A0V Star: P_rot = 12.5 hr, R_eq = 2.726 R_sun, R_pol = 2.262 R_sun, f = 0.1702) ===
        // Exact von Zeipel Gravity Darkening: T_pol = 10,020 K brilliant icy-white/sapphire pole -> T_eq = 7,900 K darker sapphire-periwinkle waist!
        vec3 eqX = normalize(cross(VEGA_SPIN_AXIS, vec3(0.0, 1.0, 0.0)));
        vec3 eqZ = cross(eqX, VEGA_SPIN_AXIS);
        float lx = dot(nrm, eqX);
        float ly = dot(nrm, VEGA_SPIN_AXIS);
        float lz = dot(nrm, eqZ);

        // Fast 12.5-hr zonal differential rotation (v_eq = 236 km/s) strictly aligned with VEGA_SPIN_AXIS!
        float cosPol = clamp(abs(ly), 0.0, 1.0);
        float sinPol = sqrt(max(0.0, 1.0 - cosPol * cosPol));
        float zonalSpin = animT * (0.26 + 0.09 * sinPol * sinPol);
        vec2 xzSpin = rot2D(vec2(lx, lz), zonalSpin);
        vec3 vSpinCoord = vec3(xzSpin.x * 1.35, ly * 4.8, xzSpin.y * 1.35);

        vec4 nZon1 = textureLod(uNoise3D, vSpinCoord * 1.75 + vec3(0.13, 0.29, -0.17), 0.0);
        vec4 nZon2 = textureLod(uNoise3D, vSpinCoord * 5.20 + nZon1.a * 0.24, 0.0);
        float shearBands = 0.5 + 0.5 * cos(ly * 26.0 + nZon1.r * 2.4 + nZon2.g * 1.2);
        float fineBoil   = smoothstep(0.25, 0.80, nZon1.g * 0.55 + nZon2.b * 0.45);

        // von Zeipel Theorem: T_eff(theta) ~ g_eff^0.25 -> smooth latitude gradient from 7,900 K equator to 10,020 K poles
        float vzGrad = pow(max(cosPol, 0.0), 1.52);
        vec3 eqPeriwinkle = vec3(0.24, 0.42, 0.96); // 7,900 K gravity-darkened equatorial bulge
        vec3 midAzure     = vec3(0.48, 0.69, 1.54); // ~8,950 K mid-latitude radiative zone
        vec3 poleIcyWhite = vec3(0.80, 0.93, 2.14); // 10,020 K brilliant hot polar crown (pre-ACES <= 2.30, zero white clip!)

        vec3 vzBase = (vzGrad < 0.5)
          ? mix(eqPeriwinkle, midAzure, vzGrad * 2.0)
          : mix(midAzure, poleIcyWhite, (vzGrad - 0.5) * 2.0);
        float zonalMod = mix(0.88 + 0.20 * shearBands, 0.96 + 0.08 * fineBoil, vzGrad);
        float limb     = 0.26 + 0.74 * pow(max(mu, 0.0), 0.60);
        float vegaRim  = pow(max(1.0 - mu, 0.0), 3.5) * mix(0.32, 0.54, vzGrad);
        starOut = vzBase * zonalMod * limb + vec3(0.28, 0.54, 1.32) * vegaRim;
      }

    // --- In LOCAL_TERR_EXO_FRAG main() (lines 4715-4718 of milky_way.html), replace hitKind == 1 block with: ---
      if (hitKind == 1) {
        float stStyle = uStarMeta[hitIdx].y;
        vec3 relStar  = rd * bestT - uStarPosRad[hitIdx].xyz;
        vec3 nrm = (abs(stStyle - 8.0) < 0.3)
          ? evalOblateGeodeticNormal(relStar, VEGA_SPIN_AXIS, 0.1702)
          : normalize(relStar);
        outRgb = shadeStarSurface(nrm, -rd, uStarMeta[hitIdx].x, stStyle, uStarAnimTime, uStarMeta[hitIdx].z);
      }
`;

// 2C. Circumstellar Coronas, Betelgeuse Great Dimming Silicate Veil, Sirius B Beacon & Vega 85-145 AU Debris Belt
// for LOCAL_GIANTS_OVERLAYS_FRAG!
export const MW_STARS_CORONA_AND_OVERLAYS_GLSL = `
    // --- 1. Inside evalStellarCorona(...) in LOCAL_GIANTS_OVERLAYS_FRAG: ---
    // a) Update b & coronaMaxR (lines 5619-5621) so Oblate Vega's corona conforms to f = 0.1702 (zero polar gap!)
    //    and styles 6.0 / 7.0 / 7.5 / 8.0 get exact physical coronal radii:
        vec3 pCor = (abs(style - 8.0) < 0.3)
          ? (pCl + VEGA_SPIN_AXIS * dot(pCl, VEGA_SPIN_AXIS) * 0.20511)
          : pCl;
        float b = length(pCor);
        float coronaMaxR = (style > 4.5 && style < 5.5) ? (starR * 11.2)
          : ((abs(style - 6.0) < 0.3) ? (starR * 4.85)
          : ((abs(style - 7.5) < 0.25) ? (starR * 5.5)
          : ((abs(style - 7.0) < 0.25 || abs(style - 8.0) < 0.3) ? (starR * 4.8)
          : ((style > 3.5) ? (starR * 9.5) : ((style > 2.5) ? (starR * 6.2) : (starR * 4.4))))));

    // b) Add branches inside \`if (b >= starR && b < coronaMaxR && tCl <= maxT + starR)\` in evalStellarCorona:
          if (abs(style - 6.0) < 0.3) {
            // Betelgeuse 2019-2020 "Great Dimming" Asymmetric Southern-Western Silicate Dust Plume & Mass-Loss Shells (1.0 - 4.8 R_*)
            float alignSW = dot(dirCl, BETEL_DIMMING_DIR);
            float swCone  = smoothstep(-0.18, 0.72, alignSW);
            vec3 dCoord   = dirCl * 2.45 - BETEL_DIMMING_DIR * (xNorm * 0.52 - animT * 0.025);
            vec4 nDustA   = textureLod(uNoise3D, dCoord, 0.0);
            vec4 nDustB   = textureLod(uNoise3D, dCoord * 2.7 + nDustA.a * 0.32, 0.0);
            float clump   = smoothstep(0.22, 0.84, nDustA.g * 0.58 + nDustB.r * 0.42);

            // Concentric episodic red-supergiant mass-loss arcs (Kervella et al. VLT/SPHERE & ALMA) + dense SW silicate plume (1.15 - 4.5 R_*)
            float shellWaves = 0.55 + 0.45 * sin((xNorm - 1.0) * 4.6 - animT * 0.12 + nDustA.r * 2.8);
            float plumeRad   = exp(-sqr((xNorm - 1.85) / 1.35)) * sstepInv(4.80, 3.35, xNorm) +
                               0.55 * exp(-(xNorm - 1.0) * 1.45);
            float molAtmo    = exp(-(xNorm - 1.0) * 3.2) * (0.65 + 0.55 * nLoop.g);

            vec3 chromoRuby  = vec3(1.05, 0.24, 0.07) * molAtmo * 0.62;
            vec3 silicateCol = mix(vec3(0.68, 0.17, 0.06), vec3(1.14, 0.44, 0.14), clump * shellWaves);
            vec3 swDustGlow  = silicateCol * swCone * plumeRad * (0.42 + 0.88 * clump) * 0.72 * clamp(flareBoost, 0.7, 1.3);
            vec3 haloShell   = vec3(0.72, 0.20, 0.07) * pow(max(xNorm, 1.0), -3.1) * shellWaves * clump * 0.22 * sstepInv(4.80, 3.60, xNorm);
            res = chromoRuby + swDustGlow + haloShell;

          } else if (abs(style - 7.0) < 0.25) {
            // Sirius A: Crisp diamond-sapphire radiative A0V corona
            vec3 sirACor = mix(vec3(0.28, 0.58, 1.38), vec3(0.56, 0.78, 1.55), nLoop.b * 0.5) *
                           (exp(-(xNorm - 1.0) * 3.1) * 0.68 + pow(max(xNorm, 1.0), -3.8) * 0.24) * streamer;
            res = sirACor;

          } else if (abs(style - 7.5) < 0.25) {
            // Sirius B White Dwarf (5,844 km, log g = 8.57): Compact UV-sapphire corona (corMult=5.5) + 1.0-2.4 R_B gravitational-deflection shimmer!
            float gravHaloRing = exp(-sqr((xNorm - 1.34) / 0.26)) * (0.72 + 0.28 * sin(xNorm * 14.0 - animT * 1.4 + nFine.r * 3.5));
            float innerDeflect = sstepInv(2.40, 1.02, xNorm) * exp(-(xNorm - 1.0) * 1.65) * (0.65 + 0.55 * nFine.g);
            vec3 wdCor = vec3(0.30, 0.58, 1.68) * (exp(-(xNorm - 1.0) * 3.3) * 0.74 + pow(max(xNorm, 1.0), -4.0) * 0.22) * streamer;
            vec3 wdLensShimmer = mix(vec3(0.26, 0.52, 1.75), vec3(0.58, 0.80, 1.95), gravHaloRing) *
                                 (gravHaloRing * 0.38 + innerDeflect * 0.26);
            res = wdCor + wdLensShimmer;

          } else if (abs(style - 8.0) < 0.3) {
            // Oblate Vega: Polar-brightened radiative wind matching von Zeipel 10,020 K poles vs 7,900 K equatorial waist
            vec3 dirObl  = normalize(pCor + 1e-8);
            float cosPV  = clamp(abs(dot(dirObl, VEGA_SPIN_AXIS)), 0.0, 1.0);
            vec3 vCorHue = mix(vec3(0.22, 0.44, 1.12), vec3(0.54, 0.78, 1.62), pow(max(cosPV, 0.0), 1.4));
            float pBoost = mix(0.72, 1.24, cosPV * cosPV);
            res = vCorHue * (exp(-(xNorm - 1.0) * 3.0) * 0.66 + pow(max(xNorm, 1.0), -3.7) * 0.24) * streamer * pBoost;
          }

    // --- 2. Inside LOCAL_GIANTS_OVERLAYS_FRAG main() \`anyNear\` star loop (lines 6107-6120): ---
        for (int i = 0; i < 4; i++) {
          float rad = uStarPosRad[i].w;
          if (rad > 0.0) {
            vec3 c = uStarPosRad[i].xyz;
            float dist2 = dot(c, c);
            float tP = dot(c, rd);
            float stStyle = uStarMeta[i].y;
            if (tP > 0.0) {
              float perp2 = max(0.0, dist2 - tP * tP);
              float corMult = (stStyle > 4.5 && stStyle < 5.5) ? 11.4
                : ((abs(stStyle - 6.0) < 0.3) ? 5.1
                : ((abs(stStyle - 7.5) < 0.25) ? 5.8
                : ((abs(stStyle - 7.0) < 0.25 || abs(stStyle - 8.0) < 0.3) ? 5.2
                : ((stStyle > 3.5) ? 9.8 : ((stStyle > 2.5) ? 6.4 : 4.5)))));
              float maxReach = max(rad * corMult, sqrt(dist2) * 0.052 * uTanHalfFov);
              if (perp2 < maxReach * maxReach) anyNear = true;
            }
            // Keep Vega's 85-145 AU (6,700-11,450 R_eq) Debris Belt active when camera is at 18-620 AU!
            if (abs(stStyle - 8.0) < 0.3) {
              float dVegaAU = sqrt(dist2) * 0.00465047;
              if (dVegaAU > 18.0 && dVegaAU < 620.0) {
                if (dVegaAU < 185.0) {
                  anyNear = true;
                } else if (tP > 0.0 && max(0.0, dist2 - tP * tP) < sqr(rad * 14200.0)) {
                  anyNear = true;
                }
              }
            }
          }
        }

    // --- 3. Inside LOCAL_GIANTS_OVERLAYS_FRAG main() right BEFORE Section 4 (Stellar Coronas): ---
      // 3B. Betelgeuse 2019-2020 "Great Dimming" Foreground Beer-Lambert Silicate Dust Extinction over SW Photosphere!
      if (hitKind == 1 && abs(uStarMeta[hitIdx].y - 6.0) < 0.3) {
        vec3 cBet    = uStarPosRad[hitIdx].xyz;
        float rBet   = uStarPosRad[hitIdx].w;
        vec3 hitNrm  = normalize(rd * bestT - cBet);
        float muBet  = clamp(dot(hitNrm, -rd), 0.0, 1.0);
        float swProj = dot(hitNrm, BETEL_DIMMING_DIR);
        if (swProj > -0.08) {
          vec3 veilP   = hitNrm * 2.55 - BETEL_DIMMING_DIR * 0.35 + vec3(0.0, uStarAnimTime * 0.022, 0.0);
          vec4 vNoise1 = textureLod(uNoise3D, veilP, 0.0);
          vec4 vNoise2 = textureLod(uNoise3D, veilP * 2.85 + vNoise1.a * 0.34, 0.0);
          float sootClump = smoothstep(0.20, 0.80, vNoise1.g * 0.60 + vNoise2.r * 0.40);
          float swMask    = smoothstep(-0.05, 0.58, swProj + (vNoise1.r - 0.5) * 0.28);
          float tauSilicate = swMask * (0.35 + 1.55 * sootClump) * clamp(uStarMeta[hitIdx].z, 0.7, 1.3);
          float dustVeilAlpha = clamp(1.0 - exp(-tauSilicate), 0.0, 0.82);

          // Warm backlit copper-rust / crimson silicate scattering along clump rims + Beer-Lambert photosphere attenuation!
          float rimScatter = pow(max(1.0 - muBet, 0.0), 1.45) * 0.65 + (1.0 - dustVeilAlpha) * 0.45;
          vec3 copperSoot  = mix(vec3(0.22, 0.042, 0.015), vec3(0.66, 0.165, 0.048), sootClump * rimScatter);
          outRgb      += copperSoot * dustVeilAlpha;
          opaqueAlpha  = max(opaqueAlpha, dustVeilAlpha);
        }
      }

      // 3C. Vega 1:1 JWST/ALMA Smooth Icy Kuiper-Analog Debris Belt (85-145 AU = 6,705-11,438 R_eq, viewed at 20-600 AU)
      for (int i = 0; i < 4; i++) {
        float radV = uStarPosRad[i].w;
        if (radV > 0.0 && abs(uStarMeta[i].y - 8.0) < 0.3) {
          vec3 cV = uStarPosRad[i].xyz;
          float dCamAU = length(cV) * 0.00465047;
          float beltRangeFade = smoothstep(18.0, 48.0, dCamAU) * sstepInv(620.0, 380.0, dCamAU);
          float denomV = dot(rd, VEGA_SPIN_AXIS);
          if (beltRangeFade > 0.001 && abs(denomV) > 1e-4) {
            float tBelt = dot(cV, VEGA_SPIN_AXIS) / denomV;
            if (tBelt > 0.0 && tBelt < bestT) {
              vec3 relBelt  = rd * tBelt - cV;
              float rNormEq = length(relBelt) / radV; // 85 AU = 6,705 R_eq, 145 AU = 11,438 R_eq
              if (rNormEq > 5200.0 && rNormEq < 14200.0) {
                float innerEdge = smoothstep(5600.0, 6850.0, rNormEq);
                float outerEdge = sstepInv(13800.0, 11100.0, rNormEq);
                vec3 eqDir = normalize(relBelt + 1e-5);
                float fineIce = textureLod(uNoise3D, vec3(rNormEq * 0.00055, eqDir.x * 1.4, eqDir.z * 1.4), 0.0).g;
                // JWST 2024 (Su et al.): remarkably smooth collisionally-ground icy disk without giant planet gaps!
                float smoothWave = 0.86 + 0.14 * fineIce + 0.06 * sin((rNormEq - 6700.0) * 0.0032);
                float tauBelt = innerEdge * outerEdge * smoothWave * 0.14;
                float slant   = min(2.5, 1.0 / max(abs(denomV), 0.18));
                float bAlpha  = clamp(1.0 - exp(-tauBelt * slant), 0.0, 0.58) * beltRangeFade;
                vec3 icyHue   = mix(vec3(0.46, 0.66, 1.08), vec3(0.30, 0.48, 0.88), smoothstep(6700.0, 12200.0, rNormEq));
                outRgb       += icyHue * bAlpha * 0.85;
                if (!hitEarlierOpaque) opaqueAlpha = max(opaqueAlpha, bAlpha * 0.55);
              }
            }
          }
        }
      }

    // --- 4. Inside Section 4 unresolved optical star glare loop (lines 6330-6348): ---
    // Upgrade unresolved PSF for Sirius B (style == 7.5) & Sirius A (style == 7.0) so "The Pup" gleams as a crisp,
    // unmistakable electric-sapphire companion beacon beside Sirius A (~20-26 AU away) with zero white blowout!
              if (unresolvedFade > 0.001 && ang < 0.052) {
                float stStyle = uStarMeta[i].y;
                float corePsf = exp(-ang * ang * 52000.0) * 5.2;
                float wingPsf = exp(-ang * 155.0) * 0.78;
                float dx = abs(dot(normalize(pCl + 1e-9), uCamBasis[0])) * ang;
                float dy = abs(dot(normalize(pCl + 1e-9), uCamBasis[1])) * ang;
                float spikes = (exp(-dy * 1900.0) * exp(-dx * 95.0) + exp(-dx * 1900.0) * exp(-dy * 95.0)) * 0.88;
                if (abs(stStyle - 7.5) < 0.25) {
                  // Sirius B ("The Pup") crisp ultraviolet-sapphire companion point-beacon at ~20-26 AU!
                  float pupCore   = exp(-ang * ang * 44000.0) * 2.35;
                  float pupHalo   = exp(-ang * 185.0) * 0.62;
                  float pupSpikes = (exp(-dy * 2100.0) * exp(-dx * 115.0) + exp(-dx * 2100.0) * exp(-dy * 115.0)) * 0.95;
                  float pupIrrad  = clamp(1.35 / (1.0 + dLy * dLy * 0.04), 0.001, 1.45);
                  outRgb += vec3(0.30, 0.58, 1.85) * (pupCore + pupHalo + pupSpikes) * pupIrrad * unresolvedFade;
                } else if (abs(stStyle - 7.0) < 0.25) {
                  // Sirius A dazzling diamond-sapphire sky beacon when viewed from Sirius B (~26 AU away), chroma-preserved!
                  float sirCore   = exp(-ang * ang * 9000.0) * 2.15;
                  float sirHalo   = exp(-ang * 62.0) * 0.95;
                  float sirSpikes = (exp(-dy * 1500.0) * exp(-dx * 38.0) + exp(-dx * 1500.0) * exp(-dy * 38.0)) * 1.50;
                  float sirIrrad  = clamp(1.65 / (1.0 + dLy * dLy * 0.015), 0.001, 1.75);
                  vec3 sirRaw     = vec3(0.42, 0.68, 1.72) * (sirCore + sirHalo + sirSpikes) * sirIrrad * unresolvedFade;
                  float sirPk     = max(sirRaw.r, max(sirRaw.g, sirRaw.b));
                  if (sirPk > 1.35) {
                    float sirEx = sirPk - 1.35;
                    sirRaw *= (1.35 + 0.85 * (sirEx / (sirEx + 0.85))) / sirPk;
                  }
                  outRgb += sirRaw;
                } else {
                  outRgb += kelvinToRgb(uStarMeta[i].x) * (corePsf + wingPsf + spikes) * irrad * unresolvedFade;
                }
              }
`;

export const MW_STARS_GLSL = [
  MW_STARS_LOCAL_COMMON_PATCH_GLSL,
  MW_STARS_SHADE_SURFACE_GLSL,
  MW_STARS_CORONA_AND_OVERLAYS_GLSL
].join('\n');

// ============================================================================
// 3. PRESETS, `getMinDistKly` & COLLISION-FREE 3D `LABELS` (`MW_STARS_PRESETS_LABELS_JS`)
// Ready-to-merge entries for getMinDistKly(), PRESETS, and LABELS in milky_way.html.
// ============================================================================
export const MW_STARS_PRESETS_LABELS_JS = `
  // --- 3A. getMinDistKly(anchorId) additions ---
  //   case 'betelgeuse': return 1180.0 * RSUN_IN_KLY;   // Safe 1.54 R_* outside 764 R_sun (3.55 AU) red supergiant!
  //   case 'sirius':     return 2.65 * RSUN_IN_KLY;
  //   case 'sirius_a':   return 2.65 * RSUN_IN_KLY;     // Safe 1.55 R_A outside 1.711 R_sun Sirius A!
  //   case 'sirius_b':   return 0.0145 * RSUN_IN_KLY;   // ~10,088 km (1.73 R_B) above 5,844 km White Dwarf Sirius B!
  //   case 'vega':       return 4.20 * RSUN_IN_KLY;     // Safe 1.54 R_eq outside 2.726 R_sun Oblate Vega!

  // --- 3B. Hero Camera PRESETS additions ---
  const MW_STARS_PRESETS = {
    betelgeuse: {
      title: '红超巨星参宿四 Betelgeuse / α Orionis (R=764 R☉ = 3.55 AU · 超越火星轨道的沸腾巨兽)：',
      desc: '参照 Joyce et al. (2020) 与 VLT/SPHERE 实测 1:1 复刻：整颗恒星半球仅由 4–6 个怪兽级沸腾对流超羽流统治，呈现 4,150 K 熔金上升流与 3,050 K 氧化钛深红下沉暗巷，以及 2019–2020“大变暗”西南硅酸盐尘埃云遮蔽！',
      anchorId: 'betelgeuse', anchorLabel: '红超巨星参宿四 (R=764 R☉ · 3.55 AU)',
      offsetKly: [0, 0, 0], yaw: 0.42, pitch: -0.14, distKly: 2150.0 * RSUN_IN_KLY, fov: 50
    },
    sirius: {
      title: '天狼星双星系统 Sirius A & 白矮星 Sirius B (距地 8.60 ly · 50.13 年偏心双星轨道)：',
      desc: '参照哈勃望远镜 Bond et al. (2017) 实测轨道 (a=19.80 AU, e=0.591)：前景闪耀 9,940 K 钻石蓝宝石主星天狼星 A (1.711 R☉)，右侧深空伴随双星开普勒轨道环与紫外蓝简并伴星“小狗星”天狼星 B！',
      anchorId: 'sirius_a', anchorLabel: '天狼星 A & B 双星系统 (8.60 ly)',
      offsetKly: [0, 0, 0], yaw: HERO_SIRIUS_ANG.yaw, pitch: HERO_SIRIUS_ANG.pitch, distKly: 6.2 * RSUN_IN_KLY, fov: 50
    },
    sirius_b: {
      title: '白矮星天狼星 B · "The Pup" (1.018 M☉ 压缩至地球大小 R=5,844 km · 25,200 K 简并星)：',
      desc: '潜入距简并表面仅 2.2 万公里：1.018 倍太阳质量坍缩进仅地球 91.6% 半径的碳氧简并核，表面重力达地球 35 万倍 (log g=8.57)，呈现斯塔克展宽电光蓝紫光球与引力偏折微晕，远景约 26 AU 外主星天狼星 A 璀璨夺目！',
      anchorId: 'sirius_b', anchorLabel: '白矮星天狼星 B (R=5,844 km · 25,200 K)',
      offsetKly: [0, 0, 0], yaw: HERO_SIRIUS_B_ANG.yaw, pitch: HERO_SIRIUS_B_ANG.pitch, distKly: 0.032 * RSUN_IN_KLY, fov: 48
    },
    vega: {
      title: '极速自转扁球星织女星 Vega / α Lyrae (周期 12.5h · 赤道扁率 17.0% · 冯·蔡佩尔重力昏暗)：',
      desc: '参照 CHARA 干涉阵与韦布望远镜 1:1 复刻：236 km/s 极速自转将赤道甩出 17% 显著隆起 (Req=2.726 R☉ vs Rpol=2.262 R☉)，完美印证冯·蔡佩尔定理——10,020 K 炽白蓝宝石极冠与 7,900 K 幽蓝赤道昏暗带鲜明对峙，外围环绕 85–145 AU 冰晶残骸盘！',
      anchorId: 'vega', anchorLabel: '极速扁球织女星 Vega (f=17% · 25.04 ly)',
      offsetKly: [0, 0, 0], yaw: HERO_VEGA_ANG.yaw, pitch: HERO_VEGA_ANG.pitch, distKly: 8.8 * RSUN_IN_KLY, fov: 46
    }
  };

  // --- 3C. Collision-Free 3D Astronomical LABELS additions ---
  // Auto-hides cleanly on close-up inspection; Sirius B label appears when viewing from Sirius A (~6.2 R_sun) for 1-click dive!
  const MW_STARS_LABELS = [
    { key: 'betelgeuse', name: '红超巨星参宿四 Betelgeuse', sub: '距地 548 ly · R=764 R☉ (3.55 AU) · 大变暗尘埃云', getPos: e => e.betelgeuse, color: '#fb923c', minKly: 4800.0 * RSUN_IN_KLY, maxKly: 38.0,   hideNearKly: 4800.0 * RSUN_IN_KLY, radiusKly: 820.0 * RSUN_IN_KLY },
    { key: 'sirius',     name: '天狼星 Sirius A & B',       sub: '距地 8.60 ly · 夜空最亮恒星与白矮伴星',          getPos: e => e.sirius_a,   color: '#60a5fa', minKly: 22.0 * RSUN_IN_KLY,   maxKly: 12.0,   hideNearKly: 22.0 * RSUN_IN_KLY,   radiusKly: 2.0 * RSUN_IN_KLY },
    { key: 'sirius_b',   name: '白矮星天狼星 B (The Pup)',  sub: '1.018 M☉ · R=5,844 km · 25,200 K 简并星',       getPos: e => e.sirius_b,   color: '#818cf8', minKly: 0.16 * RSUN_IN_KLY,   maxKly: 0.0008, hideNearKly: 0.16 * RSUN_IN_KLY,   radiusKly: 0.02 * RSUN_IN_KLY },
    { key: 'vega',       name: '织女星 Vega (α Lyrae)',     sub: '距地 25.04 ly · 12.5h 极速扁球星 (f=0.17)',      getPos: e => e.vega,       color: '#38bdf8', minKly: 28.0 * RSUN_IN_KLY,   maxKly: 18.0,   hideNearKly: 28.0 * RSUN_IN_KLY,   radiusKly: 3.0 * RSUN_IN_KLY }
  ];
`;
