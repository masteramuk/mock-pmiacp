const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const outputPath = path.join(rootDir, "data", "questions.json");

const outlineVersion = "PMI-ACP Examination Content Outline - October 2024";
const difficultyTargets = { easy: 240, medium: 360, hard: 600 };
const domainTargets = { Mindset: 336, Leadership: 300, Product: 228, Delivery: 336 };
const domainDifficultyTargets = {
  Mindset: { easy: 67, medium: 101, hard: 168 },
  Leadership: { easy: 60, medium: 90, hard: 150 },
  Product: { easy: 46, medium: 68, hard: 114 },
  Delivery: { easy: 67, medium: 101, hard: 168 }
};

const products = [
  "a mobile banking app",
  "an internal procurement portal",
  "a healthcare appointment platform",
  "an insurance claims product",
  "a logistics tracking dashboard",
  "a learning management portal",
  "a retail checkout service",
  "a field-service scheduling tool",
  "a government licensing website",
  "a travel booking experience",
  "a customer support platform",
  "a subscription billing service",
  "an HR onboarding workflow",
  "a manufacturing quality dashboard",
  "a nonprofit donor portal",
  "a telecom self-service app",
  "a warehouse replenishment tool",
  "a compliance reporting product"
];

const stakeholders = [
  "the product sponsor",
  "a compliance director",
  "the head of operations",
  "the customer success lead",
  "an executive steering group",
  "the sales director",
  "a regional business manager",
  "the enterprise architect",
  "a service desk manager",
  "the product owner",
  "an external customer representative",
  "a risk officer"
];

const teams = [
  "A cross-functional team",
  "A distributed delivery team",
  "A newly formed agile team",
  "An experienced product team",
  "A platform engineering team",
  "A team working with multiple vendors",
  "A team supporting a legacy modernization effort",
  "A product squad under a tight deadline",
  "A team scaling across several workstreams",
  "A team operating in a regulated environment"
];

const timePressures = [
  "A release milestone is only three weeks away.",
  "Senior leaders want visible progress before the next portfolio review.",
  "A critical customer commitment is approaching.",
  "Budget pressure is increasing scrutiny on every decision.",
  "Several teams are waiting on this capability.",
  "Recent defects have reduced stakeholder confidence.",
  "The market window for the opportunity is narrowing.",
  "Leadership wants faster learning without increasing delivery risk."
];

const tensions = [
  "Different stakeholders are advocating conflicting priorities.",
  "The team has partial information and several assumptions remain untested.",
  "The team wants to move quickly, but rework is becoming expensive.",
  "People are proposing actions that optimize locally rather than system-wide.",
  "There is pressure to make a firm commitment before enough evidence exists.",
  "The discussion is drifting toward activity instead of outcomes.",
  "The team has enough options to act, but not enough clarity to act blindly.",
  "The current approach is producing effort, but not clear confidence."
];

const metrics = [
  "cycle time",
  "lead time",
  "escaped defects",
  "customer satisfaction",
  "throughput",
  "work in progress",
  "release frequency",
  "flow efficiency",
  "defect escape rate",
  "predictability"
];

const scenarioTwists = [
  "A recently released change has shifted stakeholder expectations.",
  "A dependency outside the team is adding uncertainty to planning.",
  "A recent demonstration created more questions than answers.",
  "The team has evidence that some assumptions are still weak.",
  "A senior stakeholder wants a firmer commitment than the data currently supports.",
  "The current plan looks busy, but not yet convincingly valuable.",
  "A previous attempt solved part of the problem but created new learning.",
  "The backlog is active, yet the desired outcome is still not fully secure.",
  "Recent feedback suggests the original plan may need adjustment.",
  "The team is balancing delivery pressure with the need for better evidence.",
  "There is visible effort, but not enough shared confidence in the direction.",
  "A decision made last month is now being questioned by new data."
];

const operatingContexts = [
  "The work spans multiple business and technical groups.",
  "Several people are available to help, but alignment is uneven.",
  "The team is trying to improve without losing momentum.",
  "Recent delivery has exposed weaknesses in the current way of working.",
  "The environment is changing faster than the original assumptions.",
  "Stakeholders are supportive, but they are not fully aligned.",
  "The product has active users who are sensitive to delivery quality.",
  "The organization wants better predictability without sacrificing agility.",
  "The team can make progress quickly if it chooses the next step well.",
  "The team is working in a context where trust must be maintained carefully.",
  "The situation is manageable, but only if the next decision is deliberate.",
  "The team needs a response that supports both near-term progress and long-term learning."
];

const stakeholderPrompts = [
  "The agile practitioner is asked what should happen next.",
  "The team wants a recommendation before the next planning decision is made.",
  "Stakeholders want the next step framed in practical agile terms.",
  "The scrum master asks for the most appropriate response.",
  "The product owner asks for the best next action.",
  "Leadership wants the team to respond without losing agility."
];

const artifactReferences = {
  "Experiment Early": ["a hypothesis statement", "a lightweight experiment plan", "the next thin-slice release", "a pilot increment"],
  "Embrace Agile Mindset": ["the release forecast", "the planning approach", "the current governance expectation", "the team delivery model"],
  "Promote Collaborative Team Environment": ["the team working agreement", "the retrospective action plan", "the team charter", "the coordination approach"],
  "Build Transparency": ["the team dashboard", "the information radiator", "the flow board", "the status communication approach"],
  "Foster Psychological Safety": ["the retrospective format", "the facilitation approach", "the meeting norms", "the feedback practice"],
  "Shorten Feedback Loops": ["the demo cadence", "the experiment cycle", "the review schedule", "the stakeholder feedback path"],
  "Embrace Change": ["the backlog", "the release plan", "the priority order", "the team skill plan"],
  "Empower Teams": ["the team decision model", "the coaching approach", "the escalation path", "the ownership model"],
  "Facilitate Problem Resolution": ["the incident analysis", "the root-cause discussion", "the mitigation plan", "the issue response"],
  "Promote Knowledge Sharing": ["the lessons-learned practice", "the knowledge base", "the cross-team learning forum", "the community of practice"],
  "Promote agile mindset principles and practices": ["the team coaching plan", "the improvement backlog", "the recognition approach", "the agile enablement effort"],
  "Promote shared vision and purpose": ["the product vision", "the roadmap discussion", "the prioritization conversation", "the goal-setting workshop"],
  "Facilitate conflict management": ["the conflict discussion", "the team facilitation approach", "the decision workshop", "the stakeholder alignment session"],
  "Refine product backlog": ["the backlog refinement session", "the upcoming sprint candidates", "the story-splitting discussion", "the backlog readiness review"],
  "Manage increments": ["the increment goal", "the release decision", "the demo scope", "the next value slice"],
  "Visualize work": ["the work board", "the delivery dashboard", "the visual management approach", "the status board"],
  "Manage value delivery": ["the value definition", "the success measures", "the outcome review", "the prioritization criteria"],
  "Seek early feedback": ["the review cadence", "the user validation plan", "the stakeholder feedback loop", "the next demo"],
  "Manage agile metrics": ["the team dashboard", "the portfolio report", "the metrics review", "the flow measurement approach"],
  "Manage impediments and risk": ["the risk board", "the impediment log", "the mitigation plan", "the dependency review"],
  "Recognize and eliminate waste": ["the value stream map", "the flow analysis", "the waste review", "the improvement backlog"],
  "Perform continuous improvements": ["the retrospective action list", "the improvement experiment", "the process change review", "the next improvement target"],
  "Actively engage customers": ["the customer conversation", "the acceptance review", "the user collaboration approach", "the customer validation plan"],
  "Optimize flow": ["the WIP policy", "the flow metrics review", "the interruption policy", "the pull-system rules"]
};

const easyStemTemplates = [
  "Which action best aligns with {task}?",
  "What is the best next step to support {task}?",
  "Which response most closely reflects {task}?"
];

const easyStemTemplatesMultiple = [
  "Which TWO actions best align with {task}?",
  "Which TWO responses best support {task}?",
  "Which TWO choices most closely reflect {task}?"
];

const mediumStemTemplates = [
  "What should the agile practitioner do next to support {task}?",
  "Which response best supports {task} in this situation?",
  "What is the most appropriate next action to reinforce {task}?"
];

const mediumStemTemplatesMultiple = [
  "Which TWO responses best support {task} in this situation?",
  "Which TWO actions should the agile practitioner take next to reinforce {task}?",
  "Which TWO choices are most appropriate if the team wants to support {task}?"
];

const hardStemTemplatesSingle = [
  "Which approach best aligns with {task} while protecting long-term value?",
  "What is the strongest response if the practitioner wants to apply {task} well?",
  "Which action is most appropriate if the team wants to honor {task} without creating more risk?"
];

const hardStemTemplatesMultiple = [
  "Which TWO actions best align with {task} while protecting long-term value?",
  "Which TWO responses best reflect {task} in this situation?",
  "Which TWO actions are the strongest choices if the practitioner wants to apply {task} well?"
];

const hardScenarioTemplates = [
  "{team} is working on {product}. {focus} {pressure} {stakeholderSentence} {tension} {twist} {operatingContext} Recent trends tied to {artifact} show that {metric} has moved by about {metricShift}% across the last {timeWindow} iterations, is affecting {impactedGroups} connected groups, and now influences roughly {pilotUsers} users. {stakeholderPrompt} {stem}",
  "While {team} works on {product}, {focusLower} {pressure} {tension} {operatingContext} {stakeholderSentence} Recent trends connected to {artifact} show a {metricShift}% movement in {metric} across the last {timeWindow} iterations, with impact now reaching about {pilotUsers} users across {impactedGroups} connected groups. {twist} {stakeholderPrompt} {stem}",
  "{team} is supporting {product}. {stakeholderSentence} {focus} {twist} {pressure} {operatingContext} The current discussion around {artifact} is happening while {metric} has shifted by about {metricShift}% over the last {timeWindow} iterations and the effect is now being felt by roughly {pilotUsers} users across {impactedGroups} connected groups. {tension} {stakeholderPrompt} {stem}"
];

const distractorTemplates = [
  "{value}",
  "{value} for now and revisit broader changes later",
  "{value} so the team can protect near-term predictability",
  "{value} before reopening the discussion with stakeholders",
  "{value} to keep the current delivery plan stable"
];

const taskConfigs = [
  {
    domain: "Mindset",
    task: "Experiment Early",
    focus: [
      "The team is debating whether to build a large feature set before validating the riskiest assumption.",
      "A promising idea has executive support, but the user need is still partly unverified.",
      "The product group wants certainty even though the value hypothesis has not been tested in production.",
      "A new capability looks attractive, but the team has not yet gathered behavioral evidence from real users.",
      "The sponsor wants confidence that the problem is worth solving before significant investment continues."
    ],
    correct: [
      "define the smallest experiment that can validate the key assumption before scaling delivery",
      "build a thin slice that tests the hypothesis with real users and measurable outcomes",
      "limit the next increment to the highest-risk assumption and inspect the evidence quickly",
      "treat the next release as a learning experiment and measure whether the expected behavior changes",
      "reduce scope to a minimum viable test that produces evidence instead of opinions",
      "seek market or solution validation early by delivering a small, testable increment"
    ],
    incorrect: [
      "approve the full feature scope first so the team avoids changing direction later",
      "delay customer exposure until every edge case has been designed and estimated",
      "ask stakeholders to rank assumptions without testing them in the product",
      "treat executive confidence as a substitute for evidence from real usage",
      "commit the entire roadmap before the highest-risk assumption is validated",
      "increase documentation detail so the solution feels more predictable",
      "optimize utilization by starting all requested features at once",
      "wait until after the major release to test whether the idea solves the right problem"
    ],
    explanation:
      "The latest PMI-ACP outline emphasizes experimenting early by validating solution or market need with a small increment and fast feedback."
  },
  {
    domain: "Mindset",
    task: "Embrace Agile Mindset",
    focus: [
      "A traditional governance group is asking the team for fixed scope and fixed certainty in a complex environment.",
      "People are debating whether the work should be treated as predictive or adaptive.",
      "The team is facing uncertainty, but several leaders still want decisions made as if the work were fully knowable.",
      "A delivery approach needs to match the complexity of the work rather than habit or hierarchy.",
      "Stakeholders are pushing for certainty even though emerging requirements are likely."
    ],
    correct: [
      "apply agile values and principles to choose an adaptive response rather than forcing false certainty",
      "classify the work based on complexity and tailor the approach to fit the actual conditions",
      "use a suitable complexity lens and adapt planning to the level of uncertainty present",
      "interpret the situation empirically and choose an agile approach that supports learning and responsiveness",
      "use an agile suitability view to select the most appropriate way of working for the context",
      "favor transparency, adaptation, and collaboration instead of preserving an unrealistic plan"
    ],
    incorrect: [
      "standardize on one delivery model for every situation regardless of complexity",
      "lock the team into a fixed plan because governance prefers predictability",
      "treat emergent work as fully predictable to simplify reporting",
      "defer all adaptation until the release is complete",
      "require complete upfront detail before beginning any meaningful work",
      "choose the method preferred by the most senior stakeholder without assessing context",
      "use velocity targets to prove the work is no longer complex",
      "separate planning from learning so the team does not appear indecisive"
    ],
    explanation:
      "Embracing the agile mindset means applying agile values, principles, and context-aware methods rather than forcing certainty where complexity and learning dominate."
  },
  {
    domain: "Mindset",
    task: "Promote Collaborative Team Environment",
    focus: [
      "The team is split into functional silos and decisions are being optimized locally.",
      "A group of specialists is working efficiently as individuals but poorly as a team.",
      "Retrospectives identify silo behavior, but collaboration is not improving.",
      "Several teams need to work together, yet each group is protecting its own backlog first.",
      "The team has technical skill but weak shared ownership."
    ],
    correct: [
      "establish working agreements and reinforce shared ownership of goals and decisions",
      "use collaboration practices that reduce silos and strengthen joint accountability",
      "help the team co-create a shared vision for how work will be delivered together",
      "use retrospective findings to improve collaboration patterns rather than blaming individuals",
      "encourage cross-skilling and teamwork so value can flow across specialties",
      "tailor team collaboration practices based on the team’s current agile maturity"
    ],
    incorrect: [
      "assign work permanently by specialty so handoffs stay efficient and predictable",
      "let each function optimize its own queue as long as local utilization remains high",
      "remove collaborative ceremonies to give individuals more uninterrupted time",
      "keep decisions with the lead specialist to reduce disagreement",
      "avoid discussing team norms until performance metrics decline further",
      "treat retrospective issues as personal weaknesses rather than system behaviors",
      "focus only on individual productivity because team dynamics are hard to measure",
      "encourage parallel priorities so every specialty stays fully busy"
    ],
    explanation:
      "The updated PMI-ACP outline expects practitioners to build collaborative environments with working agreements, high-performing team behaviors, and fewer silos."
  },
  {
    domain: "Mindset",
    task: "Build Transparency",
    focus: [
      "Stakeholders are surprised late because progress and risks have not been visible.",
      "Important impediments are known inside the team but not radiated to others.",
      "A distributed team is sharing updates inconsistently, which creates confusion and rework.",
      "Decision makers want to help, but they cannot see current status, risks, or learning clearly.",
      "The team has data, but it is not being made accessible in a useful way."
    ],
    correct: [
      "make progress, risks, and impediments visible through shared information radiators",
      "create a feedback loop that keeps status and learning accessible to everyone who needs it",
      "define a communication strategy that works for both distributed and co-located collaborators",
      "radiate process and outcome information so stakeholders can respond early instead of late",
      "increase visibility of current state and learning rather than waiting for formal milestone reports",
      "use transparent communication channels so the team and stakeholders inspect reality together"
    ],
    incorrect: [
      "share status only after it is certain so stakeholders do not overreact",
      "limit progress information to project leadership to avoid distracting the team",
      "hide impediments until a recovery plan is fully approved",
      "replace visual transparency with private status summaries",
      "reduce stakeholder access to metrics because the data may be misunderstood",
      "report only completed scope because partial information can create questions",
      "centralize updates through one person so feedback arrives less often",
      "keep risk information local to the team until the sprint review"
    ],
    explanation:
      "Transparency in the current PMI-ACP outline means making status, risks, process, and learning accessible through deliberate communication and feedback loops."
  },
  {
    domain: "Mindset",
    task: "Foster Psychological Safety",
    focus: [
      "People are becoming quiet in planning and retrospective sessions.",
      "Team members hesitate to challenge assumptions because mistakes are judged harshly.",
      "Debates are becoming defensive, and learning is slowing down.",
      "A few strong voices dominate conversations while others withdraw.",
      "The team says the process is safe, but behavior shows fear of speaking up."
    ],
    correct: [
      "promote objective discussion and a no-blame culture so issues can be surfaced early",
      "encourage dialogue and constructive feedback rather than debate for the sake of winning",
      "create conditions where people can challenge the status quo without fear",
      "model curiosity and invite different perspectives before converging on a decision",
      "act on feedback so the team sees that speaking up leads to improvement",
      "use facilitation practices that make it safer for all voices to be heard"
    ],
    incorrect: [
      "keep meetings short by letting the most experienced people make the difficult calls",
      "avoid discussing mistakes in team settings so morale stays high",
      "use management escalation when someone questions the current approach too strongly",
      "discourage disagreement once a preferred solution begins to emerge",
      "tell quieter members to be more confident without changing the environment",
      "treat conflict as a sign that the team is not ready for self-management",
      "reward speed of agreement over depth of discussion",
      "limit feedback to annual reviews so people are not overwhelmed"
    ],
    explanation:
      "Psychological safety supports experimentation, learning, and honest feedback. The PMI-ACP outline explicitly highlights no-blame culture, dialogue, and constructive feedback."
  },
  {
    domain: "Mindset",
    task: "Shorten Feedback Loops",
    focus: [
      "The team receives stakeholder feedback only near release time.",
      "Important assumptions are being discovered too late to change course cheaply.",
      "A long approval chain is slowing the learning cycle between delivery and response.",
      "The team is building steadily, but evidence arrives too late to influence decisions.",
      "Customers are engaged, but only after large increments are already complete."
    ],
    correct: [
      "involve stakeholders from the beginning and deliver smaller increments for faster feedback",
      "shorten the time between delivery and learning by using small, inspectable slices",
      "use techniques such as design thinking or lean startup to learn sooner",
      "maximize value within the available timeframe by reducing delay in feedback",
      "create feedback points earlier in the work rather than waiting for a full release",
      "optimize for fast learning by decreasing batch size and increasing inspection frequency"
    ],
    incorrect: [
      "bundle more features into each review so stakeholders can react to the whole solution",
      "protect the team from feedback until the design is finalized",
      "reduce stakeholder touchpoints because changing direction midstream is costly",
      "treat faster feedback as unnecessary if internal testing is thorough",
      "wait until the major launch before involving external users",
      "measure team efficiency by how little outside feedback interrupts development",
      "increase sign-off gates so stakeholders have more confidence before seeing increments",
      "focus on completing scope first and feedback second"
    ],
    explanation:
      "Short feedback loops reduce risk and improve value delivery. The updated outline calls for stakeholder inclusion from day one and techniques that accelerate learning."
  },
  {
    domain: "Mindset",
    task: "Embrace Change",
    focus: [
      "The backlog is evolving as the team learns more about the product and users.",
      "Requirements are shifting because recent delivery changed stakeholder understanding.",
      "Leaders want the team to stop changing direction even though evidence has changed.",
      "A new dependency and fresh user data are forcing the team to re-evaluate priorities.",
      "The team is unsure how much adaptation is healthy versus disruptive."
    ],
    correct: [
      "respond to new learning by adapting priorities and the approach rather than preserving outdated plans",
      "promote a growth mindset so change is treated as information rather than failure",
      "encourage cross-skilling so the team can adapt to changing product needs",
      "use feedback and learning to adjust the work in a controlled and transparent way",
      "model adaptability and help the team respond to change without losing coherence",
      "revise the plan based on evidence while keeping the team aligned on current goals"
    ],
    incorrect: [
      "freeze requirements once work starts so the team can protect commitment credibility",
      "treat changes as exceptions that require leadership approval by default",
      "defer all new learning to the next release cycle to avoid disruption",
      "shield the backlog from updates because frequent change confuses the team",
      "keep specialists in narrow roles even when cross-skills would improve adaptability",
      "maintain the original plan unless a formal escalation proves it was wrong",
      "use change volume as evidence that agile is not working",
      "stop reviewing feedback once the release roadmap is published"
    ],
    explanation:
      "The latest PMI-ACP outline expects practitioners to embrace change with a growth mindset, adaptive priorities, and broader team capability."
  },
  {
    domain: "Leadership",
    task: "Empower Teams",
    focus: [
      "The team waits for leadership approval before making routine delivery decisions.",
      "Members are capable but hesitant to take ownership of outcomes.",
      "The scrum master is solving problems for the team instead of building team capability.",
      "People are looking upward for permission instead of inward toward shared ownership.",
      "The team wants autonomy, but trust and confidence are still fragile."
    ],
    correct: [
      "build trust, coach the team, and shift decision making closer to the people doing the work",
      "promote collective ownership of goals and help the team grow its own capability",
      "use coaching and mentoring appropriately so the team becomes less dependent on leaders",
      "encourage experimentation and responsible risk taking within clear team goals",
      "apply emotional intelligence to support autonomy, empathy, and healthy team behavior",
      "create an environment where the team can own decisions and learn from outcomes"
    ],
    incorrect: [
      "keep approval with the agile lead until the team proves it never makes mistakes",
      "assign individual targets first and let ownership emerge later",
      "centralize planning and estimation to prevent inconsistent decisions",
      "use authority to speed decisions rather than developing team judgment",
      "provide answers quickly so the team does not waste time learning",
      "separate coaching from real work because delivery pressure is too high",
      "discourage risk taking because empowerment can reduce predictability",
      "let only senior specialists represent the team in key discussions"
    ],
    explanation:
      "Leadership in the current PMI-ACP outline emphasizes trust, coaching, mentoring, and collective ownership rather than dependency on a single leader."
  },
  {
    domain: "Leadership",
    task: "Facilitate Problem Resolution",
    focus: [
      "A recurring issue keeps returning, but each incident is being treated as separate.",
      "The team is reacting quickly to symptoms while the underlying cause remains unclear.",
      "Several people have proposed fixes, yet no one has examined the root of the problem.",
      "The problem spans functions and is unlikely to be solved by one local optimization.",
      "A visible delivery issue needs a timely solution that adds real value."
    ],
    correct: [
      "investigate root cause with the team and choose the resolution that adds the most value",
      "facilitate analysis of the underlying problem before selecting the next action",
      "use a root-cause technique with the team and resolve the issue in a timely way",
      "help the team identify the most valuable resolution rather than reacting only to symptoms",
      "guide the team through structured problem solving so recurrence is less likely",
      "focus the team on cause, resolution value, and timely follow-through"
    ],
    incorrect: [
      "apply the fastest workaround and postpone root-cause analysis indefinitely",
      "let the loudest stakeholder define the problem without team analysis",
      "treat every recurrence as a new issue unrelated to the earlier incidents",
      "optimize for short-term speed even if the same issue will likely return",
      "choose the resolution that is easiest to explain to leadership rather than most effective",
      "wait until the release is complete before solving cross-team problems",
      "assign blame first so accountability is clear before analysis begins",
      "move the issue to another backlog to reduce pressure on the current team"
    ],
    explanation:
      "The leadership domain expects practitioners to facilitate timely, value-focused problem resolution rooted in true cause analysis."
  },
  {
    domain: "Leadership",
    task: "Promote Knowledge Sharing",
    focus: [
      "Critical knowledge is concentrated in a small group, creating bottlenecks and risk.",
      "Lessons from incidents and delivery experiments are not being reused.",
      "The team is solving similar problems repeatedly because learning is not being shared.",
      "Useful practices exist elsewhere in the organization, but this team is not leveraging them.",
      "People are busy delivering and keep postponing knowledge sharing."
    ],
    correct: [
      "create space and mechanisms for lessons learned, shared practices, and organizational learning",
      "capture useful knowledge and make time for the team to share and update it",
      "leverage communities of practice or similar mechanisms to spread what the team learns",
      "use organizational knowledge assets so the team does not solve the same problem repeatedly",
      "promote regular knowledge exchange that strengthens team capability and continuity",
      "allocate explicit time for documenting and sharing important learning"
    ],
    incorrect: [
      "protect experts from interruption by limiting how often they share knowledge",
      "rely on informal memory because documentation slows delivery",
      "treat lessons learned as useful only at the end of the project",
      "avoid communities of practice because teams should remain self-contained",
      "keep specialized knowledge with the most qualified people to maximize efficiency",
      "share only success stories because failures can damage confidence",
      "wait until capacity improves before building any knowledge-sharing habit",
      "assume reuse will happen naturally without a deliberate mechanism"
    ],
    explanation:
      "Promoting knowledge sharing reduces bottlenecks and accelerates learning. The latest outline highlights lessons learned, communities of practice, and using organizational assets."
  },
  {
    domain: "Leadership",
    task: "Promote agile mindset principles and practices",
    focus: [
      "Some leaders support agile ceremonies but not agile behaviors.",
      "The team is using agile terminology without consistent agile thinking.",
      "Improvement stalls because people treat agile as a process checklist.",
      "Several managers say they want agility, but they still reward non-agile behaviors.",
      "The team needs reinforcement of agile values in daily choices."
    ],
    correct: [
      "create awareness of agile values and reinforce behavior that reflects those principles",
      "foster an environment of continuous improvement and celebrate agile behaviors when they appear",
      "connect agile practices back to the mindset and principles they are meant to support",
      "encourage the team and stakeholders to recognize and repeat behaviors that strengthen agility",
      "teach why agile principles matter so practices are not reduced to ceremonies alone",
      "reinforce continuous improvement through daily examples, coaching, and recognition"
    ],
    incorrect: [
      "measure agile adoption mainly by whether ceremonies occur on schedule",
      "avoid discussing mindset because visible practices are easier to standardize",
      "reward local heroics even when they undermine team learning and flow",
      "treat continuous improvement as optional once velocity stabilizes",
      "focus communication on process compliance more than outcomes or principles",
      "assume the team understands agile values if it can recite the framework terms",
      "limit coaching to new employees because experienced staff should already know agile",
      "keep recognition tied only to individual output regardless of team impact"
    ],
    explanation:
      "Leadership in the current outline includes creating awareness of agile values and reinforcing behaviors that support continuous improvement and real agility."
  },
  {
    domain: "Leadership",
    task: "Promote shared vision and purpose",
    focus: [
      "Different stakeholder groups interpret the product goals differently.",
      "The team is busy delivering work, but the reason behind the work is becoming unclear.",
      "Competing priorities keep reappearing because the vision is not consistently understood.",
      "The backlog is growing, but alignment to organizational goals is weakening.",
      "Teams are active, yet purpose and direction are not equally visible to everyone."
    ],
    correct: [
      "build a common understanding of purpose and keep the product aligned to the vision",
      "reconnect stakeholders and the team to the shared vision before prioritizing more work",
      "continuously communicate vision and ensure backlog decisions support organizational goals",
      "use the product vision as a guide for alignment across stakeholders and teams",
      "clarify the intended outcome so trade-off decisions can be made consistently",
      "make the purpose explicit and use it to evaluate backlog and delivery choices"
    ],
    incorrect: [
      "let each stakeholder group interpret the vision in the way that best suits its needs",
      "defer vision discussions until after current delivery pressure eases",
      "optimize backlog size first because strong execution will clarify purpose later",
      "focus on immediate tasks rather than the product purpose to keep momentum high",
      "allow the loudest sponsor to redefine the goal whenever priorities shift",
      "treat organizational goals as separate from day-to-day product decisions",
      "communicate the vision only at kickoff to avoid repetitive messaging",
      "keep the team focused on output and let leaders manage the purpose separately"
    ],
    explanation:
      "The latest PMI-ACP outline expects leaders to promote shared vision and purpose so backlog and delivery decisions stay aligned with organizational goals."
  },
  {
    domain: "Leadership",
    task: "Facilitate conflict management",
    focus: [
      "Conflict is slowing decisions and starting to affect collaboration.",
      "Two groups want different solutions, and the disagreement is becoming personal.",
      "The team is avoiding an important disagreement rather than resolving it productively.",
      "A conflict over approach is escalating because people are arguing positions, not causes.",
      "The issue is real, but the team is not yet addressing the root of the disagreement."
    ],
    correct: [
      "identify the root cause and facilitate a collaborative resolution with the people involved",
      "separate the issue from personalities and guide the team toward a joint solution",
      "address the level and source of the conflict before choosing a response",
      "use a collaborative conflict approach that preserves trust and supports delivery",
      "help the team examine interests and underlying causes instead of debating positions only",
      "facilitate constructive resolution so the conflict leads to learning rather than damage"
    ],
    incorrect: [
      "escalate the disagreement immediately so a manager can make the final call",
      "avoid the topic in ceremonies until emotions naturally cool down",
      "let the more senior person decide so the team can move on quickly",
      "treat all conflict as harmful and suppress open disagreement",
      "move the disagreeing people to separate work to reduce friction",
      "focus on who is correct before understanding what the disagreement is really about",
      "wait until the sprint ends to discuss the issue in detail",
      "resolve the conflict privately without involving the affected team members"
    ],
    explanation:
      "The leadership domain expects practitioners to identify the cause and level of conflict, then facilitate collaborative resolution rather than suppressing or escalating by default."
  },
  {
    domain: "Product",
    task: "Refine product backlog",
    focus: [
      "The next set of backlog items is too vague for reliable near-term planning.",
      "Stories are large, unclear, and hard for the team to size confidently.",
      "Stakeholders want fast commitment, but backlog readiness is uneven.",
      "Important backlog items are valuable, yet not clear enough to flow into delivery smoothly.",
      "The team needs a better shared understanding of upcoming work."
    ],
    correct: [
      "clarify, decompose, and collaboratively size the backlog items before committing them",
      "refine the highest-priority items with stakeholders so the team can plan with confidence",
      "split large items into smaller pieces and align on what each item means",
      "improve backlog readiness by clarifying intent, priority, and size together",
      "focus refinement on near-term items so planning is based on a shared understanding",
      "work with the team and stakeholder to make top items clear, smaller, and better sized"
    ],
    incorrect: [
      "accept large unclear items so the sprint can begin sooner",
      "size all backlog items in full detail before learning more about them",
      "defer clarification until the team is already implementing the work",
      "treat backlog refinement as optional if the team has domain expertise",
      "prioritize based on stakeholder influence rather than value and clarity",
      "avoid splitting items because larger stories preserve business context better",
      "move unclear work into the sprint and let the team discover scope during execution",
      "treat sizing as a management task rather than a team conversation"
    ],
    explanation:
      "The Product domain in the latest outline expects practitioners to clarify, prioritize, decompose, and collectively size backlog items."
  },
  {
    domain: "Product",
    task: "Manage increments",
    focus: [
      "The team can only finish part of the requested scope before the planned release point.",
      "Stakeholders want confidence that the next increment is tied to real business priorities.",
      "An increment is ready to demonstrate, but some stakeholders still want more bundled into it.",
      "The team needs to decide what the next increment should optimize for.",
      "A release decision is approaching, and the increment must reflect the right goal."
    ],
    correct: [
      "align the increment to current business priorities and define a clear increment goal",
      "demonstrate a valuable increment early and measure whether it achieved the intended outcome",
      "shape the increment around the most important business need rather than raw volume of scope",
      "ensure the next increment produces value that stakeholders can inspect and respond to",
      "define the increment goal explicitly so trade-offs can be made against business priorities",
      "measure the delivered increment against the outcome it was intended to support"
    ],
    incorrect: [
      "maximize the amount of scope in the increment even if the goal becomes unclear",
      "delay all demonstrations until every dependent story is also complete",
      "treat any completed output as equally valuable as long as utilization stays high",
      "prioritize the increment mainly by technical convenience rather than business need",
      "hide partially valuable increments until the full workflow is ready",
      "define the increment after delivery so the team can stay flexible",
      "optimize for story count rather than alignment to business priorities",
      "measure success by effort spent rather than value delivered"
    ],
    explanation:
      "Managing increments in the latest PMI-ACP outline means defining increment goals, aligning them to business priorities, demonstrating value early, and measuring the result."
  },
  {
    domain: "Product",
    task: "Visualize work",
    focus: [
      "People have different opinions about current progress because work status is not easy to see.",
      "The backlog is active, but the actual state of work across the flow is unclear.",
      "Stakeholders ask for updates because existing reports do not show what is really happening.",
      "The team has data, but the work system is not visible enough for decisions.",
      "Handoffs and waiting time are increasing, yet the work picture remains fuzzy."
    ],
    correct: [
      "visualize the work clearly and establish how the data will be updated and shared",
      "use a shared work visualization so the team and stakeholders can inspect reality together",
      "define a simple process for keeping work status current and visible",
      "make the work system transparent enough that decisions can be based on actual flow",
      "educate the team and stakeholders on how to read the work visualization consistently",
      "continuously share updated work status through a visible and trusted representation"
    ],
    incorrect: [
      "replace visual work management with occasional summary meetings",
      "show only completed items because in-progress work can cause unnecessary questions",
      "keep detailed work status within the team to avoid stakeholder micromanagement",
      "allow each subgroup to maintain its own view without a shared picture",
      "prioritize better formatting over keeping the visualization current",
      "wait for the next release checkpoint before updating work statistics",
      "use one static report so everyone sees the same information less often",
      "avoid educating stakeholders on work visualization to prevent misinterpretation"
    ],
    explanation:
      "The Product domain explicitly includes visualizing work, defining how the data is updated, and continuously sharing that information."
  },
  {
    domain: "Product",
    task: "Manage value delivery",
    focus: [
      "The team is delivering features, but stakeholders disagree on whether the right outcomes are being achieved.",
      "A release is progressing, yet success criteria have not been made explicit.",
      "Several valuable options exist, but the team needs a better definition of what value means here.",
      "Leadership wants to know whether recent delivery is actually moving the intended result.",
      "A product change must balance business goals with sustainability, compliance, and customer impact."
    ],
    correct: [
      "define clear value criteria and optimize increments to achieve the intended result",
      "clarify what value means in this context and use that to guide delivery trade-offs",
      "measure whether the targeted outcome is being achieved rather than assuming delivered scope equals value",
      "include success criteria such as compliance, sustainability, or customer outcomes when defining value",
      "optimize delivery for the result that matters most instead of maximizing unrelated output",
      "validate that value is being achieved and adjust the product decisions when it is not"
    ],
    incorrect: [
      "assume stakeholder requests automatically define value without further clarification",
      "treat all completed features as equal if they were delivered on time",
      "focus on scope completion and postpone outcome measurement until much later",
      "optimize the backlog for development convenience rather than intended results",
      "avoid defining success criteria because value can be interpreted after release",
      "separate compliance and sustainability concerns from value discussions",
      "report value mainly through effort spent and velocity gained",
      "keep delivering the same way once the first increment is accepted"
    ],
    explanation:
      "Managing value delivery in the current PMI-ACP outline means defining what value looks like, optimizing increments for it, and checking whether targeted results are achieved."
  },
  {
    domain: "Delivery",
    task: "Seek early feedback",
    focus: [
      "The team is delivering regularly, but customer feedback still arrives too late.",
      "A feature is progressing, yet the team has not validated whether users are satisfied with the direction.",
      "Stakeholder input is being collected mainly after large batches are already done.",
      "Delivery pace is steady, but learning from customers is lagging behind development.",
      "The team wants to reduce the chance of building the wrong thing for too long."
    ],
    correct: [
      "deliver smaller increments and gather stakeholder feedback on a regular cadence",
      "evaluate customer satisfaction early instead of waiting for a larger release milestone",
      "collect and incorporate feedback continuously while the cost of change is still low",
      "create a review rhythm that helps the team adjust based on early response",
      "seek usable feedback as part of delivery, not only after delivery is complete",
      "shorten the path from delivery to stakeholder reaction so the team can learn sooner"
    ],
    incorrect: [
      "bundle more scope per release so stakeholders can evaluate the full solution at once",
      "use internal approval as a substitute for customer feedback",
      "limit feedback to final acceptance so the team does not change course too often",
      "prioritize delivery speed over learning because feedback slows momentum",
      "collect feedback only when stakeholders explicitly request a review",
      "wait until all dependencies are complete before showing any work",
      "avoid exposing partial solutions because they may create temporary confusion",
      "treat customer satisfaction as a post-release support measure only"
    ],
    explanation:
      "The Delivery domain emphasizes early feedback through small increments, frequent stakeholder input, and real customer satisfaction signals."
  },
  {
    domain: "Delivery",
    task: "Manage agile metrics",
    focus: [
      "Different audiences are asking for metrics, but not all of them need the same view.",
      "The team has metrics available, but people are not using them effectively for decisions.",
      "A dashboard exists, yet important insights are being missed or misread.",
      "Leaders want reassurance, while the team wants metrics that actually improve delivery.",
      "Data is available, but it is not yet guiding the right conversations."
    ],
    correct: [
      "choose metrics appropriate for the audience and use them to guide decisions",
      "radiate relevant metrics clearly and inspect the insights with the people who need them",
      "analyze the metrics regularly and use them to decide what to improve next",
      "present metrics in a way that supports action rather than vanity reporting",
      "match the metric to the decision being made instead of reporting everything to everyone",
      "use metrics as a learning tool for the system rather than a simple performance score"
    ],
    incorrect: [
      "use the same metrics for all audiences so reporting stays simple",
      "prioritize metrics that make the team look productive even if they do not inform action",
      "hide unstable metrics until the trend improves",
      "collect more metrics before deciding whether any are useful",
      "focus on velocity alone because it is the easiest metric to explain",
      "avoid reviewing metrics with the team to prevent defensive reactions",
      "optimize dashboards for leadership comfort rather than delivery decisions",
      "treat metrics as a compliance requirement rather than a learning aid"
    ],
    explanation:
      "The updated outline expects practitioners to choose suitable metrics for the audience, radiate them well, analyze them, and use the insights in decision making."
  },
  {
    domain: "Delivery",
    task: "Manage impediments and risk",
    focus: [
      "A delivery risk is visible early, but no one has yet coordinated a response.",
      "Impediments are accumulating and beginning to affect flow across the team.",
      "The team can see several risks, but mitigation work has not been prioritized.",
      "A known blocker keeps returning because lessons are not being applied.",
      "The team needs a more deliberate way to identify and manage emerging delivery threats."
    ],
    correct: [
      "identify the risk early, engage the team, and prioritize the best mitigation action",
      "treat impediments and risks as work that needs visibility, ownership, and follow-through",
      "monitor the risk continuously and use lessons learned to reduce recurrence",
      "work with the team to choose the course of action that best protects value delivery",
      "proactively surface impediments and manage them before they become larger failures",
      "prioritize impediment removal and risk mitigation instead of reacting late"
    ],
    incorrect: [
      "wait until the risk becomes an actual issue before consuming capacity on it",
      "keep risks in leadership discussions only so the team can focus on delivery",
      "treat impediments as unavoidable context rather than something to address actively",
      "record the blocker and continue with the original plan unless escalation occurs",
      "assume recurring impediments are simply part of complex work",
      "separate mitigation from day-to-day delivery planning",
      "choose the least disruptive response even if the risk remains likely and severe",
      "optimize utilization by postponing impediment work until spare capacity appears"
    ],
    explanation:
      "The Delivery domain now calls for proactive identification, prioritization, monitoring, and learning-based management of impediments and risks."
  },
  {
    domain: "Delivery",
    task: "Recognize and eliminate waste",
    focus: [
      "The team is busy, but customers are not seeing value flow as quickly as expected.",
      "Waiting, handoffs, and rework are consuming effort without improving outcomes.",
      "The end-to-end flow includes obvious non-value-added steps, but they remain untouched.",
      "A process feels heavy, yet the waste has not been clearly visualized or prioritized.",
      "People sense inefficiency, but the system is not being examined deliberately."
    ],
    correct: [
      "visualize the end-to-end flow, identify waste, and prioritize reducing it iteratively",
      "use metrics and feedback loops to find non-value-added activity and remove it",
      "treat waste reduction as ongoing improvement work rather than a one-time event",
      "examine value-added versus non-value-added steps and reduce the biggest sources of waste first",
      "focus the team on removing delays, handoffs, and rework that do not improve customer value",
      "iterate on waste identification and reduction using evidence from the flow"
    ],
    incorrect: [
      "optimize each local activity even if the overall flow still contains long delays",
      "accept waiting time as a normal cost of cross-functional delivery",
      "prioritize keeping every person busy over reducing non-value-added work",
      "treat waste as a finance concern rather than a delivery concern",
      "delay waste analysis until output volume declines more sharply",
      "remove only the lowest-risk waste items, even if they have little impact",
      "protect legacy approval steps because they are familiar",
      "measure effort expended rather than end-to-end value flow"
    ],
    explanation:
      "The current outline expects practitioners to visualize flow, identify waste with data and feedback, and iteratively reduce it."
  },
  {
    domain: "Delivery",
    task: "Perform continuous improvements",
    focus: [
      "Retrospectives produce ideas, but the improvements do not consistently change outcomes.",
      "The team wants to improve predictability, but it is not using evidence well enough.",
      "Metrics are available, yet improvement actions are not being evaluated for effectiveness.",
      "The team is willing to improve, but improvement work lacks discipline and follow-through.",
      "Process pain points are known, though the response has been inconsistent."
    ],
    correct: [
      "use metrics and feedback to choose a focused improvement and then evaluate whether it worked",
      "implement a small number of improvement actions and inspect their effectiveness",
      "treat continuous improvement as measurable work rather than a discussion topic only",
      "use evidence to drive the next improvement experiment and review the result afterward",
      "close the loop by checking whether the process change actually improved delivery",
      "base improvement priorities on data and feedback, then inspect the outcome"
    ],
    incorrect: [
      "generate many retrospective actions so the team has more improvement options",
      "treat improvement as complete once an action item is assigned",
      "rely on intuition alone because metrics can slow improvement conversations",
      "keep improvement ideas visible without limiting or evaluating them",
      "wait for major problems before changing the process",
      "measure improvement mainly by team enthusiasm rather than results",
      "avoid changing the process frequently because adaptation can confuse the team",
      "assume a popular improvement has worked if no one complains"
    ],
    explanation:
      "Performing continuous improvement in the latest outline means using metrics and feedback, implementing improvement actions, and evaluating whether they were effective."
  },
  {
    domain: "Delivery",
    task: "Actively engage customers",
    focus: [
      "The team has customer access, but that collaboration is not being used consistently.",
      "Acceptance criteria exist, yet customer needs are still being misunderstood.",
      "A release is near, but stakeholder collaboration has not been strong enough throughout delivery.",
      "The team wants better alignment between what is built and what customers actually need.",
      "Users are represented indirectly, but direct collaboration is limited."
    ],
    correct: [
      "identify customer needs actively and encourage direct collaboration between customer and team",
      "use customer engagement to validate that deliverables meet acceptance criteria and real needs",
      "strengthen collaboration with customers throughout delivery rather than only at acceptance time",
      "analyze customer needs explicitly and keep validating assumptions with them",
      "bring the customer perspective into ongoing decisions so the team builds the right thing",
      "maintain active customer engagement so acceptance criteria and value stay aligned"
    ],
    incorrect: [
      "protect the team from customers so scope can remain stable",
      "treat the product owner as a full substitute for any direct customer collaboration",
      "use acceptance criteria without validating whether they still reflect customer needs",
      "limit customer interaction to major demos because frequent contact can create noise",
      "wait until delivery is complete before checking customer satisfaction",
      "separate customer analysis from team execution to streamline delivery",
      "assume existing requirements already capture customer need well enough",
      "avoid collaboration when customers disagree because it slows prioritization"
    ],
    explanation:
      "The Delivery domain expects agile practitioners to identify customer needs, validate against acceptance criteria, and encourage ongoing customer-team collaboration."
  },
  {
    domain: "Delivery",
    task: "Optimize flow",
    focus: [
      "Work is entering the system faster than it is leaving, and queues are growing.",
      "The team is starting many items but finishing too few of them.",
      "Flow interruptions are increasing and delivery predictability is worsening.",
      "Multiple priorities are fragmenting focus across the team.",
      "Work in progress feels high, but people are reluctant to reduce it."
    ],
    correct: [
      "limit work in progress and use flow data to improve how value moves through the system",
      "shield the team from interruptions and focus on finishing before starting more work",
      "use metrics to inspect flow and make changes that reduce delay and multitasking",
      "optimize the system for completed value rather than simultaneous activity",
      "reduce interruptions and constrain WIP so the team can improve throughput predictably",
      "treat flow as a system outcome and improve it with visible policies and data"
    ],
    incorrect: [
      "start more items so every specialist remains fully utilized",
      "accept frequent interruptions as the cost of staying responsive",
      "measure success mainly by how many stories are active at the same time",
      "increase parallel work because finishing pressure can be addressed later",
      "optimize each individual queue without addressing end-to-end flow",
      "let urgent requests bypass the flow policy whenever possible",
      "defer flow analysis until the release milestone is missed",
      "treat WIP limits as optional guidance rather than an active control"
    ],
    explanation:
      "Optimizing flow in the latest PMI-ACP outline means limiting WIP, reducing interruptions, and using metrics to improve end-to-end movement of value."
  }
];

const seenQuestions = new Map();

function main() {
  const questions = [];
  let id = 1;

  Object.entries(domainDifficultyTargets).forEach(([domain, difficultyMap]) => {
    const tasks = taskConfigs.filter((taskConfig) => taskConfig.domain === domain);

    Object.entries(difficultyMap).forEach(([difficulty, targetCount]) => {
      for (let i = 0; i < targetCount; i += 1) {
        const taskConfig = tasks[i % tasks.length];
        const question = buildQuestion(taskConfig, difficulty, i, id);

        const normalizedQuestion = question.question.toLowerCase();
        if (seenQuestions.has(normalizedQuestion)) {
          const previousId = seenQuestions.get(normalizedQuestion);
          throw new Error(`Duplicate generated question text at id ${id}; previous id ${previousId}; text: ${question.question}`);
        }

        seenQuestions.set(normalizedQuestion, id);
        questions.push(question);
        id += 1;
      }
    });
  });

  validateTotals(questions);
  fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2));
  console.log(`Generated ${questions.length} questions to ${path.relative(rootDir, outputPath)}`);
}

function buildQuestion(taskConfig, difficulty, index, id) {
  const questionSeed = id * 17 + index * 13;
  const multiple = shouldUseMultiple(difficulty, index);
  const scenario = buildScenario(taskConfig, difficulty, questionSeed, id, multiple);

  const correctPool = rotate(taskConfig.correct, questionSeed);
  const incorrectPool = rotate(taskConfig.incorrect, questionSeed + 5);

  let options;
  let answer;
  let selectionType;
  let explanation;

  if (multiple) {
    const correctOptions = correctPool.slice(0, 2);
    const incorrectOptions = incorrectPool.slice(0, 2);
    const optionValues = shuffleDeterministic(
      [
        { text: toOptionSentence(correctOptions[0]), correct: true },
        { text: toOptionSentence(correctOptions[1]), correct: true },
        { text: toDistractorSentence(incorrectOptions[0], questionSeed), correct: false },
        { text: toDistractorSentence(incorrectOptions[1], questionSeed + 1), correct: false }
      ],
      questionSeed
    );

    ({ options, answer } = buildOptions(optionValues));
    selectionType = "multiple";
    explanation = `${taskConfig.explanation} In this scenario, the best responses are to ${correctOptions[0]} and ${correctOptions[1]}, because those actions reinforce ${taskConfig.task.toLowerCase()} without hiding uncertainty or delaying learning.`;
  } else {
    const correctOption = correctPool[0];
    const incorrectOptions = incorrectPool.slice(0, 3);
    const optionValues = shuffleDeterministic(
      [
        { text: toOptionSentence(correctOption), correct: true },
        { text: toDistractorSentence(incorrectOptions[0], questionSeed), correct: false },
        { text: toDistractorSentence(incorrectOptions[1], questionSeed + 1), correct: false },
        { text: toDistractorSentence(incorrectOptions[2], questionSeed + 2), correct: false }
      ],
      questionSeed
    );

    ({ options, answer } = buildOptions(optionValues));
    selectionType = "single";
    explanation = `${taskConfig.explanation} In this scenario, the strongest next step is to ${correctOption}, because it addresses the real agile need instead of optimizing mainly for short-term certainty or local convenience.`;
  }

  return {
    id,
    question: scenario,
    options,
    answer,
    explanation,
    domain: taskConfig.domain,
    difficulty,
    selectionType,
    task: taskConfig.task,
    outlineVersion
  };
}

function buildScenario(taskConfig, difficulty, seed, id, multiple) {
  const team = pick(teams, seed, 0);
  const product = pick(products, seed, 1);
  const stakeholder = pick(stakeholders, seed, 2);
  const pressure = pick(timePressures, seed, 3);
  const tension = pick(tensions, seed, 4);
  const metric = pick(metrics, seed, 5);
  const focus = pick(taskConfig.focus, seed, 6);
  const twist = pick(scenarioTwists, seed, 7);
  const operatingContext = pick(operatingContexts, seed, 8);
  const timeWindow = (Math.abs(seed) % 5) + 2;
  const impactedGroups = (Math.abs(seed * 3) % 4) + 2;
  const metricShift = (Math.abs(seed * 5) % 18) + 7;
  const pilotUsers = id + 24;
  const stakeholderPrompt = pick(stakeholderPrompts, seed, 9);
  const artifact = pick(artifactReferences[taskConfig.task] || ["the current plan"], seed, 10);

  if (difficulty === "easy") {
    return `${team} is working on ${product}. ${focus} ${pressure} ${twist} The situation has become more visible over the last ${timeWindow} iterations, affects ${impactedGroups} stakeholder groups, and now touches roughly ${pilotUsers} pilot users or internal users. The discussion is centered on ${artifact}. ${capitalize(stakeholder)} is involved, and ${stakeholderPrompt} ${renderStem(multiple ? easyStemTemplatesMultiple : easyStemTemplates, seed, taskConfig.task)}`;
  }

  if (difficulty === "medium") {
    return `${team} is working on ${product}. ${focus} ${pressure} ${tension} ${operatingContext} Recent discussions around ${artifact} have focused on improving ${metric}, which has shifted by about ${metricShift}% over the last ${timeWindow} iterations, while roughly ${pilotUsers} active users or internal users are affected by the outcome. The team also wants to avoid rework and late surprises. ${stakeholderPrompt} ${renderStem(multiple ? mediumStemTemplatesMultiple : mediumStemTemplates, seed, taskConfig.task)}`;
  }

  return renderTemplate(
    hardScenarioTemplates[Math.abs(seed) % hardScenarioTemplates.length],
    {
      team,
      product,
      focus,
      focusLower: focus.charAt(0).toLowerCase() + focus.slice(1),
      pressure,
      stakeholderSentence: `${capitalize(stakeholder)} wants a confident response, yet`,
      tension,
      twist,
      operatingContext,
      artifact,
      metric,
      metricShift,
      timeWindow,
      impactedGroups,
      pilotUsers,
      stakeholderPrompt,
      stem: renderStem(multiple ? hardStemTemplatesMultiple : hardStemTemplatesSingle, seed, taskConfig.task)
    }
  );
}

function shouldUseMultiple(difficulty, index) {
  if (difficulty === "hard") {
    return index % 3 === 0;
  }
  if (difficulty === "medium") {
    return index % 4 === 0;
  }
  return index % 6 === 0;
}

function buildOptions(optionValues) {
  const keys = ["A", "B", "C", "D"];
  const options = {};
  const answers = [];

  optionValues.forEach((option, index) => {
    const key = keys[index];
    options[key] = option.text;
    if (option.correct) {
      answers.push(key);
    }
  });

  return {
    options,
    answer: answers.length === 1 ? answers[0] : answers
  };
}

function rotate(list, seed) {
  const offset = Math.abs(seed) % list.length;
  return list.slice(offset).concat(list.slice(0, offset));
}

function pick(list, seed, salt) {
  return list[Math.abs(seed * 7 + salt * 11) % list.length];
}

function shuffleDeterministic(list, seed) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.abs(seed + i * 13) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function toOptionSentence(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function toDistractorSentence(value, seed) {
  const template = distractorTemplates[Math.abs(seed) % distractorTemplates.length];
  const sentence = template.replace("{value}", value);
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

function renderStem(templates, seed, task) {
  const template = templates[Math.abs(seed) % templates.length];
  return template.replace("{task}", task.toLowerCase());
}

function renderTemplate(template, values) {
  return Object.entries(values).reduce(
    (output, [key, value]) => output.replace(new RegExp(`\\{${key}\\}`, "g"), String(value)),
    template
  );
}

function validateTotals(questions) {
  if (questions.length !== 1200) {
    throw new Error(`Expected 1200 questions but generated ${questions.length}`);
  }

  const difficultyCounts = countBy(questions, "difficulty");
  const domainCounts = countBy(questions, "domain");

  Object.entries(difficultyTargets).forEach(([difficulty, expected]) => {
    if (difficultyCounts[difficulty] !== expected) {
      throw new Error(`Difficulty ${difficulty} expected ${expected}, got ${difficultyCounts[difficulty]}`);
    }
  });

  Object.entries(domainTargets).forEach(([domain, expected]) => {
    if (domainCounts[domain] !== expected) {
      throw new Error(`Domain ${domain} expected ${expected}, got ${domainCounts[domain]}`);
    }
  });
}

function countBy(list, key) {
  return list.reduce((accumulator, item) => {
    accumulator[item[key]] = (accumulator[item[key]] || 0) + 1;
    return accumulator;
  }, {});
}

main();
