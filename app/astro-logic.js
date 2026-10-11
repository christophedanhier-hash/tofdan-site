export const J2000 = new Date('2000-01-01T12:00:00Z');

// Résolution de l'équation de Kepler par méthode de Newton-Raphson
// Converge beaucoup plus vite et précisément que l'approximation simple
export function solveKepler(M, e) {
    let E = M;
    for (let i = 0; i < 5; i++) {
        E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    }
    return E;
}

// ==========================================
// GESTIONNAIRE DE CACHE GLOBAL POUR TEXTURES
// ==========================================
// Permet de stocker les textures déjà chargées en RAM (WebGL)
// et de les partager instantanément entre tous les modules 3D
// sans avoir à relire le stockage local du téléphone.
export const TextureCache = {
    _cache: new Map(),
    _loader: null, // Sera initialisé avec un THREE.TextureLoader par le simulateur appelant

    // Initialiser le loader (ex: depuis Simulateur_3D.html)
    init(threeLoader) {
        if (!this._loader) this._loader = threeLoader;
    },

    // Demander une texture
    get(path, callback) {
        if (!path) return;

        // 1. Si elle est déjà en RAM, on la renvoie de suite
        if (this._cache.has(path)) {
            const tex = this._cache.get(path);
            if (callback) callback(tex);
            return tex;
        }

        // 2. Sinon on la charge, on la met en cache, et on la renvoie
        if (this._loader) {
            this._loader.load(
                path,
                (texture) => {
                    texture.colorSpace = "srgb"; // THREE.SRGBColorSpace compatible r160
                    this._cache.set(path, texture);
                    if (callback) callback(texture);
                },
                undefined,
                (err) => console.warn("Erreur chargement texture (Cache):", path, err)
            );
        } else {
            console.error("TextureCache: Loader THREE.js non initialisé !");
        }
    },

    // Nettoyer manuellement si besoin (ex: on quitte l'application ou l'onglet)
    disposeAll() {
        this._cache.forEach(texture => texture.dispose());
        this._cache.clear();
    }
};

export function getOrbitalPosition(a, e, period, baseAngle, omega, daysSinceJ2000, iDeg = 0, nodeDeg = 0) {
    const n = (2 * Math.PI) / period;
    let M = baseAngle + n * daysSinceJ2000;
    
    // Résolution précise de l'anomalie excentrique
    let E = solveKepler(M, e);
    
    // Coordonnées dans le plan orbital
    const P = a * (Math.cos(E) - e);
    const Q = a * Math.sqrt(1 - e*e) * Math.sin(E);

    // Paramètres orbitaux 3D
    // omega, nodeDeg et iDeg sont tous en DEGRÉS dans PLANETS_DATA
    const w = (omega || 0) * Math.PI / 180;
    const node = (nodeDeg || 0) * Math.PI / 180;
    const inc = (iDeg || 0) * Math.PI / 180;

    // Rotation 3D complète
    // x = P(cosN cosw - sinN sinw cosi) - Q(cosN sinw + sinN cosw cosi)
    // y = P(sinN cosw + cosN sinw cosi) - Q(sinN sinw - cosN cosw cosi)
    // z = P(sinw sini) + Q(cosw sini)

    const cosN = Math.cos(node), sinN = Math.sin(node);
    const cosW = Math.cos(w), sinW = Math.sin(w);
    const cosI = Math.cos(inc), sinI = Math.sin(inc);

    return {
        x: P * (cosN * cosW - sinN * sinW * cosI) - Q * (cosN * sinW + sinN * cosW * cosI),
        y: P * (sinN * cosW + cosN * sinW * cosI) - Q * (sinN * sinW - cosN * cosW * cosI),
        z: P * (sinW * sinI) + Q * (cosW * sinI)
    };
}

export const PLANETS_DATA = [
    { name: "Soleil", color: "#ffcc00", radius: 25, a: 0, e: 0, period: 1, baseAngle: 0, omega: 0, i: 0, node: 0, realDist: "0 UA", tex: null,
      info: { type: "Étoile", diam: "1 392 700 km", mass: "333 000 x Terre", temp: "~5 500 °C" } },
    { name: "Mercure", color: "#b0b0b0", radius: 3, a: 50, e: 0.205, period: 88, baseAngle: 4.4, omega: 1.35, i: 7.0, node: 0.84, realDist: "0.39 UA", tex: 'mercurymap.jpg',
      info: { type: "Planète tellurique", diam: "4 879 km", mass: "0,055 x Terre", temp: "-173 à 427 °C" } },
    { name: "Vénus", color: "#e3bb76", radius: 6, a: 85, e: 0.007, period: 224.7, baseAngle: 3.17, omega: 2.29, i: 3.4, node: 1.33, realDist: "0.72 UA", tex: 'venusmap.jpg',
      info: { type: "Planète tellurique", diam: "12 104 km", mass: "0,815 x Terre", temp: "~462 °C" } },
    { name: "Terre", color: "#4b90d1", radius: 7, a: 130, e: 0.017, period: 365.25, baseAngle: 1.75, omega: 1.79, i: 0, node: 0, realDist: "1.00 UA", tex: 'earth_atmos_2048.jpg',
      info: { type: "Planète tellurique", diam: "12 742 km", mass: "1 x Terre", temp: "~15 °C" },
      moons: [{ name: "Lune", radius: 1.5, dist: 14, period: 27.3, baseAngle: 0, color: "#aaaaaa", tex: 'moon_1024.jpg', info: { type: "Satellite naturel", diam: "3 474 km", mass: "0,012 x Terre", temp: "-173 à 127 °C" } }] },
    { name: "Mars", color: "#c1440e", radius: 4, a: 180, e: 0.094, period: 687, baseAngle: 6.20, omega: 5.86, i: 1.85, node: 0.86, realDist: "1.52 UA", tex: 'mars_1k_color.jpg',
      info: { type: "Planète tellurique", diam: "6 779 km", mass: "0,107 x Terre", temp: "~ -63 °C" } },
    { name: "Jupiter", color: "#d39c7e", radius: 16, a: 320, e: 0.049, period: 4332, baseAngle: 0.59, omega: 4.79, i: 1.3, node: 1.75, realDist: "5.20 UA", tex: 'jupitermap.jpg',
      info: { type: "Géante gazeuse", diam: "139 820 km", mass: "318 x Terre", temp: "-110 °C" },
      moons: [{ name: "Io", radius: 1.2, dist: 22, period: 1.7, baseAngle: 1, color: "#ffffaa", info: { type: "Satellite volcanique", diam: "3 642 km", mass: "0,015 x Terre", temp: "-130 °C" } },
              { name: "Europe", radius: 1, dist: 28, period: 3.5, baseAngle: 2, color: "#aaddff", info: { type: "Satellite glacé", diam: "3 121 km", mass: "0,008 x Terre", temp: "-160 °C" } }] },
    { name: "Saturne", color: "#e6d5a8", radius: 13, a: 460, e: 0.057, period: 10759, baseAngle: 0.87, omega: 1.63, i: 2.48, node: 1.98, realDist: "9.58 UA", tex: 'saturnmap.jpg',
      info: { type: "Géante gazeuse", diam: "116 460 km", mass: "95 x Terre", temp: "-140 °C" } },
    { name: "Uranus", color: "#71c8d7", radius: 9, a: 620, e: 0.046, period: 30688, baseAngle: 5.46, omega: 2.96, i: 0.77, node: 1.29, realDist: "19.2 UA", tex: 'uranusmap.jpg',
      info: { type: "Géante de glaces", diam: "50 724 km", mass: "14,5 x Terre", temp: "-195 °C" } },
    { name: "Neptune", color: "#4b70dd", radius: 9, a: 780, e: 0.011, period: 60182, baseAngle: 5.31, omega: 0.78, i: 1.77, node: 2.3, realDist: "30.1 UA", tex: 'neptunemap.jpg',
      info: { type: "Géante de glaces", diam: "49 244 km", mass: "17 x Terre", temp: "-200 °C" } },
    { name: "Comète Halley", color: "#cceeff", radius: 2.5, a: 450, e: 0.967, period: -27562, baseAngle: 3.14, omega: 1.94, i: 162, node: 1.0, realDist: "0.59 - 35.1 UA", tex: null,
      info: { type: "Comète périodique", diam: "~11 km", mass: "Négligeable", temp: "Variable" } },
    { name: "Pluton", color: "#ddccbb", radius: 4, a: 1020, e: 0.248, period: 90560, baseAngle: 3.5, omega: 3.9, i: 17.16, node: 1.92, realDist: "29.6 - 49.3 UA", tex: 'plutomap.jpg',
      info: { type: "Planète naine", diam: "2 376 km", mass: "0,002 x Terre", temp: "-229 °C" } }
];
