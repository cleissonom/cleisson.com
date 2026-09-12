# Prose pattern reference

Use the rows that explain a problem in the passage. They are editing heuristics,
not an authorship detector. A writer's supplied sample overrides style defaults.
Do not change quotations, titles, proper names, or discussion of these phrases.
Weak signals need company from other tells before they justify an edit.

## Staging

| Pattern                                 | Useful edit and exception                                                                                                                                                                      |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Empty contrast                       | State the positive claim directly when “not X but Y” rejects an unraised alternative. Keep both halves when they add facts or correct a real misconception; check split-sentence versions too. |
| 2. One-line closer or dramatic fragment | Remove conclusions that repeat the preceding paragraph. Merge fragments that obscure the claim; a short sentence with new information may stay.                                                |
| 3. Deep-sounding saying                 | Replace “at its core,” “the real question,” and unsupported aphorisms with the concrete point.                                                                                                 |
| 4. Staged run-up                        | Remove “let's dive in,” “here's what you need to know,” or a standalone “honestly?” that only announces a routine claim. Preserve a natural aside in the writer's voice.                       |
| 5. Arguing with no one                  | Remove defenses and fake alternatives left from drafting. Preserve attributed objections and alternatives a reader actually needs to weigh.                                                    |

Example: “Caching cuts repeat work. That is the real win.” becomes “Caching
cuts repeat work.” An objection such as “Restarting would drop current sessions”
belongs when the reader actually proposed a restart.

## Rhythm

| Pattern                        | Useful edit and exception                                                                                                                                                          |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6. Forced triad                | Keep the number of examples or list items the meaning needs. Do not lose a supported third fact just to vary the rhythm.                                                           |
| 7. Repeated openings           | Combine sentences when repeated subjects add no rhythm or clarity. Deliberate repetition can stay.                                                                                 |
| 8. Dashes everywhere           | In prose, use periods, commas, colons, or parentheses unless a supplied sample calls for dashes. Never alter code, commands, paths, or URLs. One dash is a weak authorship signal. |
| 9. Stacked qualifiers          | Retain real uncertainty, scope, legal notices, and safety limits. Remove only redundant hedges; weak alone.                                                                        |
| 10. Hyphenated pairs           | Follow grammar and the target style, preserving technical terms. A familiar compound is weak alone.                                                                                |
| 11. Passive or missing subject | Name the actor when it clarifies the action. Preserve appropriate passive voice; weak alone.                                                                                       |

Example: “She noted the door. She noted its lock.” becomes “She noted the door
and its lock.” “The policy may affect outcomes” preserves uncertainty that
“The policy affects outcomes” would lose.

## Inflation

| Pattern                       | Useful edit and exception                                                                                                                                                                            |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 12. Stock AI vocabulary       | Prefer precise ordinary words when a cluster of “delve,” “tapestry,” “pivotal,” “showcase,” “testament,” or “landscape” adds no meaning. A formal word alone is not an error; retain technical uses. |
| 13. Inflated significance     | Keep facts; remove unsupported “pivotal moments,” generic challenges/outlook sections, and promised bright futures. Retain actual plans supplied by the source.                                      |
| 14. Vague association         | State a documented relationship directly. If the source does not identify someone's role, do not invent one.                                                                                         |
| 15. Shallow participial rider | Check claims added by “symbolizing,” “reflecting,” or “highlighting.” Keep them only when supported.                                                                                                 |
| 16. Sales language            | Remove promotional adjectives when the user wants neutral prose. Preserve an intentionally promotional genre and supported details.                                                                  |
| 17. Borrowed authority        | Use a real named source and what it said when available. Remove unsupported expert claims; do not invent attribution or discard meaningful supported evidence.                                       |
| 18. Avoiding simple verbs     | Prefer “is,” “are,” or “has” when “serves as,” “stands as,” or “boasts” adds no distinction.                                                                                                         |

## Formatting and residue

| Pattern                            | Useful edit and exception                                                                                                                       |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 19. Decorative bold                | Remove labels or emphasis that add no organization. Preserve useful hierarchy and every claim when converting a list to prose.                  |
| 20. Decorative headings            | Prefer sentence case and meaningful headings. Remove repeated titles, unrelated emojis, arrows, or rules unless the requested format uses them. |
| 21. Curly quotes                   | Follow the writer's or target format's convention. Editors often auto-curl quotes; weak alone.                                                  |
| 22. Chat wrapper                   | Remove chatbot greetings, praise, offers, and sign-offs from standalone text. Ordinary letter salutations are valid.                            |
| 23. Knowledge disclaimer and guess | State a real evidence gap or omit the unsupported claim. Never turn missing evidence into a plausible biography or fact.                        |
| 24. Repeated heading               | Remove the opening sentence that only restates its heading.                                                                                     |
| 25. Previous-version narrative     | Describe current behavior in ordinary documentation. Preserve before/after context in release notes, migrations, and change histories.          |

Adapted from the MIT-licensed `blader/humanizer` skill and Wikipedia's
[Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing).
Retain specific details, mixed feelings, cultural references, explainable
first-person choices, and genuine asides when they carry the writer's voice.
