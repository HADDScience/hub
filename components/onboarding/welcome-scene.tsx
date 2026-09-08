"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js"

/** A single canvas keeps the blurred peripheral sculpture lightweight. */
export default function WelcomeScene({ step }: { step: number }) {
  const host = useRef<HTMLDivElement>(null)
  const chapter = useRef(step)
  useEffect(() => {
    chapter.current = step
  }, [step])

  useEffect(() => {
    const container = host.current
    if (!container) return
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    } catch {
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.4))
    renderer.setClearColor(0x000000, 0)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    container.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-8, 8, 5, -5, 0.1, 50)
    camera.position.z = 15
    const pmrem = new THREE.PMREMGenerator(renderer)
    const room = new RoomEnvironment()
    const environment = pmrem.fromScene(room, 0.04)
    scene.environment = environment.texture
    room.dispose()
    pmrem.dispose()
    scene.add(new THREE.HemisphereLight(0xffffff, 0x66c2ea, 1.3))
    const light = new THREE.DirectionalLight(0xffffff, 2.5)
    light.position.set(-3, 5, 6)
    scene.add(light)
    // Exact HADD palette: blue/sky dominate; orange and magenta are small accents.
    const materials = [
      "#0C4DA2",
      "#66C2EA",
      "#D6EDF9",
      "#F7941D",
      "#E6007E",
    ].map(
      (color) =>
        new THREE.MeshPhysicalMaterial({
          color,
          metalness: 0.18,
          roughness: 0.25,
          clearcoat: 1,
          clearcoatRoughness: 0.18,
        })
    )
    const geometries = [
      new THREE.TorusKnotGeometry(0.78, 0.28, 90, 16, 2, 3),
      new THREE.SphereGeometry(0.9, 32, 24),
      new THREE.TorusGeometry(1, 0.3, 32, 80),
      new THREE.OctahedronGeometry(0.5, 0),
      new THREE.CapsuleGeometry(0.24, 0.6, 8, 16),
    ]
    const meshes = geometries.map((geometry, i) => {
      const mesh = new THREE.Mesh(geometry, materials[i])
      mesh.rotation.set(0.5 + i * 0.3, 0.4, i * 0.5)
      scene.add(mesh)
      return mesh
    })
    let width = 16
    let mobile = false
    const anchors = [
      [-0.46, 0.37],
      [0.46, 0.34],
      [0.46, -0.42],
      [-0.44, -0.4],
      [0.31, -0.49],
    ]
    function resize() {
      const bounds = container!.getBoundingClientRect()
      renderer.setSize(bounds.width, bounds.height)
      width = (bounds.width / Math.max(bounds.height, 1)) * 10
      mobile = bounds.width < 760
      camera.left = -width / 2
      camera.right = width / 2
      camera.updateProjectionMatrix()
      meshes.forEach((mesh) => mesh.scale.setScalar(mobile ? 0.65 : 1))
    }
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    resize()
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const pointer = new THREE.Vector2()
    function move(event: PointerEvent) {
      pointer.set(
        event.clientX / innerWidth - 0.5,
        event.clientY / innerHeight - 0.5
      )
    }
    window.addEventListener("pointermove", move)
    let previous = 0,
      time = 0
    function render(now: number) {
      const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 0
      previous = now
      if (!media.matches) time += delta
      meshes.forEach((mesh, i) => {
        mesh.position.set(
          anchors[i][0] * width + (media.matches ? 0 : pointer.x * 0.12),
          anchors[i][1] * 10 + Math.sin(time * 0.35 + i) * 0.12,
          0
        )
        mesh.rotation.y = 0.4 + Math.sin(time * 0.2 + i) * 0.2
        mesh.rotation.z =
          i * 0.5 + Math.sin(time * 0.15) * 0.15 + chapter.current * 0.04
      })
      renderer.render(scene, camera)
      container!.classList.add("is-ready")
    }
    function visibility() {
      previous = 0
      renderer.setAnimationLoop(document.hidden ? null : render)
    }
    function lost() {
      container!.classList.remove("is-ready")
      renderer.setAnimationLoop(null)
    }
    document.addEventListener("visibilitychange", visibility)
    renderer.domElement.addEventListener("webglcontextlost", lost)
    visibility()
    return () => {
      renderer.setAnimationLoop(null)
      observer.disconnect()
      document.removeEventListener("visibilitychange", visibility)
      window.removeEventListener("pointermove", move)
      renderer.domElement.removeEventListener("webglcontextlost", lost)
      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((material) => material.dispose())
      environment.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])
  return <div className="welcome-canvas" ref={host} />
}
