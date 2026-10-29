/* Brightwake 1.0 / independent family pilot. Original questions, not copied courseware.
   A K–12 SAMPLE sequence, not complete standards coverage or grade certification. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.BrightwakeCurriculum=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const definitions=[
 ['count',0,'Count the lanterns','Number sense','Count each object once. The last number tells how many.'],
 ['compare',0,'Find the greater number','Number sense','Match objects in pairs. The set with objects left over is greater.'],
 ['sides',0,'Explore shape sides','Geometry','A side is a straight edge. Count around a closed shape once.'],
 ['add10',1,'Build a sum','Addition','Start with one group and add the next. You can count on from the larger group.'],
 ['sub10',1,'Find what remains','Subtraction','Subtraction finds how many remain after taking a group away.'],
 ['tens',1,'Tens and ones','Place value','A bundle of ten is one ten. Add single ones to find the total.'],
 ['add100',2,'Add across a ten','Addition','Combine tens and ones. Ten ones can be exchanged for one ten.'],
 ['sub100',2,'Subtract across a ten','Subtraction','Split a ten into ten ones when you need more ones to subtract.'],
 ['coins',2,'Count coin values','Money','A nickel is 5 cents and a dime is 10 cents. Add their values, not just their count.'],
 ['multiply',3,'Equal groups','Multiplication','Multiplication counts equal groups: number of groups × objects in each group.'],
 ['divide',3,'Share fairly','Division','Division asks how many go in each equal group, or how many groups can be made.'],
 ['perimeter',3,'Build a border','Geometry','Perimeter is the distance all the way around. Add every outside side.'],
 ['equivalent',4,'Equivalent fractions','Fractions','Multiply the numerator and denominator by the same nonzero number. The value stays the same.'],
 ['rectangle',4,'Measure area','Geometry','Cover a rectangle with unit squares. Rows × squares in each row gives area.'],
 ['angles',4,'Angles on a line','Geometry','Adjacent angles making a straight line add to 180 degrees.'],
 ['fracadd',5,'Add like fractions','Fractions','With equal denominators, add the numerators and keep the denominator. Simplify if you can.'],
 ['decadd',5,'Decimal cargo','Decimals','Line up the decimal points, then add matching place values.'],
 ['volume',5,'Fill the cargo hold','Geometry','A rectangular prism holds length × width × height cubic units.'],
 ['ratio',6,'Scale a recipe','Ratios','Keep equivalent ratios by multiplying both quantities by the same factor.'],
 ['percent',6,'Percent of a quantity','Percent','Percent means out of 100. Write it as a fraction of 100, then multiply.'],
 ['trianglearea',6,'Triangular sails','Geometry','A triangle has half the area of a rectangle with the same base and perpendicular height.'],
 ['signed',7,'Positive and negative','Integers','Adding a negative moves left on the number line; adding a positive moves right.'],
 ['scale',7,'Scale drawings','Geometry','Multiply a drawing length by its scale factor to find the real length.'],
 ['probability',7,'Chance lanterns','Probability','For equally likely outcomes, probability = favorable outcomes ÷ all outcomes.'],
 ['linear',8,'Solve a linear equation','Algebra','Keep an equation balanced: undo addition, then undo multiplication on both sides.'],
 ['pythagoras',8,'Right-triangle paths','Geometry','For a right triangle, a² + b² = c², where c is the hypotenuse.'],
 ['slope',8,'Slope of a route','Algebra','Slope is change in y divided by change in x. Use the same point order in both differences.'],
 ['distribute',9,'Distribute and solve','Algebra I','Distribute a factor to every term inside parentheses, or divide both sides before solving.'],
 ['systems',9,'Two linked equations','Algebra I','Subtract equations with equal y terms to remove y. Solve what remains.'],
 ['function',9,'Evaluate a function','Functions','Replace x with the input. Evaluate powers before multiplication and addition.'],
 ['circle',10,'Circular platforms','Geometry','Circle area is πr². Square the radius, not the diameter.'],
 ['similar',10,'Similar triangles','Geometry','Corresponding sides of similar triangles have equal scale factors.'],
 ['triangleangles',10,'Triangle angle reasoning','Geometry','Interior angles of a triangle add to 180 degrees. Subtract the two known angles.'],
 ['quadratic',11,'Quadratic roots','Algebra II','If x² = a positive number, there are positive and negative square roots. Read which root is requested.'],
 ['growth',11,'Exponential growth','Algebra II','Repeated multiplication produces exponential growth: initial amount × factor raised to time.'],
 ['trig',11,'Right-triangle trigonometry','Trigonometry','Sine of an angle = opposite side ÷ hypotenuse. sin(30°) = 1/2.'],
 ['logarithm',12,'Logarithms as exponents','Advanced functions','log₂(N) asks which exponent on 2 gives N. Logarithms undo exponentiation.'],
 ['series',12,'Arithmetic series','Sequences','For an arithmetic sequence, sum = number of terms × (first + last) ÷ 2.'],
 ['expected',12,'Expected value','Statistics','Expected value is the sum of each outcome multiplied by its probability.']
];
const math=definitions.map((d,i)=>({id:d[0],grade:d[1],title:d[2],domain:d[3],lesson:d[4],prerequisites:i?[definitions[i-1][0]]:[],coverage:'sample',standardContext:d[1]>=9?'High-school course sequence; grade placement varies':'K–8 topic reference; not full grade coverage'}));
// word | definition | example with blank | spelling support
const raw=[
`at|in a particular place|Meet me __ the gate.|Two letters: a, then t.
in|inside something|The toy is __ the box.|Two letters: i, then n.
cat|a small animal that meows|The __ sleeps on the rug.|Three sounds: /k/ /a/ /t/.
dog|an animal that barks|The __ wagged its tail.|Three letters: d, o, g.
sun|the star that lights our day|The __ is bright today.|The short u sound is in the middle.
map|a drawing that shows places|Use the __ to find the island.|Start with m and end with p.
pig|a farm animal with a snout|The __ played in the mud.|The short i sound is in the middle.
log|a thick piece of cut wood|Sit on the __ by the fire.|Start with l and end with g.`,
`ship|a large boat|The __ sailed into the harbor.|sh makes one sound at the beginning.
tree|a plant with a trunk and branches|A bird sat in the __.|ee spells the long e sound.
rain|water falling from clouds|The __ watered the garden.|ai spells the long a sound.
jump|to push yourself into the air|We can __ over the puddle.|Four letters: j, u, m, p.
frog|an animal that hops and croaks|The __ sat near the pond.|The word starts with the blend fr.
blue|the color of a clear daytime sky|She chose a __ ribbon.|The word ends in ue.
seed|a tiny plant starter|Plant the __ in the soil.|ee spells the long e sound.
play|to take part in a game|We can __ after lunch.|ay spells long a at the end.`,
`night|the dark part of the day|Stars appear at __.|igh spells the long i sound.
bright|giving a lot of light|The lantern is __.|The ending is ight.
float|to stay on top of water|The leaf can __ on the pond.|oa spells the long o sound.
small|not large in size|The __ shell fits in my hand.|The word ends with double l.
basket|a container woven from strips|Put the apples in the __.|Two syllables: bas-ket.
winter|the coldest season|Snow may fall in __.|Two syllables: win-ter.
shape|the form of an object|A triangle is a __.|Silent e makes the a long.
paint|colored material used to make pictures|Choose yellow __ for the sun.|ai spells the long a sound.`,
`because|for the reason that|We stayed inside __ it rained.|Break it into be-cause.
friend|someone you like and trust|My __ helped me.|Remember the ie in the middle.
mountain|a very high natural landform|Snow covered the __.|Break it into moun-tain.
garden|a place where plants are grown|We planted flowers in the __.|Two syllables: gar-den.
careful|taking care to avoid mistakes|Be __ with the glass.|care + ful; ful has one l.
rebuild|to build something again|We will __ the old bridge.|The prefix re- means again.
floating|staying on top of water or in air|A leaf is __ downstream.|float + ing; keep the oa.
triangle|a shape with three straight sides|The sail is a __.|tri- means three.`,
`disappear|to stop being visible|The fog made the island __.|dis + appear; appear has two p letters.
beautiful|very pleasing to see|The garden is __.|Remember beau at the start.
measure|to find the size or amount|Use a ruler to __ the board.|The middle letters are eas.
question|something asked to find out information|Please answer the __.|qu at the start; tion at the end.
remember|to bring something back to mind|I __ your name.|Three parts: re-mem-ber.
explorer|a person who discovers places|The __ found a new path.|explore + r.
possible|able to happen or be done|It is __ to fix the kite.|Double s, then ible.
fraction|a number representing part of a whole|One half is a __.|fract- relates to breaking into parts.`,
`curious|wanting to learn or know more|The __ child asked why.|Start with cur and end with ious.
decimal|a number written using a decimal point|Write one half as a __.|Three syllables: dec-i-mal.
discovery|finding something not known before|The new island was a __.|dis + cover + y.
valuable|worth a great deal or useful|Fresh water is __.|value loses e before able.
exercise|activity used to practice or become fit|Walking is good __.|Remember the c in the middle.
patient|able to wait calmly|Be __ while the seed grows.|The middle has ti.
ordinary|usual rather than special|It was an __ day.|Break it into or-di-na-ry.
geometry|mathematics about shapes and space|We studied angles in __.|geo + metry.`,
`achievement|something successfully accomplished|Finishing the model was an __.|achieve + ment; keep the e.
independent|able to act without help|The learner became more __.|in + dependent.
explanation|a statement that makes something clear|Your __ helped me understand.|explain changes to explan before ation.
responsible|able to be trusted to do what is right|The pilot is __ for the ship.|Ends in ible, not able.
convenient|easy to use or suitable|The new bridge is __.|Remember ven in the middle.
variable|a quantity that can change|In this equation x is a __.|vary changes to vari before able.
parallel|side by side and always the same distance apart|The two rails are __.|One r, then two l letters in the middle.
evidence|information supporting a conclusion|The photograph is __.|Three syllables: ev-i-dence.`,
`separate|to keep or move things apart|Please __ the colors.|The middle vowel is a: sep-a-rate.
necessary|required or needed|Water is __ for life.|One c, two s letters.
definite|clear and certain|We need a __ answer.|Remember finite inside the word.
privilege|a special right or advantage|It is a __ to lead the crew.|No d; the ending is lege.
environment|the surroundings of a living thing|We protect the __.|environ + ment.
curiosity|a desire to learn more|Her __ led to a discovery.|curious changes to curiosity.
knowledge|information and understanding|Reading builds __.|The first k is silent.
rhythm|a repeated pattern of beats|Tap the __ of the song.|r-h-y-t-h-m; no ordinary vowel letter.`,
`accommodate|to provide room for|The cabin can __ six people.|Two c letters and two m letters.
consequence|a result of an action|The broken wing was a __ of the crash.|con + sequence.
hypothesis|a proposed explanation that can be tested|Our __ predicts faster growth.|hypo + thesis.
perseverance|continuing despite difficulty|Her __ helped her finish.|per-se-ver-ance.
proportion|an equality of two ratios|Solve the __ to find the scale.|pro + portion.
relevant|closely connected to the topic|Choose __ evidence.|The ending is ant.
sufficient|enough for a purpose|We packed __ food.|Double f and the ending icient.
technique|a method of doing something|Try a new painting __.|The ending is nique.`,
`analysis|careful study of something|The data __ revealed a pattern.|ana + lysis.
coefficient|a number multiplying a variable|In 3x the __ is 3.|co + efficient; double f.
equivalent|equal in value|One half and two fourths are __.|equi means equal.
inference|a conclusion based on evidence|Your __ follows from the clues.|infer + ence.
phenomenon|an observable event|An eclipse is a natural __.|phe-nom-e-non.
significant|important or meaningful|The result is __.|sign + ificant.
symmetry|matching parts across a line or point|The butterfly shows __.|Double m; ends in etry.
transition|a change from one state to another|The __ to a new school went well.|trans + ition.`,
`ambiguous|having more than one possible meaning|The clue was __.|am-big-u-ous.
correlation|a relationship between changing quantities|We observed a __ in the data.|Double r and double l.
exponential|growing by a constant multiplying factor|The population showed __ growth.|exponent + ial.
legitimate|reasonable or lawful|That is a __ concern.|le-git-i-mate.
perpendicular|meeting at a right angle|The lines are __.|per-pen-dic-u-lar.
resilience|the ability to recover after difficulty|The team showed __.|Ends in ience.
sophisticated|complex or highly developed|The design is __.|so-phis-ti-cat-ed.
versatile|able to be used in many ways|This is a __ tool.|ver-sa-tile.`,
`conscientious|careful and guided by a sense of duty|The __ researcher checked every result.|con + scient + ious.
entrepreneur|a person who starts a business|The __ opened a workshop.|en-tre-pre-neur.
indispensable|absolutely necessary|Clean water is __.|Ends in able, not ible.
metamorphosis|a major change of form|A butterfly undergoes __.|meta + morph + osis.
plausible|seeming reasonable or possible|That is a __ explanation.|plau + sible.
reciprocal|the multiplicative inverse of a number|One fourth is the __ of four.|re-cip-ro-cal.
substantiate|to support a claim with evidence|Use data to __ the claim.|sub-stan-ti-ate.
unprecedented|never known or done before|The result was __.|un + precedent + ed.`,
`acquiescence|acceptance without protest|Her silence was taken as __.|ac + quies + cence.
corroborate|to support a statement with more evidence|The records __ the report.|Double r after co; one r near the end.
dichotomy|a division into two contrasting parts|The essay questions this __.|di + chotomy.
epistemology|the study of knowledge and how we know|The philosopher studied __.|episteme relates to knowledge; logy to study.
idiosyncrasy|a distinctive individual habit or feature|That unusual habit is an __.|idio + syncrasy; ends in sy.
juxtaposition|placing things side by side for contrast|The __ of colors is striking.|juxta + position.
paradigm|a model or pattern of thinking|The discovery changed the __.|The g is silent.
perspicacious|having keen understanding|The __ observer noticed the clue.|per-spi-ca-cious.`
];
const words=Object.fromEntries(raw.map((txt,g)=>[g,txt.split('\n').map(line=>{let [word,definition,example,hint]=line.split('|');return {word,definition,example,hint};})]));
return Object.freeze({version:'1.0.0',coverage:'sample-sequence-not-complete-curriculum',math,words,gradeLabel:g=>g===0?'K':String(g),sources:[{label:'Virginia mathematics framework (2023)',url:'https://www.doe.virginia.gov/teaching-learning-assessment/k-12-standards-instruction/mathematics'},{label:'High-school geometry content reference',url:'https://www.thecorestandards.org/Math/Content/HSG/'},{label:'IES: worked examples and spaced review',url:'https://ies.ed.gov/ncee/wwc/PracticeGuide/1'}]});
});
