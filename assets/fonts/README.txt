Self-hosted webfonts
====================

The three families this site uses, served from here instead of from Google's
CDN. Latin and latin-ext subsets only (all this site's copy needs), in woff2.

  Archivo         400 / 500 / 600     body, labels, nav, tags
  Archivo Black   400                 display: headlines, section heads, numerals
  Bodoni Moda     400 / 500 / 600     wordmark, pull quotes, drop cap, captions
                  + italics

Archivo and Bodoni Moda are variable fonts, so several weights share one file —
eight files cover twenty declared faces.

All three are licensed under the SIL Open Font License, Version 1.1:

  ofl-archivo.txt         Copyright 2020 The Archivo Project Authors
  ofl-archivoblack.txt    Copyright 2020 The Archivo Black Project Authors
  ofl-bodoni.txt          Copyright 2020 The Bodoni Moda Project Authors

The OFL permits redistribution with the software it is bundled with, which is
what this folder does. The @font-face rules are in ../css/fonts.css.

To regenerate: fetch the Google Fonts css2 URL noted at the top of fonts.css
with a modern browser User-Agent, then download the woff2 files it points at.
