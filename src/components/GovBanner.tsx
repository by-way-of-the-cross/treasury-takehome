/**
 * U.S. Web Design System government banner — the gray strip every federal
 * site (Treasury and TTB included) runs across the very top. Built as a
 * <details> so the "Here's how you know" toggle needs no client JS.
 *
 * NOTE: this is a visual replica for a prototype. The site-wide testing
 * notice immediately below makes clear this is not a real .gov service.
 */
export default function GovBanner() {
  return (
    <section
      aria-label="Official government website banner"
      className="border-b border-[#dfe1e2] bg-[#f0f0f0] text-[13px] text-[#1b1b1b]"
    >
      <details className="group mx-auto max-w-5xl px-4">
        <summary className="flex cursor-pointer list-none items-center gap-2 py-1.5">
          <span aria-hidden className="text-base leading-none">🇺🇸</span>
          <span>An official website of the United States government</span>
          <span className="font-semibold text-[#005ea2] underline decoration-dotted underline-offset-2">
            Here&apos;s how you know
          </span>
        </summary>
        <div className="grid gap-4 pb-3 sm:grid-cols-2">
          <p className="flex gap-2">
            <span aria-hidden>🏛️</span>
            <span>
              <strong>Official websites use .gov</strong>
              <br />A <strong>.gov</strong> website belongs to an official
              government organization in the United States.
            </span>
          </p>
          <p className="flex gap-2">
            <span aria-hidden>🔒</span>
            <span>
              <strong>Secure .gov websites use HTTPS</strong>
              <br />A <strong>lock</strong> or <strong>https://</strong> means
              you&apos;ve safely connected to the website.
            </span>
          </p>
        </div>
      </details>
    </section>
  );
}
