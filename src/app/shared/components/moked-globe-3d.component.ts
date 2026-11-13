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

@Component({
  selector: 'app-moked-globe-3d',
  standalone: true,
  template: `<div #host class="moked-globe-host" aria-hidden="true"></div>`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        position: absolute;
        inset: 0;
        pointer-events: none;
      }

      .moked-globe-host {
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
      }

      .moked-globe-host canvas {
        display: block;
        width: 100% !important;
        height: 100% !important;
      }
    `,
  ],
})
export class MokedGlobe3dComponent implements AfterViewInit, OnChanges, OnDestroy {
  private readonly ngZone = inject(NgZone);

  @ViewChild('host', { static: true }) hostRef!: ElementRef<HTMLDivElement>;
  @Input() scrollProgress = 0; // 0 to 1
  @Input() mode: 'hero' | 'center' = 'hero';

  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private rafId: number | null = null;
  private resizeObserver?: ResizeObserver;
  private globeGroup?: THREE.Group;
  private innerGlobe?: THREE.Mesh;
  private dotsPoints?: THREE.Points;
  private ringsGroup?: THREE.Group;
  private ring1?: THREE.Mesh;
  private ring2?: THREE.Mesh;
  private ring3?: THREE.Mesh;
  private satellites: THREE.Mesh[] = [];
  private arcsGroup?: THREE.Group;
  private dustPoints?: THREE.Points;
  private disposables: { dispose: () => void }[] = [];

  private targetPointerX = 0;
  private targetPointerY = 0;
  private currentPointerX = 0;
  private currentPointerY = 0;
  private removePointerListener?: () => void;
  private reducedMotion = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['scrollProgress'] && this.globeGroup) {
      // scrollProgress updates rotation smoothly in update loop
    }
  }

  ngAfterViewInit(): void {
    this.reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

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
    for (const item of this.disposables) {
      try {
        item.dispose();
      } catch {
        // ignore
      }
    }
    this.disposables = [];
    this.renderer?.dispose();
  }

  private initScene(): void {
    const container = this.hostRef?.nativeElement;
    if (!container) return;

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 320);

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
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 7.5);

    // Iluminação Holográfica
    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    const redLight = new THREE.PointLight(0xff1744, 18, 25);
    redLight.position.set(-4, 3, 5);
    const cyanLight = new THREE.PointLight(0x38bdf8, 14, 22);
    cyanLight.position.set(4, -3, 4);
    this.scene.add(ambient, redLight, cyanLight);

    // Grupo Principal do Globo
    this.globeGroup = new THREE.Group();
    if (this.mode === 'hero') {
      const isWide = width >= 960;
      this.globeGroup.position.set(isWide ? 2.15 : 0, isWide ? 0.05 : -0.2, 0);
    }
    this.scene.add(this.globeGroup);

    this.buildGlobeObjects();
    this.bindEvents(container);

    const clock = new THREE.Clock();
    const render = () => {
      const elapsed = clock.getElapsedTime();
      this.update(elapsed);
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
      if (!this.reducedMotion) {
        this.rafId = requestAnimationFrame(render);
      }
    };

    render();
  }

  private buildGlobeObjects(): void {
    if (!this.globeGroup) return;

    const globeRadius = 2.45;

    // 1. Esfera Interior Translúcida com Wireframe Suave
    const innerGeo = new THREE.SphereGeometry(globeRadius, 36, 28);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x334155,
      wireframe: true,
      transparent: true,
      opacity: 0.38,
    });
    this.innerGlobe = new THREE.Mesh(innerGeo, innerMat);
    this.globeGroup.add(this.innerGlobe);
    this.disposables.push(innerGeo, innerMat);

    // 2. Pontos da Superfície da Rede (Constelação de nós do Globo)
    const dotsCount = 1400;
    const dotPositions = new Float32Array(dotsCount * 3);
    const dotColors = new Float32Array(dotsCount * 3);
    const cRed = new THREE.Color(0xff1744);
    const cCyan = new THREE.Color(0x38bdf8);
    const cSlate = new THREE.Color(0x94a3b8);

    for (let i = 0; i < dotsCount; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / dotsCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const x = globeRadius * Math.sin(phi) * Math.cos(theta);
      const y = globeRadius * Math.sin(phi) * Math.sin(theta);
      const z = globeRadius * Math.cos(phi);

      dotPositions[i * 3] = x;
      dotPositions[i * 3 + 1] = y;
      dotPositions[i * 3 + 2] = z;

      const r = Math.random();
      const col = r < 0.14 ? cRed : r < 0.4 ? cCyan : cSlate;
      dotColors[i * 3] = col.r;
      dotColors[i * 3 + 1] = col.g;
      dotColors[i * 3 + 2] = col.b;
    }

    const dotsGeo = new THREE.BufferGeometry();
    dotsGeo.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));
    dotsGeo.setAttribute('color', new THREE.BufferAttribute(dotColors, 3));

    const dotsMat = new THREE.PointsMaterial({
      size: 0.065,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
    });
    this.dotsPoints = new THREE.Points(dotsGeo, dotsMat);
    this.globeGroup.add(this.dotsPoints);
    this.disposables.push(dotsGeo, dotsMat);

    // 3. Arcos de Conexão CCO (Curvas de Bezier conectando polos)
    this.arcsGroup = new THREE.Group();
    const hubs = [
      new THREE.Vector3(1.2, 1.4, 0.8).normalize().multiplyScalar(globeRadius),
      new THREE.Vector3(-1.4, 0.8, 1.1).normalize().multiplyScalar(globeRadius),
      new THREE.Vector3(0.5, -1.3, 1.3).normalize().multiplyScalar(globeRadius),
      new THREE.Vector3(-0.9, -1.1, -1.1).normalize().multiplyScalar(globeRadius),
      new THREE.Vector3(1.5, -0.6, -0.9).normalize().multiplyScalar(globeRadius),
      new THREE.Vector3(-0.3, 1.7, -0.7).normalize().multiplyScalar(globeRadius),
      new THREE.Vector3(1.1, 0.2, 1.6).normalize().multiplyScalar(globeRadius),
      new THREE.Vector3(-1.2, -0.3, 1.4).normalize().multiplyScalar(globeRadius),
    ];

    for (let i = 0; i < hubs.length; i++) {
      const start = hubs[i];
      const end = hubs[(i + 1) % hubs.length];
      const mid = start
        .clone()
        .add(end)
        .multiplyScalar(0.5)
        .normalize()
        .multiplyScalar(globeRadius * 1.38);

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(28);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
      const arcMat = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? 0xff1744 : 0x38bdf8,
        transparent: true,
        opacity: 0.85,
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      this.arcsGroup.add(arcLine);
      this.disposables.push(arcGeo, arcMat);

      // Hub Beacon
      const beaconGeo = new THREE.SphereGeometry(0.08, 12, 12);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xff4d6d : 0x38bdf8,
      });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.position.copy(start);
      this.arcsGroup.add(beaconMesh);
      this.disposables.push(beaconGeo, beaconMat);
    }
    this.globeGroup.add(this.arcsGroup);

    // 4. Anéis Orbitais com Satélites Telemétricos
    this.ringsGroup = new THREE.Group();

    // Anel 1: Rubro / Carmim Moked
    const ring1Geo = new THREE.TorusGeometry(globeRadius * 1.42, 0.024, 16, 90);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0xff1744,
      transparent: true,
      opacity: 0.85,
    });
    this.ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    this.ring1.rotation.x = 1.1;
    this.ring1.rotation.y = 0.35;
    this.ringsGroup.add(this.ring1);
    this.disposables.push(ring1Geo, ring1Mat);

    // Anel 2: Azul Ciano Holográfico
    const ring2Geo = new THREE.TorusGeometry(globeRadius * 1.68, 0.02, 16, 90);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
    });
    this.ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    this.ring2.rotation.x = -0.75;
    this.ring2.rotation.y = 0.95;
    this.ringsGroup.add(this.ring2);
    this.disposables.push(ring2Geo, ring2Mat);

    // Anel 3: Roxo / Púrpura Ticks
    const ring3Geo = new THREE.TorusGeometry(globeRadius * 1.92, 0.016, 12, 80);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.55,
    });
    this.ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    this.ring3.rotation.x = 0.3;
    this.ringsGroup.add(this.ring3);
    this.disposables.push(ring3Geo, ring3Mat);

    // Satélites orbitando nos anéis
    this.satellites = [];
    for (let s = 0; s < 3; s++) {
      const satGeo = new THREE.SphereGeometry(0.09, 12, 12);
      const satMat = new THREE.MeshBasicMaterial({
        color: s === 0 ? 0xffffff : s === 1 ? 0xff4d6d : 0x38bdf8,
      });
      const sat = new THREE.Mesh(satGeo, satMat);
      this.satellites.push(sat);
      this.ringsGroup.add(sat);
      this.disposables.push(satGeo, satMat);
    }

    this.globeGroup.add(this.ringsGroup);

    // 5. Partículas de Poeira Estelar / Profundidade
    const dustCount = 180;
    const dustPos = new Float32Array(dustCount * 3);
    for (let d = 0; d < dustCount; d++) {
      dustPos[d * 3] = (Math.random() - 0.5) * 12;
      dustPos[d * 3 + 1] = (Math.random() - 0.5) * 10;
      dustPos[d * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.035,
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.4,
    });
    this.dustPoints = new THREE.Points(dustGeo, dustMat);
    this.scene?.add(this.dustPoints);
    this.disposables.push(dustGeo, dustMat);
  }

  private bindEvents(container: HTMLDivElement): void {
    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      const y = ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1;
      this.targetPointerX = x;
      this.targetPointerY = y;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    this.removePointerListener = () => {
      window.removeEventListener('pointermove', onMove);
    };

    this.resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.max(entry.contentRect.width, 320);
      const h = Math.max(entry.contentRect.height, 320);
      if (this.camera && this.renderer) {
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h, false);
      }
      if (this.globeGroup && this.mode === 'hero') {
        const isWide = w >= 960;
        this.globeGroup.position.set(isWide ? 2.15 : 0, isWide ? 0.05 : -0.2, 0);
      }
    });

    this.resizeObserver.observe(container);
  }

  private update(elapsed: number): void {
    if (!this.globeGroup) return;

    this.currentPointerX += (this.targetPointerX - this.currentPointerX) * 0.05;
    this.currentPointerY += (this.targetPointerY - this.currentPointerY) * 0.05;

    const scrollSpin = (this.scrollProgress || 0) * Math.PI * 2;
    const baseSpin = elapsed * 0.22;

    this.globeGroup.rotation.y = baseSpin + scrollSpin + this.currentPointerX * 0.35;
    this.globeGroup.rotation.x = 0.15 + this.currentPointerY * -0.25;

    if (this.ring1) {
      this.ring1.rotation.z = elapsed * 0.35 + scrollSpin * 0.6;
    }
    if (this.ring2) {
      this.ring2.rotation.z = -elapsed * 0.28 - scrollSpin * 0.5;
    }
    if (this.ring3) {
      this.ring3.rotation.z = elapsed * 0.18;
    }

    const r1 = 2.45 * 1.42;
    const a1 = elapsed * 0.85 + scrollSpin;
    if (this.satellites[0] && this.ring1) {
      this.satellites[0].position.set(
        Math.cos(a1) * r1,
        Math.sin(a1) * r1 * Math.cos(this.ring1.rotation.x),
        Math.sin(a1) * r1 * Math.sin(this.ring1.rotation.x)
      );
    }

    const r2 = 2.45 * 1.68;
    const a2 = -elapsed * 0.72 - scrollSpin;
    if (this.satellites[1] && this.ring2) {
      this.satellites[1].position.set(
        Math.cos(a2) * r2 * Math.cos(this.ring2.rotation.y),
        Math.sin(a2) * r2,
        Math.cos(a2) * r2 * Math.sin(this.ring2.rotation.y)
      );
    }

    const r3 = 2.45 * 1.92;
    const a3 = elapsed * 0.55;
    if (this.satellites[2]) {
      this.satellites[2].position.set(Math.cos(a3) * r3, 0, Math.sin(a3) * r3);
    }

    const scale = 1.0 + (this.scrollProgress || 0) * 0.15;
    this.globeGroup.scale.set(scale, scale, scale);

    if (this.dustPoints) {
      this.dustPoints.rotation.y = elapsed * 0.05;
    }
  }
}
