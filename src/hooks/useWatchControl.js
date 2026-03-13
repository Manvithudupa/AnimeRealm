import { useState, useEffect } from "react";

export default function useWatchControl() {
  const [autoPlay, setAutoPlay] = useState(
    () => JSON.parse(localStorage.getItem("autoPlay")) || false
  );
  const [autoSkipIntro, setAutoSkipIntro] = useState(
    () => JSON.parse(localStorage.getItem("autoSkipIntro")) || false
  );
  const [autoNext, setAutoNext] = useState(
    () => JSON.parse(localStorage.getItem("autoNext")) || false
  );
  const [hardSub, setHardSub] = useState(
    () => JSON.parse(localStorage.getItem("hardSub")) || false
  );

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
