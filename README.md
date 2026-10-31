[English](README.md) · [العربية](README.ar.md)

# HTML / CSS lab

Five front-end projects built with HTML, CSS and JavaScript.

## Open the website

Double-click [index.html](index.html) in this folder. No Node.js, installation, build step or server is required. Keep the folders together so relative links, images and fonts load correctly.

## Projects

| Project | Page |
| --- | --- |
| Introduction to HTML | [HTML-only introduction](html/introduction/index.html) |
| Introduction to CSS | [Styled introduction](css/introduction/index.html) |
| Advanced HTML & CSS Concepts | [AI article](article/ai/index.html) |
| Mini CV PROJECT | [Professional CV](careers/cv/index.html) |
| BONUS | [Original English logistics dashboard](dashboard/index.html) |

## Features

- The home page, CSS introduction, article and CV support English and Arabic.
- The HTML introduction has separate [English](html/introduction/index.html) and [Arabic](html/introduction/index.ar.html) pages, without CSS or JavaScript.
- The dashboard keeps its original English layout, search, filters and demonstration dialogs. It has no Arabic mode.
- The CSS introduction loops the walking illustration. Select the illustration to stop or restart it; reduced motion disables autoplay.
- The CV includes work history, education and detailed projects, with no printing controls.
- Forms preview locally; dashboard integrations are demonstrations. No submissions or external service connections occur.
- Preferences and dashboard changes use browser storage when available. Local-file storage rules differ between browsers; the pages remain usable without saved state.

## Files

`assets/` contains shared styles, language behavior, local fonts and the dashboard sprite image. Each project folder contains its own page and supporting files. No package manager or generated build files are needed.

## Check changes

Open `index.html`, follow every project link, and check English/Arabic where supported. Resize the browser and test keyboard navigation, form validation, dashboard search, filters and dialogs.

## Font licenses

- Urbanist: [SIL Open Font License](dashboard/assets/URBANIST-OFL.txt)
- Noto Sans Arabic: [SIL Open Font License](assets/fonts/NOTO-SANS-ARABIC-OFL.txt)

Keep the licenses with the fonts. `assets/dahsboard.png` is used by the original dashboard design.
