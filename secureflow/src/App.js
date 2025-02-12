import './App.css';
import {BrowserRouter as Router,Route, Routes} from 'react-router-dom';
import Home from './components/Home';
import Encryption from './components/Encryption';
import Decryption from './components/Decryption';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/encryption" element={<Encryption/>}/>
        <Route path="/decryption" element={<Decryption/>}/>
      </Routes>
    </Router>
  );
}

export default App;
