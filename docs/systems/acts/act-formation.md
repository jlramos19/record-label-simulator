# Act Formation

Defines rules for forming Acts in the roster (Harmony Hub).

## Act types
- Solo Act: one creator.
- Group Act: two or three unique creators.

## Member limits
- A creator can belong to up to 4 unique Acts at a time.
- Creators at the limit cannot join additional Acts until they leave an Act.

## Quick Act
- Chooses Solo or Group at random.
- Group size is 2-3 when enough eligible creators are available.
- Uses only creators below the act membership limit; if none are eligible, Quick Act warns and stops.
- Quick Act avoids duplicate member lineups; if only existing lineups remain, it warns and stops.

## Quick Group Act filters
- Quick Group Act always creates a Group Act (2-3 members) and applies optional filters.
- Filters include single gender identity, age group, preferred theme, preferred mood, and skill level range.
- Alignment preference sets the Act alignment (Label alignment by default).
- If filters leave fewer than 2 eligible creators or only existing lineups remain, Quick Group Act warns and stops.

## Lifecycle
- Acts carry a status (`Active` or `Legacy`) for planning and analytics.
- Acts become Legacy when they have no active Era after an Era ends or when the lineup empties (disbanded).
- Group disband rule: if membership drops to one creator, the Act flips to a Solo Act with that remaining creator.
- If the remaining creator already had a Solo Act, the previous Solo Act is marked Legacy automatically.
- Legacy Acts can reactivate when those same creators (still signed to the label) release new content.
