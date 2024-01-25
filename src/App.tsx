import * as React from "react";
import { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import QuestionSvg from "./components/QuestionSvg";
import ThumbsDown from "./components/ThumbsDown";
import ThumbsUp from "./components/ThumbsUp";
import Mail from "./components/Mail";
import { getFeedbackData } from "./utils/feedbackUtils";
import BellSplash from "./components/BellSplash";
import Bell from "./components/Bell";
import Edit from "./components/Edit";
import Save from "./components/Save";

interface Credentials {
  username: string;
  password: string;
}

const App = () => {
  const [credentials, setCredentials] = useState<Credentials>({
    username: "",
    password: "",
  });
  const [loaded, setLoaded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [autoLoginEnabled, setAutoLoginEnabled] = useState(true);
  const [isOnAlarm, setIsOnAlarm] = useState(true);
  const [isOnWork, setIsOnWork] = useState(false);
  const [isOnWorkTime, setIsOnWorkTime] = useState("");
  const [isGetOffTime, setIsGetOffTime] = useState("");

  const toggleAutoLogin = () => {
    const newAutoLoginEnabled = !autoLoginEnabled;
    alert(
      newAutoLoginEnabled
        ? "자동 로그인이 활성화되었습니다."
        : "자동 로그인이 비활성화되었습니다."
    );
    setAutoLoginEnabled(newAutoLoginEnabled);
    chrome.storage.sync.set({ autoLoginEnabled: newAutoLoginEnabled });
  };

  const toggleAlarm = () => {
    const newAlarmEnabled = !isOnAlarm;
    setIsOnAlarm(newAlarmEnabled);
    chrome.storage.sync.set({ isOnAlarm: newAlarmEnabled });
    chrome.storage.sync.get(["isOnAlarm"], (result) => {
      console.log("isOnAlarm", result.isOnAlarm);
    });
  };

  const saveCredentials = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(credentials.username)) {
      alert("아이디는 이메일 형식이어야 합니다.");
      return;
    }

    chrome.storage.sync.set(credentials, () => {
      alert("저장되었습니다!");
      setIsSaved(true);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSaved(false);
    const { name, value } = e.target;
    setCredentials((prevCredentials) => ({
      ...prevCredentials,
      [name]: value,
    }));
  };

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    if (!autoLoginEnabled) {
      e.preventDefault();
    }
  };

  const handleEditClick = () => {
    setCredentials({
      username: "",
      password: "",
    });
    setIsSaved(false);
  };

  const handleFeedback = async (option: string) => {
    try {
      const feedbackData = await getFeedbackData(option);
      const response = await fetch("http://43.200.104.77:5000/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(feedbackData),
      });

      if (response.ok) {
        console.log("피드백이 성공적으로 전송되었습니다.");
      } else {
        throw new Error("피드백 전송에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error sending feedback:", error);
    }
  };

  const handleGoToWork = () => {
    if (isOnWork) return;
    const now = new Date();
    const timeString = now.toTimeString().substring(0, 5);
    setIsOnWorkTime(timeString);
    setIsOnWork(true);
    chrome.storage.sync.set({ onWorkTime: timeString });
    chrome.runtime.sendMessage({ action: "startWorkProcess" });
  };

  const handleGetOffWork = () => {
    if (!isOnWork) return;
    const now = new Date();
    const timeString = now.toTimeString().substring(0, 5);
    setIsGetOffTime(timeString);
    setIsOnWork(false);
    chrome.storage.sync.set({ getOffTime: timeString });
  };

  useEffect(() => {
    chrome.storage.sync.get(["isOnAlarm"], (result) => {
      if (result.isOnAlarm !== undefined) {
        setIsOnAlarm(result.isOnAlarm);
      } else {
        setIsOnAlarm(true);
        chrome.storage.sync.set({ isOnAlarm: true });
      }
    });
  }, []);

  useEffect(() => {
    chrome.storage.sync.get(["username", "password"], (result) => {
      const data: Credentials | {} = result;

      if ("username" in data && "password" in data) {
        setCredentials(data as Credentials);
        setIsSaved(true);
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    chrome.storage.sync.get(["autoLoginEnabled"], (result) => {
      if (result.autoLoginEnabled !== undefined) {
        setAutoLoginEnabled(result.autoLoginEnabled);
      } else {
        setAutoLoginEnabled(true);
        chrome.storage.sync.set({ autoLoginEnabled: true });
      }
    });
  }, []);

  if (!loaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`${autoLoginEnabled ? "App" : "App-off"}`}>
      <header className="App-header">
        <h2 className="App-header-text">SURFING IS FUN</h2>
      </header>
      <div className="App-body">
        <div className="App-option">
          <span className="App-question">
            <QuestionSvg />
            <span className="App-dropdown">
              <span className="App-dropdown-title">피드백을 보내주세요!</span>
              <span className="App-dropdown-thumbs">
                <ThumbsUp
                  className="App-dropdown-thumbs-up"
                  handleFeedback={() => handleFeedback("조아요")}
                />
                <ThumbsDown
                  className="App-dropdown-thumbs-down"
                  handleFeedback={() => handleFeedback("시러요")}
                />
                <Mail />
              </span>
            </span>
          </span>
          {isSaved ? (
            <span className="App-edit" onClick={handleEditClick}>
              <Edit />
            </span>
          ) : (
            <span className="App-save" onClick={saveCredentials}>
              <Save />
            </span>
          )}

          <span className="App-bell" onClick={toggleAlarm}>
            {isOnAlarm ? <Bell /> : <BellSplash />}
          </span>
          <span className="App-toggle" onClick={toggleAutoLogin}>
            <span className="App-toggle-wrapper">
              <span className="App-toggle-on">ON</span>
              <span className="App-toggle-off">OFF</span>
              <span
                className={`App-toggle-slider ${autoLoginEnabled ? "" : "off"}`}
              />
            </span>
          </span>
        </div>
        <div className="App-body-left">
          <img src={logo} className="App-logo" alt="logo" />
        </div>
        {!isSaved ? (
          <div className="App-body-right">
            <div>
              <input
                type="text"
                name="username"
                className="App-input"
                value={credentials.username}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                className="App-input"
                value={credentials.password}
                onChange={handleInputChange}
              />
            </div>
          </div>
        ) : (
          <div className="App-body-success-wrapper">
            <div className="App-body-success">
              로그인 정보가 저장되었습니다.
            </div>
            <div className="App-body-success-link-wrapper">
              <a
                href="https://hr.workup.plus"
                target="_blank"
                className="App-body-success-link"
                onClick={handleLinkClick}
              >
                페이지 방문하기
              </a>
            </div>
          </div>
        )}
      </div>
      {isSaved && (
        <>
          <div className="App-body-commute-button">
            <span
              className={
                !isOnWork ? "work-button abled" : "work-button disabled"
              }
              onClick={handleGoToWork}
            >
              {isOnWork
                ? isOnWorkTime !== ""
                  ? isOnWorkTime
                  : "출근하기"
                : "출근하기"}
            </span>
            <span
              className={
                isOnWork ? "work-button abled" : "work-button disabled"
              }
              onClick={handleGetOffWork}
            >
              {isOnWork
                ? "퇴근하기"
                : isGetOffTime !== ""
                ? isGetOffTime
                : "퇴근하기"}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
