# Label Check

This is my take on the TTB label verification prototype. You give it a label image and the application data that's supposed to match it, and it tells you whether the label actually says what the application claims. Every submission ends up in one of three buckets: approved, rejected, or needs a person to look at it.

Live demo: https://interview-ten-sigma.vercel.app

You don't need to set anything up to try it. There's a button to load a built-in example, or you can take a photo of a real bottle and scan it.

## Running it locally

```bash
bun install
cp .env.example .env.local   # drop in a free Google AI Studio key
bun run dev                  # http://localhost:3000
bun run test                 # the unit tests, no key needed
```

The only secret it needs is a Gemini API key, which is free from Google AI Studio with no card. On the deployed version that key lives in Vercel's encrypted environment, never in the repo.

## How I thought about it

I read the interview notes before I wrote any code, and a few things from them drove basically every decision.

Sarah said the last vendor took 30 to 40 seconds a label and her team just went back to doing it by eye. So speed wasn't a feature, it was the whole thing. That pushed me to one fast vision call per label with the model's "thinking" turned off, and to keep all the actual comparison in plain code so there's no second round trip.

The decision I'm most confident about is that the AI never decides anything. All it does is read the label and write down what's printed, word for word. A separate layer of ordinary TypeScript does the comparing, and that code is the only thing that produces a verdict. I built it this way because Jenny told me the government warning has to be exact, and Dave told me "STONE'S THROW" and "Stone's Throw" are obviously the same brand and you can't just pattern match everything. Those two pull in opposite directions. You need something strict where the law is strict and forgiving where a person would be forgiving, and you really don't want a black box making that call on a compliance decision. So the warning is checked character for character, brand names get fuzzy matching, and anything the system isn't sure about goes to "needs review" instead of guessing.

That's where the three buckets come from. A clear mismatch is a rejection. Anything uncertain, a near miss, a blurry photo, a field it couldn't read, goes to a human. Everything else is approved. Jenny basically described this already: when an agent can't read a label they reject it and ask for a better photo, and I wanted to keep a person in that exact spot.

One thing I added that wasn't strictly asked for: you can scan a bottle and have it fill the form for you. Sarah said her agents spend half their day on what's basically data entry, so rather than make someone type out the brand, the ABV, and the rest, you snap a photo, the app reads it, drops the values into the form as a draft, and the agent corrects anything that looks off before checking it. Once it had the extraction working, building this felt like the obvious next move.

## Tools I used and why

- Next.js with React and TypeScript, deployed on Vercel. One repo, the UI and the API together, deploys in a click. bun as the package manager.
- Google Gemini 2.5 Flash for the vision read, through the AI SDK. Flash because it's fast, and the whole product depends on being fast. It sits behind a single function, so if this ever had to run inside the TTB network (Marcus mentioned the firewall blocks a lot of outbound ML traffic) you'd swap that one file for a self-hosted model and nothing else would change.
- A couple of the serverless functions are written in Python instead of JavaScript. The useful one re-checks the government warning on its own in a separate runtime, which is the kind of independent second pass you'd want on the one field people try hardest to fudge.
- Vitest for the tests. They focus on the matching rules, since that's the part where a quiet bug would actually let a bad label through.

## Assumptions I made

- The application data arrives as typed fields or CSV columns. I'm not parsing the actual COLA PDF forms.
- I simplified the beverage rules. ABV is required for spirits and optional for beer and wine. The real 27 CFR rules are more granular, and I left an obvious spot in the code for them.
- The mandatory warning is the standard 27 CFR Part 16 statement. I check that the header is all caps, and I let the model judge bold visually, but if it can't tell, that goes to review rather than an auto reject.
- Nothing is stored. Images are processed in memory and thrown away. Marcus said not to keep anything sensitive for this exercise, and it's also just the simplest privacy story.

## Trade-offs and what I'd do with more time

- Rate limiting is in memory per server instance. Fine for a prototype, but a real version would use a shared store.
- Bold detection on the warning is best effort. You can't really confirm font weight from a transcription, so I treat any doubt as "have a person check" and never as a silent approval.
- The model can still misread. Temperature is zero and the output is validated, but it isn't an oracle, which is exactly why the result is a recommendation with the evidence shown next to it. The agent always sees what was read off the label beside what the application claimed.
- If I kept going I'd handle multi image label sets natively (front, back, neck) and wire in the finer grained beverage rules.

## A note on how I built it

I built this with AI assistance, which felt right for a role that's about applied AI. The part I care about is the discipline around it: the model only transcribes, the verdicts come from plain tested code, and I checked the whole thing against real TTB approved labels, not just my own samples, so I could be sure it agreed with calls actual agents had already made.
