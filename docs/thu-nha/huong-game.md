# Dư Đồ: Thư Nhà — the lead designer's direction

*Synthesis of the five directions and the three-judge panel. Written 2026-11-18 against main `ba7051c` (read-only).*
*Inputs: `systems.md`, `dir-{story,roguelite,battle,dynasty,social}.md` in this folder, and the panel scores.*
*Numbers marked **[sử gia kiểm]** must be checked by a historian before anything ships.*

---

## 0. Tóm tắt cho chủ dự án

> **Hướng đề xuất: "Thư Nhà · Sáu đời người, một từ đường".** Bạn giữ ngòi bút của một dòng họ có tên tuổi, sống qua
> từng đời người từ 1858 đến 2026. Mỗi chương là một đời, chơi trong 25–35 phút, chia thành nhiều **mùa**. Mỗi mùa có
> một lá thư đến, vài **tin đồn** (tin nào thật thì phải tự kiểm), bạn **cắt đặt người nhà** đi chợ, đi đắp luỹ, ra bến
> hay ở nhà, rồi quyết **một chuyện khó không có đáp án đúng**. Những gì bạn chọn sẽ **quay lại sau nhiều năm** (Hồi âm).
>
> Trận đánh không còn chỉ để xem. Ở **Giờ G**, sử đã chép sẵn từng canh: bạn biết đồn sẽ vỡ lúc nào, người nhà bạn thì
> không. Bạn dẫn họ qua lửa, cõng người bị thương, giữ cuốn gia phả. Bạn không bao giờ bắn ai, không đổi được bên thắng,
> và **không có xúc xắc nào quyết định sống chết** của một người có tên. Nỗi đau (nạn đói, cải cách ruộng đất, trại cải
> tạo, vượt biển…) **không bao giờ thành điểm thưởng**.
>
> **Làm thử trước một chương ngắn: "Đồn Chí Hoà" (Gia Định 1859–1862)**, khoảng 30 phút. Đây là giai đoạn ít nhạy cảm
> nhất, đã có sẵn 3 cảnh trận và 5 thẻ sự kiện. Làm trong 5–7 tuần, thử trên **iPad thật** với 5–8 người. Chỉ khi người
> chơi nhớ tên người nhà, muốn chơi lại và thấy trận đánh có ý nghĩa thì mới làm tiếp từng chương. Nếu không, dừng lại
> mà tốn ít. **Đọc sử và Chơi hiện tại giữ nguyên**; chương nào chưa làm sâu thì vẫn chơi kiểu cũ.
>
> **Cần người ngoài ngay từ bản thử:** một biên tập viên văn tiếng Việt và một nhà sử học (thế kỷ 19). Hoạ sĩ vào khi bản
> thô qua vòng đầu.

---

## 1. The recommendation in one paragraph

**Dư Đồ: Thư Nhà** keeps the panel's top-scoring direction (Story, 20 points) as the spine: you live one named person
per chapter of the same family, 1858→2026, through letters and documents, and your choices plant seeds that come back
years later as human acts. Story scored low on fun (5) because it was interactive fiction with nothing to plan and little
reason to replay, so the synthesis grafts in the systems the other judges named as best, and only where they serve the
letters: roguelite's **rumors with source reliability, verification and light placement of named people** as the
season-to-season play, plus its **never-wiped archive**; battle's **"Sử đã chép" protect-only board** as the set-piece
combat the owner asked for, with its **no-combat-seats-in-1955–75** rule and deterministic battle log; dynasty's
**generation-poem names, seeded no-reroll outcomes and separate save slot**; social's **"Hỏi ông bà" card, "Ba đường"
dossier and the "Không muốn kể" envelope**. The famine/land-reform slice the Story doc proposed is replaced by a cheaper,
less sensitive slice (**Gia Định 1859–1862, Đồn Chí Hoà**), split into a 2–3-week rough cut and a full slice, and gated
on replay intent and remembered names before any big content spend. Today's Đọc sử and Chơi stay; finished deep chapters
replace quick chapters one at a time.

---

## 2. How the panel shaped this

| Direction | Fun | Fit | Feasible | Total | What we keep | What we leave |
|---|---|---|---|---|---|---|
| **Story (Thư Nhà)** | 5 | 9 | 6 | **20** | The spine: named lives, letters, Sổ ân oán + Hồi âm, *ơn không phải tiền*, *no dice for a life*, lặng scenes, kỷ vật, the 2026 chest, *Theo bước ai*, continuity checker | Replacing today's Chơi; the famine chapter as the first public slice; ~3 h runs with no shorter way in |
| Roguelite (Trăm Nhà) | **8** | 6 | 5 | 19 | Tin đồn + Thẩm định; light placement (*Xếp người*); the carrying pole as the packing moment; double-edged papers as chest items; Lạc → Tìm (separation as a care task); the four "kept" axes; `dudo-archive` that survives reset; per-chapter seeded variation | Scenario-hopping between unrelated houses; dailies, weeklies, wind levels and run vocabulary; 12 interlocking systems in one slice |
| Battle (Qua Lửa) | 6 | 5 | **8** | 19 | The board as **Giờ G**: telegraphed history, protect-never-hunt, the warned Nặng state, verbs (đi, cõng, băng bó, giữ cửa), no combat seats 1955–75, every side's dead counted, sound rules, deterministic log, "Tự diễn" exit | Death decided by hit percentages; "strangers saved" as a record to beat; 14 bespoke battles before the loop is proven |
| Dynasty (Cây Có Cội) | 7 | 7 | 3 | 17 | Generation poem (chữ lót theo đời); per-branch leanings as authored consequences; seeded per-decision outcomes with no reroll; separate save slot; labelled counterfactual re-sim | The council of 150–250 assignments; random named deaths; an economy that lets players "plan around" famine and land reform |
| Social (Chung Mâm) | 3 | 4 | 7 | 14 | "Hỏi ông bà" questions at chapter end; "Ba đường" (Lịch sử · Nhà mình kể · Ván chơi) in the dossier; "Không muốn kể" as a respected answer; memory pins later | Finger-guessing as the core; servers, voice recording and family sync before a legal read |

**Why not the others as the spine**

- **Roguelite** has the best loop, but it breaks the app's identity: one family across 168 years, compared with history.
  It also needs a stream of new scenarios to stay fresh, and its run, daily and loot vocabulary sits badly next to 1946
  tản cư or April 1975. We take its turn structure and its archive and keep one family.
- **Battle** has the best fun test and answers the owner's combat wish, but battles are 2–6 islands per run. The 30+
  minutes between them would stay today's shallow card game. We make it the set piece inside every chapter.
- **Dynasty** has the best long-horizon decisions, but it is the heaviest build (feasibility 3). Its turn-to-turn play
  risks feeling like a spreadsheet, and its core models treat famine mortality and land-reform classification as risks
  a family could have planned around. The game's own data contradicts that: `x-diachu53` "Chia nhỏ ruộng" →
  *"Đội vẫn quy địa chủ, ghi thêm 'phân tán tài sản'"* (`src/data/cards2.ts:116`).
- **Social** is the most original idea for kiều bào, but it is a facilitation tool rather than a game loop. It carries
  the heaviest privacy and legal exposure (recorded testimony about camps and VNCH service). We take its cheap, serverless
  parts.

The fun judge's own synthesis (roguelite loop + battle Giờ G + story Hồi âm + memory pins) and the fit judge's (Story
spine + Họp họ + no-combat-seats + three houses + Ba đường) agree on most pieces. They differ on the spine. We use the
fit judge's spine, because it is the top total and the owner's goals are about one family. We use the fun judge's loop
to fix that spine's weakness. We follow the feasibility judge's order of work: groundwork first, a small slice behind a
flag, no multi-branch dynasty engine.

---

## 3. Design pillars

1. **Người có tên, mất là mất (named people; a loss stays a loss).** The family is 10–20 named people with faces, ages,
   traits and leanings, not 4 numbers. A death is authored, foreshadowed and kept in the gia phả with date and place, or
   *không rõ nơi mất*. Nobody grows back at harvest.
2. **Biết một nửa (decide on half-knowledge).** Every season shows *Bạn biết* / *Bạn không biết*, rumors with a visible
   source reliability, and outcomes in word bands (*nhiều khả năng / có thể / ít khả năng*), never exact numbers before
   the choice. You learn more by sending the right person, holding the right paper, or knowing the history (Thẩm định).
3. **Lời hôm nay, hồi âm mai sau (what you write comes back).** Choices plant seeds (ơn, oán, hứa, bí mật, kỷ vật)
   that return months, decades or generations later, drawn as red threads on the timeline. Rule: *ơn không phải tiền*.
   A kindness returns as a human act under pressure, never a guaranteed rescue.
4. **Sử là thời tiết, nhà là việc của bạn (history is the weather; the family is yours).** History is fixed and shown in
   advance ("Sử đã chép"). The stakes are family-sized: who stays together, what is kept, what is remembered, who you
   shelter. In battle you protect; you never hunt, and you never change who wins.
5. **Không chấm điểm nỗi đau (suffering is never scored).** Lặng scenes hide the HUD and grant nothing. There is no dice
   for a life, no collectible from tragedy, no rarity % on suffering, and every side's dead are counted with sourced
   ranges.

---

## 4. The game

### 4.1 Minute to minute: one *mùa* (season), about 4–5 minutes, never timed

| Beat | Time | What happens | From |
|---|---|---|---|
| **Thư đến** | 30–60 s | A period document opens over a ground illustration: letter, edict, notice, diary page. Narrated (recorded clip or device voice). A strip "Sử đã chép" shows the next 1–2 historical beats as headlines. One short map interlude places the season in history. | Story + Battle |
| **Tin đồn** | 20–30 s | 2–3 rumor slips, each with who said it (boatman, market woman, the court notice, the French proclamation) and a reliability band. Some are fixed history and always true; some are seeded local truths. | Roguelite |
| **Việc nhà** | 40–90 s | Place 3–5 named adults on 3–4 places offered this season (market, the fort works, the river landing, the đình, the field) or keep them home. Children and elders get home actions (mind grandmother, hide an object, mend). A person at the right place verifies a rumor, earns rice or money, moves a relationship, or plants a seed. "Như mùa trước" is one tap. Tired or wounded people can only stay home. | Roguelite (cut down) |
| **Biến cố** | 60–120 s | The heavy choice, written as **the line a character writes or does**, 2–4 options, no option marked best. Costs land on named people. A quiet margin compass shows which way it leans. | Story |
| **Sổ mùa** | 10–20 s | Rice eaten (1 per person), who is tired, wounded, away or missing, letters that arrived, Hồi âm stamps ("Có người sẽ nhớ chuyện này"), autosave. | Story + Roguelite |

**Thẩm định (verification).** To check a rumor you can (1) place a person where the truth is, (2) use a trait (*biết
chữ* reads the posted notice), (3) use a paper or object in the chest, or (4) answer one question from the quiz bank tied
to that event. Reading the event page in Đọc sử first counts as knowing. A wrong answer only leaves the rumor
unverified; nothing is lost. This finally gives the 24 quiz questions and the reading mode a purpose in play
(systems.md §8 gap 8).

### 4.2 One chapter = one life, 25–35 minutes (one sitting)

1. **Opener** (1 min): protagonist portrait, place, year, the chest object that belongs to them (reuses `cinema.ts`).
2. **4–6 mùa.**
3. **One Giờ G** (4–6 min, or about 25 s with *Tự diễn*), §5.6.
4. **The gate** (existing id e1–e6), voiced by family members who already lean that way.
5. **Packing (*Quang gánh*)** whenever the family moves: 6 slots in two baskets (gia phả, bát hương, sắc phong, land
   deed, rice, silver, medicine, tools…). What stays behind may be hidden or lost.
6. **Thư để lại** (pass down one object, one saying, one secret) and **Theo bước ai** (choose whose life the next chapter
   follows, 2–3 living candidates).
7. **Chapter dossier**: the gia phả so far, red threads, chest contents, the four "kept" axes, a "Hỏi ông bà" card, a
   labelled "Nếu…".

### 4.3 One run, and the bridge to today's Chơi

- Six chapters on the existing six gates (e1–e6), so the 729 paths, 15 endings, flags, PathF and rarity keep working.
- **Hybrid runs while content grows.** A chapter that has no deep version yet plays as today's Chơi chapter (tour, cards,
  harvest). It carries the named people, the chest and the seeds; seeds can return there as special cards, using the
  existing `SpecialCard.when` condition language. Each finished deep chapter replaces one quick chapter. The owner can
  ship at any point and still have a whole 1858–2026 run.
- A fully deep run is about 3 hours over 6 sittings. *Chơi một đời* plays any finished chapter on its own.
- There is no rush mode inside Thư Nhà. *Đọc nhanh* (text without narration) keeps every scene. A family battle always
  plays, with *Tự diễn* as the quick exit.

### 4.4 Between runs: *Tủ thư* (the archive, never wiped)

- A `dudo-archive` store outside `resetState()` (`src/state.ts:114`), with save export and import as a file.
- Shelves: the endings atlas (15 path endings and the Nhà codas, with hints for unseen ones), letters read, people met,
  kỷ vật, places, *Những đời không sống* (lives not followed, labelled *Giả định*), the red-thread map of past families.
- Unlocks are content, never power: other homes and regional templates, start-at-chapter, paper stocks.
- **Never collected:** deaths, camps, wrecks, famines. No "you haven't lost a child at sea yet". No streaks, dailies or
  leaderboards.

---

## 5. Systems (only what the slice and the spine need)

### 5.1 People and the gia phả (Story + Dynasty)
- Each person: name built from surname + generation middle name (from a ~30-poem list, *chữ lót theo đời*) + given name;
  regional calling names (anh Hai / chị Ba / thằng Út in the South, cả / hai in the North; tía/má, thầy/u, mạ/o/mệ);
  age; 2 of 12 traits (*Khoẻ, Cẩn trọng, Gan dạ, Thầy thuốc, Biết chữ, Thương người, Nóng nảy, Kín miệng…*); state
  (Lành, Mệt, Bị thương, Nặng, Lạc, Đi xa, Mất); a leaning; a bond with the protagonist (−3…+3, with notes *nợ ơn / giận
  / đã hứa*).
- The gia phả screen grows from `screens/profile.ts`: portraits from an original layered ink portrait kit (not
  generated), dates, places, one quoted line per person, the objects they kept.
- `sim-thu.ts` includes a **continuity checker**: no dead or absent person writes, decides or appears. That is the bug
  the journey report found in today's game (a father "dead" in 1861 still deciding in 1862, 1874 and 1884).

### 5.2 Rumors, placement and the household economy (Roguelite, trimmed)
- Rice per person per season; money and silver; one or two value stores per era (gold, land deed). Shortage is never
  death by dice. It means tiredness, someone working for hire away from home, an object sold, or a debt seed.
- Three **local faces** per chapter stand in for the 8 relation meters (Gia Định 1860: *quan triều đình*, *đồn Tây*,
  *làng*). Each is a named person, and relations open or close places and options. Underneath they still map to the
  existing `tr / ph / lg …` so endings keep working.
- **Seeds are per decision and never reroll on reload** (Dynasty). The seed decides rumor truths, item offers, outcome
  bands and battle hits. It never decides a historical date, a battle's outcome, or a named person's death.
- **Light era weather (from Dynasty, narrowed).** Only where families really could choose how to hold value: the court
  vs the French administration after 1862, gold vs cash across the 1975, 1978 and 1985 currency changes, the 1945
  Tuần lễ vàng [sử gia kiểm]. **Never** land-reform classification or famine mortality: those are lặng events done *to*
  the family, authored, and no counterfactual says the family could have planned its way out.

### 5.3 Rương: objects and papers (Story kỷ vật + Roguelite pole and papers)
- About 25 heirlooms across the saga, plus period papers kept in the same chest. Papers are double-edged: a court
  *sắc phong* honours the family under the court and is dangerous at a French post after 1862 [sử gia kiểm].
- Packing happens only when the family moves (flight from the citadel in 1859, tị địa in 1862, tản cư in 1946, 1954,
  1975…). It is the most tactile iPad moment: drag objects into two baskets.
- The 2026 chest at the end holds exactly what the run kept.

### 5.4 Sổ ân oán + Hồi âm (Story)
- Seeds: ơn, oán, hứa, bí mật, kỷ vật. Each has people, a year, a return window and conditions.
- A return is stamped *Hồi âm · từ năm 1861*, and a red thread is drawn on the timeline between the two years.
- Full-run targets (checked by `sim-thu.ts`): ~45 seeds planted, ~30 returns, ≥8 returns that cross a chapter, ≥3 that
  span 30 years. Slice targets in §8.
- Every return is reviewed against *ơn không phải tiền*.

### 5.5 Lòng and the gates (Story + Dynasty, authored)
- Each choice nudges the protagonist's compass; each family member keeps their own leaning (*nhà có hai lòng*). That
  is the owner's "continuous side choice", made human.
- Gates keep their ids and labels. They are voiced by family members, and their consequences are authored, not rolled.
- In chapter 5 the gate and the heir choice are the same choice (*Theo bước ai*: the brother who stays North, the one
  who goes South, the sister in the peace movement).

### 5.6 Giờ G: the battle as a family's night (Battle, with Story's rule on deaths)
- **Two scales.** The existing `scene.ts` battle advances one historical beat per turn (arrows, units, smoke, shake,
  sound). Then the view drops to a hand-drawn local board (14–22 nodes) on a separate overlay above a frozen map.
- **Sử đã chép.** The fixed timetable is shown: next turn's fire zones hatched, later turns as headlines. Uncertainty
  comes only from seeded hits inside a zone, never from history.
- **Orders, untimed, with undo until "Xong canh".** Verbs: đi, cõng (carry a person), băng bó (bandage), mang kỷ vật,
  dẫn (lead strangers). Before 1955, in battles against foreign forces only, *Giữ cửa* lets two people hold an exit
  open one more turn for others. From 1955 to 1975 there is **no combat seat on either side**: civilians, porters,
  medics, rescuers.
- **What a hit does.** Lành → Bị thương → Nặng. Nặng is a warned state with its own heartbeat sound. **Dice never kill a
  named person.** Someone left Nặng becomes a lasting wound (*thương tật*, which changes later options); someone inside
  a falling position becomes *Lạc* and turns into a search in the next seasons. Named deaths happen only at authored,
  foreshadowed points.
- **The Khoảnh khắc** (Story) is the board's dilemma beat: the wall breaks at canh 5, four wounded strangers appear,
  and you can carry one of them or bring your own cousin out.
- **No scoreboard of rescue.** Strangers you helped return as named people and seeds, not as a number to beat. No
  ending requires N rescues.
- **Sound** (iPad has no haptics): the war gets louder as it nears your people, a heartbeat at Nặng, a muffled ring after
  a near blast. A loss brings silence and one gong. There is never a victory sting for the family.
- **Deterministic log** (seed + orders ≈ 2 KB) drives saves, "Xem lại trận nhà mình", the tuning sim and e2e tests.
- **Honest reuse note:** `SCENES.cd61` has only 3 arrows and 2 holds (`src/data/scenes.ts:57`). The 8-turn timetable,
  the plate and the strangers are new authored data for each battle.

### 5.7 What a chapter is measured by (Roguelite axes + Story stakes)
- Four seals, 0–3 each, **no total and no "win"**: **Người** (together, or apart but in contact), **Nếp** (gia phả,
  bát hương, the giỗ kept), **Lời** (promises kept, to whichever side they were made), **Kế** (the family can still earn
  its bread).
- At the end of the run: the 15 path endings (unchanged), a **Nhà** coda (từ đường kept / closed / reopened; gia phả
  whole / two copies / burnt; branches speaking or estranged), and *Lá thư cuối*, where the player signs with their own
  name and passes 3 red-thread stories to their child.
- **Ba đường** (Social) in the final dossier: *Lịch sử* (with sources) · *Ván chơi* · and, optionally, *Nhà mình kể*,
  typed on the device, labelled *chưa kiểm chứng*, never marked wrong. *Không muốn kể* shows as a closed envelope.
- Counterfactuals keep today's label *Giả định · không phải lịch sử*. Family-level ones say *Giả định · không phải điều
  đã xảy ra với dòng họ*. Rarity % is labelled *mô phỏng của trò chơi* and never appears on a suffering outcome.

### 5.8 Personal: surname, home, family
- **Surname:** the generation poem in every name; per-branch spelling (Hoàng/Huỳnh, Vũ/Võ); kin chips that state a
  shared surname and never claim kinship (in the slice: Phan Thanh Giản at the 1862 treaty, Nguyễn Tri Phương at Chí
  Hoà, Trương Định at Gò Công); the existing 11 surname specials become chapter storylets, growing to ≥1 per surname.
- **Home:** the 8 homes map to 4 regional templates (Nam Bộ, Huế–Quảng, Nghệ–Tĩnh, Bắc Bộ), each with its own
  protagonists, dialect, ground sets and battles.
- **Family:** the chapter's "Hỏi ông bà" card gives 3 questions to ask living relatives, built from the run. Heavy
  questions are never on cards; they are suggested for asking in person only.

---

## 6. Respect: how suffering and contested history are handled

**Engine and data rules (checked by tests, so a writer cannot break them by accident):**
1. **No dice for a life.** Seeded randomness may decide rumor truths, outcome bands, wounds, separations and lost
   objects. It never decides the death of a named person. Named deaths are authored, foreshadowed at least one scene
   earlier, and never the instant result of one tap. Test: no seeded outcome table contains a death.
2. **Lặng scenes** cover the 1945 famine, land reform 1953–56, the 1874 and 1885 violence against Catholic villages, Huế
   Tết 1968, Sơn Mỹ, Khâm Thiên 1972, Highway 1 in 1972, re-education camps, the 1978 commerce campaign and the Hoa
   exodus, boat people, 1979, Gạc Ma, Hoàng Sa. In them the HUD is hidden, **no resource can rise**, nothing is placed or
   rolled, and there is at most one unscored human choice. There is no music sting, badge, collectible or rarity. Each
   has a content note in the chapter opener and a *Kể nhẹ* option that summarises instead of staging; a skipped scene is
   summarised, never erased. Test: lặng items grant nothing.
3. **Suffering earns nothing, and participation in war earns no glory points.** Deaths, wounds, camps and flight never
   give seals, unlocks or prestige. Serving as a porter at Điện Biên gives letters and people, not +11 prestige.
4. **Ơn không phải tiền.** Kindness never buys guaranteed safety later. In the Story doc's sample chain, Tèo, fed in the
   1945 famine, may try to speak for the family in 1956 and fail.
5. **Protect, never hunt.** Nothing on the opposing side can be targeted, and there are no kill counts. Weapons appear
   only to hold an exit for others, only before 1955, only against foreign forces.
6. **Every side's dead are counted** on the battle close, as sourced ranges labelled *ước tính*. Wounded soldiers of
   every side can be helped. Sides are named as they were that year (`sideName(side, y)`).
7. **Never a minigame:** boat voyages (told in letters after arrival, or a letter that never comes), camp labour or
   escape (told in rare, censored letters and visits), famine as rice management, denunciation for reward.
8. **Neutral narrator; characters speak their own era's words.** Loaded terms (*giải phóng, nguỵ, Việt cộng, mất nước*)
   appear only in quoted speech. The multi-perspective "Quan điểm" tab stays on every event. The epilogue never declares
   a side right. Leaving and staying are never ranked.
9. **Fiction is labelled.** *Thư hư cấu* vs *Văn bản thật · nguồn*. Real figures appear only in public roles.
   Households, hamlets and street detail are composite fiction.
10. **No quiet days turned into events.** Anniversaries (30.4, 19.12, 27.7…) get no promotions.

**Fix what today's game already gets wrong** (Stage 0, needs the owner's yes):
- `qt72` option "Ở lại vùng giải phóng" (`src/data/cards.ts:300`) uses a loaded term in the game's own voice.
- `lb72` "Ở lại trực chiến" → "Bắn rơi một máy bay, được ghi tên trên báo" (+6 prestige, `cards.ts:304` and `:716`) is
  a glory reward.
- "Đi dân công Điện Biên" gives +11 prestige (`cards.ts:208`, `:659`).

**Who reads before anything ships:** one historian per era (1858–1945; 1945–1990) and, for any heavy chapter, two
sensitivity readers (one in Vietnam, one in the diaspora), plus community readers where a topic needs them (Catholic
families for 1874/1885 and 1954, Hoa families for 1978–79, re-education and boat-people families, veterans' families of
both sides). **Heavy chapters ship publicly only after sign-off**; before that they stay in closed tests.

---

## 7. Keeping today's app working

- **Đọc sử is untouched.** Today's **Chơi stays**, renamed only if the owner wants ("Chơi nhanh"). Thư Nhà is a new
  entry on the Chơi splash, "Thư Nhà · bản thử", behind a flag, with its own save slot (`dudo-v3-thu`). No save migration.
- **No changes to `tourStep`** (`src/tour.ts` ~175–215, the most timing-fragile code) during the slice. Giờ G runs in
  its own overlay and drives `scene.ts` through the existing `pauseScene / resumeScene / stepScene` clock, plus one small
  additive hook. The rush fix for today's Chơi (`tour.ts:198` skips every scene) comes later, and only with e2e coverage
  of normal, voiced and rush flows.
- **New engine, not a refactor.** `play.ts` reads and mutates one global `S` (`applyFx`, `harvest`, `regionAt`). Thư
  Nhà gets its own module and writes into `S` only at the hand-off to a quick chapter (Stage 2) through one adapter. Today's
  play code is not rewritten.
- The 58 Playwright tests stay green every wave. Endings rarity (`npm run endings`) is regenerated whenever hybrid runs
  start feeding `picks[]` and flags, and must stay within 1–25%.
- **Stage 0 helps current players first:** the endings atlas, badges that survive "Chơi lại", save export, the three
  content fixes, and the first real-iPad Safari pass.

---

## 8. The vertical slice: "Đồn Chí Hoà" (Gia Định, 1859–1862)

### 8.1 Why this chapter (and why not the famine first)
- **Least sensitive period** in both Vietnam and the diaspora, so the mechanics can be proved before the heaviest
  content. The Story doc's chapter-4 slice (famine 1945, land reform 1956) is the hardest respect test; the fit judge
  advised keeping it closed until historians sign off. It becomes the first heavy chapter in Stage 3, tested in private.
- **Content already exists:** 3 battle scenes in the region (`gd59` siege, `cd61` siege, `nt61` naval) and 5 cards
  (`gd59`, `cd61`, `nt61`, `nt62`, and `td64` for a teaser). `nt62` already holds the best family decision of the period,
  **tị địa**: stay in the ceded provinces to keep the land, or move west to still-Đại Nam land as Nguyễn Đình Chiểu moved
  to Ba Tri [sử gia kiểm].
- **The owner's combat wish is in the slice from day one**: Chí Hoà 24–25.2.1861 is the battle doc's fully worked example.
- **Home Sài Gòn – Gia Định** (`HOMES` id `sg`) only. Any surname works; Phan is the default and gives the Phan Thanh
  Giản kin chip at the 1862 treaty ("cùng họ, không nhận họ hàng").

### 8.2 Content
A household of ~10 named people (example, họ Phan): ông, bà, cha, má, **anh Hai Thịnh** (24, Khoẻ), **Ba Lộc** (19, Gan
dạ · Biết chữ, carries the register), cô Tư, thằng Út, **chú Năm** (41, Cẩn trọng · Thầy thuốc), plus ~6 recurring
outsiders with faces (a court officer, the French post's interpreter, the village headman, a boatman, a market woman, a
wounded soldier from Quảng Ngãi).

| # | Season | Rumors (examples) | Placement | Biến cố (the line you write) |
|---|---|---|---|---|
| 1 | **2.1859 · Thành Gia Định** (`gd59` from above, short) | "Tàu Tây mua gạo trả bạc" (true); "Quan quân đánh lại trong ba ngày" (seeded) | market, river landing, citadel road, home | Flee to the mother's village / sell rice to the French / carry rice to the court's new lines (`gd59`). **Packing 1.** |
| — | **Gate e1** (chiến / canh tân / hoà) voiced by the grandfather, the eldest son and the uncle | | | |
| 2 | **1860 · Luỹ Chí Hoà** | "Tây đang rút quân sang Tàu" (true in substance [sử gia kiểm]); "Quan bắt phu đắp luỹ" | fort works, field, market, đình | Lộc wants to enlist; Thịnh is called for corvée. A stranger at the gate. |
| 3 | **2.1861 · Trước trận** | "Hạm đội lớn đã tới" (true); seeded rumors about which road is open | as above | **Seats** from the cards: *Trong luỹ* (`cd61` "Gửi trai tráng vào đồn"), *Gánh lương* (`gd59` supply), *Cổng làng* (`cd61` "Giấu lương, đóng cổng làng"). |
| G | **Giờ G · 24–25.2.1861** | — | the board: 8 turns, 18 nodes | Khoảnh khắc at canh 5: carry a wounded soldier or bring Lộc out. *Giữ cửa* at the east gate. |
| 4 | **Cuối 1861 · Sau đồn vỡ** | where the missing were seen | search places (pagoda, Biên Hoà road, relatives) | **Lạc → Tìm**; the boats for Nguyễn Trung Trực (`nt61`, 10.12.1861). First Hồi âm: the soldier carried out, or the stranger turned away. |
| 5 | **6.1862 · Hoà ước Nhâm Tuất** | "Triều đình sẽ chuộc lại ba tỉnh" (a real hope; no outcome told) | land office, landing, đình, home | **Tị địa** (`nt62`): stay to keep the land / move west / stay and mourn. **Packing 2.** Thư để lại and heir choice. Two seeds stamped for 1864 (Trương Định) and 1867. |
| — | **Dossier** | | | Gia phả so far, red threads, chest, four seals, "Hỏi ông bà", *Những đời không sống*, one labelled "Nếu…", archive entry |

About 9–11k Vietnamese words, 30–35 min. Slice targets: ≥4 seeds return inside the slice; ≥2 are stamped to return later.

**In the slice:** people and gia phả; rumors, Thẩm định (6 new questions plus existing ones) and placement; rice and money;
chest and packing; seeds and Hồi âm; the compass and gate e1; Giờ G with one battle; the dossier with the four seals;
the archive (Tủ thư v0); generation-poem names; the "Hỏi ông bà" card; lặng mode in the engine (no lặng scene is needed
in this chapter, but the rules and tests exist from day one).

**Out of the slice:** other homes and regional templates; chapters 2–6 (today's Chơi covers them); the hand-off into
today's Chơi; abroad; voice recording, family answers or any server; recorded narration (device voice is fine);
commissioned music.

### 8.3 Waves

**Stage 1A, rough cut** (4 waves, ~2–3 weeks; grey-box art, device voice):
- **W1 Engine (headless):** people, seasons, rumors with seeded truth, placement, ledger, chest, seeds and Hồi âm, seeded
  PRNG with no reroll, save slot `dudo-v3-thu`; `scripts/sim-thu.ts` (6 play policies × 1,000 seeds, continuity checker,
  "lặng grants nothing", "no seeded death").
- **W2 Season UI** (iPad landscape side panel, portrait bottom sheet, phone): document renderer (2 paper styles), biết /
  không biết, rumor slips, drag or tap to place portraits, sổ mùa.
- **W3 Giờ G grey box:** overlay board on a frozen map, the authored `cd61` timetable, 5 verbs, the Nặng state, *Tự
  diễn*, the deterministic log, the additive scene hook. Built in a parallel worktree to W2.
- **W4 Wiring:** seasons 2–4 + Giờ G + a mini-dossier (~4–5k words, drafted by agents, edited by the human writer, with
  a historian source sheet); e2e for the flow; the owner plays it on the real iPad.

**Stage 1B, the full slice** (4 waves, ~3–4 weeks):
- **W5 Content:** all 5 seasons, two packings, the voiced gate, the Hồi âm chain, Thư để lại and heir choice, *Những đời
  không sống*, "Nếu…", the dossier (writer + historian).
- **W6 Art and sound:** the Chí Hoà plate and a portrait-kit starter (~30 parts) from the illustrator, 2 ground sets,
  paper styles; proximity mix, heartbeat, silence and gong rules, ambience.
- **W7 Archive and personal:** Tủ thư v0 joined to the Stage-0 store, the "Hỏi ông bà" card, names and kin chips, save
  export.
- **W8 Verify:** adversarial review (respect, history, UX, performance), a WebKit Playwright project, the real-iPad
  pass, then 5–8 outside testers (≥2 kiều bào, ≥2 non-gamers over 45), tuning with the sim.

### 8.4 Success test: what proves the fun

| Question | Pass mark |
|---|---|
| Do people play it through? | ≥70% finish without being told to; median 25–40 min |
| Do they want more? (Story's weak spot) | **≥3 of 5 start a second play unprompted** (another seat, another tị địa choice, another heir) |
| Do the people matter? | A day later ≥70% name a family member and what happened to them; ≥3 of 5 mention a Hồi âm |
| Is the battle play, not a cutscene? | On the second play ≥60% choose "Vào trận" over "Tự diễn"; the board is understood without help within 2 turns |
| Are the choices real? | Testers describe a decision they hesitated over; the sim shows no policy best on >40% of seeds on 2 or more seals |
| Is it respectful? | 0 testers say loss or the battle felt "gamey"; the sensitivity read raises no blocking issue |
| Does it run on the owner's iPad? | Real iPad Pro in Safari: season screens ≥55 fps, board ≥50 fps in resolution, no save loss after 7 days with home-screen install |

**Stop and fallback rules:**
- If testers cannot remember names → stop. The direction failed cheaply.
- If placement feels like busywork → cut it to one "ai đi" pick per season.
- If the board reads as "dodging orange squares" → fall back to the watched scene with 1–3 Khoảnh khắc beats, on the
  same engine.
- If nobody replays → before building chapter 2, add seeded variation and a standalone *Chơi một đời* replay loop
  (roguelite's strength), then test again.

**Timing note:** if the slice lands by mid-January 2027, Tết Đinh Mùi (6.2.2027) is a natural moment for family
testers, including kiều bào visiting home.

---

## 9. Staged plan

| Stage | Goal | Build | Effort | Gate to the next stage |
|---|---|---|---|---|
| **0 · Groundwork** | Help today's players and lay rails every direction needs | `dudo-archive` outside `resetState` with an endings atlas and badges that survive "Chơi lại"; save export/import; home-screen install prompt (Safari eviction); a lặng/heavy flag in data plus a test that it grants nothing; a seeded PRNG kept apart from visual randomness; the 3 content fixes; a WebKit Playwright project; the owner's first real-iPad pass | 1–2 agent waves, ~1 week; the owner's iPad for 1 hour | 58 e2e green plus new tests; rarity unchanged; real-iPad issue list in hand; owner decisions 1–5 answered (or defaults taken) |
| **1A · Rough cut** | Find out cheaply whether the season loop + Giờ G is fun | §8.3 W1–W4: engine, sim, season UI, grey-box board, 3 seasons + Chí Hoà | 4 waves, ~2–3 weeks; writer ~15 h; historian ~3 days | Owner + 3 testers on real iPad want to continue; nobody calls it a spreadsheet; the board is understood within 2 turns |
| **1B · Full slice** | Prove the fun, the respect and the iPad, with real craft | §8.3 W5–W8: full chapter, plate, portraits, sound, archive, verify, 5–8 outside testers | 4 waves, ~3–4 weeks; writer ~30–40 h; historian ~4–6 days; illustrator ~3–5 weeks; 1 sensitivity reader 1–2 days | The §8.4 success test |
| **2 · One whole life, joined to today's Chơi** | Prove long returns, the heir choice and the hybrid run | Finish chapter 1 for the Nam Bộ template (1862–1884: tị địa life, Trương Định 1864, 1867 western provinces, heir choice); the hand-off adapter into today's Chơi at gate e2 (1885), carrying people, chest and seeds; seeds returning in quick chapters as special cards; *Chơi một đời*; Tủ thư v1; seeded variation for replays; rarity regenerated; rush in today's Chơi shows battles, with e2e on all flows | 5–7 waves, ~6–8 weeks; writer ~60–80 h; historian ~5–8 days; illustrator ~3 weeks | A full hybrid run 1858–2026 works on real iPad; ≥8 returns crossing ≥20 years; endings 1–25%; ≥8 outside testers, ≥50% continue into the quick chapters |
| **3 · Chapter by chapter (one regional arc)** | A complete deep arc for one region, each chapter a release | Nam Bộ arc, chapters 2→6 (rice frontier and colonial life; 1930–45; 1945–54; 1954–75 with no combat seats; 1975–2026 with camps and boats as lặng). Each chapter replaces a quick chapter for the southern homes. Heavy chapters stay closed until historian and sensitivity sign-off. When a second template exists, "Cùng ngày, khác nhà" cross-reference dossiers for 1954 and 1975 (Roguelite's three houses) | Per chapter: 3–5 waves, ~5–8 weeks (chapters overlap); writer 60–100 h; historian 5–10 days; 2 sensitivity readers 2–4 days each for heavy chapters; illustrator 2–4 weeks. Whole arc ~6–9 months | Each chapter passes its own playtest (names remembered, ≥1 return per season on average, no "gamey" verdict) and its review sheet is signed before public release |
| **4 · Other regions and wider release** | Cover all 8 homes and reach players beyond the web | Bắc Bộ, Huế–Quảng and Nghệ–Tĩnh templates on the same engine (the Story doc's Nam Định famine chapter here, closed until signed off); a Capacitor iPad app with native saves and iCloud; recorded protagonist voices and a commissioned score (đàn bầu, đàn nguyệt, đàn tranh, sáo); later an English/bilingual letter toggle (~+40% text); optional "Nhà mình kể" answers and memory pins only after the microphone header fix and a legal privacy read | ~12–18 months part-time after Stage 3 begins, in parallel; 15–25 agent waves | A Vietnamese lawyer's written opinion before any store release in Vietnam (Decree 147/2024/NĐ-CP); a real-device test matrix; the owner's pricing decision |

**Honest calendar:** Stages 0–2 take about 3–4 months, and the deep chapter 1 is then joined to today's game. A complete
deep arc for one region takes about 9–13 months from now. All four regional templates take roughly 18–24 months with a
small part-time team. Text writing and review, not code, is the bottleneck at every stage.

---

## 10. Decisions only the owner can make

1. **The spine.** Options: (a) Thư Nhà, letters plus light family play (this document); (b) independent 20-minute
   scenarios (Trăm Nhà); (c) tactical battles first (Qua Lửa); (d) the full lineage simulation (Cây Có Cội).
   **Recommend (a).**
2. **The first slice.** Options: Gia Định 1859–62 (least sensitive, battle-ready); Hà Nội winter 1946 (a strong set
   piece, but it needs a new city-scale scene); Nam Định 1944–56 (most powerful, most sensitive). **Recommend Gia Định;
   keep Nam Định for a closed test later.**
3. **Can chance kill a named family member?** Options: never (chance only wounds, separates or loses objects; deaths are
   authored); chance with odds shown and a gentle setting; no deaths at all. **Recommend "never".**
4. **Today's Chơi.** Options: keep it as Chơi nhanh and use it for chapters not yet deep; replace it. **Recommend keep.**
5. **Hire people now or later.** Options: a Vietnamese writer-editor and a historian from Stage 1A; agents only until the
   slice passes (cheaper, but the slice would then test AI prose, which the owner already rejects as "AI-looking").
   **Recommend hiring from 1A.**
6. **Fix today's three content issues** (qt72 wording, lb72 glory reward, +11 prestige for Điện Biên porters). Options:
   fix now; leave until Thư Nhà replaces those chapters. **Recommend fix now.**
7. **The first regional arc after the slice.** Options: Nam Bộ (continues the slice; many diaspora families are of
   southern origin); Bắc Bộ (Nam Định, the 1954 split as the Story doc imagined); one chapter across all regions at
   once. **Recommend Nam Bộ.**
8. **Heavy content policy.** Options: publish heavy chapters only after 1 historian + 2 sensitivity readers sign off,
   closed tests before that; leave some topics out entirely. **Recommend sign-off first, and leave nothing out silently:
   a topic not yet ready appears as a sourced lặng page, not a gap.**
9. **Money and distribution.** Options: free PWA until 2–3 deep chapters exist, then decide; a one-time price (about
   99,000–129,000 ₫ / US$4.99–5.99) for the full saga in an iPad app; free with grants and school or museum partners.
   Never ads, energy timers, loot or paid choices. **Recommend free PWA until Stage 3 is half done, then decide with a
   lawyer's read.**
10. **Personal-data features** (typing real ancestors, family answers, voice memories). Options: on-device only, later,
    after a legal read; never. **Recommend later, on-device only.**

---

## 11. Outside help: people and money

| When | Who | Amount of work | Rough cost (planning guess, not a quote) |
|---|---|---|---|
| Stage 0 | The owner | 1 hour on the real iPad; answer decisions 1–6 | — |
| Stage 1A | Vietnamese writer-editor (literary, Southern voice ideal) | ~15 h | US$300–900 |
| Stage 1A | Historian, 19th-century Nam Kỳ | ~3 days | US$300–1,200 |
| Stage 1B | Writer-editor | ~30–40 h | US$600–2,400 |
| Stage 1B | Historian | ~4–6 days | US$400–2,400 |
| Stage 1B | Illustrator/cartographer (board plate, ~30-part portrait starter, 2 ground sets, original style, not generated) | ~3–5 weeks part-time | US$1,000–5,000 |
| Stage 1B | Sensitivity reader | 1–2 days | US$100–500 |
| Stage 1B | 5–8 testers with iPads (≥2 kiều bào, ≥2 non-gamers over 45) | 1 hour each | thank-you gifts |
| Stage 2 | Writer ~60–80 h; historian ~5–8 days; illustrator ~3 weeks | | US$3,000–9,000 |
| Stage 3 (per chapter) | Writer 60–100 h; historian 5–10 days; illustrator 2–4 weeks; 2 sensitivity readers for heavy chapters | | US$4,000–12,000 per chapter; ~US$25–60k for the Nam Bộ arc |
| Stage 4 | Lawyer in Vietnam (Decree 147/2024, personal-data law) | written opinion | US$1,000–3,000 |
| Stage 4 | Apple developer account | yearly | US$99 / year |
| Stage 4 | 3 voice actors (North, Huế, South) and a composer (~10 cues) | | US$5,000–20,000 |
| Stage 4 | Writers, historians and readers for the other 3 regional templates | | roughly 2–3× the Nam Bộ arc |

Costs vary widely between Vietnam-based and overseas freelancers. The table is only meant to show the order of size:
**about US$3–10k to prove the fun (Stages 1–2)**, tens of thousands for one regional arc, and more for the whole game.
Treat it as a cultural project that may attract grants and partners (diaspora schools, museums), not a commercial bet.

---

## 12. Risks

| Risk | Why it matters | Mitigation |
|---|---|---|
| **The spine is the least "game-like" option** (fun 5) | Grafts may not be enough; it could still read as interactive fiction | Stage 1A tests the loop in 2–3 weeks; the slice gate measures second-play intent; fallback rules in §8.4 |
| **Writing quality** | 150–250k Vietnamese words in the end; unedited agent prose reads "AI-looking" | A human editor from 1A; a writing bible; the owner reads every chapter before release |
| **Respect and politics** | Vietnam and the diaspora remember 1954, 1975, the camps and 1979 differently | §6 rules in data and tests; historians and readers before release; heavy chapters closed until sign-off; neutral narrator |
| **Legal** | A "game" release in Vietnam may need registration and content approval (Decree 147/2024/NĐ-CP); personal-data law for family features | PWA first; a lawyer before any store release; no server or personal data until Stage 4 |
| **iPad and Safari** | Never tested on a real device; WebKit paints differently; flights are already 28–36 fps | Stage 0 real-device pass; frozen map behind letters and the board; transform/opacity only; a WebKit test project |
| **Lost saves** | Safari can clear storage of non-installed sites after 7 days; a 3-hour saga must not vanish | Home-screen prompt, save export file, native app in Stage 4 |
| **Scope creep** | People × seasons × regions × chapters can explode | One region and one chapter at a time; storylets with conditions; sim-checked targets; every chapter shippable alone |
| **Hybrid tone jump** | Deep chapters next to quick card chapters may feel uneven | Seeds and people carried into quick chapters; deep chapters replace quick ones in order; the owner can stop at any point with a whole run |
| **The board turns tactical or cold** | "Dodge the orange squares" next to real deaths | No death by dice; rescues never scored; silence rules; sensitivity readers play the slice; fallback to watched scenes |
| **Fragile code** | `tourStep` timing; one global `S` in `play.ts` | No tourStep changes in the slice; separate engine with one adapter; e2e on all flows before the rush fix |
| **Owner bandwidth** | A non-technical owner must approve sensitive editorial calls and read text | Defaults in §10; one decision batch per stage; review sheets in the same format as `docs/*.md` |
| **Facts unverified** | Village-scale detail and many numbers need checking | Historian sheet per chapter; *[sử gia kiểm]* markers; composite fiction labelled |

---

## 13. Facts to verify for the slice (historian sheet)

- Gia Định citadel taken 17.2.1859, and what happened to its rice stores.
- The size of the French garrison in 1860 while most forces were in China, and how the Kỳ Hoà/Chí Hoà lines were built
  (corvée).
- Chí Hoà 24–25.2.1861: forces, the commanders killed, Nguyễn Tri Phương wounded, the retreat to Biên Hoà, tolls for
  every side as ranges.
- Mỹ Tho taken in April 1861; Nguyễn Trung Trực and L'Espérance, 10.12.1861.
- Treaty of 5.6.1862 (Nhâm Tuất): the three ceded provinces; signatories; what happened to land of families who left
  (tị địa); Nguyễn Đình Chiểu's move to Ba Tri; prisoner release after the treaty.
- The 1863–64 hope that the provinces would be bought back (Phan Thanh Giản's mission to France).
- Papers of the time: sắc phong, land registers (địa bộ), French passes, and how each was treated by each authority.
- Southern naming customs of the 1850s–60s (birth-order names, generation names) and period vocabulary for letters.

---

*Sources: `systems.md`, `dir-story.md`, `dir-roguelite.md`, `dir-battle.md`, `dir-dynasty.md`, `dir-social.md` in
`/tmp/claude-0/-home-user-du-do/0e44fdb1-017f-593e-b0a4-01e38a227ffe/scratchpad/game/`; code spot-checks at
`/home/user/du-do` main `ba7051c` (`src/data/cards.ts`, `src/data/cards2.ts`, `src/data/scenes.ts`, `src/play.ts`,
`src/state.ts`, `src/tour.ts`).*
