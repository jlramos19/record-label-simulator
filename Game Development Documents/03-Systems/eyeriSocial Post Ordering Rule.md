## **`eyeriSocial record-post ordering rule`**

### **`Primary ordering`**

* `Record posts are emitted in chronological order (by the time the record becomes true).`

### **`Tie-breaker when timestamps overlap`**

`If multiple record posts have the same timestamp (same tick), break ties using HMMM order:`

1. `History (calendar buckets: year / decade bucket / century bucket)`

2. `Memory (rolling spans: year span / decade span / century span if used)`

3. `Momentum (fastest-to-achieve variants)`

4. `Myth (lifetime / all-time)`

`So: same moment → same tick → HMMM decides which one appears first.`

## **`Practical consequence (zoomed out)`**

* `The feed will read “natural” over time.`

* `When a huge event explodes and breaks many records at once, the ordering will still feel intentional instead of random.`

