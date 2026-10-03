// stage.ts – the camera, the lights and the drawing for a 3D place in Pet Me 3D. Mia designed this game.
import {
  Color, DirectionalLight, HemisphereLight, Material, Mesh, PCFSoftShadowMap, PerspectiveCamera, Scene, Vector3,
  WebGLRenderer,
} from "three";
import type { Object3D } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { AUTO_SPIN, CAMERA_BACK, CAMERA_HEIGHT, NIGHT_COLOUR } from "./settings";

const MS_IN_A_SECOND: number = 1000;
const LONGEST_FRAME: number = 0.1; // if the page was slow, never jump more than this many seconds
const CLOSEST: number = 3; // the closest you can zoom in
const FLATTEST_VIEW: number = 1.15; // the camera never tips lower than this, so you always look down on things
const STEEPEST_VIEW: number = 0.2; // and never looks straight down
const DAY_SKY_LIGHT: number = 1.5; // how bright the light from the sky is in the day
const DAY_SUN: number = 2.5; // and the sun
const NIGHT_SKY_LIGHT: number = 0.15; // how bright the sky light is at night
const NIGHT_SUN: number = 0.1; // and the sun (the moon, really)

// this throws away one 3D thing when the game closes
function throwAway(thing: Object3D): void {
  if (!(thing instanceof Mesh)) return;
  thing.geometry.dispose();
  if (thing.material instanceof Material) thing.material.dispose();
}

// this throws away a 3D thing and everything in it, when it isn't needed any more
export function throwAwayAll(thing: Object3D): void {
  thing.traverse(throwAway);
}

// a Stage3D is where a 3D place is shown: its camera, its lights, and the drawing
export class Stage3D {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer | null;
  controls: OrbitControls | null;
  now: number; // when the last picture was drawn, in seconds
  skyColour: string;
  skyLight: HemisphereLight;
  sun: DirectionalLight;

  constructor() {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(45, 1, 0.1, 200);
    this.renderer = null;
    this.controls = null;
    this.now = 0;
    this.skyColour = "white";
    this.skyLight = new HemisphereLight("white", "sienna", DAY_SKY_LIGHT);
    this.sun = new DirectionalLight("white", DAY_SUN);
  }

  // this gets drawing ready on the canvas: the sky colour, the sun, and a camera you can spin
  start(canvas: HTMLCanvasElement, skyColour: string, farthest: number): void {
    const renderer = new WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer = renderer;

    this.skyColour = skyColour;
    this.scene.background = new Color(skyColour);
    this.scene.add(this.skyLight);
    this.sun.position.set(4, 8, 5);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(1024, 1024);
    this.scene.add(this.sun);

    this.camera.position.set(0, CAMERA_HEIGHT, CAMERA_BACK);
    const controls = new OrbitControls(this.camera, canvas);
    controls.target.set(0, 0.6, 0);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.minDistance = CLOSEST;
    controls.maxDistance = farthest;
    controls.maxPolarAngle = FLATTEST_VIEW;
    controls.minPolarAngle = STEEPEST_VIEW;
    controls.autoRotate = AUTO_SPIN > 0;
    controls.autoRotateSpeed = AUTO_SPIN;
    this.controls = controls;
  }

  // this gets ready for the next picture, and says how many seconds passed since the last one
  nextFrame(): number {
    const now = performance.now() / MS_IN_A_SECOND;
    const seconds = Math.min(LONGEST_FRAME, now - this.now);
    this.now = now;
    if (this.renderer != null) this.fitToCanvas(this.renderer);
    return seconds;
  }

  // this makes it dark, like night, or light again
  darken(dark: boolean): void {
    this.scene.background = new Color(dark ? NIGHT_COLOUR : this.skyColour);
    this.skyLight.intensity = dark ? NIGHT_SKY_LIGHT : DAY_SKY_LIGHT;
    this.sun.intensity = dark ? NIGHT_SUN : DAY_SUN;
  }

  // this says which way is "forward" on the ground, from where the camera looks
  groundForward(): Vector3 {
    const forward = this.camera.getWorldDirection(new Vector3());
    forward.y = 0;
    return forward.normalize();
  }

  // this moves the camera along with a spot, so it always looks at it
  follow(spot: Vector3): void {
    if (this.controls == null) return;
    const shift = new Vector3(spot.x - this.controls.target.x, 0, spot.z - this.controls.target.z);
    this.controls.target.add(shift);
    this.camera.position.add(shift);
  }

  // this draws the picture
  draw(): void {
    if (this.renderer == null || this.controls == null) return;
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  // this keeps the picture the right shape when the window changes size
  fitToCanvas(renderer: WebGLRenderer): void {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const pixels = renderer.getPixelRatio();
    if (canvas.width === Math.floor(width * pixels) && canvas.height === Math.floor(height * pixels)) return;
    renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  // this throws everything away when the game closes
  stop(): void {
    if (this.controls != null) this.controls.dispose();
    this.scene.traverse(throwAway);
    if (this.renderer != null) this.renderer.dispose();
    this.renderer = null;
    this.controls = null;
  }
}
