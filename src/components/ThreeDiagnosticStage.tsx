import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  ChevronDown,
  ChevronUp,
  Cpu,
  Grid,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  STAGE_PRESETS,
  ThreeStagePresetId,
} from '../utils/quickDeskHelpers';

interface ThreeDiagnosticStageProps {
  presetId: ThreeStagePresetId;
  morphKey: string;
  categoryLabel: string;
  title: string;
  subtitleMeta?: string;
}

const IS_SOFTWARE_GL = (() => {
  if (typeof document === 'undefined') return true;
  try {
    const probeCanvas = document.createElement('canvas');
    const gl =
      probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
})();

function createBrushedBumpTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 128; y += 2) {
    const shade = 112 + ((y * 17) % 32);
    ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
    ctx.fillRect(0, y, 128, 1);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 62);
  grad.addColorStop(0, 'rgba(39, 211, 240, 0.36)');
  grad.addColorStop(0.45, 'rgba(139, 108, 255, 0.16)');
  grad.addColorStop(1, 'rgba(6, 7, 13, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function disposeObject3D(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => m.dispose());
      } else {
        mesh.material.dispose();
      }
    }
  });
}

function buildPresetAssembly(
  presetId: ThreeStagePresetId,
  bumpMap: THREE.CanvasTexture | null,
  showWireframe: boolean
): { group: THREE.Group; wireShell: THREE.Mesh } {
  const preset = STAGE_PRESETS[presetId] || STAGE_PRESETS.network;
  const group = new THREE.Group();

  // Varied PBR materials (>= 0.25 roughness delta across parts)
  const hullMat = new THREE.MeshStandardMaterial({
    color: preset.primaryColor,
    metalness: 0.72,
    roughness: 0.52,
    bumpMap,
    bumpScale: 0.015,
  });

  const trimMat = new THREE.MeshStandardMaterial({
    color: preset.secondaryColor,
    metalness: 0.92,
    roughness: 0.16,
  });

  const housingMat = new THREE.MeshStandardMaterial({
    color: 0x15192c,
    metalness: 0.35,
    roughness: 0.82,
  });

  const nodeMat = new THREE.MeshStandardMaterial({
    color: preset.accentColor,
    emissive: preset.accentColor,
    emissiveIntensity: 0.38,
    metalness: 0.5,
    roughness: 0.2,
  });

  let shellGeo: THREE.BufferGeometry;

  switch (presetId) {
    case 'network': {
      // 1. Primary: Torus relay core
      const torus = new THREE.Mesh(
        new THREE.TorusGeometry(0.95, 0.24, 20, 48),
        hullMat
      );
      group.add(torus);
      // 2. Secondary: Central sphere hub + cross orbital ring
      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.46, 1),
        trimMat
      );
      group.add(core);
      const orbitRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.22, 0.045, 12, 48),
        trimMat
      );
      orbitRing.rotation.x = Math.PI / 2.4;
      group.add(orbitRing);
      // 3. Accent: 4 packet transceiver nodes
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const collar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, 0.22, 12),
          housingMat
        );
        collar.position.set(Math.cos(angle) * 0.95, Math.sin(angle) * 0.95, 0);
        collar.rotation.z = angle;
        group.add(collar);

        const beacon = new THREE.Mesh(
          new THREE.SphereGeometry(0.11, 16, 16),
          nodeMat
        );
        beacon.position.set(Math.cos(angle) * 1.22, 0, Math.sin(angle) * 1.22);
        group.add(beacon);
      }
      shellGeo = new THREE.IcosahedronGeometry(1.52, 1);
      break;
    }

    case 'windows': {
      // 1. Primary: 4-pane modular OS kernel tiles
      const offsets = [
        [-0.44, 0.44],
        [0.44, 0.44],
        [-0.44, -0.44],
        [0.44, -0.44],
      ];
      offsets.forEach(([ox, oy], idx) => {
        const tile = new THREE.Mesh(
          new THREE.BoxGeometry(0.74, 0.74, 0.28),
          idx % 2 === 0 ? hullMat : trimMat
        );
        tile.position.set(ox, oy, 0);
        group.add(tile);
      });
      // 2. Secondary: Backplane chassis frame
      const backplane = new THREE.Mesh(
        new THREE.BoxGeometry(1.42, 1.42, 0.12),
        housingMat
      );
      backplane.position.z = -0.18;
      group.add(backplane);
      // 3. Accent: Central bus bridge
      const bridge = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.28, 0),
        nodeMat
      );
      bridge.position.z = 0.22;
      group.add(bridge);
      shellGeo = new THREE.BoxGeometry(1.95, 1.95, 1.95);
      break;
    }

    case 'hardware': {
      // 1. Primary: Processor package substrate & IHS lid
      const substrate = new THREE.Mesh(
        new THREE.BoxGeometry(1.55, 0.18, 1.55),
        housingMat
      );
      substrate.position.y = -0.25;
      group.add(substrate);

      const ihs = new THREE.Mesh(
        new THREE.BoxGeometry(1.18, 0.24, 1.18),
        hullMat
      );
      ihs.position.y = -0.04;
      group.add(ihs);

      // 2. Secondary: 5 anodized cooling fins
      for (let i = -2; i <= 2; i++) {
        const fin = new THREE.Mesh(
          new THREE.BoxGeometry(1.24, 0.46, 0.07),
          trimMat
        );
        fin.position.set(0, 0.34, i * 0.24);
        group.add(fin);
      }

      // 3. Accent: Copper/amber heatpipes
      for (const xOff of [-0.36, 0.36]) {
        const pipe = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.06, 1.48, 12),
          nodeMat
        );
        pipe.rotation.x = Math.PI / 2;
        pipe.position.set(xOff, 0.16, 0);
        group.add(pipe);
      }
      shellGeo = new THREE.OctahedronGeometry(1.58, 0);
      break;
    }

    case 'printer': {
      // 1. Primary: Main imaging drum cylinder
      const drum = new THREE.Mesh(
        new THREE.CylinderGeometry(0.46, 0.46, 1.65, 24),
        hullMat
      );
      drum.rotation.z = Math.PI / 2;
      group.add(drum);

      // 2. Secondary: Feed roller + side end-caps
      const roller = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 1.68, 18),
        trimMat
      );
      roller.rotation.z = Math.PI / 2;
      roller.position.set(0, -0.56, 0.24);
      group.add(roller);

      for (const xSide of [-0.88, 0.88]) {
        const cap = new THREE.Mesh(
          new THREE.CylinderGeometry(0.56, 0.56, 0.12, 16),
          housingMat
        );
        cap.rotation.z = Math.PI / 2;
        cap.position.x = xSide;
        group.add(cap);
      }

      // 3. Accent: Laser scan bar
      const laserBar = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.1, 0.14),
        nodeMat
      );
      laserBar.position.set(0, 0.66, 0);
      group.add(laserBar);
      shellGeo = new THREE.CylinderGeometry(1.25, 1.25, 1.95, 12);
      break;
    }

    case 'email': {
      // 1. Primary: Octahedral mail relay core
      const relay = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.86, 0),
        hullMat
      );
      group.add(relay);
      // 2. Secondary: Dual tilted transport rings
      const ringA = new THREE.Mesh(
        new THREE.TorusGeometry(1.18, 0.055, 14, 48),
        trimMat
      );
      ringA.rotation.set(0.7, 0.4, 0);
      group.add(ringA);

      const ringB = new THREE.Mesh(
        new THREE.TorusGeometry(1.18, 0.055, 14, 48),
        trimMat
      );
      ringB.rotation.set(-0.7, -0.4, 0);
      group.add(ringB);

      // 3. Accent: 4 envelope/DKIM verification beacons
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 + Math.PI / 4;
        const node = new THREE.Mesh(
          new THREE.BoxGeometry(0.18, 0.18, 0.18),
          nodeMat
        );
        node.position.set(Math.cos(a) * 1.18, Math.sin(a) * 0.65, 0);
        group.add(node);
      }
      shellGeo = new THREE.DodecahedronGeometry(1.52, 0);
      break;
    }

    case 'security': {
      // 1. Primary: Armored dodecahedron vault core
      const vault = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.82, 0),
        hullMat
      );
      group.add(vault);
      // 2. Secondary: Hexagonal perimeter shield collar
      const shield = new THREE.Mesh(
        new THREE.TorusGeometry(1.15, 0.11, 6, 6),
        trimMat
      );
      group.add(shield);

      const innerLock = new THREE.Mesh(
        new THREE.CylinderGeometry(0.96, 0.96, 0.14, 6),
        housingMat
      );
      innerLock.rotation.x = Math.PI / 2;
      innerLock.position.z = -0.16;
      group.add(innerLock);

      // 3. Accent: 3 zero-trust sentinel nodes
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI * 2) / 3;
        const sentinel = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.16, 0),
          nodeMat
        );
        sentinel.position.set(Math.cos(a) * 1.18, Math.sin(a) * 1.18, 0.16);
        group.add(sentinel);
      }
      shellGeo = new THREE.OctahedronGeometry(1.58, 0);
      break;
    }

    case 'software': {
      // 1. Primary & Secondary: 3-layer isometric software architecture stack
      const layers = [-0.46, 0, 0.46];
      layers.forEach((yPos, i) => {
        const slab = new THREE.Mesh(
          new THREE.CylinderGeometry(0.88 - i * 0.08, 0.88 - i * 0.08, 0.22, 6),
          i === 1 ? trimMat : hullMat
        );
        slab.position.y = yPos;
        group.add(slab);
      });
      // Spine column
      const spine = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 1.35, 12),
        housingMat
      );
      group.add(spine);
      // 3. Accent: Top API crown beacon
      const crown = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 16, 16),
        nodeMat
      );
      crown.position.y = 0.82;
      group.add(crown);
      shellGeo = new THREE.IcosahedronGeometry(1.52, 0);
      break;
    }

    case 'server': {
      // 1. Primary: 3 stacked 1U enterprise rack server blades
      const bladeYs = [-0.48, 0, 0.48];
      bladeYs.forEach((yPos, idx) => {
        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(1.48, 0.28, 1.08),
          idx === 1 ? trimMat : hullMat
        );
        blade.position.y = yPos;
        group.add(blade);

        // Accent drive bay LED bar on front of each blade
        const led = new THREE.Mesh(
          new THREE.BoxGeometry(0.32, 0.07, 0.06),
          nodeMat
        );
        led.position.set(0.46, yPos, 0.56);
        group.add(led);
      });

      // 2. Secondary: Vertical rack rails
      for (const xRail of [-0.8, 0.8]) {
        const rail = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 1.42, 1.14),
          housingMat
        );
        rail.position.x = xRail;
        group.add(rail);
      }
      shellGeo = new THREE.BoxGeometry(2.0, 1.85, 1.65);
      break;
    }

    case 'cloud': {
      // 1. Primary: Central multi-region hub sphere
      const hub = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.68, 2),
        hullMat
      );
      group.add(hub);

      // 2. Secondary: 2 intersecting orbital VNets
      const vnet1 = new THREE.Mesh(
        new THREE.TorusGeometry(1.16, 0.05, 12, 48),
        trimMat
      );
      vnet1.rotation.x = Math.PI / 3;
      group.add(vnet1);

      const vnet2 = new THREE.Mesh(
        new THREE.TorusGeometry(1.16, 0.05, 12, 48),
        trimMat
      );
      vnet2.rotation.y = Math.PI / 3;
      group.add(vnet2);

      // 3. Accent: 5 edge availability-zone nodes
      for (let i = 0; i < 5; i++) {
        const phi = (i * Math.PI * 2) / 5;
        const satHousing = new THREE.Mesh(
          new THREE.CylinderGeometry(0.14, 0.14, 0.1, 12),
          housingMat
        );
        satHousing.position.set(
          Math.cos(phi) * 1.15,
          Math.sin(phi * 2) * 0.35,
          Math.sin(phi) * 1.15
        );
        group.add(satHousing);

        const satCore = new THREE.Mesh(
          new THREE.SphereGeometry(0.11, 14, 14),
          nodeMat
        );
        satCore.position.copy(satHousing.position);
        group.add(satCore);
      }
      shellGeo = new THREE.IcosahedronGeometry(1.56, 1);
      break;
    }

    case 'ai':
    default: {
      // 1. Primary: TorusKnot neural synthesizer (honoring original prototype G[0])
      const knot = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.78, 0.24, 96, 16),
        hullMat
      );
      group.add(knot);

      // 2. Secondary: Outer precision gyro ring
      const gyro = new THREE.Mesh(
        new THREE.TorusGeometry(1.28, 0.045, 14, 52),
        trimMat
      );
      gyro.rotation.x = Math.PI / 2.8;
      group.add(gyro);

      // 3. Accent: Central luminescence core + 3 orbital synapses
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.26, 16, 16),
        nodeMat
      );
      group.add(core);

      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI * 2) / 3;
        const syn = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.13, 0),
          nodeMat
        );
        syn.position.set(Math.cos(a) * 1.28, 0, Math.sin(a) * 1.28);
        group.add(syn);
      }
      shellGeo = new THREE.IcosahedronGeometry(1.58, 1);
      break;
    }
  }

  const wireShell = new THREE.Mesh(
    shellGeo,
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    })
  );
  wireShell.visible = showWireframe;

  return { group, wireShell };
}

export const ThreeDiagnosticStage: React.FC<ThreeDiagnosticStageProps> = ({
  presetId,
  morphKey,
  categoryLabel,
  title,
  subtitleMeta,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  const [webglAvailable, setWebglAvailable] = useState(true);
  const [autoRotate, setAutoRotate] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [showWireframe, setShowWireframe] = useState(true);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);

  const autoRotateRef = useRef(autoRotate);
  const showWireframeRef = useRef(showWireframe);
  const pointerRef = useRef({ mx: 0, my: 0 });
  const resetSignalRef = useRef(false);

  const sceneApiRef = useRef<{
    rebuildAssembly: (nextPreset: ThreeStagePresetId) => void;
    setWireframeVisible: (v: boolean) => void;
    wakeLoop: () => void;
  } | null>(null);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
    sceneApiRef.current?.wakeLoop();
  }, [autoRotate]);

  useEffect(() => {
    showWireframeRef.current = showWireframe;
    sceneApiRef.current?.setWireframeVisible(showWireframe);
    sceneApiRef.current?.wakeLoop();
  }, [showWireframe]);

  // Mount WebGLRenderer & Scene once per lifecycle
  useEffect(() => {
    const mountEl = canvasMountRef.current;
    if (!mountEl) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !IS_SOFTWARE_GL,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglAvailable(false);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(
      IS_SOFTWARE_GL ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    );

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    mountEl.innerHTML = '';
    mountEl.appendChild(canvas);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x090b18, 0.048);

    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
    camera.position.set(0, 0.25, 4.9);
    camera.lookAt(0, -0.1, 0);

    // Studio IBL Reflection Environment (RoomEnvironment)
    let envRenderTarget: THREE.WebGLRenderTarget | null = null;
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      envRenderTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
      scene.environment = envRenderTarget.texture;
      pmremGenerator.dispose();
    } catch {
      // Fallback gracefully if PMREM fails
    }

    // Warm/Cool Studio Lighting + Brand Accent Point Lights
    const hemiLight = new THREE.HemisphereLight(0x88b4ff, 0x101325, 0.95);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff2dd, 2.1);
    keyLight.position.set(5, 6, 5);
    scene.add(keyLight);

    const cyanLight = new THREE.PointLight(0x27d3f0, 2.3, 20);
    cyanLight.position.set(4, 3, 4);
    scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0x8b6cff, 2.3, 20);
    purpleLight.position.set(-4, -2, 3.5);
    scene.add(purpleLight);

    // Grounded Contact Shadow / Glow Disc
    const shadowTex = createContactShadowTexture();
    const shadowDisc = new THREE.Mesh(
      new THREE.CircleGeometry(1.9, 32),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      })
    );
    shadowDisc.rotation.x = -Math.PI / 2;
    shadowDisc.position.y = -1.58;
    scene.add(shadowDisc);

    // 360 Cyan Starfield Particles
    const particleCount = 360;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      particlePositions[i] = (Math.random() - 0.5) * 14;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(particlePositions, 3)
    );
    const particleMat = new THREE.PointsMaterial({
      size: 0.035,
      color: 0x27d3f0,
      transparent: true,
      opacity: 0.75,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    const bumpMap = createBrushedBumpTexture();
    if (bumpMap) {
      bumpMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
    }

    // Hero Assembly Holder
    const stageAnchor = new THREE.Group();
    stageAnchor.position.y = 0.14;
    scene.add(stageAnchor);

    let currentGroup: THREE.Group | null = null;
    let currentWire: THREE.Mesh | null = null;
    let scaleCurrent = 1.0;

    const rebuildAssembly = (
      targetPreset: ThreeStagePresetId,
      initialScale = 0.45
    ) => {
      if (currentGroup) {
        stageAnchor.remove(currentGroup);
        disposeObject3D(currentGroup);
      }
      if (currentWire) {
        stageAnchor.remove(currentWire);
        disposeObject3D(currentWire);
      }

      const built = buildPresetAssembly(
        targetPreset,
        bumpMap,
        showWireframeRef.current
      );
      currentGroup = built.group;
      currentWire = built.wireShell;
      currentGroup.scale.setScalar(initialScale);
      currentWire.scale.setScalar(initialScale * 1.06);

      stageAnchor.add(currentGroup);
      stageAnchor.add(currentWire);
      scaleCurrent = initialScale;
    };

    rebuildAssembly(presetId, 1.0);

    if (!IS_SOFTWARE_GL) {
      renderer.compile(scene, camera);
    }

    const updateSize = () => {
      const w = Math.max(1, mountEl.clientWidth);
      const h = Math.max(1, mountEl.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    updateSize();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            updateSize();
            wakeLoop();
          })
        : null;
    resizeObserver?.observe(mountEl);
    window.addEventListener('resize', updateSize);

    // Software-WebGL Safe Loop Pacing (afterDraw with WebGL2 fenceSync + 80ms pause)
    let disposed = false;
    let rafId = 0;
    let timerId = 0;
    let loopActive = false;
    let lastTime = performance.now();

    const afterDraw = (cb: () => void) => {
      if (disposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) {
            if (sync) gl.deleteSync(sync);
            return;
          }
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            timerId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            timerId = window.setTimeout(cb, 80);
          }
        };
        timerId = window.setTimeout(poll, 5);
      } else {
        timerId = window.setTimeout(cb, 90);
      }
    };

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min(0.14, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      if (resetSignalRef.current && currentGroup && currentWire) {
        currentGroup.rotation.set(0, 0, 0);
        currentWire.rotation.set(0, 0, 0);
        pointerRef.current.mx = 0;
        pointerRef.current.my = 0;
        resetSignalRef.current = false;
      }

      scaleCurrent = THREE.MathUtils.damp(scaleCurrent, 1.0, 14, dt);

      if (currentGroup && currentWire) {
        currentGroup.scale.setScalar(scaleCurrent);
        currentWire.scale.setScalar(scaleCurrent * 1.06);

        const spinSpeed = autoRotateRef.current ? 0.55 : 0;
        const targetTiltX = pointerRef.current.my * 0.45;
        const targetTiltZ = -pointerRef.current.mx * 0.25;

        currentGroup.rotation.y +=
          spinSpeed * dt + pointerRef.current.mx * 0.65 * dt;
        currentGroup.rotation.x = THREE.MathUtils.damp(
          currentGroup.rotation.x,
          targetTiltX + (autoRotateRef.current ? Math.sin(now * 0.0007) * 0.16 : 0),
          5,
          dt
        );
        currentGroup.rotation.z = THREE.MathUtils.damp(
          currentGroup.rotation.z,
          targetTiltZ,
          5,
          dt
        );
        currentWire.rotation.copy(currentGroup.rotation);

        const bobY = autoRotateRef.current ? Math.sin(now * 0.0014) * 0.09 : 0;
        currentGroup.position.y = bobY;
        currentWire.position.y = bobY;
      }

      if (autoRotateRef.current) {
        particles.rotation.y += 0.06 * dt;
      }

      renderer.render(scene, camera);

      const stillSettling = Math.abs(1.0 - scaleCurrent) > 0.004;
      if (autoRotateRef.current || stillSettling) {
        if (IS_SOFTWARE_GL) {
          afterDraw(tick);
        } else {
          rafId = window.requestAnimationFrame(tick);
        }
      } else {
        loopActive = false;
      }
    };

    const wakeLoop = () => {
      if (disposed || loopActive) return;
      loopActive = true;
      lastTime = performance.now();
      rafId = window.requestAnimationFrame(tick);
    };

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglAvailable(false);
    };
    const onContextRestored = () => {
      setWebglAvailable(true);
      wakeLoop();
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    sceneApiRef.current = {
      rebuildAssembly: (nextPreset: ThreeStagePresetId) => {
        rebuildAssembly(nextPreset);
        wakeLoop();
      },
      setWireframeVisible: (v: boolean) => {
        if (currentWire) currentWire.visible = v;
      },
      wakeLoop,
    };

    wakeLoop();

    return () => {
      disposed = true;
      loopActive = false;
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timerId);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateSize);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);

      if (currentGroup) disposeObject3D(currentGroup);
      if (currentWire) disposeObject3D(currentWire);
      disposeObject3D(shadowDisc);
      particleGeo.dispose();
      particleMat.dispose();
      bumpMap?.dispose();
      shadowTex?.dispose();
      envRenderTarget?.dispose();
      renderer.dispose();
      sceneApiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Morph assembly smoothly when presetId or morphKey changes
  const isFirstMorph = useRef(true);
  useEffect(() => {
    if (isFirstMorph.current) {
      isFirstMorph.current = false;
      return;
    }
    sceneApiRef.current?.rebuildAssembly(presetId);
  }, [presetId, morphKey]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;
    pointerRef.current.mx = (e.clientX - rect.left) / rect.width - 0.5;
    pointerRef.current.my = (e.clientY - rect.top) / rect.height - 0.5;
    if (!autoRotateRef.current) {
      sceneApiRef.current?.wakeLoop();
    }
  };

  const handleResetView = () => {
    resetSignalRef.current = true;
    sceneApiRef.current?.wakeLoop();
  };

  const activePreset = STAGE_PRESETS[presetId] || STAGE_PRESETS.network;

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      data-testid="three-diagnostic-stage"
      data-preset={presetId}
      className="relative h-[230px] sm:h-[300px] w-full overflow-hidden border-b border-[#1c233a] bg-[radial-gradient(circle_at_50%_38%,#1b1840_0%,#090b16_62%,#06070d_100%)] select-none"
    >
      {/* Dedicated Empty WebGL Mount Container */}
      {webglAvailable ? (
        <div
          ref={canvasMountRef}
          className="h-full w-full"
          aria-hidden="true"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <Cpu className="h-10 w-10 text-[#27d3f0]" />
            <span className="text-xs font-medium">{activePreset.label}</span>
          </div>
        </div>
      )}

      {/* Measured Bottom Scrim for WCAG AA Headline Contrast */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#06070d] via-[#06070d]/65 to-transparent"
      />

      {/* Minimal Top-Left 3D Assembly Spec Label */}
      <div className="pointer-events-none absolute left-5 top-3.5 z-10 text-[11px] font-medium text-slate-400">
        <span>3D Model: {activePreset.label}</span>
      </div>

      {/* Collapsible Compact Control Dock (Solid dark surface — zero backdrop-filter over WebGL) */}
      <div className="absolute right-4 top-3 z-20 flex flex-col items-end gap-1.5">
        <button
          type="button"
          onClick={() => setControlsCollapsed((prev) => !prev)}
          aria-expanded={!controlsCollapsed}
          aria-label={controlsCollapsed ? 'Show 3D stage controls' : 'Hide 3D stage controls'}
          className="inline-flex items-center gap-1 rounded-lg border border-[#242d4a] bg-[#0a0d18] px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:border-[#27d3f0] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
        >
          <span>3D View</span>
          {controlsCollapsed ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronUp className="h-3.5 w-3.5" />
          )}
        </button>

        {!controlsCollapsed && (
          <div
            role="toolbar"
            aria-label="3D Diagnostic Stage Controls"
            className="flex items-center gap-1 rounded-lg border border-[#242d4a] bg-[#0a0d18] p-1 shadow-lg"
          >
            <button
              type="button"
              onClick={() => setAutoRotate((prev) => !prev)}
              aria-label={autoRotate ? 'Pause 3D rotation' : 'Resume 3D rotation'}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-slate-200 hover:bg-[#151827] hover:text-[#27d3f0] transition-colors cursor-pointer whitespace-nowrap"
            >
              {autoRotate ? (
                <>
                  <Pause className="h-3 w-3 text-[#27d3f0]" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 text-[#27d3f0]" />
                  <span>Rotate</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowWireframe((prev) => !prev)}
              aria-pressed={showWireframe}
              aria-label="Toggle outer wireframe lattice"
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                showWireframe
                  ? 'bg-[#151827] text-[#27d3f0]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="h-3 w-3" />
              <span>Lattice</span>
            </button>

            <button
              type="button"
              onClick={handleResetView}
              aria-label="Reset 3D orientation"
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-slate-300 hover:bg-[#151827] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom-Left Semantic DOM Header Overlay (matching #hd in reference) */}
      <div className="pointer-events-none absolute inset-x-5 sm:inset-x-7 bottom-4 z-10">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-[13px] font-medium text-[#27d3f0]">
          <span>{categoryLabel}</span>
          {subtitleMeta && (
            <>
              <span aria-hidden="true" className="text-slate-500">
                ·
              </span>
              <span className="text-slate-300 font-normal">{subtitleMeta}</span>
            </>
          )}
        </div>
        <h2 className="mt-1 font-['Sora',sans-serif] text-lg sm:text-2xl font-bold text-[#e9ebf7] leading-snug line-clamp-2 max-w-3xl">
          {title}
        </h2>
      </div>
    </div>
  );
};
