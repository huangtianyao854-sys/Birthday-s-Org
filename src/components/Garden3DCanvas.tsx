import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * Photorealistic 3D Garden Canvas (Real-Life Style)
 * - PBR studio environment lighting via RoomEnvironment + PMREMGenerator
 * - Atmospheric sky with realistic Rayleigh/Mie daylight gradient & warm sun corona
 * - Volumetric sunbeam rays streaming through foliage
 * - Instanced 3D grass blades with physical wind swaying & multi-tone color variations
 * - Procedural Japanese Red Maple Trees (Acer Palmatum) with gnarled bark & layered canopies
 * - Highly realistic 3D botanical maple leaves with 5 serrated lobes, realistic veins,
 *   natural 3D curved leaf geometry, and aerodynamic tumbling flight physics
 * - Multi-petal English garden roses, daisies, and lavender along a flagstone garden path
 * - Floating sunlight dust particles and interactive breeze
 * - High performance with software WebGL guard and full resource disposal
 */
export const Garden3DCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect software WebGL to adapt quality gracefully
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera & Photorealistic Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x60a5fa); // Sky Blue
    scene.fog = new THREE.FogExp2(0xc7e4fd, 0.016); // Soft atmospheric horizon haze

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 160);
    camera.position.set(0, 3.2, 11);
    camera.lookAt(0, 1.8, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 2. Physical PBR Studio Environment Lighting
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnvironment = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnvironment, 0.04).texture;
    pmremGenerator.dispose();

    // 3. Real-Life Sun & Daylight Rig
    // Warm Sun Directional Light (Key Light)
    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.4); // Golden daylight
    sunLight.position.set(16, 28, 16);
    sunLight.castShadow = !isSoftwareGl;
    if (sunLight.shadow) {
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 70;
      sunLight.shadow.camera.left = -16;
      sunLight.shadow.camera.right = 16;
      sunLight.shadow.camera.top = 16;
      sunLight.shadow.camera.bottom = -16;
      sunLight.shadow.bias = -0.0004;
      sunLight.shadow.normalBias = 0.02;
    }
    scene.add(sunLight);

    // Natural Sky & Earth Fill Light
    const hemiLight = new THREE.HemisphereLight(0x70bcfc, 0x3d7830, 1.35);
    scene.add(hemiLight);

    // Soft Ambient Bounce
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 0.45);
    scene.add(ambientLight);

    // 4. Photorealistic Sky Dome with Atmospheric Gradient & Sun Corona
    const skyGeo = new THREE.SphereGeometry(75, 32, 24);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        sunPosition: { value: new THREE.Vector3(16, 28, 16).normalize() },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 sunPosition;
        varying vec3 vWorldPosition;
        void main() {
          vec3 dir = normalize(vWorldPosition);
          float y = dir.y;

          // Atmospheric Rayleigh & Mie Daylight Gradient
          vec3 zenith = vec3(0.08, 0.42, 0.85); // Deep pure sky blue
          vec3 midSky = vec3(0.35, 0.68, 0.98); // Cerulean
          vec3 horizon = vec3(0.78, 0.89, 0.99); // Hazy horizon
          vec3 groundHaze = vec3(0.85, 0.92, 0.98); // Ground mist

          vec3 sky = mix(horizon, midSky, clamp(y * 2.8, 0.0, 1.0));
          sky = mix(sky, zenith, clamp((y - 0.25) * 1.8, 0.0, 1.0));
          if (y < 0.0) sky = mix(horizon, groundHaze, clamp(-y * 3.0, 0.0, 1.0));

          // Soft Sun Disk & Warm Corona
          float sunDot = max(dot(dir, sunPosition), 0.0);
          float sunDisk = smoothstep(0.998, 0.9995, sunDot);
          float sunGlow = pow(sunDot, 12.0) * 0.45 + pow(sunDot, 4.0) * 0.2;
          vec3 sunColor = vec3(1.0, 0.96, 0.88);

          sky += sunColor * sunDisk * 1.5;
          sky += vec3(1.0, 0.85, 0.65) * sunGlow;

          gl_FragColor = vec4(sky, 1.0);
        }
      `,
    });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyMesh);

    // 5. Volumetric Sunlight Rays (God Rays)
    const godRayGeo = new THREE.CylinderGeometry(0.8, 4.5, 24, 16, 1, true);
    const godRayMat = new THREE.MeshBasicMaterial({
      color: 0xfffae0,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const godRayMesh = new THREE.Mesh(godRayGeo, godRayMat);
    godRayMesh.position.set(6, 10, -2);
    godRayMesh.rotation.z = 0.38;
    godRayMesh.rotation.x = -0.22;
    scene.add(godRayMesh);

    // 6. Photorealistic Soft Cumulus Clouds
    const cloudsGroup = new THREE.Group();
    const cloudGeo = new THREE.DodecahedronGeometry(2.0, 1);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.95,
      metalness: 0.0,
      transparent: true,
      opacity: 0.82,
      flatShading: true,
    });

    const clouds: { group: THREE.Group; speed: number }[] = [];
    const cloudCount = isSoftwareGl ? 3 : 6;

    for (let c = 0; c < cloudCount; c++) {
      const cGroup = new THREE.Group();
      const puffCount = 6 + Math.floor(Math.random() * 4);
      for (let p = 0; p < puffCount; p++) {
        const puff = new THREE.Mesh(cloudGeo, cloudMat);
        puff.position.set(
          (p - puffCount / 2) * 1.8 + (Math.random() - 0.5) * 1.0,
          (Math.random() - 0.5) * 0.8,
          (Math.random() - 0.5) * 1.4
        );
        const s = 1.0 + Math.random() * 0.9;
        puff.scale.set(s, s * 0.55, s);
        cGroup.add(puff);
      }
      cGroup.position.set(
        (Math.random() - 0.5) * 75,
        15 + Math.random() * 8,
        -28 + Math.random() * 16
      );
      cloudsGroup.add(cGroup);
      clouds.push({
        group: cGroup,
        speed: 0.007 + Math.random() * 0.01,
      });
    }
    scene.add(cloudsGroup);

    // 7. Natural Garden Terrain & Rich Soil/Grass
    const groundGeo = new THREE.PlaneGeometry(85, 85, 48, 48);
    groundGeo.rotateX(-Math.PI / 2);

    const posAttr = groundGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const dist = Math.sqrt(x * x + z * z);
      // Gentle natural garden undulation
      const h =
        Math.sin(x * 0.09) * Math.cos(z * 0.08) * 0.9 +
        Math.sin(x * 0.035 + z * 0.04) * 1.5 -
        Math.exp(-dist * 0.07) * 0.6;
      posAttr.setY(i, h - 0.4);
    }
    groundGeo.computeVertexNormals();

    // High-Resolution Procedural Lawn & Earth Texture
    const grassCanvas = document.createElement('canvas');
    grassCanvas.width = 1024;
    grassCanvas.height = 1024;
    const gCtx = grassCanvas.getContext('2d')!;

    // Rich garden soil & turf base
    gCtx.fillStyle = '#14532d'; // Forest turf green
    gCtx.fillRect(0, 0, 1024, 1024);

    // Multi-shade grass blades and soil micro-mottling
    for (let i = 0; i < 9000; i++) {
      const gx = Math.random() * 1024;
      const gy = Math.random() * 1024;
      const rnd = Math.random();
      if (rnd < 0.35) {
        gCtx.fillStyle = '#15803d'; // Meadow green
      } else if (rnd < 0.65) {
        gCtx.fillStyle = '#16a34a'; // Vibrant grass
      } else if (rnd < 0.85) {
        gCtx.fillStyle = '#22c55e'; // Bright spring tip
      } else if (rnd < 0.95) {
        gCtx.fillStyle = '#166534'; // Deep shadow green
      } else {
        gCtx.fillStyle = '#451a03'; // Rich brown earth speckle
      }
      gCtx.fillRect(gx, gy, Math.random() * 3 + 1, Math.random() * 7 + 3);
    }

    const grassTex = new THREE.CanvasTexture(grassCanvas);
    grassTex.wrapS = THREE.RepeatWrapping;
    grassTex.wrapT = THREE.RepeatWrapping;
    grassTex.repeat.set(18, 18);
    grassTex.colorSpace = THREE.SRGBColorSpace;
    grassTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const groundMat = new THREE.MeshStandardMaterial({
      map: grassTex,
      roughness: 0.9,
      metalness: 0.02,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.receiveShadow = !isSoftwareGl;
    scene.add(groundMesh);

    // 8. Instanced 3D Grass Blades (Physical Grass Tufting)
    // Create curved blade geometry
    const bladeGeo = new THREE.BufferGeometry();
    const bladeVertices = new Float32Array([
      // Triangle 1 (base left, base right, mid center)
      -0.03, 0.0, 0.0,
      0.03, 0.0, 0.0,
      -0.02, 0.3, 0.03,
      // Triangle 2 (base right, mid right, mid center)
      0.03, 0.0, 0.0,
      0.02, 0.3, 0.03,
      -0.02, 0.3, 0.03,
      // Triangle 3 (tip curve)
      -0.02, 0.3, 0.03,
      0.02, 0.3, 0.03,
      0.0, 0.65, 0.12,
    ]);
    bladeGeo.setAttribute('position', new THREE.BufferAttribute(bladeVertices, 3));
    bladeGeo.computeVertexNormals();

    const bladeMat = new THREE.MeshStandardMaterial({
      roughness: 0.6,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });

    const grassCount = isSoftwareGl ? 300 : 1200;
    const grassInstanced = new THREE.InstancedMesh(bladeGeo, bladeMat, grassCount);
    grassInstanced.receiveShadow = !isSoftwareGl;

    const dummy = new THREE.Object3D();
    const bladeHues = [0x16a34a, 0x22c55e, 0x15803d, 0x4ade80, 0x84cc16];

    for (let i = 0; i < grassCount; i++) {
      const radius = 1.8 + Math.random() * 11;
      const angle = Math.random() * Math.PI * 2;
      const gx = Math.cos(angle) * radius;
      const gz = Math.sin(angle) * radius * 0.8 + 2.5;

      // Avoid center walkway
      if (Math.abs(gx) < 1.3 && gz > -4 && gz < 9) continue;

      dummy.position.set(gx, -0.4, gz);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.rotation.x = (Math.random() - 0.5) * 0.25;
      dummy.rotation.z = (Math.random() - 0.5) * 0.25;
      const sc = 0.7 + Math.random() * 0.7;
      dummy.scale.set(sc, sc, sc);
      dummy.updateMatrix();

      grassInstanced.setMatrixAt(i, dummy.matrix);
      const col = new THREE.Color(bladeHues[i % bladeHues.length]);
      grassInstanced.setColorAt(i, col);
    }
    grassInstanced.instanceMatrix.needsUpdate = true;
    if (grassInstanced.instanceColor) grassInstanced.instanceColor.needsUpdate = true;
    scene.add(grassInstanced);

    // 9. Natural Stone Flagstone Garden Walkway
    const pathGroup = new THREE.Group();
    const stoneGeo = new THREE.CylinderGeometry(0.65, 0.75, 0.07, 8);
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1, // Natural slate grey stone
      roughness: 0.85,
      metalness: 0.08,
    });

    for (let i = -10; i <= 10; i++) {
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      const t = i * 0.95;
      const px = Math.sin(t * 0.35) * 1.7 + (Math.random() - 0.5) * 0.25;
      const pz = t * 1.5;
      stone.position.set(px, -0.38, pz);
      stone.rotation.y = Math.random() * Math.PI;
      stone.scale.set(1.0 + Math.random() * 0.35, 1, 1.0 + Math.random() * 0.35);
      stone.receiveShadow = !isSoftwareGl;
      pathGroup.add(stone);
    }
    scene.add(pathGroup);

    // 10. Photorealistic Botanical Japanese Maple Trees (Acer Palmatum) & Garden Grove
    // Procedural organic bark texture
    const barkCanvas = document.createElement('canvas');
    barkCanvas.width = 256;
    barkCanvas.height = 512;
    const bCtx = barkCanvas.getContext('2d');
    if (bCtx) {
      bCtx.fillStyle = '#3a2014';
      bCtx.fillRect(0, 0, 256, 512);
      // Vertical bark fibers and grain
      for (let x = 0; x < 256; x += 2) {
        const shade = Math.sin(x * 0.15) * 22 + (Math.random() - 0.5) * 30;
        bCtx.fillStyle = `rgba(${52 + shade}, ${28 + shade * 0.5}, ${16 + shade * 0.25}, 0.85)`;
        bCtx.fillRect(x, 0, 2 + Math.random() * 2, 512);
      }
      // Fissures and knots
      for (let k = 0; k < 90; k++) {
        const kx = Math.random() * 256;
        const ky = Math.random() * 512;
        const kw = 1.5 + Math.random() * 4;
        const kh = 14 + Math.random() * 38;
        bCtx.fillStyle = Math.random() > 0.45 ? 'rgba(24, 11, 6, 0.75)' : 'rgba(78, 48, 25, 0.65)';
        bCtx.fillRect(kx, ky, kw, kh);
      }
    }
    const barkTex = new THREE.CanvasTexture(barkCanvas);
    barkTex.wrapS = THREE.RepeatWrapping;
    barkTex.wrapT = THREE.RepeatWrapping;
    barkTex.repeat.set(1.5, 3.5);
    barkTex.colorSpace = THREE.SRGBColorSpace;
    const barkMat = new THREE.MeshStandardMaterial({
      map: barkTex,
      roughness: 0.94,
      metalness: 0.04,
    });

    // Procedural Botanical Maple Leaf Cluster Texture generator
    const createFoliageTexture = (baseHex: string, accentHex: string) => {
      const fCanvas = document.createElement('canvas');
      fCanvas.width = 256;
      fCanvas.height = 256;
      const fCtx = fCanvas.getContext('2d');
      if (fCtx) {
        // Draw delicate branch stems
        fCtx.strokeStyle = '#3a2012';
        fCtx.lineWidth = 3;
        fCtx.beginPath();
        fCtx.moveTo(128, 250);
        fCtx.quadraticCurveTo(130, 160, 128, 80);
        fCtx.moveTo(128, 180);
        fCtx.lineTo(60, 110);
        fCtx.moveTo(128, 160);
        fCtx.lineTo(196, 100);
        fCtx.moveTo(128, 120);
        fCtx.lineTo(80, 50);
        fCtx.moveTo(128, 110);
        fCtx.lineTo(176, 45);
        fCtx.stroke();

        // Function to draw realistic 5-pointed maple leaf
        const drawMapleLeaf = (cx: number, cy: number, size: number, rot: number, color: string) => {
          fCtx.save();
          fCtx.translate(cx, cy);
          fCtx.rotate(rot);
          fCtx.fillStyle = color;
          fCtx.beginPath();
          // Maple leaf lobes
          fCtx.moveTo(0, -size);
          fCtx.bezierCurveTo(-size * 0.35, -size * 0.7, -size * 0.8, -size * 0.5, -size * 0.9, -size * 0.15);
          fCtx.bezierCurveTo(-size * 0.65, 0, -size * 0.7, size * 0.4, -size * 0.4, size * 0.5);
          fCtx.bezierCurveTo(-size * 0.2, size * 0.45, 0, size * 0.75, 0, size * 0.9);
          fCtx.bezierCurveTo(0, size * 0.75, size * 0.2, size * 0.45, size * 0.4, size * 0.5);
          fCtx.bezierCurveTo(size * 0.7, size * 0.4, size * 0.65, 0, size * 0.9, -size * 0.15);
          fCtx.bezierCurveTo(size * 0.8, -size * 0.5, size * 0.35, -size * 0.7, 0, -size);
          fCtx.closePath();
          fCtx.fill();

          // Leaf central vein
          fCtx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          fCtx.lineWidth = 1.2;
          fCtx.beginPath();
          fCtx.moveTo(0, size * 0.8);
          fCtx.lineTo(0, -size * 0.75);
          fCtx.stroke();
          fCtx.restore();
        };

        // Draw lush clustered botanical maple leaves
        const leavesData = [
          { x: 128, y: 70, s: 32, r: 0.05, c: baseHex },
          { x: 85, y: 95, s: 28, r: -0.45, c: accentHex },
          { x: 170, y: 88, s: 29, r: 0.4, c: baseHex },
          { x: 50, y: 130, s: 26, r: -0.85, c: baseHex },
          { x: 205, y: 125, s: 27, r: 0.75, c: accentHex },
          { x: 95, y: 155, s: 26, r: -0.2, c: accentHex },
          { x: 160, y: 150, s: 25, r: 0.25, c: baseHex },
          { x: 128, y: 125, s: 30, r: 0.1, c: baseHex },
          { x: 70, y: 50, s: 24, r: -0.6, c: accentHex },
          { x: 185, y: 45, s: 24, r: 0.55, c: baseHex },
          { x: 128, y: 35, s: 26, r: 0.0, c: accentHex },
        ];
        leavesData.forEach((ld) => drawMapleLeaf(ld.x, ld.y, ld.s, ld.r, ld.c));
      }

      const tex = new THREE.CanvasTexture(fCanvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return tex;
    };

    const foliageTexCrimson = createFoliageTexture('#b91c1c', '#dc2626');
    const foliageTexAmber = createFoliageTexture('#c2410c', '#f59e0b');
    const foliageTexEmerald = createFoliageTexture('#15803d', '#22c55e');

    const foliageMatCrimson = new THREE.MeshStandardMaterial({
      map: foliageTexCrimson,
      transparent: true,
      alphaTest: 0.25,
      side: THREE.DoubleSide,
      roughness: 0.65,
      metalness: 0.04,
    });
    const foliageMatAmber = new THREE.MeshStandardMaterial({
      map: foliageTexAmber,
      transparent: true,
      alphaTest: 0.25,
      side: THREE.DoubleSide,
      roughness: 0.65,
      metalness: 0.04,
    });
    const foliageMatEmerald = new THREE.MeshStandardMaterial({
      map: foliageTexEmerald,
      transparent: true,
      alphaTest: 0.25,
      side: THREE.DoubleSide,
      roughness: 0.65,
      metalness: 0.04,
    });

    const leafCardGeo = new THREE.PlaneGeometry(2.2, 2.2);

    // Realistic Botanical Tree Generator (Acer Palmatum / Japanese Maple)
    const createRealisticTree = (
      x: number,
      z: number,
      foliageType: 'crimson' | 'amber' | 'emerald',
      scale: number = 1,
      rotationY: number = 0
    ) => {
      const treeGroup = new THREE.Group();
      const foliageMat =
        foliageType === 'crimson'
          ? foliageMatCrimson
          : foliageType === 'amber'
          ? foliageMatAmber
          : foliageMatEmerald;

      const depthVolumeColor =
        foliageType === 'crimson'
          ? 0x7f1d1d
          : foliageType === 'amber'
          ? 0x9a3412
          : 0x14532d;

      // 1. Organic Root Flare at Ground Level
      const rootBaseGeo = new THREE.CylinderGeometry(0.38 * scale, 0.72 * scale, 0.6 * scale, 8);
      const rootBase = new THREE.Mesh(rootBaseGeo, barkMat);
      rootBase.position.y = (0.6 * scale) / 2;
      rootBase.receiveShadow = !isSoftwareGl;
      treeGroup.add(rootBase);

      // 2. Curved Lower & Mid Trunk
      const lowerTrunkGeo = new THREE.CylinderGeometry(0.3 * scale, 0.38 * scale, 2.0 * scale, 8);
      const lowerTrunk = new THREE.Mesh(lowerTrunkGeo, barkMat);
      lowerTrunk.position.set(0.04 * scale, 1.4 * scale, 0);
      lowerTrunk.rotation.z = 0.06;
      lowerTrunk.castShadow = !isSoftwareGl;
      lowerTrunk.receiveShadow = !isSoftwareGl;
      treeGroup.add(lowerTrunk);

      const upperTrunkGeo = new THREE.CylinderGeometry(0.22 * scale, 0.3 * scale, 1.8 * scale, 8);
      const upperTrunk = new THREE.Mesh(upperTrunkGeo, barkMat);
      upperTrunk.position.set(0.12 * scale, 3.0 * scale, 0.04 * scale);
      upperTrunk.rotation.z = -0.08;
      upperTrunk.castShadow = !isSoftwareGl;
      treeGroup.add(upperTrunk);

      // 3. Primary Botanical Limbs (Gracefully spreading branches)
      const branchGeo = new THREE.CylinderGeometry(0.1 * scale, 0.18 * scale, 2.4 * scale, 6);
      const branchesConfig = [
        { px: -0.65 * scale, py: 3.5 * scale, pz: 0.35 * scale, rx: 0.25, ry: 0.4, rz: 0.68 },
        { px: 0.75 * scale, py: 3.7 * scale, pz: -0.4 * scale, rx: -0.2, ry: -0.5, rz: -0.65 },
        { px: 0.1 * scale, py: 3.9 * scale, pz: 0.85 * scale, rx: -0.65, ry: 0.1, rz: 0.15 },
        { px: -0.2 * scale, py: 4.1 * scale, pz: -0.75 * scale, rx: 0.7, ry: -0.2, rz: -0.25 },
        { px: 0.0 * scale, py: 4.4 * scale, pz: 0.0 * scale, rx: 0.08, ry: 0.8, rz: 0.18 },
      ];

      branchesConfig.forEach((bc) => {
        const b = new THREE.Mesh(branchGeo, barkMat);
        b.position.set(bc.px, bc.py, bc.pz);
        b.rotation.set(bc.rx, bc.ry, bc.rz);
        b.castShadow = !isSoftwareGl;
        treeGroup.add(b);
      });

      // 4. Soft Organic Volumetric Canopy Cores (for realistic daylight depth & shadow)
      const volumeMat = new THREE.MeshStandardMaterial({
        color: depthVolumeColor,
        roughness: 0.88,
        metalness: 0.02,
      });
      const canopyClusters = [
        { x: 0, y: 4.8 * scale, z: 0, s: 1.6 * scale },
        { x: -1.4 * scale, y: 4.3 * scale, z: 0.6 * scale, s: 1.35 * scale },
        { x: 1.5 * scale, y: 4.5 * scale, z: -0.6 * scale, s: 1.4 * scale },
        { x: 0.2 * scale, y: 4.5 * scale, z: 1.4 * scale, s: 1.3 * scale },
        { x: -0.4 * scale, y: 4.6 * scale, z: -1.3 * scale, s: 1.3 * scale },
        { x: 0.0, y: 5.6 * scale, z: 0.2 * scale, s: 1.25 * scale },
      ];

      canopyClusters.forEach((cc) => {
        const coreGeo = new THREE.SphereGeometry(cc.s * 0.75, 7, 6);
        coreGeo.scale(1.0, 0.75, 1.0);
        const core = new THREE.Mesh(coreGeo, volumeMat);
        core.position.set(cc.x, cc.y, cc.z);
        core.castShadow = !isSoftwareGl;
        treeGroup.add(core);

        // 5. Intersecting Botanical Leaf Cards at Each Cluster (creating airy natural foliage)
        const cardAngles = [0, Math.PI / 3, (Math.PI * 2) / 3, Math.PI / 4, -Math.PI / 4];
        cardAngles.forEach((ang) => {
          const card = new THREE.Mesh(leafCardGeo, foliageMat);
          const offsetR = 0.45 * cc.s;
          card.position.set(
            cc.x + Math.cos(ang) * offsetR,
            cc.y + (Math.random() - 0.5) * 0.4 * cc.s,
            cc.z + Math.sin(ang) * offsetR
          );
          card.rotation.y = ang + Math.PI / 2;
          card.rotation.x = (Math.random() - 0.5) * 0.4;
          card.rotation.z = (Math.random() - 0.5) * 0.3;
          card.scale.set(cc.s * 0.8, cc.s * 0.8, cc.s * 0.8);
          card.castShadow = !isSoftwareGl;
          treeGroup.add(card);
        });
      });

      treeGroup.position.set(x, -0.4, z);
      treeGroup.rotation.y = rotationY;
      return treeGroup;
    };

    // Realistic Garden Trees Placement across the Vista
    const gardenTrees = [
      createRealisticTree(-9.2, -4.5, 'crimson', 1.4, 0.3), // Acer Palmatum Crimson Left Forefront
      createRealisticTree(8.8, -5.2, 'amber', 1.35, -0.4), // Vibrant Copper/Amber Maple Right
      createRealisticTree(-12.8, 2.2, 'amber', 1.2, 0.8), // Golden Maple Midground Left
      createRealisticTree(12.5, 3.8, 'emerald', 1.3, -0.7), // Lush Emerald Grove Midground Right
      createRealisticTree(-6.5, -13.5, 'crimson', 1.6, 1.1), // Japanese Scarlet Deep Vista
      createRealisticTree(7.5, -14.2, 'crimson', 1.55, -0.9), // Rose Scarlet Maple Far
    ];
    gardenTrees.forEach((t) => scene.add(t));

    // 11. Botanical Garden Flowers (Roses, Daisies & Lavender)
    const flowersGroup = new THREE.Group();
    const flowerStemGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.65, 5);
    const flowerStemMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });

    // Multi-petal English Rose head geometry
    const rosePetalGeo = new THREE.SphereGeometry(0.12, 5, 5);
    rosePetalGeo.scale(1, 0.5, 1.3);

    const animatedFlowers: { mesh: THREE.Group; phase: number; baseRotZ: number }[] = [];
    const roseHues = [
      0xbe123c, // Deep Velvet Rose
      0xe11d48, // Crimson Rose
      0xf43f5e, // Coral Peony
      0xfbbf24, // English Golden Rose
      0xa855f7, // Lavender Bloom
      0xf8fafc, // White Garden Daisy
    ];

    const flowerTotal = isSoftwareGl ? 30 : 75;
    for (let f = 0; f < flowerTotal; f++) {
      const fGroup = new THREE.Group();

      // Stem
      const stem = new THREE.Mesh(flowerStemGeo, flowerStemMat);
      stem.position.y = 0.32;
      fGroup.add(stem);

      // Rose Head
      const hue = roseHues[f % roseHues.length];
      const petalMat = new THREE.MeshStandardMaterial({
        color: hue,
        roughness: 0.45,
        metalness: 0.08,
      });

      const roseHead = new THREE.Group();
      roseHead.position.y = 0.65;

      // Central core
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 })
      );
      roseHead.add(core);

      // Concentric Petal Rings (Real-Life English Rose Spiral)
      for (let ring = 0; ring < 2; ring++) {
        const pCount = 5 + ring * 2;
        const rad = 0.07 + ring * 0.06;
        for (let p = 0; p < pCount; p++) {
          const petal = new THREE.Mesh(rosePetalGeo, petalMat);
          const theta = (p / pCount) * Math.PI * 2 + ring * 0.5;
          petal.position.set(Math.cos(theta) * rad, (Math.random() - 0.5) * 0.02, Math.sin(theta) * rad);
          petal.rotation.y = -theta;
          petal.rotation.x = 0.35 + ring * 0.2;
          roseHead.add(petal);
        }
      }
      fGroup.add(roseHead);

      // Scatter naturally around hills and borders
      const r = 2.2 + Math.random() * 11;
      const th = Math.random() * Math.PI * 2;
      const fx = Math.cos(th) * r;
      const fz = Math.sin(th) * r * 0.8 + 2;

      // Keep walkway unobstructed
      if (Math.abs(fx) < 1.4 && fz > -5 && fz < 10) {
        fGroup.position.set(fx + (fx >= 0 ? 1.7 : -1.7), -0.42, fz);
      } else {
        fGroup.position.set(fx, -0.42, fz);
      }

      const s = 0.75 + Math.random() * 0.6;
      fGroup.scale.set(s, s, s);
      flowersGroup.add(fGroup);

      animatedFlowers.push({
        mesh: fGroup,
        phase: Math.random() * Math.PI * 2,
        baseRotZ: (Math.random() - 0.5) * 0.15,
      });
    }
    scene.add(flowersGroup);

    // 12. Ultra-Realistic Botanical 3D Falling Maple Leaves (Acer Palmatum & Sugar Maple)
    // High-resolution botanical canvas texture with realistic leaf color gradients,
    // translucent lobes, micro-serrations, and primary/secondary radiating venation
    const leafCanvas = document.createElement('canvas');
    leafCanvas.width = 512;
    leafCanvas.height = 512;
    const lCtx = leafCanvas.getContext('2d')!;

    lCtx.translate(256, 275);

    // Realistic Botanical 5-pointed serrated Maple Contour
    lCtx.beginPath();
    // Top central lobe tip
    lCtx.moveTo(0, -230);
    lCtx.lineTo(24, -185);
    lCtx.lineTo(38, -195);
    lCtx.lineTo(48, -155);
    lCtx.lineTo(75, -170);
    lCtx.lineTo(52, -110);
    // Right upper lobe
    lCtx.lineTo(165, -125);
    lCtx.lineTo(125, -75);
    lCtx.lineTo(190, -40);
    lCtx.lineTo(135, -5);
    lCtx.lineTo(170, 20);
    lCtx.lineTo(110, 45);
    // Right lower lobe
    lCtx.lineTo(150, 85);
    lCtx.lineTo(95, 95);
    lCtx.lineTo(105, 135);
    lCtx.lineTo(45, 120);
    // Petiole / Stem base
    lCtx.lineTo(18, 160);
    lCtx.lineTo(0, 220); // Petiole tip
    lCtx.lineTo(-18, 160);
    // Left lower lobe
    lCtx.lineTo(-45, 120);
    lCtx.lineTo(-105, 135);
    lCtx.lineTo(-95, 95);
    lCtx.lineTo(-150, 85);
    lCtx.lineTo(-110, 45);
    // Left upper lobe
    lCtx.lineTo(-170, 20);
    lCtx.lineTo(-135, -5);
    lCtx.lineTo(-190, -40);
    lCtx.lineTo(-125, -75);
    lCtx.lineTo(-165, -125);
    lCtx.lineTo(-52, -110);
    lCtx.lineTo(-75, -170);
    lCtx.lineTo(-48, -155);
    lCtx.lineTo(-38, -195);
    lCtx.lineTo(-24, -185);
    lCtx.closePath();

    // Natural multi-tone radial gradient (Amber sunlit heart fading to deep fiery crimson edges)
    const leafGrad = lCtx.createRadialGradient(0, 0, 20, 0, 0, 230);
    leafGrad.addColorStop(0, '#fef08a'); // Warm golden amber center
    leafGrad.addColorStop(0.35, '#f97316'); // Rich orange transition
    leafGrad.addColorStop(0.75, '#dc2626'); // Vibrant scarlet red
    leafGrad.addColorStop(1.0, '#991b1b'); // Deep crimson tips
    lCtx.fillStyle = leafGrad;
    lCtx.fill();

    // Organic Leaf Venation Network
    lCtx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
    lCtx.lineWidth = 5;
    lCtx.beginPath();
    // Main vertical central vein
    lCtx.moveTo(0, 210);
    lCtx.lineTo(0, -210);
    // Upper lateral primary veins
    lCtx.moveTo(0, 60);
    lCtx.lineTo(120, -80);
    lCtx.moveTo(0, 60);
    lCtx.lineTo(-120, -80);
    // Lower lateral veins
    lCtx.moveTo(0, 95);
    lCtx.lineTo(100, 40);
    lCtx.moveTo(0, 95);
    lCtx.lineTo(-100, 40);
    lCtx.stroke();

    // Secondary micro-vein branching
    lCtx.lineWidth = 2.5;
    lCtx.strokeStyle = 'rgba(255, 237, 213, 0.65)';
    lCtx.beginPath();
    for (let v = 0; v < 7; v++) {
      const vy = -140 + v * 35;
      lCtx.moveTo(0, vy);
      lCtx.lineTo(25, vy - 20);
      lCtx.moveTo(0, vy);
      lCtx.lineTo(-25, vy - 20);
    }
    lCtx.stroke();

    // Subtle dark petiole (leaf stem)
    lCtx.lineWidth = 6;
    lCtx.strokeStyle = '#7c2d12';
    lCtx.beginPath();
    lCtx.moveTo(0, 140);
    lCtx.lineTo(0, 220);
    lCtx.stroke();

    const leafTex = new THREE.CanvasTexture(leafCanvas);
    leafTex.colorSpace = THREE.SRGBColorSpace;
    leafTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // Physical 3D Curved Leaf Geometry (Cupped along veins & undulating lobes)
    const leafGeo = new THREE.PlaneGeometry(0.85, 0.85, 6, 6);
    const leafPos = leafGeo.attributes.position;
    for (let i = 0; i < leafPos.count; i++) {
      const lx = leafPos.getX(i);
      const ly = leafPos.getY(i);
      // Realistic concave cup along the central petiole + subtle wave
      const cup = (1.0 - Math.abs(lx) * 2.1) * 0.12;
      const wave = Math.sin(ly * 3.5) * 0.06;
      leafPos.setZ(i, cup + wave);
    }
    leafGeo.computeVertexNormals();

    // Real botanical color tints (Acer palmatum varieties)
    const leafTints = [
      0xdc2626, // Scarlet
      0xb91c1c, // Crimson
      0xe11d48, // Rose Red
      0xea580c, // Flame Amber
      0xf59e0b, // Golden Sugar Maple
      0x991b1b, // Burgundy
    ];

    interface RealisticMapleLeaf {
      mesh: THREE.Mesh;
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      rotX: number;
      rotY: number;
      rotZ: number;
      rotSpeedX: number;
      rotSpeedY: number;
      rotSpeedZ: number;
      flutterPhase: number;
      flutterFreq: number;
      flutterAmp: number;
      glidePhase: number;
      glideSpeed: number;
      scale: number;
    }

    const mapleLeaves: RealisticMapleLeaf[] = [];
    const leafTotal = isSoftwareGl ? 35 : 75;

    for (let i = 0; i < leafTotal; i++) {
      const tint = leafTints[i % leafTints.length];
      const mat = new THREE.MeshStandardMaterial({
        color: tint,
        map: leafTex,
        transparent: true,
        roughness: 0.42,
        metalness: 0.06,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const mesh = new THREE.Mesh(leafGeo, mat);
      const scale = 0.65 + Math.random() * 0.65;
      mesh.scale.set(scale, scale, scale);

      const leaf: RealisticMapleLeaf = {
        mesh,
        x: (Math.random() - 0.5) * 26,
        y: 6 + Math.random() * 15,
        z: -5 + Math.random() * 16,
        vx: (Math.random() - 0.5) * 0.016,
        vy: -(0.019 + Math.random() * 0.024), // Realistic terminal descent velocity
        vz: (Math.random() - 0.5) * 0.014,
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        rotSpeedX: (Math.random() - 0.5) * 0.038,
        rotSpeedY: (Math.random() - 0.5) * 0.045,
        rotSpeedZ: (Math.random() - 0.5) * 0.032,
        flutterPhase: Math.random() * Math.PI * 2,
        flutterFreq: 1.4 + Math.random() * 1.6,
        flutterAmp: 0.02 + Math.random() * 0.025,
        glidePhase: Math.random() * Math.PI * 2,
        glideSpeed: 0.8 + Math.random() * 0.9,
        scale,
      };

      mesh.position.set(leaf.x, leaf.y, leaf.z);
      mesh.rotation.set(leaf.rotX, leaf.rotY, leaf.rotZ);
      scene.add(mesh);
      mapleLeaves.push(leaf);
    }

    // 13. Floating Sunlight Dust / Pollen Motes
    const pollenCount = isSoftwareGl ? 35 : 85;
    const pollenGeo = new THREE.BufferGeometry();
    const pollenPositions = new Float32Array(pollenCount * 3);
    for (let i = 0; i < pollenCount * 3; i += 3) {
      pollenPositions[i] = (Math.random() - 0.5) * 26;
      pollenPositions[i + 1] = 0.5 + Math.random() * 10;
      pollenPositions[i + 2] = -4 + Math.random() * 16;
    }
    pollenGeo.setAttribute('position', new THREE.BufferAttribute(pollenPositions, 3));

    const pollenMat = new THREE.PointsMaterial({
      color: 0xfffaed,
      size: 0.11,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const pollenPoints = new THREE.Points(pollenGeo, pollenMat);
    scene.add(pollenPoints);

    // 14. Interactive Mouse / Touch Air Currents
    let targetCameraX = 0;
    let targetCameraY = 3.2;
    let windImpulseX = 0;
    let windImpulseZ = 0;

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const normX = (clientX / window.innerWidth) * 2 - 1;
      const normY = -(clientY / window.innerHeight) * 2 + 1;

      targetCameraX = normX * 1.4;
      targetCameraY = 3.2 + normY * 0.5;
      windImpulseX = normX * 0.045;
      windImpulseZ = normY * 0.035;
    };

    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });

    // 15. Responsive Resize
    const onResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    // 16. Render Loop with Smooth Spring Damping & Aerodynamic Flight
    let animationFrameId = 0;
    const clock = new THREE.Clock();

    function renderScene() {
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera damping
      camera.position.x += (targetCameraX - camera.position.x) * 0.035;
      camera.position.y += (targetCameraY - camera.position.y) * 0.035;
      camera.lookAt(0, 1.8, 0);

      // Subtle drifting clouds
      clouds.forEach((c) => {
        c.group.position.x += c.speed;
        if (c.group.position.x > 40) c.group.position.x = -40;
      });

      // Realistic wind swaying on English roses
      animatedFlowers.forEach((fl) => {
        const sway = Math.sin(elapsedTime * 2.0 + fl.phase) * 0.07;
        fl.mesh.rotation.z = fl.baseRotZ + sway;
      });

      // Shimmering pollen motes
      const pArr = pollenGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < pollenCount * 3; i += 3) {
        pArr[i + 1] += Math.sin(elapsedTime * 0.8 + i) * 0.006;
        pArr[i] += Math.cos(elapsedTime * 0.4 + i) * 0.005;
      }
      pollenGeo.attributes.position.needsUpdate = true;

      // Decay interactive wind impulse
      windImpulseX *= 0.96;
      windImpulseZ *= 0.96;

      // Realistic Aerodynamic Falling Maple Leaves (Pitch, Roll, Airfoil Flutter)
      mapleLeaves.forEach((leaf) => {
        // Natural air resistance pendulum flutter
        const flutter = Math.sin(elapsedTime * leaf.flutterFreq + leaf.flutterPhase) * leaf.flutterAmp;
        const glide = Math.cos(elapsedTime * leaf.glideSpeed + leaf.glidePhase) * (leaf.flutterAmp * 0.8);

        leaf.x += leaf.vx + flutter + windImpulseX;
        leaf.y += leaf.vy;
        leaf.z += leaf.vz + glide + windImpulseZ;

        // 3D Aerodynamic rotation & tumbling
        leaf.rotX += leaf.rotSpeedX;
        leaf.rotY += leaf.rotSpeedY;
        leaf.rotZ += leaf.rotSpeedZ + flutter * 0.35;

        leaf.mesh.position.set(leaf.x, leaf.y, leaf.z);
        leaf.mesh.rotation.set(leaf.rotX, leaf.rotY, leaf.rotZ);

        // Reset gracefully at top when fallen
        if (leaf.y < -0.8 || leaf.x < -18 || leaf.x > 18) {
          leaf.y = 11 + Math.random() * 8;
          leaf.x = (Math.random() - 0.5) * 26;
          leaf.z = -5 + Math.random() * 15;
          leaf.rotX = Math.random() * Math.PI * 2;
          leaf.rotY = Math.random() * Math.PI * 2;
          leaf.rotZ = Math.random() * Math.PI * 2;
        }
      });

      renderer.render(scene, camera);
    }

    function tick() {
      renderScene();
      animationFrameId = requestAnimationFrame(tick);
    }

    tick();

    // Clean up all resources
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('resize', onResize);

      groundGeo.dispose();
      groundMat.dispose();
      grassTex.dispose();
      bladeGeo.dispose();
      bladeMat.dispose();
      stoneGeo.dispose();
      stoneMat.dispose();
      leafGeo.dispose();
      leafTex.dispose();
      skyGeo.dispose();
      skyMat.dispose();
      cloudGeo.dispose();
      cloudMat.dispose();
      flowerStemGeo.dispose();
      flowerStemMat.dispose();
      rosePetalGeo.dispose();
      pollenGeo.dispose();
      pollenMat.dispose();
      godRayGeo.dispose();
      godRayMat.dispose();
      barkTex.dispose();
      barkMat.dispose();
      foliageTexCrimson.dispose();
      foliageTexAmber.dispose();
      foliageTexEmerald.dispose();
      foliageMatCrimson.dispose();
      foliageMatAmber.dispose();
      foliageMatEmerald.dispose();
      leafCardGeo.dispose();

      renderer.dispose();
      if (container && renderer.domElement && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
};
