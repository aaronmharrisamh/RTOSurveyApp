# Cherry Together — B design previews

Open [index.html](index.html) to compare B1–B5. This root folder is a ready-to-publish static GitHub Pages site. No build, package install, database, or secret is required.

## Navigation

- The root index is the B-series overview.
- Open any concept, then use Desktop or Mobile to compare layouts.
- The black circle immediately left of Help opens full size in the same tab.
- In full size, the black circle returns to the overview and the same concept.
- The black/white control and Help stay together at the bottom right; B2 lifts both above its mobile navigation bar.
- The footer's Open full size link uses the same route.
- Temporary sample answers are retained in the current tab when browser session storage is available. Reset preview clears that concept's sample changes.

The framed mobile view is 390 x 867, approximately 20:9. Full size follows the actual browser width. Five sample questions, calendar edits, a delivery message, and design notes are interactive. This remains a design preview, not the finished study application.

## Included pages

| Page | Design |
|---|---|
| [B1](mockup-b1.html) | Orchard Journal |
| [B2](mockup-b2.html) | Care Studio |
| [B3](mockup-b3.html) | Cherry Club |
| [B4](mockup-b4.html) | Daily Focus |
| [B5](mockup-b5.html) | Together Today — proposed 2026 designer's choice |

Publishable pages are at the repository root and all dependencies are under assets/. They do not depend on anything under the ignored docs/, mockups/, or .claude/ folders. The original A concepts remain in the local mockups/ folder.

## Publish on GitHub Pages

Connect this initialized local Git repository to the repository you create on GitHub. For a new, empty repository, the usual commands are:

~~~sh
git add .
git commit -m "Add Cherry Together B design previews"
git remote add origin https://github.com/YOUR-ACCOUNT/YOUR-REPOSITORY.git
git push -u origin main
~~~

Then open the repository's Settings → Pages. Select **Deploy from a branch**, choose **main**, and choose **/(root)**. Save. GitHub will provide the site URL.

The required marker is **.nojekyll** (this spelling). It disables the default Jekyll processing for this static site. All links and assets use relative paths so the site also works under a project URL such as https://YOUR-ACCOUNT.github.io/YOUR-REPOSITORY/. [GitHub Pages setup documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)

No remote, commit, or push is created by the local preparation task. No custom domain or publishing workflow is needed for this branch/root setup.

## Sample data

All profiles and symptoms are fictional. The five questions are draft preview content; this site does not claim they are a validated questionnaire. Notifications are simulated. Real authentication, storage, and the master CSV belong to the planned application.

A browser session cache makes switching views convenient, but is not a server or a durable record. If storage is unavailable, the previews still work with temporary in-memory answers.

## Verification

Checked all five designs in desktop and mobile views in Microsoft Edge, including fixed control placement, full-size navigation, return to the correct gallery card, and sample-answer retention. Links and assets were also checked under a simulated GitHub project URL using only publishable files. Local file navigation works too.
