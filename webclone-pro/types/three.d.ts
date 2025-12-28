import { extend, Object3DNode } from '@react-three/fiber'
import { Mesh, MeshStandardMaterial, BoxGeometry } from 'three'

declare module '@react-three/fiber' {
  interface ThreeElements {
    mesh: Object3DNode<Mesh, typeof Mesh>
    boxGeometry: Object3DNode<BoxGeometry, typeof BoxGeometry>
    meshStandardMaterial: Object3DNode<MeshStandardMaterial, typeof MeshStandardMaterial>
  }
}