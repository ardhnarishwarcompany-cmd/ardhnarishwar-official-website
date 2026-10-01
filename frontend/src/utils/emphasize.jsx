// Wraps the final word of a heading in <em>, which the site's global CSS
// (see index.css: "h1 em, h2 em") renders in Playfair Display italic —
// the same accent font used on the Home page headings. Use this for any
// heading whose text is dynamic (comes from an API/CMS) so it visually
// matches the rest of the site instead of falling back to plain body text.
export function emphasizeLastWord(text) {
  if (!text) return text;
  const words = String(text).trim().split(' ');
  if (words.length < 2) {
    return <em>{text}</em>;
  }
  const last = words.pop();
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  );
}