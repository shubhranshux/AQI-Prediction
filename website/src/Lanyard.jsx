import { useEffect, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, Html, RoundedBox } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

extend({ MeshLineGeometry, MeshLineMaterial });

export default function Lanyard({ position = [0, 0, 30], gravity = [0, -40, 0], fov = 20, transparent = true }) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex justify-center items-center">
      <Canvas
        camera={{ position: position, fov: fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
        style={{ pointerEvents: 'auto' }}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band isMobile={isMobile} />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}

function Band({ maxSpeed = 50, minSpeed = 0, isMobile = false }) {
  const band = useRef(), fixed = useRef(), j1 = useRef(), j2 = useRef(), j3 = useRef(), card = useRef();
  const vec = new THREE.Vector3(), ang = new THREE.Vector3(), rot = new THREE.Vector3(), dir = new THREE.Vector3();
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 };
  
  const [curve] = useState(() => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]));
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 2.5, 0]]); // Offset changed to fit horizontal card

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }
    if (fixed.current) {
      [j1, j2].forEach(ref => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = 'chordal';

  return (
    <>
      <group position={[0, 6, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        
        {/* Horizontal Stats Card */}
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[4, 1.2, 0.2]} />
          
          <group
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={e => (e.target.releasePointerCapture(e.pointerId), drag(false))}
            onPointerDown={e => (
              e.target.setPointerCapture(e.pointerId),
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
            )}
          >
            {/* Glassmorphic 3D Box */}
            <RoundedBox args={[8, 2.4, 0.1]} radius={0.3} smoothness={4}>
              <meshPhysicalMaterial 
                color="#ffffff"
                transmission={0.2}
                opacity={0.9}
                transparent
                roughness={0.1}
                metalness={0.1}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </RoundedBox>

            {/* Top Clip (where lanyard attaches) */}
            <mesh position={[0, 1.3, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.4, 16]} rotation={[0, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Stats HTML Overlay projected onto the 3D card */}
            <Html 
              transform 
              distanceFactor={10} 
              position={[0, 0, 0.06]} 
              zIndexRange={[100, 0]}
              style={{ width: '600px', pointerEvents: 'none' }}
            >
              <div style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '20px 40px',
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '42px', fontWeight: 900, color: '#111827', lineHeight: 1 }}>98.83%</div>
                  <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: 600, marginTop: '8px' }}>Model Accuracy</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '42px', fontWeight: 900, color: '#3b82f6', lineHeight: 1 }}>400+</div>
                  <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: 600, marginTop: '8px' }}>Locations Covered</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '42px', fontWeight: 900, color: '#22c55e', lineHeight: 1 }}>9</div>
                  <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: 600, marginTop: '8px' }}>Districts in Odisha</div>
                </div>
              </div>
            </Html>
            
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial color="#fbbf24" depthTest={false} resolution={isMobile ? [1000, 2000] : [1000, 1000]} lineWidth={1.5} />
      </mesh>
    </>
  );
}
