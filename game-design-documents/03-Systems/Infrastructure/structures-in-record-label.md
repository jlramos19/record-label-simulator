# Structures in Record Label Simulator

Structures are facilities modeled as data records in the web simulation. They own slots, gate actions, and define capacity limits for production, promotion, and touring.

## Slot model (shared)
- ID slots: assign Creator IDs to perform work orders (songwriter/recorder/producer).
- Input slots: attach required content items (sheet, demo, track).
- Booking slots: reserve a facility for a date window (broadcast, filming, venue).
- Upgrade slots: attach gear, permits, or add-ons that change output or capacity.
- Queue slots: optional "next up" staging for IDs or content.

## Structure categories
### Studios
- Recording studios: create sheet, demo, and master stages.
- Filming studios: required for music videos and multimedia promos.
- Broadcast studios: host interviews, live performances, and broadcast programs.

### Venues (touring roadmap)
- Venues host live events and touring dates.
- Venue tiers: Club, Theater, Amphitheater, Arena, Stadium.
- Touring is planned as the final promotion step of an Era.

### Offices
- Harmony Hub: label operations, strategy, and staff oversight.

### Residences
- Housing for community members and creators; affects audience growth and consumption.

### Factories
- Manufacture physical media and route it to content shopping centers.

### Content Shopping Centers
- Retail surfaces for physical content by genre and alignment.

### City Halls
- Generate population growth and immigration events per region.

### Central Banks
- Control currency flow and macroeconomic stability per nation.

### Creators Community Chambers
- Talent discovery venues where creator IDs are sourced.

### Critics Councils
- Institutions that evaluate content quality and alignment fit.

## Venue tiers (capacity reference)
| Venue type | Roof | Capacity range |
| --- | --- | --- |
| Club | Roofed | 500 to 2,000 |
| Theater | Roofed | 2,000 to 5,000 |
| Amphitheater | Mixed | 6,000 to 10,000 |
| Arena | Roofless | 11,000 to 40,000 |
| Stadium | Roofless | 41,000 to 200,000 |

## Ownership and access
- Owned structures grant full slot control and avoid booking fees.
- Leased structures require upfront or periodic fees.
- Public facilities (broadcast, filming, venues) are booked through availability slots.

## Observability
- Slot conflicts, missing inputs, and ineligibility always surface a reason code.
- Booking failures show a warning and never silently drop a player action.
