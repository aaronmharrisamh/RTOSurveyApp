# Cherry On Together — Mockup D

Red Truck Orchards comes first. Cherry On Together is the survey.

Open **[index.html](index.html)** to start with **D5**. On a phone, the app fills the available screen. On a desktop, it starts with the zoomed-out phone preview and the review controls visible. Switching back to mobile preview on a desktop also restores that zoomed-out view. The review frame uses 390 × 867, approximately 20:9, and scales down to fit the window.

Today shows the study stage in a small, soft label beside the date. The daily wizard uses a quiet question-count label. The stage is not repeated inside the Today task card.

Open **[the comparison carousel](index.html#mockups)** to try D1–D5 one at a time. The carousel does not move by itself. Use its buttons, arrow keys, or swipe on a touch screen.

## Five variations

| Design | Experiment |
| --- | --- |
| [D1](index.html?design=d1) | More visible context: date, stage, question explanation, and full selection feedback. |
| [D2](index.html?design=d2) | Shorter guidance and fewer supporting details. |
| [D3](index.html?design=d3) | Question-first presentation; explanations are in Help. |
| [D4](index.html?design=d4) | Least on screen; selection feedback stays inside the answer row. |
| [D5](index.html?design=d5) | The 2026 UX Developer’s pass: a warm welcome, clear choices, and a calm next step. |

The five core questions and response scales stay consistent across designs. Supporting wording and visible context vary. D5’s notes explain the recommended balance and its tradeoffs; this is a design recommendation for the brief, not a result from volunteer testing.

## Try the daily flow

1. Press **Let’s continue!** on Today.
2. Choose one answer, then press **Next**. A check confirms the choice. Next gives a short, slow green cue. The app does not advance when an answer is selected.
3. Answer all five questions. Their answers are saved before the separate use check.
4. In the vinegar week, select one tablespoon, less, more, none, or unknown. If none, one optional recall question follows. “I do not remember” and Skip are available.
5. Open **Calendar** to view or change a dated answer. Open **Chart** to see one question across the three weeks. Open **Guide** for a short explanation of the survey.

The use check comes after the symptom questions to keep the main task short and reduce the chance that a use question influences a later symptom answer. This is a design inference informed by [Pew Research Center’s guidance on question order](https://www.pewresearch.org/writing-survey-questions/). Recall is stored separately; it never fills in historical use records.

## Controls

- **Upper right:** menu and sample account. Signing out and back in retains the sample’s place.
- **Bottom dashboard:** Today, Calendar, Chart, and Guide. These remain available during the wizard. Today returns to the current task.
- **Lower left:** DEMO opens a small flyout. Load a study week, switch the sample chart pattern, read design notes, or reset that design.
- **Lower right, left to right:** mobile/desktop view, five-design carousel, filled/review frame, and Help. The five-card icon uses two cards, two cards, then one card. Frame controls do not request browser fullscreen.
- **Help:** a small explanation and a route to ask the orchard. Contact and delivery messages are demonstrations only.

The review shell reveals D1–D5 tabs and developer notes. Switching the device or frame preserves the current page and draft. Each design has its own browser-session sample state.

## Share or relocate

This folder is a complete static site. It has no build step, package installation, remote font, third-party runtime, or backend dependency.

Keep it at `finishedmockups/Mockup D/` and publish the repository’s existing root site. The [finished mockups landing page](../index.html) links to it. After publication, the project-relative path is:

```text
/RTOSurveyApp/finishedmockups/
/RTOSurveyApp/finishedmockups/Mockup%20D/
```

Alternatively, copy **all contents of this folder**, including `assets/` and `.nojekyll`, into a website root or another subfolder. Internal app links and assets are relative. `index.html` remains the entry point. Do not copy the repository’s ignored `docs/`, `mockups/`, or `.claude/` directories.

The files are prepared locally; creating this bundle does not commit, push, or publish it.

## Sample behavior and scope

- Fictional Alex Morgan, with fixed September 2026 dates. Sample weeks are starting, vinegar, follow-up, and complete.
- The default chart has mixed responses. Lower and higher sample patterns are available in DEMO. Missing days and unknown answers stay as gaps. Planned stages and reported use remain separate.
- The draft survey uses 1–7 ratings or Yes/No, with an unknown option. The five domains follow the existing app direction: heartburn, return of food or liquid, upper-stomach discomfort, sleep, and daily tasks.
- Corrections keep previous values in the local sample record. Cancelling a correction does not change the saved record.
- Session storage retains answers in the current tab. If unavailable, the app continues with temporary memory. This is not durable study storage or real authentication.
- Participant copy targets short, familiar, STE100-style English. It is not a certified STE100 review or a validated questionnaire. The requested Today! and Let’s continue! labels remain.
- Study timing, delivery, contact, and account screens are lightweight demonstrations. Production enrollment, delivery-dependent stage transitions, staff tools, CSV exports, and real notifications remain outside this UX mockup.

See **DEMO → Developer notes** for D5’s interaction, language, chart, and accessibility decisions.

## Verification

Checked all five designs in Microsoft Edge at the 390 × 867 phone target, plus widths from 320 to 1440, tablet, landscape, and desktop view. The wizard, missed-use branch, corrections, draft retention, dashboard, account, sample controls, and preview navigation were exercised. Google Chrome passed a wizard smoke test.

Keyboard radio selection, explicit Next, rapid-repeat protection, Escape and focus return, real touch swiping, and reduced motion were checked. Automated axe checks reported no WCAG A/AA violations on the tested home, question, use, recall, calendar-record, chart, Help, gallery, and notes screens. This is a test result for these mockups, not a complete accessibility certification.

The folder was copied on its own and checked with matching file hashes, local-file navigation, and a simulated GitHub Pages project path. The copied site loaded all assets without failed requests. No ignored project documents or installed test dependencies are needed to run it.
