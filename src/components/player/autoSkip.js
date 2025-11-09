export default function autoSkip(option) {
  // --- 🧩 Helper: Validate user-supplied ranges ---
  function validateRanges(ranges) {
    if (!Array.isArray(ranges)) {
      throw new TypeError("Option must be an array of time ranges");
    }

    ranges.forEach((range, index) => {
      if (!Array.isArray(range) || range.length !== 2) {
        throw new TypeError(
          `Range at index ${index} must be an array of two numbers`
        );
      }

      const [start, end] = range;

      if (
        typeof start !== "number" ||
        (typeof end !== "number" && end !== Infinity)
      ) {
        throw new TypeError(
          `Range at index ${index} must contain valid numbers or Infinity`
        );
      }

      if (start > end && end !== Infinity) {
        throw new RangeError(
          `In range at index ${index}, start time must be less than end time`
        );
      }

      if (index > 0) {
        const prevEnd = ranges[index - 1][1];
        if (prevEnd !== Infinity && start <= prevEnd) {
          throw new RangeError(
            `Range at index ${index} overlaps with the previous range`
          );
        }
      }
    });
  }

  // --- ✅ Validate initial input ---
  validateRanges(option);

  // --- 🎞️ Return actual Artplayer plugin ---
  return (art) => {
    let skipRanges = option;

    // --- Update Infinity ranges when duration known ---
    function updateRanges() {
      const duration = art.duration;
      skipRanges = skipRanges.map(([start, end]) => [
        start,
        end === Infinity ? duration : end,
      ]);
    }

    // --- Skip logic ---
    function checkAndSkip() {
      const currentTime = art.currentTime;
      for (const [start, end] of skipRanges) {
        if (currentTime >= start && currentTime < end) {
          console.log(`⏭️ Skipping from ${start}s to ${end}s`);
          showSkipOverlay(start, end);
          art.seek(end);
          break;
        }
      }
    }

    // --- Small overlay during skip ---
    let skipOverlay = null;

    function showSkipOverlay(start, end) {
      if (skipOverlay) {
        skipOverlay.remove();
      }

      const div = document.createElement("div");
      div.textContent = `⏩ Skipping from ${start}s to ${end}s`;
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
      skipOverlay = div;

      setTimeout(() => {
        if (skipOverlay) {
          skipOverlay.style.opacity = "0";
          setTimeout(() => skipOverlay.remove(), 500);
        }
      }, 800);
    }

    // --- Event listeners ---
    art.on("loadedmetadata", updateRanges);
    art.on("timeupdate", checkAndSkip);

    // --- Plugin interface ---
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
