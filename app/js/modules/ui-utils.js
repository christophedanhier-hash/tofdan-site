// ============================================
// MODULE UI PARTAGÉ - Projet AstroTofdan v3.1
// Fonctions communes aux simulateurs
// ============================================

// --- CONSTANTES ---
export const MS_PER_DAY = 86400000;

// --- CALENDRIER PERSONNALISÉ ---
const MONTH_NAMES = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const DAYS_SHORT = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

/**
 * Initialise le calendrier personnalisé.
 * @param {object} opts
 * @param {function} opts.getSimulatedDate - Retourne la date simulée actuelle
 * @param {function} opts.setSimulatedDate - Définit la nouvelle date simulée
 * @param {function} opts.onDateChange - Callback après changement de date
 */
export function initCalendar(opts) {
    let calDate = new Date(opts.getSimulatedDate());

    function renderCalendar() {
        const grid = document.getElementById('custom-calendar-grid');
        grid.innerHTML = '';
        const simDate = opts.getSimulatedDate();

        document.getElementById('cal-month-year').innerText = `${MONTH_NAMES[calDate.getUTCMonth()]} ${calDate.getUTCFullYear()}`;
        DAYS_SHORT.forEach(d => {
            const div = document.createElement('div');
            div.className = 'calendar-day-header';
            div.innerText = d;
            grid.appendChild(div);
        });

        const firstDay = new Date(Date.UTC(calDate.getUTCFullYear(), calDate.getUTCMonth(), 1));
        const lastDay = new Date(Date.UTC(calDate.getUTCFullYear(), calDate.getUTCMonth() + 1, 0));

        for (let i = 0; i < firstDay.getUTCDay(); i++) {
            const div = document.createElement('div');
            div.className = 'calendar-day empty';
            grid.appendChild(div);
        }

        for (let i = 1; i <= lastDay.getUTCDate(); i++) {
            const div = document.createElement('div');
            div.className = 'calendar-day';
            div.innerText = i;
            if (i === simDate.getUTCDate() && calDate.getUTCMonth() === simDate.getUTCMonth() && calDate.getUTCFullYear() === simDate.getUTCFullYear()) {
                div.classList.add('selected');
            }
            div.onclick = () => {
                opts.setSimulatedDate(new Date(Date.UTC(calDate.getUTCFullYear(), calDate.getUTCMonth(), i, 12, 0, 0)));
                if (opts.onDateChange) opts.onDateChange();
                closeCalendar();
            };
            grid.appendChild(div);
        }
    }

    function openCalendar() {
        calDate = new Date(opts.getSimulatedDate());
        renderCalendar();
        document.getElementById('custom-calendar').style.display = 'block';
        document.getElementById('calendar-overlay').style.display = 'block';
    }

    function closeCalendar() {
        document.getElementById('custom-calendar').style.display = 'none';
        document.getElementById('calendar-overlay').style.display = 'none';
    }

    document.getElementById('date-input').addEventListener('click', openCalendar);
    document.getElementById('cal-prev').onclick = () => { calDate.setUTCMonth(calDate.getUTCMonth() - 1); renderCalendar(); };
    document.getElementById('cal-next').onclick = () => { calDate.setUTCMonth(calDate.getUTCMonth() + 1); renderCalendar(); };
    document.getElementById('cal-close').onclick = closeCalendar;
    document.getElementById('calendar-overlay').onclick = closeCalendar;
}

// --- TOGGLE UI ---
export function initToggleUI(btnId = 'toggle-ui-btn', contentId = 'ui-content', showText = "Afficher les contrôles", hideText = "Masquer l'interface") {
    const btn = document.getElementById(btnId);
    const content = document.getElementById(contentId);
    if (!btn || !content) return;

    btn.addEventListener('click', () => {
        const isHidden = content.style.display === 'none';
        content.style.display = isHidden ? 'block' : 'none';
        btn.innerText = isHidden ? `👁️ ${hideText}` : `👁️ ${showText}`;
    });
}

// --- ZOOM CAMÉRA (THREE.js) ---
export function initCameraZoom(THREE, camera, controls) {
    const zoomDir = new THREE.Vector3(); // Pré-alloué

    document.getElementById('zoom-in-btn').addEventListener('click', () => {
        const dist = camera.position.distanceTo(controls.target);
        const newDist = dist / 1.3;
        zoomDir.subVectors(camera.position, controls.target).normalize();
        camera.position.copy(controls.target).addScaledVector(zoomDir, Math.max(newDist, controls.minDistance || 0.1));
    });
    document.getElementById('zoom-out-btn').addEventListener('click', () => {
        const dist = camera.position.distanceTo(controls.target);
        const newDist = dist * 1.3;
        zoomDir.subVectors(camera.position, controls.target).normalize();
        camera.position.copy(controls.target).addScaledVector(zoomDir, Math.min(newDist, controls.maxDistance || 100000));
    });
}

// --- GARBAGE COLLECTOR (beforeunload) ---
export function initGarbageCollector(scene, renderer) {
    window.addEventListener('beforeunload', () => {
        scene.traverse(child => {
            if (child.isMesh || child.isPoints || child.isLine || child.isSprite) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                    else child.material.dispose();
                }
            }
        });
        renderer.dispose();
    });
}

// --- WEBGL CONTEXT LOSS HANDLING ---
export function initWebGLContextHandling(renderer, animate) {
    const canvas = renderer.domElement;

    canvas.addEventListener('webglcontextlost', (event) => {
        event.preventDefault();
        console.warn('WebGL context lost. Attempting restoration...');
    });

    canvas.addEventListener('webglcontextrestored', () => {
        console.info('WebGL context restored. Resuming rendering.');
        animate();
    });
}

// --- CRÉATION DE LABEL SPRITE (THREE.js) ---
export function createSpriteLabel(THREE, text, color, scaleW = 35, scaleH = 8.75, fontSize = 'bold 28px Arial') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.font = fontSize;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 4;
    ctx.fillText(text, 256, 64);
    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(scaleW, scaleH, 1);
    return sprite;
}

// --- CRÉATION DE CHAMP D'ÉTOILES (THREE.js) ---
export function createStarField(THREE, count, radius, size, sizeAttenuation = true) {
    const geo = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions.push(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
        );
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({
        color: 0xffffff,
        size: size,
        sizeAttenuation: sizeAttenuation,
        transparent: true,
        opacity: 0.6
    }));
}
