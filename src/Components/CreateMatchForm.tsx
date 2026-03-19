import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateMatchForm.css";
import { startLoading, stopLoading } from "./LoadingScreen";

const catMap: Record<string, number> = {
  "General Knowledge": 9,
  "Entertainment: Books": 10,
  "Entertainment: Film": 11,
  "Entertainment: Music": 12,
  "Entertainment: Musicals & Theatres": 13,
  "Entertainment: Television": 14,
  "Entertainment: Video Games": 15,
  "Entertainment: Board Games": 16,
  "Science & Nature": 17,
  "Science: Computers": 18,
  "Science: Mathematics": 19,
  "Mythology": 20,
  "Sports": 21,
  "Geography": 22,
  "History": 23,
  "Politics": 24,
  "Art": 25,
  "Celebrities": 26,
  "Animals": 27,
  "Vehicles": 28,
  "Entertainment: Comics": 29,
  "Science: Gadgets": 30,
  "Entertainment: Japanese Anime & Manga": 31,
  "Entertainment: Cartoon & Animations": 32
};

interface createMatchFormProps {
  username: string;
}

function CreateMatchForm({username}: createMatchFormProps) {
  const navigate = useNavigate();

  const categories = Object.keys(catMap);

  // Variable to store the currently active category dropdown
  let [activeCatDropdown, setActiveCatDropdown] = useState<number | null>(null);

  // Varibales to store match details
  let [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Select a Category", "Select a Category", "Select a Category", "Select a Category"
  ]);
  let [selectedDiff, setSelectedDiff] = useState<string>("Select a Difficulty");
  let [numQuestions, setNumQuestions] = useState<number>(4);
  let [isCreating, setIsCreating] = useState<boolean>(false);

  function selectCategory(category: string, index: number) {
    const newCategories = [...selectedCategories];

    // Check if any of the other dropdowns already have the selected category selected and remove it
    for (let i = 0; i < newCategories.length; i++) {
      if (i !== index && newCategories[i] === category) {
        newCategories[i] = "Select a Category";
      }
    }

    newCategories[index] = category;
    setSelectedCategories(newCategories);
  }

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setNumQuestions(value);
  }

  const createMatch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    e.preventDefault();
    setIsCreating(true);

    try {
      startLoading()
      // Validate form data
      if (selectedDiff === "Select a Difficulty") {
        alert("Please select a difficulty level");
        setIsCreating(false);
        return;
      }

      // Filter out unselected categories
      const validCategories = selectedCategories.filter(cat => cat !== "Select a Category");

      if (validCategories.length === 0) {
        alert("Please select at least one category");
        setIsCreating(false);
        return;
      }

      // Get token from 
      const postNumber = window.location.port;
      let token = localStorage.getItem(`currentToken_${postNumber}`);
      if (token) {
        // Remove quotes if they exist around the token
        token = token.replace(/^"|"$/g, "");
      } else {
        alert("Authentication required. Please log in.");
        // navigate("/");
        setIsCreating(false);
        return;
      }

      console.log("Creating match with:", {
        categories: validCategories,
        difficulty: selectedDiff,
        numQuestions: numQuestions
      });

      // Make API call to create match
      const res = await fetch("/api/createMatch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          difficulty: selectedDiff,
          numQuestions: numQuestions,
          categories: validCategories
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Error creating match: " + data.error);
        setIsCreating(false);
        return;
      }

      console.log("Match created successfully:", data);


      if (data.match && data.match.id) {
        navigate(`/waitingLobby/${data.match.id}`, {
          state: {
            isHost: true,
            username: username,
            categories: validCategories,
            difficulty: selectedDiff,
            numQuestions: numQuestions,
            matchId: data.match.id
          }
        });
      } else {
        // Fallback: navigate back to createLobby to see the match in current matches
        navigate('/createLobby');
      }
      stopLoading();
    } catch (err) {
      if (err instanceof Error) {
        console.error("Network error:", err.message);
        alert("Network error: " + err.message);
      } else {
        console.error("An unknown error occurred.");
        alert("An unknown error occurred.");
      }
    } finally {
      setIsCreating(false);
    }

    // ######################################################################################
    // ########### ADD LOGIC TO CREATE MATCH USING WEB SCRAPER AND SERVER API ###############
    // ######################################################################################

  }

  return (
 <div className="create-match-form">
      <form className="create-match-form" onSubmit={createMatch}>
      <h2>Match Categories:</h2>
      <div className="categories-container">
        {selectedCategories.map((category, index) => (
          <details
            key={index}
            id={`cat-drop-${index}`}
            className="category-dropdown-container"
            open={activeCatDropdown === index}
            onToggle={(e) => {
              const isOpen = (e.target as HTMLDetailsElement).open;
              if (isOpen) {
                setActiveCatDropdown(index); // Set current as active dropdown
              } else {
                setActiveCatDropdown(null); // close previous active
              }
            }}>
            <summary className="category-dropdown-button">{category}</summary>
            <ul>
              {categories.map((cat, catIndex) => (
                <li key={catIndex}>
                  <button className="category-button" type="button" onClick={() => selectCategory(cat, index)}>{cat}</button>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
      <h2>Question Difficulty:</h2>
      <details className="difficulty-dropdown-container">
        <summary className="difficulty-dropdown-button">{selectedDiff}</summary>
        <ul>
          <li><button id="easy" className="difficulty-button" type="button"  onClick={() => setSelectedDiff("Easy")}>Easy</button></li>
          <li><button id="medium" className="difficulty-button" type="button"  onClick={() => setSelectedDiff("Medium")}>Medium</button></li>
          <li><button id="hard" className="difficulty-button" type="button"  onClick={() => setSelectedDiff("Hard")}>Hard</button></li>
        </ul>
      </details>
      <h2>Questions per round:</h2>
      <div className="nq-slider-wrapper">
          <input type="range" min="4" max="7" step="1" value={numQuestions} onChange={handleSlider}/>
          <span className="nq-value">Questions per round: {numQuestions}</span>
      </div>
      <button className="create-match-button" type="submit" disabled={isCreating}>
        {isCreating ? "Creating..." : "Create Match"}
      </button>
      </form>
    </div>
  );
}

export default CreateMatchForm;