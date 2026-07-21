# Logo

`brand-mark-reference.png` is the source logo you provided (shamrock + "dash of
hope" wordmark + "Hope for the Hopeless" tagline, on a glowing gray backdrop).

Because that file has a busy gray/glow background, it isn't used directly
in the site. Instead, `index.html` recreates the mark as a clean inline SVG
(`#i-shamrock` in the icon sprite near the top of the file) so it scales
crisply and drops onto any background — white nav bar, dark green footer,
etc. — with no box around it. The green color (`#4b8f2e`) was sampled
directly from this reference file so the recreation matches exactly.

If you'd rather use a polished vector version of your own (e.g. from a
designer), replace the `#i-shamrock` symbol definition in `index.html` with
your own SVG path, or swap in an `<img>` tag pointing to a transparent-PNG/SVG
export of this mark.
