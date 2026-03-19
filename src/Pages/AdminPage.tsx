import SortIcon from "../assets/alpha-sort-icon.svg";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./AdminPage.css";

const catMap: Record<string, number> = {
  "All": 0,
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

// const [questionUpdate, setQ] = useState<Question>();

export interface Question {
  id: number;
  type: string;
  difficulty: string;
  categories: any[];
  question: string;
  answer: string;
  options: any[];
}

function AdminPage() {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isEditingQuestion, setIsEditing] = useState(false);
    const [isAddingQuestion, setIsAdding] = useState(false);
    const [qID, setQId] = useState<number>(-1);
    const [loadingDeleteId, setLoadingDeleteId] = useState<number | null>(null);
    const [inputDisabled, setInputDisabled] = useState(false);
    const curMatchCode = "32DS3#@1";

    // Filtering and searching states
    const [filterCategory, setFilterCategory] = useState("All");
    const [localSearch, setLocalSearch] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const emptyQuestion: Question = {
        id: -1,
        type: "Multiple Choice",
        difficulty: "",
        categories: [],
        question: "",
        answer: "",
        options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
    };

    async function getAllQuestions() {
        try {
            const portNumber = window.location.port;
            let token = localStorage.getItem(`currentToken_${portNumber}`);
            if (token) {
                token = token.replace(/^"|"$/g, "");
            } else {
                alert("Token is null!");
                return;
            }

            const res = await fetch("/api/getAllQuestions", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (res.status === 401) {
                navigate("/");
                localStorage.removeItem(`currentToken_${portNumber}`);
                return;
            }

            const data = await res.json();

            if (!res.ok) {
                alert("Error: " + data.error);
                navigate("/");
                return;
            }

            const q = data as Question[];

            setQuestions(q);
        } catch (err) {
            if (err instanceof Error) {
                console.error("Network error:", err.message);
                alert("Network error: " + err.message);
                navigate("/");
            } else {
                console.error("An unknown error occurred.");
            }
        }
    }

    async function handleDelete(qID: number) {
        try {
            setLoadingDeleteId(qID);
            setInputDisabled(true);
            const portNumber = window.location.port;
            const user = localStorage.getItem(`user_${portNumber}`);
            let u: any = null;
            if (user) {
                u = JSON.parse(user);
            }

            const port = window.location.port;
            let token = localStorage.getItem(`currentToken_${port}`);
            if (token) {
                token = token.replace(/^"|"$/g, "");
            } else {
                alert("Token is null!");
                return;
            }

            const res = await fetch("/api/deleteQuestion", {
                method: "POST",
                headers: { "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,},
                body: JSON.stringify({role: u.role, questionId:questions[qID].id}),
            });

            if (res.status === 401) {
                navigate("/");
                localStorage.removeItem(`currentToken_${portNumber}`);
                return;
            }

            const data = await res.json();

            if (!res.ok) {
                alert("Error: " + data.error);
                // navigate("/");
                return;
            }
            await getAllQuestions();
            setLoadingDeleteId(null);
            setInputDisabled(false);
        } catch (err) {
            if (err instanceof Error) {
                console.error("Network error:", err.message);
                alert("Network error: " + err.message);
                navigate("/");
            } else {
                console.error("An unknown error occurred.");
            }
        }
    }

    async function handleAdd(qID: number) {
        setQId(-1);
        setIsEditing(false);
        setIsAdding(true);
    }

    async function updateQuestion(q: Question, idx: number) {
        const editedQ = {
            type: q.type,
            difficulty: q.difficulty,
            category: q.categories[0].text || "General Knowledge", // map first category
            question: q.question,
            correct_answer: q.options[0].text,
            incorrect_answers: q.options.slice(1).map(opt => opt.text),
        };

        try {
            console.log("Updated Question: ", editedQ);
            const res = await fetch("/api/addQuestions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify([editedQ]),
            });

            const data = await res.json();

            if (!res.ok) {
                alert("Error: " + data.error);
                // navigate("/");
                return;
            }

            await handleDelete(idx);
            await getAllQuestions();
            setIsEditing(false);
        } catch (err) {
            if (err instanceof Error) {
                console.error("Network error:", err.message);
                alert("Network error: " + err.message);
                navigate("/");
            } else {
                console.error("An unknown error occurred.");
            }
        }

    }

    function handleEdit(questionId: number) {
        setIsEditing(true);
        setQId(questionId);
    }

    useEffect(() => {
        getAllQuestions();
    }, []);

    function decode(i: string): string {
        return new DOMParser().parseFromString(i,"text/html").body.textContent!;
    }

    const filteredQuestions = questions.filter(q => {
        // Category filter
        const catMatch = filterCategory === "All" || q.categories.some(cat => cat.text === filterCategory);

        // Search filter
        const questionText = decode(q.question).toLowerCase();
        const searchTerm = searchQuery.toLowerCase().trim();
        const searchMatch = questionText.includes(searchTerm);

        // Apply both filters to find matching set of questions
        return catMatch && searchMatch;
    });

    return (
        <div className="admin-page">
            <div className="question-bank">
                <h1 className="qb-title">Question Bank</h1>
                <div className="table-wrapper">
                    <table className="qb-table">
                        <thead>
                            <tr>
                                <th className="cat-col">
                                    <div className="header-content">
                                        <label>Category</label>
                                        <button><img src={SortIcon} alt="Sort button" className="sort-icon"/></button>
                                    </div>
                                </th>
                                <th className="quest-col">
                                    <div className="header-content">
                                        <label>Question</label>
                                        <button><img src={SortIcon} alt="Sort button" className="sort-icon"/></button>
                                    </div>
                                </th>
                                <th className="opt-col">Options</th>
                                <th className="answer-col">Answer</th>
                                <th className="edit-col">Management</th>
                            </tr>
                        </thead>
                            <tbody className="qbody">
                            {filteredQuestions.map((q) => (
                                <tr key={q.id}>
                                <td>{q.categories.map((c:any) => c.text).join(", ")}</td>
                                <td>{decode(q.question)}</td>
                                <td>{q.options.map((o:any) => decode(o.text)).join(", ")}</td>
                                <td>{q.answer}</td>
                                <td>
                                    <button className="edit-button" onClick={() => handleEdit(q.id)}>Edit</button>
                                    <button className="del-button"
                                        onClick={() => handleDelete(q.id)}
                                        disabled={inputDisabled}
                                    >
                                      {loadingDeleteId === q.id ? <span className="spinner"></span> : "Delete"}
                                    </button>
                                </td>
                                </tr>
                            ))}
                            </tbody>
                    </table>
                </div>
            </div>
            {isEditingQuestion && (
                <EditQuestion q={questions[qID]} setIsEditing={setIsEditing} updateQuestion={updateQuestion} qID={qID}/>
            )}
            <div className="right-panel">
                <div className="search-box">
                    <h1>Searching</h1>
                    <div className="category-box">
                        <label>Category: </label>
                        <details className="category-dropdown">
                            <summary className="category-dd-button">Choose a category</summary>
                            <ul className="category-dd-list">
                                {Object.keys(catMap).map((cat) => (
                                <li key={cat}><button onClick={() => setFilterCategory(cat)}>{cat}</button></li>
                                ))}
                            </ul>
                        </details>
                    </div>
                    <div className="question-box">
                        <label>Question: </label>
                        <input
                            type="search"
                            id="quest-search"
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key == "Enter") {
                                    setSearchQuery(localSearch); // Only filter list on Enter Press
                                }
                            }
                            }/>
                    </div>
                </div>
                <div className="match-data-box">
                    <h1> Live Match data</h1>
                    <div className="info-box">
                        <ul>
                            <details className="match-info-dropdown">
                                <summary>Match: {curMatchCode}</summary>
                                <label>Current Players:</label>
                                <ul>
                                    <li>
                                        <label>Deon</label><button>Delete</button>
                                    </li>
                                    <li>
                                        <label>Jack</label><button>Delete</button>
                                    </li>
                                    <li>
                                        <label>Tashreeqh</label><button>Delete</button>
                                    </li>
                                </ul>
                            </details>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

function EditQuestion({ q, setIsEditing, updateQuestion, qID }: { q: Question; setIsEditing: (v: boolean) => void;
  updateQuestion(q: Question, idx: number): Promise<void>; qID: number }) {
  const [form, setForm] = useState<Question>({ ...q });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof Question, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...form.options];
    updated[index].text = value;
    setForm({ ...form, options: updated });
  };

  const handleSubmit = () => {
    updateQuestion(form, qID);
    setIsSaving(true);
  };

  return (
    <div className="editing-container">
      <div className="editing-form">
        <h1>Editing question: "{decode(form.question)}"</h1>
        <div className="question-box">
            <input
                type="text"
                placeholder="Question"
                value={decode(form.question)}
                onChange={(e) => handleChange("question", e.target.value)}
            />
        </div>


        <select
          className="diffdropbox"
          value={form.categories[0].text}
          onChange={(e) => handleChange("categories", [{ text: e.target.value }])}
        >
          {Object.keys(catMap).map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        <select
          className="diffdropbox"
          value={form.difficulty}
          onChange={(e) => handleChange("difficulty", e.target.value)}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <div className="input-group">
          {form.options.map((opt, i) => (
            <div className="optbox" key={i} id={`opt${i+1}`}>
              <label>{i === 0 ? "Correct Option" : "Incorrect Option"}</label>
              <input
                type="text"
                placeholder={`Option ${i + 1}`}
                value={opt.text}
                onChange={(e) => handleOptionChange(i, e.target.value)}
              />
            </div>
          ))}
        </div>

        <button className="edit-button" onClick={handleSubmit} disabled={isSaving}>
          { isSaving ? <span className="spinner"></span> : "Save"}
        </button>
        <button className="edit-button" onClick={() => setIsEditing(false)} disabled={isSaving}>
          Cancel
        </button>
      </div>
    </div>
  );
}


function decode(i: string): string {
    return new DOMParser().parseFromString(i,"text/html").body.textContent!;
}

export default AdminPage;