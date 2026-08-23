import { useState, useEffect } from "react";

function safeGetBool(key) {
  try {
    const val = JSON.parse(localStorage.getItem(key));
    return typeof val === "boolean" ? val : false;
  } catch {
    return false;
  }
}

export default function useWatchControl() {
  const [autoPlay, setAutoPlay] = useState(() => safeGetBool("autoPlay"));
  const [autoSkipIntro, setAutoSkipIntro] = useState(() => safeGetBool("autoSkipIntro"));
  const [autoNext, setAutoNext] = useState(() => safeGetBool("autoNext"));
  const [hardSub, setHardSub] = useState(() => safeGetBool("hardSub"));

  useEffect(() => {
    localStorage.setItem("autoPlay", JSON.stringify(autoPlay));
  }, [autoPlay]);

  useEffect(() => {
    localStorage.setItem("autoSkipIntro", JSON.stringify(autoSkipIntro));
  }, [autoSkipIntro]);

  useEffect(() => {
    localStorage.setItem("autoNext", JSON.stringify(autoNext));
  }, [autoNext]);

  useEffect(() => {
    localStorage.setItem("hardSub", JSON.stringify(hardSub));
  }, [hardSub]);

  return {
    autoPlay,
    setAutoPlay,
    autoSkipIntro,
    setAutoSkipIntro,
    autoNext,
    setAutoNext,
    hardSub,
    setHardSub,
  };
}
