# Good Relations Awards homepage

Open `index.html` in a browser. Images and SVGs are stored in `assets/images/figma`.

To preview the Winners Gallery's embedded YouTube videos, serve this folder over HTTP:

```sh
cd HTML
python3 -m http.server 8000
```

Then open `http://localhost:8000/`. Opening the page as `file://` can cause YouTube Error 153: the embedded player does not receive the HTTP referrer YouTube requires.

The stylesheet is built from `assets/scss/style.scss`; each page section has its own partial in `assets/scss/sections`. To rebuild after editing:

```sh
sass --no-source-map --style=compressed assets/scss/style.scss assets/css/style.min.css
```

Bootstrap 5.3.8 supplies the grid and layout utilities. Swiper 14.3.0 powers the winners carousel. Both are loaded from a CDN in `index.html`.

Lenis 1.3.27 smooths wheel scrolling and in-page anchor links. It runs on GSAP's ticker so ScrollTrigger stays synchronized, and it respects reduced-motion preferences. The mobile menu scrolls independently while open. Lenis is also loaded from a CDN in `index.html`.
