// ============================================================================
// SWARM MODULE: 1:1 SATELLITE-GRADE EARTH CLOUD DECK + TERRESTRIAL & EXOPLANET
//               SHADERS (pType < 6.5 in LOCAL_BODIES_FRAG)
// Author: @earth-clouds
// Target File: C:/Users/Administrator/.gemini/antigravity/brain/c13a1843-7a2e-49cd-ba94-16fefaed64ef/milky_way.html
//
// EXACT INTEGRATION LINE RANGES IN milky_way.html (2 Clean Drop-In Blocks):
//   - BLOCK 1 (Helpers): Replaces lines 1820–2034 inclusive in milky_way.html
//       * Starts at line 1820: // 1:1 Cartographic Earth 7-Continent Landmask...
//       * Ends at line 2034: closing } of evalTropicalCyclone(...), right
//         before line 2036 vec3 shadeStarSurface(...).
//       * NOTE: Lines 2036–2174 (shadeStarSurface, evalStellarCorona, and
//         the shared header of shadePlanet up to vec3 atmoCol = vec3(0.0);)
//         remain UNCHANGED between Block 1 and Block 2!
//   - BLOCK 2 (pType < 6.5 Branches inside shadePlanet):
//       * Replaces lines 2175–2541 inclusive in milky_way.html
//       * Starts at line 2175: if (pType < 0.5) {
//       * Ends right before line 2542: } else if (pType < 7.5) { (where
//         @outer-worlds begins Jupiter pType >= 6.5).
//
// GLSL ES 3.00 / ANGLE D3D11 STRICTNESS AUDIT:
//   - Zero pow(potentially_negative, y) — all pow() bases clamped >= 0.0,
//     plus sqr() / pow4() for integer powers.
//   - Zero smoothstep(hi, lo, x) with hi >= lo — all smoothstep(lo, hi, x)
//     have lo < hi, and all sstepInv(hi, lo, x) have hi > lo.
//   - Zero atan(0.0, 0.0) D3D11 NaNs — protected via terr_safeAtan(y, x).
//   - Zero loops added; early-out bounding boxes keep execution at solid 60 FPS.
// ============================================================================


// ============================================================================
// === BEGIN BLOCK 1: REPLACE LINES 1820–2034 IN milky_way.html ===
// ============================================================================

    // D3D11 / ANGLE NaN-safe atan2 wrapper (avoids 0/0 singularity at storm/crater centers)
    float terr_safeAtan(float y, float x) {
      float ax = (abs(x) < 1e-6 && abs(y) < 1e-6) ? 1e-6 : x;
      return atan(y, ax);
    }

    // 1:1 Cartographic Earth 7-Continent Landmask, Islands, Peninsulas & Cordillera Relief
    // Returns vec4(coastField, mtnRelief, snowCrest, nileOasis)
    vec4 evalEarthCartography(vec2 ll, vec3 localN, float fbmCoast, float fineCoast, vec4 macroN) {
      // Tectonic coastline domain-warp breaks elliptical symmetry into authentic irregular continental shorelines!
      vec2 llW = ll + vec2((macroN.r - 0.5) * 2.8 + (fbmCoast - 0.5) * 2.2,
                           (macroN.b - 0.5) * 2.1 + (fbmCoast - 0.5) * 1.7);
      float f = 0.0;

      // 1. AFRICA + Horn of Africa + Madagascar (with crisp Gulf of Guinea, Red Sea & Mediterranean!)
      f = max(f, ellipBlob(llW, vec2(  8.5,  22.5), vec2(21.5, 11.8),  0.03)); // Sahara / North Africa
      f = max(f, ellipBlob(llW, vec2( -7.5,  14.2), vec2(10.8,  8.8),  0.00)); // West Africa bulge
      f = max(f, ellipBlob(llW, vec2( 23.2,  -3.5), vec2(11.2, 14.2), -0.06)); // Congo / East Africa
      f = max(f, segField(llW, vec2(21.5, -8.0), vec2(20.5, -33.8), 7.8));     // Tapered Southern Africa -> Cape of Good Hope!
      f = max(f, ellipBlob(llW, vec2( 41.5,   8.0), vec2( 7.5,  5.2),  0.18)); // Ethiopian Highlands
      f = max(f, segField(ll,  vec2(42.5,  9.5), vec2(50.8, 11.6), 2.1));      // Sharp Somali Horn (Cape Guardafui)
      f -= 0.78 * ellipBlob(ll, vec2( 3.2,   1.8), vec2( 8.2,  5.2),  0.00);   // Carve Gulf of Guinea cleanly!

      // 2. MIDDLE EAST, ARABIAN BOOT, MESOPOTAMIA, IRANIAN PLATEAU & BALOCHISTAN LAND BRIDGE!
      float arabBoot = segField(llW, vec2(37.5, 29.5), vec2(45.5, 14.5), 5.6); // Western Arabia (Hejaz -> Yemen)
      arabBoot = max(arabBoot, segField(llW, vec2(44.5, 14.2), vec2(58.2, 22.2), 4.6)); // Hadhramaut -> Oman boot!
      arabBoot = max(arabBoot, ellipBlob(llW, vec2(46.2, 24.0), vec2(6.5, 5.5), -0.35)); // Najd / Rub' al Khali interior
      f = max(f, arabBoot);
      // Continuous Levant + Syria/Iraq + Iranian Plateau + Afghanistan/Pakistan connecting to India & Central Asia!
      f = max(f, segField(llW, vec2(35.8, 33.5), vec2(47.5, 33.0), 4.2));      // Levant & Mesopotamia land bridge
      f = max(f, ellipBlob(llW, vec2(55.5, 33.2), vec2(11.5, 6.2), -0.14));    // Iranian Plateau (Zagros to Khorasan)
      f = max(f, ellipBlob(llW, vec2(66.5, 30.8), vec2( 8.5, 5.8), -0.10));    // Afghanistan & Balochistan / Pakistan
      f = max(f, ellipBlob(llW, vec2(63.5, 42.5), vec2(14.5, 7.5),  0.04));    // Kazakhstan / Uzbekistan / Turkmenistan
      f = max(f, ellipBlob(llW, vec2(34.8, 39.2), vec2( 7.2, 2.7),  0.00));    // Anatolia / Turkey

      // Carve Mediterranean, Narrow Red Sea Trench, Gulf of Aden, Narrow Persian Gulf & Gulf of Oman!
      f -= 0.94 * segField(ll, vec2( -5.0, 36.2), vec2(16.0, 35.5), 2.5);      // Western Mediterranean
      f -= 0.94 * segField(ll, vec2( 16.0, 35.5), vec2(34.8, 33.8), 2.7);      // Eastern Mediterranean (stops cleanly at Levant!)
      f -= 0.98 * segField(ll, vec2( 33.4, 28.6), vec2(43.2, 12.6), 1.25);     // Crisp straight NW-SE Red Sea!
      f -= 0.95 * segField(ll, vec2( 43.4, 12.2), vec2(51.8, 12.8), 1.45);     // Gulf of Aden!
      f -= 0.96 * segField(ll, vec2( 48.4, 29.8), vec2(55.8, 26.0), 1.25);     // Crisp narrow Persian Gulf!
      f -= 0.90 * segField(ll, vec2( 56.8, 25.4), vec2(61.5, 23.8), 1.45);     // Gulf of Oman!

      // Madagascar & Sri Lanka
      float isl = segField(ll, vec2(49.2, -13.0), vec2(45.2, -24.8), 2.0);     // Madagascar
      isl = max(isl, ellipBlob(ll, vec2(80.7, 7.6), vec2(1.3, 2.0), -0.15));   // Sri Lanka

      // 3. EUROPE (Iberia, France/Central, Italy, Greece, British Isles, Jutland, Scandinavia, Iceland)
      f = max(f, ellipBlob(llW, vec2( -4.2,  40.2), vec2( 4.6,  3.4),  0.05)); // Iberian Peninsula
      f = max(f, ellipBlob(llW, vec2( 13.5,  49.8), vec2(14.5,  5.8),  0.08)); // Western & Central Europe
      f = max(f, ellipBlob(llW, vec2( 38.0,  54.5), vec2(16.0,  8.5),  0.04)); // Eastern Europe / European Russia
      isl = max(isl, segField(ll, vec2( 9.5, 44.8), vec2(16.8, 38.2), 1.45));  // Italian Boot
      isl = max(isl, ellipBlob(ll, vec2(14.2, 37.5), vec2( 1.4,  1.0), 0.0));  // Sicily
      isl = max(isl, segField(ll, vec2(20.5, 41.0), vec2(23.2, 37.2), 1.55));  // Greece / Peloponnese
      isl = max(isl, segField(ll, vec2(-2.2, 51.0), vec2(-3.8, 57.5), 1.80));  // Great Britain
      isl = max(isl, ellipBlob(ll, vec2(-8.0, 53.3), vec2( 1.7,  2.0), 0.1));  // Ireland
      isl = max(isl, ellipBlob(ll, vec2(-18.8, 64.9), vec2( 3.3,  1.5), 0.0)); // Iceland
      f = max(f, segField(llW, vec2( 8.0, 60.5), vec2(26.0, 69.5), 4.0));      // Norway / Sweden spine
      f = max(f, ellipBlob(llW, vec2( 26.5,  63.5), vec2( 5.5,  4.6),  0.10)); // Finland / Karelia

      // 4. EURASIA, TRIANGULAR INDIA, CHINA, KOREA, JAPAN & SE ASIA (1:1 High-Precision Coastlines!)
      f = max(f, ellipBlob(llW, vec2( 78.0,  58.5), vec2(42.0, 11.5),  0.03)); // Russia / Siberia
      f = max(f, ellipBlob(llW, vec2(128.0,  63.0), vec2(30.0,  8.8), -0.08)); // Eastern Siberia / Yakutia
      f = max(f, segField(ll, vec2(160.5, 59.5), vec2(157.0, 51.5), 2.1));     // Kamchatka Peninsula
      // Crisp Triangular Indian Subcontinent + Bay of Bengal & Arabian Sea!
      f = max(f, ellipBlob(llW, vec2( 78.5,  25.2), vec2( 8.2,  5.5), -0.05)); // Northern India / Indo-Gangetic Plain
      f = max(f, segField(llW, vec2(74.8, 22.0), vec2(77.5,  8.4), 3.8) * (0.72 + 0.35 * smoothstep(8.0, 22.0, ll.y))); // Triangular Deccan!
      f -= 0.85 * ellipBlob(ll, vec2( 88.5,  16.5), vec2( 5.2,  5.5),  0.00);  // Carve Bay of Bengal cleanly!
      // China Mainland (Western/Tibetan + North China + Yangtze/Southeast China convex coast)
      f = max(f, ellipBlob(llW, vec2( 93.5,  36.8), vec2(21.0, 11.5), -0.04)); // Tibet / Qinghai / Xinjiang / Mongolia
      f = max(f, ellipBlob(llW, vec2(112.5,  30.8), vec2( 9.8,  8.8), -0.12)); // Central, North & South China
      f = max(f, segField(llW, vec2(109.5, 22.2), vec2(120.8, 29.8), 3.4));    // Convex Fujian/Zhejiang/Guangdong coast!
      f = max(f, ellipBlob(llW, vec2(124.5,  45.5), vec2( 7.2,  5.6),  0.12)); // Northeast China (Dongbei)
      f -= 0.90 * ellipBlob(ll, vec2(119.8, 38.8), vec2( 2.3,  1.7),  0.10);   // Carve Bohai Sea!
      f -= 0.90 * ellipBlob(ll, vec2(123.6, 35.5), vec2( 2.5,  3.5),  0.05);   // Carve Yellow Sea!
      f -= 0.88 * ellipBlob(ll, vec2(134.8, 40.2), vec2( 4.4,  4.6),  0.25);   // Carve Sea of Japan!
      isl = max(isl, segField(ll, vec2(119.5, 36.8), vec2(122.3, 37.4), 1.05));// Shandong Peninsula
      isl = max(isl, segField(ll, vec2(125.8, 39.8), vec2(128.6, 35.0), 1.65));// Korean Peninsula
      isl = max(isl, ellipBlob(ll, vec2(109.8, 19.1), vec2( 1.35, 1.15), 0.2));// Hainan Island
      isl = max(isl, segField(ll, vec2(120.7, 22.1), vec2(121.5, 25.1), 1.00));// Taiwan Island
      // Japanese Archipelago (Kyushu, Honshu curved arc, Hokkaido)
      isl = max(isl, ellipBlob(ll, vec2(130.8, 32.6), vec2( 1.25, 1.55), 0.1));
      isl = max(isl, segField(ll, vec2(131.5, 34.2), vec2(139.8, 35.8), 1.30));
      isl = max(isl, segField(ll, vec2(139.6, 35.8), vec2(140.8, 40.9), 1.25));
      isl = max(isl, ellipBlob(ll, vec2(142.8, 43.4), vec2( 2.0,  1.5), 0.2));
      // Indochina, Malay Peninsula, Philippines & Maritime SE Asia
      f = max(f, segField(llW, vec2(97.0, 23.5), vec2(105.5, 11.5), 4.6));     // Myanmar-Thailand-Vietnam Indochina!
      f -= 0.88 * ellipBlob(ll, vec2(107.6, 19.8), vec2( 1.8,  2.0),  0.00);   // Carve Beibu / Tonkin Gulf
      f -= 0.82 * ellipBlob(ll, vec2(101.5, 10.2), vec2( 2.0,  2.4),  0.00);   // Carve Gulf of Thailand
      isl = max(isl, segField(ll, vec2( 99.2, 12.5), vec2(103.8,  1.4), 1.45));// Malay Peninsula & Singapore
      isl = max(isl, segField(ll, vec2( 95.8,  5.2), vec2(105.5, -5.6), 1.85));// Sumatra
      isl = max(isl, segField(ll, vec2(106.2, -6.6), vec2(114.2, -8.0), 1.20));// Java
      isl = max(isl, ellipBlob(ll, vec2(114.2,  0.6), vec2( 4.3,  3.9), 0.10));// Borneo
      isl = max(isl, segField(ll, vec2(120.0,  1.2), vec2(122.5, -4.5), 1.20));// Sulawesi
      isl = max(isl, segField(ll, vec2(120.5, 18.0), vec2(123.5, 13.5), 1.25));// Luzon (Philippines)
      isl = max(isl, ellipBlob(ll, vec2(125.0,  7.8), vec2( 1.7,  1.5), 0.00));// Mindanao
      isl = max(isl, segField(ll, vec2(132.5, -2.5), vec2(148.5, -8.5), 2.40));// New Guinea
      // Carve Black Sea & Caspian Sea
      f -= 0.90 * segField(ll, vec2( 50.2,  45.2), vec2( 51.6,  37.2), 2.1);   // Caspian Sea
      f -= 0.90 * ellipBlob(ll, vec2( 34.2,  43.3), vec2( 5.8,  2.2),  0.05);  // Black Sea

      // 5. AUSTRALIA, TASMANIA & NEW ZEALAND
      float aus = ellipBlob(llW, vec2(134.2, -24.8), vec2(16.8,  9.2), -0.05)
                - 0.80 * ellipBlob(ll, vec2(139.0, -14.0), vec2( 3.2,  3.5), 0.0)
                - 0.68 * ellipBlob(ll, vec2(131.0, -33.5), vec2( 6.5,  2.5), 0.0);
      f = max(f, aus);
      isl = max(isl, ellipBlob(ll, vec2(146.6, -42.0), vec2( 1.5,  1.4), 0.0));
      isl = max(isl, segField(ll, vec2(167.8, -45.8), vec2(174.0, -41.2), 1.30));
      isl = max(isl, segField(ll, vec2(174.8, -41.0), vec2(177.2, -36.8), 1.20));

      // 6. NORTH, CENTRAL & SOUTH AMERICA + GREENLAND & CARIBBEAN
      float nam = ellipBlob(llW, vec2(-106.0,  56.5), vec2(32.5, 11.2), -0.12)
                - 0.86 * ellipBlob(ll, vec2(-84.5, 58.8), vec2( 8.2,  5.5), 0.0);
      nam = max(nam, ellipBlob(llW, vec2(-152.0,  63.8), vec2(12.5,  5.2),  0.10));
      nam = max(nam, ellipBlob(llW, vec2( -99.5,  38.8), vec2(20.2, 10.0), -0.08)
                   - 0.88 * ellipBlob(ll, vec2(-90.0, 25.0), vec2( 8.2,  5.2), 0.0)
                   - 0.78 * ellipBlob(ll, vec2(-84.5, 45.0), vec2( 5.2,  2.8), 0.0));
      f = max(f, nam);
      isl = max(isl, segField(ll, vec2(-82.2, 30.2), vec2(-80.4, 25.4), 1.25));
      isl = max(isl, segField(ll, vec2(-115.5, 31.5), vec2(-110.0, 23.2), 1.10));
      f = max(f, segField(llW, vec2(-103.5, 22.0), vec2(-79.0, 8.8), 2.4));
      isl = max(isl, ellipBlob(ll, vec2(-89.0, 19.8), vec2( 2.2,  2.0), 0.0));
      isl = max(isl, segField(ll, vec2(-84.0, 22.5), vec2(-75.0, 20.2), 1.15));
      isl = max(isl, ellipBlob(ll, vec2(-70.8, 19.0), vec2( 2.2,  1.1), 0.0));
      f = max(f, ellipBlob(llW, vec2( -41.5,  71.8), vec2(13.5,  9.0),  0.22));
      f = max(f, ellipBlob(llW, vec2( -58.5,  -8.8), vec2(15.5, 12.8), -0.20));
      f = max(f, ellipBlob(llW, vec2( -68.0,   3.5), vec2( 9.8,  7.6),  0.15));
      f = max(f, segField(llW, vec2(-64.5, -18.0), vec2(-70.8, -53.8), 4.2));

      // 7. ANTARCTICA (south of 68°S + Antarctic Peninsula)
      float ant = smoothstep(68.5, 73.5, -ll.y + 3.5 * cos(radians(ll.x * 2.0))) +
                  segField(ll, vec2(-63.5, -63.5), vec2(-68.0, -73.0), 3.0);
      f = max(f, clamp(ant, 0.0, 1.0));

      float mainlandCoast = f + (fbmCoast - 0.5) * 0.19 + (fineCoast - 0.5) * 0.075;
      float islandCoast   = isl * 0.78 + (fbmCoast - 0.5) * 0.085 + (fineCoast - 0.5) * 0.055;
      float coastField    = max(mainlandCoast, islandCoast);

      // Separate Broad Topographic Relief (mtn) from Narrow Glaciated Snow-Crest Ridges (snowCrest)!
      float himalCrest = max(segField(llW, vec2(74.2, 35.0), vec2(84.5, 28.4), 1.15),
                             segField(llW, vec2(84.5, 28.4), vec2(96.8, 29.4), 1.10)); // Narrow snowy Himalayan Southern Rim!
      float karakoram  = ellipBlob(llW, vec2(75.2, 36.2), vec2(2.8, 1.9), -0.30);      // Karakoram / Pamir Knot
      float tianshan   = segField(llW, vec2(74.5, 40.6), vec2(88.5, 43.2), 1.05) * 0.88;
      float alpsCauc   = max(segField(llW, vec2( 6.2, 45.8), vec2(14.5, 47.2), 0.95),
                             segField(llW, vec2(40.5, 43.4), vec2(48.5, 41.2), 0.95));
      float andesCrest = segField(llW, vec2(-77.2, 5.0), vec2(-70.2, -46.0), 1.25) * 0.90;
      float snowCrest  = max(max(himalCrest, karakoram), max(tianshan, max(alpsCauc, andesCrest)));

      float mtn = max(snowCrest, ellipBlob(llW, vec2(87.8, 33.4), vec2(12.2, 4.6), -0.08) * 0.78); // Arid Tibetan Plateau (no blanket snow!)
      mtn = max(mtn, segField(llW, vec2(46.0, 35.5), vec2(56.5, 28.5), 2.2) * 0.68);   // Zagros Mountains
      mtn = max(mtn, segField(llW, vec2(-123.0, 56.5), vec2(-106.0, 32.5), 3.4) * 0.75); // Rockies
      mtn = max(mtn, segField(llW, vec2(36.5,  9.0), vec2(34.0, -12.0), 2.4) * 0.62);  // East African Rift

      // Nile River & Nile Delta Oasis Ribbon
      float nileRibbon = segField(ll, vec2(31.2, 31.0), vec2(32.6, 17.5), 0.95) +
                         ellipBlob(ll, vec2(31.2, 30.8), vec2(1.7, 1.25), 0.0);
      return vec4(coastField, mtn, snowCrest, clamp(nileRibbon, 0.0, 1.0));
    }

    // Authentic NASA VIIRS "Black Marble" Human Megacity Clusters & Highway Webs
    float evalEarthCityLights(vec2 ll, float coastField, float t3r, float t4g) {
      float hubs = 0.0;
      // China & East Asia: Beijing-Bohai-North China Plain, Shanghai-Yangtze, Pearl River Delta, Sichuan, Taiwan, Korea, Japan
      hubs = max(hubs, ellipBlob(ll, vec2(116.5, 37.2), vec2(5.2, 4.6),  0.15) * 1.10); // Beijing-Tianjin-Hebei-Shandong
      hubs = max(hubs, ellipBlob(ll, vec2(120.2, 31.2), vec2(3.6, 3.0), -0.10) * 1.15); // Yangtze River Delta (Shanghai)
      hubs = max(hubs, ellipBlob(ll, vec2(113.6, 22.9), vec2(2.6, 1.8),  0.10) * 1.18); // Pearl River Delta (GZ-SZ-HK)
      hubs = max(hubs, ellipBlob(ll, vec2(105.2, 30.2), vec2(2.6, 2.2),  0.00) * 0.90); // Chengdu-Chongqing
      hubs = max(hubs, ellipBlob(ll, vec2(114.2, 30.6), vec2(2.4, 2.0),  0.00) * 0.85); // Wuhan / Central China
      hubs = max(hubs, segField(ll, vec2(120.3, 22.6), vec2(121.5, 25.1), 0.95) * 1.05);// Taiwan West Coast
      hubs = max(hubs, ellipBlob(ll, vec2(127.0, 37.2), vec2(1.6, 1.8),  0.00) * 1.05); // Seoul-Gyeonggi
      hubs = max(hubs, segField(ll, vec2(135.2, 34.6), vec2(139.8, 35.7), 1.25) * 1.15);// Osaka-Nagoya-Tokyo Tokaido
      // South & SE Asia: Indo-Gangetic Plain, Mumbai, Bangkok, Singapore, Java
      hubs = max(hubs, segField(ll, vec2( 75.5, 30.5), vec2( 88.2, 22.8), 2.6) * 1.05); // Delhi-Ganges-Kolkata
      hubs = max(hubs, ellipBlob(ll, vec2( 73.2, 19.0), vec2(2.0, 2.8),  0.00) * 0.92); // Mumbai / Western India
      hubs = max(hubs, ellipBlob(ll, vec2( 77.8, 12.8), vec2(2.5, 2.5),  0.00) * 0.85); // Bengaluru-Chennai
      hubs = max(hubs, ellipBlob(ll, vec2(100.5, 13.8), vec2(1.8, 1.8),  0.00) * 0.88); // Bangkok
      hubs = max(hubs, segField(ll, vec2(106.8, -6.3), vec2(112.7, -7.3), 1.1) * 0.95); // Jakarta-Surabaya
      // Middle East & Africa: Iconic Glowing Nile River & Cairo Delta, Persian Gulf, Levant, Johannesburg
      hubs = max(hubs, segField(ll, vec2( 31.2, 31.2), vec2( 32.8, 24.0), 0.85) * 1.20); // Nile River ribbon!
      hubs = max(hubs, ellipBlob(ll, vec2( 31.2, 30.7), vec2(1.7, 1.3),  0.00) * 1.25); // Cairo & Nile Delta lotus!
      hubs = max(hubs, ellipBlob(ll, vec2( 35.0, 32.2), vec2(1.4, 2.2),  0.15) * 0.95); // Levant coast
      hubs = max(hubs, segField(ll, vec2( 50.0, 26.5), vec2( 55.4, 25.1), 1.20) * 1.00);// Persian Gulf / Dubai-Doha
      hubs = max(hubs, ellipBlob(ll, vec2( 28.0,-26.2), vec2(1.8, 1.5),  0.00) * 0.85); // Johannesburg
      // Europe: London, Paris, Benelux-Rhine-Ruhr, Po Valley/Italy, Iberia, Moscow
      hubs = max(hubs, ellipBlob(ll, vec2( -0.4, 52.0), vec2(2.2, 2.2),  0.10) * 1.08); // London-Midlands
      hubs = max(hubs, ellipBlob(ll, vec2(  4.8, 50.6), vec2(3.8, 2.6),  0.20) * 1.15); // Paris-Benelux-Rhine-Ruhr
      hubs = max(hubs, ellipBlob(ll, vec2( 10.8, 45.2), vec2(3.2, 1.5), -0.10) * 1.05); // Milan / Po Valley
      hubs = max(hubs, ellipBlob(ll, vec2( 14.0, 41.2), vec2(1.8, 2.5), -0.35) * 0.88); // Rome-Naples
      hubs = max(hubs, ellipBlob(ll, vec2( -3.7, 40.4), vec2(1.8, 1.5),  0.00) * 0.90); // Madrid
      hubs = max(hubs, ellipBlob(ll, vec2( 37.6, 55.7), vec2(2.8, 2.2),  0.00) * 1.02); // Moscow spiderweb
      // Americas: BosWash, Great Lakes/Midwest, Florida, Texas, California, Mexico City, Sao Paulo/Buenos Aires
      hubs = max(hubs, segField(ll, vec2(-71.0, 42.4), vec2(-77.2, 38.8), 1.6) * 1.15); // BosWash Megalopolis
      hubs = max(hubs, ellipBlob(ll, vec2(-84.5, 41.2), vec2(6.5, 3.8),  0.05) * 0.92); // Chicago-Toronto-Midwest
      hubs = max(hubs, ellipBlob(ll, vec2(-81.2, 27.8), vec2(1.6, 2.6), -0.20) * 0.90); // Florida
      hubs = max(hubs, ellipBlob(ll, vec2(-96.8, 31.2), vec2(3.0, 2.6),  0.00) * 0.88); // Texas Triangle
      hubs = max(hubs, segField(ll, vec2(-122.2, 37.8), vec2(-117.2, 33.0), 1.4) * 1.08);// Bay Area - LA
      hubs = max(hubs, ellipBlob(ll, vec2(-99.1, 19.4), vec2(1.8, 1.5),  0.00) * 0.98); // Mexico City
      hubs = max(hubs, segField(ll, vec2(-46.6,-23.5), vec2(-43.2,-22.9), 1.4) * 1.02); // Sao Paulo - Rio
      hubs = max(hubs, ellipBlob(ll, vec2(-58.4,-34.6), vec2(1.8, 1.5),  0.00) * 0.92); // Buenos Aires

      float coastal = smoothstep(0.36, 0.45, coastField) * (1.0 - smoothstep(0.50, 0.72, coastField));
      float microGrid = pow(clamp(t3r * 0.54 + t4g * 0.54, 0.0, 1.0), 3.6);
      float sparks = pow(clamp(t4g * 1.15 - 0.12, 0.0, 1.0), 6.0);
      return clamp(hubs * (0.42 + 0.85 * microGrid + 0.65 * sparks) + coastal * microGrid * 0.28, 0.0, 1.35);
    }

    // Himawari-9 / GOES-16 Multi-Arm Super-Typhoon & Tropical Cyclone:
    // Returns vec3(denseConvective, radialCirrusOutflow, verticalRelief)
    vec3 terr_evalSuperTyphoon(vec2 ll, vec2 centerLL, float maxRadDeg, float hemiSign, float animT, float nMeso, float nFine) {
      float cosLat = max(0.35, cos(radians(centerLL.y)));
      vec2 d = vec2(wrapDeg(ll.x - centerLL.x) * cosLat, ll.y - centerLL.y);
      float r2 = dot(d, d);
      if (r2 >= maxRadDeg * maxRadDeg * 1.35) return vec3(0.0);
      float r = sqrt(max(r2, 0.0));

      float ang = (r > 1e-4) ? (terr_safeAtan(d.y, d.x) * hemiSign) : 0.0;
      float spin = animT * 0.085;
      float logR = log(r + 0.52);

      // Multi-harmonic asymmetric logarithmic spiral rainbands + mesoscale hot-tower bursts
      float arm4 = 0.5 + 0.5 * cos(4.0 * ang + 7.2 * logR - spin + (nMeso - 0.5) * 1.4);
      float arm2 = 0.5 + 0.5 * cos(2.0 * ang + 4.6 * logR - spin * 0.78 + 0.9);
      float arm1 = 0.5 + 0.5 * cos(1.0 * ang + 2.8 * logR - spin * 0.55 - 0.6); // Principal tail band!
      float convectiveBurst = 0.62 + 0.52 * smoothstep(0.28, 0.82, nMeso * 0.55 + nFine * 0.45);

      // Crisp calm clear eye (r < 0.52°) + subtle low warm-core hub wisp + towering sloped "stadium" eyewall!
      float eyeClear = smoothstep(0.38, 0.86, r);
      float hubWisp  = sstepInv(0.42, 0.05, r) * smoothstep(0.45, 0.78, nFine) * 0.20;
      float eyewall  = exp(-sqr((r - 1.08) / 0.52)) * (0.94 + 0.10 * nFine);
      float cdo      = exp(-sqr((r - 1.65) / 1.35)) * 0.56 * (0.72 + 0.28 * arm2);

      float safeMaxR = max(maxRadDeg, 2.5);
      float rainEnv  = smoothstep(0.85, 1.55, r) * sstepInv(safeMaxR, 1.35, r);
      float rainBands = rainEnv * pow(clamp(arm4 * 0.54 + arm2 * 0.30 + arm1 * 0.26, 0.0, 1.0), 1.55) * convectiveBurst * 0.88;

      float dense = clamp(eyeClear * max(eyewall, cdo + rainBands) + hubWisp, 0.0, 1.0);

      // Anticyclonic (opposite-chirality!) upper-tropospheric feathery radial cirrus outflow shield!
      float outAngle = -ang * 6.0 + 3.4 * log(r + 1.1) + spin * 0.35 + nMeso * 2.2;
      float cirrusStreaks = 0.5 + 0.5 * cos(outAngle);
      float outflowEnv = smoothstep(1.15, 2.60, r) * sstepInv(safeMaxR * 1.16, safeMaxR * 0.38, r);
      float cirrus = outflowEnv * smoothstep(0.42, 0.86, cirrusStreaks * 0.65 + nFine * 0.35) * 0.58;

      float relief = eyeClear * (eyewall * 1.05 + cdo * 0.55 + rainBands * 0.62);
      return vec3(dense, cirrus, clamp(relief, 0.0, 1.15));
    }

    // Legacy single-float wrapper preserved for compatibility if referenced externally
    float evalTropicalCyclone(vec2 ll, vec2 centerLL, float maxRadDeg, float hemiSign, float animT) {
      return terr_evalSuperTyphoon(ll, centerLL, maxRadDeg, hemiSign, animT, 0.55, 0.55).x;
    }

    // DSCOVR EPIC / GOES / Himawari Mid-Latitude Baroclinic Comma-Shaped Extratropical Cyclone!
    // Uses Lamb-Oseen cyclonic vortex roll-up of a baroclinic leaf + dry intrusion slot + sweeping cold-front tail!
    // hemiSign: +1.0 for Northern Hemisphere (CCW comma + SW cold front), -1.0 for Southern Hemisphere (CW comma + NW cold front)
    // Returns vec3(denseFrontalCloud, cirrusWarmConveyor, verticalRelief)
    vec3 terr_evalCommaCyclone(vec2 ll, vec2 lowCenterLL, float scaleDeg, float hemiSign, float animT, float nMeso, float nFine) {
      float cosLat = max(0.30, cos(radians(lowCenterLL.y)));
      vec2 d = vec2(wrapDeg(ll.x - lowCenterLL.x) * cosLat, (ll.y - lowCenterLL.y) * hemiSign);
      vec2 q = d / max(scaleDeg, 2.0);
      // Fast tight bounding-box early-out (covers curled comma head + 2,800-km equatorward-westward cold front)
      if (q.x < -1.95 || q.x > 1.35 || q.y < -1.85 || q.y > 1.25) return vec3(0.0);

      // 1. Cyclonic Vortex Roll-Up (zero atan seam!) -> Comma Head, Occluded Spiral Hook & Dry-Air Intrusion Slot
      vec2 qHead = q - vec2(-0.08, 0.14);
      float rH = length(qHead);
      float swirl = 2.45 * exp(-rH * 1.42) + 0.12 * sin(animT * 0.04);
      vec2 q0 = rot2D(qHead, -swirl);

      // Moist poleward/eastward baroclinic leaf vs dry equatorward/westward stratospheric intrusion slot
      float leafShield = exp(-sqr((q0.x - 0.16) / 0.64) - sqr((q0.y - 0.26) / 0.44));
      float occlBand   = exp(-sqr((rH - 0.38) / 0.22)) * smoothstep(-0.18, 0.24, q0.y + 0.14 * q0.x);
      float drySlot    = exp(-sqr((q0.x + 0.16) / 0.36) - sqr((q0.y + 0.18) / 0.30)) * smoothstep(0.08, 0.65, rH);
      float eyeNotch   = smoothstep(0.06, 0.20, rH + (nMeso - 0.5) * 0.08);
      float texMod     = 0.68 + 0.48 * smoothstep(0.24, 0.80, nMeso * 0.58 + nFine * 0.42);
      float commaHead  = clamp((leafShield * 0.92 + occlBand * 0.72) * (1.0 - 0.88 * drySlot) * eyeNotch * texMod, 0.0, 1.0);

      // 2. Trailing Equatorward-Westward Cold Front Squall Band (sweeping from warm conveyor down to q.y = -1.75)
      float xFront = 0.38 + 0.86 * q.y - 0.16 * q.y * q.y + (nMeso - 0.5) * 0.18;
      float dxF = q.x - xFront;
      float frontAlong = smoothstep(-1.78, -0.95, q.y) * sstepInv(0.52, 0.02, q.y);
      // Crisp leading convective edge (dxF > 0) + slightly wider post-frontal stratiform rainband (dxF < 0)
      float crossW = (dxF >= 0.0) ? 0.125 : 0.215;
      float coldFront = frontAlong * exp(-sqr(dxF / crossW)) *
                        smoothstep(0.24, 0.68, 0.52 + 0.32 * nMeso + 0.28 * nFine) * 0.94;

      // 3. Cold-Air Outbreak Speckled Open-Cell Cumulus Field behind the Cold Front & Dry Slot!
      float coldSector = smoothstep(-1.45, -0.85, q.y) * sstepInv(0.18, -0.22, q.y) *
                         smoothstep(-1.05, -0.68, dxF) * sstepInv(-0.14, -0.32, dxF);
      float openCells  = coldSector * pow(clamp(nFine * 1.18 - 0.16, 0.0, 1.0), 2.8) * 0.46;

      // 4. Poleward/Ahead Jet-Sheared Fibrous Warm-Conveyor Ice-Cirrus Shield
      float wcbCirrus = (exp(-sqr((q0.x - 0.32) / 0.82) - sqr((q0.y - 0.36) / 0.56)) * 0.52 +
                         frontAlong * exp(-sqr((dxF - 0.14) / 0.24)) * 0.44) *
                        smoothstep(0.32, 0.82, nMeso * 0.45 + nFine * 0.55);

      float dense = clamp(max(commaHead, coldFront) + openCells, 0.0, 1.0);
      float relief = max(commaHead * 0.80, coldFront * 0.72);
      return vec3(dense, clamp(wcbCirrus, 0.0, 0.72), relief);
    }

    // Full-Disk Satellite Meteorological Cloud Field Evaluator (DSCOVR EPIC / VIIRS / Himawari-9 / GOES-16)
    // Evaluates at arbitrary Earth-local unit vector pLoc so BOTH direct clouds AND Sun-aligned shadows match 1:1!
    // Returns vec4(denseOpacity, cirrusOpacity, cloudReliefHeight, lowMarineDeckMask)
    vec4 terr_evalEarthCloudField(vec3 pLoc, float animT, float clearLandWin, float isLandHere) {
      float pLat = degrees(asin(clamp(pLoc.y, -1.0, 1.0)));
      float pLon = wrapDeg(degrees(terr_safeAtan(pLoc.z, pLoc.x)) + 102.0);
      vec2 pLL = vec2(pLon, pLat);
      float absLat = abs(pLat);

      // Global Zonal Wind Shear: Mid-latitude Westerlies (+East) vs Tropical Trade Winds (-West)
      float zonalShear = 0.20 * exp(-sqr((absLat - 46.0) / 16.5)) - 0.11 * exp(-sqr(pLat / 19.0));
      vec3 pWind = vec3(rot2D(pLoc.xz, -zonalShear - animT * 0.0055), pLoc.y).xzy;

      // 3-Scale Seamless 3D Atmospheric Turbulence (.r = ridged filaments, .g = billow cumulus, .b = fine cells, .a = warp)
      vec4 nSyn  = textureLod(uNoise3D, pWind * 2.55 + vec3(0.13, 0.29, 0.47), 0.0);
      vec4 nMeso = textureLod(uNoise3D, pWind * 7.60 + nSyn.a * 0.24 + vec3(animT * 0.004, -0.17, 0.31), 0.0);
      vec4 nCell = textureLod(uNoise3D, pWind * 23.0 + nMeso.a * 0.15, 0.0);

      // --- A. MID-LATITUDE BAROCLINIC COMMA CYCLONES (NH Storm Tracks + Dense Southern Ocean Parade) ---
      float drift = sin(animT * 0.016) * 1.8;
      vec3 cyc = vec3(0.0);
      if (pLat > 16.0) {
        // Northern Hemisphere Storm Tracks: Kuroshio/NW Pacific, Gulf of Alaska, North Atlantic, High Siberia
        cyc = max(cyc, terr_evalCommaCyclone(pLL, vec2( 154.5 + drift, 44.5), 13.2,  1.0, animT, nMeso.r, nCell.b));
        cyc = max(cyc, terr_evalCommaCyclone(pLL, vec2(-144.5 + drift, 48.8), 13.8,  1.0, animT, nMeso.g, nCell.r));
        cyc = max(cyc, terr_evalCommaCyclone(pLL, vec2( -30.5 + drift, 52.5), 13.5,  1.0, animT, nMeso.r, nCell.g));
        cyc = max(cyc, terr_evalCommaCyclone(pLL, vec2(  66.0 + drift, 61.5), 10.8,  1.0, animT, nMeso.g, nCell.b) * vec3(0.76, 0.70, 0.70));
      }
      if (pLat < -16.0) {
        // Southern Ocean "Roaring Forties / Furious Fifties" Clockwise Comma Cyclone Parade wrapping Antarctica!
        cyc = max(cyc, terr_evalCommaCyclone(pLL, vec2(  95.5 + drift, -49.2), 14.4, -1.0, animT, nMeso.r, nCell.b));
        cyc = max(cyc, terr_evalCommaCyclone(pLL, vec2(  24.5 + drift, -47.8), 13.8, -1.0, animT, nMeso.g, nCell.r));
        cyc = max(cyc, terr_evalCommaCyclone(pLL, vec2( 161.5 + drift, -48.5), 13.8, -1.0, animT, nMeso.r, nCell.g));
        cyc = max(cyc, terr_evalCommaCyclone(pLL, vec2(-132.0 + drift, -51.5), 14.6, -1.0, animT, nMeso.g, nCell.b));
        cyc = max(cyc, terr_evalCommaCyclone(pLL, vec2( -51.5 + drift, -49.8), 13.6, -1.0, animT, nMeso.r, nCell.r));
      }

      // --- B. CONTINUOUS SOUTHERN OCEAN CIRCUMPOLAR FRONTAL BELT (45°S–65°S) & NH SUBPOLAR STREAKS ---
      float rossbyWave = sin(radians(pLL.x * 4.0) - animT * 0.022) * 3.6 + cos(radians(pLL.x * 7.0) + 0.8) * 1.9;
      float soLatW = pLat + rossbyWave + (nSyn.a - 0.5) * 5.2;
      float soBeltEnv = exp(-sqr((soLatW - (-55.5)) / 8.5)) * (1.0 - isLandHere * 0.72);
      float nhBeltEnv = exp(-sqr((pLat + rossbyWave * 0.7 - 54.0) / 7.5)) * (1.0 - isLandHere * 0.55) * 0.52;
      float frontalFilaments = smoothstep(0.47, 0.76, nSyn.r * 0.50 + nMeso.r * 0.35 + nCell.g * 0.15);
      float circumpolarBelt = (soBeltEnv * 0.82 + nhBeltEnv * 0.65) * frontalFilaments;

      // --- C. ITCZ POPCORN CUMULONIMBUS CLUSTERS (~4°N–9°N + Indo-Pacific Warm Pool) & ANVILS ---
      float itczSpine = 6.2 + 2.6 * sin(radians(pLL.x * 2.0 - 25.0)) + (nSyn.a - 0.5) * 3.8;
      float warmPool  = ellipBlob(pLL, vec2(118.0, -2.5), vec2(32.0, 8.5), -0.10);
      float amazonConv = ellipBlob(pLL, vec2(-62.0, -5.5), vec2(11.0, 7.5), -0.15) * isLandHere;
      float congoConv  = ellipBlob(pLL, vec2( 22.5, -1.5), vec2( 7.5, 6.0),  0.00) * isLandHere;
      float itczEnv   = exp(-sqr((pLat - itczSpine) / 3.8)) + warmPool * 0.62 + (amazonConv + congoConv) * 0.65;
      float cbCluster = smoothstep(0.46, 0.73, nSyn.g * 0.54 + nMeso.r * 0.46);
      float cbPopcorn = smoothstep(0.48, 0.78, nMeso.g * 0.44 + nCell.b * 0.56);
      float itczDense = clamp(itczEnv * cbCluster * (0.38 + 0.72 * cbPopcorn) * clearLandWin, 0.0, 0.96);
      float itczAnvil = clamp(itczEnv * smoothstep(0.46, 0.76, nSyn.g * 0.48 + nMeso.r * 0.52) * 0.48 * clearLandWin, 0.0, 0.58);

      // --- D. CELLULAR MARINE STRATOCUMULUS DECKS (Cold Eastern-Boundary Ocean Currents) ---
      float oceanMask = 1.0 - isLandHere;
      float scEnv = 0.0;
      scEnv = max(scEnv, ellipBlob(pLL, vec2( -83.5, -18.5), vec2(10.5, 11.5), -0.15)); // Peru / Humboldt Current
      scEnv = max(scEnv, ellipBlob(pLL, vec2(   6.2, -19.2), vec2( 8.5, 10.5), -0.12)); // Namibia / Benguela Current
      scEnv = max(scEnv, ellipBlob(pLL, vec2(-123.5,  25.5), vec2( 9.5,  8.5),  0.22)); // California / Baja Current
      scEnv = max(scEnv, ellipBlob(pLL, vec2( 105.0, -25.5), vec2( 8.2,  7.2),  0.15)); // West Australian Current
      scEnv = max(scEnv, ellipBlob(pLL, vec2( -20.5,  21.5), vec2( 6.5,  6.8), -0.15)); // Canary / Mauritania Current
      // Closed & open honeycomb Rayleigh-Benard marine boundary-layer cells!
      float scCells = smoothstep(0.38, 0.74, nCell.r * 0.58 + nMeso.g * 0.28 + nCell.g * 0.14);
      float marineSc = scEnv * oceanMask * smoothstep(0.32, 0.72, nSyn.g + 0.22) * scCells * 0.72;

      // --- E. TROPICAL TRADE-WIND CUMULUS CLOUD STREETS (Open Sapphire Oceans, 8°–26° N/S) ---
      float tradeSlant = (pLL.x * 0.82 + absLat * 1.32) * 1.75 + nMeso.a * 4.2 - animT * 0.035;
      float streetWave = 0.5 + 0.5 * sin(tradeSlant);
      float tradeEnv   = exp(-sqr((absLat - 16.5) / 7.8)) * oceanMask * smoothstep(0.42, 0.74, nSyn.g * 0.65 + nMeso.b * 0.35);
      float tradeCu    = tradeEnv * smoothstep(0.58, 0.86, streetWave * 0.52 + nCell.b * 0.48) * 0.46;

      // --- F. MULTI-ARM SUPER-TYPHOONS & HURRICANES (WPac, S. Indian, Atlantic, E. Pacific) ---
      vec3 tc = vec3(0.0);
      if (absLat < 35.0) {
        tc = max(tc, terr_evalSuperTyphoon(pLL, vec2( 134.2,  19.4), 8.4,  1.0, animT, nMeso.g, nCell.b)); // Philippine Sea Super-Typhoon!
        tc = max(tc, terr_evalSuperTyphoon(pLL, vec2(  75.5, -15.8), 6.8, -1.0, animT, nMeso.r, nCell.g)); // South Indian Ocean Cyclone!
        tc = max(tc, terr_evalSuperTyphoon(pLL, vec2( -63.5,  23.8), 7.4,  1.0, animT, nMeso.g, nCell.r)); // Atlantic Major Hurricane!
        tc = max(tc, terr_evalSuperTyphoon(pLL, vec2(-116.0,  16.5), 6.4,  1.0, animT, nMeso.r, nCell.b)); // East Pacific Hurricane!
      }

      // --- G. HIGH-ALTITUDE JET-SHEARED FEATHERY ICE CIRRUS (cHigh moving faster!) ---
      vec3 pCir = vec3(rot2D(pLoc.xz, -zonalShear * 1.55 - animT * 0.011), pLoc.y * 1.32).xzy;
      vec4 nCir = textureLod(uNoise3D, pCir * 3.85 + vec3(0.41, -0.23, nSyn.a * 0.30), 0.0);
      float jetCirrus = smoothstep(0.67, 0.89, nCir.r * 0.68 + nMeso.b * 0.32) *
                        (0.32 + 0.45 * exp(-sqr((absLat - 36.0) / 18.0))) * (0.45 + 0.55 * clearLandWin);

      // Combine Dense Low/Mid/Deep Clouds vs Semi-Translucent High Ice Cirrus!
      float synopticMid = (circumpolarBelt + smoothstep(0.60, 0.83, nSyn.g * 0.52 + nMeso.r * 0.34 + nCell.g * 0.14) * 0.38) * clearLandWin;
      float denseCloud  = max(max(cyc.x, tc.x), clamp(synopticMid + itczDense + marineSc + tradeCu, 0.0, 0.96));
      float cirrusCloud = clamp(max(max(cyc.y, tc.y), max(itczAnvil, jetCirrus * 0.48)), 0.0, 0.72);
      float cloudRelief = max(max(cyc.z, tc.z), itczDense * 0.85 + circumpolarBelt * 0.48 + marineSc * 0.20 + tradeCu * 0.25);

      return vec4(clamp(denseCloud, 0.0, 1.0), cirrusCloud, clamp(cloudRelief, 0.0, 1.15), clamp(marineSc * 1.35, 0.0, 1.0));
    }

// ============================================================================
// === END BLOCK 1 (Lines 1820–2034 in milky_way.html) ===
// ============================================================================


// ============================================================================
// === BEGIN BLOCK 2: REPLACE LINES 2175–2541 IN milky_way.html ===
//     (Inside shadePlanet, from if (pType < 0.5) { right up to
//      } else if (pType < 7.5) {)
// ============================================================================

      if (pType < 0.5) {
        // === PROXIMA CENTAURI b (1:1 Tidally-Locked Eyeball Exoplanet, R=6,562 km, a=0.04856 AU) ===
        // 3D GCM Climate Physics: Open liquid-ocean substellar pupil, sea-ice leads at terminator,
        // super-rotating equatorial jet + twin mid-latitude Rossby gyres shearing clouds into V-chevrons!
        float cosSubStar = clamp(localN.x, -1.0, 1.0); // +1 = substellar bullseye, 0 = terminator, -1 = antistellar
        float subLon = terr_safeAtan(localN.z, localN.x); // 0 at substellar meridian

        float continentalElev = elev + 0.08 * ellipBlob(vec2(degrees(subLon), latDeg), vec2(28.0, -14.0), vec2(26.0, 18.0), 0.25);
        float isLand = smoothstep(0.495, 0.535, continentalElev);

        // Fractured sea-ice transition zone ("eyeball iris") with dark ocean leads near terminator!
        float iceEdge = cosSubStar + (t2.g - 0.5) * 0.16 + (t3.r - 0.5) * 0.07;
        float leadCracks = smoothstep(0.30, 0.62, t3.r * 0.60 + t4.g * 0.40);
        float seaIceZone = sstepInv(0.20, -0.02, iceEdge) * (1.0 - isLand) * (0.68 + 0.32 * leadCracks);
        float nightGlacier = sstepInv(0.06, -0.18, iceEdge);
        float iceCap = clamp(max(nightGlacier, seaIceZone), 0.0, 1.0);

        // Deep M-dwarf ocean + photosynthetic reddish-olive/ochre terminator flora + cryo-glacier ice
        vec3 oceanAlbedo = mix(vec3(0.028, 0.068, 0.145), vec3(0.048, 0.135, 0.215), smoothstep(0.15, 0.85, cosSubStar));
        float ringBio = smoothstep(-0.02, 0.24, cosSubStar) * sstepInv(0.76, 0.38, cosSubStar);
        vec3 aridBasalt = mix(vec3(0.20, 0.13, 0.10), vec3(0.32, 0.20, 0.13), t2.r);
        vec3 termTundra = mix(vec3(0.15, 0.21, 0.10), vec3(0.28, 0.18, 0.11), t3.g); // Red-edge adapted biome!
        vec3 landAlbedo = mix(aridBasalt, termTundra, ringBio * 0.85);
        vec3 iceAlbedo  = mix(vec3(0.70, 0.77, 0.86), vec3(0.84, 0.88, 0.94), leadCracks);

        vec3 baseAlbedo = mix(mix(oceanAlbedo, landAlbedo, isLand), iceAlbedo, iceCap);

        // 3D GCM Rossby-Gyre V-Chevron Clouds + Vigorous Substellar Convective Anvil Bullseye!
        // Eastward equatorial super-rotation shears mid-latitude bands backward -> planetary chevron pointing East!
        float chevronLon = subLon - 0.95 * sqr(sinLat) - animT * 0.014;
        // Twin cyclonic Rossby gyres flanking the substellar point at ~ +/-36 deg lat, slightly west of substellar!
        float gyreN = ellipBlob(vec2(degrees(subLon), latDeg), vec2(-42.0,  36.0), vec2(26.0, 16.0),  0.30);
        float gyreS = ellipBlob(vec2(degrees(subLon), latDeg), vec2(-42.0, -36.0), vec2(26.0, 16.0), -0.30);
        float rossbySwirl = (gyreN - gyreS) * 0.55;
        vec3 pbCloudP = vec3(cos(chevronLon + rossbySwirl), sinLat * 1.45, sin(chevronLon + rossbySwirl)) * 3.1;
        vec4 cN1 = textureLod(uNoise3D, pbCloudP + vec3(animT * 0.008, 0.19, -0.11), 0.0);
        vec4 cN2 = textureLod(uNoise3D, pbCloudP * 2.9 + cN1.a * 0.26, 0.0);

        float subBullseye = smoothstep(0.56, 0.96, cosSubStar);
        float chevronWaves = 0.5 + 0.5 * cos(chevronLon * 5.0 + cN1.r * 3.2);
        float pbCloudRaw = cN1.g * 0.46 + cN2.r * 0.34 + chevronWaves * 0.20 + subBullseye * 0.26 + (gyreN + gyreS) * 0.16;
        float cloudCover = smoothstep(0.50, 0.80, pbCloudRaw) * smoothstep(-0.32, 0.42, cosSubStar);
        float subAnvil   = smoothstep(0.68, 0.95, cosSubStar) * smoothstep(0.35, 0.75, cN1.r * 0.5 + cN2.b * 0.5) * 0.42;
        cloudCover = clamp(cloudCover + subAnvil, 0.0, 0.95);

        // Sun-aligned cloud shadow & roughened crimson-amber M-dwarf ocean sunglint!
        float pbShadow = 1.0 - 0.45 * cloudCover;
        vec3 halfV = normalize(lightDir + viewDir);
        float spec = pow(max(dot(nrm, halfV), 0.0), 46.0) * (1.0 - isLand) * (1.0 - iceCap) *
                     (1.0 - cloudCover * 0.90) * pbShadow * max(0.0, ndotl) * eclipseShadow;

        vec3 litSurface = (baseAlbedo * (diff * 1.24 * pbShadow) + vec3(1.00, 0.56, 0.34) * (spec * 1.05)) * starTint;
        float twilightPb = exp(-sqr((ndotl + 0.02) / 0.16)) * eclipseShadow;
        vec3 pbCloudTint = mix(vec3(0.92, 0.89, 0.88), vec3(1.00, 0.42, 0.20), twilightPb * 0.68);
        vec3 litClouds   = pbCloudTint * (smoothstep(-0.16, 0.82, ndotl) * eclipseShadow * 1.02) * starTint;
        surfCol = mix(litSurface, litClouds, cloudCover * 0.86);

        // Intense M-dwarf stellar-wind nightside auroral ovals!
        float poleLat = abs(localN.y);
        float auroraRing = exp(-sqr((poleLat - 0.76) / 0.082)) * sstepInv(0.12, -0.32, ndotl);
        float aurWave = textureLod(uNoise3D, vec3(localN.xz * 4.5, animT * 0.15), 0.0).r;
        surfCol += vec3(0.14, 0.92, 0.54) * auroraRing * aurWave * 0.18 + baseAlbedo * vec3(0.005, 0.007, 0.011);

        float forwardScat = pow(max(dot(viewDir, -lightDir), 0.0), 3.5);
        float limbRim = pow(max(1.0 - viewN, 0.0), 3.0);
        float dayLimb = smoothstep(-0.32, 0.45, ndotl);
        atmoCol = mix(vec3(0.42, 0.62, 1.0), vec3(1.0, 0.30, 0.12), 0.56 + 0.44 * forwardScat) *
                  starTint * limbRim * (0.28 * dayLimb + 0.68 * forwardScat * smoothstep(-0.45, 0.15, ndotl));

      } else if (pType < 1.5) {
        // === PROXIMA CENTAURI d (Ultra-Short-Period Scorched Sub-Earth, a=0.02885 AU, P=5.12 d) ===
        // 3D cratered & tidally-fractured basalt/komatiite crust + incandescent dayside magma fissures & substellar lava pond!
        float cosSub = clamp(localN.x, -1.0, 1.0);
        vec3 tU = normalize(cross(localN, abs(localN.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
        vec3 tV = cross(localN, tU);
        float meltSmooth = smoothstep(0.62, 0.94, cosSub);
        float rScale = mix(0.85, 0.22, meltSmooth);
        float h0 = evalCraterHeight(localN * 1.15) * rScale;
        float hX = evalCraterHeight(normalize(localN + tU * 0.01) * 1.15) * rScale;
        float hY = evalCraterHeight(normalize(localN + tV * 0.01) * 1.15) * rScale;
        vec3 wTanU = normalize(cross(nrm, abs(nrm.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
        vec3 wTanV = cross(nrm, wTanU);
        vec3 bumpedN = normalize(nrm - (wTanU * (hX - h0) + wTanV * (hY - h0)) * 2.4);

        float mu0 = max(0.0, dot(bumpedN, lightDir));
        float muV = max(0.05, dot(bumpedN, viewDir));
        float ls  = (mu0 / (mu0 + muV + 0.07)) * 2.15 * smoothstep(-0.05, 0.08, ndotl) * eclipseShadow;

        // Sharp ridged tidal-flexing magma fissure network + substellar molten silicate pond!
        float ridge1 = 1.0 - abs(t2.r * 2.0 - 1.0);
        float ridge2 = 1.0 - abs(t3.g * 2.0 - 1.0);
        float fissureWeb = pow(clamp(ridge1 * 0.62 + ridge2 * 0.42, 0.0, 1.0), 4.8);
        float lavaPond   = smoothstep(0.76, 0.95, cosSub + (t1.g - 0.5) * 0.22) * smoothstep(0.38, 0.72, t2.g);
        float tidalGlow  = fissureWeb * smoothstep(-0.14, 0.68, cosSub) * (0.45 + 0.85 * smoothstep(0.20, 0.88, cosSub));
        float magmaTotal = clamp(max(tidalGlow, lavaPond * (0.55 + 0.45 * t3.r)), 0.0, 1.0);

        vec3 scorchedRock = mix(vec3(0.075, 0.065, 0.062), vec3(0.22, 0.14, 0.10), elev);
        scorchedRock = mix(scorchedRock, vec3(0.04, 0.038, 0.042), smoothstep(0.15, 0.45, magmaTotal)); // Glassy obsidian quench rims!
        surfCol = scorchedRock * ls * 1.38 * starTint + scorchedRock * 0.004;

        float lavaTempK = mix(1380.0, 2180.0, clamp(magmaTotal * 1.15, 0.0, 1.0));
        surfCol += kelvinToRgb(lavaTempK) * pow(max(magmaTotal, 0.0), 1.35) * 1.85;
        // tenuous dayside mineral/sodium vapor exosphere shimmer along sunlit limb
        atmoCol = vec3(1.00, 0.48, 0.16) * pow(max(1.0 - viewN, 0.0), 4.2) * smoothstep(0.10, 0.85, cosSub) * eclipseShadow * 0.14;

      } else if (pType < 2.5) {
        // === PROXIMA CENTAURI c (Cold Methane-Ice Banded Mini-Neptune at 1.489 AU, ~7 M_Earth) ===
        // Multi-jet zonal CH4/NH3 cloud bands, cold dark anticyclonic vortex with bright companion cirrus,
        // high-altitude photochemical cyan-lavender haze & subtle equatorial ring-shadow / ring-shine!
        float jetWarp = (t1.r - 0.5) * 0.12 + (t2.g - 0.5) * 0.045;
        float latB = sinLat + jetWarp;
        float bandFine = textureLod(uNoise3D, vec3(latB * 6.8, cos(bodyLon) * 0.9, sin(bodyLon) * 0.9 + animT * 0.015), 0.0).g;
        float zonalStripes = 0.5 + 0.5 * cos(latB * 22.0 + bandFine * 2.2);

        // Cold anticyclonic oval at -24 deg lat + bright high-altitude methane-ice companion streamer!
        float dLonV = terr_safeAtan(sin(bodyLon - (-0.35)), cos(bodyLon - (-0.35)));
        vec2 vortRel = vec2(dLonV / 0.22, (latRad - (-0.42)) / 0.11);
        float vortR2 = dot(vortRel, vortRel);
        float darkVortex = exp(-vortR2 * 1.4);
        float methaneCirrus = exp(-sqr((latDeg - (-19.5)) / 2.6)) * exp(-sqr(degrees(dLonV + 0.12) / 14.0)) *
                              smoothstep(0.35, 0.78, t3.r * 0.6 + bandFine * 0.4);
        float zonalStreaks = smoothstep(0.72, 0.92, textureLod(uNoise3D, vec3(cos(bodyLon * 2.0) * 1.2, sinLat * 16.0, sin(bodyLon * 2.0) * 1.2), 0.0).r);

        vec3 deepBelt  = vec3(0.22, 0.33, 0.54);
        vec3 icyZone   = mix(vec3(0.46, 0.54, 0.72), vec3(0.62, 0.56, 0.74), smoothstep(0.35, 0.85, abs(sinLat)));
        vec3 gasAlbedo = mix(deepBelt, icyZone, bandFine * 0.62 + zonalStripes * 0.38);
        gasAlbedo = mix(gasAlbedo, vec3(0.14, 0.21, 0.38), darkVortex * 0.72);
        gasAlbedo = mix(gasAlbedo, vec3(0.86, 0.90, 0.97), clamp(methaneCirrus * 0.82 + zonalStreaks * 0.34, 0.0, 0.88));

        // Subtle equatorial dust/ice ring-shadow band hint (honoring SPHERE ring-candidate observations)
        float eqRingBand = 1.0 - 0.16 * exp(-sqr((latDeg - 3.5) / 2.2)) * smoothstep(-0.05, 0.45, ndotl);
        float miePc = pow(clamp(ndotl * 0.86 + 0.16, 0.0, 1.0), 0.86) * (0.76 + 0.24 * pow(max(viewN, 0.0), 0.48)) * eclipseShadow;
        surfCol = gasAlbedo * (miePc * 1.06 * eqRingBand) * starTint + gasAlbedo * 0.006;
        atmoCol = vec3(0.46, 0.64, 0.96) * starTint * pow(max(1.0 - viewN, 0.0), 2.9) * smoothstep(-0.28, 0.52, ndotl) * 0.38;

      } else if (pType < 3.5) {
        // === EARTH (1.000 AU, R_eq=6,378.1 km, f=0.00335 — NASA DSCOVR EPIC / Himawari-9 / VIIRS 1:1) ===
        // Sub-solar reference at 102°E so China/India/Indian Ocean/Arabia/East Africa shine in daylight while Europe/Nile sit along dawn!
        vec2 ll = vec2(wrapDeg(degrees(bodyLon) + 102.0), latDeg);
        float fbmCoast = t2.r * 0.55 + t3.g * 0.30 + t4.b * 0.15;
        vec4 carto = evalEarthCartography(ll, localN, fbmCoast, t4.r, t1);
        float coastField = carto.x;
        float mtnSpine   = carto.y;
        float snowCrest  = carto.z;
        float nileOasis  = carto.w;

        float shelf = smoothstep(0.22, 0.355, coastField) * (1.0 - smoothstep(0.365, 0.425, coastField));
        float reefBoost = ellipBlob(ll, vec2(114.0,  11.0), vec2(12.0,  9.0), 0.0) + // South China Sea & Sunda Shelf
                          ellipBlob(ll, vec2(147.0, -18.0), vec2( 6.5,  8.5),-0.3) + // Great Barrier Reef / Coral Sea
                          ellipBlob(ll, vec2(-77.5,  24.2), vec2( 4.5,  3.5), 0.0) + // Bahamas Bank
                          ellipBlob(ll, vec2( 52.0,  26.5), vec2( 4.5,  2.5),-0.3);  // Persian Gulf
        float isLand = smoothstep(0.362, 0.390, coastField);

        // Polar Ice Sheets (Antarctica, Greenland, Arctic Multi-Year Sea Ice Pack >78°N)
        float seaIceCracks = smoothstep(0.32, 0.58, t3.g * 0.65 + t4.r * 0.35);
        float arcticSeaIce = smoothstep(77.5, 84.5, latDeg + (t2.g - 0.5) * 6.0) * (1.0 - isLand) * (0.68 + 0.32 * seaIceCracks);
        float landIce = smoothstep(71.5, 80.0, abs(latDeg) + (t2.g - 0.5) * 6.5) * isLand +
                        smoothstep(63.5, 69.5, -latDeg) * isLand +
                        ellipBlob(ll, vec2(-41.5, 72.2), vec2(12.2, 8.2), 0.22) * isLand * 0.94;
        float polarIce = clamp(landIce + arcticSeaIce, 0.0, 1.0);

        // Bathymetric Deep Sapphire Ocean + Turquoise Carbonate Shelves & Subtropical Gyre Color
        float tropWater = exp(-sqr(latDeg / 26.0));
        vec3 abyssBlue = mix(vec3(0.008, 0.036, 0.142), vec3(0.012, 0.060, 0.212), tropWater * 0.75 + t1.b * 0.25);
        vec3 turquoiseShelf = mix(vec3(0.022, 0.228, 0.348), vec3(0.045, 0.375, 0.475), clamp(reefBoost, 0.0, 1.0));
        vec3 deepOcean = mix(abyssBlue, turquoiseShelf, clamp(shelf * (0.70 + 0.44 * clamp(reefBoost, 0.0, 1.0)), 0.0, 1.0));

        // Domain-Warped Regional Deserts & Arid Plateaus (Natural organic boundaries, zero circular bullseyes!)
        vec2 llBio = ll + vec2((t1.r - 0.5) * 6.5 + (t2.g - 0.5) * 2.8,
                               (t1.b - 0.5) * 4.5 + (t2.r - 0.5) * 2.0);
        float desertMask = 0.0;
        desertMask = max(desertMask, ellipBlob(llBio, vec2( 10.5,  23.2), vec2(22.0,  7.8),  0.03)); // Sahara
        desertMask = max(desertMask, ellipBlob(llBio, vec2( 46.2,  22.8), vec2( 9.2,  7.5), -0.34)); // Rub' al Khali / Arabia
        desertMask = max(desertMask, ellipBlob(llBio, vec2( 58.5,  33.8), vec2(12.5,  6.5), -0.10)); // Iranian Plateau / Balochistan
        desertMask = max(desertMask, ellipBlob(llBio, vec2( 63.0,  42.0), vec2(10.5,  4.8),  0.05) * 0.85); // Karakum / Kyzylkum
        desertMask = max(desertMask, ellipBlob(llBio, vec2( 83.5,  39.0), vec2( 7.5,  3.2),  0.05) * 1.12); // Taklamakan (Tarim Basin)
        desertMask = max(desertMask, ellipBlob(llBio, vec2(104.0,  42.8), vec2(11.5,  4.5), -0.08) * 0.90); // Gobi Desert
        desertMask = max(desertMask, ellipBlob(llBio, vec2(130.5, -24.8), vec2(12.2,  6.2), -0.05)); // Australian Outback
        desertMask = max(desertMask, ellipBlob(llBio, vec2(-111.5, 31.5), vec2( 6.8,  5.8), -0.25)); // Sonoran / Mojave
        desertMask = max(desertMask, ellipBlob(llBio, vec2( 18.5, -24.2), vec2( 4.8,  5.8),  0.10)); // Namib / Kalahari
        desertMask = max(desertMask, ellipBlob(llBio, vec2(-69.5, -23.5), vec2( 2.2,  6.5),  0.10)); // Atacama
        desertMask = smoothstep(0.18, 0.62, desertMask * (0.86 + 0.24 * t2.b)) * (1.0 - nileOasis * 0.94);

        // Rich Multi-Biome Vegetation & Smooth Sweeping Erg Sand Seas (NASA Blue Marble Palette)
        float tropRain   = exp(-sqr(latDeg / 13.5));
        float eastAsiaGreen = ellipBlob(llBio, vec2(113.0, 27.2), vec2(11.0, 8.8), -0.10) +
                              ellipBlob(llBio, vec2( 81.5, 22.5), vec2( 8.5, 6.8),  0.00) +
                              ellipBlob(llBio, vec2(102.0, 16.5), vec2( 6.5, 7.5), -0.15);
        float europeGreen = ellipBlob(llBio, vec2( 14.0, 49.5), vec2(16.0, 6.5), 0.05) * 0.75;
        float borealBelt = smoothstep(47.0, 56.5, abs(latDeg)) * (1.0 - smoothstep(64.5, 71.5, abs(latDeg)));
        vec3 tropForest  = mix(vec3(0.034, 0.142, 0.038), vec3(0.088, 0.215, 0.062), t2.g * 0.70 + t3.r * 0.30);
        vec3 borealTaiga = vec3(0.042, 0.118, 0.052);
        vec3 savanna     = mix(vec3(0.19, 0.22, 0.095), vec3(0.27, 0.25, 0.13), t2.r);

        // Smooth Blue-Marble sweeping sand ergs (limestone buff <-> golden dune ergs, plus dark volcanic massifs)
        float ergWave    = smoothstep(0.22, 0.78, t1.g * 0.62 + t2.r * 0.38);
        vec3 desertSand  = mix(vec3(0.47, 0.36, 0.22), vec3(0.64, 0.53, 0.37), ergWave);
        float outbackRed = ellipBlob(llBio, vec2(131.0, -25.0), vec2(13.0, 6.8), 0.0);
        float saharaMassif = smoothstep(0.62, 0.82, t2.b * 0.72 + t3.r * 0.28) *
                             (ellipBlob(llBio, vec2(13.5, 21.5), vec2(14.0, 5.8), 0.0) +
                              ellipBlob(llBio, vec2(40.2, 23.0), vec2( 3.2, 5.5),-0.3)); // Tibesti/Hoggar & Hejaz mountains!
        desertSand = mix(desertSand, vec3(0.52, 0.24, 0.13), outbackRed * 0.74);
        desertSand = mix(desertSand, vec3(0.25, 0.19, 0.15), clamp(saharaMassif, 0.0, 1.0) * 0.72);
        vec3 tibetSteppe = mix(vec3(0.34, 0.27, 0.19), vec3(0.44, 0.35, 0.25), t2.g);
        vec3 rockMtn     = vec3(0.30, 0.27, 0.25);

        float forestWeight = clamp(tropRain + eastAsiaGreen * 0.78 + europeGreen + nileOasis * 0.96 + 0.42 * smoothstep(35.0, 50.0, abs(latDeg)), 0.0, 1.0);
        vec3 land = mix(savanna, tropForest, forestWeight);
        land = mix(land, borealTaiga, borealBelt * 0.72);
        land = mix(land, desertSand, desertMask * 0.93);
        float tibetMask = smoothstep(0.22, 0.65, ellipBlob(llBio, vec2(87.8, 33.4), vec2(12.2, 4.6), -0.08));
        land = mix(land, tibetSteppe, tibetMask * 0.80);

        float mtnElev = clamp(mtnSpine * (0.78 + 0.30 * t2.b) + smoothstep(0.62, 0.88, coastField) * 0.22, 0.0, 1.0);
        land = mix(land, rockMtn, smoothstep(0.42, 0.75, mtnElev) * 0.68);
        // Crisp Glaciated Snow Strictly Along Narrow Himalayan Southern Rim, Karakoram, Tianshan, Alps & Andes!
        float snowLine = smoothstep(0.42, 0.72, snowCrest * (0.78 + 0.36 * t2.g));
        land = mix(land, vec3(0.91, 0.94, 0.98), snowLine * 0.90);

        // 3D Cordillera & Coastline Relief + Exact Spin-Axis World Tangent Basis
        vec3 axE   = normalize(axisWorld);
        vec3 wTanE = (abs(dot(nrm, axE)) < 0.995) ? normalize(cross(axE, nrm)) : normalize(cross(nrm, vec3(1.0, 0.0, 0.0)));
        vec3 wTanN = normalize(cross(nrm, wTanE));
        vec3 lTanE = (abs(localN.y) < 0.995) ? normalize(vec3(-localN.z, 0.0, localN.x)) : vec3(1.0, 0.0, 0.0);
        vec3 lTanN = normalize(cross(localN, lTanE));
        float hBase = textureLod(uNoise3D, localN * 8.5, 0.0).b;
        float hU = textureLod(uNoise3D, (localN + lTanE * 0.012) * 8.5, 0.0).b - hBase;
        float hV = textureLod(uNoise3D, (localN + lTanN * 0.012) * 8.5, 0.0).b - hBase;
        vec3 bumpedN = normalize(nrm - (wTanE * hU + wTanN * hV) * (0.85 * isLand * (0.25 + snowCrest * 1.15 + mtnElev * 0.42)));
        float landDiff = smoothstep(-0.08, 0.86, dot(bumpedN, lightDir)) * max(0.0, dot(bumpedN, lightDir) + 0.06) * eclipseShadow;

        vec3 base = mix(mix(deepOcean, land, isLand), vec3(0.90, 0.93, 0.97), polarIce);

        // === 1:1 SATELLITE-GRADE MULTI-LAYER METEOROLOGY (DSCOVR EPIC / Himawari-9 / GOES-16) ===
        // Subtropical Hadley high-pressure atmospheric windows keep Sahara, Arabia, Red Sea, Himalayas, India & China coasts crystal-clear!
        float heroCartoWindow = max(
          max(ellipBlob(ll, vec2(114.5, 31.2), vec2(11.5, 11.2),  0.08),  // Bohai / Shandong / Yangtze / Taiwan / South China coast!
              ellipBlob(ll, vec2( 81.5, 24.5), vec2(13.5, 11.5),  0.00)), // Peninsular India, Ganges & Himalayan Snow Rim!
          ellipBlob(ll, vec2( 28.0, 23.5), vec2(30.0, 11.5), -0.06)       // Sahara, Nile, Red Sea, Arabia & Persian Gulf!
        );
        float subtropDry = exp(-sqr((abs(latDeg) - 25.5) / 10.5)) * 0.30;
        float clearLandWin = clamp(1.0 - 0.68 * desertMask * isLand - 0.62 * heroCartoWindow * (0.45 + 0.55 * isLand) - subtropDry * isLand, 0.14, 1.0);

        // Evaluate Multi-Layer Cloud Deck: x=denseOpacity, y=cirrusOpacity, z=verticalRelief, w=marineStratocumulusMask
        vec4 cld0 = terr_evalEarthCloudField(localN, animT, clearLandWin, isLand);
        float cDense  = cld0.x;
        float cCirrus = cld0.y;
        float cRelief = cld0.z;
        float cMarine = cld0.w;

        // Exact Sun-Aligned Ground & Ocean Cloud Shadow (lengthens physically at low solar elevation near terminator!)
        vec3 localLight = computePlanetLocalNormal(lightDir, axisWorld, subStarDir, spinPhase);
        float shSlant   = 0.0135 / clamp(ndotl + 0.24, 0.30, 1.18);
        vec3 shProbeN   = normalize(localN + localLight * shSlant);
        vec4 cldShadowP = terr_evalEarthCloudField(shProbeN, animT, clearLandWin, isLand);
        float shadowCaster = clamp(cldShadowP.x * 0.92 + cldShadowP.y * 0.24, 0.0, 1.0);
        float cShadow = 1.0 - 0.58 * shadowCaster * smoothstep(-0.05, 0.18, ndotl);

        // 3D Cloud-Top Normal Perturbation (finite-difference of multi-scale turbulence + cyclone/frontal relief!)
        vec3 lWind0 = vec3(rot2D(localN.xz, -animT * 0.0055), localN.y).xzy;
        float bumpStep = 0.015;
        float bCenter = textureLod(uNoise3D, lWind0 * 8.2, 0.0).g * 0.65 + cRelief * 0.55;
        vec3 nEastP   = normalize(localN + lTanE * bumpStep);
        vec3 nNorthP  = normalize(localN + lTanN * bumpStep);
        // Fast micro-relief + mesoscale cloud-top dome gradient for crisp 3D eyewalls & overshooting cumulonimbus tops!
        float bEast   = textureLod(uNoise3D, vec3(rot2D(nEastP.xz,  -animT * 0.0055), nEastP.y).xzy  * 8.2, 0.0).g * 0.65 + cRelief * 0.55;
        float bNorth  = textureLod(uNoise3D, vec3(rot2D(nNorthP.xz, -animT * 0.0055), nNorthP.y).xzy * 8.2, 0.0).g * 0.65 + cRelief * 0.55;
        float dCloudU = (bEast - bCenter) + (cldShadowP.z - cRelief) * dot(localLight, lTanE) * 0.45;
        float dCloudV = (bNorth - bCenter) + (cldShadowP.z - cRelief) * dot(localLight, lTanN) * 0.45;
        vec3 cloudN = normalize(nrm - (wTanE * dCloudU + wTanN * dCloudV) * (1.28 + cRelief * 1.10));
        float cloudNdotL = dot(cloudN, lightDir);

        // Cox-Munk Anisotropic Roughened Ocean Sunglint (sparkling between trade-wind cumulus streets, occluded by shadows!)
        float cloudsCombined = clamp(cDense + cCirrus * (1.0 - cDense) * 0.62, 0.0, 1.0);
        vec3 waterN = normalize(nrm + (wTanE * (t4.r - 0.5) + wTanN * (t4.g - 0.5)) * 0.035);
        vec3 halfV = normalize(lightDir + viewDir);
        float specCore  = pow(max(dot(waterN, halfV), 0.0), 135.0) * 1.34;
        float specBroad = pow(max(dot(waterN, halfV), 0.0), 34.0) * 0.15;
        float glint = (specCore + specBroad) * (1.0 - isLand) * (1.0 - polarIce) *
                      (1.0 - cDense * 0.95) * (1.0 - cCirrus * 0.48) * cShadow * max(0.0, ndotl) * eclipseShadow;

        // Stratospheric Ozone Chappuis-Band Sunset/Sunrise Coloring + High-Altitude Cirrus Late-Twilight Catch!
        float twilight     = exp(-sqr((ndotl + 0.015) / 0.145)) * eclipseShadow;
        float highTwilight = exp(-sqr((ndotl + 0.052) / 0.155)) * eclipseShadow; // 12-km ice cirrus stays lit past surface dusk!

        // Optical Albedo Differentiation: Marine Stratocumulus (soft pearl-grey 0.82) vs Deep Convective Towers (brilliant white 0.99)
        vec3 denseAlb = mix(vec3(0.96, 0.98, 1.00), vec3(0.81, 0.84, 0.88), cMarine * 0.65);
        vec3 denseTint = mix(denseAlb, vec3(1.00, 0.55, 0.27), twilight * 0.74);
        vec3 cirrusTint = mix(vec3(0.92, 0.96, 1.00), vec3(1.00, 0.50, 0.25), highTwilight * 0.80);

        // Self-shadowed convective cloud valleys pick up subtle cool Rayleigh sky-fill!
        float directCloud = smoothstep(-0.11, 0.80, cloudNdotL) * 0.86 + smoothstep(-0.08, 0.36, ndotl) * 0.16;
        vec3 skyAmbient   = vec3(0.42, 0.58, 0.82) * smoothstep(-0.10, 0.50, ndotl) * 0.08 * (1.0 - clamp(cloudNdotL, 0.0, 1.0));
        float cirrusShade = smoothstep(-0.16, 0.68, ndotl + 0.045) * 0.96;

        // Henyey-Greenstein / Mie Forward-Scattered Silver-Lining near backlit limb & thin cloud edges!
        float mieFwd = pow(max(dot(viewDir, -lightDir), 0.0), 4.2) * pow(max(1.0 - viewN, 0.0), 1.35) *
                       smoothstep(-0.24, 0.38, ndotl) * eclipseShadow;
        vec3 silverLining = vec3(1.00, 0.93, 0.80) * mieFwd * (0.34 * cCirrus + 0.26 * cDense * (1.0 - cDense * 0.55));

        vec3 litSurf   = (base * (mix(diff, landDiff, isLand) * 1.18 * cShadow) + vec3(1.00, 0.94, 0.84) * glint) * starTint;
        vec3 litDense  = (denseTint * directCloud + skyAmbient) * eclipseShadow * starTint;
        vec3 litCirrus = cirrusTint * (cirrusShade * eclipseShadow) * starTint;

        // Physically layered radiative transfer: Surface -> Dense Low/Deep Clouds -> Semi-Translucent High Ice Cirrus!
        vec3 afterDense = mix(litSurf, litDense, cDense * 0.92);
        float cirrusAlpha = cCirrus * (0.48 - 0.22 * cDense); // Feathery semi-translucent veil over ocean/land & lower decks!
        surfCol = mix(afterDense, litCirrus, clamp(cirrusAlpha, 0.0, 0.52)) + silverLining * starTint;

        // DSCOVR EPIC On-Disk Molecular Rayleigh Aerial Perspective Veil!
        float rayleighPath = 1.0 - exp(-0.048 / max(viewN, 0.16));
        vec3 onDiskRayleigh = mix(vec3(0.18, 0.50, 0.98), vec3(1.00, 0.42, 0.16), twilight * 0.68);
        surfCol += onDiskRayleigh * rayleighPath * smoothstep(-0.16, 0.65, ndotl) * eclipseShadow * 0.42 * starTint;

        // VIIRS Nightside Megacity Corridors + 557.7nm Atomic Oxygen Airglow & Polar Aurora!
        float nightMask = sstepInv(0.02, -0.16, ndotl);
        if (nightMask > 0.001) {
          float cities = evalEarthCityLights(ll, coastField, t3.r, t4.g) * isLand * (1.0 - polarIce * 0.92);
          // City lights softly diffuse through thin cirrus while dense convective clouds attenuate them
          vec3 cityHue = mix(vec3(1.00, 0.68, 0.28), vec3(1.00, 0.88, 0.65), clamp(cities - 0.45, 0.0, 1.0));
          surfCol += cityHue * (cities * nightMask * (1.0 - cloudsCombined * 0.72) * 0.38);

          // High-latitude Geomagnetic Aurora Borealis / Australis (~66°-72° lat)
          float aurOval = exp(-sqr((abs(latDeg) - 67.5) / 3.4));
          float aurCurtain = pow(clamp(textureLod(uNoise3D, vec3(localN.xz * 5.5, animT * 0.12), 0.0).r * 1.15, 0.0, 1.0), 2.4);
          surfCol += vec3(0.12, 0.92, 0.48) * (aurOval * aurCurtain * nightMask * 0.14);
        }
        surfCol += base * 0.0035;

        vec3 rayleighRimHue = mix(vec3(0.18, 0.54, 1.00), vec3(1.00, 0.38, 0.14), twilight * 0.72);
        vec3 nightAirglow   = vec3(0.10, 0.36, 0.24) * pow(max(1.0 - viewN, 0.0), 4.2) * nightMask * 0.14;
        atmoCol = rayleighRimHue * pow(max(1.0 - viewN, 0.0), 2.85) * smoothstep(-0.28, 0.55, ndotl) * 0.50 + nightAirglow;

      } else if (pType < 4.5) {
        // === MERCURY (0.387 AU, R_eq=2,440.5 km — MESSENGER MDIS Global Color, Caloris, Pantheon Fossae & Rachmaninoff) ===
        // Offset +142°E puts Caloris Planitia (162.7°E), Pantheon Fossae, Rembrandt (87.9°E), Rachmaninoff (57.4°E) & Basho in hero light!
        vec2 ll = vec2(wrapDeg(degrees(bodyLon) + 142.0), latDeg);

        // 1. Caloris Planitia (30.5°N, 162.7°E -> 1,550 km multi-ring basin flooded by warm tan volcanic plains!)
        vec2 dCalVec = vec2(wrapDeg(ll.x - 162.7) * 0.86, ll.y - 30.5);
        float calorisD = length(dCalVec) / 19.5;
        float calorisFloor = sstepInv(1.04, 0.62, calorisD);
        float calorisRim   = exp(-sqr((calorisD - 1.02) / 0.13)) * (0.72 + 0.45 * t2.r);
        // Pantheon Fossae ("The Spider", 30.2°N, 162.8°E): radial extensional graben troughs + central Apollodorus ray crater!
        vec2 dPan = vec2(wrapDeg(ll.x - 162.8) * 0.86, ll.y - 30.2);
        float rPan = length(dPan);
        float panAng = (rPan > 1e-4) ? terr_safeAtan(dPan.y, dPan.x) : 0.0;
        float pantheonFossae = exp(-rPan / 7.5) * smoothstep(0.6, 2.2, rPan) *
                               pow(max(0.5 + 0.5 * cos(panAng * 18.0 + t3.r * 1.4), 0.0), 5.0);
        float apollodorus = exp(-rPan / 1.65) + exp(-rPan / 5.5) * pow(max(0.5 + 0.5 * cos(panAng * 7.0), 0.0), 4.0) * 0.55;
        float atgetDark   = exp(-sqr(length(vec2(wrapDeg(ll.x - 166.1) * 0.88, ll.y - 25.6)) / 1.35)); // Dark LRM Atget crater floor!

        // 2. Rachmaninoff Double-Ring Peak-Ring Basin (27.6°N, 57.4°E, 290 km — smooth bright inner volcanic floor + pyroclastic vent!)
        float rRach = length(vec2(wrapDeg(ll.x - 57.4) * 0.88, ll.y - 27.6)) / 4.2;
        float rachOuterRim = exp(-sqr((rRach - 1.00) / 0.15));
        float rachPeakRing = exp(-sqr((rRach - 0.48) / 0.11));
        float rachInnerPlains = sstepInv(0.46, 0.15, rRach);
        float rachPyroVent = exp(-sqr(length(vec2(wrapDeg(ll.x - 59.2) * 0.88, ll.y - 29.1)) / 2.2)); // Bright orange pyroclastic deposit!

        // 3. Rembrandt Giant Southern Basin (-32.9°S, 87.9°E, 715 km) & Borealis Northern Smooth Plains (>58°N)
        float rRemb = length(vec2(wrapDeg(ll.x - 87.9) * 0.84, ll.y - (-32.9))) / 9.2;
        float rembRim   = exp(-sqr((rRemb - 1.00) / 0.14));
        float rembFloor = sstepInv(0.96, 0.55, rRemb);
        float borealis  = smoothstep(56.0, 74.0, latDeg);

        // 4. Global Planetary-Contraction Lobate Thrust Scarps (Enterprise Rupes, Discovery Rupes, Beagle Rupes)
        float scarpRidge = pow(max(1.0 - abs(textureLod(uNoise3D, localN * 4.2 + vec3(0.31, 0.17, 0.53), 0.0).r - 0.52) * 2.0, 0.0), 8.0);
        float rupesArcs  = segField(ll, vec2( 72.0, -34.0), vec2( 96.0, -38.0), 1.3) + // Enterprise Rupes
                           segField(ll, vec2(-38.0, -52.0), vec2(-18.0, -58.0), 1.3);  // Discovery Rupes
        float lobateScarp = clamp(scarpRidge * 0.14 + rupesArcs * 0.22, 0.0, 0.30);

        // 3D Finite-Difference Crater + Basin + Peak-Ring + Lobate Scarp Topography
        vec3 tU = normalize(cross(localN, abs(localN.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
        vec3 tV = cross(localN, tU);
        float eps = 0.0085;
        float roughScale = mix(1.0, 0.34, clamp(max(max(calorisFloor, rembFloor * 0.8), max(rachInnerPlains, borealis * 0.78)), 0.0, 1.0));
        float basinRelief = calorisRim * 0.34 - calorisFloor * 0.18 - pantheonFossae * 0.12 +
                            (rachOuterRim * 0.30 + rachPeakRing * 0.20 - sstepInv(0.95, 0.55, rRach) * 0.22) +
                            (rembRim * 0.26 - rembFloor * 0.16) + lobateScarp;
        float h0 = evalCraterHeight(localN) * roughScale + basinRelief;
        float hX = evalCraterHeight(normalize(localN + tU * eps)) * roughScale + basinRelief;
        float hY = evalCraterHeight(normalize(localN + tV * eps)) * roughScale + basinRelief;

        vec3 wTanU = normalize(cross(nrm, abs(nrm.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
        vec3 wTanV = cross(nrm, wTanU);
        vec3 bumpedN = normalize(nrm - (wTanU * (hX - h0) + wTanV * (hY - h0)) * 2.95);

        float mu0 = max(0.0, dot(bumpedN, lightDir));
        float muV = max(0.05, dot(bumpedN, viewDir));
        float ls = (mu0 / (mu0 + muV + 0.06)) * 2.32 * smoothstep(-0.04, 0.08, ndotl) * eclipseShadow;
        float oppSurge = 1.0 + 0.34 * pow(max(0.0, dot(viewDir, lightDir)), 6.0);

        // 5. Fresh Bright Blue-White Ray Craters (Kuiper, Hokusai, Debussy & Dark-Halo Basho!) + Cyan Volatile Hollows!
        vec2 dKuiper = vec2(wrapDeg(ll.x - (-31.4)) * 0.98, ll.y - (-11.3));
        float rKuiper = length(dKuiper);
        float angKui  = (rKuiper > 1e-4) ? terr_safeAtan(dKuiper.y, dKuiper.x) : 0.0;
        float rayKuiper = exp(-rKuiper / 21.0) * pow(max(0.5 + 0.5 * cos(angKui * 9.0 + t2.r * 3.0), 0.0), 3.0) + exp(-rKuiper / 2.8);

        vec2 dHokusai = vec2(wrapDeg(ll.x - 16.8) * 0.54, ll.y - 57.8);
        float rHok = length(dHokusai);
        float angHok = (rHok > 1e-4) ? terr_safeAtan(dHokusai.y, dHokusai.x) : 0.0;
        float rayHok = exp(-rHok / 26.0) * pow(max(0.5 + 0.5 * cos(angHok * 8.0 + t2.g * 3.0), 0.0), 3.0) + exp(-rHok / 3.0);

        vec2 dDebussy = vec2(wrapDeg(ll.x - 12.5) * 0.83, ll.y - (-33.9));
        float rDeb = length(dDebussy);
        float angDeb = (rDeb > 1e-4) ? terr_safeAtan(dDebussy.y, dDebussy.x) : 0.0;
        float rayDeb = exp(-rDeb / 19.0) * pow(max(0.5 + 0.5 * cos(angDeb * 8.0 + t3.b * 2.6), 0.0), 3.2) + exp(-rDeb / 2.5);

        vec2 dBasho = vec2(wrapDeg(ll.x - (-170.5)) * 0.84, ll.y - (-32.4));
        float rBasho = length(dBasho);
        float angBasho = (rBasho > 1e-4) ? terr_safeAtan(dBasho.y, dBasho.x) : 0.0;
        float bashoDarkHalo = exp(-sqr((rBasho - 2.2) / 1.4)); // Famous dark LRM ejecta collar around Basho!
        float rayBasho = exp(-rBasho / 18.0) * smoothstep(2.0, 4.5, rBasho) * pow(max(0.5 + 0.5 * cos(angBasho * 7.0 + t2.b * 2.5), 0.0), 3.0) + exp(-rBasho / 1.4);

        // MESSENGER Volatile-Sublimation "Hollows": ultra-bright cyan-blue rimless pits inside peak-ring & floor craters!
        float microRays = pow(clamp(t3.r * 0.62 + t4.g * 0.48, 0.0, 1.0), 5.6);
        float hollows   = pow(clamp(t4.r * 0.58 + t3.b * 0.52, 0.0, 1.0), 7.5) * (0.45 + 0.85 * calorisFloor + 0.75 * rachPeakRing);

        // Graphite-rich Dark Blue-Charcoal Low-Reflectance Material (LRM: Tolstoj -163.5°E, -16.3°S + Atget + global LRM)
        float tolstojLRM = ellipBlob(ll, vec2(-163.5, -16.3), vec2(11.0, 9.5), 0.1);
        float lrmDark = clamp((smoothstep(0.57, 0.78, t1.b * 0.70 + t2.r * 0.30) * (1.0 - calorisFloor * 0.85) +
                               tolstojLRM * 0.85 + bashoDarkHalo * 0.90 + atgetDark * 0.95), 0.0, 1.0);

        // MESSENGER MDIS Calibrated Reflectance Palette (graphite blue-grey LRM vs warm tan volcanic plains vs cyan hollows/rays)
        vec3 regolith = mix(vec3(0.144, 0.135, 0.126), vec3(0.092, 0.095, 0.106), lrmDark * 0.82);
        regolith = mix(regolith, vec3(0.214, 0.186, 0.156), clamp(calorisFloor * 0.90 + rachInnerPlains * 0.85 + borealis * 0.48 + rembFloor * 0.40, 0.0, 0.92));
        regolith = mix(regolith, vec3(0.265, 0.195, 0.135), rachPyroVent * 0.62); // Pyroclastic orange-tan vent!
        regolith = mix(regolith, vec3(0.238, 0.220, 0.198), clamp(calorisRim * 0.65 + rachOuterRim * 0.55 + rachPeakRing * 0.55, 0.0, 0.80));
        float totalRays = clamp(rayKuiper * 0.85 + rayHok * 0.85 + rayDeb * 0.80 + rayBasho * 0.82 + apollodorus * 0.72 + microRays * 0.58, 0.0, 0.92);
        regolith = mix(regolith, vec3(0.34, 0.36, 0.40), totalRays);
        regolith = mix(regolith, vec3(0.38, 0.44, 0.50), clamp(hollows * 1.35, 0.0, 0.85)); // Crisp cyan-blue MESSENGER hollows!
        surfCol = regolith * ls * oppSurge * 1.68 * starTint + regolith * 0.003;

      } else if (pType < 5.5) {
        // === VENUS (0.723 AU, R=6,051.8 km — Akatsuki UVI & Mariner 10 H2SO4 Cloud Deck, Y-Wave, Polar Collar & Bow Wave) ===
        // 4-day Retrograde Super-Rotation (u ~ -100 m/s): planetary equatorial dark UV Y-wave + stationary Aphrodite bow wave!
        float superRot = animT * 0.022;
        float absSinLat = abs(sinLat);
        // Differential zonal shear bends equatorial waves into classic Mariner 10 / Akatsuki mid-latitude chevrons!
        float chevronLon = bodyLon + 0.58 + 1.55 * pow(max(absSinLat, 0.0), 1.55) + superRot;
        vec3 vCoord = vec3(cos(chevronLon) * 1.48, sinLat * 2.85, sin(chevronLon) * 1.48);

        // 1. Planetary-Scale Equatorial Dark UV-Absorber Horizontal "Y-Wave" (Kelvin + Rossby Wave Mode)
        // Dark stem along equator + bifurcating symmetric arms sweeping poleward & trailing to +/-42 deg latitude!
        float yPhase = wrapDeg(degrees(bodyLon + 0.58 + superRot)); // Centered cleanly on sunlit hero face!
        float yForkAngle = smoothstep(-25.0, 115.0, yPhase);
        float armLatTarget = 7.0 + 31.0 * smoothstep(-15.0, 95.0, yPhase);
        float yArms = exp(-sqr((abs(latDeg) - armLatTarget) / 9.5)) * yForkAngle * sstepInv(155.0, 95.0, yPhase);
        float yStem = exp(-sqr(latDeg / 8.5)) * smoothstep(-155.0, -95.0, yPhase) * sstepInv(5.0, -35.0, yPhase);
        // Bright creamy-ivory equatorial oval cradled right inside the open fork of the Y!
        float yBrightCore = exp(-sqr(latDeg / 14.5)) * smoothstep(5.0, 45.0, yPhase) * sstepInv(125.0, 75.0, yPhase);
        float darkUVWave = clamp(yArms * 0.92 + yStem * 0.88, 0.0, 1.0);

        // 2. Akatsuki 10,000-km Stationary Gravity Bow Wave fixed over Aphrodite Terra highland!
        // Stays fixed relative to planet spin (bodyLon), independent of fast superRot cloud drift!
        float bowArcLon = wrapDeg(degrees(bodyLon) + 28.0 - 0.026 * latDeg * latDeg);
        float bowEnv    = exp(-sqr(latDeg / 35.0));
        float bowCrest  = exp(-sqr(bowArcLon / 3.2)) * bowEnv;
        float bowTrough = exp(-sqr((bowArcLon - 4.8) / 3.6)) * bowEnv;

        // 3. Circum-equatorial afternoon cellular convection mottling + laminar mid-latitude chevron streaks
        float streak1 = textureLod(uNoise3D, vCoord * 1.38 + 0.21, 0.0).g;
        float streak2 = textureLod(uNoise3D, vCoord * 4.10 + streak1 * 0.26, 0.0).r;
        float subSolarCells = smoothstep(0.35, 0.92, ndotl) * exp(-sqr(latDeg / 26.0)) *
                              (textureLod(uNoise3D, vCoord * 11.5, 0.0).b - 0.5) * 0.14;

        // 4. Bright Cold Polar Collars (~63°-75° lat) encircling Darker Warm S-Dipole Polar Vortices (>76° lat)!
        float absLat = abs(latDeg);
        float polarCollar = exp(-sqr((absLat - 67.5) / 6.2));
        float dipoleAng   = 2.0 * bodyLon + superRot * 1.8 + (90.0 - absLat) * 0.18;
        float polarDipole = smoothstep(73.0, 83.0, absLat) * (0.55 + 0.45 * cos(dipoleAng));

        // Combine into calibrated Mariner 10 / Akatsuki H2SO4 palette (Bond albedo ~0.77 creamy-ivory & sulfur-ochre UV streaks)
        float uvShade = clamp(0.56 + (streak1 - 0.5) * 0.42 + (streak2 - 0.5) * 0.24 - darkUVWave * 0.38 +
                              yBrightCore * 0.20 + bowCrest * 0.15 - bowTrough * 0.12 + subSolarCells, 0.0, 1.0);
        vec3 darkSulfurAbs = vec3(0.75, 0.65, 0.47);
        vec3 brightCream   = vec3(0.96, 0.91, 0.77);
        vec3 venusCream = mix(darkSulfurAbs, brightCream, uvShade);
        venusCream = mix(venusCream, vec3(0.97, 0.94, 0.84), polarCollar * 0.68); // Bright cold polar collar!
        venusCream = mix(venusCream, vec3(0.73, 0.62, 0.45), polarDipole * 0.58); // Darker polar S-dipole eye!

        // Thick H2SO4 Aerosol Multiple-Scattering Mie Photometry + Subtle Bow-Wave Normal Ripple
        vec3 wTanE = normalize(cross(normalize(axisWorld), nrm) + 1e-6);
        vec3 venusN = normalize(nrm + wTanE * (bowCrest - bowTrough) * 0.035);
        float vNdotL = dot(venusN, lightDir);
        float mieDiff = pow(clamp(vNdotL * 0.88 + 0.16, 0.0, 1.0), 0.82) * (0.74 + 0.26 * pow(max(viewN, 0.0), 0.45)) * eclipseShadow;
        surfCol = venusCream * mieDiff * 0.94 * starTint + venusCream * 0.003;
        atmoCol = vec3(1.00, 0.90, 0.70) * pow(max(1.0 - viewN, 0.0), 2.8) * smoothstep(-0.26, 0.55, ndotl) * 0.33;

      } else if (pType < 6.5) {
        // === MARS (1.524 AU, R_eq=3,396.2 km, f=0.00589 — MRO MARCI / Viking 1:1 Landmarks, Canyon Fog & Polar Spiral) ===
        vec2 ll = vec2(wrapDeg(degrees(bodyLon) - 90.0), latDeg);

        // 1. Crustal Dichotomy: smooth low northern Vastitas Borealis vs rugged cratered southern highlands
        float northLowlands = smoothstep(10.0, 38.0, ll.y + 13.0 * cos(radians(ll.x - 25.0)));

        // 2. 3D Shield Volcanoes: Olympus Mons (-133.8°E, +18.65°N) + Tharsis Trio (Ascraeus, Pavonis, Arsia) + Elysium + Alba
        float dOly = length(vec2(wrapDeg(ll.x - (-133.8)) * 0.95, ll.y - 18.65));
        float olyShield  = exp(-sqr(dOly / 4.6));
        float olyCaldera = exp(-pow4(dOly / 1.12));
        float olyScarp   = exp(-sqr((dOly - 4.35) / 0.58)); // 8-km basal cliff scarp!

        float dAsc = length(vec2(wrapDeg(ll.x - (-104.1)), ll.y - 11.9));
        float dPav = length(vec2(wrapDeg(ll.x - (-113.0)), ll.y -  1.5));
        float dArs = length(vec2(wrapDeg(ll.x - (-121.0)), ll.y - (-8.3)));
        float dElys = length(vec2(wrapDeg(ll.x - 147.2) * 0.91, ll.y - 25.0)); // Elysium Mons!
        float tharsisTri  = exp(-sqr(dAsc / 3.1)) + exp(-sqr(dPav / 3.0)) + exp(-sqr(dArs / 3.3)) + exp(-sqr(dElys / 2.8)) * 0.75;
        float tharsisCald = exp(-pow4(dAsc / 0.80)) + exp(-pow4(dPav / 0.80)) + exp(-pow4(dArs / 1.05)) + exp(-pow4(dElys / 0.65)) * 0.7;
        float tharsisDome = ellipBlob(ll, vec2(-112.0, 2.0), vec2(24.0, 20.0), 0.35);

        // 3. 4,000-km Valles Marineris Rift System (Noctis Labyrinthus -> Ius/Melas/Candor/Coprates -> Capri/Chryse Outflow!)
        float vmNoctis = ellipBlob(ll, vec2(-98.5, -7.2), vec2(3.6, 2.8), 0.15) * 0.85;
        float vmMain   = segField(ll, vec2(-96.0, -7.5), vec2(-54.0, -13.9), 2.05) +
                         segField(ll, vec2(-54.0, -13.9), vec2(-37.0, -14.5), 2.45) * 0.85 +
                         segField(ll, vec2(-76.5, -6.2), vec2(-61.5, -8.4), 1.45) * 0.78 + // Parallel Candor/Ophir Chasma!
                         vmNoctis;
        float vmOutflow = (segField(ll, vec2(-42.0, -11.0), vec2(-28.0, 15.0), 3.4) +
                           segField(ll, vec2(-68.0,   4.0), vec2(-48.0, 22.0), 2.6) * 0.70) * 0.46; // Ares/Tiu & Kasei Valles!
        float canyonCarve = clamp(vmMain, 0.0, 1.18);

        // 4. Hellas Planitia (-42.4°S, +70.5°E) & Argyre (-49.7°S, -43.0°E) & Isidis (+12.9°N, +87.0°E) Basins
        float hellas = ellipBlob(ll, vec2( 70.5, -42.4), vec2(17.5, 12.8), 0.0);
        float argyre = ellipBlob(ll, vec2(-43.0, -49.7), vec2( 7.8,  6.5), 0.0);
        float isidis = ellipBlob(ll, vec2( 87.0,  12.9), vec2( 6.8,  6.2), 0.0);

        // 3D Finite-Difference Normal Perturbation across Craters, Olympus Mons, Tharsis Trio & Valles Marineris!
        vec3 tU = normalize(cross(localN, abs(localN.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
        vec3 tV = cross(localN, tU);
        float craterScale = mix(0.64, 0.17, clamp(max(northLowlands, tharsisDome * 0.85), 0.0, 1.0));
        float hBase = evalCraterHeight(localN * 0.92) * craterScale + elev * 0.36;
        float h0 = hBase + olyShield * 0.76 - olyCaldera * 0.40 + tharsisTri * 0.54 - tharsisCald * 0.26 - canyonCarve * 0.82 - hellas * 0.36;

        vec2 llU = vec2(wrapDeg(ll.x + 0.62), ll.y);
        vec2 llV = vec2(ll.x, clamp(ll.y + 0.62, -89.5, 89.5));
        float vmU = segField(llU, vec2(-96.0, -7.5), vec2(-54.0, -13.9), 2.05) + segField(llU, vec2(-54.0, -13.9), vec2(-37.0, -14.5), 2.45) * 0.85 + segField(llU, vec2(-76.5, -6.2), vec2(-61.5, -8.4), 1.45) * 0.78;
        float vmV = segField(llV, vec2(-96.0, -7.5), vec2(-54.0, -13.9), 2.05) + segField(llV, vec2(-54.0, -13.9), vec2(-37.0, -14.5), 2.45) * 0.85 + segField(llV, vec2(-76.5, -6.2), vec2(-61.5, -8.4), 1.45) * 0.78;
        float olyU = exp(-sqr(length(vec2(wrapDeg(llU.x - (-133.8)) * 0.95, llU.y - 18.65)) / 4.6)) - exp(-pow4(length(vec2(wrapDeg(llU.x - (-133.8)) * 0.95, llU.y - 18.65)) / 1.12)) * 0.52;
        float olyV = exp(-sqr(length(vec2(wrapDeg(llV.x - (-133.8)) * 0.95, llV.y - 18.65)) / 4.6)) - exp(-pow4(length(vec2(wrapDeg(llV.x - (-133.8)) * 0.95, llV.y - 18.65)) / 1.12)) * 0.52;
        float tharU = exp(-sqr(length(vec2(wrapDeg(llU.x - (-104.1)), llU.y - 11.9)) / 3.1)) + exp(-sqr(length(vec2(wrapDeg(llU.x - (-113.0)), llU.y - 1.5)) / 3.0)) + exp(-sqr(length(vec2(wrapDeg(llU.x - (-121.0)), llU.y - (-8.3))) / 3.3));
        float tharV = exp(-sqr(length(vec2(wrapDeg(llV.x - (-104.1)), llV.y - 11.9)) / 3.1)) + exp(-sqr(length(vec2(wrapDeg(llV.x - (-113.0)), llV.y - 1.5)) / 3.0)) + exp(-sqr(length(vec2(wrapDeg(llV.x - (-121.0)), llV.y - (-8.3))) / 3.3));

        float hX = evalCraterHeight(normalize(localN + tU * 0.01) * 0.92) * craterScale + textureLod(uNoise3D, (localN + tU * 0.01) * 5.4, 0.0).r * 0.28 + olyU * 0.76 + tharU * 0.54 - clamp(vmU, 0.0, 1.18) * 0.82;
        float hY = evalCraterHeight(normalize(localN + tV * 0.01) * 0.92) * craterScale + textureLod(uNoise3D, (localN + tV * 0.01) * 5.4, 0.0).r * 0.28 + olyV * 0.76 + tharV * 0.54 - clamp(vmV, 0.0, 1.18) * 0.82;

        vec3 wTanU = normalize(cross(nrm, abs(nrm.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
        vec3 wTanV = cross(nrm, wTanU);
        vec3 bumpedN = normalize(nrm - (wTanU * (hX - h0) + wTanV * (hY - h0)) * 2.42);
        float marsDiff = smoothstep(-0.08, 0.88, dot(bumpedN, lightDir)) * max(0.0, dot(bumpedN, lightDir) + 0.06) * eclipseShadow;

        // 5. MRO MARCI / Viking Dark Basaltic Albedo Provinces vs Bright Ferric-Ochre Dust Plains!
        vec2 llAlb = ll + vec2((t2.r - 0.5) * 4.2 + (t3.g - 0.5) * 1.8, (t2.b - 0.5) * 3.4);
        float basalt = 0.0;
        basalt = max(basalt, ellipBlob(llAlb, vec2( 69.5,   8.8), vec2(10.5, 15.5), -0.16) * 1.12); // Syrtis Major Planum!
        basalt = max(basalt, ellipBlob(llAlb, vec2(-22.5,  46.5), vec2(18.5, 14.5),  0.12) * 1.05); // Acidalia Planitia!
        basalt = max(basalt, ellipBlob(llAlb, vec2(-32.0, -23.5), vec2(18.0,  9.5),  0.18) * 0.96); // Mare Erythraeum!
        basalt = max(basalt, ellipBlob(llAlb, vec2(-23.0, -13.5), vec2(10.5,  8.5),  0.25) * 0.90); // Margaritifer Terra!
        basalt = max(basalt, ellipBlob(llAlb, vec2( 12.0,  -7.5), vec2(21.5,  7.2), -0.08) * 0.95); // Sinus Meridiani & Sabaeus!
        basalt = max(basalt, ellipBlob(llAlb, vec2(142.0, -23.5), vec2(30.0, 10.5),  0.12) * 0.95); // Terra Sirenum / Cimmeria!
        basalt = max(basalt, ellipBlob(llAlb, vec2(108.0, -21.0), vec2(14.0,  8.5), -0.18) * 0.88); // Mare Tyrrhenum!
        basalt = max(basalt, ellipBlob(llAlb, vec2(-85.0, -26.0), vec2( 5.2,  3.6),  0.05) * 0.92); // Solis Lacus ("Eye of Mars")!
        basalt = max(basalt, ellipBlob(llAlb, vec2( 82.0,  56.0), vec2(22.0,  7.5),  0.05) * 0.78); // Vastitas / Utopia dark band!
        basalt *= (1.0 - 0.85 * isidis) * (1.0 - 0.80 * hellas);
        basalt = clamp(basalt * (0.74 + 0.42 * t2.g) + smoothstep(0.60, 0.80, t1.b) * 0.26 * (1.0 - tharsisDome), 0.0, 1.0);

        float brightDustProvince = ellipBlob(llAlb, vec2( 32.0, 21.0), vec2(18.0, 13.0), 0.1) +  // Arabia Terra bright dust
                                   ellipBlob(llAlb, vec2(-156.0, 23.0), vec2(16.0, 12.0), 0.0) + // Amazonis Planitia
                                   isidis * 0.90;
        vec3 dustyOchre   = mix(vec3(0.55, 0.29, 0.155), vec3(0.75, 0.46, 0.255),
                                clamp(smoothstep(0.26, 0.74, elev + tharsisDome * 0.24) + brightDustProvince * 0.28, 0.0, 1.0));
        vec3 syrtisBasalt = mix(vec3(0.19, 0.135, 0.110), vec3(0.26, 0.185, 0.145), t3.r);
        vec3 marsAlb = mix(dustyOchre, syrtisBasalt, basalt * 0.84);
        marsAlb = mix(marsAlb, vec3(0.78, 0.53, 0.32), clamp((olyShield + tharsisTri * 0.72) * 0.46, 0.0, 0.65));
        // Exposed dark layered basaltic walls inside Valles Marineris, outflow channels & Olympus basal scarp!
        marsAlb = mix(marsAlb, vec3(0.23, 0.13, 0.095), clamp(canyonCarve * 0.86 + vmOutflow * 0.52 + olyScarp * 0.38, 0.0, 0.88));
        // Bright dusty/frosty floor haze inside deep 7-km Hellas & Argyre impact basins!
        float basinFrost = (hellas * 0.78 + argyre * 0.55) * (0.72 + 0.28 * t2.b);
        marsAlb = mix(marsAlb, vec3(0.84, 0.68, 0.52), clamp(basinFrost, 0.0, 0.76));

        // 6. Planum Boreum Spiral North Polar H2O Ice Cap + Chasma Boreale Canyon & Planum Australe South Cap!
        float spiralPhase  = radians(ll.x) * 3.0 + (90.0 - abs(latDeg)) * 1.15 + t2.r * 0.8;
        float spiralTrough = smoothstep(0.22, 0.72, 0.5 + 0.5 * sin(spiralPhase)); // Dark dusty spiral troughs!
        float chasmaBoreale = segField(ll, vec2(-48.0, 81.2), vec2(-16.0, 84.8), 1.35); // Famous Chasma Boreale canyon!
        float nCapEnv = smoothstep(79.2, 83.8, latDeg + (t2.r - 0.5) * 3.2) * (1.0 - 0.82 * chasmaBoreale);
        float sCapEnv = smoothstep(82.8, 86.5, -latDeg + (t2.g - 0.5) * 3.0);
        vec3 polarIceCol = mix(vec3(0.62, 0.44, 0.32), vec3(0.91, 0.92, 0.94), spiralTrough);
        marsAlb = mix(marsAlb, polarIceCol, clamp(nCapEnv, 0.0, 1.0));
        marsAlb = mix(marsAlb, vec3(0.90, 0.91, 0.93), clamp(sCapEnv, 0.0, 1.0));

        // 7. Morning Cyan-White Water-Ice Canyon Fog inside Valles Marineris + Lee-Wave Volcano Orographic H2O Clouds!
        float canyonFloorMask = smoothstep(0.42, 0.88, canyonCarve) * (0.55 + 0.45 * t3.g);
        float canyonIceFog    = canyonFloorMask * (0.52 + 0.48 * sstepInv(0.55, -0.05, ndotl)) * smoothstep(-0.10, 0.12, ndotl);
        // Arsia Mons Elongated Cloud & Tharsis/Olympus leeward (westward) water-ice plumes + aphelion equatorial wisps!
        float arsiaPlume = segField(ll, vec2(-122.0, -8.3), vec2(-146.0, -7.0), 2.8) * smoothstep(0.38, 0.76, t2.g * 0.6 + t3.b * 0.4);
        float oroCloud   = ((olyShield * 0.52 + tharsisTri * 0.44) * smoothstep(0.46, 0.76, t3.g) + arsiaPlume * 0.68) * 0.52;
        float aphelionBelt = exp(-sqr((latDeg - 6.0) / 14.0)) * smoothstep(0.66, 0.88, t1.g * 0.55 + t3.r * 0.45) * 0.24;
        float marsIceClouds = clamp(canyonIceFog * 0.72 + oroCloud + aphelionBelt, 0.0, 0.82);

        vec3 litMars = marsAlb * marsDiff * 1.20 * starTint;
        vec3 iceCloudLit = vec3(0.84, 0.91, 0.99) * (smoothstep(-0.12, 0.82, ndotl) * eclipseShadow * 1.06) * starTint;
        surfCol = mix(litMars, iceCloudLit, marsIceClouds) + marsAlb * 0.003;

        // Dusty Butterscotch Dayside Limb -> Authentic Martian Fine-Dust Forward-Scattering Twilight Blue!
        float twilightMars = exp(-sqr((ndotl + 0.02) / 0.18));
        float fwdScat = pow(max(dot(viewDir, -lightDir), 0.0), 3.0);
        float blueShift = clamp(fwdScat * 0.68 + twilightMars * 0.58, 0.0, 1.0);
        vec3 marsHazeHue = mix(vec3(0.86, 0.56, 0.35), vec3(0.48, 0.70, 0.98), blueShift);
        atmoCol = marsHazeHue * pow(max(1.0 - viewN, 0.0), 3.2) * smoothstep(-0.26, 0.55, ndotl) * 0.24;

// ============================================================================
// === END BLOCK 2 (Replaces up to line 2541, right before } else if (pType < 7.5) {) ===
// ============================================================================
