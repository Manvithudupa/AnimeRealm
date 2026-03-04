export default function artplayerPluginSubtitleSelection(subtitles = []) {
  return (art) => {
    if (!subtitles || subtitles.length === 0) return;

    let hasSetDefault = false;

    art.setting.add({
      html: `
        <div class="subtitle-selection-wrapper">
          <label class="subtitle-label">Subtitles</label>
          <select 
            name="subtitle-select" 
            id="subtitle-select"
            class="subtitle-dropdown"
          >
            <option value="">Off</option>
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
      width: 220,
      onClick(setting, $setting) {
        const $select = $setting.querySelector("select[name='subtitle-select']");

        // Set default subtitle only once
        if (!hasSetDefault) {
          const defaultOption = $select.value;
          if (defaultOption !== "") {
            const index = parseInt(defaultOption);
            const subtitle = subtitles[index];
            if (subtitle) {
              art.subtitle.switch(subtitle.file, {
                name: subtitle.label,
                type: "vtt",
              });
              hasSetDefault = true;
            }
          }
        }

        art.proxy($select, "change", (event) => {
          const value = event.target.value;

          if (value === "") {
            art.subtitle.switch("", { name: "Off" });
            art.notice.show = "Subtitles disabled";
          } else {
            const index = parseInt(value);
            const subtitle = subtitles[index];
            if (subtitle) {
              art.subtitle.switch(subtitle.file, {
                name: subtitle.label,
                type: "vtt",
              });
              art.notice.show = `${subtitle.label}`;
            }
          }
        });
      },
    });

    // Add comprehensive styles for the subtitle dropdown
    const style = document.createElement("style");
    style.textContent = `
      .subtitle-selection-wrapper {
        width: 100%;
        display: block;
        margin: 0;
        padding: 0;
        position: relative;
        z-index: 1000;
      }

      .subtitle-label {
        display: block;
        font-size: 12px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.7);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 6px;
        margin-top: 0;
        line-height: 1;
      }

      .subtitle-dropdown {
        width: 100%;
        padding: 8px 10px;
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        background: rgba(20, 20, 25, 0.9);
        color: #ffffff;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: inherit;
        box-sizing: border-box;
        position: relative;
        z-index: 1001;
        line-height: 1.4;
        min-height: 32px;
        vertical-align: middle;
      }

      .subtitle-dropdown:hover {
        background-color: rgba(30, 30, 40, 0.95);
        border-color: rgba(255, 255, 255, 0.25);
      }

      .subtitle-dropdown:focus {
        outline: none;
        background-color: rgba(30, 30, 40, 0.95);
        border-color: rgba(255, 255, 255, 0.4);
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
      }

      .subtitle-dropdown option {
        background-color: rgb(20, 20, 25);
        color: #ffffff;
        padding: 8px 6px;
      }

      .subtitle-dropdown option:checked {
        background: rgb(59, 130, 246);
        color: #ffffff;
      }
    `;
    document.head.appendChild(style);
  };
}
