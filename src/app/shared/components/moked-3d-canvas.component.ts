import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import * as THREE from 'three';
import { HealthStatus } from '../../models/olam.models';

@Component({
  selector: 'app-moked-3d-canvas',
  standalone: true,
  template: `<div #host class="moked-3d-host" aria-hidden="true"></div>`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }

      .moked-3d-host {
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
      }

      .moked-3d-host canvas {
        display: block;
        width: 100% !important;
        height: 100% !important;
      }
    `,
  ],
})
export class Moked3dCanvasComponent implements AfterViewInit, OnChanges, OnDestroy {
  private readonly ngZone = inject(NgZone);

  @ViewChild('host', { static: true }) hostRef!: ElementRef<HTMLDivElement>;
  @Input() mode: 'hero' | 'auth' | 'network' | 'light' = 'hero';
  @Input() status: HealthStatus = 'em-dia';
  @Input() scrollParallax = false;

  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private rafId: number | null = null;
  private resizeObserver?: ResizeObserver;
  private rootGroup?: THREE.Group;
  private parallaxLayer?: THREE.Group;
  private coreMesh?: THREE.Mesh;
  private wireMesh?: THREE.Mesh;
  private ringMeshes: THREE.Mesh[] = [];
  private particles?: THREE.Points;
  private disposables: { dispose: () => void }[] = [];

  private targetColor = new THREE.Color(0xc8102e);
  private currentColor = new THREE.Color(0xc8102e);
  private pointerX = 0;
  private pointerY = 0;
  private scrollTarget = 0;
  private scrollCurrent = 0;
  private baseCamZ = 6.4;
  private reducedMotion = false;
  private removePointerListener?: () => void;
  private removeScrollListener?: () => void;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['status']) {
      this.targetColor.setHex(this.statusHex(this.status));
    }
  }

  ngAfterViewInit(): void {
    this.reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    this.targetColor.setHex(this.statusHex(this.status));
    this.currentColor.copy(this.targetColor);

    this.ngZone.runOutsideAngular(() => {
      this.initScene();
    });
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
    this.resizeObserver?.disconnect();
    this.removePointerListener?.();
    this.removeScrollListener?.();
    for (const item of this.disposables) {
      item.dispose();
    }
    this.disposables = [];
    this.renderer?.dispose();
  }

  private statusHex(status: HealthStatus): number {
    if (status === 'atencao') return 0xf59e0b;
    if (status === 'critico') return 0xef4444;
    if (this.mode === 'auth' || this.mode === 'light') return 0xc8102e;
    return 0x10b981;
  }

  private initScene(): void {
    const container = this.hostRef?.nativeElement;
    if (!container) return;

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 220);

    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height, false);
    this.renderer.setClearColor(0x000000, 0);
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    this.baseCamZ = this.mode === 'auth' || this.mode === 'light' ? 8.2 : 6.4;
    this.camera.position.set(0, 0, this.baseCamZ);

    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    const keyLight = new THREE.PointLight(0xffffff, 18, 25);
    keyLight.position.set(4, 5, 6);
    const rimLight = new THREE.PointLight(0xc8102e, 14, 22);
    rimLight.position.set(-5, -3, 4);
    this.scene.add(ambient, keyLight, rimLight);

    this.rootGroup = new THREE.Group();
    if (this.mode === 'hero') {
      this.rootGroup.position.set(0.3, 0, 0);
    } else if (this.scrollParallax) {
      this.rootGroup.position.set(1.5, 0.15, -0.4);
    }
    this.scene.add(this.rootGroup);

    this.parallaxLayer = new THREE.Group();
    this.scene.add(this.parallaxLayer);

    this.buildGeometry();
    this.bindEvents(container);

    const clock = new THREE.Clock();
    const renderFrame = () => {
      const elapsed = clock.getElapsedTime();
      this.updateScene(elapsed);
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
      if (!this.reducedMotion) {
        this.rafId = requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();
  }

  private buildGeometry(): void {
    if (!this.rootGroup) return;

    const isLightBackdrop = this.mode === 'auth' || this.mode === 'light';
    const primaryWireHex = isLightBackdrop ? 0xc8102e : 0x60a5fa;

    const outerGeo = new THREE.IcosahedronGeometry(isLightBackdrop ? 2.25 : 1.72, 1);
    const outerMat = new THREE.MeshBasicMaterial({
      color: primaryWireHex,
      wireframe: true,
      transparent: true,
      opacity: isLightBackdrop ? 0.16 : 0.25,
    });
    this.wireMesh = new THREE.Mesh(outerGeo, outerMat);
    this.rootGroup.add(this.wireMesh);
    this.disposables.push(outerGeo, outerMat);

    const coreGeo = new THREE.OctahedronGeometry(isLightBackdrop ? 1.1 : 0.88, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: this.currentColor,
      emissive: this.currentColor,
      emissiveIntensity: isLightBackdrop ? 0.35 : 0.72,
      roughness: 0.22,
      metalness: 0.65,
      flatShading: true,
      transparent: true,
      opacity: isLightBackdrop ? 0.22 : 0.88,
    });
    this.coreMesh = new THREE.Mesh(coreGeo, coreMat);
    this.rootGroup.add(this.coreMesh);
    this.disposables.push(coreGeo, coreMat);

    const ringConfigs = [
      { radius: isLightBackdrop ? 2.8 : 2.15, tube: 0.018, rx: 1.12, ry: 0.35, color: 0xc8102e },
      { radius: isLightBackdrop ? 3.25 : 2.52, tube: 0.015, rx: -0.65, ry: 0.88, color: 0x38bdf8 },
      { radius: isLightBackdrop ? 3.6 : 2.85, tube: 0.013, rx: 0.35, ry: -0.95, color: 0xa855f7 },
    ];

    this.ringMeshes = ringConfigs.map((cfg) => {
      const geo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 12, 84);
      const mat = new THREE.MeshBasicMaterial({
        color: isLightBackdrop ? 0x94a3b8 : cfg.color,
        transparent: true,
        opacity: isLightBackdrop ? 0.2 : 0.48,
      });
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.set(cfg.rx, cfg.ry, 0);
      this.rootGroup!.add(ring);
      this.disposables.push(geo, mat);
      return ring;
    });

    if (this.mode === 'network' || this.mode === 'hero') {
      const beaconGeo = new THREE.SphereGeometry(0.065, 12, 12);
      this.disposables.push(beaconGeo);
      const statuses: { color: number; count: number }[] = [
        { color: 0x10b981, count: 14 },
        { color: 0xf59e0b, count: 4 },
        { color: 0xef4444, count: 2 },
      ];
      let idx = 0;
      const total = 20;
      for (const group of statuses) {
        const mat = new THREE.MeshBasicMaterial({ color: group.color });
        this.disposables.push(mat);
        for (let i = 0; i < group.count; i++) {
          const phi = Math.acos(-1 + (2 * idx) / total);
          const theta = Math.sqrt(total * Math.PI) * phi;
          const r = 1.78;
          const dot = new THREE.Mesh(beaconGeo, mat);
          dot.position.set(
            r * Math.cos(theta) * Math.sin(phi),
            r * Math.sin(theta) * Math.sin(phi),
            r * Math.cos(phi)
          );
          this.wireMesh.add(dot);
          idx++;
        }
      }
    }

    const particleCount = isLightBackdrop ? 105 : 170;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 2.6 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4.5;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      color: isLightBackdrop ? 0xc8102e : 0x93c5fd,
      size: isLightBackdrop ? 0.055 : 0.048,
      transparent: true,
      opacity: isLightBackdrop ? 0.25 : 0.65,
      blending: isLightBackdrop ? THREE.NormalBlending : THREE.AdditiveBlending,
    });
    this.particles = new THREE.Points(pGeo, pMat);
    this.rootGroup.add(this.particles);
    this.disposables.push(pGeo, pMat);

    if (this.scrollParallax && this.parallaxLayer) {
      const satGeo = new THREE.OctahedronGeometry(0.28, 0);
      const satMat = new THREE.MeshBasicMaterial({
        color: isLightBackdrop ? 0xc8102e : 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: isLightBackdrop ? 0.24 : 0.42,
      });
      this.disposables.push(satGeo, satMat);

      const offsets: [number, number, number][] = [
        [-4.2, 1.8, -1.6],
        [-2.8, -2.4, 0.8],
        [4.1, -1.7, -0.9],
        [2.6, 2.5, -2.1],
      ];
      for (const [x, y, z] of offsets) {
        const sat = new THREE.Mesh(satGeo, satMat);
        sat.position.set(x, y, z);
        this.parallaxLayer.add(sat);
      }
    }
  }

  private updateScene(elapsed: number): void {
    this.currentColor.lerp(this.targetColor, 0.06);
    this.scrollCurrent += (this.scrollTarget - this.scrollCurrent) * 0.07;

    if (this.coreMesh) {
      const mat = this.coreMesh.material as THREE.MeshStandardMaterial;
      mat.color.copy(this.currentColor);
      mat.emissive.copy(this.currentColor);
      this.coreMesh.rotation.y = elapsed * 0.55 + this.scrollCurrent * 1.4;
      this.coreMesh.rotation.x = Math.sin(elapsed * 0.4) * 0.25 + this.scrollCurrent * 0.6;
      const pulse = 1 + Math.sin(elapsed * 2.1) * 0.045;
      this.coreMesh.scale.setScalar(pulse);
    }

    if (this.wireMesh) {
      this.wireMesh.rotation.y = -elapsed * 0.16 - this.scrollCurrent * 0.85;
      this.wireMesh.rotation.z = elapsed * 0.09;
    }

    this.ringMeshes.forEach((ring, idx) => {
      const dir = idx % 2 === 0 ? 1 : -1;
      ring.rotation.z += 0.004 * dir;
      ring.rotation.y += 0.0025 * (idx + 1) * 0.4;
    });

    if (this.particles) {
      this.particles.rotation.y = elapsed * 0.035 + this.scrollCurrent * 0.5;
      this.particles.position.y = this.scrollCurrent * 1.25;
    }

    if (this.parallaxLayer) {
      this.parallaxLayer.position.y = this.scrollCurrent * 2.4;
      this.parallaxLayer.position.x = -this.pointerX * 0.45;
      this.parallaxLayer.rotation.z = this.scrollCurrent * 0.45;
    }

    if (this.camera && this.scrollParallax) {
      this.camera.position.x += (this.pointerX * 0.55 - this.camera.position.x) * 0.05;
      this.camera.position.y +=
        (-this.pointerY * 0.35 - this.scrollCurrent * 1.35 - this.camera.position.y) * 0.05;
      this.camera.position.z +=
        (this.baseCamZ - this.scrollCurrent * 1.15 - this.camera.position.z) * 0.05;
      this.camera.lookAt(0, -this.scrollCurrent * 0.45, 0);
    }

    if (this.rootGroup) {
      const targetRotY = this.pointerX * 0.38 + this.scrollCurrent * 0.9;
      const targetRotX = -this.pointerY * 0.24 + this.scrollCurrent * 0.35;
      this.rootGroup.rotation.y += (targetRotY - this.rootGroup.rotation.y) * 0.05;
      this.rootGroup.rotation.x += (targetRotX - this.rootGroup.rotation.x) * 0.05;
      if (this.scrollParallax) {
        const targetX = 1.5 - this.scrollCurrent * 2.8;
        this.rootGroup.position.x += (targetX - this.rootGroup.position.x) * 0.05;
      }
    }
  }

  private bindEvents(container: HTMLElement): void {
    const onPointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / Math.max(window.innerWidth, 1)) * 2 - 1;
      const ny = (e.clientY / Math.max(window.innerHeight, 1)) * 2 - 1;
      this.pointerX = nx;
      this.pointerY = ny;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    this.removePointerListener = () => window.removeEventListener('pointermove', onPointerMove);

    if (this.scrollParallax) {
      const updateScroll = () => {
        const maxScroll = Math.max(
          document.documentElement.scrollHeight - window.innerHeight,
          1
        );
        this.scrollTarget = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
      };
      updateScroll();
      window.addEventListener('scroll', updateScroll, { passive: true });
      this.removeScrollListener = () => window.removeEventListener('scroll', updateScroll);
    }

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(entry.contentRect.width, 1);
        const h = Math.max(entry.contentRect.height, 1);
        if (this.renderer && this.camera) {
          this.camera.aspect = w / h;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(w, h, false);
        }
      }
    });
    this.resizeObserver.observe(container);
  }
}

