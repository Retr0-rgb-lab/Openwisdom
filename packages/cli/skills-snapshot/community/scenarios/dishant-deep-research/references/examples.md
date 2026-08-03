# Research Output Examples

Side-by-side comparisons of surface-level vs. deep research output for the same topic. Read these to calibrate the quality bar.

---

## Example 1: Market Research

**Topic:** "Research the utility discount market for disability placard holders"

### Surface-Level Output (What to AVOID)

> Many states offer utility discounts to people with disabilities. These programs provide reduced rates on electricity, gas, water, and other essential services. The discounts vary by state and utility provider. Some programs are well-known while others are underutilized. The market represents a potential opportunity for companies serving disability communities.

**Why this fails:**
- No specific data (which states? what discounts? what amounts?)
- No source cited
- No insight (says "they vary" without explaining how)
- No "so what" (says "potential opportunity" without sizing it or explaining why)
- Could have been written without any research at all

### Deep Output (What to AIM FOR)

> Utility discount programs for disability placard holders exist in at least 34 states, but the landscape is fragmented across three distinct program types — and the fragmentation itself is the key finding.
>
> **Type 1: Automatic eligibility programs** (12 states including California, New York, Florida). Placard holders automatically qualify for utility discounts of 15-35% on electricity. These are the most accessible but least known — California's CARE program, for example, covers ~4.7M households but utility commission data suggests only 62% of eligible disabled households are enrolled (CPUC 2024 Annual Report). The enrollment gap represents a significant service opportunity: helping eligible placard holders claim benefits they're already entitled to.
>
> **Type 2: Application-required programs** (15 states). Placard holders must submit a separate application with additional documentation. Conversion rates from placard issuance to utility enrollment are estimated at 8-15% in states where data is available (based on cross-referencing DMV placard issuance data with utility commission enrollment figures in Ohio, Pennsylvania, and Michigan). The documentation requirement is the friction point — many placard holders don't know the program exists, and those who do face a second bureaucratic process.
>
> **Type 3: Income-qualified only** (7 states). Disability alone doesn't qualify; income thresholds must also be met. These programs overlap heavily with LIHEAP (Low Income Home Energy Assistance Program) but add disability status as a qualifying or priority factor.
>
> The service opportunity is clearest in Type 1 and Type 2 states: an estimated 2.8M-4.1M eligible placard holders are not enrolled in available programs (triangulated from CDC disability prevalence data × state population × program enrollment rates). At an average annual savings of $340-580 per household, the total unrecovered benefit pool is roughly $950M-$2.4B annually. A service that helps placard holders enroll could capture 5-15% of savings as a service fee, suggesting a $47M-$360M addressable market — though the range is wide due to data limitations on actual enrollment gaps.
>
> **The critical constraint:** Most of these programs are administered by individual utility companies, not state governments. This means there isn't one application per state — there can be 10-50 utility providers per state with different forms, requirements, and portals. Any service helping placard holders enroll would need to build and maintain integrations with hundreds of utility providers, which is a significant operational barrier and likely explains why no dominant player has emerged.

**Why this works:**
- Specific data with sources
- Three-part typology that structures the landscape (not just "they vary")
- Quantified opportunity with methodology notes
- Identified the key constraint that explains market structure
- Every paragraph passes the "so what" test
- Reader can make decisions based on this

---

## Example 2: Feature Research

**Topic:** "Research internal referral features for patient portals"

### Surface-Level Output (What to AVOID)

> Internal referral features allow existing patients to refer friends and family to a service. Key features typically include referral links, reward tracking, and automated emails. Many companies like Dropbox and Uber have used referral programs successfully. Popular tools include ReferralCandy, Friendbuy, and Viral Loops.

**Why this fails:**
- Generic (this describes every referral program ever)
- No connection to healthcare/telehealth context
- No implementation reality (how hard is it to build vs. buy?)
- Lists tools without evaluating them
- No healthcare-specific constraints (HIPAA, state regulations)

### Deep Output (What to AIM FOR)

> The term "internal referral feature" can mean two very different things in a telehealth patient portal, and the right approach depends on which one you mean:
>
> **Type A: Patient-to-patient referrals** (growth mechanism). An existing patient refers someone they know. This is the Dropbox model adapted for healthcare. The key constraint: HIPAA limits what you can reveal about the referrer's engagement with your service. You cannot send "Your friend John, who uses our service, thinks you'd benefit from it" without John's explicit authorization — and the authorization itself needs specific language. Most telehealth referral programs solve this by having the referrer initiate the outreach (share a personal link) rather than the platform contacting the referee. This is why telehealth referral programs tend to have lower conversion rates (2-5%) than consumer SaaS referral programs (8-15%) — the platform can't do the warm outreach directly.
>
> What practitioners report: "We tried an automated referral program and got a 1.8% conversion rate. When we switched to giving patients pre-written text messages they could forward themselves, it jumped to 4.2%. The personal touch matters more than the automation in healthcare." (r/healthIT discussion, March 2024)
>
> **Build vs. Buy Assessment:**
> Building in-house gives HIPAA compliance control but costs 80-200 dev hours for a basic system (referral link generation, tracking, reward fulfillment). Buying through a third-party tool (ReferralCandy, Friendbuy) is faster but creates a data-sharing relationship that requires a BAA and careful scoping of what PHI the tool can access. Most telehealth companies end up building a lightweight in-house system because the HIPAA complexity of third-party integration exceeds the development cost of a basic referral tracker.
>
> **Type B: Provider-to-provider referrals** (care coordination mechanism). One provider within the platform refers a patient to another provider or service within the same platform. This is operationally complex because it involves scheduling, record sharing, and potentially different state licensing requirements if providers are in different states. The key implementation gotcha: referral tracking needs to maintain the chain of custody for compliance purposes — who referred whom, when, what information was shared, and whether the patient consented to the information transfer. Most portals that implement this well use a referral queue with explicit accept/decline workflow rather than automatic routing.

**Why this works:**
- Disambiguated the question (two types of "referral")
- Healthcare-specific constraints front and center
- Real practitioner quote with source
- Build vs. buy assessment with actual estimates
- Implementation gotchas that you'd only learn from building it
- HIPAA implications specifically addressed

---

## Example 3: Synthesis vs. Data Dump

**Topic:** Competitive dynamics in telehealth disability parking placard market

### Data Dump (What to AVOID)

> **Competitor A:** Founded 2019, offers online placard certification, prices at $149, has 3.2 star rating on Trustpilot, serves 45 states.
>
> **Competitor B:** Founded 2021, offers placard and disability benefits, prices at $129, has 4.1 star rating on Google, serves 38 states.
>
> **Competitor C:** Founded 2020, offers placard certification, prices at $169, has 2.8 star rating on BBB, serves all 50 states.

**Why this fails:**
- Just a list of facts with no interpretation
- No pattern identification
- No "so what"
- Reader has to do all the analytical work themselves
- Doesn't answer "what does this mean for us?"

### Synthesized Output (What to AIM FOR)

> The competitive landscape reveals a clear pattern: telehealth placard certification is splitting into two strategic approaches, and the market is punishing the middle ground.
>
> **The Speed Players** (Competitors A, D, F) compete on turnaround time — "certification in 24 hours" is their primary value proposition. They price at $129-149, spend heavily on Google Ads for urgency-related keywords ("fast handicap placard," "same-day certification"), and have high volume but mixed reviews. Their Trustpilot ratings cluster around 3.0-3.5, with a consistent complaint pattern: speed is delivered, but patients feel rushed through evaluations, and follow-up support is minimal. This signals a structural tension — speed and thoroughness are in conflict, and these competitors have chosen speed.
>
> **The Trust Players** (Competitors B, E) compete on legitimacy and support — "licensed physicians, money-back guarantee, help with the DMV process." They price higher ($149-199), invest in content marketing and SEO rather than paid ads, and have significantly better reviews (4.0-4.5 average). Their growth is slower but retention is higher — they report 35-45% of revenue from renewal services, vs. 15-20% for speed players.
>
> **The Dying Middle** (Competitor C and several small players) offer neither the fastest service nor the most trusted. Their reviews are the worst (2.5-3.0), their customer acquisition costs are rising, and at least 3 competitors in this segment have shut down in the past 18 months. The market is bifurcating, and the middle position is becoming unviable.
>
> **The strategic implication:** The competitive gap is in combining speed with trust. No current competitor credibly delivers both "fast" and "thorough." This is likely because the operational requirements conflict — fast certification means shorter consultations, which undermines the perception of thoroughness. A competitor that solved this (perhaps through pre-consultation preparation that makes the actual consultation efficient without feeling rushed) would occupy uniquely defensible positioning.

**Why this works:**
- Identifies a PATTERN, not just a list
- Groups competitors by strategy, not randomly
- Connects review data to strategic insight
- Identifies the structural tension (speed vs. trust)
- Points to a specific strategic opportunity
- Every paragraph builds on the previous one
- Reader walks away with both understanding and direction

---

## Quick Quality Checks

Use these micro-tests on any paragraph in your output:

**The Replacement Test:** Could you replace the specific topic with any other topic and the paragraph would still make sense? If yes, it's too generic. "The market is growing rapidly" could be about anything. "The market has grown 23% annually since 2020, driven primarily by CMS telehealth waivers that are now being made permanent in 12 states" is specific.

**The Expert Test:** Would someone who's been in this space for 5 years learn something new from this paragraph? If they'd just nod and say "I know," go deeper.

**The Decision Test:** After reading this paragraph, is the reader closer to making a decision? If the paragraph is interesting but doesn't move the reader toward action or understanding, it might be filler.

**The Source Test:** If challenged, could you point to where this information came from? If not, either source it or flag your confidence level.
