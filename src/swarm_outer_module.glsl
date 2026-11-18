// ============================================================================
// SWARM OUTER SOLAR SYSTEM MODULE (swarm_outer_module.glsl)
// Author: @outer-worlds
// Target Shader: LOCAL_BODIES_FRAG in
//   C:\Users\Administrator\.gemini\antigravity\brain\c13a1843-7a2e-49cd-ba94-16fefaed64ef\milky_way.html
//
// EXACT DROP-IN REPLACEMENT RANGES IN milky_way.html:
//   - BLOCK 1 (Lines 1630-1713): evalRingProfile(float rNorm, float azim, float pType)
//       (Keep shared crater helpers hash33, evalCellularCraterLayer, evalCraterHeight at lines 1715-1759 intact.)
//   - BLOCK 2 (Lines 1761-1818): outer_ helpers + evalNamedCrater + evalLunarFeatures
//       (Placed immediately before evalEarthCartography at line 1820.)
//   - BLOCK 3 (Lines 2542-2978): } else if (pType < 7.5) { ... } else { /* Triton */ ... }
//       (All pType >= 6.5 branches inside shadePlanet(...): Jupiter 7, Saturn 8, Uranus 9,
//        Neptune 10, Moon 11, Pluto 12, Io 13, Europa 14, Ganymede 15, Callisto 16,
//        Enceladus 17, Titan 18, Triton 19, ending right before return vec4(surfCol + atmoCol, 1.0);.)
//
// GLSL ES 3.00 / ANGLE D3D11 & JS TEMPLATE LITERAL STRICTNESS:
//   - ZERO backticks or template interpolations anywhere in file (100% safe inside JS template string).
//   - ZERO pow(negative, y) calls: every pow(x, y) clamps/guards max(x, 0.0) or uses sqr/pow4.
//   - ZERO smoothstep(hi, lo, x) calls with hi >= lo: strictly edge0 < edge1, or sstepInv(hi, lo, x).
//   - ZERO atan(0.0, 0.0) singularities; ZERO dynamic/unbounded loops; 60 FPS GPU-lean texture taps.
// ============================================================================


// ============================================================================
// [BLOCK 1] REPLACES milky_way.html LINES 1630-1713
// ============================================================================
    // 1:1 Radial Optical Depth (x) & Albedo Shade (y) Profile for Ringed Planets
    // Calibrated to Cassini ISS/UVIS/RSS (Saturn), Voyager 2 / JWST (Uranus & Neptune), and Galileo/New Horizons (Jupiter)
    vec2 evalRingProfile(float rNorm, float azim, float pType) {
      if (pType > 7.5 && pType < 8.5) {
        // === SATURN RING SYSTEM (Cassini ISS/UVIS/RSS, R_S = 60,268 km: 1.110 to 2.345 R_S) ===
        if (rNorm < 1.110 || rNorm > 2.348) return vec2(0.0);

        float fine1 = textureLod(uNoise3D, vec3(rNorm * 24.0, 0.27, 0.51), 0.0).r;
        float fine2 = textureLod(uNoise3D, vec3(rNorm * 82.0, 0.73, 0.19), 0.0).g;
        float fine3 = textureLod(uNoise3D, vec3(rNorm * 195.0, 0.41, 0.83), 0.0).b;
        float densityWaves = 0.5 + 0.5 * sin(rNorm * 480.0 + fine1 * 3.8);
        float ringletMod = 0.78 + 0.28 * fine1 + 0.22 * fine2 * densityWaves + 0.10 * fine3;

        // D Ring (66,900 - 74,510 km -> 1.110 - 1.236 R_S) + discrete D68 (1.123), D72 (1.190), D73 (1.217) ringlets
        float dSheet = smoothstep(1.110, 1.148, rNorm) * sstepInv(1.238, 1.228, rNorm) * 0.015;
        float dRinglets = (exp(-sqr((rNorm - 1.123) / 0.0028)) * 0.65 +
                           exp(-sqr((rNorm - 1.190) / 0.0032)) * 0.90 +
                           exp(-sqr((rNorm - 1.217) / 0.0030)) * 1.00) * 0.018;
        float tauD = dSheet + dRinglets;

        // C ("Crepe") Ring (74,658 - 92,000 km -> 1.239 - 1.526 R_S, tau = 0.05..0.35)
        // Includes Colombo Gap (1.290) + eccentric Titan Ringlet (1.292), outer C plateaus, & Maxwell Gap (1.451) + Maxwell Ringlet (1.4525)
        float inC = smoothstep(1.237, 1.243, rNorm) * sstepInv(1.527, 1.521, rNorm);
        float colomboGap = 1.0 - 0.92 * exp(-pow4((rNorm - 1.2905) / 0.0046));
        float titanEcc   = 0.0004 * cos(azim - 0.6);
        float titanRl    = exp(-sqr((rNorm - (1.2920 + titanEcc)) / 0.0018)) * 0.30;
        float maxwellGap = 1.0 - 0.94 * exp(-pow4((rNorm - 1.4515) / 0.0052));
        float maxwellEcc = 0.0006 * cos(azim + 1.1);
        float maxwellRl  = exp(-sqr((rNorm - (1.4525 + maxwellEcc)) / 0.0020)) * 0.35;
        float bondDawes  = (1.0 - 0.72 * exp(-sqr((rNorm - 1.470) / 0.0022))) *
                           (1.0 - 0.75 * exp(-sqr((rNorm - 1.497) / 0.0022)));
        float cPlateaus  = smoothstep(0.54, 0.84, fine2) * 0.13 * smoothstep(1.385, 1.435, rNorm) * sstepInv(1.505, 1.485, rNorm);
        float tauC = inC * (0.078 + 0.058 * fine1 + cPlateaus) * colomboGap * maxwellGap * bondDawes + titanRl + maxwellRl;

        // B Ring (92,000 - 117,580 km -> 1.526 - 1.951 R_S, B1-B4 sub-zones + sharp 2:1 Mimas resonance outer edge + radial spokes)
        float mimasEdge = 1.951 + 0.0011 * cos(2.0 * azim);
        float inB = smoothstep(1.524, 1.530, rNorm) * sstepInv(mimasEdge + 0.002, mimasEdge - 0.003, rNorm);
        float b1Zone = 0.64 + 0.22 * sin(rNorm * 310.0 + fine1 * 2.5);
        float b2Zone = smoothstep(1.635, 1.660, rNorm) * sstepInv(1.735, 1.715, rNorm) * (0.28 + 0.22 * fine3);
        float b3Core = 0.72 * exp(-sqr((rNorm - 1.795) / 0.072));
        float b4Outer = smoothstep(1.855, 1.875, rNorm) * 0.36;
        float bProfile = b1Zone + b2Zone + b3Core + b4Outer;
        // Cassini electrostatic levitated dust spokes in central B ring (strongest near morning/anti-solar ansae)
        float spokeAz = textureLod(uNoise3D, vec3(cos(azim) * 2.6 + 0.31, sin(azim) * 2.6 + 0.17, rNorm * 2.2), 0.0).b;
        float spokeFine = textureLod(uNoise3D, vec3(cos(azim * 3.0) * 1.8, sin(azim * 3.0) * 1.8, rNorm * 1.4), 0.0).r;
        float ansaWeight = 0.45 + 0.55 * abs(sin(azim));
        float spokeMask = smoothstep(0.64, 0.86, spokeAz * 0.72 + spokeFine * 0.34) *
                          exp(-sqr((rNorm - 1.775) / 0.088)) * ansaWeight;
        float tauB = inB * 1.18 * bProfile * ringletMod * (1.0 - 0.11 * spokeMask);

        // Cassini Division (117,580 - 122,170 km -> 1.951 - 2.027 R_S) + Huygens Gap & Huygens Ringlet (1.956 R_S)
        float inCass = smoothstep(mimasEdge, mimasEdge + 0.004, rNorm) * sstepInv(2.028, 2.022, rNorm);
        float huygensGap = smoothstep(1.961, 1.965, rNorm); // Clears Huygens Gap interior (1.951 - 1.961)
        float huygensRl  = exp(-sqr((rNorm - 1.9562) / 0.0019)) * 0.27;
        float herschelLaplace = (1.0 - 0.80 * exp(-sqr((rNorm - 1.968) / 0.0022))) *
                                (1.0 - 0.82 * exp(-sqr((rNorm - 1.990) / 0.0024)));
        float cassRamp = smoothstep(1.982, 2.023, rNorm) * 0.082 + 0.022 * fine2;
        float tauCass = inCass * huygensGap * herschelLaplace * (0.020 + cassRamp) + huygensRl;

        // A Ring (122,170 - 136,775 km -> 2.027 - 2.270 R_S) + spiral density waves + Encke Gap (2.214) & Keeler Gap (2.264)
        float inA = smoothstep(2.025, 2.031, rNorm) * sstepInv(2.2715, 2.2675, rNorm);
        float enckeGap   = 1.0 - 0.985 * exp(-pow4((rNorm - 2.2140) / 0.0054));
        float panRinglet = exp(-sqr((rNorm - 2.2140) / 0.0011)) * 0.042;
        float panWakes   = 0.055 * sin(rNorm * 1450.0 - azim * 8.0) * exp(-sqr((rNorm - 2.2140) / 0.018));
        float keelerGap  = 1.0 - 0.965 * exp(-pow4((rNorm - 2.2635) / 0.0019));
        float aWaves = 0.46 + 0.13 * fine2 + 0.065 * sin(rNorm * 590.0 + fine1 * 2.0) + panWakes;
        float tauA = max(0.0, inA * aWaves * enckeGap * keelerGap) + panRinglet * inA;

        // F Ring (140,180 km -> 2.326 R_S, narrow multi-strand Prometheus/Pandora braided shepherd ring)
        float fBraid1 = 0.0020 * sin(azim * 5.0 + fine1 * 3.4);
        float fBraid2 = 0.0016 * cos(azim * 7.0 - fine2 * 3.1);
        float tauF = exp(-sqr((rNorm - 2.3260 + fBraid1) / 0.0036)) * 0.24 +
                     exp(-sqr((rNorm - 2.3272 + fBraid2) / 0.0028)) * 0.14;

        float tau = tauD + tauC + tauB + tauCass + tauA + tauF;
        float bShade = clamp(0.78 + 0.16 * fine1 + 0.08 * smoothstep(1.68, 1.84, rNorm) - 0.08 * spokeMask, 0.0, 1.0);
        float aShade = 0.60 + 0.09 * smoothstep(2.12, 2.26, rNorm) + 0.05 * fine3;
        float cShade = 0.13 + 0.10 * smoothstep(1.38, 1.50, rNorm);
        float rlShade = (titanRl + maxwellRl + huygensRl) * 0.52;
        float shade = (tauD * 0.24 + inC * cShade + rlShade + inB * bShade + inCass * 0.22 + inA * aShade + tauF * 2.15) /
                      max(0.001, tauD + inC + (titanRl + maxwellRl + huygensRl) + inB + inCass + inA + tauF * 2.5);
        return vec2(tau, clamp(shade, 0.0, 1.0));

      } else if (pType > 8.5 && pType < 9.5) {
        // === URANUS 9 NARROW MAIN RINGS + ZETA/LAMBDA DUST (Voyager 2 / Keck / JWST, R_U = 25,559 km: 1.48 - 2.05 R_U) ===
        if (rNorm < 1.46 || rNorm > 2.06) return vec2(0.0);
        // Inner Zeta (1986U2R) reddish-charcoal dust sheet (1.48 - 1.62 R_U)
        float rZeta = smoothstep(1.48, 1.54, rNorm) * sstepInv(1.635, 1.605, rNorm) * 0.014;
        // Inner narrow trio: Ring 6 (1.637), Ring 5 (1.652), Ring 4 (1.666)
        float r654 = (exp(-sqr((rNorm - 1.637) / 0.0038)) +
                      exp(-sqr((rNorm - 1.652) / 0.0038)) +
                      exp(-sqr((rNorm - 1.666) / 0.0040))) * 0.13;
        // Alpha (1.750) & Beta (1.786) slightly eccentric narrow rings
        float rAlpha = exp(-sqr((rNorm - (1.750 - 0.0014 * cos(azim + 0.5))) / 0.0042)) * 0.18;
        float rBeta  = exp(-sqr((rNorm - (1.786 - 0.0009 * cos(azim - 0.8))) / 0.0042)) * 0.17;
        // Eta (1.846), razor-sharp Gamma (1.863), Delta (1.890) + faint Lambda dust ringlet (1.957)
        float rEta    = exp(-sqr((rNorm - 1.846) / 0.0044)) * 0.15;
        float rGamma  = exp(-sqr((rNorm - 1.863) / 0.0034)) * 0.22;
        float rDelta  = exp(-sqr((rNorm - 1.890) / 0.0042)) * 0.21 +
                        smoothstep(1.874, 1.886, rNorm) * sstepInv(1.891, 1.888, rNorm) * 0.03;
        float rLambda = exp(-sqr((rNorm - 1.957) / 0.0045)) * 0.035;
        // Eccentric Epsilon Ring (51,149 km -> 2.001 R_U, e=0.00794): narrow & dense at periapsis, 5x wider at apoapsis!
        float epsCos   = cos(azim);
        float epsCent  = 2.001 - 0.0158 * epsCos;
        float epsWidth = 0.0085 - 0.0042 * epsCos;
        float epsTau   = 0.36 + 0.16 * epsCos;
        float rEps     = exp(-sqr((rNorm - epsCent) / max(0.0035, epsWidth))) * epsTau;

        float dustSheet = smoothstep(1.63, 1.67, rNorm) * sstepInv(2.02, 1.99, rNorm) * 0.015;
        float tauU = rZeta + r654 + rAlpha + rBeta + rEta + rGamma + rDelta + rLambda + rEps + dustSheet;
        float shadeU = clamp(0.46 + 0.24 * (rEps / max(0.02, tauU)), 0.0, 1.0);
        return vec2(tauU, shadeU);

      } else if (pType > 9.5 && pType < 10.5) {
        // === NEPTUNE RING SYSTEM & ADAMS ARCS (Voyager 2 / JWST, R_N = 24,764 km: Galle, Le Verrier, Lassell, Arago, Adams) ===
        if (rNorm < 1.63 || rNorm > 2.61) return vec2(0.0);
        float galle     = smoothstep(1.65, 1.685, rNorm) * sstepInv(1.77, 1.735, rNorm) * 0.013;
        float leVerrier = exp(-sqr((rNorm - 2.148) / 0.0052)) * 0.072;
        float lassell   = smoothstep(2.148, 2.165, rNorm) * sstepInv(2.395, 2.365, rNorm) * 0.010;
        float arago     = exp(-sqr((rNorm - 2.310) / 0.0055)) * 0.024;
        // Adams Ring (62,932 km -> 2.541 R_N) with the 4 discrete Galatea-confined arcs:
        // Courage (+13°), Liberté (+23°), Égalité 1/2 (+34°), and Fraternité (+47°, longest 10° arc)!
        float azDeg = degrees(azim);
        float arcCourage    = exp(-sqr(wrapDeg(azDeg - 13.0) / 2.8)) * 0.55;
        float arcLiberte    = exp(-sqr(wrapDeg(azDeg - 23.5) / 3.4)) * 0.85;
        float arcEgalite    = exp(-sqr(wrapDeg(azDeg - 34.5) / 4.2)) * 0.92;
        float arcFraternite = exp(-sqr(wrapDeg(azDeg - 47.5) / 5.8)) * 1.00;
        float arcClumps = clamp(arcCourage + arcLiberte + arcEgalite + arcFraternite, 0.0, 1.15);
        float adams = exp(-sqr((rNorm - 2.541) / 0.0058)) * (0.042 + 0.185 * arcClumps);
        return vec2(galle + leVerrier + lassell + arago + adams, clamp(0.42 + 0.42 * arcClumps, 0.0, 1.0));

      } else if (pType > 6.5 && pType < 7.5) {
        // === JUPITER HALO, MAIN RING (1.71 - 1.806 R_J) & AMALTHEA/THEBE GOSSAMER RINGS ===
        if (rNorm < 1.28 || rNorm > 2.48) return vec2(0.0);
        float haloRing  = smoothstep(1.30, 1.50, rNorm) * sstepInv(1.72, 1.70, rNorm) * 0.0085;
        float metisGap  = 1.0 - 0.35 * exp(-sqr((rNorm - 1.790) / 0.0045));
        float mainBright = 0.65 + 0.55 * smoothstep(1.76, 1.802, rNorm);
        float mainRing  = smoothstep(1.710, 1.732, rNorm) * sstepInv(1.812, 1.802, rNorm) * 0.024 * metisGap * mainBright;
        float gossamer  = smoothstep(1.805, 1.835, rNorm) * sstepInv(2.46, 2.22, rNorm) * 0.0045;
        return vec2(haloRing + mainRing + gossamer, 0.36);
      }
      return vec2(0.0);
    }


// ============================================================================
// [BLOCK 2] REPLACES milky_way.html LINES 1761-1818
// (Placed right after evalCraterHeight at line 1759 and before evalEarthCartography at line 1820)
// ============================================================================
    // Double-Ridge Cycloidal / Tectonic Fracture Helper for Europa Lineae, Ganymede Sulci & Triton Slidr/Tano Sulci
    // Returns vec2(x: 3D ridge-and-trough height, y: hydrated-salt / fracture-band mask)
    vec2 outer_doubleRidge(float waveArg, float halfSep, float width) {
      float d = abs(sin(waveArg));
      if (d > halfSep + width * 3.2) return vec2(0.0);
      float levee = exp(-sqr((d - halfSep) / max(width, 0.001)));
      float trough = exp(-sqr(d / max(halfSep * 0.72, 0.001)));
      return vec2(levee * 0.85 - trough * 0.65, clamp(levee * 0.90 + trough * 0.55, 0.0, 1.0));
    }

    // Seamless 3D Polygonal Convection / Diapir Cell Helper for Pluto Sputnik Planitia & Triton Cantaloupe Terrain
    // Returns vec2(x: domed cell height with sunken trough margins, y: narrow polygonal trough boundary mask)
    vec2 outer_polygonalCells(vec3 p, float freq) {
      vec4 cA = textureLod(uNoise3D, p * freq + vec3(0.17, 0.43, 0.61), 0.0);
      vec4 cB = textureLod(uNoise3D, p * (freq * 1.62) + vec3(cA.a * 0.14 + 0.53, 0.29, 0.11), 0.0);
      float edgeA = abs(cA.g - 0.5) * 2.0;
      float edgeB = abs(cB.g - 0.5) * 2.0;
      float minEdge = min(edgeA, edgeB * 1.08);
      float trough = sstepInv(0.15, 0.02, minEdge);
      float dome = smoothstep(0.06, 0.42, minEdge) * (0.75 + 0.25 * cA.r);
      return vec2(dome * 0.65 - trough * 0.85, trough);
    }

    // Juno Polygonal Circumpolar Cyclone Cluster Helper (N=8 Octagon at North Pole, N=5 Pentagon at South Pole)
    // Returns vec3(x: spiral cloud filament brightness, y: deep warm cyclone eye mask, z: vortex collar mask)
    vec3 outer_polarCycloneCluster(float colat, float lon, float nPetals, float ringColat, float coreR, float swirlSign, float turb) {
      // Central polar cyclone right at the pole (colat = 0)
      float d0 = colat / max(coreR, 0.01);
      float swirl0 = lon + swirlSign * 3.4 * exp(-d0 * 0.85) + turb * 1.4;
      float arms0 = (0.5 + 0.5 * cos(swirl0 * 4.0 + d0 * 5.2)) * sstepInv(1.18, 0.18, d0);
      float eye0  = sstepInv(0.24, 0.05, d0);
      float wall0 = exp(-sqr((d0 - 0.34) / 0.16));

      // Ring of N polygonal circumpolar cyclones at ringColat (~83° lat -> colat ~ 0.122 rad)
      float sector = TWO_PI / nPetals;
      float kIdx = floor((lon + PI) / sector + 0.5);
      float cLon = kIdx * sector - PI;
      float dLon = atan(sin(lon - cLon), cos(lon - cLon));
      vec2 vRel = vec2(dLon * sin(ringColat), colat - ringColat) / max(coreR * 0.92, 0.01);
      float dRing = length(vRel);
      float vAng = atan(vRel.y, vRel.x + 1e-6);
      float swirlR = vAng + swirlSign * 3.6 * exp(-dRing * 0.85) + turb * 1.5;
      float armsR = (0.5 + 0.5 * cos(swirlR * 3.0 + dRing * 5.5)) * sstepInv(1.16, 0.18, dRing);
      float eyeR  = sstepInv(0.24, 0.05, dRing);
      float wallR = exp(-sqr((dRing - 0.35) / 0.17));

      return vec3(
        clamp(max(arms0, armsR), 0.0, 1.0),
        clamp(max(eye0, eyeR), 0.0, 1.0),
        clamp(max(wall0, wallR), 0.0, 1.0)
      );
    }

    // Named Circular Lunar Impact Crater Helper (returns x: height delta, y: bright rim/floor albedo tag)
    vec2 evalNamedCrater(vec2 ll, vec2 centerLL, float radDeg, float depth, float centralPeak, float darkFloor) {
      float cosLat = max(0.22, cos(radians(centerLL.y)));
      vec2 d = vec2(wrapDeg(ll.x - centerLL.x) * cosLat, ll.y - centerLL.y);
      float r = length(d);
      if (r >= radDeg * 1.55) return vec2(0.0, 0.0);
      float u = r / max(radDeg, 0.2);
      float bowl = (u < 1.0) ? (-depth * pow(max(1.0 - u * u, 0.0), 1.8)) : 0.0;
      float skirt = sstepInv(1.55, 1.03, u);
      float rim = depth * 0.46 * exp(-sqr((u - 0.98) / 0.14)) * (u < 1.0 ? 1.0 : skirt);
      float pk  = centralPeak * depth * 0.38 * exp(-sqr(u / 0.16));
      float albTag = (darkFloor > 0.0)
        ? (-darkFloor * sstepInv(0.88, 0.65, u) + 0.35 * exp(-sqr((u - 0.98) / 0.14)))
        : (0.45 * exp(-sqr((u - 0.98) / 0.16)) + centralPeak * 0.40 * exp(-sqr(u / 0.20)));
      return vec2(bowl + rim + pk, albTag);
    }

    // LRO Selenographic 3D Relief + Highland Mountain Arcs + Mare Wrinkle Ridges/Rilles + Named Impact Craters
    // Returns vec3(x: height, y: mtnMask, z: craterAlbDelta)
    vec3 evalLunarFeatures(vec3 q, float mariaSmooth) {
      vec2 qLL = vec2(wrapDeg(degrees(atan(q.z, q.x + 1e-7))), degrees(asin(clamp(q.y, -1.0, 1.0))));

      float highlandCraters = evalCraterHeight(q * 1.18) +
                              evalCellularCraterLayer(q,  66.0,  6.1, 0.0) * 0.14 +
                              evalCellularCraterLayer(q, 148.0, 11.7, 0.0) * 0.075;
      float mareCraters     = evalCellularCraterLayer(q,  28.0,  7.4, 0.0) * 0.14 +
                              evalCellularCraterLayer(q,  68.0,  9.2, 0.0) * 0.11 +
                              evalCellularCraterLayer(q, 148.0, 11.7, 0.0) * 0.055;
      // Basaltic compressional Dorsa (wrinkle ridges) across Procellarum, Imbrium & Serenitatis!
      float dorsaA = pow(max(1.0 - abs(textureLod(uNoise3D, q * 11.5 + 0.41, 0.0).r - 0.5) * 2.0, 0.0), 6.0);
      float dorsaB = pow(max(1.0 - abs(textureLod(uNoise3D, q * 19.5 + 0.73, 0.0).g - 0.5) * 2.0, 0.0), 7.0);
      float wrinkleRidge = dorsaA * 0.078 + dorsaB * 0.045;
      float h = mix(highlandCraters, highlandCraters * 0.15 + mareCraters + wrinkleRidge, mariaSmooth);

      // Vallis Schröteri sinuous volcanic rille on Aristarchus Plateau + Rima Hadley / Hyginus graben hint
      float vSchroteri = segField(qLL, vec2(-51.2, 26.4), vec2(-48.4, 24.5), 0.55);
      float rHyginus   = segField(qLL, vec2(  5.2,  8.4), vec2(  9.8,  7.1), 0.45);
      h -= (vSchroteri * 0.16 + rHyginus * 0.10);

      // Uplifted Impact-Basin Rim Mountain Ranges (Montes Apenninus, Caucasus, Alpes, Carpatus, Jura & Cordillera/Orientale)
      float mtnApenninus = segField(qLL, vec2(-10.5, 16.5), vec2(  4.2, 27.5), 1.95);
      float mtnCaucasus  = segField(qLL, vec2(  6.5, 31.5), vec2( 10.5, 40.5), 1.75);
      float mtnAlpes     = segField(qLL, vec2( -3.8, 45.0), vec2(  5.2, 49.5), 1.85);
      float mtnCarpatus  = segField(qLL, vec2(-29.5, 14.2), vec2(-18.5, 15.0), 1.65);
      float mtnJura      = segField(qLL, vec2(-38.2, 42.5), vec2(-29.5, 48.2), 1.45);
      // Mare Orientale (Montes Rook & Cordillera concentric rings on the western limb, -94.7°W, -19.4°S)
      float dOrient = length(vec2(wrapDeg(qLL.x - (-94.7)) * 0.94, qLL.y - (-19.4)));
      float mtnOrientale = exp(-sqr((dOrient - 9.8) / 1.3)) * 0.65 + exp(-sqr((dOrient - 14.6) / 1.5)) * 0.72;

      float mtnArc = max(max(mtnApenninus * 1.15, mtnCaucasus * 0.90),
                         max(mtnAlpes * 0.88, max(mtnCarpatus * 0.82, max(mtnJura * 0.92, mtnOrientale))));
      float mtnRugged = 0.65 + 0.55 * textureLod(uNoise3D, q * 24.0 + 0.13, 0.0).g;
      float mtnMask = mtnArc * mtnRugged;
      h += mtnMask * 0.42;

      // Iconic Named 3D Circular Lunar Impact Craters (IAU Selenographic Coordinates) + South Pole Shackleton!
      vec2 cTycho     = evalNamedCrater(qLL, vec2(-11.36, -43.31), 2.55, 0.56, 1.0, 0.00); // Tycho (85 km, central peak)
      vec2 cCopern    = evalNamedCrater(qLL, vec2(-20.08,   9.62), 2.75, 0.58, 1.0, 0.00); // Copernicus (93 km, terraced walls)
      vec2 cKepler    = evalNamedCrater(qLL, vec2(-38.01,   8.12), 1.35, 0.38, 0.7, 0.00); // Kepler (32 km)
      vec2 cAristar   = evalNamedCrater(qLL, vec2(-47.49,  23.73), 1.45, 0.45, 0.8, 0.00); // Aristarchus (40 km, brightest!)
      vec2 cPlato     = evalNamedCrater(qLL, vec2( -9.33,  51.62), 2.85, 0.42, 0.0, 0.78); // Plato (101 km, dark lava floor!)
      vec2 cArchim    = evalNamedCrater(qLL, vec2( -4.00,  29.72), 2.35, 0.38, 0.0, 0.55); // Archimedes (81 km, flooded floor)
      vec2 cGrimaldi  = evalNamedCrater(qLL, vec2(-68.60,  -5.20), 4.20, 0.36, 0.0, 0.82); // Grimaldi (173 km, dark floor)
      vec2 cClavius   = evalNamedCrater(qLL, vec2(-14.40, -58.40), 5.60, 0.46, 0.2, 0.00); // Clavius (231 km, southern giant)
      vec2 cLangrenus = evalNamedCrater(qLL, vec2( 60.90,  -8.90), 3.25, 0.45, 0.9, 0.00); // Langrenus (132 km, eastern limb)
      // South Pole Shackleton Crater rim (~89.5°S, 21 km deep cold-trap bowl + sunlit Peak-of-Eternal-Light rim!)
      float sColatDeg = 90.0 + qLL.y;
      float shackBowl = (sColatDeg < 1.35) ? (-0.42 * pow(max(1.0 - sqr(sColatDeg / 1.35), 0.0), 1.5)) : 0.0;
      float shackRim  = 0.34 * exp(-sqr((sColatDeg - 1.38) / 0.35));

      h += cTycho.x + cCopern.x + cKepler.x + cAristar.x + cPlato.x + cArchim.x + cGrimaldi.x + cClavius.x + cLangrenus.x + shackBowl + shackRim;
      float albDelta = cTycho.y + cCopern.y + cKepler.y + cAristar.y * 1.35 +
                       cPlato.y + cArchim.y + cGrimaldi.y + cClavius.y * 0.50 + cLangrenus.y * 0.80 + shackRim * 0.55;
      return vec3(h, mtnMask + dorsaA * mariaSmooth * 0.22, albDelta);
    }


// ============================================================================
// [BLOCK 3] REPLACES milky_way.html LINES 2542-2978
// (Starts at } else if (pType < 7.5) { right after Mars atmoCol at line 2540,
//  and ends right before return vec4(surfCol + atmoCol, 1.0); at line 2980)
// ============================================================================
      } else if (pType < 7.5) {
        // === JUPITER (5.204 AU, R_eq=71,492 km, R_pol=66,854 km, f=0.06487 — Juno JunoCam + Cassini True-Color) ===
        // Great Red Spot at 22°S (latRad = -0.384), centered on sunlit hero longitude bodyLon = -0.22 rad
        float dLon = atan(sin(bodyLon - (-0.22)), cos(bodyLon - (-0.22)));
        float dLat = latRad - (-0.384);
        vec2 grsRel = vec2(dLon / 0.192, dLat / 0.098);
        float grsR2 = max(dot(grsRel, grsRel), 0.0);
        float grsMask = exp(-pow(max(grsR2, 0.0), 1.65));

        // Oval BA ("Red Spot Jr.") at 33°S (latRad = -0.576), bodyLon = +0.18 rad
        float dLonBA = atan(sin(bodyLon - 0.18), cos(bodyLon - 0.18));
        float dLatBA = latRad - (-0.576);
        float baR2 = sqr(dLonBA / 0.084) + sqr(dLatBA / 0.047);

        // Differential anticyclonic GRS vorticity + Red Spot Hollow northward SEB deflection
        float swirlTheta = grsMask * 3.6 * (1.0 - 0.32 * min(grsR2, 2.2));
        vec2 swirled = rot2D(grsRel, swirlTheta + animT * 0.03);
        float hollowDeflect = exp(-grsR2 * 0.76) * 0.064 * sign(dLat + 0.005);

        // Multi-scale Kelvin-Helmholtz zonal jet shear + folded eddy turbulence
        float jetShear = textureLod(uNoise3D, vec3(cos(bodyLon) * 1.45, latRad * 8.8, sin(bodyLon) * 1.45), 0.0).r;
        float fineTurb = textureLod(uNoise3D, vec3(bodyLon * 2.5, latRad * 20.0 + jetShear * 0.48, 0.35), 0.0).g;
        float microEddy = textureLod(uNoise3D, vec3(bodyLon * 5.2 + jetShear * 0.3, latRad * 38.0, 0.71), 0.0).b;
        float latW = latDeg + (jetShear - 0.5) * 2.5 + (fineTurb - 0.5) * 1.15 + degrees(hollowDeflect);

        // Spacecraft-calibrated Cassini/Juno Zonal Belt & Zone Latitude Profile (100% NaN-safe!)
        float ez   = exp(-pow(max(abs(latW) / 6.9, 0.0), 2.5));
        float eb   = exp(-sqr((latW - 0.4) / 1.45));
        float neb  = smoothstep(6.3, 8.4, latW) * sstepInv(20.0, 17.6, latW);
        float ntb  = exp(-sqr((latW - 24.8) / 2.4));
        float nntb = exp(-sqr((latW - 35.8) / 2.6)) + exp(-sqr((latW - 44.5) / 2.7)) * 0.78;
        float sebN = sstepInv(-6.6, -8.8, latW) * smoothstep(-13.8, -11.2, latW);
        float sebS = sstepInv(-12.2, -14.8, latW) * smoothstep(-21.6, -19.0, latW);
        float seb  = clamp(sebN + sebS * 0.95, 0.0, 1.0) * (1.0 - 0.88 * exp(-grsR2 * 1.02));
        float stb  = exp(-sqr((latW - (-29.4)) / 2.4));
        float sstb = exp(-sqr((latW - (-39.8)) / 2.5)) + exp(-sqr((latW - (-48.5)) / 2.7)) * 0.72;

        // Ammonia-ice zones vs chromophore-enriched rust/sienna/ochre belts
        vec3 zoneCream = mix(vec3(0.87, 0.82, 0.73), vec3(0.96, 0.93, 0.87), fineTurb * 0.75 + microEddy * 0.25);
        vec3 ezOchre   = mix(vec3(0.93, 0.86, 0.72), vec3(0.83, 0.68, 0.48), eb * 0.68 + (1.0 - jetShear) * 0.24);
        vec3 nebRust   = mix(vec3(0.45, 0.22, 0.12), vec3(0.67, 0.37, 0.20), fineTurb * 0.65 + microEddy * 0.35);
        vec3 sebSienna = mix(vec3(0.54, 0.29, 0.16), vec3(0.74, 0.46, 0.28), jetShear * 0.7 + fineTurb * 0.3);
        vec3 ntbOrange = mix(vec3(0.68, 0.43, 0.25), vec3(0.79, 0.54, 0.34), fineTurb);
        vec3 tempBelt  = mix(vec3(0.58, 0.41, 0.28), vec3(0.68, 0.50, 0.36), microEddy);

        float hiLatBands = 0.5 + 0.5 * cos(radians(latW) * 27.0 + jetShear * 1.4);
        vec3 jupCol = mix(vec3(0.72, 0.63, 0.50), zoneCream, hiLatBands);
        jupCol = mix(jupCol, ezOchre, ez * 0.90);
        jupCol = mix(jupCol, nebRust, neb * 0.91);
        // Pale central SEB Zone split + sienna SEB lanes
        float sebSplit = exp(-sqr((latW - (-13.2)) / 1.4)) * (1.0 - exp(-grsR2 * 1.3));
        jupCol = mix(jupCol, sebSienna, seb * 0.88);
        jupCol = mix(jupCol, vec3(0.86, 0.76, 0.63), sebSplit * 0.52);
        jupCol = mix(jupCol, ntbOrange, ntb * 0.84);
        jupCol = mix(jupCol, tempBelt, clamp(stb * 0.80 + (nntb + sstb) * 0.58, 0.0, 0.90));

        // Turbulent white ammonia-ice convective rifts in the westward SEB wake of the Great Red Spot!
        float wakeLon = atan(sin(bodyLon - (-0.22)), cos(bodyLon - (-0.22)));
        float sebWakeEnv = seb * sstepInv(-0.08, -1.75, wakeLon) * exp(-max(0.0, -wakeLon - 0.12) * 0.95);
        float wakeWave = 0.5 + 0.5 * sin(bodyLon * 24.0 + sinLat * 68.0 + fineTurb * 5.2);
        float sebWake = sebWakeEnv * smoothstep(0.46, 0.78, wakeWave * 0.65 + microEddy * 0.45);
        jupCol = mix(jupCol, vec3(0.96, 0.94, 0.90), sebWake * 0.84);

        // Blue-grey 5-micron hot spots along +7.4°N & sweeping diagonal NEB festoons projecting into the EZ!
        float hotSpotPhase = bodyLon * 11.0 + jetShear * 2.2;
        float hotSpotCore  = exp(-sqr((latDeg - 7.4) / 1.65)) * pow(max(0.5 + 0.5 * cos(hotSpotPhase), 0.0), 4.0);
        float festoonSweep = 0.5 + 0.5 * cos(hotSpotPhase + (7.4 - latDeg) * 0.42 + fineTurb * 1.8);
        float festoonTail  = smoothstep(1.2, 4.2, latDeg) * sstepInv(8.8, 6.8, latDeg) *
                             pow(max(festoonSweep, 0.0), 3.2) * (0.55 + 0.45 * t3.b);
        float festoon = clamp(hotSpotCore * 0.95 + festoonTail * 0.72, 0.0, 1.0);
        jupCol = mix(jupCol, vec3(0.28, 0.37, 0.50), festoon * 0.80);

        // Dark chocolate-brown cyclonic "barges" along the northern edge of the NEB (~15.5°N)
        float bargeLon = mod(degrees(bodyLon) + 198.0, 52.0) - 26.0;
        float bargeR2  = sqr(bargeLon / 4.2) + sqr((latDeg - 15.6) / 1.35);
        if (bargeR2 < 2.2) {
          float bargeR = sqrt(max(0.0, bargeR2));
          jupCol = mix(jupCol, vec3(0.88, 0.82, 0.72), exp(-sqr((bargeR - 1.05) / 0.22)) * 0.40);
          jupCol = mix(jupCol, vec3(0.24, 0.11, 0.07), sstepInv(0.95, 0.35, bargeR) * 0.85);
        }

        // SSTB "String of Pearls" white anticyclonic ovals (~40.2°S)
        float pearlLon = mod(degrees(bodyLon) + 195.0, 40.0) - 20.0;
        float pearlR2  = sqr(pearlLon / 2.6) + sqr((latDeg - (-40.2)) / 1.65);
        if (pearlR2 < 2.2) {
          float pearlR = sqrt(max(0.0, pearlR2));
          jupCol = mix(jupCol, vec3(0.46, 0.34, 0.24), exp(-sqr((pearlR - 1.08) / 0.22)) * 0.45);
          jupCol = mix(jupCol, vec3(0.95, 0.94, 0.91), sstepInv(0.92, 0.30, pearlR) * 0.88);
        }

        // Oval BA ("Red Spot Jr.", 33°S): crisp white outer collar + salmon-ochre chromophore annulus + cream core
        if (baR2 < 2.4) {
          float baR = sqrt(max(0.0, baR2));
          jupCol = mix(jupCol, vec3(0.95, 0.93, 0.89), sstepInv(1.22, 0.62, baR) * 0.88);
          jupCol = mix(jupCol, vec3(0.84, 0.48, 0.29), exp(-sqr((baR - 0.56) / 0.21)) * 0.78);
        }

        // Great Red Spot (22°S): pale Red Spot Hollow collar, multi-lane brick-red/salmon spiral & darker eye core!
        if (grsR2 < 2.5) {
          float grsR = sqrt(max(0.0, grsR2));
          float grsSwirlN = textureLod(uNoise3D, vec3(swirled * 1.85, 0.55), 0.0).r;
          float grsFineN  = textureLod(uNoise3D, vec3(swirled * 4.20, 0.21), 0.0).g;
          float spiralLanes = 0.5 + 0.5 * cos(grsR * 13.5 - atan(swirled.y, swirled.x + 1e-6) * 2.0 + grsSwirlN * 3.2);
          vec3 grsSalmon = vec3(0.90, 0.46, 0.26);
          vec3 grsBrick  = vec3(0.75, 0.21, 0.11);
          vec3 grsSpotCol = mix(grsBrick, grsSalmon, spiralLanes * 0.62 + grsFineN * 0.38);
          // Compact darker crimson-ochre central core & warm salmon inner ring (JunoCam close-up morphology)
          grsSpotCol = mix(grsSpotCol, vec3(0.56, 0.14, 0.08), sstepInv(0.30, 0.06, grsR) * 0.68);
          float hollowCollar = exp(-sqr((grsR - 1.08) / 0.17));
          jupCol = mix(jupCol, vec3(0.95, 0.91, 0.85), hollowCollar * 0.78);
          jupCol = mix(jupCol, grsSpotCol, sstepInv(1.06, 0.66, grsR));
        }

        // Juno Bluish Polar Regions (>62°), Folded Filamentary Regions (FFRs) & Polygonal Circumpolar Cyclones!
        float absLat = abs(latDeg);
        if (absLat > 50.0) {
          // Cyclonic Folded Filamentary Regions (FFRs): tightly curled white cloud ribbons in subpolar latitudes
          float ffrWarp = textureLod(uNoise3D, localN * 11.0 + 0.23, 0.0).r;
          float ffrRibbons = pow(max(1.0 - abs(textureLod(uNoise3D, localN * 24.0 + ffrWarp * 0.35, 0.0).g - 0.5) * 2.0, 0.0), 4.0);
          float ffrZone = smoothstep(51.0, 62.0, absLat) * sstepInv(82.0, 72.0, absLat);

          float polarHood = smoothstep(61.0, 78.0, absLat);
          vec3 junoAzure = mix(vec3(0.30, 0.41, 0.56), vec3(0.46, 0.57, 0.70), ffrWarp);
          jupCol = mix(jupCol, junoAzure, polarHood * 0.88);
          jupCol = mix(jupCol, vec3(0.86, 0.90, 0.94), ffrRibbons * ffrZone * 0.52);

          // Exact Juno 8-cyclone North Polar Octagon & 5-cyclone South Polar Pentagon (~83° N/S + central pole vortex)
          if (absLat > 73.0) {
            float colat = acos(clamp(abs(sinLat), 0.0, 1.0));
            float nPetals = (latDeg > 0.0) ? 8.0 : 5.0;
            float ringColat = (latDeg > 0.0) ? 0.122 : 0.118;
            float swirlSign = (latDeg > 0.0) ? 1.0 : -1.0;
            vec3 cpc = outer_polarCycloneCluster(colat, bodyLon + animT * 0.012 * swirlSign, nPetals, ringColat, 0.052, swirlSign, ffrWarp);
            jupCol = mix(jupCol, vec3(0.78, 0.85, 0.91), cpc.x * 0.65);
            jupCol = mix(jupCol, vec3(0.88, 0.84, 0.78), cpc.z * 0.42);
            jupCol = mix(jupCol, vec3(0.58, 0.32, 0.22), cpc.y * 0.75); // Deep warm reddish-ochre clearing in cyclone eye!
          }
        }

        float gasLimbDark = 0.64 + 0.36 * pow(max(viewN, 0.0), 0.54);
        surfCol = jupCol * (diff * ringShadowTrans * gasLimbDark * 0.98) * starTint + jupCol * 0.003;
        atmoCol = vec3(0.90, 0.82, 0.68) * pow(max(1.0 - viewN, 0.0), 3.4) * smoothstep(-0.22, 0.55, ndotl) * 0.17;

      } else if (pType < 8.5) {
        // === SATURN (9.583 AU, R_eq=60,268 km, R_pol=54,364 km, f=0.09796 — Cassini ISS Bands, Hexagon & Ring-Shine) ===
        float bandNoise = textureLod(uNoise3D, vec3(sinLat * 7.5, cos(bodyLon) * 0.24, sin(bodyLon) * 0.24), 0.0).g;
        float fineJet   = textureLod(uNoise3D, vec3(sinLat * 24.0, bodyLon * 0.14, 0.42), 0.0).r;
        float stormRibbon = textureLod(uNoise3D, vec3(bodyLon * 2.6, sinLat * 18.0, 0.67), 0.0).b;

        // Subtle ammonia-haze butterscotch, pale gold & fawn Cassini multi-jet zonal banding
        float eqZone   = exp(-sqr(latDeg / 10.8));
        float tropBelt = exp(-sqr((abs(latDeg) - 17.5) / 4.2));
        float midBelts = 0.5 + 0.5 * cos(latRad * 19.5 + bandNoise * 1.05);
        vec3 satGold = mix(vec3(0.71, 0.59, 0.40), vec3(0.89, 0.81, 0.61), midBelts);
        satGold = mix(satGold, vec3(0.67, 0.54, 0.36), tropBelt * 0.34);
        satGold = mix(satGold, vec3(0.95, 0.89, 0.73), eqZone * 0.62 + (fineJet - 0.5) * 0.13);

        // Northern mid-latitude convective storm ribbon (~35°N Cassini "String/Serpent Storm" remnant)
        float gwsWake = exp(-sqr((latDeg - 35.5) / 2.6)) * smoothstep(0.58, 0.84, stormRibbon * 0.7 + fineJet * 0.35);
        satGold = mix(satGold, vec3(0.96, 0.93, 0.84), gwsWake * 0.38);

        // Cool Cassini winter-hemisphere Rayleigh azure-slate tint in southern latitudes!
        float winterBlue = sstepInv(-12.0, -54.0, latDeg);
        satGold = mix(satGold, vec3(0.53, 0.63, 0.69), winterBlue * 0.42);

        // Cassini North Polar Hexagon (~77.5°N) + Turquoise-Slate Interior + Hurricane Eyewall & Dark Eye!
        if (latDeg > 65.0) {
          float colat = acos(clamp(sinLat, -1.0, 1.0)); // ~0.218 rad at 77.5°N
          float hexPhase = 6.0 * bodyLon + animT * 0.015;
          // Straight-sided 6-lobed Rossby wave jet stream (fundamental m=6 + flat-edge m=12 harmonic)
          float hexMod = 1.0 + 0.076 * cos(hexPhase) - 0.011 * cos(2.0 * hexPhase);
          float hexR = colat * hexMod;
          float outerCollar = exp(-sqr((hexR - 0.268) / 0.030));
          float hexJetWall  = exp(-sqr((hexR - 0.214) / 0.020));
          float hexInterior = sstepInv(0.222, 0.135, hexR);
          float vortexRings = 0.5 + 0.5 * cos(colat * 85.0 + fineJet * 2.5);
          float eyeWall     = exp(-sqr((colat - 0.044) / 0.014));
          float polarEye    = sstepInv(0.042, 0.008, colat);

          satGold = mix(satGold, vec3(0.61, 0.55, 0.37), outerCollar * 0.58);
          satGold = mix(satGold, vec3(0.86, 0.79, 0.56), hexJetWall * 0.78);
          vec3 hexTeal = mix(vec3(0.32, 0.49, 0.54), vec3(0.41, 0.58, 0.61), vortexRings);
          satGold = mix(satGold, hexTeal, hexInterior * 0.86);
          satGold = mix(satGold, vec3(0.62, 0.75, 0.72), eyeWall * 0.68);
          satGold = mix(satGold, vec3(0.15, 0.27, 0.34), polarEye * 0.92);
        }

        // Physical Cassini "Ring-Shine": sunlight scattered off the bright B & A rings softly illuminating
        // Saturn's ring-shadowed & nightside winter hemisphere!
        vec3 axS = normalize(axisWorld);
        float sunRingSin = dot(subStarDir, axS);
        float ringSunLit = abs(sunRingSin);
        // Both hemispheres receive C/B/A ring-shine near the equator, strongest on the winter/ring-shadowed side
        float oppHemi = clamp(-sinLat * sign(sunRingSin + 1e-5) * 1.35 + 0.28 * exp(-sqr(latDeg / 24.0)), 0.0, 1.0);
        float shadowFill = 1.0 - diff * ringShadowTrans;
        vec3 ringShine = vec3(0.058, 0.052, 0.041) * ringSunLit * oppHemi * shadowFill * starTint;

        float gasLimbDark = 0.64 + 0.36 * pow(max(viewN, 0.0), 0.56);
        surfCol = satGold * (diff * ringShadowTrans * gasLimbDark * 0.96) * starTint + satGold * ringShine + satGold * 0.003;
        atmoCol = vec3(0.94, 0.86, 0.66) * pow(max(1.0 - viewN, 0.0), 3.4) * smoothstep(-0.22, 0.55, ndotl) * 0.16;

      } else if (pType < 9.5) {
        // === URANUS (19.22 AU, R_eq=25,559 km, f=0.02293 — Irwin et al. 2024 MNRAS Recalibrated Pale Greenish-Cyan) ===
        float band = textureLod(uNoise3D, vec3(sinLat * 5.8, cos(bodyLon) * 0.18, 0.7), 0.0).g;
        float zFine = 0.5 + 0.5 * cos(latRad * 14.0 + band * 0.8);
        // Irwin et al. (2024): true pale greenish-cyan globe + bright 43°N collar + milky methane-haze summer polar hood!
        float polarHood    = smoothstep(35.0, 62.0, latDeg);
        float brightCollar = exp(-sqr((latDeg - 43.0) / 6.8));
        float winterTint   = sstepInv(-12.0, -52.0, latDeg);

        vec3 uraCyan = mix(vec3(0.55, 0.82, 0.86), vec3(0.63, 0.87, 0.90), band * 0.65 + zFine * 0.35);
        uraCyan = mix(uraCyan, vec3(0.48, 0.77, 0.84), winterTint * 0.28);
        uraCyan = mix(uraCyan, vec3(0.77, 0.91, 0.93), brightCollar * 0.52);
        uraCyan = mix(uraCyan, vec3(0.84, 0.93, 0.94), polarHood * 0.72);

        // Discrete high-altitude methane-ice convective cloud speck along polar hood margin (HST / JWST NIRCam)
        float dStormLon = atan(sin(bodyLon - 0.54), cos(bodyLon - 0.54));
        float uraStorm = exp(-sqr(dStormLon / 0.095)) * exp(-sqr((latDeg - 35.5) / 2.2)) * (0.65 + 0.35 * t3.r);
        uraCyan = mix(uraCyan, vec3(0.95, 0.99, 1.00), uraStorm * 0.62);

        float gasLimb = 0.64 + 0.36 * pow(max(viewN, 0.0), 0.52);
        surfCol = uraCyan * (diff * ringShadowTrans * gasLimb * 0.94) * starTint + uraCyan * 0.004;
        atmoCol = vec3(0.60, 0.90, 0.94) * pow(max(1.0 - viewN, 0.0), 3.2) * smoothstep(-0.24, 0.55, ndotl) * 0.22;

      } else if (pType < 10.5) {
        // === NEPTUNE (30.11 AU, R_eq=24,764 km, f=0.01708 — Irwin et al. 2024 MNRAS Pale Cerulean-Azure, GDS & Scooter) ===
        float zBand = 0.5 + 0.5 * cos(latRad * 11.5 + t1.r * 0.9);
        // Irwin et al. (2024): subtly richer azure-cerulean than Uranus due to thinner stagnant haze (NOT artificial indigo!)
        vec3 nepCyan = mix(vec3(0.37, 0.67, 0.87), vec3(0.50, 0.78, 0.92), zBand * 0.68 + t2.g * 0.32);

        // Darker southern aerosol-depleted methane band (45°S - 65°S) + brighter South Polar Vortex collar (~71°S)
        float southDarkBand  = exp(-sqr((latDeg - (-54.0)) / 9.2));
        float southPolarSpot = exp(-sqr((latDeg - (-71.5)) / 5.5));
        nepCyan = mix(nepCyan, vec3(0.27, 0.53, 0.78), southDarkBand * 0.64);
        nepCyan = mix(nepCyan, vec3(0.60, 0.83, 0.94), southPolarSpot * 0.42);

        // Great Dark Spot (20°S, sunlit hero longitude bodyLon = -0.24 rad) with subtle internal anticyclonic swirl
        float dLon = atan(sin(bodyLon - (-0.24)), cos(bodyLon - (-0.24)));
        float dLat = latRad - (-0.35);
        vec2 gdsRel = vec2(dLon / 0.188, dLat / 0.094);
        float gdsR = length(gdsRel);
        if (gdsR < 1.45) {
          vec2 gdsSwirl = rot2D(gdsRel, 2.2 * exp(-gdsR * gdsR));
          float gdsTex = textureLod(uNoise3D, vec3(gdsSwirl * 2.1, 0.44), 0.0).g;
          vec3 gdsDeep = mix(vec3(0.19, 0.40, 0.68), vec3(0.26, 0.49, 0.76), gdsTex);
          nepCyan = mix(nepCyan, gdsDeep, sstepInv(1.10, 0.30, gdsR) * 0.85);
        }

        // Small Dark Spot / DS2 ("Wizard's Eye", 54°S, bodyLon = +0.10 rad) with bright white upwelling eye core
        float dLon2 = atan(sin(bodyLon - 0.10), cos(bodyLon - 0.10));
        float dLat2 = latRad - (-0.942);
        float sdsR = sqrt(sqr(dLon2 / 0.108) + sqr(dLat2 / 0.054));
        nepCyan = mix(nepCyan, vec3(0.19, 0.39, 0.67), sstepInv(1.10, 0.34, sdsR) * 0.78);
        nepCyan = mix(nepCyan, vec3(0.95, 0.98, 1.00), sstepInv(0.42, 0.08, sdsR) * 0.86);

        // Orographic white methane-ice companion cloud over GDS + "Scooter" (42°S) + zonal cirrus streaks with cloud shadows!
        float companion = exp(-sqr((gdsR - 0.92) / 0.20)) * smoothstep(-0.03, 0.08, dLat) * (0.75 + 0.25 * t3.g);
        float dScootLon = atan(sin(bodyLon + 0.06), cos(bodyLon + 0.06));
        float scooter   = exp(-sqr(dScootLon / 0.075)) * exp(-sqr((latDeg - (-42.0)) / 2.4)) *
                          (0.75 + 0.25 * cos((latDeg + 42.0) * 1.8));
        float cirrusBandLat = exp(-sqr((latDeg - 26.5) / 4.5)) + exp(-sqr((latDeg - (-29.0)) / 5.0)) + exp(-sqr((latDeg - (-46.5)) / 4.0));
        float streakField = smoothstep(0.72, 0.89, textureLod(uNoise3D, vec3(bodyLon * 2.1 + animT * 0.01, sinLat * 12.5, 0.25), 0.0).r) *
                            clamp(0.35 + 0.85 * cirrusBandLat, 0.0, 1.0);
        float cirrus = clamp(companion * 0.92 + scooter * 0.94 + streakField * 0.56 * sstepInv(84.0, 64.0, abs(latDeg)), 0.0, 1.0);
        // Subtle dark under-cloud shadow offset slightly equatorward on lower H2S deck (Voyager 2 cloud-height relief!)
        float cirrusShadow = exp(-sqr((gdsR - 0.84) / 0.20)) * smoothstep(0.00, 0.09, dLat) * 0.16;
        nepCyan *= (1.0 - cirrusShadow);
        nepCyan = mix(nepCyan, vec3(0.95, 0.98, 1.00), cirrus * 0.88);

        float gasLimb = 0.64 + 0.36 * pow(max(viewN, 0.0), 0.54);
        surfCol = nepCyan * (diff * ringShadowTrans * gasLimb * 0.98) * starTint + nepCyan * 0.004;
        atmoCol = vec3(0.46, 0.76, 0.96) * pow(max(1.0 - viewN, 0.0), 3.1) * smoothstep(-0.24, 0.55, ndotl) * 0.26;

      } else if (pType < 11.5) {
        // === MOON / LUNA (384,400 km, R=1,738.1 km — NASA LRO WAC/LOLA 2.0 Selenography, TiO2 Maria, Rilles & Rays) ===
        vec2 ll = vec2(wrapDeg(degrees(bodyLon)), latDeg);

        // Complete IAU Nearside, Western Limb & Farside Basaltic Maria + Sinus Iridum + Orientale + South Pole-Aitken!
        float mImbrium = max(ellipBlob(ll, vec2(-15.6,  34.7), vec2(17.5, 14.5),  0.05),
                             ellipBlob(ll, vec2(-31.5,  44.1), vec2( 4.8,  3.8),  0.30)); // Mare Imbrium + Sinus Iridum
        float mSeren   = ellipBlob(ll, vec2( 18.4,  27.3), vec2(10.5,  9.5), -0.10);      // Mare Serenitatis
        float mTranq   = ellipBlob(ll, vec2( 30.8,   8.4), vec2(12.8,  9.6),  0.20);      // Mare Tranquillitatis (High-TiO2!)
        float mCrisium = ellipBlob(ll, vec2( 59.1,  16.8), vec2( 7.8,  6.5),  0.00);      // Mare Crisium
        float mFecund  = ellipBlob(ll, vec2( 51.3,  -7.8), vec2( 9.5, 10.8),  0.15);      // Mare Fecunditatis
        float mNectar  = ellipBlob(ll, vec2( 35.1, -15.2), vec2( 6.6,  6.2),  0.00);      // Mare Nectaris
        float mVapor   = max(ellipBlob(ll, vec2(  3.6,  13.3), vec2( 5.8,  4.5),  0.00),
                             ellipBlob(ll, vec2(  1.1,   2.4), vec2( 5.2,  3.5),  0.00)); // Mare Vaporum + Sinus Medii
        float mInsul   = max(ellipBlob(ll, vec2(-30.9,   7.5), vec2( 9.5,  7.5),  0.10),
                             ellipBlob(ll, vec2(-22.3, -10.5), vec2( 6.2,  5.5),  0.00)); // Mare Insularum + Mare Cognitum
        float mProcel  = ellipBlob(ll, vec2(-54.0,  18.5), vec2(18.5, 24.5),  0.22);      // Oceanus Procellarum
        float mNubium  = ellipBlob(ll, vec2(-17.0, -20.5), vec2(11.2,  9.8), -0.10);      // Mare Nubium
        float mHumor   = ellipBlob(ll, vec2(-38.6, -24.4), vec2( 6.8,  6.2),  0.00);      // Mare Humorum
        float mFrig    = ellipBlob(ll, vec2(  1.5,  56.0), vec2(28.5,  4.2),  0.00);      // Mare Frigoris
        float mOrient  = ellipBlob(ll, vec2(-94.7, -19.4), vec2( 5.2,  5.0),  0.00);      // Mare Orientale inner basalt floor
        float mFarside = max(ellipBlob(ll, vec2(147.9,  27.3), vec2( 6.2,  5.8),  0.00),  // Mare Moscoviense
                             ellipBlob(ll, vec2(129.1, -20.4), vec2( 3.2,  3.0),  0.00)); // Tsiolkovskiy dark floor
        float spAitken = ellipBlob(ll, vec2(180.0, -53.0), vec2(32.0, 24.0),  0.00) * 0.54;

        float mariaRaw = max(max(max(mImbrium, mSeren), max(mTranq, mCrisium)),
                             max(max(max(mFecund, mNectar), max(mVapor, mInsul)),
                                 max(max(mProcel, mNubium), max(mHumor, max(mFrig * 0.78, max(mOrient, max(mFarside, spAitken)))))));
        float maria = smoothstep(0.24, 0.56, mariaRaw + (t2.g - 0.5) * 0.15);

        // Exact Spin-Axis Aligned Local & World Tangent Basis for True Astronomical Crater & Wrinkle-Ridge Shadowing!
        vec3 axM   = normalize(axisWorld);
        vec3 wTanE = (abs(dot(nrm, axM)) < 0.995) ? normalize(cross(axM, nrm)) : normalize(cross(nrm, vec3(1.0, 0.0, 0.0)));
        vec3 wTanN = normalize(cross(nrm, wTanE));
        vec3 lTanE = (abs(localN.y) < 0.995) ? normalize(vec3(-localN.z, 0.0, localN.x)) : vec3(1.0, 0.0, 0.0);
        vec3 lTanN = normalize(cross(localN, lTanE));

        float eps = 0.0068;
        vec3 feat0 = evalLunarFeatures(localN, maria);
        float h0   = feat0.x;
        float hX   = evalLunarFeatures(normalize(localN + lTanE * eps), maria).x;
        float hY   = evalLunarFeatures(normalize(localN + lTanN * eps), maria).x;

        float bumpAmp = mix(3.45, 2.38, maria);
        vec3 bumpedN = normalize(nrm - (wTanE * (hX - h0) + wTanN * (hY - h0)) * bumpAmp);

        // Hybrid Hapke / Lommel-Seeliger + Raking Micro-Facet Relief Photometry + South Pole Shackleton Rim Grazing Light
        float mu0 = max(0.0, dot(bumpedN, lightDir));
        float muV = max(0.06, dot(bumpedN, viewDir));
        float lsTerm = mu0 / (mu0 + muV + 0.075);
        float shackGrazing = exp(-sqr((90.0 + latDeg - 1.38) / 0.42)) * smoothstep(-0.08, 0.04, ndotl) * 0.35;
        float moonShade = ((lsTerm * 1.48 + pow(max(mu0, 0.0), 0.85) * 1.05) * smoothstep(-0.045, 0.065, ndotl) + shackGrazing) * eclipseShadow;
        float oppSurge  = 1.0 + 0.34 * pow(max(0.0, dot(viewDir, lightDir)), 5.5);

        // Asymmetric 1,500-km Tycho Ray System + Dark Melt Collar, Copernicus Plumed Rays, Kepler & Aristarchus Rays!
        vec2 dTycho  = vec2(wrapDeg(ll.x - (-11.36)) * 0.76, ll.y - (-43.31));
        float rTyc   = length(dTycho);
        float angTyc = atan(dTycho.y, dTycho.x + 1e-6);
        float wispT  = textureLod(uNoise3D, vec3(cos(angTyc) * 2.5, sin(angTyc) * 2.5, rTyc * 0.035), 0.0).r;
        float asymT  = 0.55 + 0.45 * sin(angTyc + 0.8); // Western sector exclusion zone + long NNW/SE rays!
        float rayTycho = exp(-rTyc / 39.0) * smoothstep(2.9, 5.2, rTyc) * asymT *
                         pow(max(0.5 + 0.5 * cos(angTyc * 11.0 + wispT * 3.4), 0.0), 3.0) + exp(-rTyc / 2.3);
        float tychoDarkHalo = exp(-sqr((rTyc - 3.4) / 0.95));

        vec2 dCop    = vec2(wrapDeg(ll.x - (-20.08)) * 0.98, ll.y - 9.62);
        float rCop   = length(dCop);
        float angCop = atan(dCop.y, dCop.x + 1e-6);
        float wispC  = textureLod(uNoise3D, vec3(cos(angCop) * 2.8 + 0.4, sin(angCop) * 2.8, rCop * 0.05), 0.0).g;
        float rayCop = exp(-rCop / 19.5) * pow(max(0.5 + 0.5 * cos(angCop * 9.0 + wispC * 3.6), 0.0), 2.5) + exp(-rCop / 2.4);

        vec2 dKep    = vec2(wrapDeg(ll.x - (-38.01)), ll.y - 8.12);
        float rKep   = length(dKep);
        float rayKep = exp(-rKep / 12.5) * pow(max(0.5 + 0.5 * cos(atan(dKep.y, dKep.x + 1e-6) * 8.0 + t3.r * 2.8), 0.0), 2.6) + exp(-rKep / 1.7);

        vec2 dAri    = vec2(wrapDeg(ll.x - (-47.49)) * 0.91, ll.y - 23.73);
        float rAri   = length(dAri);
        float rayAri = exp(-rAri / 9.5) * pow(max(0.5 + 0.5 * cos(atan(dAri.y, dAri.x + 1e-6) * 7.0 + t2.b * 2.6), 0.0), 2.5) + exp(-rAri / 1.6) * 1.28;

        // LRO WAC Color Calibration: Ferroan Anorthositic Highlands vs Low-Ti Warm Basalt vs High-TiO2 Blue-Slate Ilmenite!
        vec3 highlandAlb = mix(vec3(0.192, 0.184, 0.173), vec3(0.242, 0.233, 0.220), t1.r * 0.65 + t2.g * 0.35);
        float serenOuterRing = exp(-sqr((length(vec2(wrapDeg(ll.x - 18.4) * 0.89, ll.y - 27.3)) - 8.2) / 2.2)) * mSeren;
        float tiRichMask = clamp(mTranq * 1.45 + mProcel * 0.44 + serenOuterRing * 1.15, 0.0, 1.0);
        vec3 mariaWarm   = vec3(0.075, 0.071, 0.066);
        vec3 mariaTiBlue = vec3(0.060, 0.069, 0.086);
        vec3 mariaAlb    = mix(mariaWarm, mariaTiBlue, tiRichMask) * (1.0 - serenOuterRing * 0.16);
        // Subtle mafic FeO/thorium darkening in South Pole-Aitken floor
        mariaAlb = mix(mariaAlb, vec3(0.095, 0.088, 0.082), clamp(spAitken * 0.75, 0.0, 0.55));

        // Aristarchus Plateau Pyroclastic Dark Orange-Brown Blanket (-49.2°W, +25.2°N) & Reiner Gamma magnetic swirl!
        float ariPlateau  = ellipBlob(ll, vec2(-49.2, 25.2), vec2(4.2, 3.6), 0.45) * (1.0 - smoothstep(0.0, 2.2, rAri));
        float reinerGamma = ellipBlob(ll, vec2(-59.0,  7.5), vec2(2.6, 1.3), 0.20);
        vec3 moonAlb = mix(highlandAlb, mariaAlb, maria * 0.92);
        moonAlb = mix(moonAlb, vec3(0.082, 0.064, 0.049), ariPlateau * 0.78);
        moonAlb = mix(moonAlb, vec3(0.285, 0.282, 0.276), reinerGamma * 0.55);
        moonAlb *= (1.0 - tychoDarkHalo * 0.28);

        // Apply Mountain Massif / Wrinkle-Ridge Brightening, Named Crater Rim/Dark-Floor Tags & Fresh Ejecta Rays
        float mtnBright = clamp(feat0.y * 0.55, 0.0, 0.56);
        moonAlb = mix(moonAlb, vec3(0.275, 0.266, 0.254), mtnBright);
        if (feat0.z < 0.0) {
          moonAlb = mix(moonAlb, vec3(0.058, 0.057, 0.058), clamp(-feat0.z, 0.0, 0.88)); // Dark lava floor (Plato, Grimaldi)
        } else if (feat0.z > 0.0) {
          moonAlb = mix(moonAlb, vec3(0.365, 0.368, 0.378), clamp(feat0.z * 0.68, 0.0, 0.85));
        }

        float microRays = pow(clamp(t3.g * 0.58 + t4.r * 0.48, 0.0, 1.0), 5.6);
        float totalRays = clamp(rayTycho * 0.88 + rayCop * 0.84 + rayKep * 0.68 + rayAri * 0.86 + microRays * 0.48, 0.0, 0.94);
        moonAlb = mix(moonAlb, vec3(0.375, 0.378, 0.388), totalRays);

        // Ocean-Scattered Blue Da Vinci Earthshine on the Lunar Nearside Night Crescent!
        vec3 earthshine = vec3(0.020, 0.033, 0.056) * pow(max(0.0, localN.x), 0.78) * sstepInv(0.06, -0.22, ndotl);
        surfCol = moonAlb * moonShade * oppSurge * 1.16 * starTint + moonAlb * earthshine + moonAlb * 0.0028;

      } else if (pType < 12.5) {
        // === PLUTO (39.48 AU, R=1,188.3 km — New Horizons MVIC Tombaugh Regio, Cthulhu, Wright Mons & Layered Blue Haze) ===
        vec2 ll = vec2(wrapDeg(degrees(bodyLon) + 20.0), latDeg);
        // Domain-warped planetographic coordinates for organic geological boundaries
        vec2 llW = ll + vec2((t2.r - 0.5) * 4.5, (t2.b - 0.5) * 3.8);

        // Bilobed Tombaugh Regio ("The Heart"): western Sputnik Planitia N2 glacier + pitted eastern lobe!
        float sputnikLobe = ellipBlob(llW, vec2(-8.5,  21.5), vec2(14.8, 20.5), -0.20) +
                            ellipBlob(llW, vec2(-2.5,  -4.5), vec2( 9.2, 13.0),  0.26) * 0.88;
        float eastHeart   = ellipBlob(llW, vec2(18.5,  16.5), vec2(14.5, 16.5),  0.24) +
                            ellipBlob(llW, vec2(25.0,   4.0), vec2( 9.5, 10.5), -0.15) * 0.65;
        float sputnikGlacier = smoothstep(0.36, 0.68, sputnikLobe);
        float eastMantle     = smoothstep(0.32, 0.66, eastHeart) * (1.0 - sputnikGlacier * 0.85);
        float heartMask      = clamp(sputnikGlacier + eastMantle * 0.92, 0.0, 1.0);

        // Rugged water-ice mountain cordillera along Sputnik's western edge (Al-Idrisi, Hillary & Tenzing Montes!)
        float sputnikMtns = (segField(llW, vec2(-22.5, 30.0), vec2(-17.5,  6.0), 2.4) +
                             segField(llW, vec2(-16.5,  3.0), vec2(-11.5, -15.5), 2.2)) * (0.55 + 0.75 * t3.g);

        // Wright Mons (-10°, -21.4°) & Piccard Mons (-4°, -35.0°): annular hummocky cryovolcanoes with central calderas!
        float rWright  = length(vec2(wrapDeg(ll.x - (-10.5)) * 0.93, ll.y - (-21.4)));
        float wrightM  = exp(-sqr((rWright - 3.4) / 1.8)) - 0.85 * exp(-sqr(rWright / 1.35));
        float rPiccard = length(vec2(wrapDeg(ll.x - (-4.0)) * 0.82, ll.y - (-35.0)));
        float piccardM = exp(-sqr((rPiccard - 4.2) / 2.1)) - 0.85 * exp(-sqr(rPiccard / 1.65));

        // Cthulhu Macula ("The Whale") dark mahogany-crimson tholin province + Krun / Ala / Balrog / Meng-p'o maculae!
        float cthulhuBody = ellipBlob(llW, vec2(-68.0, -8.5), vec2(44.0, 14.5), 0.04) +
                            ellipBlob(llW, vec2(-29.0, -7.5), vec2(13.5,  8.8), -0.12) * 0.92; // Whale's head nose-to-nose with Sputnik!
        float eastMaculae = ellipBlob(llW, vec2( 48.0, -14.0), vec2(16.5,  9.5), -0.12) +      // Krun Macula
                            ellipBlob(llW, vec2( 88.0, -11.0), vec2(18.5, 10.5),  0.08) +      // Ala / Balrog Macula
                            ellipBlob(llW, vec2(142.0, -10.5), vec2(20.0, 11.0),  0.00);       // Meng-p'o Macula
        float darkTholin  = clamp((cthulhuBody * 1.15 + eastMaculae * 0.92) * (1.0 - heartMask), 0.0, 1.0);

        // Tartarus Dorsa (+53°, +8.5°): bladed methane-ice penitentes terrain east of Tombaugh Regio!
        float tartarusMask   = ellipBlob(llW, vec2(53.0, 8.5), vec2(18.0, 15.0), 0.22) * (1.0 - heartMask);
        float tartarusBlades = (0.5 + 0.5 * sin(localN.x * 95.0 + localN.y * 38.0 + t3.r * 3.5)) * tartarusMask;

        // Lowell Regio (>54°N) warm ochre-citron methane-ice north polar cap + Virgil Fossae reddish tectonic trough
        float lowellPolar  = smoothstep(52.0, 78.0, latDeg + (t2.g - 0.5) * 6.0);
        float virgilFossae = segField(ll, vec2(-46.0, 4.0), vec2(-23.0, 13.5), 1.05) * (1.0 - sputnikGlacier);

        // 3D Polygonal N2-ice convection cells inside Sputnik Planitia + sublimation pit margins
        vec2 poly0 = outer_polygonalCells(localN, 17.5);
        float pitMargin = smoothstep(0.55, 0.82, t4.g) * sputnikGlacier * smoothstep(-16.0, 6.0, -latDeg);

        vec3 tU = normalize(cross(localN, abs(localN.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
        vec3 tV = cross(localN, tU);
        float roughP = mix(1.0, 0.05, sputnikGlacier);
        float h0 = evalCraterHeight(localN * 1.12) * roughP + poly0.x * 0.09 * sputnikGlacier +
                   sputnikMtns * 0.34 + (wrightM + piccardM) * 0.24 + tartarusBlades * 0.14 - virgilFossae * 0.16;
        float hX = evalCraterHeight(normalize(localN + tU * 0.0085) * 1.12) * roughP +
                   outer_polygonalCells(normalize(localN + tU * 0.0085), 17.5).x * 0.09 * sputnikGlacier +
                   tartarusMask * (0.5 + 0.5 * sin((localN.x + tU.x * 0.0085) * 95.0 + (localN.y + tU.y * 0.0085) * 38.0 + t3.r * 3.5)) * 0.14;
        float hY = evalCraterHeight(normalize(localN + tV * 0.0085) * 1.12) * roughP +
                   outer_polygonalCells(normalize(localN + tV * 0.0085), 17.5).x * 0.09 * sputnikGlacier;

        vec3 wTanU = normalize(cross(nrm, abs(nrm.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
        vec3 wTanV = cross(nrm, wTanU);
        vec3 bumpedN = normalize(nrm - (wTanU * (hX - h0) + wTanV * (hY - h0)) * 2.45);
        float plutoDiff = smoothstep(-0.08, 0.88, dot(bumpedN, lightDir)) * max(0.0, dot(bumpedN, lightDir) + 0.06) * eclipseShadow;

        vec3 midTan       = mix(vec3(0.53, 0.42, 0.34), vec3(0.69, 0.57, 0.46), t2.g * 0.7 + t3.b * 0.3);
        vec3 lowellOchre  = mix(vec3(0.72, 0.61, 0.44), vec3(0.81, 0.71, 0.53), t2.r);
        vec3 cthulhuRed   = mix(vec3(0.18, 0.08, 0.06), vec3(0.34, 0.15, 0.10), t3.r * 0.7 + t4.b * 0.3);
        vec3 krunBrassy   = mix(vec3(0.24, 0.11, 0.08), vec3(0.42, 0.21, 0.13), t2.b);
        vec3 sputnikCream = mix(vec3(0.91, 0.88, 0.83), vec3(0.76, 0.71, 0.65), clamp(poly0.y * 0.75 + pitMargin * 0.65, 0.0, 1.0));
        vec3 eastCream    = mix(vec3(0.84, 0.79, 0.72), vec3(0.74, 0.66, 0.58), smoothstep(0.45, 0.78, t4.r));

        vec3 plutoAlb = mix(midTan, lowellOchre, lowellPolar * 0.76);
        plutoAlb = mix(plutoAlb, mix(krunBrassy, cthulhuRed, clamp(cthulhuBody, 0.0, 1.0)), darkTholin * 0.92);
        plutoAlb = mix(plutoAlb, vec3(0.45, 0.20, 0.14), virgilFossae * 0.70);
        plutoAlb = mix(plutoAlb, vec3(0.62, 0.56, 0.58), tartarusBlades * 0.48); // Bluish-grey methane blade crests
        plutoAlb = mix(plutoAlb, eastCream, eastMantle * 0.90);
        plutoAlb = mix(plutoAlb, sputnikCream, sputnikGlacier * 0.96);
        plutoAlb = mix(plutoAlb, vec3(0.58, 0.43, 0.34), clamp(sputnikMtns * 0.62, 0.0, 0.78));

        surfCol = plutoAlb * plutoDiff * 1.16 * starTint + plutoAlb * 0.004;
        // New Horizons multi-layered detached blue photochemical tholin haze (~20 fine buoyancy-wave strata!)
        float limbGrazing = max(1.0 - viewN, 0.0);
        float hazeStrata  = 0.78 + 0.22 * sin(limbGrazing * 52.0);
        float fwd = pow(max(dot(viewDir, -lightDir), 0.0), 3.4);
        atmoCol = vec3(0.36, 0.68, 1.00) * pow(max(limbGrazing, 0.0), 3.1) * hazeStrata *
                  (0.15 * smoothstep(-0.26, 0.52, ndotl) + 0.46 * fwd);

      } else if (pType < 13.5) {
        // === IO (Galilean Moon I: a=421,700 km, R=1,821.6 km — Pele Red Ring, Loki Horseshoe Lake, Tvashtar & Chaac) ===
        // Centered on t=0 sunlit anti-Jovian hero hemisphere (+165°) while populating all 360° of longitude!
        vec2 ll = vec2(wrapDeg(degrees(bodyLon) - 165.0), latDeg);

        // 1) Pele (-18.7°S, -8.0°): 1,300-km elongated red S3/S4 pyroclastic plume ring + Pillan dark silicate ash blanket!
        vec2 dPeleVec  = vec2(wrapDeg(ll.x - (-8.0)) * 0.88, (ll.y - (-18.7)) * 1.06);
        float dPele    = length(dPeleVec);
        float peleRing = exp(-sqr((dPele - 17.2) / 4.8)) * (0.82 + 0.18 * t3.g);
        float peleCore = exp(-sqr(dPele / 2.6));
        float pillanAsh = ellipBlob(ll, vec2(4.5, -12.3), vec2(6.2, 5.2), 0.25);

        // 2) Loki Patera (+13.0°N, +19.5°): 202-km black basaltic lava lake enclosing a bright sulfur-frosted horseshoe island!
        vec2 dLoki = vec2(wrapDeg(ll.x - 19.5), ll.y - 13.0);
        float rLoki = length(dLoki / vec2(5.4, 4.4));
        float lokiLake   = sstepInv(1.05, 0.72, rLoki);
        float lokiIsland = sstepInv(0.58, 0.26, length((dLoki - vec2(0.4, 0.3)) / vec2(3.2, 2.5))) *
                           smoothstep(-1.2, 0.8, dLoki.x + dLoki.y * 0.6);
        float lokiMask   = clamp(lokiLake - lokiIsland * 0.88, 0.0, 1.0);

        // 3) Tvashtar Paterae (+62.8°N, -24.0°): giant northern red/white S2/SO2 plume ring & incandescent lava curtain!
        float dTvash     = length(vec2(wrapDeg(ll.x - (-24.0)) * 0.52, ll.y - 62.8));
        float tvashRing  = exp(-sqr((dTvash - 11.5) / 3.8));
        float tvashCore  = exp(-sqr(dTvash / 2.4));

        // 4) Chaac Patera (+11.9°N, -31.0°) olive-green floor + Culann (-20.2°S, -36°) + Prometheus (+152°, -1.5°S) on opposite side
        float chaacOlive = ellipBlob(ll, vec2(-31.0,  11.9), vec2(3.8, 3.0),  0.15);
        float culannRed  = ellipBlob(ll, vec2(-36.5, -20.2), vec2(6.5, 5.5), -0.20);
        float dProm      = length(vec2(wrapDeg(ll.x - 152.0), ll.y - (-1.5)));
        float promFrost  = exp(-sqr((dProm - 9.5) / 3.2));
        float promCore   = exp(-sqr(dProm / 2.4));

        float sulfurField = t1.g * 0.48 + t2.r * 0.34 + t3.b * 0.18;
        float whiteFrost  = clamp(smoothstep(0.66, 0.85, t2.b * 0.62 + t3.g * 0.38) * sstepInv(72.0, 44.0, abs(latDeg)) + promFrost * 0.75, 0.0, 1.0);
        float darkPaterae = smoothstep(0.81, 0.89, t3.r * 0.58 + t4.g * 0.46);
        float polarDark   = smoothstep(50.0, 80.0, abs(latDeg));

        // Rich sulfur allotrope palette: pale lemon S8, saffron-gold, orange-amber, SO2 frost & brick-red S3/S4
        vec3 ioAlb = mix(vec3(0.83, 0.71, 0.20), vec3(0.95, 0.89, 0.40), smoothstep(0.28, 0.74, sulfurField));
        ioAlb = mix(ioAlb, vec3(0.84, 0.47, 0.15), smoothstep(0.54, 0.80, t1.r) * 0.62);
        ioAlb = mix(ioAlb, vec3(0.96, 0.95, 0.90), whiteFrost * 0.80);
        ioAlb = mix(ioAlb, vec3(0.42, 0.51, 0.21), clamp(chaacOlive * 0.85 + culannRed * 0.25, 0.0, 0.85)); // Galileo olive-green!
        ioAlb = mix(ioAlb, vec3(0.77, 0.22, 0.11), clamp(peleRing * 0.86 + tvashRing * 0.72 + culannRed * 0.58, 0.0, 0.90));
        ioAlb = mix(ioAlb, vec3(0.20, 0.18, 0.16), pillanAsh * 0.78);
        ioAlb = mix(ioAlb, vec3(0.50, 0.34, 0.19), polarDark * 0.58);
        float calderaBlack = clamp(lokiMask * 0.95 + peleCore + tvashCore + promCore + darkPaterae * 0.82, 0.0, 0.96);
        ioAlb = mix(ioAlb, vec3(0.08, 0.07, 0.065), calderaBlack);

        // Subtle volcanic patera & mountain relief (Boösaule / Haemus Montes)
        vec3 wTanU = normalize(cross(nrm, abs(nrm.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
        vec3 bumpedN = normalize(nrm + wTanU * (t3.r - t4.g) * 0.10);
        float ioDiff = smoothstep(-0.08, 0.86, dot(bumpedN, lightDir)) * max(0.0, dot(bumpedN, lightDir) + 0.06) * eclipseShadow;

        // Nightside / terminator glowing silicate lava fountains (Pele, Tvashtar, Loki margin, Prometheus)
        float hotLava = clamp(peleCore * 1.1 + tvashCore * 1.2 + exp(-sqr((rLoki - 0.88) / 0.12)) * 0.65 + promCore * 0.8 + darkPaterae * 0.25, 0.0, 1.3);
        vec3 lavaGlow = kelvinToRgb(1680.0) * hotLava * 0.42 * sstepInv(0.14, -0.22, ndotl);
        surfCol = ioAlb * ioDiff * 1.08 * starTint + lavaGlow + ioAlb * 0.004;

        // Faint blue-violet SO2 volcanic umbrella plume glow on the limb near Tvashtar (+63°N) & Pele (-19°S)!
        float plumeLatMask = exp(-sqr((latDeg - 62.8) / 16.0)) + exp(-sqr((latDeg - (-18.7)) / 18.0)) * 0.85 + exp(-sqr((latDeg - (-1.5)) / 14.0)) * 0.5;
        float limbPlume = pow(max(1.0 - viewN, 0.0), 3.6) * clamp(plumeLatMask, 0.0, 1.2) * smoothstep(-0.35, 0.45, ndotl);
        atmoCol = vec3(0.42, 0.68, 1.00) * limbPlume * 0.22;

      } else if (pType < 14.5) {
        // === EUROPA (Galilean Moon II: a=671,034 km, R=1,560.8 km — Cycloidal Double-Ridge Lineae, Conamara & Pwyll Rays) ===
        vec2 ll = vec2(wrapDeg(degrees(bodyLon) - 42.0), latDeg);

        // 4 intersecting families of Galileo double-ridge cycloidal Lineae (paired raised levees + central trough!)
        vec2 r1 = outer_doubleRidge(localN.x * 7.4 + localN.y * 5.1 + t2.r * 0.85, 0.022, 0.013);
        vec2 r2 = outer_doubleRidge(localN.z * 8.1 - localN.y * 6.3 + t2.g * 0.90, 0.020, 0.012);
        vec2 r3 = outer_doubleRidge((localN.x - localN.z) * 11.2 + t3.b * 0.72,   0.017, 0.010);
        vec2 r4 = outer_doubleRidge((localN.x + localN.y * 1.3 + localN.z * 0.6) * 14.8 + t3.r * 0.55, 0.014, 0.009);
        float lineaeSalt = clamp(r1.y * 0.85 + r2.y * 0.82 + r3.y * 0.65 + r4.y * 0.48, 0.0, 1.0);
        float ridgeH     = r1.x * 0.45 + r2.x * 0.42 + r3.x * 0.30 + r4.x * 0.22;

        // Conamara Chaos (+9.7°N, +8.0°) & Thera/Thrace Maculae (-45°S, -8.0°): disrupted icebergs in reddish briny matrix!
        float conamara   = ellipBlob(ll, vec2( 8.0,   9.7), vec2(12.5,  9.5),  0.18);
        float theraMac   = ellipBlob(ll, vec2(-8.0, -45.5), vec2(10.5,  8.0), -0.15);
        float lenticulae = smoothstep(0.74, 0.88, t3.g * 0.62 + t4.r * 0.42) * 0.48;
        float iceRafts   = smoothstep(0.56, 0.78, t4.b); // Bright intact ice-raft blocks floating inside Conamara Chaos!
        float chaosMask  = clamp((conamara + theraMac * 0.90) * (1.0 - iceRafts * 0.45) +
                                 smoothstep(0.68, 0.85, t1.b * 0.7 + t2.g * 0.3) * 0.45 + lenticulae, 0.0, 1.0);

        // Trailing-hemisphere reddish-amber sulfur-ion radiolysis bullseye tint vs brighter bluish-white leading ice
        float trailingStain = 0.5 + 0.5 * sin(radians(ll.x - 35.0)) * cos(latRad);

        // Pwyll Impact Crater (-25.2°S, -14.0°): dark reddish-brown excavated floor/halo + 1,000-km dazzling white ejecta rays!
        vec2 dPwyll = vec2(wrapDeg(ll.x - (-14.0)) * 0.90, ll.y - (-25.2));
        float rPw   = length(dPwyll);
        float angPw = atan(dPwyll.y, dPwyll.x + 1e-6);
        float pwyllDarkBlanket = exp(-sqr(rPw / 2.9));
        float pwyllRays = exp(-rPw / 26.0) * smoothstep(1.6, 3.8, rPw) *
                          pow(max(0.5 + 0.5 * cos(angPw * 10.0 + t2.r * 2.8), 0.0), 2.7) + exp(-sqr(rPw / 1.1));

        vec3 iceWhite  = mix(vec3(0.79, 0.82, 0.84), vec3(0.91, 0.93, 0.94), t2.b);
        iceWhite = mix(iceWhite, vec3(0.80, 0.72, 0.62), trailingStain * 0.28);
        vec3 saltRust  = mix(vec3(0.50, 0.27, 0.16), vec3(0.65, 0.41, 0.26), t3.r);
        vec3 eurAlb = mix(iceWhite, saltRust, clamp(lineaeSalt * 0.74 + chaosMask * 0.68, 0.0, 0.88));
        eurAlb = mix(eurAlb, vec3(0.42, 0.23, 0.15), pwyllDarkBlanket * 0.72);
        eurAlb = mix(eurAlb, vec3(0.96, 0.97, 0.99), clamp(pwyllRays * 0.86, 0.0, 0.92));

        // 3D double-ridge & chaos bump normal
        vec3 wTanU = normalize(cross(nrm, abs(nrm.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
        vec3 wTanV = cross(nrm, wTanU);
        vec3 bumpedN = normalize(nrm + wTanU * (r1.x - r2.x) * 0.11 + wTanV * (r3.x - r4.x + (iceRafts - 0.5) * conamara * 0.4) * 0.09);
        float eurDiff = smoothstep(-0.08, 0.86, dot(bumpedN, lightDir)) * max(0.0, dot(bumpedN, lightDir) + 0.06) * eclipseShadow;
        surfCol = eurAlb * eurDiff * (1.03 + ridgeH * 0.05) * starTint + eurAlb * 0.004;

      } else if (pType < 15.5) {
        // === GANYMEDE (Galilean Moon III: a=1,070,412 km, R=2,634.1 km — Dark Galileo Regio, Uruk Sulcus & Polar Frost) ===
        vec2 ll = vec2(wrapDeg(degrees(bodyLon) + 140.0), latDeg);
        vec2 llW = ll + vec2((t2.r - 0.5) * 5.0, (t2.b - 0.5) * 4.0);

        // Ancient heavily-cratered dark clay-ice provinces: Galileo Regio (+34°N, -18°), Marius Regio (-8°S, +26°), Nicholson (-16°S, +135°)
        float galileoRegio = ellipBlob(llW, vec2(-20.0,  33.0), vec2(32.0, 22.0), -0.28);
        float mariusRegio  = ellipBlob(llW, vec2( 25.0,  -9.0), vec2(24.0, 18.0),  0.18) +
                             ellipBlob(llW, vec2(-58.0, -18.0), vec2(20.0, 15.0),  0.10) * 0.85;
        float farsideDark  = ellipBlob(llW, vec2(135.0, -15.0), vec2(32.0, 20.0), -0.15) +
                             ellipBlob(llW, vec2(-145.0, 22.0), vec2(26.0, 18.0),  0.20) * 0.85;
        // Bright Uruk Sulcus & Tiamat Sulcus tectonic Rift corridors slicing cleanly between Galileo and Marius Regio!
        float urukSulcus   = segField(llW, vec2(-38.0, 48.0), vec2(12.0, -18.0), 6.2);
        float tiamatSulcus = segField(llW, vec2(  4.0, 26.0), vec2( 8.0, -32.0), 5.5);
        float darkRaw = max(galileoRegio, max(mariusRegio * 0.92, farsideDark * 0.90)) * (1.0 - clamp(urukSulcus * 0.85 + tiamatSulcus * 0.80, 0.0, 0.92));
        float darkTerrain = smoothstep(0.26, 0.60, darkRaw + (t1.r - 0.5) * 0.24);

        // Concentric ancient furrow arcs + Memphis Facula white palimpsest (+14°N, -12°) inside Galileo Regio
        float dFurrow = length(vec2(wrapDeg(ll.x - (-24.0)) * 0.84, ll.y - 30.0));
        float furrows = (0.5 + 0.5 * cos(dFurrow * 2.4 + t3.r * 2.0)) * galileoRegio * 0.35;
        float memphisPalimpsest = exp(-sqr(length(vec2(wrapDeg(ll.x - (-12.0)), ll.y - 16.0)) / 3.8));

        // Cross-cutting multi-directional tectonic fault-block grooves inside bright Sulci!
        float grooves1 = 0.5 + 0.5 * sin((localN.x * 26.0 + localN.y * 28.0) + t2.g * 3.8);
        float grooves2 = 0.5 + 0.5 * sin((localN.z * 32.0 - localN.y * 20.0) + t3.b * 3.2);
        float sulcusGroove = mix(grooves1, grooves2, smoothstep(0.35, 0.65, t1.b));

        // Magnetospheric open-field-line plasma sputtering Polar Water-Ice Frost Caps (|lat| > 40°)!
        float polarFrost = smoothstep(39.0, 62.0, abs(latDeg) + (t2.g - 0.5) * 5.0);

        // Fresh dazzling white ray craters: Osiris (-38°S, +16°), Tros (+11°N, -28°) + cellular craters
        vec2 dOsiris = vec2(wrapDeg(ll.x - 16.0) * 0.79, ll.y - (-38.0));
        float rOsi   = length(dOsiris);
        float rayOsi = exp(-rOsi / 16.0) * pow(max(0.5 + 0.5 * cos(atan(dOsiris.y, dOsiris.x + 1e-6) * 9.0 + t2.r * 2.5), 0.0), 2.8) + exp(-rOsi / 2.0);
        vec2 dTros   = vec2(wrapDeg(ll.x - (-28.0)), ll.y - 11.0);
        float rTros  = length(dTros);
        float rayTros = exp(-rTros / 13.0) * pow(max(0.5 + 0.5 * cos(atan(dTros.y, dTros.x + 1e-6) * 8.0 + t3.g * 2.5), 0.0), 2.8) + exp(-rTros / 1.8);

        vec3 tU = normalize(cross(localN, abs(localN.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
        vec3 tV = cross(localN, tU);
        float h0 = evalCraterHeight(localN * 1.35) * mix(0.55, 1.0, darkTerrain) + sulcusGroove * 0.08 * (1.0 - darkTerrain);
        float hX = evalCraterHeight(normalize(localN + tU * 0.009) * 1.35) * mix(0.55, 1.0, darkTerrain);
        float hY = evalCraterHeight(normalize(localN + tV * 0.009) * 1.35) * mix(0.55, 1.0, darkTerrain);
        vec3 wTanU = normalize(cross(nrm, abs(nrm.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
        vec3 wTanV = cross(nrm, wTanU);
        vec3 bumpedN = normalize(nrm - (wTanU * (hX - h0) + wTanV * (hY - h0)) * 2.1);
        float ganDiff = smoothstep(-0.08, 0.86, dot(bumpedN, lightDir)) * max(0.0, dot(bumpedN, lightDir) + 0.06) * eclipseShadow;

        vec3 ganDark   = mix(vec3(0.22, 0.19, 0.17), vec3(0.30, 0.26, 0.23), furrows + t3.r * 0.35);
        vec3 ganSulcus = mix(vec3(0.47, 0.45, 0.41), vec3(0.62, 0.60, 0.56), sulcusGroove);
        vec3 ganAlb    = mix(ganSulcus, ganDark, darkTerrain * 0.88);
        ganAlb = mix(ganAlb, vec3(0.66, 0.64, 0.60), memphisPalimpsest * 0.65);
        ganAlb = mix(ganAlb, vec3(0.73, 0.76, 0.81), polarFrost * 0.54);
        float microRays = pow(clamp(t3.r * 0.58 + t4.b * 0.48, 0.0, 1.0), 5.2);
        float allRays = clamp(rayOsi * 0.86 + rayTros * 0.82 + microRays * 0.55 + max(0.0, h0) * 0.22, 0.0, 0.92);
        ganAlb = mix(ganAlb, vec3(0.88, 0.90, 0.93), allRays);
        surfCol = ganAlb * ganDiff * 1.14 * starTint + ganAlb * 0.004;

      } else if (pType < 16.5) {
        // === CALLISTO (Galilean Moon IV: a=1,882,700 km, R=2,410.3 km — Dark Crust, Valhalla & Asgard Multi-Ring Basins) ===
        vec2 ll = vec2(wrapDeg(degrees(bodyLon) - 38.0), latDeg);

        // 1) Valhalla (+14.7°N, -8.0°): 3,800-km concentric multi-ring impact basin + bright 600-km central palimpsest!
        float dVal = length(vec2(wrapDeg(ll.x - (-8.0)) * 0.96, ll.y - 14.7));
        float valCore  = sstepInv(9.5, 3.2, dVal);
        float valWave  = pow(max(0.5 + 0.5 * cos(dVal * 2.15 + t3.r * 0.8), 0.0), 2.4);
        float valRings = exp(-dVal / 24.0) * valWave * smoothstep(4.5, 9.5, dVal) * sstepInv(46.0, 36.0, dVal);

        // 2) Asgard (+32.0°N, +42.0°): 1,600-km second major concentric multi-ring palimpsest!
        float dAsg = length(vec2(wrapDeg(ll.x - 42.0) * 0.85, ll.y - 32.0));
        float asgCore  = sstepInv(5.5, 1.8, dAsg);
        float asgRings = exp(-dAsg / 13.5) * pow(max(0.5 + 0.5 * cos(dAsg * 2.8 + t3.g * 0.8), 0.0), 2.4) * smoothstep(2.8, 5.8, dAsg);

        // 3) Named fresh bright white water-ice craters: Lofn (-56.5°S, -22°) & Bran (-24.2°S, +28°)
        float cLofn = exp(-sqr(length(vec2(wrapDeg(ll.x - (-22.0)) * 0.56, ll.y - (-56.5))) / 2.6));
        float cBran = exp(-sqr(length(vec2(wrapDeg(ll.x - 28.0) * 0.91,   ll.y - (-24.2))) / 2.2));

        // Saturated 3D cratered regolith + pinpoint white ice-rimmed craters!
        vec3 tU = normalize(cross(localN, abs(localN.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
        vec3 tV = cross(localN, tU);
        float h0 = evalCraterHeight(localN * 1.65) + evalCellularCraterLayer(localN, 58.0, 8.3, 0.0) * 0.16 + (valRings + asgRings) * 0.14;
        float hX = evalCraterHeight(normalize(localN + tU * 0.0085) * 1.65) + evalCellularCraterLayer(normalize(localN + tU * 0.0085), 58.0, 8.3, 0.0) * 0.16;
        float hY = evalCraterHeight(normalize(localN + tV * 0.0085) * 1.65) + evalCellularCraterLayer(normalize(localN + tV * 0.0085), 58.0, 8.3, 0.0) * 0.16;
        vec3 wTanU = normalize(cross(nrm, abs(nrm.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
        vec3 wTanV = cross(nrm, wTanU);
        vec3 bumpedN = normalize(nrm - (wTanU * (hX - h0) + wTanV * (hY - h0)) * 2.35);
        float calDiff = smoothstep(-0.08, 0.86, dot(bumpedN, lightDir)) * max(0.0, dot(bumpedN, lightDir) + 0.06) * eclipseShadow;

        // Very dark carbonaceous-silicate lag crust peppered with gleaming white ice-excavating pinpoint craters!
        float pinpointPocks = pow(clamp(t4.r * 0.58 + t4.b * 0.50, 0.0, 1.0), 5.4) + smoothstep(0.14, 0.36, h0) * 0.72;
        vec3 calAlb = mix(vec3(0.135, 0.122, 0.110), vec3(0.210, 0.190, 0.170), t2.r * 0.7 + t1.g * 0.3);
        calAlb = mix(calAlb, vec3(0.58, 0.54, 0.48), clamp((valCore + asgCore) * 0.70 + (valRings + asgRings) * 0.56, 0.0, 0.84));
        calAlb = mix(calAlb, vec3(0.86, 0.88, 0.91), clamp(pinpointPocks * 0.78 + (cLofn + cBran) * 0.88, 0.0, 0.94));
        surfCol = calAlb * calDiff * 1.24 * starTint + calAlb * 0.004;

      } else if (pType < 17.5) {
        // === ENCELADUS (Saturnian Moon: a=238,037 km, R=252.1 km — 0.99-Albedo Snowglobe, 4 Tiger Stripes & Plume!) ===
        // 4 parallel South Polar Tiger Stripes (Alexandria, Cairo, Baghdad, Damascus Sulci: lat < -55°S)
        float sptMask = sstepInv(-53.0, -64.0, latDeg);
        float sptDichotomyRim = exp(-sqr((latDeg - (-55.5)) / 2.2)) * (0.65 + 0.35 * sin(bodyLon * 9.0));
        // Project south polar cap onto parallel stripe coordinate uStripe
        float uStripe = localN.x * 0.86 + localN.z * 0.51 + (t2.r - 0.5) * 0.045;
        float sAlex   = exp(-sqr((uStripe - (-0.21)) / 0.022));
        float sCairo  = exp(-sqr((uStripe - (-0.07)) / 0.022));
        float sBaghd  = exp(-sqr((uStripe -   0.07)  / 0.024));
        float sDamas  = exp(-sqr((uStripe -   0.21)  / 0.022));
        float tigerCore = clamp((sAlex + sCairo + sBaghd + sDamas) * sptMask, 0.0, 1.0);
        float tigerFlank = clamp((exp(-sqr((uStripe - (-0.21)) / 0.048)) + exp(-sqr((uStripe - (-0.07)) / 0.048)) +
                                  exp(-sqr((uStripe -   0.07)  / 0.050)) + exp(-sqr((uStripe -   0.21)  / 0.048))) * sptMask - tigerCore, 0.0, 1.0);

        // Tectonic grooved Samarkand/Sarandib plains vs lightly cratered northern cratered plains
        float craterMask = smoothstep(-10.0, 42.0, latDeg) * smoothstep(0.35, 0.68, t1.r);
        float sulciWaves = (0.5 + 0.5 * sin(localN.x * 34.0 + localN.y * 22.0 + t2.g * 3.2)) * (1.0 - craterMask) * (1.0 - sptMask);
        float cNorth = evalCellularCraterLayer(localN, 22.0, 3.9, 0.0) * craterMask * 0.22;

        vec3 wTanU = normalize(cross(nrm, abs(nrm.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
        vec3 bumpedN = normalize(nrm + wTanU * ((tigerFlank - tigerCore) * 0.18 + (sulciWaves - 0.5) * 0.08 + cNorth * 0.5));
        float encDiff = (smoothstep(-0.10, 0.84, dot(bumpedN, lightDir)) * 0.85 + 0.18 * max(0.0, ndotl + 0.10)) * eclipseShadow;

        // Dazzling 0.99 geometric albedo fresh snowglobe + blue-mint coarse crystalline water-ice Tiger Stripes!
        vec3 encSnow = mix(vec3(0.91, 0.94, 0.97), vec3(0.98, 0.99, 1.00), t2.g * 0.65 + sulciWaves * 0.35);
        encSnow = mix(encSnow, vec3(0.83, 0.89, 0.94), sptDichotomyRim * 0.35);
        encSnow = mix(encSnow, vec3(0.34, 0.72, 0.88), tigerCore * 0.82);
        encSnow = mix(encSnow, vec3(0.68, 0.88, 0.96), tigerFlank * 0.45);
        surfCol = encSnow * encDiff * 0.98 * starTint + encSnow * 0.006;

        // Backlit Cassini South Polar Cryovolcanic Geyser Plume (ice-grain Mie forward-scatter jets over South Pole)!
        float fwdPlume = 0.32 + 1.45 * pow(max(dot(viewDir, -lightDir), 0.0), 3.0);
        float jetStreaks = 0.72 + 0.28 * sin(bodyLon * 14.0 + viewN * 8.0);
        float spPlume = sstepInv(-42.0, -78.0, latDeg) * pow(max(1.0 - viewN, 0.0), 2.4) * jetStreaks * smoothstep(-0.45, 0.45, ndotl);
        atmoCol = vec3(0.66, 0.88, 1.00) * spPlume * fwdPlume * 0.36;

      } else if (pType < 18.5) {
        // === TITAN (Saturnian Moon: a=1,221,870 km, R=2,574.7 km — Tholin Haze, Dune Hints, Polar Hood & Detached Blue Haze) ===
        // Centered so equatorial dark hydrocarbon dune seas (Shangri-La, Senkyo, Fensal-Aztlan) & bright Xanadu show subtly
        vec2 ll = vec2(wrapDeg(degrees(bodyLon) + 155.0), latDeg);
        vec2 llW = ll + vec2((t2.r - 0.5) * 6.0, (t2.g - 0.5) * 4.5);

        float shangriLa = ellipBlob(llW, vec2(-12.0,  -8.5), vec2(34.0, 11.5),  0.05) + // Shangri-La & Senkyo dark dune seas
                          ellipBlob(llW, vec2(-68.0,   6.0), vec2(26.0,  9.5), -0.08) + // Fensal-Aztlan
                          ellipBlob(llW, vec2(118.0,  -7.0), vec2(32.0, 10.5),  0.04);  // Belet sand sea
        float xanadu    = ellipBlob(llW, vec2( 42.0, -10.0), vec2(22.0, 12.0),  0.10);  // Bright Xanadu continent

        // Cassini seasonal hemispheric asymmetry + dark North Polar Hood (>50°N) & high-altitude polar vortex collar!
        float northAsym   = smoothstep(-18.0, 38.0, latDeg);
        float northHood   = smoothstep(48.0, 76.0, latDeg);
        float hoodCollar  = exp(-sqr((latDeg - 56.0) / 5.5));

        vec3 titanGold = mix(vec3(0.89, 0.63, 0.28), vec3(0.81, 0.53, 0.21), northAsym * 0.55 + (t1.g - 0.5) * 0.08);
        // Weak red/near-IR scattering glimpse of dark equatorial dune seas & Xanadu through thick optical-depth smog (~9% contrast)
        float centerVis = pow(max(viewN, 0.0), 0.75); // Fades out toward limb as slant optical path thickens!
        titanGold = mix(titanGold, vec3(0.71, 0.45, 0.17), clamp(shangriLa, 0.0, 1.0) * 0.12 * centerVis);
        titanGold = mix(titanGold, vec3(0.94, 0.69, 0.34), xanadu * 0.08 * centerVis);
        titanGold = mix(titanGold, vec3(0.66, 0.40, 0.15), (northHood * 0.44 + hoodCollar * 0.16));

        float mieDiff = pow(clamp(ndotl * 0.85 + 0.19, 0.0, 1.0), 0.82) * (0.66 + 0.34 * pow(max(viewN, 0.0), 0.50)) * eclipseShadow;
        surfCol = titanGold * mieDiff * 1.02 * starTint + titanGold * 0.004;

        // Detached Cassini high-altitude cyan-blue stratospheric haze layer (~350-500 km) + forward Mie twilight glow!
        float limbT = max(1.0 - viewN, 0.0);
        float detachedBand = pow(max(limbT, 0.0), 2.9) * (0.82 + 0.26 * exp(-sqr((limbT - 0.84) / 0.08)));
        float fwdT = 1.0 + 0.85 * pow(max(dot(viewDir, -lightDir), 0.0), 3.2);
        atmoCol = vec3(0.30, 0.69, 0.98) * detachedBand * smoothstep(-0.32, 0.55, ndotl) * fwdT * 0.36;

      } else {
        // === TRITON (Neptunian Retrograde Moon: a=354,759 km, R=1,353.4 km — Pink N2 Cap, Geyser Streaks & Cantaloupe!) ===
        // Centered on Voyager 2 sunlit southern-summer hemisphere
        vec2 ll = vec2(wrapDeg(degrees(bodyLon) + 135.0), latDeg);

        // Scalloped pinkish-cream Southern Nitrogen/Methane Polar Cap + bluish-white fresh N2 equatorial frost collar!
        float capEdgeLat = -9.5 + (t1.g - 0.5) * 11.0 + (t2.r - 0.5) * 5.0;
        float southCap   = sstepInv(capEdgeLat + 4.5, capEdgeLat - 7.5, latDeg);
        float blueFrostCollar = exp(-sqr((latDeg - (capEdgeLat + 3.5)) / 5.2)) * (0.65 + 0.35 * t2.b);

        // Bubembe Regio "Cantaloupe Terrain" (closely-packed 3D diapiric cavi cells + intersecting Slidr/Tano Sulci ridges!)
        vec2 cantCells = outer_polygonalCells(localN, 26.0);
        vec2 sulcA = outer_doubleRidge(localN.x * 9.5 + localN.y * 6.8 + t2.g * 0.7, 0.020, 0.012);
        vec2 sulcB = outer_doubleRidge(localN.z * 10.2 - localN.y * 5.4 + t2.b * 0.7, 0.018, 0.011);
        // Ruach & Tuonela Planitia smooth cryovolcanic walled plains (+24°, +16°N)
        float cryolake = ellipBlob(ll, vec2(24.0, 16.0), vec2(11.0, 8.5), 0.15) * (1.0 - southCap);

        // Voyager 2 Active Nitrogen Geyser Dark Wind-Blown Streaks!
        // Hili Plume (-57°S, +10°), Mahilani Plume (-49°S, -14°), plus secondary south-cap vents sheared westward (-ll.x)!
        vec2 dHili = vec2(wrapDeg(ll.x - 10.0), ll.y - (-57.0));
        float hiliStreak = smoothstep(-22.0, -0.5, dHili.x) * sstepInv(1.2, -0.5, dHili.x) *
                           exp(-sqr(dHili.y / (1.0 + max(0.0, -dHili.x) * 0.085))) * exp(-max(0.0, -dHili.x) / 14.0);
        vec2 dMahi = vec2(wrapDeg(ll.x - (-14.0)), ll.y - (-49.0));
        float mahiStreak = smoothstep(-20.0, -0.5, dMahi.x) * sstepInv(1.2, -0.5, dMahi.x) *
                           exp(-sqr((dMahi.y - max(0.0, -dMahi.x) * 0.06) / (0.95 + max(0.0, -dMahi.x) * 0.08))) * exp(-max(0.0, -dMahi.x) / 13.0);
        // Field of smaller wind-sheared dark nitrogen geyser fans across the southern polar cap
        float geyserField = southCap * smoothstep(-74.0, -24.0, latDeg) *
                            smoothstep(0.76, 0.90, textureLod(uNoise3D, vec3(ll.x * 0.035, ll.y * 0.18, 0.52), 0.0).r);
        float allPlumes = clamp(hiliStreak * 0.95 + mahiStreak * 0.92 + geyserField * 0.72, 0.0, 1.0);

        // 3D Cantaloupe diapir & Sulci relief normal
        vec3 tU = normalize(cross(localN, abs(localN.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
        vec3 wTanU = normalize(cross(nrm, abs(nrm.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
        vec3 wTanV = cross(nrm, wTanU);
        float cantRough = (1.0 - southCap * 0.82) * (1.0 - cryolake * 0.80);
        float h0 = cantCells.x * 0.12 * cantRough + (sulcA.x + sulcB.x) * 0.09 * (1.0 - southCap * 0.7);
        float hX = outer_polygonalCells(normalize(localN + tU * 0.008), 26.0).x * 0.12 * cantRough;
        vec3 bumpedN = normalize(nrm - wTanU * (hX - h0) * 2.2 + wTanV * (sulcA.x - sulcB.x) * 0.08);
        float triDiff = smoothstep(-0.08, 0.86, dot(bumpedN, lightDir)) * max(0.0, dot(bumpedN, lightDir) + 0.06) * eclipseShadow;

        vec3 cantCol = mix(vec3(0.60, 0.61, 0.57), vec3(0.75, 0.73, 0.68), smoothstep(-0.6, 0.6, cantCells.x));
        cantCol = mix(cantCol, vec3(0.68, 0.69, 0.67), cryolake * 0.65);
        cantCol = mix(cantCol, vec3(0.79, 0.77, 0.74), clamp((sulcA.y + sulcB.y) * 0.42, 0.0, 0.65));

        vec3 pinkCap = mix(vec3(0.86, 0.75, 0.75), vec3(0.94, 0.86, 0.85), t2.g * 0.7 + t3.r * 0.3);
        vec3 triAlb = mix(cantCol, pinkCap, southCap * 0.92);
        triAlb = mix(triAlb, vec3(0.82, 0.89, 0.95), blueFrostCollar * 0.52); // Voyager 2 bluish N2 frost margin!
        triAlb = mix(triAlb, vec3(0.26, 0.22, 0.22), allPlumes * 0.78);

        surfCol = triAlb * triDiff * 1.05 * starTint + triAlb * 0.004;
        // Thin Voyager 2 nitrogen/methane limb haze (0-30 km altitude)
        float fwdTr = pow(max(dot(viewDir, -lightDir), 0.0), 3.2);
        atmoCol = vec3(0.56, 0.80, 0.98) * pow(max(1.0 - viewN, 0.0), 3.4) * (0.14 * smoothstep(-0.24, 0.55, ndotl) + 0.24 * fwdTr);
      }
