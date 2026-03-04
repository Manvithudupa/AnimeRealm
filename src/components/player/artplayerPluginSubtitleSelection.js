export default function artplayerPluginSubtitleSelection(subtitles = []) {
  return (art) => {
    if (!subtitles || subtitles.length === 0) return;

    let currentSelection = "";

    art.setting.add({
      html: `
        <div class="subtitle-selection-wrapper">
          <select 
            name="subtitle-select" 
            id="subtitle-select"
            class="subtitle-dropdown"
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
      onClick(setting, $setting) {
        const $select = $setting.querySelector("select[name='subtitle-select']");

        art.proxy($select, "change", (event) => {
          const value = event.target.value;
          currentSelection = value;

          if (value === "") {
            art.subtitle.switch("", { name: "No Subtitle" });
            art.notice.show = "Subtitles disabled";
          } else {
            const index = parseInt(value);
            const subtitle = subtitles[index];
            if (subtitle) {
              art.subtitle.switch(subtitle.file, {
                name: subtitle.label,
                type: "vtt",
              });
              art.notice.show = `Subtitle: ${subtitle.label}`;
            }
          }
        });
      },
    });

    // Add styles for the subtitle dropdown
    const style = document.createElement("style");
    style.textContent = `
      .subtitle-selection-wrapper {
        width: 100%;
      }

      .subtitle-dropdown {
        width: 100%;
        padding: 8px 12px;
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background-color: rgba(0, 0, 0, 0.6);
        color: #ffffff;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
      }

      .subtitle-dropdown:hover {
        background-color: rgba(0, 0, 0, 0.8);
        border-color: rgba(255, 255, 255, 0.4);
      }

      .subtitle-dropdown:focus {
        outline: none;
        background-color: rgba(0, 0, 0, 0.8);
        border-color: rgba(255, 255, 255, 0.6);
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
      }

      .subtitle-dropdown option {
        background-color: rgba(20, 20, 20, 0.95);
        color: #ffffff;
        padding: 8px;
      }

      .subtitle-dropdown option:hover {
        background-color: rgba(59, 130, 246, 0.5);
      }

      .subtitle-dropdown option:checked {
        background-color: rgba(59, 130, 246, 0.7);
        color: #ffffff;
      }
    `;
    document.head.appendChild(style);
  };
}
