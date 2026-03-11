export default function artplayerPluginSubtitleSelection(subtitles = []) {
  return (art) => {
    if (!subtitles || subtitles.length === 0) return;

    const defaultIndex = subtitles.findIndex(
      (s) => s.label?.toLowerCase() === "english"
    );
    const hasDefault = defaultIndex >= 0;

    /* ── helpers ──────────────────────────────────────────────────────── */
    function subType(file) {
      if (!file) return "vtt";
      const lower = file.toLowerCase();
      if (lower.includes(".ass") || lower.includes(".ssa")) return "ass";
      if (lower.includes(".srt")) return "srt";
      return "vtt";
    }

    function applySub(index) {
      if (index === null) {
        art.subtitle.show = false;
        return;
      }
      const sub = subtitles[index];
      if (!sub) return;
      art.subtitle.switch(sub.file, {
        name: sub.label,
        type: subType(sub.file),
      });
      art.subtitle.show = true;
    }

    /* ── subtitle track selector ──────────────────────────────────────── */
    art.setting.add({
      html: "Subtitle",
      width: 200,
      tooltip: hasDefault ? subtitles[defaultIndex].label : "Off",
      selector: [
        { html: "Off", value: null, default: !hasDefault },
        ...subtitles.map((sub, i) => ({
          html: sub.label,
          value: i,
          default: i === defaultIndex,
        })),
      ],
      onSelect(item) {
        applySub(item.value);
        return item.html;
      },
    });

    /* ── subtitle font-size selector ─────────────────────────────────── */
    art.setting.add({
      html: "Sub Size",
      width: 200,
      tooltip: "Medium",
      selector: [
        { html: "Small", value: "16px" },
        { html: "Medium", value: "20px", default: true },
        { html: "Large", value: "26px" },
        { html: "X-Large", value: "32px" },
      ],
      onSelect(item) {
        art.subtitle.style({ fontSize: item.value });
        return item.html;
      },
    });

    /* ── auto-load English (or first) subtitle on ready ──────────────── */
    const loadDefault = () => applySub(hasDefault ? defaultIndex : null);

    if (art.isReady) {
      loadDefault();
    } else {
      art.once("ready", loadDefault);
    }
  };
}
