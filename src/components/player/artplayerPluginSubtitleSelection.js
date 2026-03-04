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
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 4px 0;
      }

      .subtitle-label {
        font-size: 12px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.7);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .subtitle-dropdown {
        width: 100%;
        padding: 10px 12px;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        background: linear-gradient(135deg, rgba(20, 20, 25, 0.9) 0%, rgba(30, 30, 35, 0.9) 100%);
        color: #ffffff;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: inherit;
        appearance: none;
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right 8px center;
        background-size: 18px;
        padding-right: 36px;
      }

      .subtitle-dropdown:hover {
        background-color: rgba(30, 30, 40, 0.95);
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right 8px center;
        background-size: 18px;
        border-color: rgba(255, 255, 255, 0.3);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      }

      .subtitle-dropdown:focus {
        outline: none;
        background-color: rgba(30, 30, 40, 0.95);
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right 8px center;
        background-size: 18px;
        border-color: rgba(255, 255, 255, 0.5);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2), 0 4px 12px rgba(59, 130, 246, 0.15);
      }

      .subtitle-dropdown option {
        background-color: rgb(20, 20, 25);
        color: #ffffff;
        padding: 10px 8px;
        line-height: 1.5;
        border: none;
      }

      .subtitle-dropdown option:hover {
        background: linear-gradient(rgb(59, 130, 246), rgb(59, 130, 246));
      }

      .subtitle-dropdown option:checked {
        background: linear-gradient(rgb(59, 130, 246), rgb(59, 130, 246));
        color: #ffffff;
      }

      @supports (-webkit-appearance: none) {
        .subtitle-dropdown {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
        }
      }
    `;
    document.head.appendChild(style);
  };
}
