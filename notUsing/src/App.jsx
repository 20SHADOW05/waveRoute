import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import Model from './Scene'
import { Environment, OrbitControls } from '@react-three/drei'
import './index.css'

function App() {

  return (
    <>
      <Canvas >
		<ambientLight />
		<OrbitControls enableZoom={false} />
        <Suspense fallback={null} >
			<Model/>
		</Suspense>
		<Environment preset='sunset'/>
      </Canvas>
    </>
  )
}

export default App
