/* Lantern Harbor: two guided encounters and a new transfer task per station. */
(() => {
  "use strict";

  function round(prompt, choices, answer, hint, why, tones) {
    return { prompt, choices, answer, hint, why, ...(tones ? { tones } : {}) };
  }

  function lesson(band, subject, title, goal, teach, rounds) {
    return { band, subject, title, goal, teach, rounds };
  }

  window.SchoolLessons = [
    lesson("K–2", "Math", "Light the last lantern", "Find how many more will make a small total.",
      "The pier needs 3 lights. One is on. Hold up one finger, then count up: two, three. You added 2 fingers, so light 2 more.", [
        round("The boat needs 3 lights. Two are on. How many more?", ["2", "1", "3"], 1, "Start with two fingers. Add fingers until you have three.", "Two and one more make three."),
        round("Fern needs 4 lights. Two are on. How many more?", ["2", "4", "1"], 0, "Count on from two. Hold up a new finger for each light you add.", "From two, count three, four. You added two lights."),
        round("The mail boat has 3 flags. It needs 5. How many flags should Fern bring?", ["5", "3", "2"], 2, "Start at three. How many steps get you to five?", "Three flags plus two more make five.")
      ]),
    lesson("K–2", "Spelling", "The missing sound", "Choose the letter for the first sound in a short word.",
      "Say sun slowly: sss-un. The first sound is /s/. Put s in front of un to spell sun.", [
        round("Fern wears it on her head. Say hat. Which letter starts _at?", ["h", "m", "p"], 0, "Whisper the first puff of air in hat.", "The letter h spells the first sound in hat."),
        round("It shows the way. Say map. Which letter starts _ap?", ["t", "s", "m"], 2, "Start to say map and pause with your lips together: mmm.", "The letter m spells /m/ in map."),
        round("The captain feeds her pet. Say dog. Which letter starts _og?", ["b", "d", "f"], 1, "Say dog slowly. Listen just before the o.", "Dog begins with /d/, spelled d.")
      ]),
    lesson("K–2", "Grammar", "Write the bell ringer", "Choose a capital letter and end mark that fit a short message.",
      "Look at two notes: “The bell rang.” tells something and ends with a period. “Did it ring?” asks something and ends with a question mark. Both begin with a capital.", [
        round("Which telling note has a capital and the right end mark?", ["the sail is up.", "The sail is up.", "The sail is up,"], 1, "A telling note starts with a capital and can end with a period.", "The capital T starts the note. The period ends it."),
        round("Which end mark asks a question? “Is the boat here_”", [".", ",", "?"], 2, "Does the writer want an answer?", "“Is the boat here?” asks for an answer."),
        round("Choose the finished question for the mail boat.", ["Can we go?", "can we go?", "Can we go,"], 0, "Check both ends of the note.", "The capital C starts the question. The question mark ends it.")
      ]),
    lesson("K–2", "Science", "Shadow theater", "Predict where a shadow will appear when an object blocks light.",
      "Put a toy boat between a lamp and a wall. The boat blocks some light. A dark boat shape appears on the wall behind it.", [
        round("A lamp shines on a card. Which part of the wall gets a shadow?", ["The part behind the card", "Every part of the wall", "The lamp itself"], 0, "Trace a line from the lamp through the card toward the wall.", "The card blocks light from reaching the wall behind it."),
        round("Fern takes the only card away. What happens to its shadow?", ["It gets louder", "It stays the same", "It goes away"], 2, "What is left to block the lamp?", "The light now reaches the spot where the card's shadow was."),
        round("At night a dock lamp shines from Fern’s left. Where will her shadow fall on the deck?", ["To her left", "To her right", "Above the lamp"], 1, "Point from the lamp toward Fern and keep going.", "Fern blocks some light on the side away from the lamp.")
      ]),
    lesson("K–2", "Art", "The sailmaker’s stamp", "Choose a shape by looking at its outline.",
      "Trace a triangle in the air. Turn at each of its three corners. A circle curves all the way around.", [
        round("Make a sail stamp with three straight sides. Pick the shape.", ["Circle", "Square", "Triangle"], 2, "Trace and count its sides.", "A triangle has three straight sides."),
        round("Make a round moon stamp with no corners.", ["Circle", "Triangle", "Rectangle"], 0, "Which outline can you trace without making a turn at a corner?", "A circle curves smoothly all the way around."),
        round("Fern needs a tile with four equal straight sides and four square corners. What stamp fits?", ["Triangle", "Square", "Circle"], 1, "Look for four sides and four corners like the corner of a page.", "A square has four equal sides and four square corners.")
      ]),
    lesson("K–2", "Music", "Fern’s three bells", "Identify how the pitch moves in a three-note call.",
      "Hum a low note, then a higher note, then another higher note. Your tune went up. You can trace its path in the air with a finger.", [
        round("Read or play this call: low, middle, high. Which way does it travel?", ["Up", "Down", "It stays level"], 0, "Compare each note with the one just before it.", "Both steps rise in pitch.", [262,330,392]),
        round("Try high, middle, low. Which shape could Fern trace?", ["A level line", "A line going up", "A line going down"], 2, "What happens on the way from the first note to the last?", "Each bell sounds lower than the one before it.", [392,330,262]),
        round("A new boat calls: low, high, low. Show its tune.", ["Down, then up", "Up, then down", "Up, then up"], 1, "Trace from the first bell to the middle, then back to the last.", "The tune climbs to the high bell and comes back down.", [262,392,262])
      ]),
    lesson("3–5", "Math", "Fuel for the ferry", "Use equivalent fractions to measure a share of a whole.",
      "All the tanks are the same size. Half a tank fills two of four equal marks. So 1/2 and 2/4 describe the same amount.", [
        round("The lamp needs half a tank. The gauge has 8 equal parts. How many parts do you fill?", ["2", "4", "6"], 1, "Split the eight parts into two equal groups.", "Four of eight equal parts is one half."),
        round("A ferry needs 3/4 of a tank. Its gauge has 8 equal parts. How many parts is that?", ["3", "4", "6"], 2, "Each quarter covers two eighths.", "Three groups of two eighths make six eighths."),
        round("A flag has 12 equal panels. The order calls for 2/3 blue. How many panels should be blue?", ["8", "6", "4"], 0, "Find the size of one third of the panels, then take two thirds.", "One third of 12 is four. Two groups of four make eight.")
      ]),
    lesson("3–5", "Spelling", "Notes from yesterday", "Spell the past tense of regular verbs ending in consonant + y or vowel + y.",
      "To write yesterday’s note, turn carry into carried. A consonant before y changes the y to i before -ed. With a vowel before y, keep the y: play becomes played.", [
        round("Yesterday, Fern ___ to tie the ribbon. Start with try.", ["tryed", "tried", "tryied"], 1, "Look at the letter before y in try.", "R is a consonant. Change y to i and add ed: tried."),
        round("Yesterday, the ferry ___ by the dock. Start with stay.", ["staied", "stayied", "stayed"], 2, "In stay, the a before y is a vowel.", "Keep the y after this vowel and add ed: stayed."),
        round("Finish the keeper’s log: “We ___ the cargo hold.” Start with empty.", ["emptied", "emptyed", "emptyeed"], 0, "Does a consonant or a vowel come before the last y?", "T is a consonant. Empty becomes emptied.")
      ]),
    lesson("3–5", "Grammar", "Messages that match", "Make a present-tense verb agree with the subject.",
      "One bell rings. Two bells ring. To find the subject, ask what is doing the ringing. Words that tell where it is can sit between the subject and the verb.", [
        round("One lamp near the boats ___ brightly.", ["shine", "shining", "shines"], 2, "Is the subject lamp or boats?", "The single lamp shines. Near the boats tells where."),
        round("The ropes on the dock ___ in the wind.", ["sway", "sways", "swaying"], 0, "Which things are moving?", "The ropes are plural, so the present-tense verb is sway."),
        round("Finish the sign: “A basket of shells ___ on the counter.”", ["rest", "rests", "resting"], 1, "What sits on the counter as one object?", "Basket is singular. A basket rests.")
      ]),
    lesson("3–5", "Science", "The fog-window test", "Plan a fair comparison by changing one thing at a time.",
      "Fern tests whether a lid slows water loss. She starts two matching cups with the same water level and puts them side by side. Only one has a lid.", [
        round("You want to test how light affects seedling growth. What should differ between the two groups?", ["Light and water", "Light only", "Kind of seed and light"], 1, "Make light the one planned difference.", "Changing only the light makes the comparison easier to interpret."),
        round("The crews test two towel materials. Which plan lets them compare water absorbed fairly?", ["Use scraps of any size", "Give only one towel water", "Use equal-size pieces and the same soaking time"], 2, "Which conditions should match?", "Matching size and soaking time helps isolate the effect of the material."),
        round("Two model ferries have different sail shapes AND different hulls. One wins. How can you test the effect of sail shape?", ["Use matching hulls and the same wind", "Give the slower one a fan", "Paint the winning ferry gold"], 0, "Leave only sail shape as the planned difference.", "Matching hulls and wind allow the crews to compare sail shapes.")
      ]),
    lesson("3–5", "Art", "Paint the night signal", "Use a strong light–dark difference to make a sign easy to see.",
      "Value means how light or dark a color looks. A pale moon on an ink-dark sky stands out even in a black-and-white picture.", [
        round("The sign is deep black. Which painted arrow has the strongest light–dark contrast?", ["Black", "Dark charcoal", "White"], 2, "Look for the greatest difference in lightness.", "White is farthest in value from black."),
        round("A pale-yellow gull blends into a pale cream sky. Which change gives its outline the most value contrast?", ["Add a dark navy outline", "Make the outline pale cream", "Use more pale yellow"], 0, "How could you separate two light shapes?", "A dark edge against the light sky makes the outline easier to distinguish."),
        round("A notice must also work as a grayscale copy. Which test checks its value contrast?", ["Count how many colors you used", "Make a grayscale copy and check the symbol against the background", "Add another word to the title"], 1, "In grayscale, hues disappear, but light and dark remain.", "The grayscale copy reveals whether the values still separate the symbol and its background.")
      ]),
    lesson("3–5", "Music", "Four beats to dock", "Complete a four-beat measure in 4/4 time.",
      "In 4/4, a quarter note lasts one beat, a half note lasts two beats, and a quarter rest is one silent beat. Clap 1, 2, then hold the next sound through 3, 4.", [
        round("The measure starts with one half note. How many beats are left?", ["1", "2", "3"], 1, "A half note uses two of the four beats.", "Two beats used plus two beats left equals four."),
        round("Two quarter notes are followed by a quarter rest. How much time remains in this measure?", ["3 beats", "2 beats", "1 beat"], 2, "Count the silent beat too.", "One plus one plus one fills three beats, leaving one."),
        round("Pick a complete 4/4 cargo-drum measure.", ["Half note, quarter rest, quarter note", "Half note, half note, quarter note", "Quarter rest, quarter note"], 0, "Add the durations, including rests.", "Two beats plus one silent beat plus one beat fills four.")
      ]),
    lesson("6–8", "Math", "Chart the channel", "Use a constant scale to convert between a chart distance and a real distance.",
      "On one chart, 2 cm stands for 5 km. Divide 5 by 2 to find 2.5 km per centimeter. A route 4 cm long stands for 10 km.", [
        round("A chart uses 3 cm for 12 km. What real distance does a 5 cm route represent?", ["15 km", "20 km", "60 km"], 1, "Find the real kilometers per centimeter before multiplying.", "12 ÷ 3 = 4 km per centimeter. Five centimeters represents 20 km."),
        round("At a scale of 2 cm for 7 km, how long should you draw a 21 km route?", ["3 cm", "10.5 cm", "6 cm"], 2, "21 km is how many groups of 7 km?", "Three groups of 7 km need three groups of 2 cm, or 6 cm."),
        round("A keeper’s model uses 4 cm for a 10 m wall. The real quay is 15 m long. How long is its model?", ["6 cm", "3.75 cm", "37.5 cm"], 0, "15 m is one and a half times 10 m. Apply the same factor to the model.", "One and a half times 4 cm is 6 cm.")
      ]),
    lesson("6–8", "Spelling", "Decode the shipwright’s log", "Combine prefixes and base words while preserving the letters at their boundary.",
      "A prefix can make two identical letters meet. Write mis + spell as misspell. Both s letters stay because one belongs to each word part.", [
        round("The mapmaker must look over the chart again. Choose re + examine.", ["rexamine", "reexammin", "reexamine"], 2, "Write the full prefix re, then the full word examine.", "Re ends in e and examine starts with e, giving reexamine."),
        round("The frame is not natural. Choose the spelling that preserves un + natural.", ["unnatural", "unatural", "unnattural"], 0, "Look at the last letter of un and the first of natural.", "Un ends in n, and natural begins with n. Write both."),
        round("A printer sets the heading for a section within a basement. Choose sub + basement.", ["subasement", "subbasement", "subbassment"], 1, "Join the two complete word parts and check where they meet.", "Sub and basement each supply a b, giving subbasement.")
      ]),
    lesson("6–8", "Grammar", "Clear the radio channel", "Revise an ambiguous pronoun so the reader can identify its intended referent.",
      "“Nia told Mara that she had the chart” could name either person. If Mara has it, write “Nia told Mara, ‘You have the chart.’” A clear revision keeps the intended meaning.", [
        round("“Jules handed Fern the flag after she painted it.” Fern did the painting. Which revision proves it?", ["After she painted it, she gave it away.", "After Fern painted the flag, Jules handed it to her.", "She handed the flag to her after painting."], 1, "Name the painter in the part about painting.", "The phrase “Fern painted the flag” identifies the painter directly."),
        round("A navigator put a map beside a chart, then folded the chart. Which log entry makes that clear?", ["It was folded beside it.", "The navigator put them down and folded it.", "The navigator set down the map and folded the chart."], 2, "Name the object that was folded.", "Naming the chart removes the possible second meaning of it."),
        round("“Lee called Robin when their shift ended.” Only Robin’s shift had ended. Choose the clearest dispatch.", ["When Robin’s shift ended, Lee called Robin.", "When their shift ended, Lee called them.", "Lee called after the shift."], 0, "State whose shift ended while keeping the same caller.", "Robin’s shift and Lee’s call are both explicit.")
      ]),
    lesson("6–8", "Science", "The cargo sample bench", "Compare material density using mass divided by volume.",
      "Two solid samples can have different sizes. A 24 g sample occupying 8 cm³ has a density of 3 g/cm³. Compare the mass per unit volume, not just the total mass.", [
        round("A sample has a mass of 36 g and a volume of 12 cm³. Its density is…", ["432 g/cm³", "0.33 g/cm³", "3 g/cm³"], 2, "Divide mass by volume.", "36 ÷ 12 gives 3 grams for each cubic centimeter."),
        round("A is 20 g in 10 cm³. B is 18 g in 6 cm³. Which sample is denser?", ["B", "A", "They have equal densities"], 0, "Find the density of each in g/cm³.", "A is 2 g/cm³ and B is 3 g/cm³. B has more mass per cubic centimeter."),
        round("A uniform block has density 4 g/cm³. A piece cut from it occupies 5 cm³. What is the piece’s mass?", ["1.25 g", "20 g", "9 g"], 1, "Each cubic centimeter of this material has a mass of 4 g.", "Five cubic centimeters at 4 g each give 20 g.")
      ]),
    lesson("6–8", "Art", "Draw the long pier", "Use a horizon and vanishing point to draw depth in one-point perspective.",
      "Draw a dot on an eye-level horizon. For a straight pier pointing away from you, draw its two long parallel edges toward that same dot. The lines on the paper get closer as they recede.", [
        round("The pier points straight away. Where should its two long edges appear to meet?", ["At the bottom corners", "At one point on the horizon", "At different points on the horizon"], 1, "Follow both edges toward the distance.", "In a one-point view, this set of parallel receding edges shares one vanishing point."),
        round("You redraw the same view from a higher balcony. On the drawing, the horizon represents…", ["The top of every mast", "The edge of the paper", "The viewer’s new eye level"], 2, "Imagine a horizontal laser at the viewer’s eyes.", "The horizon in a perspective drawing follows the viewer’s eye level."),
        round("A straight ferry cabin aisle stretches directly away from you. How would you draw its parallel ceiling seams?", ["Aim them at the aisle’s vanishing point", "Make them spread apart in the distance", "Aim each seam at its own corner"], 0, "The aisle and its ceiling seams head in the same real-world direction.", "Parallel edges receding in the same direction share the same vanishing point.")
      ]),
    lesson("6–8", "Music", "Offbeat at the docks", "Place an accent on an offbeat within an evenly divided 4/4 measure.",
      "Count “1 and 2 and 3 and 4 and.” The numbers are beats; each “and” lies halfway to the next beat. Put a strong clap on an “and” to make an offbeat accent.", [
        round("Keep tapping the numbered beats. On which count would a bell land off the beat?", ["1", "The “and” after 2", "3"], 1, "Which option lies between two numbered beats?", "The “and” after 2 is midway between beats 2 and 3."),
        round("The crew accents beat 4. Move the accent one eighth note EARLIER. Where does it go?", ["Beat 3", "The “and” after 4", "The “and” after 3"], 2, "Say “3 and 4.” Which count immediately precedes 4?", "The “and” after 3 is one eighth note before 4."),
        round("The ferry horn sounds on beats 1 and 3. Add two offbeat bell accents immediately AFTER those sounds.", ["The “ands” after 1 and 3", "Beats 2 and 4", "The “ands” after 2 and 4"], 0, "Place each new accent halfway from its horn sound to the next numbered beat.", "The new accents land on the two offbeats immediately following 1 and 3.")
      ]),
    lesson("9–12", "Math", "The launch window", "Equate two linear models and interpret the intersection in context.",
      "A skiff starts at dock marker 0 and travels at 6 km/h. A tender starts 4 km ahead and travels the same way at 4 km/h. Solve 6t = 4 + 4t: the skiff catches the tender after 2 h, at marker 12 km.", [
        round("Two boats follow the same channel. Their positions in kilometers after t hours are A = 8t and B = 6 + 5t. When and where do they meet?", ["2 h at 16 km", "2 h at 10 km", "3 h at 24 km"], 0, "Solve 8t = 6 + 5t, then substitute into either position model.", "3t = 6, so t = 2. Both positions then equal 16 km."),
        round("After the same start signal, two boats have positions 3 + 4t and 1 + 4t km. For t ≥ 0, when do they meet?", ["After 2 h", "At t = 0", "They never meet under these models"], 2, "Compare starting positions and slopes.", "Their speeds match and their starting positions differ. The separation stays 2 km."),
        round("For a ferry order, shop A charges 18 + 2n dollars and B charges 6 + 3n dollars for n identical flags. For what order do the shops charge the same?", ["6 flags for $30", "12 flags for $42", "24 flags for $66"], 1, "Set the two total costs equal, then check the cost in both models.", "18 + 2n = 6 + 3n gives n = 12. Each shop charges $42.")
      ]),
    lesson("9–12", "Spelling", "Edit the expedition catalog", "Spell technical terms by identifying their Greek-derived combining forms.",
      "A seismograph records ground motion. In seismo- + -graph, seismo- refers to shaking and -graph to a recording instrument. Build the word from its complete parts, then check the boundary.", [
        round("For a visual record of sound, join spectro- (spectrum) and -gram (a record). Choose the catalog spelling.", ["spectragrame", "spectrogram", "spectrograme"], 1, "Keep the o at the end of spectro- and the ending -gram.", "Spectro- and -gram join to form spectrogram."),
        round("Label a light-measuring instrument. Join photo- (light) and -meter (measure).", ["photomiter", "photometerre", "photometer"], 2, "Keep both combining forms in their given spelling.", "Photo- plus -meter gives photometer."),
        round("The keeper’s new instrument measures small distances. Join micro- (small) and -meter in its name.", ["micrometer", "micrometreer", "micromitor"], 0, "Write the complete combining forms in order, using the given US spelling.", "Micro- plus -meter gives micrometer, a precision measuring instrument.")
      ]),
    lesson("9–12", "Grammar", "Edit the captain’s dispatch", "Revise lists and paired phrases so their grammatical structures are parallel.",
      "“The crew must inspect the mast, secure the sail, and checking the rudder” changes form mid-list. All three actions follow must: “inspect the mast, secure the sail, and check the rudder.”", [
        round("Complete the checklist: “The team is responsible for labeling samples, checking seals, and ___.”", ["will record times", "recording times", "to record times"], 1, "Match labeling and checking.", "Recording is parallel to the other two -ing forms after for."),
        round("Which revision gives both goals the same grammatical form?", ["Our goals are clear charts and to write short logs.", "Our goals are to chart and clear logs.", "Our goals are to clarify charts and to shorten logs."], 2, "Look for two matching infinitive phrases that preserve both goals.", "To clarify and to shorten each introduces a parallel verb phrase."),
        round("The lookout is comparing two ways to report drift. Which sentence puts parallel actions after either and or?", ["We can either measure the drift or estimate it.", "We can either measure the drift or an estimate.", "We can either measuring the drift or estimate it."], 0, "After can, match the same base-verb structure on each side.", "Measure the drift and estimate it are parallel verb phrases.")
      ]),
    lesson("9–12", "Science", "Audit the harbor evidence", "Evaluate sampling bias and distinguish an observed association from a causal result.",
      "A survey at one sunny pier found more crabs beside warm rocks. Heat could matter, but shelter and tide could also differ. Compare similar sites, sample more than one location, and use cautious conclusions.", [
        round("A biologist wants to estimate snail density across the whole bay. Which sampling plan best represents its varied shores?", ["Only the easiest dock to reach", "Only the warmest tide pools", "Randomly sample equal-area plots within each major shore type, and weight by its area"], 2, "Include every shore type and account for how much of the bay it represents.", "Sampling each type reduces coverage bias. Area weighting matches the combined estimate to the bay."),
        round("At eight docks, brighter lamp sites also caught more moths. What does this observation alone support?", ["Lamp brightness and catch were associated at these docks", "Brightness alone caused the difference", "All moth species prefer bright docks"], 0, "Could dock locations or trap designs also differ?", "This describes the observed association while leaving potential confounding variables open."),
        round("To test whether brighter light changes moth catch, which follow-up design gives the clearest comparison?", ["Use bright traps only on warm nights", "Randomly assign bright or dim settings to identical traps across matched sites and rotate settings over nights", "Compare one bright pier this year to a dim pier last year"], 1, "Look for random assignment and controls for site, equipment, and night.", "Randomizing and rotating settings with matching traps helps separate brightness from site and night effects.")
      ]),
    lesson("9–12", "Art", "Design the wayfinding poster", "Direct viewing order with scale, spacing, and value contrast, then test the design with viewers.",
      "A festival poster needs its route symbol seen first and departure time second. Enlarge the symbol, give it space, and reserve the strongest light–dark contrast for it. A quick first-glance test can show whether viewers follow that order.", [
        round("Viewers notice the decorative border first. The route symbol is your primary message. Which revision directly addresses their observation?", ["Quiet the border and increase contrast around the route symbol", "Add detail to the border", "Repeat the same border around every element"], 0, "Move visual emphasis toward the primary message.", "Reducing competition and increasing the symbol’s contrast supports the intended viewing order."),
        round("Your revised poster will be seen across a station. Which test measures whether its hierarchy works there?", ["Ask the designer if it looks finished", "Count the number of ink colors", "Show it briefly at the intended distance; ask viewers what they noticed first and second"], 2, "Match your test to the real viewing conditions and intended sequence.", "First- and second-noticed responses at the actual distance directly test the hierarchy."),
        round("A museum card should foreground the artist’s name, then the artwork date. Visitors notice the date first. Which revision is most targeted?", ["Increase the size of both lines equally", "Give the artist’s name more prominence and group the smaller date beneath it", "Move the date into a large contrasting badge"], 1, "Which element should get the first moment of attention?", "The revised size relationship and grouping emphasize the name and keep the date accessible.")
      ]),
    lesson("9–12", "Music", "Transpose the harbor call", "Transpose a short melody by moving every pitch the same number of semitones.",
      "A semitone is one step on a piano from a key to its nearest neighbor. E–F and B–C are each one semitone. Move C–D–E up two semitones and you get D–E–F♯. The melody’s intervals stay the same.", [
        round("Move C–E–G up two semitones for a higher bell set.", ["D–F–A", "D–F♯–A", "B–D–F"], 1, "Move E up to F, then one more semitone.", "C becomes D, E becomes F♯, and G becomes A."),
        round("Move G–A–B down two semitones for a lower horn.", ["F–G–A", "F–G♯–A", "A–B–C♯"], 0, "Shift each note the same distance down.", "G moves down to F, A to G, and B to A."),
        round("A film cue rises E–F–A. The director wants the same interval pattern starting on G. Which cue fits?", ["G–A–C", "G–A♭–C♯", "G–A♭–C"], 2, "E to G is up three semitones. Move each original note by three.", "E becomes G, F becomes A♭, and A becomes C. The first rise is still a semitone.")
      ])
  ];
})();
