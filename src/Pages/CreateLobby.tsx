import NavBar from "../Components/NavBar";
import CurMatchesBox from "../Components/CurMatchesBox";
import CreateMatchForm from "../Components/CreateMatchForm";
import "./CreateLobby.css";

function CreateLobby() {

  // #########################################################################
  // ####### ADD logic to get data for previous and current matches ##########
  // #########################################################################

  return (
    <div className="create-lobby-page">
      <NavBar/>
      <div className="create-lobby-content">
        {/* Left Panel - Information about upcoming matches */}
        <div className="matches-info-container">
          <CurMatchesBox/>
        </div>
        {/* Right Panel - Form to create a new match */}
        <CreateMatchForm username="Guest Host"/>
      </div>
    </div>
  );
}

export default CreateLobby;