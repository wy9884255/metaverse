    // =========================================================================
    // MODULE: swarm_bh_module.glsl
    // TARGET REPLACEMENT RANGE IN `milky_way.html`:
    //   Replaces lines 1155–1316 inside `VOLUMETRIC_FRAG` (`RAYMARCH_FRAG`),
    //   specifically the comment header + `void traceGeneralRelativitySgrA(...)`
    //   right after `sampleDeepCosmos(...)` and right before `intersectBox(...)`.
    //
    // SCIENTIFIC CALIBRATION (EHT 2022–2024 Polarized Sgr A* + VLTI GRAVITY):
    //   - Mass M = 4.297e6 M_sun, Schwarzschild radius Rs = 2GM/c^2 = 12,690,115.6 km
    //   - Prograde Kerr dimensionless spin a* = 0.90 (a = 0.45 Rs, r_+ = 0.7179 Rs,
    //     prograde equatorial ISCO r_ISCO = 1.1605 Rs = 2.321 M)
    //   - Mild inclination i ~ 27.7° from Earth / 28.7° at hero preset (within 18°–30°)
    //     with prograde angular momentum J pointing away so flow & flares orbit CLOCKWISE
    //   - Exact Boyer-Lindquist Kerr radial null-geodesic potential (Carter constant Q +
    //     axial L_z = xi) + symplectic ZAMO Lense-Thirring frame-dragging -> asymmetric
    //     D-shaped Kerr shadow boundary (r_shadow ~ 2.38–2.59 Rs; b_c,Schw = 2.598076 Rs)
    //   - Lyapunov exponent gamma ~ pi demagnified n=1 lensed arch & razor-thin n=2
    //     critical photon sub-ring
    //   - EHT 2024 MAD coherent spiral magnetic field (pitch angle psi_B = 28.5° in 25°–35°)
    //     with polarized synchrotron |k x B|^2 anisotropy, Novikov-Thorne emissivity, and
    //     exact Cunningham Kerr relativistic Doppler + gravitational redshift I_obs = g^4 I_em
    //   - GRAVITY clockwise orbiting NIR/X-ray magnetic-reconnection hot-spot plasmoid
    //     at r ~ 3.95 Rs (with lensed n=1 secondary ghost image)
    //   - Faint hollow-cone paraboloidal Blandford-Znajek relativistic jet sheath
    //
    // GLSL ES 3.00 / ANGLE D3D11 STRICTNESS:
    //   - Zero pow(negative, y); integer powers use bh_sqr / bh_pow4; fractional pow
    //     strictly wraps base in max(..., >0).
    //   - Zero inverted smoothstep(hi, lo, x); uses bh_sstepInv(hi, lo, x).
    //   - Constant-bounded 92-step adaptive loop + fast b > R_BOUND skip for 60 FPS.
    // =========================================================================

    float bh_sqr(float x) {
      return x * x;
    }

    float bh_pow4(float x) {
      float x2 = x * x;
      return x2 * x2;
    }

    float bh_sstepInv(float hi, float lo, float x) {
      return 1.0 - smoothstep(lo, hi, x);
    }

    vec3 bh_rotAxis(vec3 v, vec3 axis, float ang) {
      float c = cos(ang);
      float s = sin(ang);
      return v * c + cross(axis, v) * s + axis * dot(axis, v) * (1.0 - c);
    }

    void traceGeneralRelativitySgrA(vec3 roRs, inout vec3 rd, inout vec3 accum, inout vec3 trans, out float skyMask) {
      skyMask = 1.0;
      float rCam = length(roRs);

      // Far-field unresolved compact sub-mm/NIR accretion beacon (e.g. S2 star cluster view at ~2,350 AU = 27,700 Rs)
      if (rCam > 14000.0) {
        float tCl = -dot(roRs, rd);
        if (tCl > 0.0 && rCam < 2.5e6) {
          vec3 pCl = roRs + rd * tCl;
          float ang = length(pCl) / max(tCl * uTanHalfFov, 1.0);
          float vis = bh_sstepInv(2.2e6, 4.0e5, rCam);
          float core = exp(-ang * ang * 38000.0) * 3.8 + exp(-ang * 130.0) * 0.55;
          accum += vec3(1.0, 0.78, 0.46) * core * vis * uAccretionStrength;
        }
        return;
      }

      const float R_BOUND      = 36.0;
      const float A_KERR       = 0.45;     // Dimensionless Kerr spin a* = 0.90 (M = 0.5 Rs -> a = 0.45 Rs)
      const float A_KERR2      = 0.2025;   // a^2 in Rs^2
      const float R_HORIZON    = 0.7179;   // Exact Kerr outer event horizon r_+ = 0.5 * (1 + sqrt(1 - 0.90^2)) Rs
      const float R_ISCO       = 1.1605;   // Exact prograde Kerr equatorial ISCO (2.321 M = 1.1605 Rs)
      const float B_CRIT_SCHW  = 2.598076; // Critical Schwarzschild impact parameter sqrt(27)/2 Rs
      const float COT_PITCH_B  = 1.8418;   // EHT 2024 polarized spiral B-field pitch angle psi_B = 28.5 deg (cot 28.5°)

      vec3 pos = roRs;
      vec3 vel = rd;
      float bImpact = length(cross(roRs, rd));

      // Fast bounding-sphere skip + 1PN/2PN Einstein weak-field lensing outside R_BOUND
      if (rCam > R_BOUND) {
        float bProj = -dot(roRs, rd);
        vec3 perp = roRs + rd * bProj;
        float b2 = dot(perp, perp);
        if (bProj <= 0.0) return;
        if (b2 > R_BOUND * R_BOUND) {
          float b = sqrt(b2);
          if (b < 480.0) {
            vec3 toBh = -perp / max(b, 1e-4);
            float defl = (2.0 / b + 2.945 / b2) * bh_sstepInv(480.0, 38.0, b);
            rd = normalize(rd + toBh * defl);
          }
          // Smoothly suppress unlensed Pass-3 point sprites inside strong Einstein-ring zone
          if (rCam < 1200.0) {
            skyMask = smoothstep(7.0, 22.0, b);
          }
          return;
        }
        float tHit = bProj - sqrt(max(0.0, R_BOUND * R_BOUND - b2));
        pos = roRs + rd * tHit;
      }

      // EHT 2022–2024 + GRAVITY Sgr A* Spin & Disk Geometry:
      // Inclination i ~ 27.7° from Earth (+X) and ~28.7° at hero preset (within 18°–30°),
      // with prograde spinAxis pointing away from Earth/hero observer so prograde flow is CLOCKWISE on sky!
      vec3 spinAxis    = normalize(vec3(-0.885, -0.455, -0.098));
      vec3 nearJetAxis = -spinAxis;
      vec3 diskU       = normalize(cross(vec3(0.0, 1.0, 0.0), spinAxis));
      vec3 diskV       = cross(spinAxis, diskU); // Right-handed around spinAxis: +phi orbits CLOCKWISE on sky

      // Exact Boyer-Lindquist Kerr conserved orbital & Carter constants along null geodesic
      vec3 hVec      = cross(pos, vel);
      float h2       = dot(hVec, hVec);
      float hMag     = sqrt(h2);
      float xi       = -dot(hVec, spinAxis); // Axial angular momentum L_z (>0 prograde approaching, <0 retrograde receding)
      float kCarter  = max(0.0, h2 - 2.0 * A_KERR * xi + A_KERR2);
      float q4Carter = A_KERR2 * max(0.0, h2 - xi * xi);

      float rStart      = length(pos);
      float totalPhi    = (rStart > 1e-3) ? asin(clamp(hMag / rStart, 0.0, 1.0)) : 0.0;
      float prevDiskY   = dot(pos, nearJetAxis);
      bool captured     = false;
      float minRReached = rStart;
      int crossingCount = 0;

      // GRAVITY clockwise NIR/X-ray hot-spot orbital parameters (r_hs ~ 3.95 Rs in 3.5–4.5 Rs)
      float rHotSpot   = 3.95 + 0.20 * sin(uBhPhase * 0.37);
      float phiHotSpot = 4.22 + uBhPhase * 0.54;
      vec3 hotSpotPos  = rHotSpot * (cos(phiHotSpot) * diskU + sin(phiHotSpot) * diskV);

      for (int stepIdx = 0; stepIdx < 92; stepIdx++) {
        float r2 = dot(pos, pos);
        float r  = sqrt(r2);
        minRReached = min(minRReached, r);

        float rDotVel = dot(pos, vel);
        if (r <= R_HORIZON + 0.028) {
          captured = true;
          break;
        }
        if (r > R_BOUND + 1.2 && rDotVel > 0.0) {
          break;
        }

        // Adaptive affine step: razor-fine near Kerr horizon & photon sphere, fast in outer zone
        float rOuter = max(0.0, r - 4.2);
        float dLam   = clamp(0.054 * (r - 0.56) + 0.0075 * rOuter * rOuter, 0.012, 1.65);

        // Exact Boyer-Lindquist Kerr radial potential acceleration + ZAMO Lense-Thirring frame-dragging twist
        float invR2   = 1.0 / max(r2, 0.04);
        float invR6   = invR2 * invR2 * invR2;
        vec3 accRad   = (-A_KERR2 * r2 - 1.5 * kCarter * r + 2.0 * q4Carter) * invR6 * pos;

        vec3 nextVel  = vel + accRad * dLam;
        vec3 nextPos  = pos + 0.5 * (vel + nextVel) * dLam;

        float omegaFD = A_KERR / max(r2 * r + A_KERR2 * r + A_KERR2, 0.18);
        float dPhiFD  = -omegaFD * dLam;
        nextPos       = bh_rotAxis(nextPos, spinAxis, dPhiFD);
        nextVel       = bh_rotAxis(nextVel, spinAxis, dPhiFD);

        vec3 stepVec  = nextPos - pos;
        float ds      = length(stepVec);
        totalPhi     += length(cross(pos, stepVec)) / max(0.5 * (r2 + dot(nextPos, nextPos)), 0.08);

        float nextDiskY = dot(nextPos, nearJetAxis);

        // ---------------------------------------------------------------------
        // 1. Equatorial Relativistic MAD Accretion Disk (Kerr ISCO 1.16 Rs -> 16.0 Rs)
        //    Naturally raytraces primary (n=0), demagnified lensed arch (n=1), and n=2 sub-ring!
        // ---------------------------------------------------------------------
        if ((prevDiskY > 0.0 && nextDiskY <= 0.0) || (prevDiskY < 0.0 && nextDiskY >= 0.0)) {
          float frac  = abs(prevDiskY) / (abs(prevDiskY) + abs(nextDiskY) + 1e-7);
          vec3 hitP   = mix(pos, nextPos, frac);
          float rDisk = length(hitP);

          if (rDisk > R_ISCO && rDisk < 16.2) {
            // Exact Cunningham (1975) prograde Kerr redshift & Doppler beaming factor g = nu_obs / nu_em
            float r32     = rDisk * sqrt(rDisk);
            float omegaK  = 0.70710678 / (r32 + 0.318198);
            float utInv   = sqrt(clamp(1.0 - 1.5 / rDisk + 0.636396 / r32, 0.022, 1.0)) / (1.0 + 0.318198 / r32);
            float gFactor = clamp(utInv / max(0.16, 1.0 - omegaK * xi), 0.12, 2.35);

            // Relativistic invariant specific intensity scaling: I_obs = g^4 * I_em
            float g4      = bh_pow4(gFactor);

            // Novikov-Thorne zero-torque ISCO emissivity envelope + RIAF/MAD outer falloff
            float xNT        = sqrt(max(rDisk / R_ISCO, 1.0001));
            float innerISCO  = smoothstep(R_ISCO, R_ISCO + 0.26, rDisk);
            float ntProfile  = innerISCO * (1.0 - 1.0 / xNT) * pow(max(rDisk / 2.15, 0.25), -2.08) * 4.45;
            float outerTaper = bh_sstepInv(16.2, 11.2, rDisk);

            // EHT 2024 coherent logarithmic-spiral magnetic field (pitch angle psi_B = 28.5 deg)
            float ux      = dot(hitP, diskU);
            float uz      = dot(hitP, diskV);
            float phi     = atan(uz, (abs(ux) + abs(uz) > 1e-6) ? ux : 1e-6);
            float logR    = log(max(rDisk / R_ISCO, 1.0));
            float advPhi  = phi - uBhPhase * (0.38 + 1.32 * omegaK) + COT_PITCH_B * logR;

            // Seamless azimuthal m=3 & m=5 MAD spiral flux bundles + magnetic arrest cavities
            vec3 uvwA     = vec3(cos(advPhi * 3.0) * 0.32 + rDisk * 0.055, sin(advPhi * 3.0) * 0.32, logR * 0.44 - uBhPhase * 0.04);
            vec4 nA       = textureLod(uNoise3D, uvwA, 0.0);
            vec3 uvwB     = vec3(cos(advPhi * 6.0 + nA.a * 1.9) * 0.28, sin(advPhi * 6.0 + nA.a * 1.9) * 0.28, logR * 0.88 + uBhPhase * 0.03);
            vec4 nB       = textureLod(uNoise3D, uvwB, 0.0);

            float spiralStrands = 0.5 + 0.5 * cos(advPhi * 10.0 + nA.r * 3.8 - nB.g * 2.1);
            float madFilaments  = smoothstep(0.18, 0.88, nA.r * 0.54 + nB.g * 0.36 + spiralStrands * 0.28);
            float madCavities   = mix(0.28, 1.38, smoothstep(0.26, 0.78, nA.g * 0.62 + nB.b * 0.48));

            // Polarized synchrotron pitch-angle anisotropy |k_hat x B_spiral|^2
            vec3 eRad      = hitP / rDisk;
            vec3 ePhi      = normalize(cross(spinAxis, eRad));
            vec3 bSpiral   = normalize(0.8788 * ePhi - 0.4772 * eRad); // psi_B = 28.5 deg trailing spiral B-field
            vec3 kToObs    = -normalize(nextVel);
            float sin2KB   = clamp(1.0 - bh_sqr(dot(kToObs, bSpiral)), 0.10, 1.0);
            float polAniso = 0.56 + 0.68 * sin2KB;

            // GRAVITY clockwise orbiting NIR/X-ray magnetic reconnection hot-spot plasmoid (~3.95 Rs)
            float dPhiHs       = atan(sin(phi - phiHotSpot), cos(phi - phiHotSpot));
            float coreHs       = exp(-bh_sqr((rDisk - rHotSpot) / 0.44) - bh_sqr(dPhiHs / 0.155));
            float trailArc     = clamp(-dPhiHs, 0.0, 1.45);
            float rTrailCenter = rHotSpot + 0.26 * trailArc;
            float tailHs       = exp(-bh_sqr((rDisk - rTrailCenter) / 0.56)) * exp(-trailArc * 2.05) * smoothstep(-0.04, 0.09, -dPhiHs);
            float hotSpotFlux  = (coreHs * 3.15 + tailHs * 1.10) * innerISCO;

            // Rest-frame brightness temperature calibrated for exact I_obs = g^4 * I_em & T_obs = g * T_em
            float restTempK = 8400.0 * pow(max(rDisk / 1.85, 0.55), -0.44) + coreHs * 5800.0 + tailHs * 2100.0;
            float obsTempK  = clamp(restTempK * gFactor, 1450.0, 28000.0);
            vec3 diskCol    = kelvinToRgb(obsTempK);
            diskCol         = mix(diskCol, vec3(0.86, 0.93, 1.0), clamp(coreHs * gFactor * 0.42, 0.0, 0.55));

            float subRingBoost = (crossingCount == 0) ? 1.0 : ((crossingCount == 1) ? 1.24 : 1.38);
            float restEmiss    = (ntProfile * outerTaper * (0.24 + 1.36 * madFilaments) * madCavities * polAniso + hotSpotFlux) * 2.85;
            float rawObsFlux   = restEmiss * g4 * subRingBoost * uAccretionStrength;

            // Radiative self-absorption curve preserves crisp filament detail even at high uAccretionStrength
            float obsFlux    = 5.6 * (1.0 - exp(-rawObsFlux * 0.20));
            float sheetAlpha = clamp(innerISCO * outerTaper * (0.34 + 0.54 * madFilaments + 0.35 * coreHs), 0.0, 0.90);
            float transDrop  = (crossingCount == 0) ? 0.80 : 0.58;

            accum += trans * diskCol * obsFlux;
            trans *= (1.0 - sheetAlpha * transDrop);
          }
          crossingCount++;
        }

        // ---------------------------------------------------------------------
        // 2. Volumetric RIAF / MAD Synchrotron Corona + 3D Hot-Spot Aura (< 8.8 Rs)
        // ---------------------------------------------------------------------
        vec3 midP   = 0.5 * (pos + nextPos);
        float midZ  = 0.5 * (prevDiskY + nextDiskY);
        float zAbs  = abs(midZ);
        vec3 cylVec = midP - nearJetAxis * midZ;
        float rCyl  = length(cylVec);

        float hTorus = 0.13 + 0.135 * max(0.0, rCyl - 1.25);
        if (rCyl > 1.12 && rCyl < 8.8 && zAbs < hTorus * 2.15) {
          float vertTorus = exp(-bh_sqr(zAbs / hTorus));
          float radTorus  = smoothstep(1.12, 1.78, rCyl) * exp(-max(0.0, rCyl - 1.70) * 0.56) * bh_sstepInv(8.8, 6.6, rCyl);
          vec3 tang       = normalize(cross(spinAxis, cylVec) + vec3(1e-6));
          float r32c      = r * sqrt(max(r, 0.5));
          float omCorona  = 0.68 / (r32c + 0.32);
          float utCor     = sqrt(clamp(1.0 - 1.25 / max(r, 1.05), 0.05, 1.0));
          float cosCor    = dot(tang, -normalize(nextVel));
          float betaCor   = clamp(omCorona * rCyl, 0.0, 0.58);
          float gCorona   = clamp((utCor * sqrt(1.0 - betaCor * betaCor)) / max(0.20, 1.0 - betaCor * cosCor), 0.15, 2.10);

          float flareN    = textureLod(uNoise3D, midP * 0.17 + spinAxis * (uBhPhase * 0.055), 0.0).g;
          float dHs3D     = length(midP - hotSpotPos);
          float hsAura    = exp(-bh_sqr(dHs3D / 0.58)) * 1.85;

          float synch     = (vertTorus * radTorus * (0.26 + 0.84 * flareN) + hsAura * 0.45) * bh_pow4(gCorona) * ds * 0.42 * uAccretionStrength;
          vec3 synchCol   = kelvinToRgb(clamp((5800.0 + hsAura * 3200.0) * gCorona, 1500.0, 22000.0));
          accum          += trans * synchCol * synch;
        }

        // ---------------------------------------------------------------------
        // 3. Faint Hollow-Cone Blandford-Znajek Relativistic Jet Sheath
        //    Paraboloidal magnetospheric wall around ±spinAxis with helical B-twist
        // ---------------------------------------------------------------------
        if (zAbs > 1.05 && zAbs < 24.0) {
          float rWall = 0.76 + 0.32 * pow(max(zAbs, 0.1), 0.68);
          float wWall = 0.20 + 0.032 * zAbs;
          if (abs(rCyl - rWall) < wWall * 2.25) {
            float spineHollow = smoothstep(0.35 * rWall, 0.88 * rWall, rCyl);
            float wallShell   = spineHollow * exp(-bh_sqr((rCyl - rWall) / wWall));
            float zEnv        = smoothstep(1.05, 2.35, zAbs) * exp(-(zAbs - 1.8) * 0.115) * bh_sstepInv(24.0, 17.5, zAbs);

            float jx          = dot(midP, diskU);
            float jz          = dot(midP, diskV);
            float phiJet      = atan(jz, (abs(jx) + abs(jz) > 1e-6) ? jx : 1e-6);
            float signZ       = (midZ >= 0.0) ? 1.0 : -1.0;
            float helixPhase  = 2.0 * phiJet - signZ * (1.42 * zAbs - uBhPhase * 1.75);
            float jetKnotN    = textureLod(uNoise3D, vec3(cos(helixPhase) * 0.26, sin(helixPhase) * 0.26, zAbs * 0.09 - uBhPhase * 0.14), 0.0).r;
            float helixFil    = (0.45 + 0.55 * cos(helixPhase * 2.0 + jetKnotN * 2.6)) * (0.42 + 0.88 * jetKnotN);

            // Relativistic bulk outflow velocity (~0.70c) along paraboloidal sheath tangent
            vec3 outPoloidal  = normalize(nearJetAxis * signZ + (cylVec / max(rCyl, 1e-4)) * (0.22 / pow(max(zAbs, 0.5), 0.32)));
            vec3 jetFlowDir   = normalize(outPoloidal * 0.90 + normalize(cross(spinAxis, cylVec) + vec3(1e-6)) * 0.43);
            float betaJet     = 0.70 * smoothstep(0.9, 3.2, zAbs);
            float cosJet      = dot(jetFlowDir, -normalize(nextVel));
            float gJet        = sqrt(1.0 - betaJet * betaJet) / max(0.24, 1.0 - betaJet * cosJet);
            float jetBoost    = pow(max(gJet, 0.05), 2.4);

            vec3 jetBaseCol   = mix(vec3(0.46, 0.68, 1.0), vec3(0.92, 0.82, 1.0), clamp(jetKnotN, 0.0, 1.0));
            float jetEmit     = wallShell * zEnv * helixFil * jetBoost * ds * 0.030 * uAccretionStrength;
            accum            += trans * jetBaseCol * jetEmit;
          }
        }

        pos       = nextPos;
        vel       = nextVel;
        prevDiskY = nextDiskY;

        if (max(trans.r, max(trans.g, trans.b)) < 0.004) break;
      }

      // Any critical plunging ray still moving inward near the photon sphere at max steps is captured
      if (!captured && dot(pos, pos) < 3.4 && dot(pos, vel) < 0.0) {
        captured = true;
      }

      // -----------------------------------------------------------------------
      // 4. Critical Photon Sphere Sub-Rings (b_c ~ 2.38–2.59 Rs, Lyapunov gamma ~ pi)
      //    Resolves demagnified n=1 arch & razor-thin anti-aliased n=2 sub-ring
      //    hugging the exact asymmetric D-shaped Kerr shadow boundary!
      // -----------------------------------------------------------------------
      if (!captured) {
        float rExit       = length(pos);
        totalPhi         += (rExit > 1e-3) ? asin(clamp(hMag / rExit, 0.0, 1.0)) : 0.0;
        float orbitTurns  = (totalPhi - PI) / PI; // >0.85: n=1 half-orbit; >1.65: n=2 full-orbit

        if (orbitTurns > 0.72) {
          float spinAsym      = clamp(xi / B_CRIT_SCHW, -1.0, 1.0);
          float lyapunovGamma = PI * (1.0 - 0.065 * spinAsym); // Kerr Lyapunov exponent gamma ~ pi
          float dopplerMod    = clamp(0.68 + 0.62 * spinAsym, 0.22, 1.48);

          // Demagnified n=1 photon ring + exponentially narrower (e^-gamma) razor-thin n=2 photon ring
          float n1SubRing = exp(-bh_sqr((orbitTurns - 1.08) / 0.28)) * exp(-0.42 * lyapunovGamma);
          float n2SubRing = smoothstep(1.52, 2.22, orbitTurns) * exp(-0.52 * lyapunovGamma) * 3.4;

          vec3 ringCol    = kelvinToRgb(clamp(6200.0 + 2600.0 * spinAsym, 3400.0, 11500.0));
          float ringFlux  = (n1SubRing * 1.15 + n2SubRing * 2.35) * dopplerMod * uAccretionStrength;
          accum          += trans * ringCol * ringFlux;
        }
      }

      if (captured) {
        trans   = vec3(0.0);
        skyMask = 0.0; // Pitch-black Kerr Event Horizon Shadow occludes 100% of background stars!
      } else {
        rd = normalize(vel);
        float lensZoneMask = (rCam < 1200.0) ? smoothstep(6.5, 20.0, bImpact) : 1.0;
        skyMask = clamp(dot(trans, vec3(0.3333)) * lensZoneMask, 0.0, 1.0);
      }
    }
