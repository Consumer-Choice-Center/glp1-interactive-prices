import * as THREE from "three";

type ZepboundVialProps = {
  position?: [number, number, number];
  scale?: number;
  autoRotate?: boolean;
  rotationSpeed?: number;
  dose: string;
  accent: string;
};

// Native Three.js adaptation of the supplied React Three Fiber vial.
// Vial geometry follows the original design; label accents follow the selected dose.
export default function ZepboundVial({
  position = [0, 0, 0], scale = 1, autoRotate = true, rotationSpeed = 0.22, dose, accent,
}: ZepboundVialProps) {
  const group = new THREE.Group();
  group.position.set(...position);
  group.scale.setScalar(scale);
  group.userData.autoRotate = autoRotate;
  group.userData.rotationSpeed = rotationSpeed;
  const add = (geometry: THREE.BufferGeometry, material: THREE.Material,
    position: [number, number, number] = [0, 0, 0],
    rotation: [number, number, number] = [0, 0, 0], renderOrder = 0) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.rotation.set(...rotation);
    mesh.renderOrder = renderOrder;
    group.add(mesh);
  };
  const profile = [
    [0, -1.6], [0.72, -1.6], [0.77, -1.52], [0.79, -1.38],
    [0.79, 0.62], [0.77, 0.76], [0.70, 0.92], [0.58, 1.05],
    [0.48, 1.13], [0.43, 1.26], [0.43, 1.48], [0.48, 1.54], [0, 1.54],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const glass = new THREE.LatheGeometry(profile, 96);
  glass.computeVertexNormals();

  add(new THREE.CylinderGeometry(0.70, 0.70, 0.72, 72),
    new THREE.MeshPhysicalMaterial({ color: "#f5d995", transparent: true, opacity: 0.72,
      roughness: 0.18, metalness: 0, transmission: 0.2, thickness: 0.3 }), [0, -1.12, 0]);
  add(new THREE.CircleGeometry(0.69, 72),
    new THREE.MeshPhysicalMaterial({ color: "#ffe8ad", transparent: true, opacity: 0.58,
      roughness: 0.12, side: THREE.DoubleSide }), [0, -0.755, 0], [Math.PI / 2, 0, 0]);
  add(glass, new THREE.MeshPhysicalMaterial({ color: "#d9efff", transparent: true,
    opacity: 0.32, roughness: 0.08, metalness: 0, transmission: 0.86, thickness: 0.24,
    ior: 1.47, clearcoat: 1, clearcoatRoughness: 0.08, side: THREE.DoubleSide,
    depthWrite: false }), [0, 0, 0], [0, 0, 0], 2);
  add(new THREE.CylinderGeometry(0.76, 0.72, 0.16, 96),
    new THREE.MeshPhysicalMaterial({ color: "#cceaff", transparent: true, opacity: 0.48,
      transmission: 0.62, roughness: 0.06, thickness: 0.45, ior: 1.47, clearcoat: 1 }), [0, -1.50, 0]);
  add(new THREE.CylinderGeometry(0.797, 0.797, 1.18, 96, 1, true),
    new THREE.MeshStandardMaterial({ color: "#fffaf2", roughness: 0.56, metalness: 0,
      side: THREE.DoubleSide }), [0, -0.10, 0], [0, 0, 0], 3);
  add(new THREE.CylinderGeometry(0.806, 0.806, 0.24, 96, 1, true, 0, 1.10),
    new THREE.MeshStandardMaterial({ color: accent, roughness: 0.48, side: THREE.DoubleSide }),
    [0, 0.34, 0], [0, -Math.PI * 0.76, 0], 4);
  add(new THREE.CylinderGeometry(0.806, 0.806, 0.25, 96, 1, true, 0, 1.18),
    new THREE.MeshStandardMaterial({ color: accent, roughness: 0.48, side: THREE.DoubleSide }),
    [0, -0.52, 0], [0, Math.PI * 0.20, 0], 4);
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 1024;
  labelCanvas.height = 640;
  const labelContext = labelCanvas.getContext("2d")!;
  labelContext.fillStyle = "#fffaf2";
  labelContext.fillRect(0, 0, 1024, 640);
  labelContext.fillStyle = accent;
  labelContext.fillRect(0, 0, 1024, 52);
  labelContext.fillStyle = "#102445";
  labelContext.font = "bold 136px Arial";
  labelContext.textAlign = "center";
  labelContext.textBaseline = "middle";
  labelContext.fillText("Zepbound", 512, 174, 960);
  labelContext.fillStyle = "#5d6e83";
  labelContext.font = "46px Arial";
  labelContext.fillText("tirzepatide injection", 512, 294, 960);
  labelContext.fillStyle = accent;
  labelContext.fillRect(96, 360, 832, 16);
  labelContext.font = "bold 112px Arial";
  labelContext.fillText(`${dose} mg`, 512, 490, 960);
  const labelTexture = new THREE.CanvasTexture(labelCanvas);
  labelTexture.colorSpace = THREE.SRGBColorSpace;
  add(new THREE.CylinderGeometry(0.81, 0.81, 0.96, 96, 1, true, -0.78, 1.56),
    new THREE.MeshBasicMaterial({ map: labelTexture, side: THREE.DoubleSide }),
    [0, -0.10, 0], [0, 0, 0], 5);
  add(new THREE.CylinderGeometry(0.45, 0.45, 0.25, 72),
    new THREE.MeshStandardMaterial({ color: "#545260", roughness: 0.62 }), [0, 1.46, 0]);
  add(new THREE.CylinderGeometry(0.63, 0.55, 0.34, 96),
    new THREE.MeshPhysicalMaterial({ color: "#b9c8d9", metalness: 0.88, roughness: 0.2, clearcoat: 0.7 }), [0, 1.61, 0]);
  add(new THREE.CylinderGeometry(0.67, 0.67, 0.18, 96),
    new THREE.MeshPhysicalMaterial({ color: "#d5e2ef", metalness: 0.9, roughness: 0.16, clearcoat: 1 }), [0, 1.78, 0]);
  add(new THREE.CylinderGeometry(0.43, 0.43, 0.075, 72),
    new THREE.MeshStandardMaterial({ color: "#f6e8c5", roughness: 0.48 }), [0, 1.885, 0]);
  add(new THREE.CapsuleGeometry(0.035, 1.95, 8, 16),
    new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.28, depthWrite: false }),
    [-0.48, 0.12, 0.58], [0, -0.65, 0], 6);
  return group;
}
