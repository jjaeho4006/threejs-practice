import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {Canvas} from "@react-three/fiber";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <div id={"container"}>
          <div className={"aim"}></div>
          <Canvas camera={{fov: 45}} shadows>
              <App />
          </Canvas>
      </div>
  </StrictMode>,
)
