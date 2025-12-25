---

## **`eyeriSocial Handles, Mentions, and Inactive Accounts`**

### **`Mentions render as handles`**

* `All account mentions render as handles (example: @CreatorsChamber, @ARL1, @ActName).`

* `The handle token itself is the hyperlink the player can click to open that account/profile.`

### **`Feed is dominated by “broadcast accounts” posting about other accounts`**

* `The player-facing feed is largely accounts posting en masse about other accounts, where those referenced accounts are hyperlinked for the player to follow.`

### **`Act references under Record Labels`**

* `For Act-related posts, use the display grammar:`

`@{RecordLabelHandle}’s @{ActHandle} {rest of post}`

`Example pattern:`

* `@ARL1’s @Act {rest of post}`

### **`Handle lifecycle states`**

* `Handles have lifecycle states:`

  * `active`

  * `inactive`

### **`Inactive handles`**

* `“Archived” is not the term; use inactive.`

* `Inactive handles:`

  * `still exist`

  * `remain clickable in old posts/mentions (history stays navigable)`

  * `do not produce new posts unless explicitly reactivated (or replaced by a new active handle)`

### **`Handle reuse disambiguation via debut time`**

`Handle reuse is rare. When reusing a base handle would collide with an existing handle (active or inactive), disambiguate by appending time, using the Act’s debut time:`

1. `Append year of debut`

   * `@Act → @Act2401`

2. `If the year still collides (same year as previous), append month`

   * `@Act2401-03`

3. `If needed, keep adding finer time parts in order until unique`

   * `day → hour → … (only as far as needed)`

---

