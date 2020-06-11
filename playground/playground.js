let demoSources = {
	"minefinder.glsp": "; the \"PLAY\" button will run this code in a simple game engine. the api: \r\n; https://github.com/fleabitdev/glsp/blob/master/website/glsp-playground/API.md\r\n\r\n; constants (try changing these!)\r\n;-----------------------------------------------------------\r\n\r\n(let :mine-count 10)\r\n(let :grid-width 9)\r\n(let :grid-height 9)\r\n\r\n; configuring the engine\r\n;-----------------------------------------------------------\r\n\r\n(def play:width (+ 24 (* :grid-width 16)))\r\n(def play:height (+ 67 (* :grid-height 16)))\r\n(def play:title \"Minefinder\")\r\n(def play:blurb r#\"\r\n\t<p><b>Left click:</b> Reveal tile\r\n\t<p><b>Right click:</b> Place flag\r\n\"#)\r\n\r\n; the toplevel game logic\r\n;-----------------------------------------------------------\r\n\r\n(let :game-state) ; one of \'waiting, \'playing, \'won or \'lost\r\n\r\n(let :mines-remaining) ; displayed directly in the ui\r\n(let :timer-clock) ; displayed directly in the ui (as an int)\r\n(let :tiles-remaining) ; used to detect victory\r\n\r\n; this function is also called to initialize the game\r\n(defn reset-game ()\r\n\t(= :game-state \'waiting)\r\n\t(= :mines-remaining :mine-count)\r\n\t(= :tiles-remaining (* :grid-width :grid-height))\r\n\t(= :timer-clock 0.0)\r\n\r\n\t(reset-grid))\r\n\r\n; \"update\" functions are called once per frame\r\n(defn update-game (dt)\r\n\t(when (eq? :game-state \'playing)\r\n\t\t(inc! :timer-clock dt)\r\n\t\t(clamp! :timer-clock 0.0 999.0)))\r\n\r\n; the face button\r\n;-----------------------------------------------------------\r\n\r\n(let :face-focused? #f) ; #t when the face button holds the mouse focus\r\n\r\n(let :button-x (- (/ play:width 2) 13))\r\n(let :button-y 15)\r\n\r\n(defn mouse-inside-button? ()\r\n\t(and \r\n  \t(<= 0 (- (play:mouse-x) :button-x) 25)\r\n  \t(<= 0 (- (play:mouse-y) :button-y) 25)))\r\n\r\n(defn update-button ()\r\n  (let mouse-inside? (mouse-inside-button?))\r\n\r\n  (when (and (play:pressed? \'lmb) mouse-inside?)\r\n  \t; grab the mouse focus\r\n  \t(= :face-focused? #t))\r\n\r\n  (when (and (play:released? \'lmb) :face-focused?)\r\n  \t; release the mouse focus\r\n  \t(= :face-focused? #f)\r\n\r\n  \t(when mouse-inside?\r\n  \t\t; the face button has been left-clicked\r\n  \t\t(reset-game))))\r\n\r\n(defn draw-button ()\r\n\t; generate some parameters for the `play:draw` calls below\r\n\t(let (face-sprite ..face-flags) (cond\r\n\t\t((eq? :game-state \'lost)\r\n\t\t\t\'(face-x))\r\n\t\t((eq? :game-state \'won)\r\n\t\t\t\'(face-shades))\r\n\t\t((and (play:down? \'lmb)\r\n\t\t      (not :face-focused?)\r\n\t\t      (<= 0 (play:mouse-x) (- play:width 1))\r\n\t\t      (<= 0 (play:mouse-y) (- play:height 1)))\r\n\t\t\t(cond \r\n\t\t\t\t((> (play:mouse-x) (/ play:width 2))\r\n\t\t\t\t\t\'(face-peek))\r\n\t\t\t\t(else\r\n\t\t\t\t\t\'(face-peek hflip))))\r\n\t\t(else\r\n\t\t\t\'(face-smile))))\r\n\r\n\t; 1 = sunken. this is used to select a frame of the \'face-button sprite, and also\r\n\t; used to offset the smiley face itself for a 3d effect\r\n  (let depth (if (and (mouse-inside-button?) :face-focused?) 1 0))\r\n\t\r\n\t(play:draw \'face-button :button-x :button-y \'frame depth)\r\n\t(play:draw face-sprite (+ :button-x 5 depth) (+ :button-y 5 depth) ..face-flags))\r\n\r\n; the grid of tiles\r\n;-----------------------------------------------------------\r\n\r\n(let :grid) ; an array of Tile structs, in row-major order\r\n\r\n(let :topleft-x 12, :topleft-y 55) ; location of the grid in the back buffer\r\n\r\n; offsets which can be used to inspect the eight tiles surrounding a central tile\r\n(let :neighbour-offsets \'((-1 -1) (0 -1) (1 -1) (-1 0) (1 0) (-1 1) (0 1) (1 1)))\r\n\r\n; we could potentially have used `defclass` and `state` here, but the logic\r\n; is simple enough that it wasn\'t really necessary\r\n(defstruct Tile\r\n\tgrid-x grid-y ; coordinates of the grid cell, e.g. 3 1\r\n\tdraw-x draw-y ; pixel offset in the back buffer, e.g. 60 81\r\n\ttile-state ; one of \'hidden, \'flag, \'question or \'revealed\r\n\tmine-state ; one of \'no-mine, \'mine, or \'boom\r\n\tneighbours ; the number of neighbouring cells which contain mines\r\n\r\n\t(meth on-left-click ()\r\n\t\t; left-click only has an effect for tiles displaying [ ] or [?]\r\n\t\t(unless (eq-any? @tile-state \'hidden \'question)\r\n\t\t\t(return))\r\n\r\n\t\t; if we\'re in the \'waiting state, this is the first tile to be revealed\r\n\t\t(when (eq? :game-state \'waiting)\r\n\t\t\t; start the timer\r\n\t\t\t(= :game-state \'playing)\r\n\t\t\t(= :timer-clock 1.0)\r\n\r\n\t\t\t; if the first tile would contain a mine, we move it elsewhere\r\n\t\t\t(when (eq? @mine-state \'mine)\r\n\t\t\t\t(for tile in :grid\r\n\t\t\t\t\t(when (eq? [tile \'mine-state] \'no-mine)\r\n\r\n\t\t\t\t\t\t; add a mine to the destination tile\r\n\t\t\t\t\t\t(= [tile \'mine-state] \'mine)\r\n\t\t\t\t\t\t(let [grid-x grid-y] tile)\r\n\t\t\t\t\t\t(for (dx dy) in :neighbour-offsets\r\n\t\t\t\t\t\t\t(let neighbour (tile-at (+ grid-x dx) (+ grid-y dy)))\r\n\t\t\t\t\t\t\t(unless (nil? neighbour)\r\n\t\t\t\t\t\t\t\t(inc! [neighbour \'neighbours])))\r\n\r\n\t\t\t\t\t\t; remove a mine from self\r\n\t\t\t\t\t\t(= @mine-state \'no-mine)\r\n\t\t\t\t\t\t(for (dx dy) in :neighbour-offsets\r\n\t\t\t\t\t\t\t(let neighbour (tile-at (+ @grid-x dx) (+ @grid-y dy)))\r\n\t\t\t\t\t\t\t(unless (nil? neighbour)\r\n\t\t\t\t\t\t\t\t(dec! [neighbour \'neighbours])))\r\n\r\n\t\t\t\t\t\t(break)))))\r\n\r\n\t\t; reveal this tile\r\n\t\t(= @tile-state \'revealed)\r\n\t\t(dec! :tiles-remaining)\r\n\r\n\t\t(cond\r\n\t\t\t((eq? @mine-state \'mine)\r\n\t\t\t\t; the tile was a mine! the game ends as a loss\r\n\t\t\t\t(= @mine-state \'boom)\r\n\t\t\t\t(= :game-state \'lost))\r\n\r\n\t\t\t(else\r\n\t\t\t\t; if this tile had no adjacent mines, we \"flood fill\" all similar tiles, and all \r\n\t\t\t\t; numbered tiles immediately adjacent to those flood-filled tiles\r\n\t\t\t\t(when (== @neighbours 0)\r\n\t\t\t\t\t(let to-flood (arr @self))\r\n\t\t\t\t\t(until (empty? to-flood)\r\n\t\t\t\t\t\t(let flood-tile (pop! to-flood))\r\n\r\n\t\t\t\t\t\t(for (dx dy) in :neighbour-offsets\r\n\t\t\t\t\t\t\t(let neighbour (tile-at (+ [flood-tile \'grid-x] dx)\r\n\t\t\t\t\t\t\t                        (+ [flood-tile \'grid-y] dy)))\r\n\r\n\t\t\t\t\t\t\t(unless (or (nil? neighbour) (eq-any? [neighbour \'tile-state] \'revealed \'flag))\r\n\t\t\t\t\t\t\t\t; reveal the tile\r\n\t\t\t\t\t\t\t\t(= [neighbour \'tile-state] \'revealed)\r\n\t\t\t\t\t\t\t\t(dec! :tiles-remaining)\r\n\r\n\t\t\t\t\t\t\t\t; if the tile also has no neighbouring mines, recursively process it\r\n\t\t\t\t\t\t\t\t(when (== [neighbour \'neighbours] 0)\r\n\t\t\t\t\t\t\t\t\t(push! to-flood neighbour))))))\r\n\r\n\t\t\t\t; if we have as many tiles left as there are mines, it\'s a victory\r\n\t\t\t\t(when (<= :tiles-remaining :mine-count)\r\n\t\t\t\t\t(= :game-state \'won)\r\n\t\t\t\t\t(= :mines-remaining 0)))))\r\n\r\n\t(meth on-right-click ()\r\n\t\t; cycle between [flag], [?] and [ ], keeping `:mines-remaining` up-to-date\r\n\t\t(cond-eq? @tile-state\r\n\t\t\t(\'hidden\r\n\t\t\t\t(dec! :mines-remaining)\r\n\t\t\t\t(= @tile-state \'flag))\r\n\t\t\t(\'flag \r\n\t\t\t\t(inc! :mines-remaining)\r\n\t\t\t\t(= @tile-state \'question))\r\n\t\t\t(\'question \r\n\t\t\t\t(= @tile-state \'hidden))))\r\n\r\n\t; `sunken?` is #t when the lmb is down and the cursor is over the tile\r\n\t(meth draw (sunken?)\r\n\r\n\t\t; various special cases for rendering the victory and failure screens\r\n\t\t(when (eq? :game-state \'lost)\r\n\t\t\t(cond-eq? @mine-state\r\n\t\t\t\t(\'mine\r\n\t\t\t\t\t(unless (eq? @tile-state \'flag)\r\n\t\t\t\t\t\t(play:draw \'mine @draw-x @draw-y)\r\n\t\t\t\t\t\t(return)))\r\n\t\t\t\t(\'boom\r\n\t\t\t\t\t(play:draw \'mine-red @draw-x @draw-y)\r\n\t\t\t\t\t(return))\r\n\t\t\t\t(\'no-mine\r\n\t\t\t\t\t(when (eq? @tile-state \'flag)\r\n\t\t\t\t\t\t(play:draw \'mine-x @draw-x @draw-y)\r\n\t\t\t\t\t\t(return)))))\r\n\r\n\t\t(when (and (eq? :game-state \'won) (not (eq? @tile-state \'revealed)))\r\n\t\t\t(play:draw \'mine-flag @draw-x @draw-y)\r\n\t\t\t(return))\r\n\r\n\t\t; the basic rendering pathway\r\n\t\t(let sprite (cond\r\n\t\t\t((and sunken? (eq-any? @tile-state \'hidden \'question))\r\n\t\t\t\t\'mine-tile)\r\n\t\t\t(else\r\n\t\t\t\t(cond-eq? @tile-state\r\n\t\t\t\t\t(\'hidden \'mine-hidden)\r\n\t\t\t\t\t(\'flag \'mine-flag)\r\n\t\t\t\t\t(\'question \'mine-question)\r\n\t\t\t\t\t(\'revealed \'mine-tile)))))\r\n\r\n\t\t(cond \r\n\t\t\t((eq? @tile-state \'revealed)\r\n\t\t\t\t(play:draw sprite @draw-x @draw-y \'frame @neighbours))\r\n\t\t\t(else\r\n\t\t\t\t(play:draw sprite @draw-x @draw-y)))))\r\n\r\n; a reference to the Tile at the given grid coords, or #n for out-of-bounds coords\r\n(defn tile-at (grid-x grid-y)\r\n\t(cond\r\n\t\t((and (<= 0 grid-x (- :grid-width 1))\r\n\t\t      (<= 0 grid-y (- :grid-height 1)))\r\n\t\t\t[:grid (+ grid-x (* grid-y :grid-width))])\r\n\t\t(else\r\n\t\t\t#n)))\r\n\r\n; a reference to the Tile under the mouse, if any\r\n(defn tile-under-mouse ()\r\n\t(let rel-x (- (play:mouse-x) :topleft-x))\r\n\t(let rel-y (- (play:mouse-y) :topleft-y))\r\n\r\n\t(tile-at (div-euclid rel-x 16) (div-euclid rel-y 16)))\r\n\r\n; this is called at program start, and also when the face button is clicked\r\n(defn reset-grid ()\r\n\r\n\t; populate the `:grid` global with new Tile structs\r\n\t(= :grid (arr))\r\n\t(let grid-coords (arr)) ; used for mine placement\r\n\t(forn (grid-y :grid-height)\r\n\t\t(forn (grid-x :grid-width)\r\n\t\t\t(push! grid-coords (arr grid-x grid-y))\r\n\t\t\t(push! :grid (Tile \r\n\t\t\t\tgrid-x \r\n\t\t\t\tgrid-y\r\n\t\t\t\t(draw-x (+ :topleft-x (* grid-x 16)))\r\n\t\t\t\t(draw-y (+ :topleft-y (* grid-y 16)))\r\n\t\t\t\t(tile-state \'hidden)\r\n\t\t\t\t(mine-state \'no-mine)\r\n\t\t\t\t(neighbours 0)))))\r\n\r\n\t; place mines. randomly select one empty grid coordinate at a time using `rand`\r\n\t(forn (_ :mine-count)\r\n\t\t(let (grid-x grid-y) (swap-remove! grid-coords (rand (len grid-coords))))\r\n\t\t(= [(tile-at grid-x grid-y) \'mine-state] \'mine)\r\n\r\n\t\t; update the `neighbours` count for any adjacent tiles\r\n\t\t(for (dx dy) in :neighbour-offsets\r\n\t\t\t(let tile (tile-at (+ grid-x dx) (+ grid-y dy)))\r\n\t\t\t(unless (nil? tile)\r\n\t\t\t\t(inc! [tile \'neighbours])))))\r\n\r\n; this delegates to each Tile\'s `draw` method\r\n(defn draw-grid ()\r\n\t(let under-mouse (tile-under-mouse))\r\n\r\n\t(for tile in :grid\r\n\t\t(let sunken? (and\r\n\t\t\t(same? under-mouse tile)\r\n\t\t\t(play:down? \'lmb)\r\n\t\t\t(not :face-focused?)\r\n\t\t\t(not (eq? :game-state \'lost))))\r\n\r\n\t\t(.draw tile sunken?)))\r\n\r\n; called once per frame. delegates to the `on-left-click` and `on-right-click` methods\r\n(defn update-grid ()\r\n\t(when (eq-any? :game-state \'won \'lost)\r\n\t\t(return))\r\n\r\n\t(unless :face-focused?\r\n\t\t(let tile (tile-under-mouse))\r\n\t\t(unless (nil? tile)\r\n\t\t\t(when (play:released? \'lmb)\r\n\t\t\t\t(.on-left-click tile))\r\n\t\t\t(when (play:pressed? \'rmb)\r\n\t\t\t\t(.on-right-click tile)))))\r\n\r\n; drawing the play area\r\n;-----------------------------------------------------------\r\n\r\n(let :white \'(255 255 255))\r\n(let :dark-grey \'(128 128 128))\r\n\r\n(defn draw-play-area ()\r\n\t(play:fill 0 0 play:width play:height 192 192 192)\r\n\r\n\t(draw-3d-rect 0 0 play:width play:height 3 :white :dark-grey)\r\n\t(draw-3d-rect 9 9 (- play:width 18) 37 2 :dark-grey :white)\r\n\t(draw-3d-rect 9 52 (- play:width 18) (- play:height 61) 3 :dark-grey :white)\r\n\r\n\t(draw-7seg 16 15 :mines-remaining)\r\n\t(draw-7seg (- play:width 56) 15 (int :timer-clock)))\r\n\r\n; draw an embossed or sunken rectangle\r\n(defn draw-3d-rect (x y width height depth nw-rgb se-rgb)\r\n\t(forn (_ depth)\r\n\t\t(play:fill x y (- width 1) 1 ..nw-rgb)\r\n\t\t(play:fill x (+ y 1) 1 (- height 2) ..nw-rgb)\r\n\r\n\t\t(play:fill (+ x 1) (- (+ y height) 1) (- width 1) 1 ..se-rgb)\r\n\t\t(play:fill (- (+ x width) 1) (+ y 1) 1 (- height 2) ..se-rgb)\r\n\r\n\t\t(inc! x)\r\n\t\t(inc! y)\r\n\t\t(dec! width 2)\r\n\t\t(dec! height 2)))\r\n\r\n; draw a seven-segment display, showing the given integer value\r\n(defn draw-7seg (x y value)\r\n\t(draw-3d-rect x y 41 25 1 :dark-grey :white)\r\n\r\n\t; `value` may be negative if the player places too many flags\r\n\t(cond\r\n\t\t((< value 0)\r\n\t\t\t(play:draw \'7seg-minus (+ x 1) (+ y 1)))\r\n\t\t(else\r\n\t\t\t(play:draw \'7seg (+ x 1) (+ y 1) \'frame (% (/ value 100) 10))))\r\n\r\n\t(play:draw \'7seg (+ x 14) (+ y 1) \'frame (% (/ (abs value) 10) 10))\r\n\t(play:draw \'7seg (+ x 27) (+ y 1) \'frame (% (abs value) 10)))\r\n\r\n; the play:update callback\r\n;-----------------------------------------------------------\r\n\r\n(defn play:update (dt)\r\n\t(update-game dt)\r\n\t(update-button)\r\n\t(update-grid)\r\n\r\n\t(draw-play-area)\r\n\t(draw-button)\r\n\t(draw-grid))\r\n\r\n; initialize the game...\r\n;-----------------------------------------------------------\r\n\r\n(reset-game)\r\n",
	"quadris.glsp": "; the \"PLAY\" button will run this code in a simple game engine. the api: \r\n; https://github.com/fleabitdev/glsp/blob/master/website/glsp-playground/API.md\r\n\r\n; constants (try changing these!)\r\n;-----------------------------------------------------------\r\n\r\n; from 0 to 20. at higher levels, pieces fall faster\r\n(def :starting-level 0) \r\n\r\n; for each Part of each Piece, an array: (offset-x offset-y (? frame))\r\n(def :pieces #(\r\n\t(i-piece ((-1 0 5) (0 0 3) (1 0 3) (2 0 4)))\r\n\t(o-piece ((0 0) (1 0) (0 1) (1 1)))\r\n\t(s-piece ((-1 1) (0 1) (0 0) (1 0)))\r\n\t(z-piece ((-1 0) (0 0) (0 1) (1 1)))\r\n\t(l-piece ((-1 1) (-1 0) (0 0) (1 0)))\r\n\t(j-piece ((-1 0) (0 0) (1 0) (1 1)))\r\n\t(t-piece ((-1 0) (0 0) (1 0) (0 1)))\r\n\t#;(x-piece ((-1 -1) (-1 1) (1 1) (1 -1)))\r\n\t#;(?-piece ((-2 2) (-1 2) (-1 1) (-2 0) (-2 -1) (-1 -2) (0 -2) \r\n\t            (1 -2) (2 -1) (2 0) (1 1) (1 2) (2 2)))\r\n))\r\n\r\n(defn rand-piece-type ()\r\n\t(rand-select ..(keys :pieces)))\r\n\r\n; the time between ticks for each level, measured in seconds\r\n(def :tick-intervals \'(0.89 0.82 0.75 0.69 0.62 0.55 0.47 0.37 0.28 0.18 0.17 \r\n                       0.15 0.13 0.12 0.10 0.10 0.08 0.08 0.07 0.07 0.05))\r\n\r\n; the time between ticks while the down arrow is pressed\r\n(def :drop-interval 0.05)\r\n\r\n; the time before the left and right arrow start to auto-repeat\r\n(def :autorep-delay 0.39)\r\n\r\n; the time between auto-repeated left and right movements\r\n(def :autorep-interval 0.15)\r\n\r\n; configuring the engine\r\n;-----------------------------------------------------------\r\n\r\n(def play:width 320)\r\n(def play:height 288)\r\n(def play:title \"Quadris\")\r\n(def play:blurb r#\"\r\n\t<p><b>Arrow keys:</b> Move or rotate piece\r\n\t<p><b>Enter:</b> Pause/unpause game\r\n\"#)\r\n\r\n; the flow of gameplay is represented as a state machine\r\n;-----------------------------------------------------------\r\n\r\n(defclass Game\r\n\t(field score)\r\n\t(field level)\r\n\t(field lines)\r\n\r\n\t(field grid) ; a grid of Tiles, in row-major order\r\n\t(field next-piece) ; a Piece. its origin-x and origin-y are ignored until it\'s played\r\n\r\n\t(init ()\r\n\t\t(@reset))\r\n\r\n\t(meth reset ()\r\n\t\t(= @score 0)\r\n\t\t(= @level (clamp :starting-level 0 20))\r\n\t\t(= @lines 0)\r\n\r\n\t\t(= @grid (make-grid))\r\n\t\t(= @next-piece (Piece (rand-piece-type))))\r\n\r\n\t; draws everything except the falling piece, the \"GAME OVER\" or \"PAUSED\" popup, and\r\n\t; the line-clearing animation. if `grid-mode` is `hide-grid`, the grid and the \r\n\t; \"next piece\" frame will both appear to be empty.\r\n\t(meth draw-backdrop (grid-mode)\r\n\t\t(ensure (eq-any? grid-mode \'show-grid \'hide-grid))\r\n\r\n\t\t; draw the brick walls on either side of the stage\r\n\t\t(forni (y 0 240 48)\r\n\t\t\t(play:draw \'stage-edge 0 y)\r\n\t\t\t(play:draw \'stage-edge 192 y \'hflip))\r\n\r\n\t\t; draw the stage\r\n\t\t(let grid-i 0)\r\n\t\t(forn (grid-y :grid-height)\r\n\t\t\t(forn (grid-x :grid-width)\r\n\t\t\t\t(let tile [@grid (+ grid-x (* grid-y :grid-width))])\r\n\t\t\t\t(let [sprite frame] tile)\r\n\r\n\t\t\t\t(when (eq? grid-mode \'hide-grid)\r\n\t\t\t\t\t(= sprite \'stage))\r\n\r\n\t\t\t\t(play:draw sprite (+ 32 (* grid-x 16)) (* grid-y 16) \'frame frame)))\r\n\r\n\t\t; fill the side panel\r\n\t\t(play:fill 224 0 96 288 28 51 65)\r\n\r\n\t\t; draw the three score indicators\r\n\t\t(let-fn draw-number (label-sprite value x y)\r\n\t\t\t(play:draw \'number-frame x y)\r\n\t\t\t(play:draw \'number-frame (+ x 39) y \'hflip)\r\n\t\t\t(play:draw label-sprite (+ x 20) (+ y 6))\r\n\r\n\t\t\t(clamp! value 0 99999)\r\n\r\n\t\t\t(let digit-x (+ x 60))\r\n\t\t\t(loop\r\n\t\t\t\t(play:draw \'digits digit-x (+ y 22) \'frame (% value 10))\r\n\t\t\t\t(dec! digit-x 13)\r\n\r\n\t\t\t\t(div! value 10)\r\n\t\t\t\t(when (<= value 0)\r\n\t\t\t\t\t(break))))\r\n\r\n\t\t(draw-number \'score-text @score 233 10)\r\n\t\t(draw-number \'level-text @level 233 66)\r\n\t\t(draw-number \'lines-text @lines 233 122)\r\n\r\n\t\t; draw the \"next piece\" frame\r\n\t\t(play:draw \'piece-frame 232 200)\r\n\t\t(play:draw \'piece-frame 272 200 \'hflip)\r\n\t\t(play:draw \'piece-frame 232 240 \'vflip)\r\n\t\t(play:draw \'piece-frame 272 240 \'hflip \'vflip)\r\n\r\n\t\t(forni (x 240 288 16)\r\n\t\t\t(forni (y 208 256 16)\r\n\t\t\t\t(play:draw \'stage x y)))\r\n\r\n\t\t; ... and the \"next piece\" itself\r\n\t\t(unless (eq? grid-mode \'hide-grid)\r\n\t\t\t; a fixed origin would cause some pieces to display off-centre within\r\n\t\t\t; the \"next piece\" frame, so we need to tweak their coordinates slightly\r\n\t\t\t(let (tweak-x tweak-y) (cond-eq? [@next-piece \'piece-type]\r\n\t\t\t\t(\'i-piece \'(-8 8))\r\n\t\t\t\t(\'o-piece \'(-8 0))\r\n\t\t\t\t(\'x-piece \'(0 8))\r\n\t\t\t\t(else \'(0 0))))\r\n\t\t\t(.draw @next-piece (+ tweak-x 264) (+ tweak-y 224))))\r\n\r\n\t; the `update` and `draw` methods are called by play:update, once per frame. they\'re overridden\r\n\t; by the Paused state. when not overridden, they delegate to the `update-gameplay` and \r\n\t; `draw-gameplay` methods, implemented differently by various states in a finite state machine.\r\n\t(meth update (dt)\r\n\t\t(cond \r\n\t\t\t((and (play:pressed? \'enter) (@enab? \'Playing))\r\n\t\t\t\t(@enab! \'Paused))\r\n\t\t\t(else\r\n\t\t\t\t(@update-gameplay dt))))\r\n\r\n\t(meth draw ()\r\n\t\t(@draw-gameplay))\r\n\r\n\t#|\r\n\tthe full state hierarchy for Game is:\r\n\r\n\t\t(fsm\r\n\t\t\t(state* Playing\r\n\t\t\t\t(state Paused)\r\n\t\t\t\t(fsm\r\n\t\t\t\t\t(state* Falling)\r\n\t\t\t\t\t(state Clearing)\r\n\t\t\t\t\t(state Frozen)))\r\n\t\t\t(state GameOver))\r\n\t|#\r\n\r\n\t(fsm\r\n\t\t; normal gameplay, as opposed to the \"GAME OVER\" screen\r\n\t\t(state* Playing\r\n\r\n\t\t\t; showing the \"PAUSED\" message\r\n\t\t\t(state Paused\r\n\t\t\t\t; this state prevents the `update-gameplay` and `draw-gameplay` methods from being called. \r\n\t\t\t\t; the other substates of Playing are still active (their data isn\'t lost), but they\'re \r\n\t\t\t\t; frozen in time and they\'re not rendered.\r\n\t\t\t\t(wrap Main:update (dt)\r\n\t\t\t\t\t(when (play:pressed? \'enter)\r\n\t\t\t\t\t\t(@disab! \'Paused)))\r\n\r\n\t\t\t\t(wrap Main:draw ()\r\n\t\t\t\t\t(@draw-backdrop \'hide-grid)\r\n\r\n\t\t\t\t\t; draw the floating text box\r\n\t\t\t\t\t(play:draw \'game-over-frame 73 116)\r\n\t\t\t\t\t(play:draw \'game-over-frame 113 116 \'hflip)\r\n\t\t\t\t\t(play:draw \'paused-text 89 139)))\r\n\r\n\t\t\t; this fsm controls the main gameplay loop: moving a piece, clearing a line, or failing\r\n\t\t\t(fsm\r\n\r\n\t\t\t\t; a falling piece is being manipulated by the user\r\n\t\t\t\t(state* Falling\r\n\t\t\t\t\t(field piece) ; a Piece (see below)\r\n\r\n\t\t\t\t\t(field last-tick-timer 0.0) ; seconds since the piece was last moved downwards\r\n\t\t\t\t\t(field drop-bonus 0) ; number of spaces moved since the \'down key was last released\r\n\t\t\t\t\t(field autorep-timer #n) ; seconds remaining until the \'left or \'right key autorepeats\r\n\t\t\t\t\t(field autorep-dx #n) ; 1 or -1. horizontal movement to be triggered by autorepeat\r\n\t\t\t\t\t(field drop-suppressed? #t) ; set to #t for each new piece, until \'down is released\r\n\r\n\t\t\t\t\t; when this state is enabled, we bring a new piece into play\r\n\t\t\t\t\t(init-state ()\r\n\t\t\t\t\t\t(= @piece @next-piece)\r\n\t\t\t\t\t\t(= @next-piece (Piece (rand-piece-type))))\r\n\r\n\t\t\t\t\t; draw the stage, then delegate to the current piece\'s `draw` method\r\n\t\t\t\t\t(meth draw-gameplay ()\r\n\t\t\t\t\t\t(@draw-backdrop \'show-grid)\r\n\t\t\t\t\t\t(.draw @piece (+ 32 (* [@piece \'origin-x] 16)) (* [@piece \'origin-y] 16)))\r\n\r\n\t\t\t\t\t(meth update-gameplay (dt)\r\n\t\t\t\t\t\t; at the start of a frame, if the piece overlaps with existing blocks, the game has\r\n\t\t\t\t\t\t; been lost. (this can only happen when a piece spawns in on top of occupied space.)\r\n\t\t\t\t\t\t(when (.collides? @piece @grid)\r\n\t\t\t\t\t\t\t(.place-onto-grid @piece @grid)\r\n\t\t\t\t\t\t\t(@enab! \'Frozen)\r\n\t\t\t\t\t\t\t(return))\r\n\r\n\t\t\t\t\t\t(unless (play:down? \'down)\r\n\t\t\t\t\t\t\t(= @drop-suppressed? #f)\r\n\t\t\t\t\t\t\t(= @drop-bonus 0))\r\n\r\n\t\t\t\t\t\t; detect when autorepeat for horizontal movement should be enabled/disabled\r\n\t\t\t\t\t\t(cond\r\n\t\t\t\t\t\t\t((or (and (play:down? \'left) (play:down? \'right))\r\n\t\t\t\t\t\t\t     (and (eq? @autorep-dx -1) (not (play:down? \'left)))\r\n\t\t\t\t\t\t\t     (and (eq? @autorep-dx 1) (not (play:down? \'right))))\r\n\t\t\t\t\t\t\t\t(= @autorep-timer #n)\r\n\t\t\t\t\t\t\t\t(= @autorep-dx #n))\r\n\t\t\t\t\t\t\t((and (play:down? \'left) (nil? @autorep-timer))\r\n\t\t\t\t\t\t\t\t(= @autorep-timer :autorep-delay)\r\n\t\t\t\t\t\t\t\t(= @autorep-dx -1))\r\n\t\t\t\t\t\t\t((and (play:down? \'right) (nil? @autorep-timer))\r\n\t\t\t\t\t\t\t\t(= @autorep-timer :autorep-delay)\r\n\t\t\t\t\t\t\t\t(= @autorep-dx 1)))\r\n\r\n\t\t\t\t\t\t; `dx` is the horizontal movement for this frame: -1, 0 or 1. it\'s based on autorepeat,\r\n\t\t\t\t\t\t; and whether or not any actual physical keys have been pressed this frame.\r\n\t\t\t\t\t\t(let dx (cond\r\n\t\t\t\t\t\t\t((and (play:pressed? \'left) (play:pressed? \'right))\r\n\t\t\t\t\t\t\t\t0)\r\n\t\t\t\t\t\t\t((play:pressed? \'left)\r\n\t\t\t\t\t\t\t\t-1)\r\n\t\t\t\t\t\t\t((play:pressed? \'right)\r\n\t\t\t\t\t\t\t\t1)\r\n\t\t\t\t\t\t\t((not (nil? @autorep-timer))\r\n\t\t\t\t\t\t\t\t; while checking the autorepeat timer, we also update it\r\n\t\t\t\t\t\t\t\t(dec! @autorep-timer dt)\r\n\t\t\t\t\t\t\t\t(cond\r\n\t\t\t\t\t\t\t\t\t((<= @autorep-timer 0.0)\r\n\t\t\t\t\t\t\t\t\t\t(= @autorep-timer :autorep-interval)\r\n\t\t\t\t\t\t\t\t\t\t@autorep-dx)\r\n\t\t\t\t\t\t\t\t\t(else\r\n\t\t\t\t\t\t\t\t\t\t0)))\r\n\t\t\t\t\t\t\t(else\r\n\t\t\t\t\t\t\t\t0)))\r\n\r\n\t\t\t\t\t\t; apply the calculated horizontal movement\r\n\t\t\t\t\t\t(unless (== dx 0)\r\n\t\t\t\t\t\t\t(.move! @piece dx 0)\r\n\r\n\t\t\t\t\t\t\t; collision detection\r\n\t\t\t\t\t\t\t(when (.collides? @piece @grid)\r\n\t\t\t\t\t\t\t\t(.move! @piece (- dx) 0)))\r\n\r\n\t\t\t\t\t\t; decide whether or not to move the piece downwards\r\n\t\t\t\t\t\t(let interval (cond\r\n\t\t\t\t\t\t\t((and (play:down? \'down) (not @drop-suppressed?) (not @autorep-timer))\r\n\t\t\t\t\t\t\t\t:drop-interval)\r\n\t\t\t\t\t\t\t(else\r\n\t\t\t\t\t\t\t\t[:tick-intervals @level])))\r\n\r\n\t\t\t\t\t\t(inc! @last-tick-timer dt)\r\n\t\t\t\t\t\t(when (>= @last-tick-timer interval)\r\n\t\t\t\t\t\t\t(= @last-tick-timer 0.0)\r\n\r\n\t\t\t\t\t\t\t; move the piece downwards\r\n\t\t\t\t\t\t\t(.move! @piece 0 1)\r\n\r\n\t\t\t\t\t\t\t; collision detection. when a collision occurs, the piece has finshed falling,\r\n\t\t\t\t\t\t\t; and we need to decide what to do next.\r\n\t\t\t\t\t\t\t(when (.collides? @piece @grid)\r\n\t\t\t\t\t\t\t\t(.move! @piece 0 -1)\r\n\t\t\t\t\t\t\t\t(.place-onto-grid @piece @grid)\r\n\r\n\t\t\t\t\t\t\t\t; bonus points for landing the piece using the \'down key\r\n\t\t\t\t\t\t\t\t(inc! @score @drop-bonus)\r\n\t\t\t\t\t\t\t\t(= @drop-bonus 0)\r\n\r\n\t\t\t\t\t\t\t\t; collect the set of cleared lines, if any\r\n\t\t\t\t\t\t\t\t(let cleared-lines (arr))\r\n\t\t\t\t\t\t\t\t(forn (y :grid-height)\r\n\t\t\t\t\t\t\t\t\t(let line-cleared? #t)\r\n\t\t\t\t\t\t\t\t\t(forn (x :grid-width)\r\n\t\t\t\t\t\t\t\t\t\t(let tile [@grid (+ x (* y :grid-width))])\r\n\t\t\t\t\t\t\t\t\t\t(when (eq? [tile \'sprite] \'stage)\r\n\t\t\t\t\t\t\t\t\t\t\t(= line-cleared? #f)\r\n\t\t\t\t\t\t\t\t\t\t\t(break)))\r\n\r\n\t\t\t\t\t\t\t\t\t(when line-cleared?\r\n\t\t\t\t\t\t\t\t\t\t(push! cleared-lines y)))\r\n\r\n\t\t\t\t\t\t\t\t; if no lines were cleared, restart the Falling state. otherwise, transition\r\n\t\t\t\t\t\t\t\t; to the Clearing state.\r\n\t\t\t\t\t\t\t\t(cond\r\n\t\t\t\t\t\t\t\t\t((empty? cleared-lines)\r\n\t\t\t\t\t\t\t\t\t\t(@disab! \'Falling)\r\n\t\t\t\t\t\t\t\t\t\t(@enab! \'Falling)\r\n\t\t\t\t\t\t\t\t\t\t(return))\r\n\t\t\t\t\t\t\t\t\t(else\r\n\t\t\t\t\t\t\t\t\t\t(@enab! \'Clearing cleared-lines)\r\n\t\t\t\t\t\t\t\t\t\t(return))))\r\n\r\n\t\t\t\t\t\t\t; we only award a bonus point for movements which do not collide\r\n\t\t\t\t\t\t\t(when (play:down? \'down)\r\n\t\t\t\t\t\t\t\t(inc! @drop-bonus)))\r\n\r\n\t\t\t\t\t\t; rotate the piece\r\n\t\t\t\t\t\t(when (play:pressed? \'up)\r\n\t\t\t\t\t\t\t(.rotate-cw! @piece)\r\n\r\n\t\t\t\t\t\t\t; collision detection\r\n\t\t\t\t\t\t\t(when (.collides? @piece @grid)\r\n\t\t\t\t\t\t\t\t(.rotate-acw! @piece)))))\r\n\r\n\t\t\t\t; the line-clearing animation\r\n\t\t\t\t(state Clearing\r\n\t\t\t\t\t(field clearing-timer 0.0)\r\n\t\t\t\t\t(field cleared-lines) ; an array of y-coordinates within the grid\r\n\r\n\t\t\t\t\t(init-state (@cleared-lines))\r\n\r\n\t\t\t\t\t(meth update-gameplay (dt)\r\n\t\t\t\t\t\t(inc! @clearing-timer dt)\r\n\t\t\t\t\t\t(when (>= @clearing-timer 1.4)\r\n\t\t\t\t\t\t\t; the animation is complete. remove the cleared lines from the grid\r\n\t\t\t\t\t\t\t(for y in (rev @cleared-lines)\r\n\t\t\t\t\t\t\t\t(del! @grid (* y :grid-width) : (* (+ y 1) :grid-width)))\r\n\r\n\t\t\t\t\t\t\t(let to-add (* (len @cleared-lines) :grid-width))\r\n\t\t\t\t\t\t\t(push-start! @grid ..(take to-add (repeat-with (fn0 (Tile:new \'stage 0)))))\r\n\r\n\t\t\t\t\t\t\t; award points based on the current level and the number of lines cleared\r\n\t\t\t\t\t\t\t(let multiplier (match (len @cleared-lines)\r\n\t\t\t\t\t\t\t\t(0 (bail))\r\n\t\t\t\t\t\t\t\t(1 40)\r\n\t\t\t\t\t\t\t\t(2 100)\r\n\t\t\t\t\t\t\t\t(3 300)\r\n\t\t\t\t\t\t\t\t(_ 1200)))\r\n\r\n\t\t\t\t\t\t\t(inc! @score (* multiplier (+ @level 1)))\r\n\t\t\t\t\t\t\t(inc! @lines (len @cleared-lines))\r\n\r\n\t\t\t\t\t\t\t; increment the level based on the total number of lines cleared\r\n\t\t\t\t\t\t\t(= @level (min 20 (max @level (- (/ @lines 10) 1))))\r\n\r\n\t\t\t\t\t\t\t; restart the Falling state\r\n\t\t\t\t\t\t\t(@enab! \'Falling)\r\n\t\t\t\t\t\t\t(return)))\r\n\r\n\t\t\t\t\t; a simple animation - we just draw the backdrop over some lines to \"disappear\" them,\r\n\t\t\t\t\t; switching on and off every 200ms\r\n\t\t\t\t\t(meth draw-gameplay ()\r\n\t\t\t\t\t\t(@draw-backdrop \'show-grid)\r\n\r\n\t\t\t\t\t\t(when (<= (% @clearing-timer 0.4) 0.2)\r\n\t\t\t\t\t\t\t(for y in @cleared-lines\r\n\t\t\t\t\t\t\t\t(forn (x :grid-width)\r\n\t\t\t\t\t\t\t\t\t(play:draw \'stage (+ 32 (* x 16)) (* y 16)))))))\r\n\r\n\t\t\t\t; the momentary freeze just before game over\r\n\t\t\t\t(state Frozen\r\n\t\t\t\t\t(field frozen-timer 0.0)\r\n\r\n\t\t\t\t\t; nothing exciting here - we simply wait for two seconds, then enable GameOver\r\n\t\t\t\t\t(meth update-gameplay (dt)\r\n\t\t\t\t\t\t(inc! @frozen-timer dt)\r\n\t\t\t\t\t\t(when (>= @frozen-timer 2.0)\r\n\t\t\t\t\t\t\t(@enab! \'GameOver)\r\n\t\t\t\t\t\t\t(return)))\r\n\r\n\t\t\t\t\t(meth draw-gameplay ()\r\n\t\t\t\t\t\t(@draw-backdrop \'show-grid)))))\r\n\r\n\t\t; showing the \"GAME OVER\" message\r\n\t\t(state GameOver\r\n\t\t\t(field game-over-timer 0.0)\r\n\r\n\t\t\t(meth update-gameplay (dt)\r\n\t\t\t\t(inc! @game-over-timer dt)\r\n\r\n\t\t\t\t; we don\'t allow the message to be dismissed for the first second, to make it less\r\n\t\t\t\t; likely that the player will dismiss it accidentally\r\n\t\t\t\t(when (>= @game-over-timer 1.0)\r\n\r\n\t\t\t\t\t; dismiss the dialog, and restart the game, if any one of various keys have been pressed\r\n\t\t\t\t\t(when (any? play:pressed? \'(left right up down enter))\r\n\t\t\t\t\t\t(@reset)\r\n\t\t\t\t\t\t(@enab! \'Playing)\r\n\t\t\t\t\t\t(return))))\r\n\r\n\t\t\t(meth draw-gameplay ()\r\n\t\t\t\t(@draw-backdrop \'hide-grid)\r\n\r\n\t\t\t\t; draw the floating text box\r\n\t\t\t\t(play:draw \'game-over-frame 73 116)\r\n\t\t\t\t(play:draw \'game-over-frame 113 116 \'hflip)\r\n\t\t\t\t(play:draw \'game-over-text 97 132)))))\r\n\r\n; the grid of tiles\r\n;-----------------------------------------------------------\r\n\r\n(def :grid-width 10)\r\n(def :grid-height 18)\r\n\r\n; collision and rendering information for a single grid tile\r\n(defstruct Tile\r\n\tsprite ; a symbol, e.g. \'z-piece\r\n\tframe) ; an integer, usually 0\r\n\r\n; returns an array of Tiles, in row-major order\r\n(defn make-grid ()\r\n\t(arr ..(take (* :grid-width :grid-height) (repeat-with (fn0 (Tile:new \'stage 0))))))\r\n\r\n; a playing piece\r\n;-----------------------------------------------------------\r\n\r\n(defstruct Part\r\n\toffset-x offset-y ; signed integer offsets from origin-x, origin-y\r\n\ttile) ; a Tile\r\n\r\n(defclass Piece\r\n\t(field piece-type) ; a symbol. one of \'z-piece, \'s-piece, \'t-piece, \r\n\t                   ; \'o-piece, \'l-piece, \'i-piece or \'j-piece\r\n\t\r\n\t(field origin-x 4) ; the piece\'s position within the grid\r\n\t(field origin-y 1)\r\n\r\n\t(field parts) ; an array of Parts\r\n\r\n\t(field rotation 0) ; incremented for clockwise rotations, decremented for anticlockwise\r\n\r\n\t(init (@piece-type)\r\n\r\n\t\t; construct the @parts field based on the :pieces table from the beginning  of this file\r\n\t\t(= @parts (arr))\r\n\t\t(for (offset-x offset-y (? frame 0)) in [:pieces @piece-type]\r\n\t\t\t(push! @parts (Part\r\n\t\t\t\toffset-x\r\n\t\t\t\toffset-y\r\n\t\t\t\t(tile (Tile\r\n\t\t\t\t\t(sprite @piece-type)\r\n\t\t\t\t\tframe))))))\r\n\r\n\t; returns #t if this piece is currently overlapping with an obstacle\r\n\t(meth collides? (grid)\r\n\r\n\t\t; test each part separately...\r\n\t\t(for [offset-x offset-y] in @parts\r\n\t\t\t(let x (+ offset-x @origin-x))\r\n\t\t\t(let y (+ offset-y @origin-y))\r\n\r\n\t\t\t; the left, right and bottom edges are obstacles, but the top edge isn\'t\r\n\t\t\t(when (or (< x 0) (>= x :grid-width) (>= y :grid-height))\r\n\t\t\t\t(return #t))\r\n\r\n\t\t\t(when (>= y 0)\r\n\t\t\t\t; grid tiles are obstacles when they have a sprite other than \'stage\r\n\t\t\t\t(let grid-tile [grid (+ x (* y :grid-width))])\r\n\t\t\t\t(unless (eq? [grid-tile \'sprite] \'stage)\r\n\t\t\t\t\t(return #t))))\r\n\r\n\t\t#f)\r\n\r\n\t; copy each of this piece\'s Parts onto the grid, in their current position\r\n\t(meth place-onto-grid (grid)\r\n\t\t(for [offset-x offset-y tile] in @parts\r\n\t\t\t(let x (+ offset-x @origin-x))\r\n\t\t\t(let y (+ offset-y @origin-y))\r\n\r\n\t\t\t(when (and (<= 0 x (- :grid-width 1)) (<= 0 y (- :grid-height 1)))\r\n\t\t\t\t(= [grid (+ x (* y :grid-width))] (clone tile)))))\r\n\r\n\t; shift this piece by the given horizontal and vertical offset\r\n\t(meth move! (dx dy)\r\n\t\t(inc! @origin-x dx)\r\n\t\t(inc! @origin-y dy))\r\n\r\n\t; rotate this piece around its origin\r\n\t(meth rotate-cw! ()\r\n\r\n\t\t; O pieces never rotate. I pieces toggle betweeen \"default\" and \"one step anticlockwise\".\r\n\t\t; S and Z pieces toggle between \"default\" and \"one step clockwise\". all other pieces truly\r\n\t\t; rotate around their origin.\r\n\t\t(cond\r\n\t\t\t((eq? @piece-type \'o-piece)\r\n\t\t\t\t#n)\r\n\t\t\t((and (eq? @piece-type \'i-piece) (>= @rotation 0))\r\n\t\t\t\t(@rotate-acw!))\r\n\t\t\t((and (eq-any? @piece-type \'z-piece \'s-piece) (>= @rotation 1))\r\n\t\t\t\t(@rotate-acw!))\r\n\t\t\t(else \r\n\t\t\t\t(for part in @parts\r\n\t\t\t\t\t; rotate this part 90 degrees clockwise\r\n\t\t\t\t\t(swap! [part \'offset-x] [part \'offset-y])\r\n\t\t\t\t\t(neg! [part \'offset-x])\r\n\r\n\t\t\t\t\t; most piece sprites only have one frame. the exception is \'i-piece\r\n\t\t\t\t\t(inc! [[part \'tile] \'frame] 3))\r\n\t\t\t\t(inc! @rotation))))\r\n\r\n\t(meth rotate-acw! ()\r\n\r\n\t\t; see above\r\n\t\t(cond\r\n\t\t\t((eq? @piece-type \'o-piece)\r\n\t\t\t\t#n)\r\n\t\t\t((and (eq? @piece-type \'i-piece) (<= @rotation -1))\r\n\t\t\t\t(@rotate-cw!))\r\n\t\t\t((and (eq-any? @piece-type \'z-piece \'s-piece) (<= @rotation 0))\r\n\t\t\t\t(@rotate-cw!))\r\n\t\t\t(else \r\n\t\t\t\t(for part in @parts\r\n\t\t\t\t\t(neg! [part \'offset-x])\r\n\t\t\t\t\t(swap! [part \'offset-x] [part \'offset-y])\r\n\t\t\t\t\t(inc! [[part \'tile] \'frame] 3))\r\n\t\t\t\t(dec! @rotation))))\r\n\r\n\t; draw this piece on the grid, at its current position\r\n\t(meth draw (x y)\r\n\t\t(for [offset-x offset-y (tile [sprite frame])] in @parts\r\n\t\t\t(play:draw sprite (+ x (* offset-x 16)) (+ y (* offset-y 16)) \'frame frame))))\r\n\r\n; the play:update callback\r\n;-----------------------------------------------------------\r\n\r\n(def :game (Game))\r\n\r\n; we simply delegate to Game, above\r\n(defn play:update (dt)\r\n\t(.update :game dt)\r\n\t(.draw :game))\r\n",
	"tennis.glsp": "; the \"PLAY\" button will run this code in a simple game engine. the api: \r\n; https://github.com/fleabitdev/glsp/blob/master/website/glsp-playground/API.md\r\n\r\n; configuring the engine\r\n;-----------------------------------------------------------\r\n\r\n(def play:width 400)\r\n(def play:height 240)\r\n(def play:title \"Tennis\")\r\n(def play:blurb r#\"\r\n\t<p><b>W, S:</b> Move left paddle\r\n\t<p><b>Up, Down:</b> Move right paddle\r\n\"#)\r\n\r\n; the gameplay code\r\n;-----------------------------------------------------------\r\n\r\n(defstruct Rect\r\n\tx y w h\r\n\r\n\t(meth overlaps? (other-rect)\r\n\t\t(let [x y w h] other-rect)\r\n\t\t(and (< @x (+ x w))\r\n\t\t     (< x (+ @x @w))\r\n\t\t     (< @y (+ y h))\r\n\t\t     (< y (+ @y @h)))))\r\n\r\n(def paddle-speed 220)\r\n(def paddle-height 40)\r\n(def paddle-start-y (-> play:height (- paddle-height) (/ 2)))\r\n\r\n(def left-paddle (Rect\r\n\t(x 10)\r\n\t(y paddle-start-y)\r\n\t(w 6)\r\n\t(h paddle-height)))\r\n\r\n(def right-paddle (Rect\r\n\t(x (- play:width 16)) \r\n\t(y paddle-start-y)\r\n\t(w 6)\r\n\t(h paddle-height)))\r\n\r\n(def ball-start-x (-> play:width (/ 2) (- 3)))\r\n(def ball-start-y (-> play:height (/ 2) (- 3)))\r\n\r\n(def ball (Rect\r\n\t(x ball-start-x)\r\n\t(y ball-start-y)\r\n\t(w 6)\r\n\t(h 6)))\r\n\r\n(def ball-dx 0)\r\n(def ball-dy 0)\r\n\r\n(defn play:update (dt)\r\n\r\n\t; update the paddles\r\n\t(for (paddle up-key down-key) in `((~left-paddle w s)\r\n\t                                   (~right-paddle up down))\r\n\t\t(when (play:down? up-key)\r\n\t\t\t(dec! [paddle \'y] (* dt paddle-speed)))\r\n\r\n\t\t(when (play:down? down-key)\r\n\t\t\t(inc! [paddle \'y] (* dt paddle-speed)))\r\n\r\n\t\t(clamp! [paddle \'y] 0 (- play:height paddle-height)))\r\n\r\n\t; update the ball\r\n\t(when (and (== ball-dx ball-dy 0)\r\n\t           (any? play:pressed? \'(w s up down)))\r\n\t\t(= ball-dx (* (rand-select -1 1) (rand 170 210)))\r\n\t\t(= ball-dy (* (rand-select -1 1) (rand 50 100))))\r\n\r\n\t(inc! [ball \'x] (* dt ball-dx))\r\n\t(inc! [ball \'y] (* dt ball-dy))\r\n\r\n\t(when (< [ball \'y] 0)\r\n\t\t(= ball-dy (abs ball-dy)))\r\n\r\n\t(when (>= (+ [ball \'y] [ball \'h]) play:height)\r\n\t\t(= ball-dy (- (abs ball-dy))))\r\n\r\n\t(when (or (and (.overlaps? ball left-paddle) (< ball-dx 0))\r\n\t          (and (.overlaps? ball right-paddle) (> ball-dx 0)))\r\n\t\t(= ball-dx (- (* ball-dx (rand 1.03 1.08))))\r\n\t\t(inc! ball-dy (rand 50 -50))\r\n\t\t(clamp! ball-dy (- (abs ball-dx)) (abs ball-dx)))\r\n\r\n\t(unless (<= 0 [ball \'x] play:width)\r\n\t\t(= [ball \'x] ball-start-x)\r\n\t\t(= [ball \'y] ball-start-y)\r\n\t\t(= ball-dx 0)\r\n\t\t(= ball-dy 0))\r\n\r\n\t; rendering\r\n\t(let midnight-blue \'(25 25 112))\r\n\t(let turquoise \'(64 224 208))\r\n\r\n\t(play:fill 0 0 play:width play:height ..midnight-blue)\r\n\t(play:fill ..[ball \'(x y w h)] ..turquoise)\r\n\t(play:fill ..[left-paddle \'(x y w h)] ..turquoise)\r\n\t(play:fill ..[right-paddle \'(x y w h)] ..turquoise))\r\n",
};

/*
the static site generator prefixes this file with `let demoSources = { ... }`, where each
value is the full contents of a .glsp source file as a string, and each key is its full filename,
e.g. "minefinder.glsp"
*/

//-------------------------------------------------------------------------------------------------
// elements
//-------------------------------------------------------------------------------------------------

let playStopButtons = document.getElementById("playground-button");
let playButton = document.getElementById("playground-play");
let stopButton = document.getElementById("playground-stop");
let screen = document.getElementById("playground-screen");
let loading = document.getElementById("playground-loading");
let errorMsg = document.getElementById("playground-error-msg");
let errorTitle = document.getElementById("playground-error-title");
let errorText = document.getElementById("playground-error-text");
let intro = document.getElementById("playground-intro");
let canvas = document.querySelector("#playground-screen canvas");
let textarea = document.getElementById("glsp-code-textarea");
let select = document.querySelector("#playground-dropdown select");

let ctx = canvas.getContext("2d", {
	alpha: false,
	desynchronized: true
});


//-------------------------------------------------------------------------------------------------
// the code editor
//-------------------------------------------------------------------------------------------------

/*
don't want to waste too much effort on this, so we currently do the bare minimum to make the
textarea usable for *basic* code editing: disable tab-to-change-focus, enable tab input
(including indenting/unindenting a multi-line selection), and enable basic autoindentation 
(when the return key is pressed, we insert the same whitespace as the previous line).
*/

textarea.addEventListener("keydown", ev => {

	//intercept Tab and shift+Tab keypresses
	if (ev.key == "Tab" && ev.ctrlKey == false && ev.altKey == false) {

		//takes a line of text and returns that same line, reduced by one indentation level
		let unindentLine = (lineStr) => {
			let trimmed = lineStr.trimStart();
			let whitespace = lineStr.slice(0, lineStr.length - trimmed.length);

			if (whitespace.startsWith('\t')) {
				return whitespace.slice(1) + trimmed;
			}

			if (whitespace.startsWith(' ')) {
				if (whitespace.startsWith('  ')) {
					return whitespace.slice(2) + trimmed;
				} else {
					return whitespace.slice(1) + trimmed;
				}
			}

			return whitespace + trimmed;
		};

		let selection = textarea.value.slice(textarea.selectionStart, textarea.selectionEnd);
		if (selection.includes('\n')) {

			//the selection spans multiple lines. unindent each line
			while (true) {
				let ch = textarea.value.charAt(textarea.selectionStart - 1);
				if (ch && ch != '\n') {
					textarea.selectionStart -= 1;
				} else {
					break;
				}
			}

			while (true) {
				let ch = textarea.value.charAt(textarea.selectionEnd);
				if (ch && ch != '\n') {
					textarea.selectionEnd += 1;
				} else {
					break;
				}
			}

			let selection = textarea.value.slice(textarea.selectionStart, textarea.selectionEnd);
			let inLines = selection.split('\n');
			let outLines = [];
			for (inLine of inLines) {
				if (ev.shiftKey) {
					outLines.push(unindentLine(inLine));
				} else {
					outLines.push('\t' + inLine);
				}
			}

			let output = outLines.join('\n');
			textarea.setRangeText(output);

			textareaChanged();
			ev.preventDefault();
			return;
		} else {

			//the selection does not span multiple lines. 
			if (ev.shiftKey) {

				//shift+tab. iff there is '\t' or ' ' just before the selection, delete it.
				if (textarea.value.charAt(textarea.selectionStart - 1) == '\t') {
					textarea.selectionStart -= 1;
					textarea.selectionEnd = textarea.selectionStart + 1;
					textarea.setRangeText("");
				} else if (textarea.value.charAt(textarea.selectionStart - 1) == ' ' &&
				           textarea.value.charAt(textarea.selectionStart - 2) == ' ') {
					textarea.selectionStart -= 2;
					textarea.selectionEnd = textarea.selectionStart + 2;
					textarea.setRangeText("");
				}

				textareaChanged();
				ev.preventDefault();
			} else {

				//just type a tab character
				textarea.setRangeText("\t", textarea.selectionStart, textarea.selectionEnd, "end");
				
				textareaChanged();
				ev.preventDefault();
			}
		}
	}

	//intercept Enter keypresses
	if (ev.key == "Enter" && ev.ctrlKey == false && ev.altKey == false) {
		//html5 spec says that linebreaks are normalized to '\n', so we don't need to handle '\r\n'
		textarea.setRangeText(
			'\n',
			textarea.selectionStart,
			textarea.selectionEnd,
			"end"
		);

		//if '\n' is not found, this sets lineStart to 0
		let lineStart = textarea.value.lastIndexOf('\n', textarea.selectionStart - 2) + 1;

		let textStart = lineStart;
		while (true) {
			let ch = textarea.value.charAt(textStart);
			if (ch == undefined || !(ch == ' ' || ch == '\t')) {
				break;
			}

			textStart += 1;
		}

		textarea.setRangeText(
			textarea.value.slice(lineStart, textStart),
			textarea.selectionStart,
			textarea.selectionEnd,
			"end"
		);

		textareaChanged();
		ev.preventDefault();
	}
});


//-------------------------------------------------------------------------------------------------
// demo source code
//-------------------------------------------------------------------------------------------------

//surprisingly straightforward. we just store the current source in demoSources and keep it in 
//sync with the textarea.
function textareaChanged() {
	demoSources[select.selectedOptions[0].textContent] = textarea.value;
}

textarea.addEventListener("input", textareaChanged);

function selectChanged() {
	textarea.value = demoSources[select.selectedOptions[0].textContent];
	textarea.scrollTop = 0;
}

select.addEventListener("input", selectChanged);

//handling the url #fragment
function processHash() {
	if (window.location.hash) {
		let fragment = window.location.hash.slice(1);

		for (option of select.options) {
			if (fragment == option.value || fragment == option.label) {
				select.selectedIndex = option.index;
				selectChanged();
			}
		}
	}
}

processHash();

window.addEventListener("hashchange", processHash);


//-------------------------------------------------------------------------------------------------
// states
//-------------------------------------------------------------------------------------------------

/*
this toplevel state machine only really controls the visibility of html elements. there's quite a 
lot of implicit state related to loading and rendering - see below.

possible states are "editing". "preLoading", "loading", "errorMsg", "intro" or "rendering". 
clicking the "stop" button unconditionally changes the state back to "editing", which cancels 
any ongoing pre-loading/loading/rendering.

"preLoading" is a brief pause, during which time the text editor is still displayed, to avoid
a distracting flicker of "Loading..." text on fast connections.
*/

let state = "editing";

function showElementsForState(newState) {
	//hide/disable everything
	playButton.style.display = "none";
	textarea.style.display = "none";
	screen.style.display = "none";
	loading.style.display = "none";
	errorMsg.style.display = "none";
	intro.style.display = "none";
	canvas.style.display = "none";
	select.disabled = true;

	//selectively re-show/re-enable only what the new state needs
	switch (newState) {
		case "editing":
			playButton.style.display = "block";
			textarea.style.display = "block";
			select.disabled = false;
			break;
		
		case "preLoading":
			textarea.style.display = "block";
			break;

		case "loading":
			screen.style.display = "flex";
			loading.style.display = "block";
			break;

		case "errorMsg":
			screen.style.display = "flex";
			errorMsg.style.display = "flex";
			break;

		case "intro":
			screen.style.display = "flex";
			intro.style.display = "flex";
			break;

		case "rendering":
			screen.style.display = "flex";
			canvas.style.display = "block";
			break;

		default:
			throw new Error("unrecognized state " + newState)
	}

	//update the `state` global
	state = newState
}

playStopButtons.addEventListener("click", (ev) => {
	switch (state) {
		case "editing":
			showElementsForState("preLoading");
			startPreLoading();
			break;

		//cancel ongoing operations from the current state...
		case "preLoading":
			showElementsForState("editing");
			stopPreLoading();
			break;

		case "loading":
			showElementsForState("editing");
			stopLoading();
			break;

		case "errorMsg":
			showElementsForState("editing");
			break;

		case "intro":
			showElementsForState("editing");
			break;

		case "rendering":
			showElementsForState("editing");
			stopRendering();
			break;

		default:
			showElementsForState("editing");
			break;
	}
});

screen.addEventListener("click", (ev) => {
	if (state == "intro") {
		showElementsForState("rendering");
		startRendering();
	}
});

screen.addEventListener("contextmenu", (ev) => {
	ev.preventDefault();
});

document.addEventListener("keydown", (ev) => {
	if (state == "intro") {
		showElementsForState("rendering");
		startRendering();
	}
});


//-------------------------------------------------------------------------------------------------
// the "preLoading" state
//-------------------------------------------------------------------------------------------------

//think of this state as a child of the "loading" state. it calls startLoading when it's
//enabled and stopLoading when it's interrupted.

let preLoadingTimeout = null;

function startPreLoading() {
	startLoading();

	if (!loaded) {
		if (preLoadingTimeout !== null) {
			throw new Error("preLoading state enabled twice simultaneously")
		}

		preLoadingTimeout = window.setTimeout(preLoad, 150);
	}
}

function isPreLoading() {
	return (preLoadingTimeout !== null);
}

function preLoad() {
	preLoadingTimeout = null;
	showElementsForState("loading");
}

function stopPreLoading() {
	window.clearTimeout(preLoadingTimeout);
	preLoadingTimeout = null;

	stopLoading();
}


//-------------------------------------------------------------------------------------------------
// the "loading" state
//-------------------------------------------------------------------------------------------------

//the actual data is only loaded once. if `loaded` is true, then the data has already been loaded, 
//and startLoading() can immediately cancel itself (and "preLoading") and enable the
//rendering state instead.

let loaded = false;
let bitmap = null;
let sprites = null;

//important never to load the .wasm file twice, even if some other part of loading failed
let wasmLoaded = false;

function startLoading() {
	loadCancelled = false;

	if (loaded) {
		onLoaded();
	} else {
		let bitmapPromise = new Promise((resolve, reject) => {
			bitmap = new Image();
			bitmap.addEventListener("load", () => {
				resolve();
			});
			bitmap.addEventListener("error", (err) => {
				reject("unable to load spritesheet bitmap: ", err.type);
			});
			bitmap.src = "spritesheet.png";
		});

		let spritesPromise = new Promise((resolve, reject) => {
			window.fetch("spritesheet.json").then(
				response => {
					if (!response.ok) {
						throw Error(response.statusText);
					}

					response.json().then(
						json => {
							sprites = spritesFromJSON(json);
							resolve();
						},
						err => reject(err)
					);
				},
				err => reject(err)
			)
		});

		let wasmPromise = new Promise((resolve, reject) => {
			window.fetch("glsp_playground_bg.wasm").then(
				response => {
					if (!response.ok) {
						throw Error(response.statusText);
					}
					
					response.arrayBuffer().then(
						arrayBuffer => {
							if (wasmLoaded) {
								resolve();
							} else {
								wasm_bindgen(arrayBuffer).then(
									() => {
										wasmLoaded = true;
										resolve();
									},
									(err) => reject(err)
								);
							}
						},
						err => reject(err)
					);
				},
				err => reject(err)
			);
		});

		Promise.all([bitmapPromise, spritesPromise, wasmPromise])
			.then(onLoaded)
			.catch(onLoadFailed);
	}
}

let loadCancelled = false;

function onLoaded() {
	if (loadCancelled) {
		return;
	}

	//book-keeping
	loaded = true;
	console.assert(bitmap !== null && sprites !== null && wasmLoaded);

	if (isPreLoading()) {
		stopPreLoading();
		loadCancelled = false;
	}

	//load the glsp code, then show the "intro" screen
	try {
		wasm_bindgen.initEngine(
			textarea.value,
			select.selectedOptions[0].textContent,
			Math.random()
		);
	} catch(err) {
		showErrorMsg(err);
		return;
	}

	intro.innerHTML =
		"<h2>" + wasm_bindgen.title() + "</h2>" + wasm_bindgen.blurb() +
		"<p>To begin, click the play area or press any key." +
		"<div class=\"strut\"></div>";

	showElementsForState("intro");
}

function onLoadFailed(err) {
	loaded = false;
	bitmap = null;
	sprites = null;

	if (isPreLoading()) {
		stopPreLoading();
		loadCancelled = false;
	}

	showErrorMsg(err);
}

function stopLoading() {
	//there actually isn't any way to cancel a Promise in ES6... but the worst-case scenario
	//is that `sprites` and `bitmap` get loaded twice, which isn't the end of the world.

	//we just set the `loadCancelled` flag to prevent onLoaded from being executed.
	loadCancelled = true;
}

function spritesFromJSON(json) {
	let sprites = {};

	for (slice of json.meta.slices) {
		let rect = Object.assign({}, slice.keys[0].bounds);

		if (slice.name.includes(".")) {
			let splits = slice.name.split(".");
			let frameCount = parseInt(splits[1]);
			let frameWidth = Math.floor(rect.w / frameCount);

			let frames = [];
			for (let f=0; f<frameCount; f++) {
				frames.push({
					x: rect.x + (f * frameWidth),
					y: rect.y,
					w: frameWidth,
					h: rect.h
				});
			}

			sprites[splits[0]] = frames;
		} else {
			sprites[slice.name] = [rect];
		}
	}

	return sprites;
}


//-------------------------------------------------------------------------------------------------
// the "errorMsg" state
//-------------------------------------------------------------------------------------------------

function showErrorMsg(err) {
	errorText.innerText = String(err);

	showElementsForState("errorMsg")
}


//-------------------------------------------------------------------------------------------------
// the "rendering" state
//-------------------------------------------------------------------------------------------------

let animationFrameHandle = null;
let bufWidth = canvas.width;
let bufHeight = canvas.height;
let screenWidth = bufWidth;
let screenHeight = bufHeight;

function resizeCanvas() {
	//bufWidth and bufHeight store the nominal size of the "back buffer", as specified by
	//the glsp code using the play:width and play:height globals.

	//this function applies a width, height and image-rendering strategy for the <canvas> element,
	//based on the size of the rendering area in device pixels. if it can be upscaled to an
	//integer ratio of its nominal size, while still occuping at least two-thirds of the
	//rendering area in at least one dimension, we perform that integer upscaling using
	//image-rendering: crisp-edges. otherwise we upscale to the next-lowest integer ratio using
	//2d transforms, and upscale or downscale the rest of the way using html.

	let padding = 16 * window.devicePixelRatio;
	screenWidth = screen.clientWidth * window.devicePixelRatio;
	screenHeight = screen.clientHeight * window.devicePixelRatio;

	let maxWidth = screenWidth - padding*2;
	let maxHeight = screenHeight - padding*2;

	let floatRatio = Math.min(maxWidth / bufWidth, maxHeight / bufHeight);
	let intRatio = Math.floor(floatRatio);

	let drawScale;

	if (intRatio >= 1 && intRatio/floatRatio >= 0.667) {
		drawScale = 1;

		canvas.width = bufWidth;
		canvas.height = bufHeight;

		canvas.style.width = (bufWidth * intRatio / window.devicePixelRatio).toFixed(2) + "px";
		canvas.style.height = (bufHeight * intRatio / window.devicePixelRatio).toFixed(2) + "px";

		if (CSS.supports("image-rendering", "crisp-edges")) {
			canvas.style.imageRendering = "crisp-edges";
		} else {
			canvas.style.imageRendering = "pixelated";
		}
	} else {
		drawScale = Math.max(1, intRatio);

		canvas.width = bufWidth * drawScale;
		canvas.height = bufHeight * drawScale;

		canvas.style.width = (bufWidth * floatRatio / window.devicePixelRatio).toFixed(2) + "px";
		canvas.style.height = (bufHeight * floatRatio / window.devicePixelRatio).toFixed(2) + "px";
		canvas.style.imageRendering = "auto";
	}

	//drawing configuration is reset when the canvas' backing width/height changes, so we
	//need to assign any long-lasting settings here
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.scale(drawScale, drawScale);
	ctx.imageSmoothingEnabled = false;
}

function startRendering() {
	showElementsForState("rendering");

	bufWidth = wasm_bindgen.width();
	bufHeight = wasm_bindgen.height();
	resizeCanvas();

	//start the animation loop
	animationFrameHandle = window.requestAnimationFrame(onFirstFrame);
}

function stopRendering() {
	if (animationFrameHandle !== null) {
		window.cancelAnimationFrame(animationFrameHandle);
		animationFrameHandle = null;
	}
}

//the input map. each key is "LMB", "RMB", "MMB" or a KeyboardEvent.key string. each value is
//a table with keys `down`, `pressed` and `released` bound to booleans. we assume that if a
//particular key hasn't been seen, all three values are false.
let inputState = {};

let mouseClientX = 0;
let mouseClientY = 0;

document.addEventListener("mousemove", (ev) => {
	mouseClientX = ev.clientX;
	mouseClientY = ev.clientY;
});

//returned coordinates are relative to the interior of the <canvas> element, and measured in 
//back-buffer pixels, as in bufWidth and bufHeight. this function shouldn't be called when
//the canvas is hidden.
function mouseCoords() {
	let rect = canvas.getBoundingClientRect();

	return {
		x: Math.floor((mouseClientX - rect.left) * (bufWidth / rect.width)),
		y: Math.floor((mouseClientY - rect.top) * (bufHeight / rect.height))
	}
}

function inputEntry(key) {
	//we normalize alphabetic characters to uppercase
	if (key.length == 1 && key >= "a" && key <= "z") {
		key = key.toUpperCase();
	}

	if (!(key in inputState)) {
		inputState[key] = { down: false, pressed: false, released: false };
	}

	return inputState[key];
}

function stepInputState() {
	for (key of Object.keys(inputState)) {
		inputState[key].pressed = false;
		inputState[key].released = false;
	}
}

document.addEventListener("keydown", (ev) => {
	if (ev.key != "Undefined" && !ev.repeat) {
		let entry = inputEntry(ev.key);
		entry.down = true;
		entry.pressed = true;
	}
});

document.addEventListener("keyup", (ev) => {
	if (ev.key != "Undefined") {
		let entry = inputEntry(ev.key);
		entry.down = false;
		entry.released = true;
	}
});

document.addEventListener("mousedown", (ev) => {
	let buttonName = ["LMB", "MMB", "RMB"][ev.button];
	if (!buttonName) {
		return;
	}

	let entry = inputEntry(buttonName);
	entry.down = true;
	entry.pressed = true;
});

document.addEventListener("mouseup", (ev) => {
	let buttonName = ["LMB", "MMB", "RMB"][ev.button];
	if (!buttonName) {
		return;
	}

	let entry = inputEntry(buttonName);
	entry.down = false;
	entry.released = true;
});

let lastTimeStamp = 0;

//to ensure that the `dt` argument is always accurate, we discard the first frame. this also
//helps to ensure that (play:pressed?) and (play:released?) are false during the first frame.
function onFirstFrame(timeStamp) {
	stepInputState();
	lastTimeStamp = timeStamp;
	animationFrameHandle = window.requestAnimationFrame(onAnimationFrame);
}

function onAnimationFrame(timeStamp) {

	//detect when the viewport has been resized, and resize the canvas if so
	let curScreenWidth = screen.clientWidth * window.devicePixelRatio;
	let curScreenHeight = screen.clientHeight * window.devicePixelRatio;
	if (screenWidth != curScreenWidth || screenHeight != curScreenHeight) {
		resizeCanvas();
	}

	//yield to glsp
	try {
		wasm_bindgen.update((timeStamp - lastTimeStamp)/1000);
	} catch(err) {
		stopRendering();
		showErrorMsg(err);
		return null;
	}

	//continue the main loop
	stepInputState();
	lastTimeStamp = timeStamp;
	animationFrameHandle = window.requestAnimationFrame(onAnimationFrame);
}


//-------------------------------------------------------------------------------------------------
// `play:` callbacks for glsp
//-------------------------------------------------------------------------------------------------

function playMouseX() {
	return mouseCoords().x;
}

function playMouseY() {
	return mouseCoords().y;
}

//to keep things minimalist, we only support querying the following symbols: lmb, mmb, rmb, 
//a through z, up, down, left, right, space, enter.
let knownInputs = {
	up: "ArrowUp",
	down: "ArrowDown",
	left: "ArrowLeft",
	right: "ArrowRight",
	space: " ",
	enter: "Enter",
	lmb: "LMB",
	mmb: "MMB",
	rmb: "RMB"
};

let simpleInputs = [
	"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
	"n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
];

for (simple of simpleInputs) {
	knownInputs[simple] = simple.toUpperCase();
}

function playDownP(input) {
	if (!(input in knownInputs)) {
		throw "unrecognized input " + input + " passed to play:down?"
	}

	return inputEntry(knownInputs[input]).down;
}

function playPressedP(input) {
	if (!(input in knownInputs)) {
		throw "unrecognized input " + input + " passed to play:pressed?"
	}

	return inputEntry(knownInputs[input]).pressed;
}

function playReleasedP(input) {
	if (!(input in knownInputs)) {
		throw "unrecognized input " + input + " passed to play:released?"
	}

	return inputEntry(knownInputs[input]).released;
}

function playFill(x, y, width, height, r, g, b) {
	x = Math.round(x);
	y = Math.round(y);
	width = Math.round(width);
	height = Math.round(height);
	r = Math.max(0, Math.min(255, Math.round(r)));
	g = Math.max(0, Math.min(255, Math.round(g)));
	b = Math.max(0, Math.min(255, Math.round(b)));

	ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
	ctx.fillRect(x, y, width, height);
}

function playDraw(spriteName, dx, dy, hflip, vflip, frame_i) {
	dx = Math.round(dx);
	dy = Math.round(dy);
	frame_i = Math.round(frame_i);

	if (!(spriteName in sprites)) {
		throw "unrecognized sprite " + spriteName + " passed to play:draw";
	}

	let frames = sprites[spriteName];
	let { x, y, w, h } = frames[((frame_i % frames.length) + frames.length) % frames.length];
	
	if (hflip || vflip) {
		let xScale = 1;
		let yScale = 1;

		if (hflip) {
			xScale = -1;
			dx += w;
		}

		if (vflip) {
			yScale = -1;
			dy += h;
		}

		ctx.save();
		ctx.translate(dx, dy);
		ctx.scale(xScale, yScale);
		ctx.drawImage(bitmap, x, y, w, h, 0, 0, w, h);
		ctx.restore();
	} else {
		ctx.drawImage(bitmap, x, y, w, h, dx, dy, w, h);
	}
}
