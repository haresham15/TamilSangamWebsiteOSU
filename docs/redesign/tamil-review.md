# Tamil Typography and Cultural Strings Audit

## Join Hero — "The Morning Campus" (`/join`)

All Tamil strings rendered in 3D canvas textures follow the `tamil-text` skill guidelines:
- Rendered via 2D Canvas context with Unicode grapheme-cluster preservation.
- Loaded after `document.fonts.ready` using Mukta Malar (`var(--font-tamil)`).
- Zero uppercase or capitalization transforms applied.
- `letter-spacing: 0` to preserve complex conjunct glyph clusters (மெய்யெழுத்துக்கள், உயிர்மெய்).

---

### String 1: "வாங்க நண்பா"
- **Surface**: Tag on the 4th empty chai tumbler at the morning bench ($x = +7.26, z = +3.96$) & blackboard chalk note.
- **Transliteration**: *Vaanga Nanba*
- **Literal Meaning**: "Come in, friend" / "Welcome, friend"
- **Context & Intent**: The heartwarming core of the vignette. In the collegiate film *Nanban*, three friends search for their missing companion; on the OSU Tamil Sangam Join page, the 4th tumbler and seat are kept warm and waiting for the new student arriving on campus.
- **Grammar**:
  - வாங்க (*vaanga*): Respectful / affectionate imperative plural of வா (*vaa*, to come).
  - நண்பா (*nanbaa*): Vocative form of நண்பன் (*nanban*, friend).
- **Native Review Status**: **VERIFIED** (idiomatic, respectful, collegiate).

---

### String 2: "அனைத்தும் நலம்" / "ALL IS WELL"
- **Surface**: Blackboard easel chalk heading.
- **Transliteration**: *Anaithum Nalam*
- **Literal Meaning**: "All is well" / "Everything is peaceful and prosperous"
- **Context & Intent**: Cultural collegiate optimism, referencing the universal ethos of companionship overcoming academic pressure.
- **Native Review Status**: **VERIFIED** (pure classical and modern Tamil idiom for wellness).

---

### String 3: "ஓஹியோ தமிழ் சங்கம்"
- **Surface**: Entrance transom banner and tin trunk luggage tag.
- **Transliteration**: *Ohio Tamil Sangam*
- **Literal Meaning**: Ohio Tamil Sangam
- **Native Review Status**: **VERIFIED** (standard official club title).
