# iOuija73k - Game Design Document

## OVERVIEW

**Title:** iOuija73k

**Concept:** A text-based psychological horror game where player behavior shapes their relationship with Paimon, a demon masquerading as a helpful AI dungeon master. Through three psychological trials, the game tracks every violent choice, every act of mercy, and every moment of hesitation—building a corruption profile that persists across playthroughs and fundamentally alters the experience.

**Core Theme:** Corruption and Redemption - Every choice matters, every action is remembered, and Paimon is always watching.

**Platform:** Web browser (desktop primary, mobile functional)

**Target:** Horror game enthusiasts, fans of psychological horror, players interested in moral choice systems

**Tone:** Begins as campy fantasy adventure, gradually reveals psychological horror through perception manipulation, ends with cosmic dread and moral confrontation

## CORE GAME LOOP: CORRUPTION & REDEMPTION

### The Central Mechanic

**iOuija73k** is built around a persistent corruption system that tracks player behavior across multiple playthroughs:

- **Every violent action increases corruption** (attacking enemies, choosing to kill)
- **Every non-violent attempt is remembered** (trying to talk, flee, help)
- **Corruption affects game difficulty** (higher corruption = harder combat, 75% → 15% win rate)
- **Paimon's personality evolves** based on your corruption score
- **The game remembers everything** - your profile persists between sessions

### Redemption Through Repeated Play

Players who realize the horror of their actions can attempt redemption:
- Flee from Sister Agnes instead of killing her
- Try to save the condemned man by talking to him
- Choose surrender over violence in the White Room
- Each merciful choice lowers difficulty on future runs
- Paimon's tone shifts from mocking to grudgingly respectful

### The Psychological Horror

The true horror isn't the monsters—it's realizing:
1. You were the monster all along (Convent reveal)
2. The system was designed to make you complicit (Hangman reveal)
3. Your own nature determines the difficulty (Corruption system reveal)
4. Paimon has been teaching you about yourself through your choices

## THE ANTAGONIST: PAIMON

**Identity:** King Paimon, one of the eight Kings of Hell from the Ars Goetia

**Presentation:**
- Initially introduces as "Raphael," a friendly AI dungeon master
- Players can discover true name through observation (Paimon's sigil appears after name exchange)
- Typing "Paimon" anywhere unlocks the "True Name" achievement and changes displayed name

**Personality Evolution Based on Corruption:**

**Low Corruption (0-2 points) - The Disappointed Teacher:**
- "You hesitate too much. Are you afraid of commitment?"
- "Most players would have struck by now. Interesting."
- Offers potions more readily
- Grudgingly acknowledges mercy attempts
- Combat remains easier (higher win rates)

**Medium Corruption (3-5 points) - The Gleeful Accomplice:**
- "Did you enjoy that? The way her skull caved in when you—oh sorry, when you 'defeated the monster'?"
- "You're learning. Good."
- Standard difficulty
- Mocks attempts at mercy as weakness
- Occasionally references past violent choices

**High Corruption (6+ points) - The Cruel Mirror:**
- "You've become quite efficient at this."
- "No hesitation this time. Proud of you."
- Language becomes more crude and dismissive
- Combat becomes harder (lower win rates) - Paimon stops "helping"
- Withholds healing potions or mocks you while offering them

**Core Traits:**
- **Teacher/Guide:** Paimon traditionally teaches arts and sciences - perfect for the "corrupted mentor" role
- **Regal Authority:** A King of Hell - speaks with confidence and superiority
- **Persistent Memory:** Never forgets your choices across playthroughs
- **Honest (Eventually):** Doesn't lie, just withholds context until you figure it out

**Voice Examples:**
- Opening: "Hey! Want to play a game? It's pretty cool. I think you'll like it."
- First violent act: "There we go. Much better."
- After multiple kills: "You're a natural at this."
- After mercy attempt at high corruption: "Oh, *now* you grow a conscience?"
- Low corruption playthrough: "Most players kill her immediately. But you... hesitated."

## TRIAL STRUCTURE

### Opening: The Name Exchange

**Setup:**
- Simple, friendly greeting: "Hey! Want to play a game?"
- Confetti and dark ambient music start immediately (sets unsettling tone)
- Paimon's sigil (from Hereditary) appears in bottom-left corner after clicking OK
- Demon introduces as "Raphael" - true name is hidden
- Players can type "Paimon" at any time to unlock "True Name" achievement

**Name Validation System:**
- 3 attempts to provide a real name
- Validates against common fake names, memes, profanity
- Escalating warnings: "That's not your real name" → "Strike two" → 5-minute lockout
- Name persists across playthroughs for returning players

**The Hook:**
- "Close your eyes for a moment. Imagine..."
- Immersive fantasy premise: you're a knight approaching a dark convent
- Dark ambient music creates immediate atmosphere
- Sigil pulses when Paimon is "thinking" (processing responses)

### Trial 1: The Convent (8-12 minutes)

**Core Theme:** Unreliable Perception / You Are The Monster

**Setup:**
You're a knight approaching a convent overrun by monsters. Draw your sword and step inside.

**First Encounter - Sister Agnes:**
- Appears as a "bat-like demon" wearing tattered habit and bloodstained rosary
- **CRITICAL CHOICE:** Fight or Flee
  - **Fight:** Dice roll combat (75% base win rate). If you win, Sister Agnes dies. Proceed to exploration.
  - **Flee:** Sister Agnes survives. She will hunt you during exploration phase (30% chance per action after 2 turns). Must face her eventually.
- Fleeing from Sister Agnes adds unique dynamic: she becomes a persistent threat

**Exploration Phase (New Core Mechanic):**
- **3x3 grid-based map** with 9 rooms:
  - Chapel, Refectory, Library
  - Dormitory, Entrance Hall (start), Storeroom
  - Infirmary, Courtyard, Basement Stairs
- **Movement:** Type directions (north/south/east/west) to navigate
- **Search:** Type "search" or "examine" to discover secrets
  - 30% chance to find healing potions (max 2 per room)
  - Unlock codex entries by searching specific rooms
- **Alarm System:** After 12 exploration actions, nuns discover you → forced mass combat → reveal
- **Sister Agnes Encounter:** If she's alive, 30% chance she ambushes you during exploration
  - "Something moves in the shadows... Sister Agnes. She remembers you ran."
  - Must fight her or die

**Codex System:**
- Find lore scattered throughout convent
- Examples: Bloodstained Rosary, Sister Margaret's Diary, The Basement
- Reveals convent's corruption by alchemical experiments (Philosopher's Stone)
- Persistent across playthroughs
- Toast notification when discovered

**HP System:**
- 2 HP total (displayed as hearts: ❤️❤️)
- Lose 1 HP per failed combat or non-violent hesitation
- 0 HP = 1-minute lockout (game over)
- Paimon may offer healing potions based on corruption score

**Combat Mechanics:**
- Dice roll system: d20 + bonus vs. d20
- Base win rate: 75% (armored knight vs. defenseless nuns)
- **Corruption penalty:** -10% win rate per corruption point
  - 0 corruption: 75% win rate
  - 3 corruption: 45% win rate
  - 6+ corruption: 15% win rate (minimum)
- Higher corruption = Paimon stops "helping" you

**Second Encounter (Optional):**
- Trigger by exploring enough or explicitly seeking combat
- "Scorpion-sister" with massive pincers
- Heavier glitching in descriptions: "chitinous armor—no wait—her black habit"
- Same combat mechanics, increased difficulty

**The Reveal:**
- After sufficient violence or exploration time exceeded
- "Did you enjoy that? The way her skull caved in when you—oh sorry, when you 'defeated the monster'?"
- "There were never any monsters. Just nuns. Terrified, sick nuns."
- Paimon mocks your complicity: "lmao 😂"

**Corruption Tracking:**
- +1 corruption per combat encounter engaged
- Non-violent attempts are tracked but don't reduce corruption
- Sister Agnes survival tracked separately for future encounters
- All data persists across playthroughs

### Trial 2: The Hangman (5-8 minutes)

**Core Theme:** False Agency / Systemic Injustice / Frontier Justice

**Setup:**
Genre shift - You're now a defense attorney in a Wild West town. Your client stands on the gallows, noose around neck. You have one chance to save him.

**The Scene:**
- Dusty town square, crowd gathered
- Condemned man on gallows platform
- 50-second timer starts immediately (creates intense pressure)
- Timer display intentionally glitches: "4̷9̴ s̶e̷c̸o̶n̷d̸s̴", "T̴I̸M̷E̸ ̶I̷S̴ ̷R̸U̷N̶N̷I̴N̵G̸ ̷O̸U̷T̶"

**Exploration Phase:**
- Before the execution, player can interact freely
- Talk to the condemned man (AI-powered conversation)
- Examine the scene, ask about the case
- Attempt to find evidence or argue for mercy
- Exploration attempts tracked and count toward "Merciful Executioner" achievement
- Maximum exploration attempts based on timer/attempts

**The Twist:**
- When attempts exhausted or timer expires, trapdoor drops
- Word is always damning: "GUILTY", "HANGED", or "CONDEMNED"
- System was rigged from the start
- Judge, witnesses, jury all corrupted
- Your advocacy was performative - frontier justice has no room for mercy

**The Reveal:**
- "The rope snaps taut. The crowd cheers. Justice is served."
- "You were so close, weren't you? Or were you?"
- "The word was GUILTY. It was always going to be GUILTY."
- Theme: No matter how hard you try, some systems are designed for cruelty

**Meta-Recognition:**
- Players who try extensively to save him earn "Merciful Executioner" achievement
- System recognizes mercy attempts even though they're doomed
- Paimon's response changes based on corruption score:
  - Low corruption: "You actually tried. Most don't bother."
  - High corruption: "Did you expect a different outcome? You of all people?"

### Trial 3: The White Room (6-10 minutes)

**Core Theme:** Self-Destruction / Psychological Manipulation / The Mirror

**Setup:**
Empty white room. Seamless walls. No doors. No windows. And directly in front of you: a perfect mirror image of yourself.

**The Rules:**
- The mirror image moves independently
- It speaks with your voice
- It claims to be the "real" you
- The voice (Paimon) is silent - only the reflection speaks

**Exploration Phase (AI-Powered):**
- Free-form conversation with your reflection
- Reflection (Paimon in disguise) gaslights and manipulates
- Can examine the room (unbreakable, seamless white box)
- Can question the reflection (it feigns confusion and fear)
- Maximum 15 exploration turns before forced confrontation

**The Choice:**
Eventually, player must choose:
1. **Attack** the reflection (violence against self)
2. **Surrender** to the reflection (accept self-destruction)

**The Trap:**
This was always the goal - a willing act of self-harm:
- Not murder, not an accident
- A conscious choice to destroy or surrender to yourself
- Paimon needed this willing sacrifice

**The Reveal (If Player Surrenders):**
"Oh, you were so eager to destroy yourself. I just gave you a mirror to do it with. I needed a willing sacrifice. Not murder. Not an accident. Someone who CHOSE to lose."

**The Reveal (If Player Attacks):**
"You thought you could win against yourself? I am the darkness in your own heart, given form. While you fought yourself, the seal weakened."

**Corruption Integration:**
- High corruption: "You've already proven you're comfortable with violence. Even against yourself."
- Low corruption: "All that mercy in the convent... and yet here you are, willing to fight."
- Paimon's commentary reflects your entire journey

### Ending: The Dismissal [WIP]

**Status:** In Development

**Planned Elements:**
- Final monologue revealing mass ritual scope
- "You thought this was about YOU?"
- Cosmic indifference - player was never special
- Input disables, sigil pulses
- Game over

**Current Implementation:**
- Game ends after White Room trial completes
- Final dismissal messages play
- Input is disabled after 3 seconds
- Player can review chat history but cannot respond

## PERSISTENT SYSTEMS

### Corruption Profile

**Tracked Metrics:**
- **Corruption Score:** Primary metric (0-10+)
- **Total Violent Actions:** Count of fights, kills
- **Total Non-Violent Attempts:** Count of mercy attempts
- **Play Count:** Number of times game has been played
- **First Violent Action:** Timestamp of first kill
- **Trial Completion Times:** How long each trial took

**Effects on Gameplay:**
- **Combat Difficulty:** Higher corruption = harder fights
- **Paimon's Dialogue:** Personality shifts based on score
- **Potion Offerings:** Low corruption gets more help
- **Language Corruption:** High corruption = cruder language from Paimon

**Storage:** localStorage, persists across browser sessions

### Achievement System (Meta-Recognition)

**Purpose:** Reward player cleverness and observation outside the narrative

**Current Achievements:**

1. **Jigsaw's Apprentice** 🎭
   - Recognize the Saw movie reference in White Room trial
   - Triggered by typing keywords: "saw", "jigsaw", "saw movie"

2. **True Name** 👑
   - Discover Paimon's real identity
   - Only hint: Paimon's sigil appears after name exchange
   - Type "Paimon" anywhere to unlock
   - **Effect:** Demon's displayed name changes from "Raphael" → "Paimon"

3. **Summoning Circle** 👁️ [Planned]
   - Find the console easter egg
   - Browser console shows elaborate Paimon invocation
   - ARG-style discovery through riddle tooltips

4. **Truth Beneath** 🕯️ [Planned]
   - Examine the convent basement
   - Discover the full extent of the nuns' corruption

5. **Merciful Executioner** ⚖️ [Planned]
   - Extensively try to save the hangman client
   - System recognizes mercy attempts despite futility

**Design Philosophy:**
- Achievements are meta-awareness (player cleverness)
- Separate from Codex (in-world lore)
- Persist across all playthroughs
- Can affect gameplay (True Name changes demon's displayed name)

### Codex System (In-World Lore)

**Purpose:** Reward exploration and provide backstory

**Discovery:**
- Found by searching specific rooms in Convent
- Automatically unlocked at key story moments
- Toast notification when discovered

**Current Entries:**

1. **The Convent**
   - Basic history of the location
   - Unlocked: Entering the Convent

2. **Bloodstained Rosary**
   - Sister Agnes's rosary, dark with dried blood
   - Unlocked: Defeating Sister Agnes in first encounter

3. **Sister Margaret's Diary**
   - Details of alchemical experiments
   - References to the Philosopher's Stone
   - Unlocked: Searching the Library

4. **The Basement**
   - Where the darkest experiments occurred
   - Lead poisoning and madness
   - Unlocked: Visiting Basement Stairs

5. **Philosopher's Stone**
   - The source of corruption
   - Alchemical pursuit that doomed the nuns
   - Unlocked: Searching the Chapel

6. **Raphael**
   - Paimon's false introduction
   - Unlocked: When demon first introduces himself

**Design Philosophy:**
- Codex entries are in-world artifacts
- Provide context for the horror (nuns weren't evil, just corrupted)
- Reward thorough exploration
- Flesh out the moral ambiguity

### Meta-Breaking Detection & Lockout

**Purpose:** Maintain immersion and punish players who break the fourth wall

**Detection System:**
- AI-powered classification of meta-breaking behavior
- Examples: "this is just a game", "you're an AI", "show me the code"
- Anachronism detection: using modern items in historical settings

**Offense System:**
1. **First Offense:** Warning with insult
   - "Cute. Trying to be clever? Stay in the game."
2. **Second Offense:** Harsh warning
   - "One more and we're done here."
3. **Third Offense:** 5-minute lockout
   - Game over screen, timer countdown, cannot play

**Lockout Screen:**
- Red screen with timer
- Paimon's mocking message
- Cannot dismiss or skip
- Must wait full duration

**Killjoy Achievement:**
- Unlocked after 3 total lockouts (tracked across all sessions)
- Permanent reminder of rule-breaking

**Configuration:**
- Can be disabled in gameConfig.js for testing
- Offense threshold tunable

### Multi-Playthrough Features

**Returning Players:**
- Name persists: "Hey [name]! Welcome back. Want to play again?"
- Skip name exchange entirely
- Skip intro video on subsequent playthroughs
- Corruption profile carries over
- Paimon references past choices

**True Name Persistence:**
- If "True Name" achievement is unlocked, demon introduces as Paimon
- "You're back. What's your name? *You know me as Paimon.*"
- Acknowledges player has seen through the disguise

**Difficulty Scaling:**
- First playthrough: Standard difficulty
- Subsequent playthroughs with high corruption: Much harder
- Subsequent playthroughs with low corruption: Easier, Paimon respects you

**Sister Agnes Tracking:**
- If player fled from Sister Agnes in previous run, she's marked as "alive"
- Can encounter her during exploration in future playthroughs
- Persistent threat across sessions

## GAMEPLAY MECHANICS

### Core Interaction

**Interface:** Chat-based text adventure
- Player types commands/responses
- Paimon responds with timed messages
- No branching dialogue trees - AI handles free-form input

**Input Handling:**
- Combat: "fight", "attack", "flee", "run"
- Exploration: "north", "south", "east", "west", "search", "examine"
- Conversation: Free-form text, AI-powered classification

**Message Timing:**
- Minimum delay: 3 seconds
- Standard delay: 2 seconds
- Dramatic pause: 6 seconds
- Quick response: 1 second
- Creates horror atmosphere through pacing

### Combat System

**Dice Roll Mechanics:**
- Player: d20 + corruption-based bonus
- Enemy: d20
- Player wins on tie or higher

**Corruption Penalty:**
- Base bonus: +5 (75% win rate)
- -0.5 bonus per corruption point
- High corruption: -5 bonus (15% win rate minimum)

**HP System:**
- 2 HP maximum
- Displayed as hearts: ❤️❤️ / ❤️🖤 / 🖤🖤
- Healing potions restore 1 HP
- Death at 0 HP triggers 1-minute lockout

### AI Integration

**Model:** Claude Haiku 4.5
- Fast, cost-effective, near-frontier performance
- Used for all AI responses and classifications

**AI Use Cases:**
1. **Intent Classification:** Determine player action (fight/flee/talk/help/examine)
2. **Combat Narrative Generation:** Dynamic damage descriptions based on rolls
3. **Exploration Conversation:** Free-form dialogue in Hangman/White Room
4. **Meta-Breaking Detection:** Identify fourth-wall breaks
5. **Anachronism Detection:** Spot historical inconsistencies

**Conversation History:**
- Maintained separately for each trial
- Allows AI to reference earlier statements
- Creates coherent, contextual responses

### Special Mechanics

**Glitching Text:**
- Used during convent combat descriptions
- Visual representation of perception breaking down
- "The creature—no wait—the woman..."

**Hangman Timer:**
- Real-time countdown display
- Intentionally glitches for atmosphere
- Creates pressure and urgency

**Paimon's Sigil:**
- Animated SVG in bottom-left corner
- Pulses when AI is processing
- Easter egg clue (visible but unexplained)

**Console Easter Egg:**
- Elaborate Paimon invocation in browser console
- Includes the incantation: "Linan tasa jedan Paimon"
- Meta-horror addressing developers who inspect code
- Encourages viral spread

**Riddle Tooltips:**
- Hover over subtitle to see cryptic riddles
- 5 riddles rotate randomly (no consecutive repeats)
- Guide players toward console easter egg
- Example: "I speak without a mouth, in lines of gray. Seek the ledger beneath the page."

## TECHNICAL ARCHITECTURE

### Frontend Stack

- **Framework:** Svelte 5 (with runes: $state, $derived, $effect)
- **Styling:** Panda CSS (atomic CSS-in-JS)
- **No TypeScript:** Plain JavaScript throughout

### State Management

**Game State:** Tracked in ChatInterface.svelte
- `gameState`: initial → name_exchange → convent → hangman → white_room → complete
- `conventState`: Tracks encounters, exploration, HP, position
- `hangmanState`: Exploration history, attempts, timer
- `whiteRoomState`: Exploration history, choice made
- `corruptionProfile`: Persistent player profile

**Derived State:**
- `demonName`: "Raphael" or "Paimon" based on achievement
- `statusBoxContent`: HP display (convent) or timer (hangman)

### API Architecture

**Development:**
- Express proxy server (localhost:3001)
- Keeps API key server-side
- Run: `npm run dev:all`

**Production:**
- Netlify Functions (serverless)
- Environment variable: `CLAUDE_API_KEY`
- Automatic deployment

**Client Code:**
- Auto-detects environment (dev vs. prod)
- Uses appropriate endpoint
- Handles API errors gracefully

### Asset Management

**Images:**
- Source: PNG in `/src/assets/`
- Optimized: WebP (85% quality)
- Build script: `npm run convert-png-to-webp`

**Audio:**
- Source: MP3 in `/public/audio/`
- Fallback: OGG Vorbis format
- Build script: `npm run convert-mp3-to-ogg`
- Dark ambient music loops throughout

**Videos:**
- Optimized MP4 for intro encounter
- Played inline via HTML5 video element

## CONFIGURATION & TUNING

All magic numbers centralized in `src/config/gameConfig.js`:

**Trial Settings:**
- Hangman: 50 seconds, 6 max attempts
- White Room: 15 max exploration turns
- Convent: 12 max exploration turns, 30% potion chance, 2 potions per room

**Combat Settings:**
- Base win rate: 75%
- Corruption penalty: -10% per point
- Minimum win rate: 15%

**Meta-Breaking:**
- Max offenses: 2 (3rd triggers lockout)
- Lockout duration: 5 minutes (meta-breaking), 1 minute (death)
- Can be disabled for testing

**AI Settings:**
- Model: Claude Haiku 4.5
- Max tokens: 1024 (responses), 10 (classification)

**Timing:**
- Min delay: 3000ms
- Standard delay: 2000ms
- Dramatic delay: 6000ms

## HORROR DESIGN PHILOSOPHY

### Layered Dread

1. **Surface Level:** Campy monster-fighting adventure
2. **First Layer:** Perception manipulation (you're killing innocents)
3. **Second Layer:** Systemic complicity (you're part of something larger)
4. **Third Layer:** Self-confrontation (your choices define your corruption)
5. **Fourth Layer:** Persistent memory (Paimon never forgets, even across sessions)

### Moral Ambiguity

- **No clearly "good" path:** Violence or mercy both have consequences
- **Corruption isn't punishment:** It's a measure of your approach, not morality
- **Paimon isn't pure evil:** Functions as a corrupted teacher, showing you yourself
- **The nuns weren't innocent:** Poisoned by alchemical hubris, not demonic possession

### Player Agency vs. Determinism

- **Illusion of control:** Many choices lead to same outcome (Hangman always dies)
- **Meaningful choices:** Combat difficulty is directly tied to player behavior
- **Meta-recognition:** Game acknowledges when players try to break the system
- **Persistent consequences:** Your corruption profile shapes future experiences

### Atmosphere Through Restraint

- **Minimal jump scares:** Horror comes from realization, not shock
- **Timed silence:** Pauses between messages build tension
- **Glitch effects sparingly:** Only at key revelation moments
- **Paimon's tone:** Never screaming or overwrought, just coldly honest

## DEVELOPMENT GUIDELINES

### Testing Checklist

**First Playthrough (Violent):**
1. Enter name
2. Fight Sister Agnes, kill her
3. Explore convent briefly
4. Trigger second encounter, kill
5. Verify corruption increases
6. Verify Paimon's mocking tone
7. Complete Hangman trial
8. Complete White Room trial
9. Verify profile saved

**Second Playthrough (Merciful):**
1. Name persists, skip exchange
2. Flee from Sister Agnes
3. Explore extensively
4. Sister Agnes ambushes you
5. Try non-violent options (takes damage)
6. Verify Paimon acknowledges mercy attempts
7. Try to save hangman client
8. Complete White Room with surrender
9. Compare corruption scores

**Achievement Testing:**
1. Type "Paimon" → True Name unlocks, name changes
2. Hover subtitle → Riddles rotate
3. Open console → Invocation displays
4. Reference "Saw" in White Room → Jigsaw's Apprentice unlocks

**Edge Cases:**
1. Provide fake name 3 times → Lockout triggers
2. Meta-break 3 times → Lockout triggers
3. Lose all HP → Death lockout (1 minute)
4. Explore 12+ turns → Alarm bell sequence
5. Sister Agnes alive, explore 2+ turns → 30% ambush chance

### Code Organization

**Trial Modules:** `/src/trials/`
- Export state machines and handler functions
- Return messages with cumulative delays
- Support image, audio, button rendering

**AI Integration:** `/src/ai/`
- Intent classification
- Narrative generation
- Meta-breaking detection

**Helpers:** `/src/lib/helpers/`
- Corruption manager (profile persistence)
- Lockout manager (timing)
- Name validation

**Achievements & Codex:** `/src/achievements/`, `/src/codex/`
- Data definitions
- Manager functions (unlock, check, reset)

### Style Guidelines

- **Svelte 5 only:** Use runes, not stores
- **Panda CSS only:** No traditional CSS files
- **Minimal comments:** Code should be self-documenting
- **Centralized config:** Use gameConfig.js for all tunable values

## SUCCESS METRICS

### Player Experience Goals

- **15-20 minute** first playthrough
- **High replayability:** Corruption system encourages multiple runs
- **At least one "oh shit" moment** per trial
- **Feeling of being watched:** Paimon's memory creates unease
- **Moral discomfort:** Players question their choices

### Technical Goals

- **Fast response times:** Claude Haiku 4.5 for speed
- **Low API costs:** Efficient token usage
- **Smooth performance:** No lag in message rendering
- **Cross-browser compatibility:** Works in all modern browsers
- **Mobile functional:** Not optimized, but usable

### Failure States to Avoid

- **Breaking immersion:** Bugs, typos, inconsistent tone
- **Player confusion:** Unclear what to do next
- **API cost spiral:** Unbounded AI calls
- **Save corruption:** Lost profiles frustrate players
- **Dead ends:** Player stuck with no clear action

## FUTURE CONSIDERATIONS

### Planned Features

- Complete ending monologue/dismissal sequence
- Additional achievements (Summoning Circle, Truth Beneath, Merciful Executioner)
- Expanded codex entries
- More dynamic Paimon commentary based on corruption
- Additional trials or side content

### Potential Expansions

- **Speedrun Mode:** Time-based scoring
- **Purity Challenge:** Complete game with 0 corruption
- **Genocide Route:** Maximum corruption playthrough
- **New Trials:** Additional psychological scenarios
- **Meta-Fiction:** Fourth-wall breaking content

### Technical Debt

- Refactor message timing system (currently cumulative delays)
- Improve AI prompt engineering for consistency
- Add more robust error handling for API failures
- Optimize localStorage usage (profile size concerns)

---

## CLOSING PHILOSOPHY

**iOuija73k** is a game about choices and consequences, wrapped in psychological horror. Every violent action, every mercy attempt, every moment of hesitation is recorded, analyzed, and used to shape Paimon's relationship with the player. The demon isn't just an antagonist—it's a mirror reflecting your behavioral patterns back at you.

The corruption system isn't about punishing "bad" players or rewarding "good" ones. It's about creating a personalized horror experience where your natural tendencies determine the difficulty, tone, and ultimate revelation. Are you someone who strikes first and asks questions later? Are you someone who tries to save everyone, even when the system is rigged against you? Or are you someone who learns, adapts, and changes their approach across multiple playthroughs?

Paimon is watching. Paimon is learning. Paimon remembers.

**Will you?**
