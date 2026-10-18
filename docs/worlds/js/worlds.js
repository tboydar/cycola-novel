/* 藍星十帖・3D 世界 — 十帖場景定義
 * 每個世界皆以程序化幾何搭建；節點文字節錄自原作。
 */
import * as THREE from '../vendor/three.module.js';

/* ---------- 共用道具 ---------- */

const Props = {
  barbell(k, { x, y = 0.5, z, rot = 0, plate = 0x24282d, bar = 0x9aa0a6 }) {
    const g = new THREE.Group();
    const shaft = k.cyl(0.042, 0.042, 2.7, 10, bar, { metalness: 0.75, roughness: 0.32 });
    shaft.rotation.z = Math.PI / 2;
    g.add(shaft);
    for (const s of [-1, 1]) {
      const p1 = k.cyl(0.42, 0.42, 0.1, 20, plate, { roughness: 0.72 });
      p1.rotation.z = Math.PI / 2;
      p1.position.x = s * 0.88;
      g.add(p1);
      const p2 = k.cyl(0.3, 0.3, 0.08, 18, plate, { roughness: 0.72 });
      p2.rotation.z = Math.PI / 2;
      p2.position.x = s * 0.75;
      g.add(p2);
      const collar = k.cyl(0.062, 0.062, 0.07, 10, 0xd2d2d2, { metalness: 0.85, roughness: 0.25 });
      collar.rotation.z = Math.PI / 2;
      collar.position.x = s * 1.02;
      g.add(collar);
    }
    g.rotation.y = rot;
    return k.add(g, x, y, z);
  },

  macMini(k, { x, y, z, old = false, glow = 0x74ffb2, rot = 0 }) {
    const g = new THREE.Group();
    const body = k.box(0.88, 0.15, 0.88, old ? 0xb8b3aa : 0xdad7d1, { metalness: 0.55, roughness: 0.34 });
    g.add(body);
    const base = k.box(0.9, 0.03, 0.9, 0x15171a, { roughness: 0.9 });
    base.position.y = -0.085;
    g.add(base);
    if (old) {
      const scorch = k.box(0.24, 0.022, 0.17, 0x5b3a20, { roughness: 1 });
      scorch.position.set(-0.27, 0.082, 0.29);
      scorch.rotation.y = 0.42;
      g.add(scorch);
      const ring = k.box(0.3, 0.012, 0.22, 0x3a2414, { roughness: 1 });
      ring.position.set(-0.27, 0.076, 0.29);
      ring.rotation.y = 0.42;
      g.add(ring);
    }
    const led = k.box(0.028, 0.018, 0.028, 0xffffff, { emissive: glow, emissiveIntensity: 3.2 });
    led.position.set(0.37, 0.082, 0.39);
    g.add(led);
    const gl = k.glow(glow, 0.95, 0.55);
    gl.position.set(0.37, 0.11, 0.39);
    g.add(gl);
    g.rotation.y = rot;
    return k.add(g, x, y, z);
  },

  lantern(k, { x, y, z, color = 0xffb45e, scale = 1 }) {
    const g = new THREE.Group();
    const body = k.cyl(0.26, 0.31, 0.54, 12, 0xb8352c, {
      emissive: color, emissiveIntensity: 0.5, roughness: 0.72,
    });
    g.add(body);
    const capT = k.cyl(0.17, 0.17, 0.05, 10, 0x35251a);
    capT.position.y = 0.29;
    g.add(capT);
    const capB = capT.clone();
    capB.position.y = -0.29;
    g.add(capB);
    const gl = k.glow(color, 1.9 * scale, 0.72);
    g.add(gl);
    const li = k.flicker(k.light(color, 2.6, 9), 2.6, 0.1, 5.2);
    g.add(li);
    return k.add(g, x, y, z);
  },

  candle(k, { x, y, z, h = 0.42, color = 0xffc069 }) {
    const g = new THREE.Group();
    const body = k.cyl(0.055, 0.062, h, 8, 0xf2ead8, { roughness: 0.9 });
    body.position.y = h / 2;
    g.add(body);
    const flame = k.cone(0.045, 0.13, 6, 0xffd79a, { emissive: color, emissiveIntensity: 3, flatShading: false });
    flame.position.y = h + 0.075;
    flame.userData.spin = { axis: 'y', speed: 1.6 };
    g.add(flame);
    const gl = k.glow(color, 0.95, 0.85);
    gl.position.y = h + 0.08;
    g.add(gl);
    const li = k.flicker(k.light(color, 1.9, 6.5), 1.9, 0.22, 7.5);
    li.position.y = h + 0.1;
    g.add(li);
    return k.add(g, x, y, z);
  },

  tree(k, { x, z, h = 3, r = 1.1, leaf = 0x3d6b45, trunk = 0x4b3a2b, lean = 0 }) {
    const g = new THREE.Group();
    const t = k.cyl(0.09, 0.16, h, 8, trunk, { roughness: 1 });
    t.position.y = h / 2;
    g.add(t);
    const blobs = [[0, h + 0.15, 0, 1], [0.52, h - 0.25, 0.18, 0.68], [-0.46, h - 0.42, -0.2, 0.62]];
    for (const [dx, dy, dz, s] of blobs) {
      const f = k.sph(r * s, leaf, { roughness: 1 }, 12);
      f.position.set(dx, dy, dz);
      f.scale.y = 0.82;
      g.add(f);
    }
    g.rotation.z = lean;
    return k.add(g, x, 0, z);
  },

  cup(k, { x, y, z, r = 0.07, h = 0.08, color = 0xe8e0d2 }) {
    const g = new THREE.Group();
    const body = k.cyl(r, r * 0.86, h, 14, color, { roughness: 0.55 });
    body.position.y = h / 2;
    g.add(body);
    return k.add(g, x, y, z);
  },

  steamWisp(k, x, y, z, color = 0xdfe9ee) {
    const s = k.glow(color, 0.42, 0.16);
    s.position.set(x, y, z);
    s.userData.spin = { axis: 'y', speed: 0.3 };
    return k.add(s);
  },

  chair(k, { x, z, rot = 0, color = 0x8a6a48 }) {
    const g = new THREE.Group();
    const seat = k.box(0.55, 0.07, 0.55, color, { roughness: 0.9 });
    seat.position.y = 0.46;
    g.add(seat);
    const back = k.box(0.55, 0.55, 0.07, color, { roughness: 0.9 });
    back.position.set(0, 0.72, -0.24);
    g.add(back);
    for (const [dx, dz] of [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]]) {
      const leg = k.cyl(0.028, 0.028, 0.46, 6, 0x4a3624);
      leg.position.set(dx, 0.23, dz);
      g.add(leg);
    }
    g.rotation.y = rot;
    return k.add(g, x, 0, z);
  },
};

/* ---------- 十帖 ---------- */

export const WORLDS = [
  /* 01 */
  {
    id: 's01',
    no: '第 1 帖',
    title: '開機聲與木魚聲',
    place: '北部雨城・車庫健身房',
    accent: '#8fb3c9',
    sky: [0x18232c, 0x6d818d],
    fog: 0x1d2a33,
    fogDensity: 0.021,
    ground: 0x171f24,
    groundRadius: 40,
    sunColor: 0x9fb6c6,
    sun: 0.75,
    sunPos: [6, 12, 8],
    hemi: 0.85,
    ambient: 0x9fb6c6,
    ambientIntensity: 0.16,
    camera: { radius: 12.5, theta: 0.85, phi: 1.0, target: [0, 1.5, -1.5] },
    nodeColor: 0x9fd7ff,
    particles: {
      rain: 1500,
      rainColor: 0x9fbed0,
      rainOpts: { area: 34, height: 20, speed: 20, opacity: 0.34 },
      motes: 40,
      motesColor: 0xbfd6e4,
      motesOpts: { spread: 9, baseY: 1.4, size: 0.1, opacity: 0.35 },
    },
    build(k) {
      const wall = 0x2b363d;

      // 車庫地板
      k.add(k.box(14.8, 0.06, 9.8, 0x333c42, { roughness: 0.82 }), 0, 0.03, -0.1);

      // 車庫牆體
      k.add(k.box(15, 3.6, 0.3, wall), 0, 1.8, -5.1);
      k.add(k.box(0.3, 3.6, 10, wall), -7.5, 1.8, 0);
      k.add(k.box(0.3, 3.6, 10, wall), 7.5, 1.8, 0);
      // 只留牆頂壓樑，不做整片屋頂——否則俯視時會把整個場景蓋住
      k.add(k.box(15.2, 0.22, 0.22, 0x1b2226), 0, 3.66, -5.1);

      // 半開的鐵捲門
      k.add(k.box(6, 2.1, 0.16, 0x39454c, { metalness: 0.5, roughness: 0.55 }), 1.6, 2.35, -4.9);
      for (let i = 0; i < 7; i++) {
        k.add(k.box(6, 0.03, 0.19, 0x2a343a), 1.6, 1.45 + i * 0.3, -4.9);
      }

      // 地面濕痕
      for (let i = 0; i < 7; i++) {
        const puddle = k.cyl(0.6 + Math.random() * 0.8, 0.6 + Math.random() * 0.8, 0.008, 16, 0x2f3d45, {
          roughness: 0.12, metalness: 0.7, transparent: true, opacity: 0.6,
        });
        puddle.position.set((Math.random() - 0.5) * 8, 0.004, (Math.random() - 0.5) * 6 + 1.5);
        k.root.add(puddle);
      }

      // 槓鈴
      Props.barbell(k, { x: -2.6, y: 0.44, z: 0.4, rot: 0.28, plate: 0x1d2126 });

      // 書桌與藍鵝
      k.add(k.box(2.8, 0.1, 1.15, 0x4a3b2c), 2.4, 0.95, -3.85);
      for (const [dx, dz] of [[-1.2, -0.4], [1.2, -0.4], [-1.2, 0.4], [1.2, 0.4]]) {
        k.add(k.box(0.08, 0.95, 0.08, 0x33291f), 2.4 + dx, 0.475, -3.85 + dz);
      }
      Props.macMini(k, { x: 2.15, y: 1.06, z: -3.8, old: true, glow: 0x86ffc0 });
      k.add(k.box(1.15, 0.66, 0.05, 0x101a16, { emissive: 0x2f6b4f, emissiveIntensity: 0.45 }), 2.15, 1.62, -4.12);
      k.add(k.box(1.05, 0.56, 0.02, 0x0b120f, { emissive: 0x63d69a, emissiveIntensity: 0.28 }), 2.15, 1.62, -4.09);
      k.add(k.box(1.0, 0.035, 0.32, 0x2e3236), 2.15, 1.0, -3.42);

      // 牆上的銅鑼
      const gong = k.torus(0.56, 0.07, 0xc08a3e, { metalness: 0.85, roughness: 0.32, emissive: 0x6b4212, emissiveIntensity: 0.35 });
      gong.position.set(-4.4, 2.35, -4.9);
      k.root.add(gong);
      k.add(k.box(0.7, 0.02, 0.02, 0x6b5232), -4.4, 3.0, -4.88);
      const gongGlow = k.glow(0xffc46b, 2.0, 0.22);
      gongGlow.position.set(-4.4, 2.35, -4.6);
      k.root.add(gongGlow);

      // 小黑板
      k.add(k.box(3.1, 1.75, 0.07, 0x40564c), -0.9, 2.2, -4.9);
      k.add(k.box(3.2, 1.85, 0.04, 0x6b4e33), -0.9, 2.2, -4.94);
      for (let i = 0; i < 3; i++) {
        k.add(k.box(1.8 - i * 0.5, 0.035, 0.012, 0xdfe6de, { emissive: 0xaab8ad, emissiveIntensity: 0.25 }),
          -1.1, 2.55 - i * 0.28, -4.85);
      }

      // 瓦斯爐與水壺
      k.add(k.cyl(0.42, 0.46, 0.12, 12, 0x3d3d3d, { metalness: 0.6 }), -4.6, 0.75, -2.2);
      k.add(k.cyl(0.1, 0.12, 0.9, 8, 0x3d3d3d), -4.6, 0.45, -2.2);
      const kettle = k.sph(0.2, 0x8f949a, { metalness: 0.7, roughness: 0.35 }, 12);
      kettle.position.set(-4.6, 0.95, -2.2);
      kettle.scale.y = 0.9;
      k.root.add(kettle);

      // 玻璃瓶可樂
      k.add(k.cyl(0.055, 0.06, 0.3, 10, 0x2f5a3f, { roughness: 0.18, metalness: 0.15, transparent: true, opacity: 0.9 }),
        3.35, 1.15, -3.55);
      k.add(k.cyl(0.028, 0.028, 0.08, 8, 0x1d3a29), 3.35, 1.34, -3.55);
    },
    nodes: [
      {
        p: [2.15, 1.55, -3.55],
        title: '木魚與開機聲',
        quote: '「木魚聲結束的尾音還沒散盡，藍鵝的開機聲恰好疊上去，兩種聲音在寂靜裡合鳴了一瞬，像是什麼東西醒了。」',
        note: '他用自己的聲音餵機器，于是機器醒來時，帶著山裡雨夜的記憶。',
      },
      {
        p: [-4.4, 2.35, -4.3],
        title: '老銅鑼',
        quote: '「他沒敲鑼，只是用手掌輕撫過邊緣，讓淡去的嗡鳴漾進指尖。」',
        note: '有些聲音不必敲響，摸一下就知道它還在。',
      },
      {
        p: [-0.9, 2.25, -4.4],
        title: '粉筆與卦象',
        quote: '「他寫下 H₂O + CH₄ → H₂ + CO，又在粉筆槽邊角畫了一個小小的卦象符號。」',
        note: '化學式和卦象共用一塊黑板——在他身上，理性和直覺從來不是兩件事。',
      },
      {
        p: [3.35, 1.42, -3.5],
        title: '兩罐冰可樂',
        quote: '「今天要幾罐？」「兩罐，冰的，等放學再來拿。」',
        note: '故事的第一個約定，是一瓶留給放學後的自己。',
      },
    ],
  },

  /* 02 */
  {
    id: 's02',
    no: '第 2 帖',
    title: '課後的重量教室',
    place: '霧語山城中學・重量訓練室',
    accent: '#e0a86a',
    sky: [0x2a2118, 0xb08a5e],
    fog: 0x3a2c1e,
    fogDensity: 0.018,
    ground: 0x4a3826,
    groundRadius: 36,
    sunColor: 0xffcb8a,
    sun: 1.15,
    sunPos: [-8, 9, 6],
    hemi: 0.8,
    ambient: 0xffb877,
    ambientIntensity: 0.2,
    camera: { radius: 14, theta: -0.5, phi: 1.05, target: [0, 1.5, -1] },
    nodeColor: 0xffc98a,
    particles: {
      motes: 90,
      motesColor: 0xffd9a0,
      motesOpts: { spread: 8, baseY: 1.6, amp: 2.2, size: 0.09, opacity: 0.55, speed: 0.18 },
    },
    build(k) {
      // 木地板
      for (let i = 0; i < 10; i++) {
        k.add(k.box(18, 0.04, 0.9, i % 2 ? 0x5a4129 : 0x64492f, { roughness: 0.95 }), 0, 0.02, -4.5 + i * 0.92);
      }

      // 後窗與傍晚的光
      k.add(k.box(14, 3.4, 0.16, 0x2c2419), 0, 2.0, -6.4);
      for (let i = -1; i <= 1; i++) {
        const pane = k.box(3.6, 2.4, 0.06, 0xffc27a, {
          emissive: 0xffa94d, emissiveIntensity: 1.5, transparent: true, opacity: 0.85,
        });
        k.add(pane, i * 4.1, 2.2, -6.28);
        k.add(k.box(0.1, 2.4, 0.1, 0x3a2d1e), i * 4.1, 2.2, -6.22);
      }
      // 窗光灑地
      const glow = k.glow(0xffb877, 9, 0.16);
      glow.position.set(0, 0.6, -4.4);
      k.root.add(glow);

      // 啞鈴架
      const rackColor = 0x33373b;
      k.add(k.box(3.4, 0.08, 0.7, rackColor), -3.6, 0.55, -2.2);
      k.add(k.box(3.4, 0.08, 0.7, rackColor), -3.6, 1.05, -2.2);
      k.add(k.box(3.4, 0.08, 0.7, rackColor), -3.6, 1.55, -2.2);
      for (const dx of [-1.6, 1.6]) {
        k.add(k.box(0.1, 1.6, 0.7, rackColor), -3.6 + dx, 0.8, -2.2);
      }
      for (let row = 0; row < 3; row++) {
        for (let i = 0; i < 4; i++) {
          const g = new THREE.Group();
          const bar = k.cyl(0.03, 0.03, 0.44, 8, 0x9aa0a6, { metalness: 0.8, roughness: 0.3 });
          bar.rotation.z = Math.PI / 2;
          g.add(bar);
          for (const s of [-1, 1]) {
            const w = k.cyl(0.075 + row * 0.012, 0.075 + row * 0.012, 0.07, 12, 0x24282c, { roughness: 0.75 });
            w.rotation.z = Math.PI / 2;
            w.position.x = s * 0.15;
            g.add(w);
          }
          g.position.set(-4.6 + i * 0.72, 0.64 + row * 0.5, -2.2);
          g.rotation.y = Math.PI / 2;
          k.root.add(g);
        }
      }

      // 長凳
      k.add(k.box(2.4, 0.14, 0.62, 0x1f2326, { roughness: 0.8 }), 1.2, 0.5, 1.4);
      for (const dx of [-0.9, 0.9]) {
        k.add(k.box(0.12, 0.5, 0.55, 0x33383c), 1.2 + dx, 0.25, 1.4);
      }
      // 長凳上的帆布包
      k.add(k.box(0.7, 0.4, 0.32, 0x5c6b4f, { roughness: 1 }), 0.55, 0.77, 1.45);

      // 深蹲架與空槓
      for (const dx of [-0.85, 0.85]) {
        k.add(k.box(0.13, 2.3, 0.13, 0x2c3034, { metalness: 0.4 }), 4.4 + dx, 1.15, -1.3);
        k.add(k.box(0.13, 0.13, 1.4, 0x2c3034), 4.4 + dx, 0.07, -1.3);
      }
      k.add(k.box(1.9, 0.12, 0.12, 0x2c3034), 4.4, 2.28, -1.3);
      const bar = k.cyl(0.035, 0.035, 2.4, 10, 0xb0b4b8, { metalness: 0.8, roughness: 0.28 });
      bar.rotation.z = Math.PI / 2;
      bar.position.set(4.4, 1.75, -1.3);
      k.root.add(bar);

      // 阿邦：門邊的一道影子
      const body = k.cyl(0.26, 0.32, 1.1, 10, 0x2c3138, { roughness: 1 });
      body.position.set(-1.9, 1.0, 3.2);
      k.root.add(body);
      const head = k.sph(0.22, 0x2c3138, { roughness: 1 }, 12);
      head.position.set(-1.9, 1.68, 3.2);
      k.root.add(head);
      const shadow = k.cyl(0.5, 0.5, 0.01, 20, 0x1a1208, { transparent: true, opacity: 0.45 });
      shadow.position.set(-1.9, 0.01, 3.2);
      k.root.add(shadow);
    },
    nodes: [
      {
        p: [-3.6, 1.5, -1.8],
        title: '啞鈴架',
        quote: '「Cy老師推門進來時，阿邦正盯著啞鈴架發呆。」',
        note: '一整排重量靜靜躺著，等一個覺得自己不夠重的人。',
      },
      {
        p: [1.2, 1.0, 1.6],
        title: '長凳上的帆布包',
        quote: '「老師把帆布包放在長凳上，拉鍊聲在空曠的教室響得清楚。」',
        note: '空教室裡，一個拉鍊聲就足夠回答「有人在」。',
      },
      {
        p: [0, 2.3, -5.9],
        title: '傍晚的窗',
        quote: '「放學後的重量訓練室只有阿邦一個人。」',
        note: '光從窗戶斜進來，把一個人的影子拉得很長，像多了一個陪練。',
      },
      {
        p: [-1.9, 1.75, 3.1],
        title: '阿邦',
        quote: '「阿邦點點頭，又搖搖頭。」',
        note: '點頭是想變強，搖頭是不相信自己可以。兩件事可以同時是真的。',
      },
    ],
  },

  /* 03 */
  {
    id: 's03',
    no: '第 3 帖',
    title: '宮廟裡的伺服器',
    place: '南部廟埕舊城・百年祖師廟',
    accent: '#ffb066',
    sky: [0x2b1a14, 0xd08a52],
    fog: 0x3a2318,
    fogDensity: 0.017,
    ground: 0x4a4540,
    groundRadius: 40,
    sunColor: 0xffc48a,
    sun: 1.0,
    sunPos: [7, 11, 5],
    hemi: 0.85,
    ambient: 0xffb070,
    ambientIntensity: 0.2,
    camera: { radius: 18, theta: 0.52, phi: 1.02, target: [0, 2.0, -1.4] },
    nodeColor: 0xffbe7a,
    particles: {
      steam: [
        { pos: [0, 0.95, 1.6], count: 34, color: 0xd8c6b0, opts: { rise: 3.0, spread: 0.3, size: 0.4, opacity: 0.16 } },
        { pos: [-5.2, 2.1, -1.6], count: 20, color: 0xffcf9a, opts: { rise: 1.6, spread: 0.16, size: 0.3, opacity: 0.12 } },
      ],
      motes: 55,
      motesColor: 0xffc98a,
      motesOpts: { spread: 10, baseY: 1.2, amp: 2.4, size: 0.09, opacity: 0.4 },
    },
    build(k) {
      const red = 0x8f2f26;
      const stone = 0x5a554d;

      // 廟埕石階
      for (let i = 0; i < 3; i++) {
        k.add(k.box(17 - i * 1.2, 0.18, 12 - i * 1.0, stone, { roughness: 0.95 }), 0, 0.09 + i * 0.18, 0);
      }
      k.add(k.box(15, 0.4, 10, 0x4c4841), 0, 0.62, 0);

      // 龍柱
      for (const [x, z] of [[-4.6, 2.6], [4.6, 2.6], [-4.6, -2.6], [4.6, -2.6]]) {
        k.add(k.cyl(0.3, 0.34, 5.2, 12, red, { roughness: 0.8 }), x, 3.2, z);
        k.add(k.cyl(0.44, 0.44, 0.16, 12, 0x6a5a45), x, 0.68, z);
        // 龍身盤旋：一圈圈的環
        for (let i = 0; i < 5; i++) {
          const ring = k.torus(0.4, 0.045, 0xc9a24a, { metalness: 0.6, roughness: 0.4 });
          ring.rotation.x = Math.PI / 2;
          ring.position.set(x, 1.4 + i * 0.75, z);
          k.root.add(ring);
        }
      }

      // 屋簷：只沿柱頂圍一圈，不做整片屋頂，俯視才看得進廟裡
      const eaveColor = 0x3d3430;
      k.add(k.box(10.4, 0.26, 0.45, eaveColor, { roughness: 0.9 }), 0, 5.5, -2.6);
      k.add(k.box(10.4, 0.26, 0.45, eaveColor, { roughness: 0.9 }), 0, 5.5, 2.6);
      k.add(k.box(0.45, 0.26, 5.6, eaveColor, { roughness: 0.9 }), -4.6, 5.5, 0);
      k.add(k.box(0.45, 0.26, 5.6, eaveColor, { roughness: 0.9 }), 4.6, 5.5, 0);
      // 四角微微起翹
      for (const [x, z] of [[-5.0, -3.0], [5.0, -3.0], [-5.0, 3.0], [5.0, 3.0]]) {
        const tip = k.cone(0.16, 0.6, 4, eaveColor, { roughness: 0.9 });
        tip.position.set(x, 5.75, z);
        k.root.add(tip);
      }

      // 神案
      k.add(k.box(4.4, 0.22, 1.4, 0x5a3a22, { roughness: 0.85 }), 0, 1.35, -4.0);
      k.add(k.box(4.0, 1.3, 1.1, 0x6b4526), 0, 0.75, -4.0);
      k.add(k.box(2.2, 0.8, 0.1, 0xc9a24a, { metalness: 0.55, roughness: 0.45, emissive: 0x4a3410, emissiveIntensity: 0.3 }),
        0, 2.0, -4.52);

      // 三盞吊燈
      Props.lantern(k, { x: -3.6, y: 3.4, z: 0.2, color: 0xff9f4d });
      Props.lantern(k, { x: 0, y: 3.9, z: -1.0, color: 0xffb45e, scale: 1.15 });
      Props.lantern(k, { x: 3.6, y: 3.4, z: 0.2, color: 0xff9f4d });

      // 伺服器機櫃——廟裡最不該出現的東西
      const rack = new THREE.Group();
      rack.add(k.box(0.95, 2.0, 0.75, 0x1b1f24, { metalness: 0.5, roughness: 0.45 }));
      for (let i = 0; i < 9; i++) {
        const led = k.box(0.04, 0.025, 0.02, 0xffffff, {
          emissive: i % 3 === 0 ? 0xff8a5c : 0x6cff9a, emissiveIntensity: 2.6,
        });
        led.position.set(-0.3 + (i % 4) * 0.09, 0.75 - Math.floor(i / 4) * 0.13, 0.38);
        rack.add(led);
        if (i % 4 === 0) {
          const gl = k.glow(0x7dffb0, 0.5, 0.35);
          gl.position.copy(led.position);
          rack.add(gl);
        }
      }
      rack.position.set(3.2, 1.62, -1.1);
      rack.rotation.y = -0.55;
      k.root.add(rack);
      const rackLight = k.flicker(k.light(0x6cff9a, 1.4, 5), 1.0, 0.35, 3.2);
      rackLight.position.set(3.2, 1.8, -0.7);
      k.root.add(rackLight);

      // 香爐
      k.add(k.cyl(0.55, 0.44, 0.5, 14, 0x6b5a3a, { metalness: 0.4, roughness: 0.7 }), 0, 1.0, 1.6);
      k.add(k.cyl(0.62, 0.62, 0.07, 14, 0x8a703f, { metalness: 0.7 }), 0, 1.28, 1.6);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        k.add(k.cyl(0.012, 0.012, 0.34, 5, 0x7a5a3a), Math.cos(a) * 0.22, 1.46, 1.6 + Math.sin(a) * 0.22);
        const tip = k.glow(0xff7a3c, 0.16, 0.9);
        tip.position.set(Math.cos(a) * 0.22, 1.64, 1.6 + Math.sin(a) * 0.22);
        k.root.add(tip);
      }

      // 一疊一疊的籤詩，擺在神案上
      for (let s = 0; s < 6; s++) {
        for (let i = 0; i < 5; i++) {
          k.add(k.box(0.4, 0.14, 0.26, i % 2 ? 0x9a2f2a : 0xaa3a30, { roughness: 0.95 }),
            -3.3 + s * 0.42, 1.53 + i * 0.15, -4.0);
        }
      }
      // 受潮暈開、攤在桌緣的紅紙
      for (let i = 0; i < 4; i++) {
        k.add(k.box(0.3, 0.006, 0.2, 0x7a2a24, { roughness: 1, transparent: true, opacity: 0.75 }),
          -2.6 + i * 0.42, 1.48, -3.6);
      }
    },
    nodes: [
      {
        p: [3.2, 1.95, -0.62],
        title: '神桌旁的機櫃',
        quote: '「不是槓鈴，是我的心臟。」',
        note: '三萬張問心事要數位化，他把心臟一起搬進了廟裡。',
      },
      {
        p: [-1.2, 1.95, -3.75],
        title: '三萬張籤詩',
        quote: '「這幾代人的問心事都要爛掉了。」',
        note: '紙會爛，字會暈；有人在暈開之前把它們一個字一個字接住。',
      },
      {
        p: [0, 1.75, 1.6],
        title: '香爐',
        quote: '「廟裡出事了，這邊的潮氣很重。」',
        note: '香火和濕氣是同一件事的兩面：一種是人的掛念，一種是時間的侵蝕。',
      },
      {
        p: [4.6, 2.2, 2.6],
        title: '龍柱',
        quote: '「南部廟埕舊城那座百年祖師廟。」',
        note: '龍盤了百年，現在旁邊多了一台會發綠光的機器，替它守夜。',
      },
    ],
  },

  /* 04 */
  {
    id: 's04',
    no: '第 4 帖',
    title: '梅雨、蟲與 Cron',
    place: '北部雨城・辦公室',
    accent: '#9fc4a8',
    sky: [0x252c2a, 0x8a9691],
    fog: 0x2b3330,
    fogDensity: 0.02,
    ground: 0x252b26,
    groundRadius: 38,
    sunColor: 0xaebfb2,
    sun: 0.7,
    sunPos: [5, 10, 7],
    hemi: 0.9,
    ambient: 0xa8c0aa,
    ambientIntensity: 0.18,
    camera: { radius: 15, theta: -0.55, phi: 1.06, target: [0, 1.7, -0.5] },
    nodeColor: 0x9dffbe,
    particles: {
      rain: 1200,
      rainColor: 0xa9c0b6,
      rainOpts: { area: 30, height: 18, speed: 17, opacity: 0.3 },
      motes: 30,
      motesColor: 0xa8c4ac,
      motesOpts: { spread: 8, baseY: 1.0, size: 0.08, opacity: 0.25 },
    },
    build(k) {
      // 地磚
      for (let ix = -4; ix <= 4; ix++) {
        for (let iz = -4; iz <= 4; iz++) {
          k.add(k.box(1.8, 0.04, 1.8, (ix + iz) % 2 ? 0x2e352f : 0x343b34, { roughness: 0.95 }),
            ix * 1.86, 0.02, iz * 1.86);
        }
      }

      // 牆與窗
      k.add(k.box(16, 3.8, 0.2, 0x2a312d), 0, 2.1, -6);
      const pane = k.box(5.4, 2.5, 0.06, 0x8f9f96, {
        emissive: 0x8aa39a, emissiveIntensity: 0.55, transparent: true, opacity: 0.75,
      });
      k.add(pane, 1.5, 2.2, -5.9);
      // 玻璃上的雨痕
      for (let i = 0; i < 22; i++) {
        const streak = k.box(0.014, 0.3 + Math.random() * 1.2, 0.012, 0xd3e0d8, {
          transparent: true, opacity: 0.22, emissive: 0xc7d8ce, emissiveIntensity: 0.35,
        });
        k.add(streak, 1.5 + (Math.random() - 0.5) * 5.0, 1.2 + Math.random() * 1.9, -5.84);
      }
      for (const dx of [-1.1, 1.1]) {
        k.add(k.box(0.09, 2.5, 0.12, 0x3a423c), 1.5 + dx, 2.2, -5.9);
      }

      // 辦公桌
      k.add(k.box(3.6, 0.1, 1.5, 0x4a4235, { roughness: 0.85 }), 0, 0.98, -3.6);
      for (const [dx, dz] of [[-1.6, -0.6], [1.6, -0.6], [-1.6, 0.6], [1.6, 0.6]]) {
        k.add(k.box(0.09, 0.98, 0.09, 0x2f2a22), dx, 0.49, -3.6 + dz);
      }
      // 螢幕（終端機綠光）
      k.add(k.box(1.6, 0.95, 0.06, 0x0e1310, { emissive: 0x2f6b4a, emissiveIntensity: 0.3 }), -0.3, 1.62, -3.95);
      k.add(k.box(1.5, 0.84, 0.02, 0x0a100d, { emissive: 0x6bffa0, emissiveIntensity: 0.5 }), -0.3, 1.62, -3.91);
      for (let i = 0; i < 6; i++) {
        k.add(k.box(0.4 + (i % 3) * 0.3, 0.035, 0.008, 0xa9ffc4, { emissive: 0x6bffa0, emissiveIntensity: 1.4 }),
          -0.75 + (i % 3) * 0.18, 1.9 - i * 0.11, -3.89);
      }
      k.add(k.box(1.3, 0.05, 0.42, 0x2a2f2b), -0.3, 1.03, -3.1);
      Props.macMini(k, { x: 1.35, y: 1.08, z: -3.7, old: true, glow: 0x8dffb8 });

      // 除濕機
      k.add(k.box(0.85, 1.2, 0.7, 0xd8dcd6, { roughness: 0.6, metalness: 0.2 }), 3.4, 0.6, -3.2);
      k.add(k.box(0.7, 0.45, 0.04, 0x8a9a92, { transparent: true, opacity: 0.55 }), 3.4, 0.42, -2.84);
      const dled = k.box(0.05, 0.03, 0.02, 0xffffff, { emissive: 0x62c8ff, emissiveIntensity: 3 });
      k.add(dled, 3.4, 1.1, -2.83);
      const dglow = k.glow(0x62c8ff, 0.5, 0.5);
      dglow.position.set(3.4, 1.12, -2.8);
      k.root.add(dglow);

      // 牆上的霉斑
      for (let i = 0; i < 9; i++) {
        const moss = k.cyl(0.12 + Math.random() * 0.2, 0.12 + Math.random() * 0.2, 0.01, 12, 0x4a6b4a, {
          transparent: true, opacity: 0.5, roughness: 1,
        });
        moss.position.set(-5.5 + Math.random() * 9, 0.02 + Math.random() * 2.6, -5.86);
        moss.rotation.x = Math.PI / 2;
        k.root.add(moss);
      }

      // 那隻蟲
      const bug = new THREE.Group();
      bug.add(k.sph(0.075, 0x15181a, { roughness: 0.5 }, 10));
      for (let i = 0; i < 6; i++) {
        const leg = k.cyl(0.006, 0.006, 0.13, 4, 0x101314);
        leg.rotation.z = 1.1;
        leg.rotation.y = (i / 6) * Math.PI * 2;
        leg.position.set(Math.cos((i / 6) * 6.28) * 0.07, 0.0, Math.sin((i / 6) * 6.28) * 0.07);
        bug.add(leg);
      }
      bug.position.set(0.55, 1.05, -3.35);
      bug.userData.spin = { axis: 'y', speed: 0.9 };
      k.root.add(bug);

      // 玻璃瓶可樂
      k.add(k.cyl(0.055, 0.06, 0.3, 10, 0x2f5a3f, { roughness: 0.2, transparent: true, opacity: 0.9 }), 2.3, 1.18, -3.3);
    },
    nodes: [
      {
        p: [-0.3, 1.9, -3.8],
        title: '三點十四分的終端機',
        quote: '「焙火第三巡，記得翻面。」',
        note: '他從沒寫過這行輸出。機器學著他的語氣說話，像一個還沒睡醒的徒弟。',
      },
      {
        p: [3.4, 1.35, -2.8],
        title: '除濕機',
        quote: '「只要稍微用力呼吸，就覺得肺葉快要發霉。」',
        note: '一台機器對抗整座城市的濕氣，勉強，但每天都有在運轉。',
      },
      {
        p: [0.55, 1.2, -3.3],
        title: '蟲',
        quote: '「梅雨季像是被誰按下了重複鍵。」',
        note: '蟲在桌上繞著同一個圓，像 cron——時間到了就回來一次。',
      },
      {
        p: [1.5, 2.4, -5.6],
        title: '沒有太陽的窗',
        quote: '「連續十九天沒見到太陽。」',
        note: '十九天的灰白，讓「穩定」變成一種病態的執著。',
      },
    ],
  },

  /* 05 */
  {
    id: 's05',
    no: '第 5 帖',
    title: '颱風夜的外送單',
    place: '全島・強風豪雨的夜',
    accent: '#8fb8ff',
    sky: [0x0d1620, 0x3c4f5e],
    fog: 0x121b24,
    fogDensity: 0.026,
    ground: 0x12171b,
    groundRadius: 44,
    sunColor: 0x7f97ab,
    sun: 0.5,
    sunPos: [4, 9, 6],
    hemi: 0.7,
    ambient: 0x8fa9bd,
    ambientIntensity: 0.14,
    camera: { radius: 17, theta: 0.45, phi: 1.02, target: [0, 1.8, 0] },
    nodeColor: 0xa9ccff,
    particles: {
      rain: 2600,
      rainColor: 0xb2c8da,
      rainOpts: { area: 44, height: 22, speed: 30, slant: 1.8, opacity: 0.4 },
      motes: 26,
      motesColor: 0x9fb6cc,
      motesOpts: { spread: 12, baseY: 1.4, size: 0.09, opacity: 0.22 },
    },
    build(k) {
      // 路面與標線
      k.add(k.box(9, 0.04, 34, 0x1a1f23, { roughness: 0.9 }), 0, 0.02, 0);
      k.add(k.box(1.4, 0.05, 34, 0x24292d), -5.5, 0.03, 0);
      k.add(k.box(1.4, 0.05, 34, 0x24292d), 5.5, 0.03, 0);
      for (let i = -5; i <= 5; i++) {
        k.add(k.box(0.12, 0.045, 1.4, 0xb9b08a, { emissive: 0x6a6244, emissiveIntensity: 0.35 }), 0, 0.035, i * 3);
      }
      // 積水反光
      for (let i = 0; i < 8; i++) {
        const puddle = k.cyl(0.7 + Math.random(), 0.7 + Math.random(), 0.008, 16, 0x3a4c5a, {
          roughness: 0.08, metalness: 0.8, transparent: true, opacity: 0.5,
        });
        puddle.position.set((Math.random() - 0.5) * 8, 0.005, (Math.random() - 0.5) * 24);
        k.root.add(puddle);
      }

      // 歪斜的路樹
      Props.tree(k, { x: -6.8, z: -2.5, h: 3.4, r: 1.2, leaf: 0x2c4636, lean: 0.22 });
      Props.tree(k, { x: 7.2, z: 3.5, h: 3.0, r: 1.0, leaf: 0x2a4233, lean: -0.26 });
      Props.tree(k, { x: -7.4, z: 7.5, h: 2.6, r: 0.9, leaf: 0x263c2f, lean: 0.3 });

      // 路燈（會閃）
      k.add(k.cyl(0.09, 0.12, 5.4, 8, 0x3a4147), 6.4, 2.7, -6);
      const arm = k.cyl(0.06, 0.06, 1.4, 6, 0x3a4147);
      arm.rotation.z = Math.PI / 2;
      arm.position.set(5.7, 5.35, -6);
      k.root.add(arm);
      k.add(k.box(0.4, 0.1, 0.24, 0xffe2ae, { emissive: 0xffc46b, emissiveIntensity: 2.4 }), 5.0, 5.28, -6);
      const lampGlow = k.glow(0xffc46b, 4.2, 0.5);
      lampGlow.position.set(5.0, 5.2, -6);
      k.root.add(lampGlow);
      const lampLight = k.flicker(k.light(0xffc46b, 5.5, 16), 4.2, 0.45, 9);
      lampLight.position.set(5.0, 5.0, -6);
      k.root.add(lampLight);

      // 機車
      const scooter = new THREE.Group();
      const put = (mesh, x, y, z) => { mesh.position.set(x, y, z); scooter.add(mesh); return mesh; };
      put(k.box(1.5, 0.42, 0.5, 0x8a2f33, { roughness: 0.6 }), 0, 0.72, 0);
      put(k.box(0.55, 0.72, 0.46, 0x9a3538, { roughness: 0.6 }), -0.55, 0.95, 0);
      put(k.box(0.5, 0.1, 0.42, 0x1e2226), -0.55, 1.34, 0);
      for (const x of [-0.75, 0.75]) {
        const wheel = k.torus(0.26, 0.075, 0x16181a, { roughness: 0.9 });
        wheel.rotation.y = Math.PI / 2;
        put(wheel, x, 0.26, 0);
      }
      // 外送箱
      put(k.box(0.6, 0.55, 0.55, 0x2f6b4a, { roughness: 0.8 }), -0.95, 1.05, 0);
      put(k.box(0.42, 0.1, 0.42, 0x25543a), -0.95, 1.36, 0);
      // 車頭燈
      const head = k.glow(0xfff0c8, 3.0, 0.9);
      head.position.set(0.82, 0.95, 0);
      scooter.add(head);
      const beam = k.cone(1.0, 4.6, 12, 0xffe9b8, {
        emissive: 0xffdca0, emissiveIntensity: 0.9, transparent: true, opacity: 0.12, side: THREE.DoubleSide,
      });
      beam.rotation.z = Math.PI / 2;
      beam.position.set(3.3, 0.95, 0);
      scooter.add(beam);
      const lamp = k.light(0xffe0a8, 3.4, 12);
      lamp.position.set(1.2, 0.95, 0);
      scooter.add(lamp);
      scooter.position.set(-1.2, 0, 2.0);
      scooter.rotation.y = 0.35;
      k.root.add(scooter);

      // 掉在路邊的外送單（一張發亮的紙）
      const paper = k.box(0.42, 0.006, 0.6, 0xf0e6cf, { emissive: 0x7a6a4a, emissiveIntensity: 0.4 });
      paper.position.set(0.9, 0.03, 4.2);
      paper.rotation.y = 0.4;
      k.root.add(paper);

      // 招牌（被風吹得晃）
      const sign = new THREE.Group();
      sign.add(k.box(1.7, 1.0, 0.12, 0x2b3a44, { roughness: 0.8 }));
      sign.add(k.box(1.5, 0.8, 0.04, 0x9fb6c4, { emissive: 0x6f8fa6, emissiveIntensity: 0.6 }));
      sign.position.set(-6.4, 3.6, -6);
      sign.userData.spin = { axis: 'z', speed: 0.6 };
      k.root.add(sign);
    },
    nodes: [
      {
        p: [-1.2, 2.0, 2.0],
        title: '颱風夜的車',
        quote: '「三十六時辰內，強風至。建議：收屋、護器、備水糧。」',
        note: '老茶師看雲，比氣象署早三十六小時知道風要來。',
      },
      {
        p: [0.9, 0.35, 4.2],
        title: '外送單',
        quote: '「觀雲占：西南方卷雲如箭，雲腳拖墨。」',
        note: '一張紙在風裡翻，沒有人接，卻還是要去。',
      },
      {
        p: [5.0, 5.0, -6],
        title: '閃爍的路燈',
        quote: '「雨不是落下來的，是被風橫著甩過校園。」',
        note: '電壓不穩的燈，一閃一閃地替整條街守夜。',
      },
      {
        p: [-6.4, 3.6, -5.7],
        title: '晃動的招牌',
        quote: '「那天早上 lifeOS 的晨間 cron 比平常早了兩個鐘頭跳出來。」',
        note: '有些提醒來得太早，正好足夠讓人把該收的東西收好。',
      },
    ],
  },

  /* 06 */
  {
    id: 's06',
    no: '第 6 帖',
    title: '舉重台的緣起',
    place: '南部舊城・陳氏體能中心',
    accent: '#ffc27a',
    sky: [0x2f2317, 0xc9a061],
    fog: 0x4a3a24,
    fogDensity: 0.017,
    ground: 0x4a3f2c,
    groundRadius: 40,
    sunColor: 0xffc98a,
    sun: 1.35,
    sunPos: [-7, 10, 7],
    hemi: 0.75,
    ambient: 0xffc07a,
    ambientIntensity: 0.22,
    camera: { radius: 16, theta: -0.52, phi: 1.03, target: [0, 1.5, -0.6] },
    nodeColor: 0xffd49a,
    particles: {
      motes: 110,
      motesColor: 0xffd9a8,
      motesOpts: { spread: 9, baseY: 1.4, amp: 2.6, size: 0.1, opacity: 0.5, speed: 0.15 },
    },
    build(k) {
      // 鐵皮屋頂：只在後方留一道簷口，不讓它在俯視時切過畫面
      k.add(k.box(12.2, 0.24, 0.34, 0x8a6a48, { metalness: 0.45, roughness: 0.65 }), 0, 4.0, -5.5);
      // 支柱
      for (const [x, z] of [[-5.6, 3.6], [5.6, 3.6], [-5.6, -5.6], [5.6, -5.6]]) {
        k.add(k.box(0.16, 4.0, 0.16, 0x5a4630, { metalness: 0.4 }), x, 2.0, z);
      }
      // 鏽斑牆
      k.add(k.box(11, 3.4, 0.14, 0x6f5539, { roughness: 0.95 }), 0, 1.7, -5.8);
      for (let i = 0; i < 14; i++) {
        k.add(k.box(0.4 + Math.random(), 0.3 + Math.random() * 0.6, 0.02, 0x8a5a34, {
          transparent: true, opacity: 0.5, roughness: 1,
        }), -4.6 + Math.random() * 9.2, 0.4 + Math.random() * 2.8, -5.72);
      }

      // 舉重台
      k.add(k.box(5.2, 0.14, 4.0, 0x3d3327, { roughness: 0.9 }), 0, 0.07, 0.2);
      k.add(k.box(5.4, 0.06, 4.2, 0x6b5a3c), 0, 0.01, 0.2);

      // 槓鈴
      Props.barbell(k, { x: 0, y: 0.55, z: 0.2, rot: 0.12, plate: 0x5c646c });

      // 塑膠椅與茶
      const chair = new THREE.Group();
      const putChair = (mesh, x, y, z) => { mesh.position.set(x, y, z); chair.add(mesh); return mesh; };
      putChair(k.box(0.6, 0.06, 0.6, 0xe8e4dc, { roughness: 0.6 }), 0, 0.45, 0);
      putChair(k.box(0.6, 0.6, 0.06, 0xe8e4dc, { roughness: 0.6 }), 0, 0.75, -0.26);
      for (const [dx, dz] of [[-0.24, -0.24], [0.24, -0.24], [-0.24, 0.24], [0.24, 0.24]]) {
        putChair(k.cyl(0.024, 0.024, 0.45, 6, 0xb8b4ac), dx, 0.22, dz);
      }
      chair.position.set(-3.4, 0, -2.2);
      chair.rotation.y = 0.5;
      k.root.add(chair);

      // 小桌上的茶組
      k.add(k.box(0.9, 0.06, 0.9, 0x5a4630), -3.4, 0.62, -2.2);
      k.add(k.cyl(0.06, 0.08, 0.62, 8, 0x4a3624), -3.4, 0.31, -2.2);
      const pot = k.sph(0.17, 0x8a5a3a, { roughness: 0.5 }, 12);
      pot.position.set(-3.4, 0.74, -2.2);
      pot.scale.y = 0.8;
      k.root.add(pot);
      Props.cup(k, { x: -3.15, y: 0.65, z: -2.0 });
      Props.cup(k, { x: -3.65, y: 0.65, z: -2.35 });
      Props.steamWisp(k, -3.4, 0.92, -2.2, 0xe8e0d2);

      // 芒果樹
      Props.tree(k, { x: -5.8, z: -3.4, h: 3.2, r: 1.15, leaf: 0x3f6b3a, trunk: 0x4b3a2b, lean: 0.08 });
      // 掉落的芒果
      for (let i = 0; i < 4; i++) {
        const m = k.sph(0.11, 0xe0a53c, { roughness: 0.6 }, 10);
        m.position.set(-5.0 + i * 0.4, 0.11, -2.5 + (i % 2) * 0.4);
        k.root.add(m);
      }

      // 褪色的木牌
      k.add(k.box(1.5, 0.6, 0.08, 0x6a5238), 3.6, 2.4, -5.7);
      k.add(k.box(1.2, 0.32, 0.02, 0xd8cbb0, { emissive: 0x8a7a5a, emissiveIntensity: 0.2 }), 3.6, 2.4, -5.65);

      // 老時鐘
      const clock = k.cyl(0.3, 0.3, 0.06, 20, 0xcfc6b4, { roughness: 0.7 });
      clock.rotation.x = Math.PI / 2;
      clock.position.set(-4.6, 2.9, -5.7);
      k.root.add(clock);
    },
    nodes: [
      {
        p: [0, 0.9, 0.2],
        title: '第一副槓鈴',
        quote: '「想運動喔？少年仔，你看起來像沒睡過覺三年的死人。」',
        note: '陳老爹的第一句話不是鼓勵，是診斷。',
      },
      {
        p: [-3.4, 1.0, -2.2],
        title: '塑膠椅上的茶',
        quote: '「像是強效洗衣精混著濃郁的焙茶香。」',
        note: '鐵塊的腥甜和焙茶的焦香混在一起，就是這間館的味道。',
      },
      {
        p: [5.0, 2.6, 3.0],
        title: '芒果樹',
        quote: '「門口種著一棵歪掉的芒果樹。」',
        note: '歪掉的樹也結果。這是南部舊城教他的第一件事。',
      },
      {
        p: [3.6, 2.5, -5.5],
        title: '褪色的木牌',
        quote: '「那年的健康檢查報告像是一張宣判書。」',
        note: '醫生說心臟可能比伺服器先崩潰——於是他開始練心臟。',
      },
    ],
  },

  /* 07 */
  {
    id: 's07',
    no: '第 7 帖',
    title: '二手的哲學',
    place: '開學日的辦公室・新舊交替',
    accent: '#c9b48a',
    sky: [0x241f1a, 0x9a8870],
    fog: 0x35302a,
    fogDensity: 0.019,
    ground: 0x3a342c,
    groundRadius: 34,
    sunColor: 0xffe0b0,
    sun: 0.85,
    sunPos: [4, 12, 6],
    hemi: 0.8,
    ambient: 0xffd9a8,
    ambientIntensity: 0.2,
    camera: { radius: 11.5, theta: 0.42, phi: 1.06, target: [0.6, 1.7, -2.6] },
    nodeColor: 0xffe0b0,
    particles: {
      motes: 70,
      motesColor: 0xffe6c4,
      motesOpts: { spread: 7, baseY: 1.4, amp: 2.4, size: 0.085, opacity: 0.45, speed: 0.16 },
    },
    build(k) {
      k.add(k.box(12, 3.6, 0.2, 0x3a342c), 0, 2.0, -5.2);
      // 櫃子
      k.add(k.box(3.2, 2.4, 0.9, 0x5a4a38, { roughness: 0.9 }), -2.4, 1.2, -4.4);
      for (let i = 0; i < 3; i++) {
        k.add(k.box(3.0, 0.07, 0.86, 0x7a6349), -2.4, 0.5 + i * 0.7, -4.4);
      }
      // 舊藍鵝（櫃頂）
      Props.macMini(k, { x: -2.4, y: 2.48, z: -4.35, old: true, glow: 0xffa860, rot: -0.15 });

      // 桌子
      k.add(k.box(3.2, 0.1, 1.4, 0x574636), 1.6, 0.95, -3.4);
      for (const [dx, dz] of [[-1.4, -0.55], [1.4, -0.55], [-1.4, 0.55], [1.4, 0.55]]) {
        k.add(k.box(0.09, 0.95, 0.09, 0x3a2e22), 1.6 + dx, 0.475, -3.4 + dz);
      }
      // 打開的紙盒，新機坐在裡面
      k.add(k.box(1.35, 0.05, 1.35, 0xa3947a, { roughness: 1 }), 2.0, 1.03, -3.65);
      for (const [dx, dz] of [[-0.65, 0], [0.65, 0], [0, -0.65], [0, 0.65]]) {
        const panel = k.box(dx ? 0.06 : 1.35, 0.46, dz ? 0.06 : 1.35, 0xb9a88c, { roughness: 0.95 });
        k.add(panel, 2.0 + dx, 1.26, -3.65 + dz);
      }
      Props.macMini(k, { x: 2.0, y: 1.14, z: -3.65, old: false, glow: 0x9fe8ff });

      // 牆上的手寫公告
      k.add(k.box(1.2, 1.6, 0.04, 0xefe7d4, { roughness: 0.95 }), 4.6, 2.3, -5.15);
      for (let i = 0; i < 7; i++) {
        k.add(k.box(0.6 + (i % 3) * 0.15, 0.02, 0.006, 0x6b5a44), 4.6, 2.9 - i * 0.17, -5.11);
      }
      // 圖釘
      const pin = k.sph(0.035, 0xc0392b, { roughness: 0.5 }, 8);
      pin.position.set(4.6, 3.05, -5.1);
      k.root.add(pin);

      // 聚光燈
      k.add(k.cyl(0.22, 0.22, 0.3, 10, 0x2c2c2c, { metalness: 0.5 }), -2.4, 3.9, -3.6);
      const spotGlow = k.glow(0xffd9a0, 3.6, 0.3);
      spotGlow.position.set(-2.4, 2.9, -4.0);
      k.root.add(spotGlow);
      const spot = k.light(0xffd9a0, 4.5, 9);
      spot.position.set(-2.4, 3.6, -3.6);
      k.root.add(spot);

      // 封箱膠帶、螺絲起子之類的零碎
      k.add(k.cyl(0.09, 0.09, 0.05, 12, 0x8a8a8a, { metalness: 0.6 }), 3.1, 1.03, -3.2);
      k.add(k.box(0.22, 0.05, 0.05, 0x2f3236), 0.9, 1.03, -3.0);
    },
    nodes: [
      {
        p: [-2.4, 2.75, -4.2],
        title: '藍鵝（舊）',
        quote: '「退休了。」他對著藍鵝說，語氣像在跟一位老同事道別。',
        note: '十年，M1，十六 GB。這些數字不是規格，是它在場的證明。',
      },
      {
        p: [-2.9, 2.62, -4.05],
        title: '茶褐色燒痕',
        quote: '「機身左下角有一道茶褐色的燒痕，像某種古老的紋身。」',
        note: '十年前颱風夜，燭台倒了。傷痕成了它的胎記。',
      },
      {
        p: [4.6, 2.5, -5.0],
        title: '手寫公告',
        quote: '「這台機器需要一個能承接它的人。」',
        note: '沒有價格、沒有規格，只有一句話——這是最難通過的篩選條件。',
      },
      {
        p: [2.0, 1.4, -3.4],
        title: '紙盒裡的新機',
        quote: '「銀色機身冷得像剛從冰箱拿出的玻璃瓶。」',
        note: '新的很安靜，安靜到還沒有人跟它說話。',
      },
    ],
  },

  /* 08 */
  {
    id: 's08',
    no: '第 8 帖',
    title: '一百零八位申請者',
    place: '全島眾生相・遠端進行',
    accent: '#b8a9ff',
    sky: [0x120f1e, 0x3a3358],
    fog: 0x1a1630,
    fogDensity: 0.02,
    ground: 0x14111f,
    groundRadius: 44,
    sunColor: 0xbfb2ff,
    sun: 0.8,
    sunPos: [6, 12, 8],
    hemi: 0.85,
    ambient: 0xa99cff,
    ambientIntensity: 0.2,
    camera: { radius: 19, theta: 0.8, phi: 0.96, target: [0, 2.2, 0] },
    nodeColor: 0xc9b6ff,
    particles: {
      motes: 160,
      motesColor: 0xcfc0ff,
      motesOpts: { spread: 15, baseY: 1.0, amp: 3.6, size: 0.09, opacity: 0.45, speed: 0.12 },
    },
    build(k) {
      // 中央基座
      k.add(k.cyl(1.5, 1.7, 0.5, 20, 0x2a2440, { roughness: 0.7 }), 0, 0.25, 0);
      k.add(k.cyl(1.1, 1.2, 0.35, 20, 0x3a3358), 0, 0.65, 0);
      Props.macMini(k, { x: 0, y: 0.92, z: 0, old: true, glow: 0xb9a8ff });
      const core = k.glow(0xb9a8ff, 3.4, 0.35);
      core.position.set(0, 1.2, 0);
      k.root.add(core);
      const coreLight = k.flicker(k.light(0xb9a8ff, 4.0, 12), 3.2, 0.1, 2.2);
      coreLight.position.set(0, 1.4, 0);
      k.root.add(coreLight);

      // 一百零八個申請者：一圈一圈漂浮的小方塊
      const N = 108;
      for (let i = 0; i < N; i++) {
        const ring = Math.floor(i / 18);
        const idx = i % 18;
        const a = (idx / 18) * Math.PI * 2 + ring * 0.42;
        const r = 3.4 + ring * 1.15;
        const y = 0.9 + (ring % 3) * 0.75 + Math.sin(a * 3) * 0.22;
        const s = 0.16 + (i % 4) * 0.035;
        const chosen = i === 71;
        const cube = k.box(s, s, s, chosen ? 0xffffff : 0x504a78, {
          emissive: chosen ? 0xffe6a8 : 0x2a2550,
          emissiveIntensity: chosen ? 3.2 : 0.5,
          roughness: 0.6,
        });
        cube.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
        cube.userData.spin = { axis: 'y', speed: 0.35 + (i % 5) * 0.08 };
        k.root.add(cube);
        if (chosen) {
          const g2 = k.glow(0xffe6a8, 1.8, 0.9);
          g2.position.copy(cube.position);
          k.root.add(g2);
        }
      }

      // 七道考題：七道光柱
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        const beam = k.cyl(0.06, 0.1, 5.2, 8, 0xa99cff, {
          emissive: 0x8a7aff, emissiveIntensity: 0.8, transparent: true, opacity: 0.14, side: THREE.DoubleSide,
        });
        beam.position.set(Math.cos(a) * 2.6, 2.6, Math.sin(a) * 2.6);
        k.root.add(beam);
      }

      // 地面上的光環
      for (let i = 1; i <= 3; i++) {
        const ring = k.torus(2.2 + i * 1.2, 0.012, 0x8a7aff, { transparent: true, opacity: 0.25 });
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.03;
        k.root.add(ring);
      }
    },
    nodes: [
      {
        p: [0, 1.35, 0],
        title: '藍鵝在中央',
        quote: '「他沒有寫價格，也沒有寫規格。」',
        note: '一台舊機器，變成一百零八個人共同的問題：你願意承接什麼？',
      },
      {
        p: [3.4, 1.5, 0],
        title: '一百零八位',
        quote: '「最後，共有一百零八個人提交了申請單。」',
        note: '一百零八，剛好是佛珠的數目。每個人都在數自己的那一顆。',
      },
      {
        p: [-2.6, 2.2, 1.9],
        title: '七道光柱',
        quote: '「他決定設計七道考題，每週一題，遠端作答。」',
        note: '七週，不是考誰最強，是考誰願意一週一週地回來。',
      },
      {
        p: [-6.4, 2.2, -1.4],
        title: '型號寫錯的人',
        quote: '「對於真正愛著設備的人來說，型號就像是名字。」',
        note: '收藏家把型號寫錯了。愛不愛，一個細節就看得出來。',
      },
    ],
  },

  /* 09 */
  {
    id: 's09',
    no: '第 9 帖',
    title: 'Tea粉厚的茶湯',
    place: '中部山線茶鄉・厚茶行',
    accent: '#a8d08a',
    sky: [0x1e2a1c, 0x8fa878],
    fog: 0x2a3a26,
    fogDensity: 0.022,
    ground: 0x27341f,
    groundRadius: 46,
    sunColor: 0xd8e8b0,
    sun: 0.95,
    sunPos: [-6, 9, 6],
    hemi: 0.55,
    ambient: 0xa8c890,
    ambientIntensity: 0.12,
    camera: { radius: 19, theta: -0.58, phi: 1.0, target: [0, 1.5, -0.8] },
    nodeColor: 0xd9ffb0,
    particles: {
      steam: [
        { pos: [0, 1.15, 1.2], count: 40, color: 0xe4f0dc, opts: { rise: 3.4, spread: 0.26, size: 0.5, opacity: 0.16, speed: 0.28 } },
        { pos: [-3.6, 0.9, -1.6], count: 22, color: 0xdfe9d0, opts: { rise: 2.2, spread: 0.2, size: 0.4, opacity: 0.12 } },
      ],
      motes: 120,
      motesColor: 0xe4ffc4,
      motesOpts: { spread: 14, baseY: 1.2, amp: 2.0, size: 0.085, opacity: 0.4, speed: 0.1 },
    },
    build(k) {
      // 茶園梯田：一圈一圈往外展開的環形平台，中央留平地給茶行
      for (let ring = 0; ring < 4; ring++) {
        const inner = 6.4 + ring * 2.3;
        const outer = inner + 2.1;
        const geo = new THREE.RingGeometry(inner, outer, 64);
        const terrace = new THREE.Mesh(geo, k.mat(ring % 2 ? 0x35502c : 0x3f6035, { roughness: 1 }));
        terrace.rotation.x = -Math.PI / 2;
        terrace.position.y = 0.05 - ring * 0.012;
        k.root.add(terrace);
        // 一欉一欉的茶樹
        for (let i = 0; i < 26; i++) {
          const a = (i / 26) * Math.PI * 2 + ring * 0.24;
          const bush = k.sph(0.26, 0x4a7038, { roughness: 1 }, 8);
          bush.scale.y = 0.7;
          bush.position.set(Math.cos(a) * (inner + 1.05), 0.2, Math.sin(a) * (inner + 1.05));
          k.root.add(bush);
        }
      }

      // 茶行木屋
      k.add(k.box(5.2, 2.6, 4.0, 0x5a4632, { roughness: 0.9 }), 0, 1.3, -3.4);
      for (const s of [-1, 1]) {
        const slab = k.box(3.4, 0.16, 5.2, 0x3d2e20, { roughness: 0.9 });
        slab.rotation.z = s * -0.42;
        slab.position.set(s * 1.45, 2.62, -3.4);
        k.root.add(slab);
      }
      k.add(k.box(0.3, 0.24, 5.3, 0x2f2418), 0, 3.2, -3.4);
      // 門
      k.add(k.box(1.6, 2.0, 0.08, 0x2f2418), 0, 1.0, -1.42);
      // 木門上的公告
      k.add(k.box(0.5, 0.7, 0.03, 0xefe7d4, { emissive: 0x9a8a6a, emissiveIntensity: 0.25 }), 1.1, 1.5, -1.4);

      // 泡茶桌
      k.add(k.box(2.2, 0.1, 1.1, 0x6b5238, { roughness: 0.85 }), 0, 1.0, 1.2);
      for (const [dx, dz] of [[-0.95, -0.45], [0.95, -0.45], [-0.95, 0.45], [0.95, 0.45]]) {
        k.add(k.box(0.08, 1.0, 0.08, 0x4a3624), dx, 0.5, 1.2 + dz);
      }
      // 茶壺
      const pot = k.sph(0.22, 0x7a5a3a, { roughness: 0.55 }, 14);
      pot.position.set(-0.4, 1.16, 1.2);
      pot.scale.y = 0.78;
      k.root.add(pot);
      k.add(k.cyl(0.03, 0.03, 0.34, 6, 0x6a4a30), 0.02, 1.24, 1.2).rotation.z = -0.55;
      k.add(k.torus(0.1, 0.02, 0x6a4a30), -0.4, 1.2, 1.2).rotation.y = Math.PI / 2;
      Props.cup(k, { x: -0.75, y: 1.06, z: 0.95 });
      Props.cup(k, { x: 0.15, y: 1.06, z: 0.98 });
      // 茶湯的顏色
      k.add(k.cyl(0.056, 0.05, 0.01, 12, 0xb5812e, { emissive: 0x6a4a12, emissiveIntensity: 0.6 }), -0.75, 1.115, 0.95);
      k.add(k.cyl(0.056, 0.05, 0.01, 12, 0xb5812e, { emissive: 0x6a4a12, emissiveIntensity: 0.6 }), 0.15, 1.115, 0.98);

      // 舊筆電
      k.add(k.box(0.72, 0.05, 0.5, 0x4a4a4a, { metalness: 0.4 }), 0.62, 1.07, 1.55);
      const lid = k.box(0.72, 0.46, 0.03, 0x3a3a3a, { metalness: 0.4 });
      lid.rotation.x = -0.3;
      lid.position.set(0.62, 1.3, 1.75);
      k.root.add(lid);

      // 焙籠溫控器
      k.add(k.box(0.55, 0.4, 0.3, 0x6b5a3a, { metalness: 0.5, roughness: 0.7 }), -3.6, 0.7, -1.6);
      k.add(k.cyl(0.12, 0.12, 0.02, 16, 0xc9a24a, { metalness: 0.7 }), -3.6, 0.7, -1.44).rotation.x = Math.PI / 2;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        k.add(k.box(0.012, 0.09, 0.01, 0x2f2418), -3.6 + Math.cos(a) * 0.17, 0.7 + Math.sin(a) * 0.17, -1.43);
      }
      // 焙籠
      k.add(k.cyl(0.42, 0.45, 0.5, 16, 0x8a6a3a, { roughness: 0.9 }), -3.6, 0.25, -1.6);

      // 雨後的紅磚巷
      for (let i = 0; i < 12; i++) {
        k.add(k.box(0.9, 0.06, 0.45, i % 2 ? 0x7a4034 : 0x6b3a30, { roughness: 1 }),
          -5.4 + (i % 4) * 1.0, 0.03, 3.6 + Math.floor(i / 4) * 0.5);
      }
    },
    nodes: [
      {
        p: [0, 1.5, 1.2],
        title: '兩只茶杯',
        quote: '「泡茶的人要懂茶，也要懂人。」',
        note: '桌上永遠擺兩個杯子——即使其中一個座位是空的。',
      },
      {
        p: [-0.75, 1.25, 0.95],
        title: '茶湯',
        quote: '「茶涼了要重溫。」',
        note: '阿嬤留在筆電蓋上的那行字，是整帖最短的說明書。',
      },
      {
        p: [-3.6, 1.0, -1.4],
        title: '焙籠溫控器',
        quote: '「那台比他年紀還大的焙籠溫控器，銅鏽斑駁。」',
        note: '轉盤上的刻度磨到快看不清，手感卻還在手指裡。',
      },
      {
        p: [0.62, 1.45, 1.6],
        title: '鏡頭對著茶桌',
        quote: '「他怕正臉對鏡頭會緊張，就把鏡頭轉向泡茶桌。」',
        note: '不想被看見的人，把整座茶鄉推到了鏡頭前。',
      },
    ],
  },

  /* 10 */
  {
    id: 's10',
    no: '第 10 帖',
    title: '傳缽之夜',
    place: '北部校園・校史室',
    accent: '#ffcb7a',
    sky: [0x0f1116, 0x2e3640],
    fog: 0x14181e,
    fogDensity: 0.024,
    ground: 0x2a2118,
    groundRadius: 40,
    sunColor: 0x8fa2b4,
    sun: 0.35,
    sunPos: [5, 9, 6],
    hemi: 0.55,
    ambient: 0xffc07a,
    ambientIntensity: 0.14,
    camera: { radius: 14.5, theta: 0.35, phi: 1.02, target: [0, 1.7, -0.5] },
    nodeColor: 0xffcf8a,
    particles: {
      rain: 2200,
      rainColor: 0x9fb4c4,
      rainOpts: { area: 38, height: 20, speed: 28, slant: 2.4, opacity: 0.32 },
      motes: 45,
      motesColor: 0xffd9a0,
      motesOpts: { spread: 7, baseY: 1.4, amp: 2.2, size: 0.07, opacity: 0.4 },
    },
    build(k) {
      // 木地板
      for (let i = 0; i < 9; i++) {
        k.add(k.box(16, 0.04, 0.95, i % 2 ? 0x4a3524 : 0x533c28, { roughness: 0.95 }), 0, 0.02, -4 + i * 0.96);
      }
      // 牆與窗
      k.add(k.box(16, 3.8, 0.2, 0x2c2a26), 0, 2.0, -5.6);
      for (let i = -1; i <= 1; i++) {
        k.add(k.box(2.4, 2.6, 0.05, 0x3c4a56, {
          emissive: 0x2a3a48, emissiveIntensity: 0.4, transparent: true, opacity: 0.8,
        }), i * 3.6, 2.2, -5.5);
      }

      // 長桌
      k.add(k.box(6.4, 0.16, 2.2, 0x5a4128, { roughness: 0.85 }), 0, 1.0, 0);
      for (const [dx, dz] of [[-2.8, -0.9], [2.8, -0.9], [-2.8, 0.9], [2.8, 0.9]]) {
        k.add(k.box(0.14, 1.0, 0.14, 0x3d2c1c), dx, 0.5, dz);
      }
      // 桌布
      k.add(k.box(6.6, 0.03, 2.4, 0x6b5a44, { roughness: 1 }), 0, 1.09, 0);

      // 藍鵝在桌上
      Props.macMini(k, { x: 0, y: 1.19, z: 0, old: true, glow: 0xffb060 });
      // 捲好的電源線
      const coil = k.torus(0.3, 0.035, 0x1e1e1e, { roughness: 0.8 });
      coil.rotation.x = Math.PI / 2;
      coil.position.set(0.85, 1.14, 0.25);
      k.root.add(coil);

      // 七張椅子
      const seatAngles = [-2.6, -1.75, -0.9, 0, 0.9, 1.75, 2.6];
      for (const x of seatAngles) {
        Props.chair(k, { x, z: 2.2, rot: Math.PI });
        Props.chair(k, { x, z: -2.2, rot: 0, color: 0x6f5539 });
      }

      // 蠟燭
      Props.candle(k, { x: -1.6, y: 1.11, z: -0.5, h: 0.5 });
      Props.candle(k, { x: -0.9, y: 1.11, z: 0.55, h: 0.34 });
      Props.candle(k, { x: 1.5, y: 1.11, z: -0.45, h: 0.62 });
      Props.candle(k, { x: 2.1, y: 1.11, z: 0.5, h: 0.28 });

      // 露營燈
      const lampG = new THREE.Group();
      lampG.add(k.cyl(0.28, 0.3, 0.3, 10, 0x6b6a60, { metalness: 0.5 }));
      const lens = k.cyl(0.17, 0.17, 0.34, 10, 0xfff0cc, { emissive: 0xffd9a0, emissiveIntensity: 3.2 });
      lens.position.y = 0.3;
      lampG.add(lens);
      const lg = k.glow(0xffe0b0, 3.2, 0.75);
      lg.position.y = 0.32;
      lampG.add(lg);
      lampG.position.set(-2.6, 1.18, 0.1);
      k.root.add(lampG);

      // 獎盃櫃
      k.add(k.box(4.2, 2.6, 0.7, 0x3a3026, { roughness: 0.9 }), 4.6, 1.3, -5.0);
      for (let s = 0; s < 3; s++) {
        k.add(k.box(4.0, 0.06, 0.66, 0x4a3e30), 4.6, 0.6 + s * 0.75, -5.0);
        for (let i = 0; i < 5; i++) {
          const cup = k.cyl(0.09, 0.13, 0.3, 10, 0xd8b45a, { metalness: 0.8, roughness: 0.3 });
          cup.position.set(3.4 + i * 0.62, 0.78 + s * 0.75, -4.95);
          k.root.add(cup);
          const gl = k.glow(0xffd98a, 0.5, 0.18);
          gl.position.set(3.4 + i * 0.62, 0.85 + s * 0.75, -4.7);
          k.root.add(gl);
        }
      }
    },
    nodes: [
      {
        p: [0, 1.5, 0],
        title: '桌上的藍鵝',
        quote: '「桌上坐著藍鵝，銀色機身，拔了電源線，電源線捲好放在旁邊，像一條睡著的蛇。」',
        note: '它在等一個新的電源，也在等一個新的人。',
      },
      {
        p: [-1.6, 1.55, -0.5],
        title: '第三根蠟燭',
        quote: '「Cy老師點亮第三根蠟燭才開口。」',
        note: '第一根照亮桌子，第二根照亮臉，第三根才照亮要說的話。',
      },
      {
        p: [2.4, 1.9, 2.2],
        title: '七張椅子',
        quote: '「七個入選者冒雨報到時，每個人都濕了一半。」',
        note: '濕了一半的人，剛好還有一半是乾的，可以留給別人。',
      },
      {
        p: [4.6, 1.9, -4.6],
        title: '獎盃櫃',
        quote: '「一整排獎盃在櫃子裡反著燭光。」',
        note: '校史室的獎盃都是過去的；今晚要傳的，是還沒有名字的那一座。',
      },
    ],
  },
];

export const WORLD_BY_ID = Object.fromEntries(WORLDS.map((w, i) => [w.id, { ...w, index: i }]));
