# Speaker notes, opening story: "Zero to Hero on AI Agent Observability"
The Data AI Guild, Hyderabad · Sat Oct 31, 2026 · ~200 attendees · Speaker: Soumen

Researched Oct 18, 2026 (IST). Every fact below links to the source I checked it against. Anything I could not confirm is marked **UNVERIFIED** or **CAVEAT**.

This file holds the opening story for the deck in `index.html`. The recommended opener is Candidate 2 (Mars Climate Orbiter) with its TripMate bridge line. Candidate 1 and the backup facts are alternates. Candidates 3 and 4 were removed because their bridge lines gave away the Case 2 lab answer. Text, sources and caveats are copied unchanged from the research notes.


---

## Recommended opener

### Candidate 2: "All systems nominal": the Mars Climate Orbiter (best fit for "every span green")

**Script (~230 words, about 1 min 45 s)**

> On 11 December 1998, NASA launched the Mars Climate Orbiter. It was supposed to be the first weather satellite for another planet. Together with its sister lander, the project cost 327.6 million dollars.
>
> For nine months it flew towards Mars. On 23 September 1999 it fired its engine to go into orbit. NASA's investigation report says: "All systems performed nominally" until the spacecraft went behind Mars. The signal never came back.
>
> What went wrong? One ground software file, called "Small Forces", gave thruster data in pound-seconds. The navigation software expected newton-seconds. Nothing crashed and no alarm went off. Every number looked like a valid number. But each one was off by a factor of 4.45. Small errors added up over nine months. The spacecraft came in about 170 kilometres lower than planned and was lost.
>
> Here is the painful part. For months, people on the team had noticed that the navigation numbers did not agree. The report says these were "only informally reported", sorted out over e-mail, and "not resolved".
>
> So the system was healthy and the outcome was wrong. Every component said "I'm fine." Nobody was checking whether the answer made sense.

**Bridge line**
> "Our agent TripMate has its own Mars Climate Orbiter moment. Every span is green, every tool call returns 200 OK, and it books Hyderabad to Delhi when you asked for Delhi to Hyderabad. Today you'll learn to catch the swapped units before the spacecraft is gone."

**Key facts and sources**
| Fact | Source |
|---|---|
| Launched 11 Dec 1998. Signal last seen about 09:04:52 UTC on 23 Sep 1999 (about 14:34 IST). | NASA Mishap Investigation Board (MIB) Phase I Report, 10 Nov 1999: https://llis.nasa.gov/llis_lib/pdf/1009464main1_0641-mr.pdf |
| "All spacecraft systems had been performing nominally until an abrupt loss of mission". Engine start at 09:00:46 UTC; "All systems performed nominally until Mars's occultation loss of signal". | Same report, Section 2: https://llis.nasa.gov/llis_lib/pdf/1009464main1_0641-mr.pdf |
| Root cause: ground software file "Small Forces" (SM_FORCES) produced thruster impulse data in pound-force-seconds (lbf-s). The interface spec required newton-seconds (N-s). This caused a 4.45× underestimate. | Same report; also NASA LLIS lesson 641: https://llis.nasa.gov/lesson/641 |
| Trajectory was about 170 km lower than planned. The post-loss estimate of the lowest point was 57 km, against a survivable minimum of 80 km. | Same report: https://llis.nasa.gov/llis_lib/pdf/1009464main1_0641-mr.pdf |
| Discrepancies were seen "throughout spring and summer of 1999" but were "only informally reported" and "not resolved". "The team relied on e-mail to solve problems, instead of formal problem resolution processes." | Same report: https://llis.nasa.gov/llis_lib/pdf/1009464main1_0641-mr.pdf |
| Cost: "$327.6 million total for both orbiter and lander (not including Deep Space 2)". **CAVEAT:** this is the orbiter **plus** the Mars Polar Lander, not the orbiter alone. Say "the project" or "the two missions together". | Archived NASA/JPL MCO fact sheet: https://web.archive.org/web/20121003073752/http://mars.jpl.nasa.gov/msp98/orbiter/fact.html |

**Slide visual:** the "Schematic MCO Encounter Diagram" (Figure 4, page 14 of the MIB report), which shows the planned vs the actual estimated trajectory: https://llis.nasa.gov/llis_lib/pdf/1009464main1_0641-mr.pdf. Alternative: NASA's mission page and artist's concept at https://science.nasa.gov/mission/mars-climate-orbiter/ (**UNVERIFIED:** that page timed out when I tried it, so check the image there yourself). Suggested layout: on the left, the green "nominal" telemetry quote; on the right, "lbf-s ≠ N-s".

### Recommendation

**Use Candidate 2 (Mars Climate Orbiter).** NASA's own report says "all systems performed nominally" while one unit mismatch quietly destroyed the mission. That is exactly TripMate's "every span green, wrong booking" lesson, and it's non-AI and vendor-neutral, so beginners get the idea before any tool jargon.

---

## Alternates

### Candidate 1: "1947: a moth, a transistor, and a trace" (then vs now)

**Script (~235 words, about 1 min 45 s at a relaxed pace)**

> In 1947, at Harvard, engineers were testing a computer called the Mark II. It stopped working properly. They opened it up and found a real moth stuck inside one of the relays. They taped that moth into the logbook and wrote: "First actual case of bug being found." The page is still kept at the Smithsonian. Grace Hopper was on that team and helped make the word "debug" popular.
>
> That same year, at Bell Labs, which was AT&T's research lab, researchers invented the transistor.
>
> Look at how debugging worked then. One machine, one room. You could open the box and see the problem with your own eyes.
>
> Sixty years later, one search request at Google touched thousands of machines. Nobody could "open the box". So in 2010 Google published Dapper, a way to follow one request across every service. Twitter built Zipkin from that paper during a hack week. Uber built Jaeger. In 2019 the industry came together on OpenTelemetry.
>
> Now look at today. In September 2025, Anthropic published a postmortem. Three infrastructure bugs had quietly made Claude's answers worse for some users, starting in early August. They had benchmarks, canaries, and dashboards. In their own words: "The evaluations we ran simply didn't capture the degradation users were reporting." It took weeks to connect the dots.
>
> In 1947 the bug was a moth you could see. In 2010 it was a slow service you could trace. With AI agents, the bug can be an answer that looks perfectly fine.

**Bridge line**
> "Today we will build the 2026 version of that logbook. Our agent, TripMate, will book a flight, every span will be green, and the booking will still be wrong. Let's learn how to catch that."

**Key facts and sources**
| Fact | Source |
|---|---|
| In 1947, engineers on Harvard's Mark II found a moth in a component, taped it into the logbook and labelled it "first actual case of bug being found". Smithsonian NMAH object ID 1994.0191.01. | Smithsonian object page: https://americanhistory.si.edu/collections/object/nmah_334663 · Smithsonian IIIF metadata (readable without the bot check): https://ids.si.edu/ids/manifest/NMAH-NMAH2000-03035 |
| **CAVEAT:** the Smithsonian says the log book was "probably not Hopper's", but that "she and the rest of the Mark II team helped popularize" the terms "bug" and "debug". It also says engineers had used "bug" since Edison in the 1870s. So don't say "Hopper found the first bug" or "Hopper coined the word". | https://ids.si.edu/ids/manifest/NMAH-NMAH2000-03035 |
| Exact date 9 September 1947, at Relay #70, Panel F. The Navy museum's old caption said 1945 by mistake. | US Navy NHHC photo NH 96566-KN: https://www.history.navy.mil/our-collections/photography/numerical-list-of-images/nhhc-series/nh-series/NH-96000/NH-96566-KN.html (the page wouldn't load for my fetcher; the date and correction were confirmed via the Commons record, https://commons.wikimedia.org/wiki/File:First_Computer_Bug,_1945.jpg) |
| Bell Labs researchers invented the transistor in 1947. | https://www.nokia.com/bell-labs/about/history/ |
| Dapper is Google's production distributed tracing system (Sigelman et al., Google, 2010). | https://research.google/pubs/dapper-a-large-scale-distributed-systems-tracing-infrastructure/ · PDF: https://static.googleusercontent.com/media/research.google.com/en/us/pubs/archive/36356.pdf |
| Twitter announced Zipkin on 7 June 2012. Quote: "Zipkin started out as a project during our first Hack Week. During that week we implemented a basic version of the Google Dapper paper for Thrift." | Archived Twitter Engineering post: https://web.archive.org/web/20231210080828/https://blog.twitter.com/engineering/en_us/a/2012/distributed-systems-tracing-with-zipkin (live URL https://blog.x.com/engineering/en_us/a/2012/distributed-systems-tracing-with-zipkin returned 403 to my fetcher) |
| Uber created Jaeger in 2015, "inspired by Dapper and OpenZipkin". | CNCF, 31 Oct 2019: https://www.cncf.io/announcements/2019/10/31/cloud-native-computing-foundation-announces-jaeger-graduation/ |
| OpenTracing and OpenCensus merged into OpenTelemetry, a CNCF sandbox project, in 2019. The post is co-written by Ben Sigelman, Dapper's first author. | CNCF, 21 May 2019: https://www.cncf.io/blog/2019/05/21/a-brief-history-of-opentelemetry-so-far/ |
| Anthropic postmortem, published 17 Sep 2025: three infrastructure bugs between August and early September degraded Claude's responses. The first bug started on 5 Aug (about 0.8% of Sonnet 4 requests). At the worst hour, on 31 Aug, 16% of Sonnet 4 requests were affected. Quotes: "The evaluations we ran simply didn't capture the degradation users were reporting" and "we relied too heavily on noisy evaluations." | https://www.anthropic.com/engineering/a-postmortem-of-three-recent-issues |

**Slide visual:** the moth logbook page. Smithsonian image, metadata marked CC0: https://ids.si.edu/ids/iiif/NMAH-NMAH2000-03035/full/full/0/default.jpg. Alternative: the public-domain Navy photo on Commons, https://commons.wikimedia.org/wiki/File:First_Computer_Bug,_1945.jpg. You could pair it with a modern Langfuse trace screenshot to make a then-vs-now split slide.


---

## Backup facts (verified, not turned into full scripts)

- **Knight Capital, 1 Aug 2012.** In the first 45 minutes after the market opened, Knight's router sent more than 4 million orders while trying to fill 212 customer orders. It traded more than 397 million shares. Before the market opened, an internal system had sent 97 automated emails flagging an error, and nobody acted on them. The SEC fined Knight $12M. Source: SEC press release 2013-222, https://www.sec.gov/newsroom/press-releases/2013-222. **CAVEAT on the number:** the SEC says the loss was "more than $460 million". The famous "$440 million" is Knight's own 2 Aug 2012 estimate of the realized pre-tax loss, https://www.sec.gov/Archives/edgar/data/1060749/000119312512332176/d391111dex991.htm. Use "about $440 million (Knight's own figure)" or "more than $460 million (SEC)", not a mix of the two.
- **Cursor support bot "Sam", April 2025.** It told a user that "Cursor is designed to work with one device per subscription as a core security feature". No such policy existed. The real cause was a session race condition. Co-founder Michael Truell apologised on Hacker News on 16 Apr 2025. Sources: https://news.ycombinator.com/item?id=43700931 · Ars Technica, 17 Apr 2025, https://arstechnica.com/ai/2025/04/cursor-ai-support-bot-invents-fake-policy-and-triggers-user-uproar/
- **Not researched in this pass (UNVERIFIED):** the Chevrolet dealer chatbot "$1 Tahoe", the McDonald's/IBM drive-thru AI ending, Klarna's AI support reversal, the NYC MyCity chatbot, and the Apollo 11 1202 alarm. Check these before using any of them.

## Delivery notes
- At about 130 words per minute each script runs roughly 1:40–1:50. To fill 2–4 minutes, add a 10-second audience question at the start ("Raise your hand if you've ever seen a green dashboard and an angry customer at the same time"), pause after the key quote, and then do the bridge.
- Keep the Smithsonian caveat in mind. Say "Grace Hopper's team", not "Grace Hopper found the first bug".

---

## 0. Quick correction: Bell Labs belonged to AT&T, not IBM

- Bell Telephone Laboratories was set up in 1925 from engineering departments of **AT&T and Western Electric** (Western Electric was the Bell System's manufacturing arm). Source: Nokia Bell Labs history page, https://www.nokia.com/bell-labs/about/history/
- After the 1984 AT&T divestiture, AT&T Technologies took over Bell Labs. In 1996 AT&T spun most of Bell Labs off into **Lucent Technologies**. Lucent merged with Alcatel in 2006, and **Nokia bought Alcatel-Lucent in 2016**. The lab is now **Nokia Bell Labs**. Source: same page, https://www.nokia.com/bell-labs/about/history/
- The first day of combined Nokia and Alcatel-Lucent operations was 14 January 2016. Source: https://www.nokia.com/newsroom/nokia-celebrates-first-day-of-combined-operations-with-alcatel-lucent/
- Owner timeline in one place (secondary): https://en.wikipedia.org/wiki/Bell_Labs

A gentle way to say it: "Small correction to the talk that inspired this: Bell Labs was AT&T's research lab. It is Nokia Bell Labs today. IBM had its own separate research labs."
