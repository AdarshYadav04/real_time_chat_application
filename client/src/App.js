import "./App.css";
import Homepage from "./pages/Homepage";
import Chatpage from "./pages/Chatpage";
import { Route, Routes } from "react-router-dom";

const App=()=> {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Homepage/>}/>
        <Route path="/chats" element={<Chatpage/>}/>
      </Routes>

    </div>
  );
}

export default App;
