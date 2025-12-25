# **`Record Label Simulator: In-Game Visualizer Design Documentation`**

## **`Overview`**

`The in-game visualizer is a dynamic, interactive background element that enhances the player's experience without interfering with UI interactions. It is designed to be simulated uniquely for each gameplay session while remaining static for YouTube and TikTok promotional content. The visualizer's aesthetic is determined by falling, floating, and breakable shapes that loosely align with the song's emotions and themes.`

## **`Key Features`**

### **`Aspect Ratios & Usage`**

* **`16:9 (Standard Landscape)`**`: Used for in-game background and YouTube lyric visualizer.`  
* **`9:16 (Portrait Mode)`**`: Used for TikTok snippet visualizer.`  
* **`Dual-Sided Glass Box`**`: The scene is designed so that it can be viewed from both aspect ratios without distortion.`

### **`Visual Representation`**

* **`Background`**`:`  
  * **`Color Range`**`: Neutral (from pitch black to pure white - #000000 to #FFFFFF).`  
  * **`Purpose`**`: Allows objects in the scene to define the mood and energy through color and movement.`  
* **`Objects in Scene`**`:`  
  * **`Purpose`**`: Serve as visual representations of emotions/themes based on the #1 trending song in-game.`  
  * **`Loose Examples`**`:`  
    * **`Spiky Red Spheres`**`: Fall and explode into red sparkles to represent anger.`  
    * **`Soft Floating Shapes`**`: Represent calmness and serenity.`  
    * **`Bouncing or Pulsing Objects`**`: Indicate excitement and high energy.`  
  * **`Interactions`**`:`  
    * `Can break, float, explode, dissolve, etc. based on the song’s vibe.`  
  * **`Spawn Locations`**`:`  
    * `Objects will spawn at the center and corners of each glass panel.`  
    * `Additional spawns will be positioned at the exact center inside the screen.`

### **`Dynamic vs. Static Implementation`**

* **`In-Game Version`**`:`  
  * `Fully simulated and unique each session.`  
  * `Changes dynamically based on music genre trends and song themes.`  
  * `No lyrics displayed (focus remains on UI and gameplay interactions).`  
* **`YouTube & TikTok Versions`**`:`  
  * **`Static`** `(pre-rendered and not dynamically generated like in-game).`  
  * `Includes lyric overlays for promotional and entertainment purposes.`  
  * `Retains the visualizer elements but without real-time interaction.`

## **`Design Considerations`**

* **`Performance Optimization`**`: Since the visualizer runs in the background, it must be optimized to ensure smooth UI interactions.`  
* **`Aesthetic Consistency`**`: The system should maintain a high-quality, engaging experience across all formats.`  
* **`Customization Potential`**`: Future expansions could allow label-specific visualizer effects, offering more personalization.`

## **`Summary`**

## **`The in-game visualizer enhances immersion by dynamically visualizing song emotions through interactive elements while ensuring a clean UI experience. The simulated approach makes every in-game experience unique, while the static promotional versions help translate this aesthetic for external platforms.`**

