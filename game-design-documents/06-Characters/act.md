`Act`

`“What is an Act?” — as an exhaustive essay.`

## **`Restate the question`**

`In Record Label Simulator (RLS), what is an Act, what does it represent in the system, and why is it distinct from a Creator?`

## **`Facts`**

* `In RLS, an Act is the public-facing identity that releases music.`

* `Acts have only two canonical types:`

  * `Solo Act`

  * `Group Act`

* `An Act is not the same thing as a Creator:`

  * `Creator = the underlying talent/work unit(s) who do the making.`

  * `Act = the branded “name on the release” that audiences recognize and that appears in public-facing outputs (like charts).`

* `RLS is database-first and deterministic:`

  * `An Act is a first-class entity (a row with fields/relationships).`

  * `Actions involving an Act are recorded via verb-based events in the event log.`

## **`Logic: why the Act concept exists`**

### **`1) The Act is the simulation’s “public interface”`**

`Most of the music world that the player cares about—press, charts, fan perception, visibility—interacts with a name, a brand, and a story. That public interface is the Act.`

`So in RLS, the Act is the stable object for:`

* `“Who is this release by?”`

* `“Who is competing on the chart?”`

* `“Whose era is happening right now?”`

* `“Who are the fans talking about?”`

`That’s why Acts need to exist even if Creators are doing the underlying work.`

### **`2) The Act is where branding and continuity live`**

`Creators can change, rotate, collaborate, split, disappear, reappear. But an Act can be designed to remain recognizable across time. That makes Acts the natural place for:`

* `stage identity and presentation,`

* `“era” runs and narrative concepts,`

* `release history and public reputation over time.`

`This is essential for gameplay because eras and rollouts are long arcs, not single clicks.`

### **`3) Acts keep the game legible`**

`If everything were modeled only as Creators, the public side of the sim becomes noisy fast (too many “real people” moving pieces). By elevating Acts, RLS gives the player a clean surface:`

* `You manage a roster of Acts as the “front of house.”`

* `You manage Creators as the “engine room.”`

`That separation is what makes the admin-console UI readable while still allowing depth.`

### **`4) Solo Act vs Group Act is a deliberate simplification`**

`The point of “Solo Act / Group Act” is to avoid unnecessary taxonomy (like splitting “duo” into its own thing). A duo is still a group; the system stays consistent:`

* `Any multi-person identity is a Group Act`

* `Any single identity is a Solo Act`

`This reduces edge-case rules and keeps chart attribution, contracts, and releases consistent.`

## **`Practical implications in the sim`**

`When you do anything “career-shaped,” you are usually doing it to an Act:`

* `launching an era,`

* `planning a rollout strategy,`

* `releasing a track or project under that name,`

* `pushing promotional content,`

* `tracking chart outcomes and public momentum.`

`Meanwhile, when you do anything “capability-shaped,” you are often touching Creators behind the Act:`

* `developing skills,`

* `assigning contributors,`

* `building production capacity.`

`The separation lets RLS explain outcomes coherently:`

* `Public outcome (chart movement, buzz) attaches to the Act.`

* `Production cause (who made it and how strong it was) attaches to Creator contributions.`

## **`Conclusion`**

`In RLS, an Act is the public-facing release identity—either a Solo Act or a Group Act—and it is the core object for branding, eras, rollouts, chart attribution, and audience visibility. It’s intentionally distinct from Creators, because Creators make the work while Acts are the stable “name the world sees,” keeping the simulation both deep and readable.`
