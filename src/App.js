import { BrowserRouter as Router,Routes,Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login"
import Profileverification from "./pages/Profileverification";
import Search from "./pages/Search";
import UserProfile from "./pages/UserProfile";
import Offer from "./pages/Offer";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Connection from "./pages/Connection";
import Like from "./pages/Like";
import Chat from "./pages/Chat";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home></Home>}></Route>
         <Route path="/Login" element={<Login></Login>}></Route>
           <Route path="/verification" element={<Profileverification></Profileverification>}></Route>
           <Route path="/search" element={<Search></Search>}></Route>
           <Route path='/userprofile' element={<UserProfile></UserProfile>}></Route>
             <Route path='/offer' element={<Offer></Offer>}></Route>
             <Route path='/profile' element={<Profile></Profile>}></Route>
              <Route path='/editProfile' element={<EditProfile></EditProfile>}></Route>
              <Route path='/connection' element={<Connection></Connection>}></Route>
              <Route path="/like" element={<Like></Like>}></Route>
              <Route path="/chat" element={<Chat></Chat>}></Route>
      </Routes>
    </Router>
  );
}

export default App;
