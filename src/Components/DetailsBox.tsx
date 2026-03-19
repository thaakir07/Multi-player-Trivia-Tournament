import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useLocalStorage from "../Backend/UseLocalStorage";
import { startLoading, stopLoading } from "./LoadingScreen";
import './DetailsBox.css';
const myIP = import.meta.env.VITE_MY_IP;

type Rem = {
  remembered: boolean;
  username: string;
  password: string;
}

type detailBoxProps = {
    hasAccount: boolean,
    setHasAccount: React.Dispatch<React.SetStateAction<boolean>>,
};

const DetailsBox = ({hasAccount, setHasAccount}: detailBoxProps) => {
    const [localHasAccount, setLocalHasAccount] = useLocalStorage('hasAccount', hasAccount);
    const portNumber = window.location.port;
    const [rem, setRem] = useLocalStorage(`rem_${portNumber}`, {});
    const [user, setUser] = useLocalStorage(`user_${portNumber}`, {});
    const [token, setToken] = useLocalStorage(`currentToken_${portNumber}`, "");
    const [refreshToken, setRefreshToken] = useLocalStorage(`refreshToken_${portNumber}`, "");
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [check, setChecked] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        let remString = localStorage.getItem(`rem_${portNumber}`);
        if (remString) {
            const matches = [...remString.matchAll(/:([^,}]+)/g)].map(m => m[1].trim());
            if (matches[0] === "true") {
                setRem({});
                setUsername(matches[1].slice(1, -1));
                setPassword(matches[2].slice(1, -1));
            }
        }
    }, []);

    const handleRem  = (remembered:boolean, password:string, username:string) => {
        if (remembered) {
            setRem({remembered, password, username});
        } else {
            setRem({});
        }
    }

    const toggleLogin = () => {
        setPassword('');
        setEmail('');
        setLocalHasAccount(!localHasAccount);
        setHasAccount(!localHasAccount);
    }

    async function loginUser(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            startLoading();
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            });

            if (res.status === 401) {
                navigate("/");
                localStorage.removeItem(`currentToken_${portNumber}`);
                return;
            }

            const data = await res.json();

            if (!res.ok) {
                alert("Error: " + data.error);
                stopLoading();
                return;
            }

            setUser(data.user);
            setToken(data.token);
            setRefreshToken(data.refreshToken);
            if ( data.user.role === "user") {
                navigate("/profile");
            } else {
                navigate("/admin");
            }
            stopLoading();
        } catch (err) {
            stopLoading();
            if (err instanceof Error) {
                console.error("Network error:", err.message);
                alert("Network error: " + err.message);
            } else {
                console.error("An unknown error occurred.");
            }
        }
    }


    async function registerUser(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            startLoading();
            const res = await fetch(`/api/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password,
                    avatar_url: "https://www.svgrepo.com/show/452030/avatar-default.svg",
                    role: "user",
                }),
            });

            const data: Response = await res.json();

            console.log("User created successfully:", data);
            navigate("/profile");
            setUser(data);
            navigate("/profile");
            
        } catch (err) {
            stopLoading();
            if (err instanceof Error) {
                console.error("Network error:", err.message);
                alert("Network error: " + err.message);
            } else {
                console.error("An unknown error occurred.");
            }
        }
    }

    return (
        <div className='details-Box'>
            {localHasAccount ?
                <div className="login-box">
                    <h1> Login: </h1>
                    <form onSubmit={loginUser}>
                        <div className="user-box">
                            <label>Username: </label>
                            <input type="text" value={username} required onChange={(e) => setUsername(e.target.value)}/>
                        </div>
                        <div className="user-box">
                            <label>Password: </label>
                            <input type="password" value={password} required onChange={(e) => setPassword(e.target.value)}/>
                        </div>
                        <div className='remember-me-box'>
                            <label> Remember me: </label>
                            <input type="checkbox" name="" className='remember-me-checkbox'
                              onChange={(e) => {handleRem(e.target.checked, username, password )}}
                            />
                        </div>
                        <button className='submit-button'> Submit </button>
                    </form>
                    <a onClick={toggleLogin}> Don't have an account? sign up here. </a>
                </div>
             :
                <div className="signUp-box">
                    <h1> Sign Up: </h1>
                    <form onSubmit={registerUser}>
                        <div className="user-box">
                            <label>Username: </label>
                            <input type="text" value={username} required onChange={(e) => setUsername(e.target.value)} />
                        </div>
                        <div className="email-box">
                            <label>Email: </label>
                            <input type="email" value={email} required onChange={(e) => setEmail(e.target.value)}/>
                        </div>
                        <div className="user-box">
                            <label>Password: </label>
                            <input type="password" value={password} required onChange={(e) => setPassword(e.target.value)}/>
                        </div>
                        <div className='remember-me-box'>
                            <label> Remember me: </label>
                            <input type="checkbox" name="" className='remember-me-checkbox'
                              onChange={(e) => {setRem({ remembered: e.target.checked, username, password })}}
                            />
                        </div>
                        <button type="submit" className='submit-button'> Submit </button>
                    </form>
                    <a onClick={toggleLogin}> Already have an account? Log in here. </a>
                </div>
            }

        </div>
    )
}

export default DetailsBox;