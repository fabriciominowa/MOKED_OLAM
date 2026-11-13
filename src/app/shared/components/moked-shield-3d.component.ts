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

export type Shield3DMode = 'shield' | 'radar' | 'hyper';

interface PCBTrace {
  path: THREE.CurvePath<THREE.Vector3>;
  points: THREE.Vector3[];
  line: THREE.Line;
  packet: THREE.Mesh;
  speed: number;
  progress: number;
  color: THREE.Color;
}

interface CircuitFormingTrack {
  points: THREE.Vector3[];
  geometry: THREE.BufferGeometry;
  line: THREE.Line;
  spark: THREE.Mesh;
  startTime: number;
  duration: number;
  color: number;
}

interface LetterInternalCircuit {
  path: THREE.CurvePath<THREE.Vector3>;
  points: THREE.Vector3[];
  line: THREE.Line;
  packet: THREE.Mesh;
  speed: number;
  progress: number;
  color: number;
}

@Component({
  selector: 'app-moked-shield-3d',
  standalone: true,
  template: `
    <div
      #host
      class="moked-pcb-steady-host absolute inset-0 w-full h-full overflow-hidden select-none"
      (click)="triggerCircuitSurge()"
    >
      <div class="canvas-container absolute inset-0 w-full h-full"></div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: auto;
      }
      .moked-pcb-steady-host {
        cursor: pointer;
      }
      .canvas-container {
        width: 100%;
        height: 100%;
      }
      :host ::ng-deep .canvas-container canvas {
        display: block;
        width: 100% !important;
        height: 100% !important;
      }
    `,
  ],
})
export class MokedShield3dComponent implements AfterViewInit, OnChanges, OnDestroy {
  private readonly ngZone = inject(NgZone);

  @ViewChild('host', { static: true }) hostRef!: ElementRef<HTMLDivElement>;
  @Input() mode: Shield3DMode = 'shield';

  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private rafId: number | null = null;
  private resizeObserver?: ResizeObserver;

  // Hierarquia 3D
  private mainGroup?: THREE.Group;
  private pcbFlatBoardGroup?: THREE.Group;
  private mokedMonumentGroup?: THREE.Group;
  private letterMeshes: THREE.Mesh[] = [];
  private gyroShieldInO?: THREE.Group;

  // Trilhas de Circuito & Pulsos de Elétrons (100% da tela)
  private tracesGroup?: THREE.Group;
  private pcbTraces: PCBTrace[] = [];
  private surgeProgress = 1.0;

  // Microchips e LEDs de Status
  private microchipsGroup?: THREE.Group;
  private microchipLeds: { mesh: THREE.Mesh; freq: number }[] = [];

  // Vias de Solda Douradas
  private viasGroup?: THREE.Group;

  // Iluminação
  private dynamicPointLight?: THREE.PointLight;
  private coreRubyLight?: THREE.PointLight;
  private keyStudioLight?: THREE.DirectionalLight;
  private ambientFillLight?: THREE.AmbientLight;

  // Materiais
  private mirrorChromeMat?: THREE.MeshStandardMaterial;
  private rubySiliconMat?: THREE.MeshStandardMaterial;
  private goldTraceMat?: THREE.MeshStandardMaterial;
  private carmineTraceMat?: THREE.MeshStandardMaterial;
  private cyanTraceMat?: THREE.MeshStandardMaterial;

  // Sequência de Boot de PC e Circuitos que Formam MOKED
  public bootState: 'forming' | 'boot_flash' | 'online' = 'online';
  private bootTime = 3.5;
  private bootFlashLight?: THREE.PointLight;
  private shockwaveRing?: THREE.Mesh;
  private formingTracks: CircuitFormingTrack[] = [];
  private letterInternalCircuits: LetterInternalCircuit[] = [];
  private letterViasGroup?: THREE.Group;

  // Mouse (Apenas move a luz dinâmica para reflexos, SEM balançar a placa ou letras)
  private targetPointerX = 0;
  private targetPointerY = 0;
  private currentPointerX = 0;
  private currentPointerY = 0;
  private removePointerListener?: () => void;
  private disposables: { dispose: () => void }[] = [];
  private reducedMotion = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mode']) {
      this.applyMode(this.mode);
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

  public triggerCircuitSurge(): void {
    this.surgeProgress = 0.0;
    this.rebootSystem();
  }

  public rebootSystem(): void {
    this.bootTime = 0.0;
    this.bootState = 'forming';
    this.surgeProgress = 0.0;
    if (this.shockwaveRing) {
      this.shockwaveRing.visible = false;
      this.shockwaveRing.scale.set(0.1, 0.1, 0.1);
      (this.shockwaveRing.material as THREE.MeshBasicMaterial).opacity = 0;
    }
  }

  private initScene(): void {
    const hostEl = this.hostRef?.nativeElement;
    if (!hostEl) return;
    const container = hostEl.querySelector('.canvas-container') as HTMLElement;
    if (!container) return;

    const width = Math.max(container.clientWidth, 600);
    const height = Math.max(container.clientHeight, 600);

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
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.45;
    this.renderer.setClearColor(0x000000, 0);
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 10.0);

    // ==========================================
    // 1. ILUMINAÇÃO DE PLACA DE CIRCUITO (PCB Studio)
    // ==========================================
    this.ambientFillLight = new THREE.AmbientLight(0xffffff, 1.35);
    this.scene.add(this.ambientFillLight);

    // Key Light Superior (Revela o brilho das trilhas de ouro)
    this.keyStudioLight = new THREE.DirectionalLight(0xffffff, 3.2);
    this.keyStudioLight.position.set(4, 8, 8);
    this.scene.add(this.keyStudioLight);

    // Rim Light Ciano Elétrico
    const cyanLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    cyanLight.position.set(-8, 3, 4);
    this.scene.add(cyanLight);

    // Luz Rubi Carmim Moked
    this.coreRubyLight = new THREE.PointLight(0xff1744, 7.5, 18);
    this.coreRubyLight.position.set(2.8, 0.5, 3.5);
    this.scene.add(this.coreRubyLight);

    // Luz Dinâmica que Segue o Cursor (Apenas move o reflexo da luz, sem balançar o 3D)
    this.dynamicPointLight = new THREE.PointLight(0xffffff, 4.5, 16);
    this.dynamicPointLight.position.set(2, 1, 5.5);
    this.scene.add(this.dynamicPointLight);

    // ==========================================
    // 2. CONSTRUÇÃO DA PLACA-MÃE FIXA 100% ESTÁVEL
    // ==========================================
    this.mainGroup = new THREE.Group();
    this.scene.add(this.mainGroup);

    this.buildFlatPCBSubstrate();
    this.buildFullCoverageCircuitTraces();
    this.buildSculpturalMokedChipset();

    this.updateLayoutPositions(width, height);
    this.applyMode(this.mode);
    this.bindEvents(hostEl);

    const clock = new THREE.Clock();
    let previousTime = 0;
    const render = () => {
      const elapsed = clock.getElapsedTime();
      const delta = elapsed - previousTime;
      previousTime = elapsed;
      this.update(elapsed, Math.min(delta, 0.1));
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
      if (!this.reducedMotion) {
        this.rafId = requestAnimationFrame(render);
      }
    };

    render();
  }

  // ==========================================
  // SUBSTRATO DA PLACA (FUNDO DEEP CYBER SEM GRADE QUADRADA)
  // Conforme solicitação do usuário: sem grade, circuito cobre 100% do hero
  // ==========================================
  private buildFlatPCBSubstrate(): void {
    this.pcbFlatBoardGroup = new THREE.Group();
    this.pcbFlatBoardGroup.position.set(0, 0, -1.0);
    this.pcbFlatBoardGroup.rotation.set(0, 0, 0);

    // 1. Plano de Fundo FR-4 Deep Cyber (Isolante escuro amplo sem emendas nem grade)
    const boardGeo = new THREE.PlaneGeometry(120, 70);
    const boardMat = new THREE.MeshBasicMaterial({
      color: 0x030712,
      depthWrite: false,
    });
    const boardMesh = new THREE.Mesh(boardGeo, boardMat);
    this.pcbFlatBoardGroup.add(boardMesh);
    this.disposables.push(boardGeo, boardMat);

    this.mainGroup?.add(this.pcbFlatBoardGroup);
  }

  // ==========================================
  // REDE TOTAL DE CIRCUITOS COBRINDO 100% DO HERO (ESQUERDA, CENTRO E DIREITA)
  // Ângulos ortogonais de 90° e chanfros exatos de 45°, cobrindo de ponta a ponta
  // ==========================================
  private buildFullCoverageCircuitTraces(): void {
    this.tracesGroup = new THREE.Group();
    this.pcbTraces = [];

    this.goldTraceMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 1.8,
      metalness: 0.96,
      roughness: 0.1,
    });
    this.disposables.push(this.goldTraceMat);

    this.carmineTraceMat = new THREE.MeshStandardMaterial({
      color: 0xff1744,
      emissive: 0xff1744,
      emissiveIntensity: 2.4,
      metalness: 0.88,
      roughness: 0.12,
    });
    this.disposables.push(this.carmineTraceMat);

    this.cyanTraceMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 2.2,
      metalness: 0.88,
      roughness: 0.12,
    });
    this.disposables.push(this.cyanTraceMat);

    // Barramentos cibernéticos de alta precisão que ocupam 100% da tela (x: -32 a +32, y: -16 a +16)
    const traceDefs: {
      coords: [number, number][];
      color: number;
      speed: number;
      opacity: number;
    }[] = [
      // === 1. QUADRANTE ESQUERDO (Trilhas cibernéticas percorrendo a área esquerda do Hero) ===
      { coords: [[-32, 10], [-24, 10], [-18, 14], [-10, 14], [-4, 8]], color: 0x38bdf8, speed: 0.24, opacity: 0.55 },
      { coords: [[-32, 8], [-22, 8], [-16, 12], [-8, 12], [-2, 6]], color: 0xf59e0b, speed: 0.22, opacity: 0.50 },
      { coords: [[-32, 6], [-20, 6], [-14, 10], [-8, 10], [0, 2]], color: 0xff1744, speed: 0.26, opacity: 0.45 },
      { coords: [[-32, 2], [-26, 2], [-22, -2], [-14, -2], [-6, -2]], color: 0x38bdf8, speed: 0.21, opacity: 0.40 },
      { coords: [[-32, -2], [-24, -2], [-18, -6], [-10, -6], [-4, -4]], color: 0xf59e0b, speed: 0.25, opacity: 0.45 },
      { coords: [[-32, -6], [-22, -6], [-16, -10], [-8, -10], [0, -6]], color: 0xff1744, speed: 0.23, opacity: 0.50 },
      { coords: [[-32, -10], [-24, -10], [-20, -14], [-12, -14], [-4, -8]], color: 0x38bdf8, speed: 0.27, opacity: 0.55 },

      // === 2. BARRAMENTOS VERTICAIS E PONTES DE CONEXÃO ESQUERDA-CENTRO ===
      { coords: [[-18, 16], [-18, 10], [-14, 6], [-8, 6], [-2, 0]], color: 0x38bdf8, speed: 0.22, opacity: 0.45 },
      { coords: [[-14, 16], [-14, 12], [-10, 8], [-4, 8], [2, 2]], color: 0xff1744, speed: 0.24, opacity: 0.45 },
      { coords: [[-18, -16], [-18, -10], [-12, -4], [-6, -4], [0, 0]], color: 0xf59e0b, speed: 0.26, opacity: 0.45 },
      { coords: [[-12, -16], [-12, -10], [-6, -6], [0, -6], [4, -2]], color: 0x38bdf8, speed: 0.20, opacity: 0.45 },

      // === 3. EIXO CENTRAL (Conexão superior e inferior cruzando o palco) ===
      { coords: [[-4, 16], [-4, 10], [0, 6], [4, 6], [8, 2]], color: 0xff1744, speed: 0.28, opacity: 0.65 },
      { coords: [[0, 16], [0, 12], [4, 8], [8, 8], [12, 4]], color: 0xf59e0b, speed: 0.23, opacity: 0.70 },
      { coords: [[-2, -16], [-2, -10], [2, -6], [6, -6], [10, -2]], color: 0x38bdf8, speed: 0.25, opacity: 0.65 },
      { coords: [[2, -16], [2, -12], [6, -8], [10, -8], [14, -4]], color: 0xff1744, speed: 0.22, opacity: 0.70 },

      // === 4. QUADRANTE DIREITO (Convergência de alta densidade no Chipset MOKED) ===
      { coords: [[32, 12], [24, 12], [18, 8], [12, 8], [6, 4]], color: 0x38bdf8, speed: 0.27, opacity: 0.85 },
      { coords: [[32, 10], [22, 10], [16, 6], [10, 6], [5, 2]], color: 0xff1744, speed: 0.24, opacity: 0.85 },
      { coords: [[32, 8], [24, 8], [18, 4], [12, 4], [6, 2]], color: 0xf59e0b, speed: 0.26, opacity: 0.85 },
      { coords: [[32, 6], [20, 6], [14, 2], [8, 2], [4, 0]], color: 0x38bdf8, speed: 0.25, opacity: 0.85 },
      { coords: [[32, 2], [24, 2], [18, 0], [12, 0], [6, 0]], color: 0xff1744, speed: 0.28, opacity: 0.85 },
      { coords: [[32, -2], [22, -2], [16, -2], [10, -2], [5, 0]], color: 0xf59e0b, speed: 0.22, opacity: 0.85 },
      { coords: [[32, -6], [24, -6], [18, -4], [12, -4], [6, -2]], color: 0x38bdf8, speed: 0.26, opacity: 0.85 },
      { coords: [[32, -8], [22, -8], [16, -8], [10, -6], [5, -4]], color: 0xff1744, speed: 0.23, opacity: 0.85 },
      { coords: [[32, -10], [24, -10], [18, -12], [12, -12], [6, -6]], color: 0xf59e0b, speed: 0.25, opacity: 0.85 },
      { coords: [[32, -12], [26, -12], [20, -14], [14, -14], [6, -8]], color: 0x38bdf8, speed: 0.29, opacity: 0.85 },

      // === 5. ALIMENTADORES SUPERIORES E INFERIORES DIREITOS ===
      { coords: [[8, 16], [8, 12], [6, 10], [6, 6], [5, 3]], color: 0xf59e0b, speed: 0.25, opacity: 0.80 },
      { coords: [[14, 16], [14, 10], [10, 6], [7, 6], [5, 2]], color: 0x38bdf8, speed: 0.22, opacity: 0.80 },
      { coords: [[10, -16], [10, -10], [8, -6], [6, -6], [5, -3]], color: 0xff1744, speed: 0.27, opacity: 0.80 },
      { coords: [[16, -16], [16, -10], [12, -6], [8, -6], [5, -2]], color: 0x38bdf8, speed: 0.24, opacity: 0.80 },
    ];

    const packetGeo = new THREE.BoxGeometry(0.24, 0.10, 0.08);
    this.disposables.push(packetGeo);

    const viaGeo = new THREE.CircleGeometry(0.10, 16);
    this.disposables.push(viaGeo);

    for (let t = 0; t < traceDefs.length; t++) {
      const def = traceDefs[t];
      const curvePath = new THREE.CurvePath<THREE.Vector3>();

      for (let i = 0; i < def.coords.length - 1; i++) {
        const p1 = new THREE.Vector3(def.coords[i][0], def.coords[i][1], 0.05);
        const p2 = new THREE.Vector3(def.coords[i + 1][0], def.coords[i + 1][1], 0.05);
        curvePath.add(new THREE.LineCurve3(p1, p2));

        // Micro-via de junção nos pontos de dobra
        const viaMat = new THREE.MeshBasicMaterial({
          color: def.color,
          transparent: true,
          opacity: def.opacity * 0.9,
        });
        const viaMesh = new THREE.Mesh(viaGeo, viaMat);
        viaMesh.position.set(p1.x, p1.y, 0.06);
        this.tracesGroup.add(viaMesh);
        this.disposables.push(viaMat);
      }

      const points = curvePath.getPoints(def.coords.length * 6);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: def.color,
        linewidth: 2,
        transparent: true,
        opacity: def.opacity,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      this.tracesGroup.add(line);
      this.disposables.push(lineGeo, lineMat);

      // Pacote de Dados / Elétron Viajante
      const packetMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: def.color,
        emissiveIntensity: 3.5,
      });
      const packet = new THREE.Mesh(packetGeo, packetMat);
      packet.position.copy(points[0]);
      this.tracesGroup.add(packet);
      this.disposables.push(packetMat);

      this.pcbTraces.push({
        path: curvePath,
        points,
        line,
        packet,
        speed: def.speed,
        progress: (t * 0.07) % 1.0,
        color: new THREE.Color(def.color),
      });
    }

    this.pcbFlatBoardGroup?.add(this.tracesGroup);
  }

  // ==========================================
  // O MONUMENTO "MOKED" COMO PROCESSADOR CENTRAL (CPU CHIPSET)
  // TOTALMENTE FIXO E ESTÁVEL - SEM BALANÇAR
  // ==========================================
  private buildSculpturalMokedChipset(): void {
    this.mokedMonumentGroup = new THREE.Group();
    // Posição inicial fixa
    this.mokedMonumentGroup.rotation.set(0, 0, 0);

    this.mirrorChromeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.40,
      metalness: 0.22,
      roughness: 0.24,
      transparent: false,
      opacity: 1.0,
    });
    this.disposables.push(this.mirrorChromeMat);

    this.rubySiliconMat = new THREE.MeshStandardMaterial({
      color: 0xff1744,
      emissive: 0xff1744,
      emissiveIntensity: 2.4,
      metalness: 0.15,
      roughness: 0.20,
      transparent: false,
      opacity: 1.0,
    });
    this.disposables.push(this.rubySiliconMat);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      steps: 1,
      depth: 0.48,
      bevelEnabled: true,
      bevelThickness: 0.14,
      bevelSize: 0.11,
      bevelOffset: 0,
      bevelSegments: 6,
    };

    this.letterMeshes = [];

    // --- M ---
    const shapeM = new THREE.Shape();
    const mw = 0.46;
    shapeM.moveTo(-0.92, -1.25);
    shapeM.lineTo(-0.92, 1.25);
    shapeM.lineTo(-0.46, 1.25);
    shapeM.lineTo(0, 0.24);
    shapeM.lineTo(0.46, 1.25);
    shapeM.lineTo(0.92, 1.25);
    shapeM.lineTo(0.92, -1.25);
    shapeM.lineTo(0.92 - mw, -1.25);
    shapeM.lineTo(0.92 - mw, 0.48);
    shapeM.lineTo(0, -0.48);
    shapeM.lineTo(-(0.92 - mw), 0.48);
    shapeM.lineTo(-(0.92 - mw), -1.25);
    shapeM.closePath();

    const geoM = new THREE.ExtrudeGeometry(shapeM, extrudeSettings);
    geoM.center();
    const meshM = new THREE.Mesh(geoM, this.mirrorChromeMat);
    meshM.position.set(-3.9, 0, 0);
    this.mokedMonumentGroup.add(meshM);
    this.letterMeshes.push(meshM);
    this.disposables.push(geoM);

    // --- O COM SECURE ENCLAVE MOKED ---
    const shapeO = new THREE.Shape();
    const rw = 0.92;
    const rh = 1.25;
    shapeO.moveTo(-rw + 0.4, -rh);
    shapeO.lineTo(rw - 0.4, -rh);
    shapeO.quadraticCurveTo(rw, -rh, rw, -rh + 0.5);
    shapeO.lineTo(rw, rh - 0.5);
    shapeO.quadraticCurveTo(rw, rh, rw - 0.4, rh);
    shapeO.lineTo(-rw + 0.4, rh);
    shapeO.quadraticCurveTo(-rw, rh, -rw, rh - 0.5);
    shapeO.lineTo(-rw, -rh + 0.5);
    shapeO.quadraticCurveTo(-rw, -rh, -rw + 0.4, -rh);
    shapeO.closePath();

    const holeO = new THREE.Path();
    const inw = rw - 0.46;
    const inh = rh - 0.46;
    holeO.moveTo(-inw + 0.28, -inh);
    holeO.lineTo(inw - 0.28, -inh);
    holeO.quadraticCurveTo(inw, -inh, inw, -inh + 0.35);
    holeO.lineTo(inw, inh - 0.35);
    holeO.quadraticCurveTo(inw, inh, inw - 0.28, inh);
    holeO.lineTo(-inw + 0.28, inh);
    holeO.quadraticCurveTo(-inw, inh, -inw, inh - 0.35);
    holeO.lineTo(-inw, -inh + 0.35);
    holeO.quadraticCurveTo(-inw, -inh, -inw + 0.28, -inh);
    holeO.closePath();
    shapeO.holes.push(holeO);

    const geoO = new THREE.ExtrudeGeometry(shapeO, extrudeSettings);
    geoO.center();
    const meshO = new THREE.Mesh(geoO, this.mirrorChromeMat);
    meshO.position.set(-1.95, 0, 0);
    this.mokedMonumentGroup.add(meshO);
    this.letterMeshes.push(meshO);
    this.disposables.push(geoO);

    // Microprocessador Moked Shield no centro do O
    this.gyroShieldInO = new THREE.Group();
    this.gyroShieldInO.position.set(-1.95, 0, 0.12);

    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(0, 0.72);
    shieldShape.lineTo(0.52, 0.45);
    shieldShape.lineTo(0.52, 0.1);
    shieldShape.quadraticCurveTo(0.46, -0.42, 0, -0.74);
    shieldShape.quadraticCurveTo(-0.46, -0.42, -0.52, 0.1);
    shieldShape.lineTo(-0.52, 0.45);
    shieldShape.closePath();

    const sGeo = new THREE.ExtrudeGeometry(shieldShape, {
      steps: 1,
      depth: 0.18,
      bevelEnabled: true,
      bevelThickness: 0.045,
      bevelSize: 0.04,
      bevelSegments: 4,
    });
    sGeo.center();
    const sMesh = new THREE.Mesh(sGeo, this.rubySiliconMat);
    this.gyroShieldInO.add(sMesh);
    this.disposables.push(sGeo);

    // Checkmark Central em Platina
    const checkShape = new THREE.Shape();
    checkShape.moveTo(-0.24, 0.02);
    checkShape.lineTo(-0.08, -0.16);
    checkShape.lineTo(0.28, 0.2);
    checkShape.lineTo(0.2, 0.26);
    checkShape.lineTo(-0.08, -0.06);
    checkShape.lineTo(-0.18, 0.06);
    checkShape.closePath();
    const checkGeo = new THREE.ExtrudeGeometry(checkShape, {
      steps: 1,
      depth: 0.08,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
    });
    checkGeo.center();
    const checkMesh = new THREE.Mesh(checkGeo, this.mirrorChromeMat);
    checkMesh.position.z = 0.14;
    this.gyroShieldInO.add(checkMesh);
    this.disposables.push(checkGeo);

    this.mokedMonumentGroup.add(this.gyroShieldInO);

    // --- K ---
    const shapeK = new THREE.Shape();
    const kw = 0.46;
    shapeK.moveTo(-0.84, -1.25);
    shapeK.lineTo(-0.84, 1.25);
    shapeK.lineTo(-0.84 + kw, 1.25);
    shapeK.lineTo(-0.84 + kw, 0.26);
    shapeK.lineTo(0.38, 1.25);
    shapeK.lineTo(0.9, 1.25);
    shapeK.lineTo(0.1, 0.0);
    shapeK.lineTo(0.9, -1.25);
    shapeK.lineTo(0.35, -1.25);
    shapeK.lineTo(-0.3, -0.26);
    shapeK.lineTo(-0.84 + kw, -0.26);
    shapeK.lineTo(-0.84 + kw, -1.25);
    shapeK.closePath();

    const geoK = new THREE.ExtrudeGeometry(shapeK, extrudeSettings);
    geoK.center();
    const meshK = new THREE.Mesh(geoK, this.mirrorChromeMat);
    meshK.position.set(0.05, 0, 0);
    this.mokedMonumentGroup.add(meshK);
    this.letterMeshes.push(meshK);
    this.disposables.push(geoK);

    // --- E (SILÍCIO RUBI MOKED) ---
    const shapeE = new THREE.Shape();
    const ew = 0.46;
    shapeE.moveTo(-0.8, -1.25);
    shapeE.lineTo(-0.8, 1.25);
    shapeE.lineTo(0.8, 1.25);
    shapeE.lineTo(0.8, 1.25 - ew);
    shapeE.lineTo(-0.8 + ew, 1.25 - ew);
    shapeE.lineTo(-0.8 + ew, 0.24);
    shapeE.lineTo(0.6, 0.24);
    shapeE.lineTo(0.6, -0.24);
    shapeE.lineTo(-0.8 + ew, -0.24);
    shapeE.lineTo(-0.8 + ew, -1.25 + ew);
    shapeE.lineTo(0.8, -1.25 + ew);
    shapeE.lineTo(0.8, -1.25);
    shapeE.closePath();

    const geoE = new THREE.ExtrudeGeometry(shapeE, extrudeSettings);
    geoE.center();
    const meshE = new THREE.Mesh(geoE, this.rubySiliconMat);
    meshE.position.set(2.0, 0, 0);
    this.mokedMonumentGroup.add(meshE);
    this.letterMeshes.push(meshE);
    this.disposables.push(geoE);

    // --- D (SILÍCIO RUBI MOKED) ---
    const shapeD = new THREE.Shape();
    const dw = 0.46;
    shapeD.moveTo(-0.84, -1.25);
    shapeD.lineTo(-0.84, 1.25);
    shapeD.lineTo(0.14, 1.25);
    shapeD.quadraticCurveTo(0.84, 1.25, 0.84, 0.0);
    shapeD.quadraticCurveTo(0.84, -1.25, 0.14, -1.25);
    shapeD.closePath();

    const holeD = new THREE.Path();
    holeD.moveTo(-0.84 + dw, -1.25 + dw);
    holeD.lineTo(-0.84 + dw, 1.25 - dw);
    holeD.lineTo(0.1, 1.25 - dw);
    holeD.quadraticCurveTo(0.84 - dw, 1.25 - dw, 0.84 - dw, 0.0);
    holeD.quadraticCurveTo(0.84 - dw, -1.25 + dw, 0.1, -1.25 + dw);
    holeD.closePath();
    shapeD.holes.push(holeD);

    const geoD = new THREE.ExtrudeGeometry(shapeD, extrudeSettings);
    geoD.center();
    const meshD = new THREE.Mesh(geoD, this.rubySiliconMat);
    meshD.position.set(4.0, 0, 0);
    this.mokedMonumentGroup.add(meshD);
    this.letterMeshes.push(meshD);
    this.disposables.push(geoD);

    // ==========================================
    // SISTEMA DE BOOT DO PC: FLASH E ONDA DE CHOQUE
    // ==========================================
    this.bootFlashLight = new THREE.PointLight(0xe0f2fe, 0, 35);
    this.bootFlashLight.position.set(0, 0, 4.0);
    this.mokedMonumentGroup.add(this.bootFlashLight);

    const shockGeo = new THREE.RingGeometry(0.2, 0.5, 64);
    const shockMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    this.shockwaveRing = new THREE.Mesh(shockGeo, shockMat);
    this.shockwaveRing.position.set(0, 0, 0.35);
    this.shockwaveRing.visible = false;
    this.mokedMonumentGroup.add(this.shockwaveRing);
    this.disposables.push(shockGeo, shockMat);

    // Constrói os circuitos que desenham e formam o nome MOKED
    this.buildLetterCircuitFormingTracks(shapeM, shapeO, shieldShape, shapeK, shapeE, shapeD);

    // Constrói a anatomia interna de circuitos (trilhas, barramentos, vias e pacotes) de cada letra
    this.buildLetterInternalCircuitsArchitecture();

    this.mainGroup?.add(this.mokedMonumentGroup);
  }

  // ==========================================
  // ANATOMIA DE CIRCUITOS INTERNOS DAS LETRAS M-O-K-E-D
  // As letras são construídas por múltiplos barramentos paralelos,
  // pontes cruzadas, vias de solda douradas/rubi e pacotes de elétrons ativos
  // ==========================================
  private buildLetterInternalCircuitsArchitecture(): void {
    this.letterInternalCircuits = [];
    this.letterViasGroup = new THREE.Group();

    const goldBusMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 2.2,
      metalness: 0.98,
      roughness: 0.08,
    });
    this.disposables.push(goldBusMat);

    const cyanBusMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 2.4,
      metalness: 0.95,
      roughness: 0.1,
    });
    this.disposables.push(cyanBusMat);

    const rubyBusMat = new THREE.MeshStandardMaterial({
      color: 0xff1744,
      emissive: 0xff1744,
      emissiveIntensity: 2.8,
      metalness: 0.92,
      roughness: 0.1,
    });
    this.disposables.push(rubyBusMat);

    const viaGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.04, 12);
    viaGeo.rotateX(Math.PI / 2);
    this.disposables.push(viaGeo);

    const packetGeo = new THREE.BoxGeometry(0.18, 0.09, 0.08);
    this.disposables.push(packetGeo);

    // Helper para adicionar uma via de solda dourada ou rubi
    const addVia = (x: number, y: number, isRuby = false) => {
      const mesh = new THREE.Mesh(viaGeo, isRuby ? rubyBusMat : goldBusMat);
      mesh.position.set(x, y, 0.39);
      this.letterViasGroup?.add(mesh);
    };

    // Helper para registrar um barramento interno com pacote de dados
    const addInternalBus = (
      coords: [number, number][],
      mat: THREE.MeshStandardMaterial,
      colorHex: number,
      speed: number
    ) => {
      const curve = new THREE.CurvePath<THREE.Vector3>();
      for (let i = 0; i < coords.length - 1; i++) {
        const p1 = new THREE.Vector3(coords[i][0], coords[i][1], 0.38);
        const p2 = new THREE.Vector3(coords[i + 1][0], coords[i + 1][1], 0.38);
        curve.add(new THREE.LineCurve3(p1, p2));
      }
      const points = curve.getPoints(coords.length * 8);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(
        lineGeo,
        new THREE.LineBasicMaterial({
          color: colorHex,
          linewidth: 2,
          transparent: true,
          opacity: 0.92,
        })
      );
      this.mokedMonumentGroup?.add(line);
      this.disposables.push(lineGeo);

      // Pacote de elétron viajante interno
      const pMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: colorHex,
        emissiveIntensity: 4.2,
      });
      const packet = new THREE.Mesh(packetGeo, pMat);
      packet.position.copy(points[0]);
      this.mokedMonumentGroup?.add(packet);
      this.disposables.push(pMat);

      this.letterInternalCircuits.push({
        path: curve,
        points,
        line,
        packet,
        speed,
        progress: Math.random(),
        color: colorHex,
      });
    };

    // ------------------------------------------
    // 1. ANATOMIA DE CIRCUITO DA LETRA M (x = -3.9)
    // ------------------------------------------
    // Barramento Externo M
    addInternalBus(
      [
        [-4.65, -1.2],
        [-4.65, 1.15],
        [-3.9, 0.22],
        [-3.15, 1.15],
        [-3.15, -1.2],
      ],
      goldBusMat,
      0xf59e0b,
      0.32
    );

    // Barramento Intermediário M
    addInternalBus(
      [
        [-4.48, -1.2],
        [-4.48, 0.95],
        [-3.9, 0.0],
        [-3.32, 0.95],
        [-3.32, -1.2],
      ],
      cyanBusMat,
      0x38bdf8,
      0.38
    );

    // Barramento Interno M
    addInternalBus(
      [
        [-4.32, -1.2],
        [-4.32, 0.72],
        [-3.9, -0.22],
        [-3.48, 0.72],
        [-3.48, -1.2],
      ],
      goldBusMat,
      0xfbbf24,
      0.28
    );

    // Pontes cruzadas horizontais nas pernas de M
    const mBridgesY = [-0.75, 0.0, 0.75];
    for (const by of mBridgesY) {
      addInternalBus([[-4.65, by], [-4.32, by]], goldBusMat, 0xf59e0b, 0.2);
      addInternalBus([[-3.48, by], [-3.15, by]], goldBusMat, 0xf59e0b, 0.2);
    }
    // Vias nos nós de M
    addVia(-4.65, -1.2);
    addVia(-4.65, 1.15);
    addVia(-3.9, 0.22);
    addVia(-3.15, 1.15);
    addVia(-3.15, -1.2);
    addVia(-4.48, -1.2);
    addVia(-4.48, 0.95);
    addVia(-3.9, 0.0);
    addVia(-3.32, 0.95);
    addVia(-3.32, -1.2);

    // ------------------------------------------
    // 2. ANATOMIA DE CIRCUITO DA LETRA O (x = -1.95)
    // ------------------------------------------
    // Anel externo O
    addInternalBus(
      [
        [-1.95, 1.15],
        [-1.22, 1.15],
        [-1.22, -1.15],
        [-2.68, -1.15],
        [-2.68, 1.15],
        [-1.95, 1.15],
      ],
      cyanBusMat,
      0x38bdf8,
      0.35
    );

    // Anel intermediário O
    addInternalBus(
      [
        [-1.95, 0.92],
        [-1.4, 0.92],
        [-1.4, -0.92],
        [-2.5, -0.92],
        [-2.5, 0.92],
        [-1.95, 0.92],
      ],
      goldBusMat,
      0xf59e0b,
      0.42
    );

    // Anel interno O
    addInternalBus(
      [
        [-1.95, 0.72],
        [-1.55, 0.72],
        [-1.55, -0.72],
        [-2.35, -0.72],
        [-2.35, 0.72],
        [-1.95, 0.72],
      ],
      cyanBusMat,
      0x38bdf8,
      0.3
    );

    // 4 Pontes radiais em cruz
    addInternalBus([[-1.95, 1.15], [-1.95, 0.72]], cyanBusMat, 0x38bdf8, 0.25);
    addInternalBus([[-1.95, -1.15], [-1.95, -0.72]], cyanBusMat, 0x38bdf8, 0.25);
    addInternalBus([[-2.68, 0.0], [-2.35, 0.0]], cyanBusMat, 0x38bdf8, 0.25);
    addInternalBus([[-1.22, 0.0], [-1.55, 0.0]], cyanBusMat, 0x38bdf8, 0.25);

    // Vias nos cantos de O
    addVia(-1.22, 1.15);
    addVia(-1.22, -1.15);
    addVia(-2.68, -1.15);
    addVia(-2.68, 1.15);
    addVia(-1.4, 0.92);
    addVia(-1.4, -0.92);
    addVia(-2.5, -0.92);
    addVia(-2.5, 0.92);

    // ------------------------------------------
    // 3. ANATOMIA DE CIRCUITO DA LETRA K (x = 0.05)
    // ------------------------------------------
    // 3 Trilhas verticais na coluna de K
    addInternalBus([[-0.6 + 0.05, -1.2], [-0.6 + 0.05, 1.2]], goldBusMat, 0xf59e0b, 0.34);
    addInternalBus([[-0.46 + 0.05, -1.2], [-0.46 + 0.05, 1.2]], cyanBusMat, 0x38bdf8, 0.38);
    addInternalBus([[-0.32 + 0.05, -1.2], [-0.32 + 0.05, 1.2]], goldBusMat, 0xfbbf24, 0.3);

    // 2 Barramentos diagonais superiores
    addInternalBus([[-0.32 + 0.05, 0.1], [0.72 + 0.05, 1.2]], goldBusMat, 0xf59e0b, 0.36);
    addInternalBus([[-0.32 + 0.05, -0.1], [0.52 + 0.05, 1.2]], cyanBusMat, 0x38bdf8, 0.4);

    // 2 Barramentos diagonais inferiores
    addInternalBus([[-0.15 + 0.05, 0.22], [0.72 + 0.05, -1.2]], goldBusMat, 0xf59e0b, 0.35);
    addInternalBus([[-0.28 + 0.05, 0.1], [0.52 + 0.05, -1.2]], cyanBusMat, 0x38bdf8, 0.32);

    // Vias de solda em K
    addVia(-0.6 + 0.05, 1.2);
    addVia(-0.6 + 0.05, -1.2);
    addVia(-0.32 + 0.05, 0.1);
    addVia(0.72 + 0.05, 1.2);
    addVia(0.72 + 0.05, -1.2);
    addVia(0.52 + 0.05, 1.2);
    addVia(0.52 + 0.05, -1.2);

    // ------------------------------------------
    // 4. ANATOMIA DE CIRCUITO DA LETRA E (x = 2.0, SILÍCIO RUBI)
    // ------------------------------------------
    // 3 Trilhas verticais na coluna de E
    addInternalBus([[-0.65 + 2.0, -1.2], [-0.65 + 2.0, 1.2]], rubyBusMat, 0xff1744, 0.36);
    addInternalBus([[-0.5 + 2.0, -1.2], [-0.5 + 2.0, 1.2]], goldBusMat, 0xf59e0b, 0.32);
    addInternalBus([[-0.35 + 2.0, -1.2], [-0.35 + 2.0, 1.2]], rubyBusMat, 0xff1744, 0.4);

    // Barra Superior de E
    addInternalBus([[-0.35 + 2.0, 1.18], [0.72 + 2.0, 1.18]], rubyBusMat, 0xff1744, 0.34);
    addInternalBus([[-0.35 + 2.0, 0.98], [0.72 + 2.0, 0.98]], goldBusMat, 0xf59e0b, 0.3);

    // Barra Média de E
    addInternalBus([[-0.35 + 2.0, 0.12], [0.52 + 2.0, 0.12]], rubyBusMat, 0xff1744, 0.35);
    addInternalBus([[-0.35 + 2.0, -0.08], [0.52 + 2.0, -0.08]], goldBusMat, 0xf59e0b, 0.32);

    // Barra Inferior de E
    addInternalBus([[-0.35 + 2.0, -0.98], [0.72 + 2.0, -0.98]], rubyBusMat, 0xff1744, 0.33);
    addInternalBus([[-0.35 + 2.0, -1.18], [0.72 + 2.0, -1.18]], goldBusMat, 0xf59e0b, 0.36);

    // Vias nos terminais das barras de E
    addVia(-0.65 + 2.0, 1.2, true);
    addVia(-0.65 + 2.0, -1.2, true);
    addVia(0.72 + 2.0, 1.18, true);
    addVia(0.72 + 2.0, 0.98, true);
    addVia(0.52 + 2.0, 0.12, true);
    addVia(0.52 + 2.0, -0.08, true);
    addVia(0.72 + 2.0, -0.98, true);
    addVia(0.72 + 2.0, -1.18, true);

    // ------------------------------------------
    // 5. ANATOMIA DE CIRCUITO DA LETRA D (x = 4.0, SILÍCIO RUBI)
    // ------------------------------------------
    // 3 Trilhas verticais na coluna de D
    addInternalBus([[-0.65 + 4.0, -1.2], [-0.65 + 4.0, 1.2]], rubyBusMat, 0xff1744, 0.35);
    addInternalBus([[-0.5 + 4.0, -1.2], [-0.5 + 4.0, 1.2]], cyanBusMat, 0x38bdf8, 0.38);
    addInternalBus([[-0.35 + 4.0, -1.2], [-0.35 + 4.0, 1.2]], rubyBusMat, 0xff1744, 0.32);

    // Arco curvo externo de D
    addInternalBus(
      [
        [-0.35 + 4.0, 1.18],
        [0.25 + 4.0, 1.18],
        [0.82 + 4.0, 0.5],
        [0.82 + 4.0, -0.5],
        [0.25 + 4.0, -1.18],
        [-0.35 + 4.0, -1.18],
      ],
      rubyBusMat,
      0xff1744,
      0.4
    );

    // Arco curvo interno de D
    addInternalBus(
      [
        [-0.35 + 4.0, 0.95],
        [0.15 + 4.0, 0.95],
        [0.6 + 4.0, 0.35],
        [0.6 + 4.0, -0.35],
        [0.15 + 4.0, -0.95],
        [-0.35 + 4.0, -0.95],
      ],
      goldBusMat,
      0xf59e0b,
      0.33
    );

    // 2 Pontes radiais em D
    addInternalBus([[0.82 + 4.0, 0.0], [-0.35 + 4.0, 0.0]], rubyBusMat, 0xff1744, 0.28);
    addInternalBus([[0.6 + 4.0, 0.35], [-0.35 + 4.0, 0.35]], cyanBusMat, 0x38bdf8, 0.25);

    // Vias nos nós de D
    addVia(-0.65 + 4.0, 1.2, true);
    addVia(-0.65 + 4.0, -1.2, true);
    addVia(0.82 + 4.0, 0.5, true);
    addVia(0.82 + 4.0, -0.5, true);
    addVia(0.82 + 4.0, 0.0, true);
    addVia(0.25 + 4.0, 1.18, true);
    addVia(0.25 + 4.0, -1.18, true);

    this.mokedMonumentGroup?.add(this.letterViasGroup);
  }

  // ==========================================
  // CIRCUITOS QUE DESENHAM O NOME MOKED
  // As linhas viajam e contornam cada letra, como se estivessem gravando a placa
  // ==========================================
  private buildLetterCircuitFormingTracks(
    shapeM: THREE.Shape,
    shapeO: THREE.Shape,
    shieldShape: THREE.Shape,
    shapeK: THREE.Shape,
    shapeE: THREE.Shape,
    shapeD: THREE.Shape
  ): void {
    this.formingTracks = [];

    const addTrack = (points: THREE.Vector3[], color: number, startTime: number, duration: number) => {
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      lineGeo.setDrawRange(0, 0);

      const lineMat = new THREE.LineBasicMaterial({
        color,
        linewidth: 2,
        transparent: true,
        opacity: 0.95,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      this.mokedMonumentGroup?.add(line);
      this.disposables.push(lineGeo, lineMat);

      const sparkGeo = new THREE.SphereGeometry(0.09, 8, 8);
      const sparkMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
      });
      const spark = new THREE.Mesh(sparkGeo, sparkMat);
      spark.visible = false;
      this.mokedMonumentGroup?.add(spark);
      this.disposables.push(sparkGeo, sparkMat);

      this.formingTracks.push({
        points,
        geometry: lineGeo,
        line,
        spark,
        startTime,
        duration,
        color,
      });
    };

    // 1. LETRA M (x = -3.9)
    const ptsM = shapeM.getPoints(54).map((p) => new THREE.Vector3(p.x - 3.9, p.y, 0.32));
    addTrack(ptsM, 0xf59e0b, 0.1, 0.5);

    // 2. LETRA O (x = -1.95)
    const ptsO = shapeO.getPoints(54).map((p) => new THREE.Vector3(p.x - 1.95, p.y, 0.32));
    const ptsOHole = shapeO.holes[0].getPoints(36).map((p) => new THREE.Vector3(p.x - 1.95, p.y, 0.32));
    const ptsShield = shieldShape.getPoints(36).map((p) => new THREE.Vector3(p.x - 1.95, p.y, 0.35));
    addTrack(ptsO, 0x38bdf8, 0.3, 0.5);
    addTrack(ptsOHole, 0x38bdf8, 0.5, 0.4);
    addTrack(ptsShield, 0xff1744, 0.7, 0.35);

    // 3. LETRA K (x = 0.05)
    const ptsK = shapeK.getPoints(54).map((p) => new THREE.Vector3(p.x + 0.05, p.y, 0.32));
    addTrack(ptsK, 0xfbbf24, 0.8, 0.5);

    // 4. LETRA E (x = 2.0)
    const ptsE = shapeE.getPoints(54).map((p) => new THREE.Vector3(p.x + 2.0, p.y, 0.32));
    addTrack(ptsE, 0xff1744, 1.1, 0.5);

    // 5. LETRA D (x = 4.0)
    const ptsD = shapeD.getPoints(54).map((p) => new THREE.Vector3(p.x + 4.0, p.y, 0.32));
    const ptsDHole = shapeD.holes[0].getPoints(36).map((p) => new THREE.Vector3(p.x + 4.0, p.y, 0.32));
    addTrack(ptsD, 0xff1744, 1.4, 0.5);
    addTrack(ptsDHole, 0xf59e0b, 1.6, 0.35);
  }

  // ==========================================
  // CONTROLE DE MODOS
  // ==========================================
  public setMode(mode: Shield3DMode): void {
    this.mode = mode;
    this.applyMode(mode);
  }

  private applyMode(mode: Shield3DMode): void {
    if (!this.mokedMonumentGroup) return;

    if (this.mirrorChromeMat) this.mirrorChromeMat.wireframe = false;
    if (this.rubySiliconMat) this.rubySiliconMat.wireframe = false;

    if (mode === 'shield') {
      if (this.mirrorChromeMat) this.mirrorChromeMat.color.setHex(0xf8fafc);
      if (this.rubySiliconMat) this.rubySiliconMat.emissive.setHex(0xff1744);
    } else if (mode === 'radar') {
      if (this.mirrorChromeMat) this.mirrorChromeMat.color.setHex(0x38bdf8);
      if (this.rubySiliconMat) this.rubySiliconMat.emissive.setHex(0x0ea5e9);
    } else if (mode === 'hyper') {
      if (this.mirrorChromeMat) this.mirrorChromeMat.color.setHex(0xffffff);
      if (this.rubySiliconMat) this.rubySiliconMat.emissive.setHex(0xff0055);
      this.triggerCircuitSurge();
    }
  }

  // ==========================================
  // POSICIONAMENTO RESPONSIVO EM TELA CHEIA (SEM BALANÇO)
  // ==========================================
  private updateLayoutPositions(w: number, h: number): void {
    if (!this.mokedMonumentGroup || !this.camera) return;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    this.mokedMonumentGroup.visible = true;
    if (this.mainGroup) this.mainGroup.visible = true;

    // Altura e largura visíveis em unidades do Three.js no plano z = 0
    const vFovRad = (this.camera.fov * Math.PI) / 180;
    const letterSpan = 8.4; // Extensão horizontal total das letras M-O-K-E-D

    if (w >= 1024) {
      // Desktop & Ultrawide: Mantém posição padrão desktop, ajustando apenas se a tela estreita (1024-1280) for cortar a borda direita
      this.camera.position.z = 9.8;
      const visibleHeight = 2 * Math.tan(vFovRad / 2) * this.camera.position.z;
      const visibleWidth = visibleHeight * (w / h);
      const halfWidth = visibleWidth / 2;

      let posX = w > 1920 ? 3.6 : (w > 1440 ? 3.1 : 2.5);
      let scale = w > 1920 ? 0.85 : (w > 1440 ? 0.80 : 0.74);

      // Garante que a letra D não seja cortada na borda direita em notebooks estreitos (1024px-1366px)
      const rightLimit = halfWidth - 0.35;
      if (posX + 4.95 * scale > rightLimit) {
        scale = Math.max(0.46, (rightLimit - 1.8) / 4.95);
        posX = Math.max(1.6, rightLimit - 4.95 * scale);
      }

      this.mokedMonumentGroup.position.set(posX, 0.0, 0.2);
      this.mokedMonumentGroup.scale.set(scale, scale, scale);
    } else if (w >= 768) {
      // Tablets (768px - 1023px): Centralizado no topo com escala dinâmica proporcional à largura visível
      this.camera.position.z = 10.0;
      const visibleHeight = 2 * Math.tan(vFovRad / 2) * this.camera.position.z;
      const visibleWidth = visibleHeight * (w / h);
      const safeScale = Math.min(0.55, Math.max(0.35, (visibleWidth * 0.74) / letterSpan));

      this.mokedMonumentGroup.position.set(0, 1.45, 0.2);
      this.mokedMonumentGroup.scale.set(safeScale, safeScale, safeScale);
      this.mokedMonumentGroup.rotation.set(0, 0, 0);
    } else {
      // Mobile Phones (320px - 767px): Posição superior com escala calculada para NUNCA cortar as pontas de M e D
      this.camera.position.z = 10.4;
      const visibleHeight = 2 * Math.tan(vFovRad / 2) * this.camera.position.z;
      const visibleWidth = visibleHeight * (w / h);
      // Garante que as letras caibam com folga dentro da largura visível
      const safeScale = Math.min(0.38, Math.max(0.24, (visibleWidth * 0.76) / letterSpan));

      this.mokedMonumentGroup.position.set(0, 1.85, 0.2);
      this.mokedMonumentGroup.scale.set(safeScale, safeScale, safeScale);
      this.mokedMonumentGroup.rotation.set(0, 0, 0);
    }
  }

  // ==========================================
  // INTERATIVIDADE DO MOUSE (APENAS MOVE A LUZ DINÂMICA)
  // ==========================================
  private bindEvents(host: HTMLDivElement): void {
    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      const y = ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1;
      this.targetPointerX = Math.max(-1.5, Math.min(1.5, x));
      this.targetPointerY = Math.max(-1.5, Math.min(1.5, y));
    };

    const onLeave = () => {
      this.targetPointerX = 0;
      this.targetPointerY = 0;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerleave', onLeave, { passive: true });

    this.removePointerListener = () => {
      window.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
    };

    this.resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.max(entry.contentRect.width, 320);
      const h = Math.max(entry.contentRect.height, 320);
      if (this.renderer) {
        this.renderer.setSize(w, h, false);
      }
      this.updateLayoutPositions(w, h);
    });

    this.resizeObserver.observe(host);
  }

  // ==========================================
  // LOOP DE ANIMAÇÃO & SEQUÊNCIA DE BOOT DE PC
  // TOTALMENTE ESTÁVEL - NENHUM BALANÇO OU TREMULAÇÃO
  // ==========================================
  private update(elapsed: number, delta = 0.016): void {
    if (!this.mainGroup) return;

    this.bootTime += delta;

    // 1. PROGRESSÃO DOS CIRCUITOS FORMANDO O NOME MOKED
    for (const track of this.formingTracks) {
      if (this.bootTime < track.startTime) {
        track.geometry.setDrawRange(0, 0);
        track.spark.visible = false;
      } else {
        const progress = Math.min(1.0, (this.bootTime - track.startTime) / track.duration);
        const count = Math.floor(progress * track.points.length);
        track.geometry.setDrawRange(0, count);

        if (progress > 0.01 && progress < 0.99) {
          track.spark.visible = true;
          const idx = Math.min(Math.max(0, count - 1), track.points.length - 1);
          track.spark.position.copy(track.points[idx]);
          track.spark.scale.setScalar(1.0 + Math.sin(this.bootTime * 32.0) * 0.4);
        } else {
          track.spark.visible = false;
        }
      }
    }

    // 2. FASES DO BOOT DE PC (FORMAÇÃO -> FLASH DE ALTA VOLTAGEM -> ONLINE)
    const surgeSpeed = this.surgeProgress < 1.0 ? 3.5 : 1.0;
    const speed = (this.mode === 'hyper' ? 2.2 : 1.0) * surgeSpeed;

    if (this.bootTime < 2.75) {
      // FASE 1: DESENHANDO OS CIRCUITOS (Logo MOKED sempre 100% visível e iluminada)
      this.bootState = 'forming';
      if (this.mirrorChromeMat) {
        this.mirrorChromeMat.color.setHex(0xf8fafc);
        this.mirrorChromeMat.emissive.setHex(0x1e293b);
        this.mirrorChromeMat.emissiveIntensity = 0.35;
        this.mirrorChromeMat.roughness = 0.08;
      }
      if (this.rubySiliconMat) {
        this.rubySiliconMat.color.setHex(0xc8102e);
        this.rubySiliconMat.emissive.setHex(0xff1744);
        this.rubySiliconMat.emissiveIntensity = 2.2;
      }
      if (this.bootFlashLight) {
        this.bootFlashLight.intensity = 0;
      }
      if (this.shockwaveRing) {
        this.shockwaveRing.visible = false;
      }
    } else if (this.bootTime < 3.45) {
      // FASE 2: 💥 FLASH DE BOOT DO PC (POWER-ON SELF TEST & IGNIÇÃO)
      this.bootState = 'boot_flash';
      const bootProgress = (this.bootTime - 2.75) / 0.7; // 0.0 -> 1.0
      const flashDecay = Math.max(0, 1.0 - bootProgress);

      // Flash elétrico de alta voltagem que simula ligar a fonte do computador
      if (this.bootFlashLight) {
        this.bootFlashLight.intensity = 28.0 * flashDecay * flashDecay;
      }

      // Onda de choque circular percorrendo toda a placa-mãe
      if (this.shockwaveRing) {
        this.shockwaveRing.visible = true;
        this.shockwaveRing.scale.setScalar(0.2 + bootProgress * 34.0);
        (this.shockwaveRing.material as THREE.MeshBasicMaterial).opacity = Math.max(
          0,
          (1.0 - bootProgress) * 0.95
        );
      }

      // Letras MOK acendem em titânio cromo espelhado com flash
      if (this.mirrorChromeMat) {
        this.mirrorChromeMat.color.setHex(0xf8fafc);
        this.mirrorChromeMat.emissive.setHex(0x38bdf8);
        this.mirrorChromeMat.emissiveIntensity = 0.2 + flashDecay * 4.0;
        this.mirrorChromeMat.roughness = 0.06;
      }

      // Letras ED acendem em cristal de silício rubi incandescente
      if (this.rubySiliconMat) {
        this.rubySiliconMat.color.setHex(0xc8102e);
        this.rubySiliconMat.emissive.setHex(0xff1744);
        this.rubySiliconMat.emissiveIntensity = 2.0 + flashDecay * 6.5;
      }

      // Microchips piscam LEDs verdes e vermelhos em teste POST
      for (let l = 0; l < this.microchipLeds.length; l++) {
        const led = this.microchipLeds[l];
        const mat = led.mesh.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = Math.sin(this.bootTime * 50.0 + l * 2) > 0 ? 5.5 : 0.8;
      }
    } else {
      // FASE 3: SISTEMA 100% ONLINE E ESTABILIZADO (24/7 OPERATIONAL)
      this.bootState = 'online';
      if (this.bootFlashLight) {
        this.bootFlashLight.intensity = 0;
      }
      if (this.shockwaveRing) {
        this.shockwaveRing.visible = false;
      }
      if (this.mirrorChromeMat) {
        this.mirrorChromeMat.color.setHex(0xffffff);
        this.mirrorChromeMat.emissive.setHex(0x38bdf8);
        this.mirrorChromeMat.emissiveIntensity = 0.40;
        this.mirrorChromeMat.roughness = 0.24;
        this.mirrorChromeMat.metalness = 0.22;
      }
      if (this.rubySiliconMat) {
        this.rubySiliconMat.color.setHex(0xff1744);
        this.rubySiliconMat.emissive.setHex(0xff1744);
        this.rubySiliconMat.emissiveIntensity = 2.4;
        this.rubySiliconMat.roughness = 0.20;
        this.rubySiliconMat.metalness = 0.15;
      }

      // LEDs normais pulsantes
      for (let l = 0; l < this.microchipLeds.length; l++) {
        const led = this.microchipLeds[l];
        const intensity = 1.6 + Math.sin(elapsed * led.freq * speed) * 1.6;
        const mat = led.mesh.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = intensity;
      }
    }

    // 3. FLUXO CONTÍNUO DE PACOTES DE DADOS DENTRO DAS PRÓPRIAS LETRAS DE MOKED
    for (let b = 0; b < this.letterInternalCircuits.length; b++) {
      const bus = this.letterInternalCircuits[b];
      bus.progress = (bus.progress + bus.speed * 0.018 * speed) % 1.0;
      const point = bus.path.getPointAt(bus.progress);
      if (point) {
        bus.packet.position.copy(point);
      }
    }

    // 4. FLUXO CONTÍNUO DE PACOTES DE DADOS PELAS TRILHAS DE CIRCUITO DA PLACA (100% DA TELA)
    for (let t = 0; t < this.pcbTraces.length; t++) {
      const trace = this.pcbTraces[t];
      trace.progress = (trace.progress + trace.speed * 0.015 * speed) % 1.0;

      const point = trace.path.getPointAt(trace.progress);
      if (point) {
        trace.packet.position.copy(point);
      }
    }

    // 5. SECURE ENCLAVE NO CENTRO DO 'O'
    if (this.gyroShieldInO) {
      this.gyroShieldInO.rotation.y = Math.sin(elapsed * 2.0) * 0.28;
    }

    // 6. REFLEXOS SUAVES DO MOUSE
    this.currentPointerX += (this.targetPointerX - this.currentPointerX) * 0.06;
    this.currentPointerY += (this.targetPointerY - this.currentPointerY) * 0.06;
    if (this.dynamicPointLight && this.mokedMonumentGroup) {
      this.dynamicPointLight.position.x =
        this.mokedMonumentGroup.position.x + this.currentPointerX * 4.8;
      this.dynamicPointLight.position.y =
        this.mokedMonumentGroup.position.y - this.currentPointerY * 3.6 + 1.2;
    }

    // 7. ROTAÇÃO 3D SUTIL (REVELA PROFUNDIDADE E BISEL DO MONUMENTO)
    if (this.mokedMonumentGroup) {
      this.mokedMonumentGroup.rotation.y = Math.sin(elapsed * 0.8) * 0.12;
      this.mokedMonumentGroup.rotation.x = Math.sin(elapsed * 0.5) * 0.04;
    }

    // 8. PULSO DO PROCESSADOR CENTRAL
    if (this.coreRubyLight) {
      const freq = this.mode === 'hyper' ? 8.5 : 3.8;
      this.coreRubyLight.intensity = 5.5 + Math.sin(elapsed * freq) * 2.8;
    }

    // 9. SOBRECARGA DE ENERGIA AO CLICAR
    if (this.surgeProgress < 1.0) {
      this.surgeProgress += 0.02;
    }
  }
}
