/* 藍星十帖・3D 世界 — 共用引擎
 * 以程序化幾何搭建每個場景，不依賴任何外部素材。
 */
import * as THREE from '../vendor/three.module.js';

/* ---------- 小工具 ---------- */

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function makeGlowTexture() {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0.0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.22, 'rgba(255,255,255,0.55)');
  grd.addColorStop(0.55, 'rgba(255,255,255,0.12)');
  grd.addColorStop(1.0, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

let GLOW_TEX = null;
function glowTexture() {
  if (!GLOW_TEX) GLOW_TEX = makeGlowTexture();
  return GLOW_TEX;
}

/* 場景搭建輔助：每個 world 的 build(ctx) 會拿到這組工具 */
function makeKit(root, palette) {
  const cache = new Map();
  const mat = (color, opts = {}) => {
    const key = `${color}|${JSON.stringify(opts)}`;
    if (cache.has(key)) return cache.get(key);
    const m = new THREE.MeshStandardMaterial({
      color,
      roughness: opts.roughness ?? 0.85,
      metalness: opts.metalness ?? 0.05,
      emissive: opts.emissive ?? 0x000000,
      emissiveIntensity: opts.emissiveIntensity ?? 1,
      transparent: opts.transparent ?? false,
      opacity: opts.opacity ?? 1,
      flatShading: opts.flatShading ?? true,
      side: opts.side ?? THREE.FrontSide,
    });
    cache.set(key, m);
    return m;
  };

  const add = (mesh, x = 0, y = 0, z = 0, rot = null) => {
    mesh.position.set(x, y, z);
    if (rot) mesh.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
    root.add(mesh);
    return mesh;
  };

  const kit = {
    root,
    palette,
    mat,
    add,
    box(w, h, d, color, opts) {
      return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, opts));
    },
    cyl(rt, rb, h, seg, color, opts) {
      return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg, 1), mat(color, opts));
    },
    sph(r, color, opts, seg = 14) {
      return new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(6, seg >> 1)), mat(color, opts));
    },
    cone(r, h, seg, color, opts) {
      return new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat(color, opts));
    },
    torus(r, tube, color, opts, arc = Math.PI * 2) {
      return new THREE.Mesh(new THREE.TorusGeometry(r, tube, 10, 28, arc), mat(color, opts));
    },
    plane(w, h, color, opts) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat(color, opts));
      m.rotation.x = -Math.PI / 2;
      return m;
    },
    glow(color, size = 2.4, opacity = 0.85) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTexture(),
        color,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }));
      s.scale.set(size, size, 1);
      return s;
    },
    light(color, intensity, distance = 14, decay = 2) {
      return new THREE.PointLight(color, intensity, distance, decay);
    },
    /* 讓一盞燈微微呼吸／閃爍 */
    flicker(light, base = 1, amount = 0.18, speed = 6.5) {
      light.userData.flicker = { base, amount, speed, phase: Math.random() * 10 };
      return light;
    },
  };
  return kit;
}

/* ---------- 粒子 ---------- */

class Rain {
  constructor(scene, count, color, opts = {}) {
    this.count = count;
    this.area = opts.area ?? 26;
    this.height = opts.height ?? 18;
    this.speed = opts.speed ?? 18;
    this.slant = opts.slant ?? 0;
    this.drops = new Float32Array(count * 4); // x,y,z,len
    const pos = new Float32Array(count * 6);
    for (let i = 0; i < count; i++) {
      this.drops[i * 4 + 0] = (Math.random() - 0.5) * this.area;
      this.drops[i * 4 + 1] = Math.random() * this.height;
      this.drops[i * 4 + 2] = (Math.random() - 0.5) * this.area;
      this.drops[i * 4 + 3] = 0.35 + Math.random() * 0.75;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.geo = geo;
    this.mesh = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: opts.opacity ?? 0.42,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }));
    this.mesh.frustumCulled = false;
    scene.add(this.mesh);
    this.write();
  }
  write() {
    const p = this.geo.attributes.position.array;
    const d = this.drops;
    for (let i = 0; i < this.count; i++) {
      const x = d[i * 4], y = d[i * 4 + 1], z = d[i * 4 + 2], len = d[i * 4 + 3];
      const o = i * 6;
      p[o] = x; p[o + 1] = y; p[o + 2] = z;
      p[o + 3] = x + this.slant * len * 0.28;
      p[o + 4] = y - len;
      p[o + 5] = z;
    }
    this.geo.attributes.position.needsUpdate = true;
  }
  step(dt) {
    const d = this.drops;
    for (let i = 0; i < this.count; i++) {
      d[i * 4 + 1] -= this.speed * dt * (0.7 + (i % 7) * 0.06);
      d[i * 4 + 0] += this.slant * dt * 1.6;
      if (d[i * 4 + 1] < -1) {
        d[i * 4 + 1] = this.height;
        d[i * 4 + 0] = (Math.random() - 0.5) * this.area;
        d[i * 4 + 2] = (Math.random() - 0.5) * this.area;
      }
    }
    this.write();
  }
  dispose() {
    this.geo.dispose();
    this.mesh.material.dispose();
  }
}

class Drifters {
  /* 漂浮的塵埃／螢火 */
  constructor(scene, count, color, opts = {}) {
    this.count = count;
    this.spread = opts.spread ?? 16;
    this.baseY = opts.baseY ?? 2;
    this.amp = opts.amp ?? 1.4;
    this.speed = opts.speed ?? 0.35;
    this.data = [];
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * this.spread;
      this.data.push({
        a, r,
        y: Math.random() * this.amp * 2,
        p: Math.random() * Math.PI * 2,
        v: 0.4 + Math.random() * 0.8,
      });
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = this.baseY + this.data[i].y;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.geo = geo;
    this.mesh = new THREE.Points(geo, new THREE.PointsMaterial({
      size: opts.size ?? 0.16,
      map: glowTexture(),
      color,
      transparent: true,
      opacity: opts.opacity ?? 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    }));
    this.mesh.frustumCulled = false;
    scene.add(this.mesh);
  }
  step(dt, t) {
    const p = this.geo.attributes.position.array;
    for (let i = 0; i < this.count; i++) {
      const d = this.data[i];
      d.a += this.speed * dt * d.v;
      const y = this.baseY + d.y + Math.sin(t * 0.5 * d.v + d.p) * 0.6;
      p[i * 3] = Math.cos(d.a) * d.r;
      p[i * 3 + 1] = y;
      p[i * 3 + 2] = Math.sin(d.a) * d.r;
    }
    this.geo.attributes.position.needsUpdate = true;
  }
  dispose() {
    this.geo.dispose();
    this.mesh.material.dispose();
  }
}

class Steam {
  /* 上升的煙／蒸氣／香火 */
  constructor(scene, origin, count, color, opts = {}) {
    this.origin = new THREE.Vector3(...origin);
    this.count = count;
    this.rise = opts.rise ?? 3.2;
    this.spread = opts.spread ?? 0.22;
    this.speed = opts.speed ?? 0.35;
    this.data = [];
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      this.data.push({
        t: Math.random(),
        dx: (Math.random() - 0.5) * this.spread,
        dz: (Math.random() - 0.5) * this.spread,
        sw: Math.random() * Math.PI * 2,
      });
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.geo = geo;
    this.mesh = new THREE.Points(geo, new THREE.PointsMaterial({
      size: opts.size ?? 0.34,
      map: glowTexture(),
      color,
      transparent: true,
      opacity: opts.opacity ?? 0.22,
      depthWrite: false,
      blending: THREE.NormalBlending,
      sizeAttenuation: true,
    }));
    this.mesh.frustumCulled = false;
    scene.add(this.mesh);
    this.step(0, 0);
  }
  step(dt, t) {
    const p = this.geo.attributes.position.array;
    for (let i = 0; i < this.count; i++) {
      const d = this.data[i];
      d.t += dt * this.speed * (0.55 + (i % 5) * 0.12);
      if (d.t > 1) d.t -= 1;
      const h = d.t * this.rise;
      p[i * 3] = this.origin.x + d.dx + Math.sin(t * 0.7 + d.sw) * 0.18 * d.t;
      p[i * 3 + 1] = this.origin.y + h;
      p[i * 3 + 2] = this.origin.z + d.dz + Math.cos(t * 0.6 + d.sw) * 0.18 * d.t;
    }
    this.geo.attributes.position.needsUpdate = true;
  }
  dispose() {
    this.geo.dispose();
    this.mesh.material.dispose();
  }
}

/* ---------- 引擎 ---------- */

export class WorldEngine {
  constructor({ canvas, onNode, onWorldReady, onHover }) {
    this.canvas = canvas;
    this.onNode = onNode || (() => {});
    this.onWorldReady = onWorldReady || (() => {});
    this.onHover = onHover || (() => {});

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.28;

    this.scene = null;
    this.camera = new THREE.PerspectiveCamera(46, 1, 0.1, 400);
    this.clock = new THREE.Clock();

    this.orbit = {
      target: new THREE.Vector3(0, 1.2, 0),
      radius: 14,
      minRadius: 5,
      maxRadius: 32,
      theta: 0.6,
      baseTheta: 0.6,
      phi: 1.08,
      minPhi: 0.18,
      maxPhi: 1.52,
      auto: true,
      idle: 0,
    };
    this.drag = { active: false, moved: 0, x: 0, y: 0, lastX: 0, lastY: 0, t: 0 };
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.nodes = [];
    this.collected = new Set();
    this.hintUntil = 0;
    this.hintIndex = -1;
    this.time = 0;
    this.running = true;
    this.disposables = [];

    this._bind();
    this._resize();
  }

  _bind() {
    const c = this.canvas;

    this._onPointerDown = (e) => {
      this.drag.active = true;
      this.drag.moved = 0;
      this.drag.x = this.drag.lastX = e.clientX;
      this.drag.y = this.drag.lastY = e.clientY;
      this.drag.t = performance.now();
      this.orbit.idle = 0;
      try { c.setPointerCapture?.(e.pointerId); } catch { /* 合成事件或已放開的指標 */ }
    };
    this._onPointerMove = (e) => {
      const dx = e.clientX - this.drag.lastX;
      const dy = e.clientY - this.drag.lastY;
      this.drag.lastX = e.clientX;
      this.drag.lastY = e.clientY;
      if (this.drag.active) {
        this.drag.moved += Math.abs(dx) + Math.abs(dy);
        this.orbit.theta -= dx * 0.0052;
        this.orbit.phi = clamp(this.orbit.phi - dy * 0.0042, this.orbit.minPhi, this.orbit.maxPhi);
        this.orbit.idle = 0;
      } else {
        this._hover(e);
      }
    };
    this._onPointerUp = (e) => {
      const wasActive = this.drag.active;
      this.drag.active = false;
      try { c.releasePointerCapture?.(e.pointerId); } catch { /* 同上 */ }
      const quick = performance.now() - this.drag.t < 420;
      if (wasActive && this.drag.moved < 9 && quick) this._click(e);
      // 使用者自己轉過視角後，就繞著新角度擺盪
      if (this.drag.moved >= 9) this.orbit.baseTheta = this.orbit.theta;
    };
    this._onWheel = (e) => {
      e.preventDefault();
      this.orbit.radius = clamp(
        this.orbit.radius + e.deltaY * 0.012,
        this.orbit.minRadius,
        this.orbit.maxRadius
      );
      this.orbit.idle = 0;
    };

    c.addEventListener('pointerdown', this._onPointerDown);
    c.addEventListener('pointermove', this._onPointerMove);
    c.addEventListener('pointerup', this._onPointerUp);
    c.addEventListener('pointercancel', this._onPointerUp);
    c.addEventListener('wheel', this._onWheel, { passive: false });

    this._ro = new ResizeObserver(() => this._resize());
    this._ro.observe(c.parentElement || c);
    window.addEventListener('resize', this._resize);
  }

  _resize() {
    const el = this.canvas.parentElement || this.canvas;
    const w = el.clientWidth || window.innerWidth;
    const h = el.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / Math.max(1, h);
    // 直式螢幕：把視角放寬，否則場景左右會被切掉
    const a = clamp(this.camera.aspect, 0.5, 1);
    this.camera.fov = 46 + (1 - a) * 40;
    this.camera.updateProjectionMatrix();
  }

  _setPointer(e) {
    const r = this.canvas.getBoundingClientRect();
    this.pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    this.pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  }

  _hover(e) {
    if (!this.nodes.length) return;
    this._setPointer(e);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObjects(this.nodes.map((n) => n.core), false)[0];
    const idx = hit ? hit.object.userData.nodeIndex : -1;
    if (idx !== this._hoverIdx) {
      this._hoverIdx = idx;
      this.canvas.style.cursor = idx >= 0 ? 'pointer' : 'grab';
      this.onHover(idx);
    }
  }

  _click(e) {
    if (!this.nodes.length) return;
    this._setPointer(e);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObjects(this.nodes.map((n) => n.core), false)[0];
    if (hit) {
      const idx = hit.object.userData.nodeIndex;
      this.onNode(idx, this.nodes[idx]);
    }
  }

  /* ---------- 載入世界 ---------- */

  setWorld(def, collectedSet = new Set()) {
    this._clearScene();
    this.def = def;
    this.collected = new Set(collectedSet);

    const scene = new THREE.Scene();
    this.scene = scene;

    // 天空：以頂點色漸層的大球
    const skyGeo = new THREE.SphereGeometry(160, 24, 16);
    const colors = [];
    const top = new THREE.Color(def.sky?.[0] ?? 0x223040);
    const bottom = new THREE.Color(def.sky?.[1] ?? 0x5c6f7b);
    const pos = skyGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i) / 160;
      const c = bottom.clone().lerp(top, clamp(y * 0.5 + 0.5, 0, 1));
      colors.push(c.r, c.g, c.b);
    }
    skyGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const sky = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({
      vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false,
    }));
    scene.add(sky);
    this.disposables.push(skyGeo, sky.material);

    scene.fog = new THREE.FogExp2(def.fog ?? 0x33404a, def.fogDensity ?? 0.025);

    // 環境貼圖：讓金屬與粗糙面有東西可以反射（否則金屬會全黑）
    this._buildEnvironment(scene, top, bottom, def);

    // 光
    scene.add(new THREE.HemisphereLight(
      def.hemiSky ?? 0xc9d9e6, def.ground ?? 0x202020, (def.hemi ?? 0.95) * 2.2
    ));
    const sun = new THREE.DirectionalLight(def.sunColor ?? 0xfff0dd, (def.sun ?? 1.0) * 1.9);
    sun.position.set(...(def.sunPos ?? [8, 14, 6]));
    scene.add(sun);
    scene.add(new THREE.AmbientLight(def.ambient ?? 0xffffff, (def.ambientIntensity ?? 0.18) * 2.4));

    // 地面
    const groundColor = def.ground ?? 0x1d2429;
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(def.groundRadius ?? 46, 48),
      new THREE.MeshStandardMaterial({ color: groundColor, roughness: 0.96, metalness: 0.04 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    scene.add(ground);
    this.disposables.push(ground.geometry, ground.material);

    // 場景本體
    const root = new THREE.Group();
    scene.add(root);
    this.kit = makeKit(root, def.palette ?? {});
    this.animated = [];
    if (typeof def.build === 'function') def.build(this.kit, this);

    // 收集所有會動的東西
    root.traverse((o) => {
      if (o.userData.spin) this.animated.push(o);
      if (o.isPointLight && o.userData.flicker) this.animated.push(o);
    });

    // 粒子
    this.particles = [];
    const p = def.particles ?? {};
    if (p.rain) {
      const r = new Rain(scene, p.rain, p.rainColor ?? 0xa8c2d0, p.rainOpts ?? {});
      this.particles.push(r);
    }
    if (p.motes) {
      const m = new Drifters(scene, p.motes, p.motesColor ?? 0xffe6b8, p.motesOpts ?? {});
      this.particles.push(m);
    }
    for (const s of p.steam ?? []) {
      const st = new Steam(scene, s.pos, s.count ?? 26, s.color ?? 0xdfe9ee, s.opts ?? {});
      this.particles.push(st);
    }

    // 記憶節點
    this.nodes = [];
    const nodeColor = def.nodeColor ?? 0xffd08a;
    (def.nodes || []).forEach((n, i) => {
      const grp = new THREE.Group();
      grp.position.set(...n.p);

      const coreGeo = new THREE.IcosahedronGeometry(0.26, 0);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x111111,
        emissive: nodeColor,
        emissiveIntensity: this.collected.has(i) ? 0.22 : 1.05,
        roughness: 0.4,
        metalness: 0.2,
        flatShading: true,
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.userData.nodeIndex = i;
      grp.add(core);

      const halo = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTexture(),
        color: nodeColor,
        transparent: true,
        opacity: this.collected.has(i) ? 0.14 : 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }));
      halo.scale.set(1.25, 1.25, 1);
      grp.add(halo);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.44, 0.012, 6, 40),
        new THREE.MeshBasicMaterial({
          color: nodeColor, transparent: true,
          opacity: this.collected.has(i) ? 0.12 : 0.55,
        })
      );
      ring.rotation.x = Math.PI / 2;
      grp.add(ring);

      const light = new THREE.PointLight(nodeColor, this.collected.has(i) ? 0 : 2.2, 5.5, 2);
      grp.add(light);

      scene.add(grp);
      this.disposables.push(coreGeo, coreMat, ring.geometry, ring.material, halo.material);

      this.nodes.push({ group: grp, core, halo, ring, light, def: n, baseY: n.p[1], phase: Math.random() * 6.28 });
    });

    // 相機初始
    const cam = def.camera ?? {};
    this.orbit.target.set(...(cam.target ?? [0, 1.2, 0]));
    this.orbit.radius = cam.radius ?? 14;
    this.orbit.theta = cam.theta ?? 0.6;
    this.orbit.baseTheta = this.orbit.theta;
    this.orbit.phi = cam.phi ?? 1.08;
    this.orbit.auto = cam.auto !== false;
    this.orbit.idle = 0;
    this._updateCamera();

    this.onWorldReady(def, this.nodes.length, this.collected.size);
  }

  /* 用天空漸層烤一張環境貼圖：金屬、玻璃才有東西可反射 */
  _buildEnvironment(scene, top, bottom, def) {
    try {
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      const envScene = new THREE.Scene();

      const geo = new THREE.SphereGeometry(10, 24, 16);
      const pos = geo.attributes.position;
      const cols = [];
      const hi = top.clone().multiplyScalar(1.5);
      const lo = bottom.clone().multiplyScalar(1.7);
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i) / 10;
        const c = lo.clone().lerp(hi, clamp(y * 0.5 + 0.5, 0, 1));
        cols.push(c.r, c.g, c.b);
      }
      geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
      const skyMesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
        vertexColors: true, side: THREE.BackSide,
      }));
      envScene.add(skyMesh);

      // 一盞假的太陽，讓金屬表面有一顆亮點
      const sunGeo = new THREE.SphereGeometry(1.5, 12, 8);
      const sunMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(def.sunColor ?? 0xffffff).multiplyScalar(2.4),
      });
      const sun = new THREE.Mesh(sunGeo, sunMat);
      sun.position.copy(new THREE.Vector3(...(def.sunPos ?? [8, 14, 6])).normalize().multiplyScalar(6));
      envScene.add(sun);

      const rt = pmrem.fromScene(envScene, 0.02);
      scene.environment = rt.texture;
      this._envRT = rt;

      geo.dispose();
      skyMesh.material.dispose();
      sunGeo.dispose();
      sunMat.dispose();
      pmrem.dispose();
    } catch (err) {
      console.warn('環境貼圖建立失敗，改用一般光照', err);
    }
  }

  _clearScene() {
    if (this._envRT) {
      this._envRT.dispose();
      this._envRT = null;
    }
    if (this.scene) {
      this.scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose?.();
        if (o.material) {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          const shared = glowTexture();
          mats.forEach((m) => {
            // 共用的光暈貼圖不能銷毀，否則下一個世界會全黑
            if (m.map && m.map !== shared) m.map.dispose?.();
            m.dispose?.();
          });
        }
      });
      this.scene.clear?.();
    }
    this.particles?.forEach((p) => p.dispose?.());
    this.particles = [];
    this.nodes = [];
    this.disposables = [];
  }

  _updateCamera() {
    const o = this.orbit;
    const sinPhi = Math.sin(o.phi);
    // 直式螢幕再退一點，讓主體完整入鏡
    const r = o.radius * (this.camera.aspect < 1 ? 1.18 : 1);
    this.camera.position.set(
      o.target.x + r * sinPhi * Math.sin(o.theta),
      o.target.y + r * Math.cos(o.phi),
      o.target.z + r * sinPhi * Math.cos(o.theta)
    );
    this.camera.lookAt(o.target);
  }

  markCollected(index) {
    const n = this.nodes[index];
    if (!n) return;
    this.collected.add(index);
    n.core.material.emissiveIntensity = 0.22;
    n.halo.material.opacity = 0.12;
    n.ring.material.opacity = 0.1;
    n.light.intensity = 0;
  }

  resetCollected() {
    this.collected.clear();
    this.nodes.forEach((n) => {
      n.core.material.emissiveIntensity = 1.05;
      n.halo.material.opacity = 0.5;
      n.ring.material.opacity = 0.55;
      n.light.intensity = 2.2;
    });
  }

  hint() {
    const idx = this.nodes.findIndex((_, i) => !this.collected.has(i));
    if (idx < 0) return { done: true };
    this.hintIndex = idx;
    this.hintUntil = this.time + 2.6;
    const n = this.nodes[idx];
    const d = this.camera.position.distanceTo(n.group.position);
    return { index: idx, distance: d, title: n.def.title };
  }

  resetCamera() {
    const cam = this.def?.camera ?? {};
    this.orbit.radius = cam.radius ?? 14;
    this.orbit.theta = cam.theta ?? 0.6;
    this.orbit.baseTheta = this.orbit.theta;
    this.orbit.phi = cam.phi ?? 1.08;
    this.orbit.target.set(...(cam.target ?? [0, 1.2, 0]));
    this.orbit.idle = 0;
  }

  setAutoRotate(on) {
    this.orbit.auto = on;
  }

  /* ---------- 主迴圈 ---------- */

  start() {
    if (this._started) return;
    this._started = true;
    this.clock.start();
    this.renderer.setAnimationLoop(() => this._frame());
  }

  _frame() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.time += dt;

    const o = this.orbit;
    if (!this.drag.active) {
      o.idle += dt;
      // 小幅擺盪，不繞整圈——避免轉到牆後、構圖崩掉
      if (o.auto && o.idle > 2.2) {
        const want = o.baseTheta + Math.sin(this.time * 0.13) * 0.58;
        o.theta += (want - o.theta) * Math.min(1, dt * 1.1);
      }
    }
    this._updateCamera();

    // 節點漂浮
    for (let i = 0; i < this.nodes.length; i++) {
      const n = this.nodes[i];
      const t = this.time + n.phase;
      n.group.position.y = n.baseY + Math.sin(t * 1.1) * 0.09;
      n.core.rotation.y += dt * 0.7;
      n.core.rotation.x += dt * 0.28;
      n.ring.rotation.z += dt * 0.5;
      const pulse = 1 + Math.sin(t * 2.0) * 0.06;
      const hinting = this.hintIndex === i && this.time < this.hintUntil;
      const k = hinting ? 1 + Math.abs(Math.sin(t * 5)) * 0.55 : pulse;
      n.halo.scale.set(1.25 * k, 1.25 * k, 1);
    }

    // 自訂動畫
    for (const obj of this.animated) {
      if (obj.userData.spin) {
        const s = obj.userData.spin;
        obj.rotation[s.axis || 'y'] += dt * s.speed;
      }
      if (obj.isPointLight && obj.userData.flicker) {
        const f = obj.userData.flicker;
        obj.intensity = f.base * (1 + Math.sin(this.time * f.speed + f.phase) * f.amount)
          + Math.sin(this.time * f.speed * 2.7 + f.phase) * f.base * f.amount * 0.35;
      }
    }

    for (const p of this.particles) p.step?.(dt, this.time);

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    this._ro?.disconnect();
    window.removeEventListener('resize', this._resize);
    this._clearScene();
    this.renderer.dispose();
  }
}
