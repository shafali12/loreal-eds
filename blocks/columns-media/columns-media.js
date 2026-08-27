export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-media-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-media-img-col');
        }
      }
    });
  });

  // decorate a standalone CTA link (its own paragraph) as a brand pill button,
  // matching the source .btn treatment when EDS auto-decoration doesn't apply
  block.querySelectorAll('p > a:only-child').forEach((a) => {
    const p = a.parentElement;
    if (p.textContent.trim() === a.textContent.trim() && !a.classList.contains('button')) {
      a.classList.add('button');
      p.classList.add('button-container');
    }
  });
}
