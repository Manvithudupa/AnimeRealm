// AutoSkip plugin for Artplayer
export default function autoSkip(option) {
  function validateRanges(ranges) {
    if (!Array.isArray(ranges)) {
      throw new TypeError("Option must be an array of time ranges");
    }
    ranges.forEach((range, index) => {
      if (!Array.isArray(range) || range.length !== 2) {
        throw new TypeError(`Range at index ${index} must be an array of two numbers`);
      }
      const [start, end] = range;
      if (typeof start !== "number" || (typeof end !== "number" && end !== Infinity)) {
        throw new TypeError(`Range at index ${index} must contain valid numbers or Infinity`);
      }
      if (start > end && end !== Infinity) {
        throw new RangeError(`Range at index ${index}: start must be < end`);
      }
      if (index > 0) {
        const prevEnd = ranges[index - 1][1];
        if (prevEnd !== Infinity && start <= prevEnd) {
          throw new RangeError(`Range at index ${index} overlaps previous range`);
        }
      }
    });
  }

  validateRanges(option);

  return (art) => {
    let skipRanges = option;

    function updateRanges() {
      const duration = art.duration;
      skipRanges = skipRanges.map(([start, end]) => [start, end === Infinity ? duration : end]);
    }

    function showSkipOverlay(start, end) {
      const div = document.createElement("div");
      div.textContent = `⏩ Skipping from ${start}s → ${end}s`;
      Object.assign(div.style, {
        position: "absolute",
        top: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.6)",
        color: "#fff",
        padding: "6px 12px",
        borderRadius: "4px",
        fontSize: "14px",
        zIndex: 9999,
        transition: "opacity 0.3s",
      });
      art.template.$player.appendChild(div);
      setTimeout(() => {
        div.style.opacity = "0";
        setTimeout(() => div.remove(), 500);
      }, 800);
    }

    function checkAndSkip() {
      const t = art.currentTime;
      for (const [start, end] of skipRanges) {
        if (t >= start && t < end) {
          showSkipOverlay(start, end);
          art.seek(end);
          break;
        }
      }
    }

    art.on("loadedmetadata", updateRanges);
    art.on("timeupdate", checkAndSkip);

    return {
      name: "autoSkip",
      update(newOption = []) {
        validateRanges(newOption);
        skipRanges = newOption;
        updateRanges();
      },
    };
  };
}
