# **`Record Label Simulator (RLS) Charts — Simplified Sizes (Player-Facing)`**

## **`Purpose`**

`Charts can become overwhelming. This standard caps chart sizes per scope so the player can read rankings quickly and consistently.`

## **`Default chart sizes by scope`**

* `Regional charts: Top 10`

* `National charts: Top 40`

* `Global chart (Gaia): Top 100`

## **`Internal tracking rule`**

* `Internally, the simulation may track deeper rankings beyond what the player sees.`

* `Maximum internal chart depth: Top 2000 for any chart.`

## **`Usage rule`**

* `Any feature that references “the chart” must use these sizes by default for its scope.`

* `Player-facing charts are constrained to the sizes above unless a future rule explicitly overrides this.`

* `Internal calculations may use the deeper internal rankings up to the max depth.`

## **`Terminology alignment`**

* `Region = sub-area inside a Nation (capital region vs elsewhere region).`

* `Nation = country-level unit.`

* `Global (Gaia) = across all nations/regions.`
* `Naming shorthand: Global = Gaia, National = nation name, Regional = region name with a Regional suffix.`
