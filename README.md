# ESEA - Early Start Education App

ESEA is a free early childhood learning app for young children, families, and educators. The child-facing experience is now designed around developmentally appropriate practice for ages 3-6: naming, listening, matching, counting, story sharing, feelings, routines, and simple observation.

## Learning Design

The project is organized around early development rather than school-subject coverage. Each area uses short, concrete activities that make sense for preschool and kindergarten learners.

| Area | Child Development Goal | Activities |
| --- | --- | --- |
| Numbers & Counting | Number names, 1-10 recognition, object counting | Hear numbers, pick numbers, count apples |
| ABC & Letters | Letter names, early sound awareness, visual recognition | ABC practice, pick the letter, letters with pictures |
| Colors | Color naming and visual discrimination | Learn colors |
| Shapes | Shape recognition and spatial language | Learn shapes, identify a shape |
| First Words | Vocabulary, picture-word connection, oral language | Pick the word, pick the picture, kid word book |
| Stories | Attention, memory, sequencing, shared reading | Story pages and story videos |
| Daily Routines | Time words, weather words, predictable routines | Calendar words, weather and seasons |
| Feelings | Emotional vocabulary and self-expression | Learn emotions |
| Nature Discovery | Observation of plants, animals, weather, and living things | Living things and weather watching |
| Matching Games | Memory, attention, visual matching, turn-taking | Picture matching, shape hunter, catch me |
| Watch & Listen | Adult-guided media moments | Short learning videos |

## Removed From the Child-Facing Flow

The main learning path intentionally no longer promotes sections that are above the early childhood target age or too abstract for the first experience:

- Civics, government, state capitals, and capital quizzes
- Chemistry and computer science concepts
- Full dictionary browsing
- Broad 1-100 number drills as the starting point
- Higher arithmetic and generic "challenge level" framing
- Leaderboards and competitive achievement language
- Games that are less connected to early learning goals

Those files may still exist in the repository for future older-child pathways, but they are not part of the main early-development design.

## Educational Approach

ESEA favors:

- Concrete before abstract
- Recognition before recall
- Oral language before spelling pressure
- Short sessions with repetition
- Adult-guided story, video, and routine moments
- Positive feedback without ranking children against one another
- Whole-child growth, including emotions and attention

## How Lessons Adapt

- **Short sessions:** each quiz is up to 8 questions, then an "All done!" screen.
- **Practice what is hard:** `skill-tracker.js` remembers each item (each letter, number, shape) in this browser and picks more of the ones a child misses or has not met yet, plus some review of known ones.
- **Help instead of "wrong":** first miss gives a hint (counting lessons count the objects aloud; other lessons remove one wrong choice). Second miss shows the answer. A missed item comes back later in the same session.
- **No reading needed:** questions are spoken, a 🔊 button repeats them, correct answers move on by themselves, and home-screen activities have picture icons and say their names.

Lesson pages can set `maxRounds: N` or `keepOrder: true` in their config to change this.

## Learning Paths

Two step-by-step paths, numbered on the home screen and tracked in the Grown-ups area:

| Step | Reading path | Math path |
| --- | --- | --- |
| 1 | Rhyme Time: which word rhymes? | Quick Look: see 1-5 dots at a glance |
| 2 | Word Parts: sun + flower = sunflower | Count the Apples (1-5) |
| 3 | First Sounds: which starts like *sock*? | Count to 10 |
| 4 | Sounds Phonics: letter sounds | More or Less: which group has more? |
| 5 | Pick the Letter | What Comes Next? 1-10 order |
| 6 | | Pick the Number |

The new reading lessons only speak whole words, never single letter sounds, because browser voices pronounce isolated sounds poorly.

## Languages

Grown-ups can choose **English, Spanish or French** for practice. The math lessons, lesson buttons and praise, the "Who is playing?" picker and the break screen follow that choice, using a voice for that language if the device has one. Reading lessons stay in English because rhymes and letter sounds differ between languages. To translate another lesson, set `lang: ESEAFamily.lessonLang(['en', 'es', 'fr'])` and `hero` in its config (see `math/quicklook.html`).

## Publishing

Everything is merged into **`main`**. The website (https://mace2021.github.io/ESEA/) updates automatically: the **Publish main to the website** workflow (`.github/workflows/publish-main.yml`) copies `main` to the `newer-update` branch that GitHub Pages publishes from, and asks Pages to rebuild. Simpler alternative: set Settings -> Pages -> Branch to `main`, then the workflow is no longer needed.

## Offline and Install

ESEA works offline after it has been opened once with internet, and it can be added to a phone or tablet home screen like an app (`manifest.json`, `service-worker.js`). **After adding, removing or changing files, run:**

```bash
python3 scripts/build-precache.py
```

This updates the list of files saved for offline use, so devices get the new version.

## For Grown-ups

The **Grown-ups area** (`parents.html`, linked at the bottom of the home screen) is behind a simple grown-ups check, a multiplication question young children cannot answer. It offers:

- **What to do next:** the items each child is practising, plus lessons they have not tried yet
- **Progress per child:** every letter, number and shape marked *knows*, *learning* or *practising*
- **Child profiles:** siblings each get their own progress; children pick "Who is playing?" on the home screen
- **Daily time limit:** a calm "Time for a break" screen when time is up (a grown-up can add 15 minutes)
- **Try this at home:** a short screen-free idea for each lesson, also shown at the end of each lesson

Links that leave the app, such as the book link and the donate button, also go through the grown-ups check.

## Quick Start

Open `index.html` in a modern browser. No installation is required.

## Project Structure

```text
ESEA/
├── index.html          Main early childhood dashboard
├── responsive.css      Shared responsive styles
├── app.js              Card interactions and spoken labels
├── family.js           Child profiles, grown-ups check, time limit, at-home ideas
├── skill-tracker.js    Per-child, per-item progress and adaptive question choice
├── parents.html        Grown-ups area
├── service-worker.js   Offline support (file list built by scripts/build-precache.py)
├── manifest.json       Install-to-home-screen settings
├── math/               Math path lessons (English, Spanish, French)
├── reading/            Reading path lessons
├── 123/                Number activities
├── abc/                Letters, words, and calendar activities
├── arithmetic/         Counting-object activities and older math pages
├── books/              Story activities
├── color/              Color activities
├── emotions/           Feelings activities
├── games/              Interactive games
├── puzzles/            Matching and puzzle activities
├── science/            Nature and older science pages
├── shapes/             Shape activities
├── tv/                 Videos and story time
└── weather/            Weather and seasons
```

## Child Safety

- No ads
- No external tracking
- No account required
- Names and progress are stored only in this browser on this device
- Grown-ups check before the parent area and before any link that leaves the app
- Optional daily time limit
- Main pathway uses age-appropriate topics and wording

## Contact

Email: earlystarteducationapp@gmail.com

Donation: https://www.paypal.com/donate/?hosted_button_id=VD3YGDBNY6CUA
