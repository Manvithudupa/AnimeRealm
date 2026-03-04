export default function artplayerPluginSubtitleSelection(subtitles = []) {
  return (art) => {
    if (!subtitles || subtitles.length === 0) return;

    art.setting.add({
      html: `
        <div class="subtitle-selection-wrapper">
          <select 
            name="subtitle-select" 
            id="subtitle-select"
            style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ccc; background-color: #fff; color: #000; cursor: pointer;"
          >
            <option value="">No Subtitle</option>
            ${subtitles
              .map(
                (sub, index) =>
                  `<option value="${index}" ${
                    sub.label?.toLowerCase() === "english" ? "selected" : ""
                  }>${sub.label}</option>`
              )
              .join("")}
          </select>
        </div>
      `,
      width: 200,
      onSelect(value) {
        if (value === "") {
          art.subtitle.switch("", { name: "No Subtitle" });
        } else {
          const index = parseInt(value);
          const subtitle = subtitles[index];
          if (subtitle) {
            art.subtitle.switch(subtitle.file, {
              name: subtitle.label,
            });
          }
        }
      },
    });
  };
}
