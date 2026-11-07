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
