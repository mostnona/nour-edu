import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Letters from './pages/Letters'
import Numbers from './pages/Numbers'
import Colors from './pages/Colors'
import Runner from './pages/Runner'
import Exercise from './pages/Exercise'
import Curriculum from './pages/Curriculum'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/letters" element={<Letters />} />
      <Route path="/numbers" element={<Numbers />} />
      <Route path="/colors" element={<Colors />} />
      <Route path="/runner" element={<Runner />} />
      <Route path="/exercise" element={<Exercise />} />
      <Route path="/curriculum" element={<Curriculum />} />
    </Routes>
  )
}
