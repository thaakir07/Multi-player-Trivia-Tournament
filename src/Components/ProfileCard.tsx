import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { startLoading, stopLoading } from "./LoadingScreen";
import "./ProfileCard.css";

interface ProfileCardProps {
  username: string;
  profilePic: string;
  gamesPlayed: number;
  highScore: number;
  curDate: string;
}

type Profile = {
  username: string;
  profilePic: string;
};

function ProfileCard({ username, profilePic, gamesPlayed, highScore, curDate }: ProfileCardProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profile, setProfile] = useState<Profile>({ username, profilePic });
  const navigate = useNavigate();

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, username: e.target.value });
  };

  const handleEditToggle = async () => {
    if (isEditingProfile) {
      console.log("Profile saved:", profile);
      await saveProfile();
    }
    setIsEditingProfile((prev) => !prev);
  };

  const handleImgClick = () => {
    if (!isEditingProfile) {
      setIsEditingProfile(true);
    }
  };

  async function handleDeleteUser() {
    if (confirm("Are you sure you want to delete your profile?")) {
      startLoading();
      const portNumber = window.location.port;
      let token = localStorage.getItem(`currentToken_${portNumber}`);
      if (token) token = token.replace(/^"|"$/g, "");
      if (!token) {
        console.error("No token found in localStorage");
        return;
      }

      try {

        let id: number = -1;
        const portNumber = window.location.port;
        const user = localStorage.getItem(`user_${portNumber}`);
        if (user) {
            id = JSON.parse(user).player_id;
        }

        const res = await fetch("/api/deleteUser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id }),
        });
        if (res.status === 401) {
          navigate("/");
          localStorage.removeItem(`currentToken_${portNumber}`);
          return;
        }

        await res.json();
        navigate("/");
      } catch (error) {
        console.error("Save failed:", error);
      }
      stopLoading();
    } 
  }

  async function saveProfile() {
    const portNumber = window.location.port;
    let token = localStorage.getItem(`currentToken_${portNumber}`);
    if (token) token = token.replace(/^"|"$/g, "");
    if (!token) {
      console.error("No token found in localStorage");
      return;
    }

    try {
      startLoading();
      const res = await fetch("/api/editUsername", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newUsername: profile.username }),
      });
      if (res.status === 401) {
        stopLoading();
        navigate("/");
        localStorage.removeItem(`currentToken_${portNumber}`);
        return;
      }
      const data = await res.json();
      console.log("Username Update:", res.status, data);

      const res1 = await fetch("/api/editImage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newImage: profile.profilePic }),
      });
      if (res.status === 401) {
        stopLoading();
        navigate("/");
        localStorage.removeItem(`currentToken_${portNumber}`);
        return;
      }
      const data1 = await res1.json();
      console.log("Image Update:", res1.status, data1);
      stopLoading();
    } catch (error) {
      console.error("Save failed:", error);
    }
  }

  return (
    <div className="profile-card">
        <h1 className="profile-title">Profile:</h1>

        <div className="profile-pic-wrapper" onClick={handleImgClick}>
            <img src={profile.profilePic} alt="Profile" className="profile-pic" />
            {isEditingProfile && (
            <input
                type="text"
                value={profile.profilePic}
                onChange={(e) => setProfile({ ...profile, profilePic: e.target.value })}
                placeholder="Paste image URL..."
                className="image-url-input"
            />
            )}
        </div>

        <div className="username-box">
            {isEditingProfile ? (
            <input
                type="text"
                value={profile.username}
                onChange={handleUsernameChange}
                className="username-input"
            />
            ) : (
            <label className="username-label">{profile.username}</label>
            )}
        </div>


        <h2 className="player-stats-title">{profile.username}'s Stats:</h2>
        <div className="profile-stats">
            <div className="stats-box">
            <span className="stats-label">Games Played:</span>
            <span className="stats-value">{gamesPlayed}</span>
            </div>
            <div className="stats-box">
            <span className="stats-label">High Score:</span>
            <span className="stats-value">{highScore}</span>
            </div>
            <div className="stats-box">
            <span className="stats-label">Join Date:</span>
            <span className="stats-value">{curDate}</span>
            </div>
        </div>
        <div className="buttons-container">
            <button className="edit-button" onClick={handleEditToggle}>
                {isEditingProfile ? "Save" : "Edit Profile"}
            </button>
            <button className="delete-button" onClick={handleDeleteUser}>Delete Profile</button>

        </div>

    </div>
  );
}

export default ProfileCard;
