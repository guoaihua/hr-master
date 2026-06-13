const ENV_API_KEY =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_LLM_API_KEY) ||
  (typeof process !== "undefined" && process.env && process.env.VITE_LLM_API_KEY) ||
  "";

const LLM_CONFIG = {
  baseURL: "https://www.dmxapi.cn/v1",
  apiKey: ENV_API_KEY,
  model: "mimo-v2.5-pro",
  useHardcodedResult: true,
};

const STORAGE_KEYS = {
  current: "interviewmaster.currentAnalysis.v1",
  history: "interviewmaster.analysisHistory.v1",
};

const DEFAULT_DIMENSIONS = [
  { name: "聪明度", note: "逻辑思维与问题解决" },
  { name: "抗压性", note: "逆商与压力处理" },
  { name: "是否挑活", note: "主动性与责任心" },
  { name: "AI工具应用", note: "工具意识与质量把控" },
  { name: "自驱动学习", note: "跨领域学习与迁移" },
];

const SECTION_META = {
  candidate: {
    title: "人选档案",
    description: "姓名、目标岗位、教育经历、核心经历、亮点、风险点和量化指标。",
  },
  dimensions: {
    title: "面试维度",
    description: "用于筛选题目的考察维度。建议 5-7 个，名称要能覆盖岗位核心胜任力。",
  },
  questions: {
    title: "定制化面试问题",
    description: "默认 8-12 道题，每题包含简历依据、开放式问题、情景模拟和面试官提示。",
  },
  interviewerTips: {
    title: "面试官小贴士",
    description: "围绕简历中的量化成果、风险点、亮点和待核实信息给面试官提醒。",
  },
};

const HARDCODED_MODEL_ANALYSIS = {
  candidate: {
    name: "何蔓菱",
    targetRole: "HR实习生-招聘方向",
    summary:
      "武汉大学数字媒体技术专业2028届本科在读。拥有游戏策划助理实习生、互联网运营实习生经验，掌握用户研究、数据分析、内容策划与用户运营技能。具备数据分析工具技能（Excel、SPSS、SQL）及游戏引擎使用经验（Cocos Creator），辅修经济学，逻辑分析能力较强。期望转向HR（招聘方向）领域，将技术背景与人际敏感度结合。",
    education: [
      {
        school: "武汉大学",
        major: "数字媒体技术",
        degree: "本科",
        startDate: "2024-09",
        endDate: "2028-06",
        description: "GPA：3.5/4.0（前15%）。辅修经济学。核心课程：游戏程序设计、用户研究与测试、多媒体技术。",
      },
    ],
    experience: [
      {
        company: "腾讯（武汉）科技有限公司",
        role: "游戏策划助理实习生",
        startDate: "2025-07",
        endDate: "2025-10",
        description:
          "1. 参与2款移动端游戏的新手引导流程优化，通过用户行为数据埋点与AB测试，将新手次日留存率提升了8%。\n2. 协助资深策划进行竞品分析，完成3份详细的竞品体验报告，提出5项功能优化建议，其中2项被采纳并排期开发。\n3. 参与需求文档的撰写与维护，确保开发、美术团队对需求理解一致，减少沟通返工。",
      },
      {
        company: "字节跳动（武汉）分公司",
        role: "互联网运营实习生",
        startDate: "2025-03",
        endDate: "2025-06",
        description:
          "1. 负责社群（500人以上）的日常维护与内容运营，通过策划主题打卡活动，使社群月均活跃度提升15%。\n2. 独立撰写产品宣传文案及推文，阅读完成率平均达到70%，高于团队平均水平。\n3. 协助进行用户调研，通过问卷与访谈收集200+用户反馈，整理并输出用户需求画像报告。",
      },
    ],
    otherExperience: [
      {
        name: "独立游戏项目《星海迷踪》",
        role: "核心策划",
        startDate: "2024-10",
        endDate: "2025-02",
        description: "作为3人团队核心成员，负责游戏世界观架构、任务系统设计与数值平衡。项目获校级“数字创意大赛”二等奖。",
      },
    ],
    skills: [
      "用户研究（问卷设计、用户访谈）",
      "数据分析（Excel， SPSS基础， SQL基础）",
      "内容策划与撰写",
      "项目管理工具（Jira， Trello）",
      "游戏引擎基础（Cocos Creator）",
      "Office三件套（精通）",
    ],
    certificates: ["英语四级（550）", "计算机二级（Python）"],
    highlights: [
      "具备将技术背景（数字媒体、数据分析）与用户/人际洞察结合的能力，契合HR招聘中对候选人评估的需求。",
      "拥有内容创作与社群运营经验，有助于雇主品牌建设和校招宣传。",
      "逻辑清晰，辅修经济学，具备基础的数据敏感度和分析思维。",
      "主动性强，有从策划转向HR的明确职业规划，并已开始自学相关知识。",
    ],
    risks: [
      "没有人力资源相关实习或项目经验，需要快速学习和适应HR专业知识体系。",
      "目标岗位（游戏策划）与申请岗位（HR）关联性弱，需考察其转行动机的稳定性。",
      "实习经历均为内容/运营/策划方向，直接招聘支持（如简历筛选、面试协调）经验为零。",
    ],
    metrics: [
      { label: "新手引导优化提升留存", value: "+8%" },
      { label: "社群活跃度提升", value: "+15%" },
      { label: "独立项目获奖", value: "校级二等奖" },
      { label: "竞品报告产出", value: "3份详细报告" },
    ],
  },
  dimensions: [
    { name: "转行动机与职业规划", note: "评估从游戏策划转向HR招聘的动机是否清晰、坚定，以及对招聘工作的理解。" },
    { name: "用户/人际敏感度", note: "考察其在过往经历中展现的观察、分析和理解他人（用户/候选人）的能力。" },
    { name: "沟通与协调能力", note: "评估其跨部门协作、文档撰写与沟通效率，这对HR招聘的协调工作至关重要。" },
    { name: "数据分析与逻辑思维", note: "利用其数字媒体和辅修经济学的背景，考察其用数据辅助决策的能力。" },
    { name: "学习能力与适应性", note: "评估其快速学习新领域知识（如HR专业知识）并应用的能力。" },
    { name: "抗压与多任务处理", note: "了解其如何平衡学业、实习与项目，应对压力。" },
  ],
  questions: [
    {
      id: 1,
      dimension: "转行动机与职业规划",
      topic: "理解岗位与个人匹配度",
      background:
        "你简历中主要实习经历是游戏策划和互联网运营，但申请的是HR实习生（招聘方向）。请具体谈谈你为什么想做HR，特别是招聘？你认为自己过往的哪些经历或能力能让你胜任这个看起来‘跨专业’的岗位？",
      openEnded: "你对招聘工作的理解是什么？它和你在腾讯做用户研究、在字节做内容运营有哪些底层能力是相通的？",
      situational: "假设你成功入职，在协助校招时，遇到一个专业对口但性格内向、表达不佳的候选人，你会如何向面试官推荐或评估他？",
      tips:
        "关注回答的逻辑性和深度，是否将“用户研究”思维迁移到“候选人评估”，将“内容运营”能力与“雇主品牌建设”联系起来。",
    },
    {
      id: 2,
      dimension: "用户/人际敏感度",
      topic: "从用户洞察到候选人洞察",
      background:
        "你在腾讯实习时通过用户行为数据优化了新手引导，在字节通过调研整理了用户需求画像。请分享一个你通过观察或分析，深入理解某个用户（或同学/队友）真实需求或性格特点的实例。",
      openEnded: "如果让你用做用户研究的方法（如问卷、访谈）来评估一个岗位的候选人画像，你会关注哪些维度？",
      situational: "在一次模拟群面中，你观察到一位候选人很安静，但发言时逻辑特别清晰。另一位候选人很活跃，但观点有些发散。你会如何快速记录和评价这两位？",
      tips: "考察其是否具备将用户分析能力转化为识人能力的潜力。关注其描述是否具体，分析是否透彻。",
    },
    {
      id: 3,
      dimension: "沟通与协调能力",
      topic: "跨团队协作与文档能力",
      background: "你提到在腾讯撰写需求文档，确保开发、美术理解一致。请描述一个你遇到的沟通困难（例如理解偏差），你是如何解决的？",
      openEnded: "你认为一份优秀的招聘需求（JD）和一份优秀的产品需求文档（PRD）在写法和目标上有什么异同？",
      situational: "业务部门催得很急，要求你明天就提供一批高质量简历，但现有的简历库质量参差不齐。你会如何与业务主管沟通并安排工作？",
      tips: "关注其沟通方式是否主动、有条理，以及书面表达是否清晰。在HR工作中，协调业务部门是关键。",
    },
    {
      id: 4,
      dimension: "数据分析与逻辑思维",
      topic: "数据驱动的决策习惯",
      background: "你简历中提到了提升留存率8%、活跃度15%等数据。请任选一个，详细说明你是如何得出这个数据的？你分析了哪些指标？做了哪些对比？",
      openEnded: "在招聘中，你觉得哪些数据是重要的？例如，如何衡量一个招聘渠道的有效性？",
      situational: "你负责一个岗位招聘，但两个月了，合适的候选人很少。老板问你可能是什么原因，你会如何用数据或事实来分析和汇报？",
      tips: "不仅看其是否“使用”数据，更要看其分析数据的逻辑链条是否完整，是否具备通过数据发现问题的能力。",
    },
    {
      id: 5,
      dimension: "学习能力与适应性",
      topic: "新领域知识的快速学习",
      background: "你之前没有HR经验，但辅修了经济学。请谈谈你辅修的初衷，以及你是如何快速学习一个新专业领域的？用了哪些方法？",
      openEnded: "为了准备这次面试，你对招聘工作或HR领域做了哪些了解和准备？",
      situational: "入职第一周，你需要独立操作公司的招聘系统（ATS），但手册很厚。你会如何快速上手？",
      tips: "关注其学习方法论（如信息搜集、框架建立、实践验证），而非单纯的学习时长。",
    },
    {
      id: 6,
      dimension: "抗压与多任务处理",
      topic: "时间管理与优先级排序",
      background: "你同时进行学业、两段实习和一个独立项目，时间安排上一定很有挑战。请分享你处理多任务或时间紧迫时的一个具体经历和方法。",
      openEnded: "在招聘旺季，你可能会同时跟进多个岗位的多个候选人，事情琐碎且紧急。你会如何确保自己不忙中出错？",
      situational: "上午，HRBP紧急要你帮忙筛选一份技术简历；下午，有3个候选人要来面试需要你接待；同时，你还需要整理上个月的招聘数据。你会如何安排这一天？",
      tips: "观察其是否有清晰的优先级判断标准（如紧急/重要矩阵），以及具体的执行工具或习惯（如清单、日历）。",
    },
    {
      id: 7,
      dimension: "用户/人际敏感度",
      topic: "动机判断与留任风险初判",
      background: "你在做用户调研或内容运营时，需要判断用户的真实意图或偏好。在招聘中，判断候选人的求职动机和稳定性也很重要。你认为如何判断一个人是否真的适合并想加入一家公司？",
      openEnded: "如果你在电话初筛时，感觉候选人对公司和岗位了解甚少，只是海投简历，你会怎么处理？",
      situational: "一位候选人各方面条件都不错，但在谈到上一份工作离职原因时，言辞闪烁，并一直追问薪资和加班情况。你会如何评估？",
      tips: "考察其是否具备基本的“候选人风险”评估意识，以及处理敏感问题的沟通技巧。",
    },
    {
      id: 8,
      dimension: "沟通与协调能力",
      topic: "雇主品牌与对外沟通",
      background: "你有内容撰写和社群运营经验。如果你负责运营公司的招聘公众号或在招聘会上进行宣讲，你会如何向应届生介绍我们的公司和这个HR实习岗位，以吸引他们？",
      openEnded: "你认为一个有吸引力的雇主品牌故事应该包含哪些元素？",
      situational: "在招聘会上，有学生问：“你们公司的HR实习生和别的公司有什么不同？能学到什么？”你会怎么回答？",
      tips: "关注其语言是否有感染力、是否真诚，以及是否能将公司的优势与候选人的利益（成长、体验）结合。",
    },
    {
      id: 9,
      dimension: "转行动机与职业规划",
      topic: "对招聘工作的具体认知",
      background: "为了转行，你肯定对招聘工作有过思考。请描述你认为一个完整的招聘流程是怎样的？HR实习生在其中可能承担哪些具体任务？",
      openEnded: "你觉得自己最可能从招聘工作的哪个环节（如简历筛选、面试安排、渠道维护、数据分析）获得成就感？为什么？",
      situational: "如果让你负责一个技术岗位的简历初筛，但你完全看不懂技术名词，你会怎么办？",
      tips: "检验其是否做过功课，对招聘工作的理解是否停留在表面。重点看其解决问题的思路（如请教、学习、抓重点）。",
    },
    {
      id: 10,
      dimension: "数据分析与逻辑思维",
      topic: "复盘与改进能力",
      background: "你的独立游戏项目《星海迷踪》获得了奖项。请复盘一下，在这个项目中，你负责的“数值平衡”设计是否遇到过问题？你是如何发现问题并调整的？",
      openEnded: "你认为一次成功的招聘活动（如一场校招宣讲会）结束后，应该复盘哪些数据或反馈？",
      situational: "上个月的招聘漏斗数据显示，从“一面”到“二面”的转化率突然下降了20%。你会从哪些角度去排查原因？",
      tips: "关注其复盘的结构化思维，是否能从现象（问题/结果）追溯到流程、方法或人员，并提出改进假设。",
    },
  ],
  interviewerTips: [
    "候选人无直接HR经验，面试核心在于评估其可迁移能力（用户洞察、沟通、数据思维）和强烈的学习意愿与转行动机。",
    "提问时多使用“举例说明”、“具体说说”、“如果是你，你会怎么做”等句式，引导其展示能力而非泛泛而谈。",
    "注意考察其与HR岗位的“软匹配度”：是否具备服务意识、同理心、亲和力与耐心。",
    "对于其提出的“数据提升”、“获奖项目”等亮点，务必追问细节和背景，以判断其贡献度和真实性。",
    "可以设计一个小的模拟任务（如：10份简历快速筛选并排序），观察其实际操作和决策过程。",
    "评估其文化契合度，是否具备踏实、细致、有责任心的特质，是否适合招聘工作中大量琐碎但重要的事务性工作。",
  ],
  meta: {
    parserVersion: "v1",
    model: "mimo-v2.5-pro",
    confidence: 0,
  },
};

const SAMPLE_RESUME_TEXT = `李娜（HR实习生-招聘方向）
教育背景：华中师范大学硕士在读（公共管理学-社会保障方向），中南民族大学本科（劳动与社会保障）。
核心经历：曾于北京数字政通科技股份有限公司和广州中望龙腾软件有限公司担任人力实习生，具备全流程招聘支持经验，尤其在研发、销售、售前等岗位的社招和校招方面有具体成果，如成功招聘C++开发5人，售前签约7人等。
其他经历：曾任中南民族大学公共管理学院办公室助理、年级学生会生活部部长，参与过靖西市壬庄乡人民政府党政办公助理工作，具备文件管理、信息传达、会议准备、安全管理、评议工作、沟通协调等经验。
技能证书：大学生英语六级、全国计算机二级证书、高中教师资格证。`;

const SAMPLE_ANALYSIS = {
  candidate: {
    name: "李娜",
    targetRole: "HR实习生-招聘方向",
    summary:
      "候选人具备科技公司 HR 实习经历，参与过研发、销售、售前等岗位招聘，并有较多量化成果。其公共管理与劳动保障背景、教师资格证和学生干部经历可作为沟通表达、流程意识和学习迁移能力的补充侧证。",
    education: [
      "华中师范大学硕士在读，公共管理学-社会保障方向",
      "中南民族大学本科，劳动与社会保障",
    ],
    experience: [
      "北京数字政通科技股份有限公司，人力实习生，参与销售、售前、项目经理等岗位招聘支持",
      "广州中望龙腾软件有限公司，人力实习生，参与 C++ 开发、测试、人力实习生等岗位招聘支持",
    ],
    otherExperience: [
      "中南民族大学公共管理学院办公室助理",
      "年级学生会生活部部长",
      "靖西市壬庄乡人民政府党政办公助理",
    ],
    skills: ["简历筛选", "面试邀约", "招聘流程跟进", "员工关系支持", "文件管理"],
    certificates: ["大学生英语六级", "全国计算机二级证书", "高中教师资格证"],
    highlights: [
      "有研发、销售、售前等多类型岗位招聘经验",
      "简历包含 C++ 开发 5 人、售前签约 7 人等可追问量化成果",
      "具备教师资格证，可关注表达、培训和带教潜力",
    ],
    risks: [
      "量化成果需核实个人贡献度和数据口径",
      "科技公司研发招聘经验需要确认是否真正理解岗位差异",
      "应届生实习经历较多，需关注稳定性和职业动机",
    ],
    metrics: [
      { label: "招聘成功", value: "11人" },
      { label: "签约人数", value: "10人" },
      { label: "员工关系处理", value: "23人次" },
      { label: "实习时长", value: "14个月" },
    ],
  },
  dimensions: DEFAULT_DIMENSIONS,
  questions: [
    {
      id: "q1",
      dimension: "聪明度",
      topic: "复杂招聘流程的逻辑拆解与优化",
      background: "候选人参与过从简历筛选到 offer 发放的全流程招聘，涉及研发、销售等不同类型岗位。",
      openEnded:
        "请你总结一下，在招聘 C++ 开发工程师和销售经理这两种差异较大的岗位时，你认为招聘策略、渠道选择和面试侧重点最核心的三个差异是什么？",
      situational:
        "如果让你设计一个校招研发岗位的一站式招聘流程，从宣讲到入职，你会如何划分模块和安排时间节点？",
      tips: ["追问具体数据和个人角色", "观察是否能从岗位特性出发拆解策略", "要求复盘过往流程优化经验"],
    },
    {
      id: "q2",
      dimension: "聪明度",
      topic: "信息不对称下的判断与决策",
      background: "候选人负责过简历初筛和面试邀约，需要判断其是否能识别简历信息与真实能力之间的差异。",
      openEnded:
        "请分享一次你通过简历初步判断候选人不合适，但沟通后发现其潜力并成功推荐的经历。你是如何做出判断的？",
      situational:
        "如果简历写着精通 C++，但电话沟通发现候选人只有基础理解，而业务部门又急需人才，你会如何反馈？",
      tips: ["追问判断依据", "验证沟通业务部门的方式", "关注风险意识"],
    },
    {
      id: "q3",
      dimension: "抗压性",
      topic: "高压招聘任务下的心态调整与应对",
      background: "候选人承担过难度较高、周期较长的研发和销售类岗位招聘任务。",
      openEnded:
        "请分享一次你同时面对业务催促、候选人流失和招聘指标压力时，如何调整状态并推动结果的经历。",
      situational:
        "假设你负责一个紧急研发岗位招聘，连续加班两周候选人池仍不理想，同时导师又安排新任务，你会如何处理？",
      tips: ["追问压力来源", "观察优先级判断", "验证是否能保持沟通节奏"],
    },
    {
      id: "q4",
      dimension: "抗压性",
      topic: "突发状况下的韧性与补救",
      background: "招聘中常见候选人爽约、offer 被拒等不确定事件。",
      openEnded: "你有没有遇到过候选人临近入职前突然放弃 offer？当时如何补救和复盘？",
      situational:
        "终面前一小时候选人临时取消，业务部门认为你协调不力，你会如何解释并争取理解？",
      tips: ["追问补救方案", "关注是否承担责任", "观察对业务信任的修复方式"],
    },
    {
      id: "q5",
      dimension: "是否挑活",
      topic: "职责边界的拓展与自我驱动",
      background: "候选人除招聘支持外，还涉及员工关系、入职带教、企业文化活动等工作。",
      openEnded:
        "请分享一次某项工作不属于明确职责，但你认为对团队重要并主动承担或推动解决的经历。",
      situational:
        "导师让你提交紧急考勤数据，但你发现数据明显错误且导师已下班，你会直接提交还是采取其他行动？",
      tips: ["关注主动性", "验证质量意识", "追问越界沟通方式"],
    },
    {
      id: "q6",
      dimension: "是否挑活",
      topic: "琐碎工作的价值挖掘与精益求精",
      background: "候选人处理过转正流程、合同续签和入职材料等细碎工作。",
      openEnded:
        "在处理重复琐碎的员工关系工作时，你如何保持细致？有没有优化过某个流程？",
      situational:
        "如果让你一周内整理过去一年的招聘文档，数量庞大且格式不一，你会如何规划？",
      tips: ["追问具体流程", "观察耐心和标准", "验证是否有改进意识"],
    },
    {
      id: "q7",
      dimension: "AI工具应用",
      topic: "AI 工具在招聘工作中的实际应用",
      background: "应届候选人可能接触过 ChatGPT、Claude、AI 简历筛选等工具。",
      openEnded: "你是否尝试过用 AI 工具辅助招聘工作？请举一个具体应用场景和效果。",
      situational: "如果需要为 AIGC 工程师撰写 JD，但你不了解该岗位，你会如何利用 AI 工具？",
      tips: ["追问输入和输出", "观察是否会校验 AI 内容", "避免泛泛而谈"],
    },
    {
      id: "q8",
      dimension: "AI工具应用",
      topic: "AI 生成内容的评估与风险控制",
      background: "AI 能提升效率，但生成内容可能不准确或不符合公司文化。",
      openEnded: "当你使用 AI 工具辅助工作时，如何评估生成内容的准确性和适用性？",
      situational: "AI 生成的面试问题清单中有几个问题表述模糊，你会如何修改完善？",
      tips: ["验证批判性思维", "追问修正标准", "关注专业边界"],
    },
    {
      id: "q9",
      dimension: "自驱动学习",
      topic: "跨专业知识的快速学习与应用",
      background: "候选人专业背景为劳动与社会保障/公共管理，但从事过科技公司研发岗位招聘。",
      openEnded: "你如何快速理解 C++、算法等技术岗位的术语、技术栈和核心要求？",
      situational: "如果公司启动你不了解的新业务方向，并要求你负责相关招聘，你会如何制定学习计划？",
      tips: ["追问学习资源", "观察应用到招聘策略的过程", "验证迁移能力"],
    },
    {
      id: "q10",
      dimension: "自驱动学习",
      topic: "从非 HR 经历中提炼学习与成长",
      background: "候选人曾担任办公室助理、学生会干部和政府办公助理。",
      openEnded: "哪一次非 HR 经历对你从事 HR 招聘影响最大？你如何将其应用到招聘实践中？",
      situational: "如果将学生会生活部经验迁移到新员工融入计划设计中，你会怎么做？",
      tips: ["考察经验迁移", "追问反思深度", "观察流程设计能力"],
    },
  ],
  interviewerTips: [
    "针对简历中的量化数据，使用 STAR 法追问其个人角色、具体行动和数据口径。",
    "教师资格证可作为表达、耐心和带教潜力线索，但需要通过具体案例验证。",
    "深入探讨其从公共管理/社保专业转向科技公司 HR 的动机和职业规划。",
    "AI 工具相关问题要要求候选人说清楚输入、输出、修正和校验过程。",
  ],
  source: {
    fileName: "李娜样例.md",
    targetRole: "HR实习生-招聘方向",
    resumeText: SAMPLE_RESUME_TEXT,
    updatedAt: new Date().toISOString(),
  },
  meta: {
    parserVersion: "v1",
    model: "sample",
    confidence: 0.92,
  },
};

const app = document.querySelector("#app");

const state = {
  view: "upload",
  status: "",
  progress: 0,
  error: "",
  selectedDimensions: [],
  search: "",
  keepSearchFocus: false,
  searchSelectionStart: null,
  searchSelectionEnd: null,
  activeModes: {},
  expanded: {},
  searchTimer: null,
  analysisDraft: null,
  savedAnalysis: readSavedAnalysis(),
  editorText: {},
  editingSections: {
    candidate: false,
    dimensions: false,
    questions: false,
    interviewerTips: false,
  },
};

if (state.savedAnalysis) {
  state.view = "workbench";
  hydrateWorkbenchState(state.savedAnalysis);
}

function render() {
  if (state.view === "preview") {
    renderPreview();
    return;
  }
  if (state.view === "workbench") {
    renderWorkbench();
    return;
  }
  renderUpload();
}

function renderShell(content) {
  const action =
    state.view === "workbench"
      ? '<button class="btn secondary" data-action="restart">重新上传</button>'
      : state.view === "preview"
        ? '<button class="btn secondary" data-action="back-upload">返回上传</button>'
        : state.savedAnalysis
          ? '<button class="btn secondary" data-action="continue-saved">继续上次结果</button><button class="btn secondary" data-action="load-sample">加载李娜样例</button>'
          : '<button class="btn secondary" data-action="load-sample">加载李娜样例</button>';

  app.innerHTML = `
    <div class="shell">
      <header class="topbar">
        <div class="topbar-inner">
          <div class="brand">
            <div class="brand-mark">I</div>
            <div>
              <p class="brand-title">InterviewMaster</p>
              <p class="brand-subtitle">智能面试助手</p>
            </div>
          </div>
          <div class="header-actions">${action}</div>
        </div>
      </header>
      ${content}
    </div>
  `;
}

function renderUpload() {
  renderShell(`
    <main class="upload-page">
      <section class="intro-panel">
        <p class="eyebrow">大模型结构化解析</p>
        <h1>上传简历，先预览确认，再生成面试工作台</h1>
        <p class="intro-copy">
          文件会直接交给 OpenAI-compatible 大模型生成统一 JSON。你可以在预览页编辑或分区重生成，确认后才保存并渲染页面。
        </p>
        <div class="feature-grid">
          <div class="feature"><strong>统一结构</strong><span>候选人档案、维度、问题和小贴士都进入同一个 JSON。</span></div>
          <div class="feature"><strong>人工确认</strong><span>生成结果不会直接进入工作台，先由面试官预览和调整。</span></div>
          <div class="feature"><strong>分区重生成</strong><span>人选档案、维度、问题、小贴士可以分别重跑。</span></div>
          <div class="feature"><strong>本地保存</strong><span>确认后的结构化内容保存到浏览器本地存储。</span></div>
        </div>
      </section>

      <section class="upload-panel">
        <div class="field">
          <label for="targetRole">目标岗位</label>
          <input id="targetRole" type="text" value="HR实习生-招聘方向" placeholder="例如：HR实习生-招聘方向" />
        </div>
        <div class="dropzone" data-action="choose-file">
          <div>
            <div class="upload-icon" aria-hidden="true">
              <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
                <path d="M12 15V4m0 0 4 4m-4-4-4 4M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h2>选择或拖拽简历文件</h2>
            <p>支持 PDF / DOCX / TXT / Markdown / 图片简历。文件会直接提交给支持文件或多模态输入的大模型解析。</p>
            <button class="btn" type="button">上传并解析</button>
            <input class="file-input" id="resumeFile" type="file" accept=".txt,.md,.markdown,.json,.pdf,.doc,.docx,.png,.jpg,.jpeg,.webp" />
          </div>
        </div>
        <p class="small-note">${escapeHtml(llmStatusText())}</p>
        ${statusMarkup()}
        ${errorMarkup()}
      </section>
    </main>
  `);

  bindHeaderActions();
  const fileInput = document.querySelector("#resumeFile");
  const dropzone = document.querySelector(".dropzone");
  const roleInput = document.querySelector("#targetRole");

  dropzone.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) processFile(file, roleInput.value.trim());
  });
  dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropzone.classList.add("dragging");
  });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragging"));
  dropzone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropzone.classList.remove("dragging");
    const file = event.dataTransfer.files && event.dataTransfer.files[0];
    if (file) processFile(file, roleInput.value.trim());
  });
}

function renderPreview() {
  const analysis = state.analysisDraft;
  renderShell(`
    <main class="preview-page">
      <section class="preview-main">
        <div class="preview-hero">
          <div>
            <p class="eyebrow">解析结果预览</p>
            <h1>确认结构化内容后再生成工作台</h1>
            <p>默认展示结构化结果。需要修改时可进入编辑模式，或按区块重生成。</p>
          </div>
          <button class="btn" data-action="confirm-save">确认并保存</button>
        </div>
        ${sectionEditor("candidate")}
        ${sectionEditor("dimensions")}
        ${sectionEditor("questions")}
        ${sectionEditor("interviewerTips")}
      </section>
      <aside class="preview-side stack">
        <div class="card">
          <h3>来源信息</h3>
          <ul class="plain-list">
            <li>文件：${escapeHtml(analysis.source.fileName || "未命名")}</li>
            <li>岗位：${escapeHtml(analysis.source.targetRole || "未填写")}</li>
            <li>模型：${escapeHtml(analysis.meta.model || LLM_CONFIG.model)}</li>
            <li>更新时间：${escapeHtml(formatDateTime(analysis.source.updatedAt))}</li>
          </ul>
        </div>
        <div class="card">
          <h3>输出约束</h3>
          <ul class="bullet-list">
            <li>确认保存后，工作台只消费这份 JSON。</li>
            <li>字段缺失时用空字符串或空数组。</li>
            <li>分区重生成只覆盖对应区块。</li>
            <li>保存位置是浏览器 localStorage。</li>
          </ul>
        </div>
        ${errorMarkup()}
        ${statusMarkup()}
      </aside>
    </main>
  `);
  bindHeaderActions();
  bindPreviewActions();
}

function sectionEditor(key) {
  const meta = SECTION_META[key];
  const editing = !!state.editingSections[key];
  const value = state.editorText[key] ?? toPrettyJson(state.analysisDraft[key]);
  return `
    <article class="preview-card">
      <div class="preview-card-head">
        <div>
          <h2>${escapeHtml(meta.title)}</h2>
          <p>${escapeHtml(meta.description)}</p>
        </div>
        <div class="section-actions">
          <button class="btn secondary" data-action="toggle-edit" data-section="${key}">${editing ? "取消编辑" : "编辑区块"}</button>
          ${editing ? `<button class="btn secondary" data-action="apply-section" data-section="${key}">应用编辑</button>` : ""}
          <button class="btn" data-action="regen-section" data-section="${key}">重新生成</button>
        </div>
      </div>
      ${editing ? `<textarea class="json-editor" data-editor="${key}" spellcheck="false">${escapeHtml(value)}</textarea>` : previewSectionContent(key)}
      <div class="regen-row">
        <input data-extra="${key}" type="text" placeholder="补充要求，例如：更关注抗压性，减少 AI 工具问题" />
      </div>
    </article>
  `;
}

function previewSectionContent(section) {
  if (section === "candidate") return previewCandidate(state.analysisDraft.candidate);
  if (section === "dimensions") return previewDimensions(state.analysisDraft.dimensions);
  if (section === "questions") return previewQuestions(state.analysisDraft.questions);
  if (section === "interviewerTips") return previewInterviewerTips(state.analysisDraft.interviewerTips);
  return "";
}

function previewCandidate(candidate) {
  return `
    <div class="preview-content">
      <div class="preview-grid">
        <div><strong>姓名</strong><p>${escapeHtml(candidate.name || "-")}</p></div>
        <div><strong>目标岗位</strong><p>${escapeHtml(candidate.targetRole || "-")}</p></div>
      </div>
      <div class="preview-block">
        <strong>个人总结</strong>
        <p>${escapeHtml(candidate.summary || "-")}</p>
      </div>
      ${previewListBlock("教育背景", candidate.education)}
      ${previewListBlock("核心经历", candidate.experience)}
      ${previewListBlock("其他经历", candidate.otherExperience)}
      ${previewListBlock("技能", candidate.skills)}
      ${previewListBlock("证书", candidate.certificates)}
      ${previewListBlock("亮点", candidate.highlights)}
      ${previewListBlock("风险点", candidate.risks)}
      ${previewMetrics(candidate.metrics)}
    </div>
  `;
}

function previewDimensions(dimensions) {
  const items = (dimensions || [])
    .map(
      (item, index) => `
        <li>
          <strong>${index + 1}. ${escapeHtml(item.name || "未命名维度")}</strong>
          <p>${escapeHtml(item.note || "-")}</p>
        </li>
      `,
    )
    .join("");
  return `<div class="preview-content"><ul class="preview-list">${items || "<li>暂无维度</li>"}</ul></div>`;
}

function previewQuestions(questions) {
  const cards = (questions || [])
    .map(
      (question, index) => `
        <article class="question-preview">
          <h4>${escapeHtml(`${index + 1}. ${question.topic || `问题 ${index + 1}`}`)}</h4>
          <p><strong>维度：</strong>${escapeHtml(question.dimension || "-")}</p>
          <p><strong>简历依据：</strong>${escapeHtml(question.background || "-")}</p>
          <p><strong>开放式：</strong>${escapeHtml(question.openEnded || "-")}</p>
          <p><strong>情景模拟：</strong>${escapeHtml(question.situational || "-")}</p>
          <p><strong>提示：</strong>${escapeHtml((question.tips || []).join("；") || "-")}</p>
        </article>
      `,
    )
    .join("");
  return `<div class="preview-content stack">${cards || "<p>暂无问题</p>"}</div>`;
}

function previewInterviewerTips(tips) {
  const items = (tips || []).map((tip) => `<li>${escapeHtml(tip)}</li>`).join("");
  return `<div class="preview-content"><ul class="preview-list">${items || "<li>暂无小贴士</li>"}</ul></div>`;
}

function previewListBlock(title, items) {
  const list = (items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  return `
    <div class="preview-block">
      <strong>${escapeHtml(title)}</strong>
      <ul class="preview-list compact">${list || "<li>-</li>"}</ul>
    </div>
  `;
}

function previewMetrics(metrics) {
  const cards = (metrics || [])
    .map(
      (item) => `
        <div class="metric-chip">
          <strong>${escapeHtml(item.value || "-")}</strong>
          <span>${escapeHtml(item.label || "-")}</span>
        </div>
      `,
    )
    .join("");
  return `
    <div class="preview-block">
      <strong>量化指标</strong>
      <div class="metric-chip-row">${cards || '<div class="metric-chip"><span>暂无指标</span></div>'}</div>
    </div>
  `;
}

function renderWorkbench() {
  const analysis = state.savedAnalysis;
  const selected = state.selectedDimensions;
  const query = state.search.trim().toLowerCase();
  const questions = analysis.questions.filter((question) => {
    const dimensionMatch = selected.length === 0 || selected.includes(question.dimension);
    const text = [
      question.topic,
      question.background,
      question.openEnded,
      question.situational,
      ...(question.tips || []),
    ]
      .join(" ")
      .toLowerCase();
    return dimensionMatch && (!query || text.includes(query));
  });

  renderShell(`
    <main class="workbench">
      <aside class="stack">
        ${candidateCard(analysis.candidate)}
        ${dimensionFilter(analysis.dimensions)}
      </aside>
      <section class="stack">
        <div class="card search-card">
          <div class="search-box">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m21 21-4.2-4.2M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z" stroke="#7b8aa0" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <input id="searchInput" type="text" value="${escapeAttribute(state.search)}" placeholder="搜索问题内容..." />
            ${state.search ? '<button class="icon-btn" type="button" data-action="clear-search" aria-label="清空搜索" title="清空搜索">×</button>' : ""}
          </div>
        </div>
        <p class="result-line">找到 <strong>${questions.length}</strong> 个问题</p>
        <div class="question-list">${questions.length ? questions.map(questionCard).join("") : emptyState()}</div>
      </section>
      <aside class="stack">
        ${starTips()}
        ${interviewerTips(analysis)}
      </aside>
    </main>
  `);

  bindHeaderActions();
  bindWorkbenchActions();
  if (state.keepSearchFocus) {
    const input = document.querySelector("#searchInput");
    if (input) {
      input.focus();
      if (Number.isInteger(state.searchSelectionStart) && Number.isInteger(state.searchSelectionEnd)) {
        input.setSelectionRange(state.searchSelectionStart, state.searchSelectionEnd);
      }
    }
    state.keepSearchFocus = false;
  }
}

function candidateCard(candidate) {
  return `
    <div class="card">
      <div class="candidate-head">
        <div class="avatar">${escapeHtml((candidate.name || "候").slice(0, 1))}</div>
        <div>
          <h2>${escapeHtml(candidate.name || "候选人")}</h2>
          <p>${escapeHtml(candidate.targetRole || "目标岗位待确认")}</p>
        </div>
      </div>
      ${candidate.summary ? `<p class="profile-summary">${escapeHtml(candidate.summary)}</p>` : ""}
      <div class="metrics">
        ${candidate.metrics
          .slice(0, 4)
          .map((item) => `<div class="metric"><div><strong>${escapeHtml(item.value)}</strong><br><span>${escapeHtml(item.label)}</span></div></div>`)
          .join("")}
      </div>
      ${profileSection("教育背景", candidate.education)}
      ${profileSection("核心经历", candidate.experience)}
      ${profileSection("其他经历", candidate.otherExperience)}
      ${profileSection("技能", candidate.skills)}
      ${profileSection("技能证书", candidate.certificates)}
      ${profileSection("简历亮点", candidate.highlights, true)}
      ${profileSection("待核实信息", candidate.risks, true)}
    </div>
  `;
}

function profileSection(title, items, bullet = false) {
  if (!items || items.length === 0) return "";
  const className = bullet ? "bullet-list" : "plain-list";
  return `
    <section class="section">
      <h3>${escapeHtml(title)}</h3>
      <ul class="${className}">
        ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </section>
  `;
}

function dimensionFilter(dimensions) {
  return `
    <div class="card">
      <div class="filter-actions">
        <h3>素质维度</h3>
        <div class="mini-actions">
          <button class="link-btn" data-action="select-all">全选</button>
          <button class="link-btn" data-action="clear-dimensions">清空</button>
        </div>
      </div>
      <div class="dimension-list">
        ${dimensions
          .map((dimension) => {
            const active = state.selectedDimensions.includes(dimension.name);
            return `
              <button class="dimension-btn ${active ? "active" : ""}" data-action="toggle-dimension" data-dimension="${escapeAttribute(dimension.name)}">
                <span>${escapeHtml(dimension.name)}</span>
                <small>${escapeHtml(dimension.note || "")}</small>
              </button>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function questionCard(question) {
  const mode = state.activeModes[question.id] || "open";
  const expanded = state.expanded[question.id] !== false;
  const tone = getTone(question.dimension);
  return `
    <article class="question-card">
      <div class="question-accent"></div>
      <div class="question-body">
        <div class="question-head">
          <div>
            <h3>${escapeHtml(question.topic)}</h3>
            <span class="tag ${tone}">${escapeHtml(question.dimension)}</span>
          </div>
          <button class="icon-btn" title="${expanded ? "收起" : "展开"}" data-action="toggle-expand" data-id="${escapeAttribute(question.id)}">
            ${expanded ? "⌃" : "⌄"}
          </button>
        </div>
        <p class="background-text">${escapeHtml(question.background)}</p>
        <div class="mode-toggle">
          <button class="${mode === "open" ? "active" : ""}" data-action="set-mode" data-id="${escapeAttribute(question.id)}" data-mode="open">开放式</button>
          <button class="${mode === "situational" ? "active" : ""}" data-action="set-mode" data-id="${escapeAttribute(question.id)}" data-mode="situational">情景模拟</button>
        </div>
        <p class="question-text">${escapeHtml(mode === "open" ? question.openEnded : question.situational)}</p>
        ${
          expanded
            ? `<div class="tips">
                <h4>面试官提示</h4>
                <ul class="bullet-list">${(question.tips || []).map((tip) => `<li>${escapeHtml(tip)}</li>`).join("")}</ul>
              </div>`
            : ""
        }
      </div>
    </article>
  `;
}

function starTips() {
  return `
    <div class="tips-card">
      <h3>STAR 追问指南</h3>
      <div class="tip-item"><strong>S - Situation 情境</strong><p>当时具体的背景和难点是什么？</p></div>
      <div class="tip-item"><strong>T - Task 任务</strong><p>你的具体职责是什么？</p></div>
      <div class="tip-item"><strong>A - Action 行动</strong><p>你具体说了什么、做了什么？重点深挖实际动作。</p></div>
      <div class="tip-item"><strong>R - Result 结果</strong><p>最终的量化产出或他人的评价如何？</p></div>
    </div>
  `;
}

function interviewerTips(analysis) {
  const tips = analysis.interviewerTips.length
    ? analysis.interviewerTips
    : ["针对简历中的量化数据逐项追问，确认其真实角色和贡献度。"];
  return `
    <div class="tips-card">
      <h3>面试官小贴士</h3>
      ${tips
        .map((tip, index) => `<div class="tip-item"><strong>${index + 1}. 追问建议</strong><p>${escapeHtml(tip)}</p></div>`)
        .join("")}
    </div>
  `;
}

function emptyState() {
  return `
    <div class="card empty-state">
      <h3>没有找到匹配的问题</h3>
      <p>试试调整搜索词或清空筛选维度。</p>
    </div>
  `;
}

function statusMarkup() {
  if (!state.status) return "";
  return `
    <div class="status-box">
      <div class="status-row"><span class="spinner"></span><span>${escapeHtml(state.status)}</span></div>
      <div class="progress"><span style="width:${state.progress}%"></span></div>
    </div>
  `;
}

function errorMarkup() {
  return state.error ? `<div class="error">${escapeHtml(state.error)}</div>` : "";
}

function bindHeaderActions() {
  document.querySelectorAll("[data-action='restart'], [data-action='back-upload']").forEach((button) => {
    button.addEventListener("click", () => {
      Object.assign(state, {
        view: "upload",
        status: "",
        progress: 0,
        error: "",
        selectedDimensions: [],
        search: "",
      });
      render();
    });
  });

  document.querySelectorAll("[data-action='continue-saved']").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = "workbench";
      hydrateWorkbenchState(state.savedAnalysis);
      render();
    });
  });

  document.querySelectorAll("[data-action='load-sample']").forEach((button) => {
    button.addEventListener("click", () => {
      openPreview(deepClone(SAMPLE_ANALYSIS));
    });
  });
}

function bindPreviewActions() {
  document.querySelectorAll("[data-action='toggle-edit']").forEach((button) => {
    button.addEventListener("click", () => {
      const section = button.dataset.section;
      state.editingSections[section] = !state.editingSections[section];
      renderPreview();
    });
  });

  document.querySelectorAll("[data-action='apply-section']").forEach((button) => {
    button.addEventListener("click", () => applySectionEdit(button.dataset.section));
  });

  document.querySelectorAll("[data-action='regen-section']").forEach((button) => {
    button.addEventListener("click", () => regenerateSection(button.dataset.section));
  });

  document.querySelectorAll("[data-action='confirm-save']").forEach((button) => {
    button.addEventListener("click", confirmAndSave);
  });
}

function bindWorkbenchActions() {
  const searchInput = document.querySelector("#searchInput");
  searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    state.keepSearchFocus = true;
    state.searchSelectionStart = event.target.selectionStart;
    state.searchSelectionEnd = event.target.selectionEnd;
    window.clearTimeout(state.searchTimer);
    state.searchTimer = window.setTimeout(renderWorkbench, 80);
  });

  document.querySelectorAll("[data-action='select-all']").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedDimensions = state.savedAnalysis.dimensions.map((dimension) => dimension.name);
      renderWorkbench();
    });
  });

  document.querySelectorAll("[data-action='clear-dimensions']").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedDimensions = [];
      renderWorkbench();
    });
  });

  document.querySelectorAll("[data-action='toggle-dimension']").forEach((button) => {
    button.addEventListener("click", () => {
      const dimension = button.dataset.dimension;
      if (state.selectedDimensions.includes(dimension)) {
        state.selectedDimensions = state.selectedDimensions.filter((item) => item !== dimension);
      } else {
        state.selectedDimensions = [...state.selectedDimensions, dimension];
      }
      renderWorkbench();
    });
  });

  document.querySelectorAll("[data-action='set-mode']").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeModes[button.dataset.id] = button.dataset.mode;
      renderWorkbench();
    });
  });

  document.querySelectorAll("[data-action='toggle-expand']").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;
      state.expanded[id] = state.expanded[id] === false;
      renderWorkbench();
    });
  });

  document.querySelectorAll("[data-action='clear-search']").forEach((button) => {
    button.addEventListener("click", () => {
      state.search = "";
      renderWorkbench();
    });
  });
}

async function processFile(file, targetRole) {
  state.error = "";
  state.status = "正在读取简历文件";
  state.progress = 16;
  render();

  try {
    ensureLLMConfigured();
    const resumeInput = await readResumeForModel(file);

    state.status = "正在提交大模型解析简历";
    state.progress = 58;
    render();

    const rawAnalysis = await generateInitialAnalysis({
      fileName: file.name,
      targetRole,
      resumeInput,
    });

    const analysis = normalizeAnalysis(rawAnalysis, {
      fileName: file.name,
      targetRole,
      resumeText: resumeInput.kind === "text" ? resumeInput.text : `[${resumeInput.mimeType}] ${file.name}`,
      updatedAt: new Date().toISOString(),
      model: LLM_CONFIG.model,
    });

    state.progress = 100;
    render();
    openPreview(analysis);
  } catch (error) {
    state.status = "";
    state.progress = 0;
    state.error = error.message || "解析失败";
    render();
  }
}

async function generateInitialAnalysis({ fileName, targetRole, resumeInput }) {
  const messages = buildInitialMessages({ fileName, targetRole, resumeInput });
  return callLLMJson(messages);
}

async function regenerateSection(section) {
  try {
    applySectionEdit(section, { silent: true });
    ensureLLMConfigured();
    state.error = "";
    state.status = `正在重新生成${SECTION_META[section].title}`;
    state.progress = 62;
    renderPreview();

    const extraPrompt = document.querySelector(`[data-extra="${section}"]`)?.value || "";
    const messages = buildSectionMessages({
      section,
      analysis: state.analysisDraft,
      extraPrompt,
    });
    const payload = await callLLMJson(messages);
    mergeSection(section, payload);
    state.analysisDraft = normalizeAnalysis(state.analysisDraft, state.analysisDraft.source);
    syncEditorText();
    state.status = "";
    state.progress = 0;
    renderPreview();
  } catch (error) {
    state.status = "";
    state.progress = 0;
    state.error = error.message || "重生成失败";
    renderPreview();
  }
}

function applySectionEdit(section, options = {}) {
  const textarea = document.querySelector(`[data-editor="${section}"]`);
  if (!textarea) return;
  const parsed = JSON.parse(textarea.value);
  state.analysisDraft[section] = parsed;
  state.analysisDraft = normalizeAnalysis(state.analysisDraft, state.analysisDraft.source);
  syncEditorText();
  state.error = "";
  if (!options.silent) renderPreview();
}

function mergeSection(section, payload) {
  if (payload && Object.prototype.hasOwnProperty.call(payload, section)) {
    state.analysisDraft[section] = payload[section];
    return;
  }
  state.analysisDraft[section] = payload;
}

function confirmAndSave() {
  try {
    Object.keys(SECTION_META).forEach((section) => applySectionEdit(section, { silent: true }));
    const confirmed = normalizeAnalysis(state.analysisDraft, {
      ...state.analysisDraft.source,
      updatedAt: new Date().toISOString(),
    });
    saveAnalysis(confirmed);
    state.savedAnalysis = confirmed;
    state.view = "workbench";
    hydrateWorkbenchState(confirmed);
    render();
  } catch (error) {
    state.error = `保存失败：${error.message}`;
    renderPreview();
  }
}

function openPreview(analysis) {
  state.analysisDraft = normalizeAnalysis(analysis, analysis.source);
  syncEditorText();
  state.view = "preview";
  state.status = "";
  state.progress = 0;
  state.error = "";
  render();
}

function hydrateWorkbenchState(analysis) {
  state.selectedDimensions = [];
  state.search = "";
  state.activeModes = Object.fromEntries((analysis.questions || []).map((question) => [question.id, "open"]));
  state.expanded = Object.fromEntries((analysis.questions || []).map((question, index) => [question.id, index === 0]));
}

async function readResumeForModel(file) {
  const extension = file.name.split(".").pop().toLowerCase();
  const textTypes = ["txt", "md", "markdown", "json"];
  if (textTypes.includes(extension) || file.type.startsWith("text/")) {
    return {
      kind: "text",
      fileName: file.name,
      mimeType: file.type || "text/plain",
      text: await readFileAsText(file),
    };
  }

  const dataUrl = await readFileAsDataURL(file);
  const base64 = dataUrl.split(",")[1] || "";
  if (!base64) throw new Error("文件读取失败，未获得 base64 内容");
  return {
    kind: "file",
    fileName: file.name,
    mimeType: file.type || inferMimeType(file.name),
    base64,
  };
}

async function callLLMJson(messages) {
  if (LLM_CONFIG.useHardcodedResult) {
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    return deepClone(HARDCODED_MODEL_ANALYSIS);
  }

  const url = `${LLM_CONFIG.baseURL.replace(/\/$/, "")}/chat/completions`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LLM_CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model: LLM_CONFIG.model,
      temperature: 0.2,
      messages,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`大模型调用失败：${detail || response.status}`);
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("大模型没有返回内容");
  return parseJsonFromModel(content);
}

const ANALYSIS_SCHEMA_PROMPT = `
输出 JSON 顶层字段：
- candidate
- dimensions
- questions
- interviewerTips
- meta

candidate 必含字段：
name, targetRole, summary, education, experience, otherExperience, skills, certificates, highlights, risks, metrics

questions 要求：
- 生成 8-12 道
- 每道题字段：id, dimension, topic, background, openEnded, situational, tips

数组项格式：
- metrics: [{ "label": "", "value": "" }]
- dimensions: [{ "name": "", "note": "" }]
- interviewerTips: ["..."]

meta 固定格式：
{ "parserVersion": "v1", "model": "${LLM_CONFIG.model}", "confidence": 0 }
`.trim();

function buildInitialSystemPrompt() {
  return [
    "你是资深 HR 面试设计专家，负责把候选人简历解析成结构化 JSON。",
    "仅返回纯 JSON，不要 Markdown、代码块或解释。",
    "缺失字段用空字符串或空数组，不要删字段。",
    "问题必须引用简历事实，避免泛泛而谈。",
    "如果输入是 base64 文件内容，直接按原始简历文件解析。",
  ].join("\n");
}

function buildInitialMessages({ fileName, targetRole, resumeInput }) {
  const userContent =
    resumeInput.kind === "text"
      ? buildTextResumePrompt({ fileName, targetRole, resumeText: resumeInput.text })
      : buildFileResumePrompt({ fileName, targetRole, resumeInput });

  return [
    {
      role: "system",
      content: buildInitialSystemPrompt(),
    },
    {
      role: "user",
      content: userContent,
    },
  ];
}

function buildTextResumePrompt({ fileName, targetRole, resumeText }) {
  return `
任务：根据简历和目标岗位生成结构化结果。
${ANALYSIS_SCHEMA_PROMPT}
文件名：${fileName}
目标岗位：${targetRole || "未填写"}

简历文本：
${resumeText}
  `.trim();
}

function buildFileResumePrompt({ fileName, targetRole, resumeInput }) {
  return `
任务：直接解析简历文件并按目标岗位生成结构化结果。
${ANALYSIS_SCHEMA_PROMPT}
文件名：${fileName}
目标岗位：${targetRole || "未填写"}
MIME 类型：${resumeInput.mimeType}

文件 base64 内容如下。请把它当作原始简历文件解析：
${resumeInput.base64}
  `.trim();
}

function buildSectionMessages({ section, analysis, extraPrompt }) {
  const meta = SECTION_META[section];
  const context = buildSectionContextPayload(section, analysis, extraPrompt);
  return [
    {
      role: "system",
      content: [
        "你是资深 HR 面试设计专家。",
        "你正在局部重生成一个结构化 JSON 区块。",
        "仅返回纯 JSON，不要 Markdown、代码块或解释。",
        `只返回一个对象，且只包含 ${section} 这一个顶层字段。`,
        "优先使用提供的最小上下文，不要臆造简历中不存在的事实。",
      ].join("\n"),
    },
    {
      role: "user",
      content: `
请仅重新生成区块：${section}（${meta.title}）。

区块说明：${meta.description}
上下文（JSON）：
${toPrettyJson(context)}
      `.trim(),
    },
  ];
}

function buildSectionContextPayload(section, analysis, extraPrompt) {
  const candidate = analysis.candidate || {};
  const topHighlights = (candidate.highlights || []).slice(0, 4);
  const topRisks = (candidate.risks || []).slice(0, 4);
  const topMetrics = (candidate.metrics || []).slice(0, 4);
  const topExperience = (candidate.experience || []).slice(0, 3);
  const topEducation = (candidate.education || []).slice(0, 2);
  const dimensions = (analysis.dimensions || []).map((item) => ({ name: item.name, note: item.note }));
  const existingQuestions = (analysis.questions || []).slice(0, 8).map((item) => ({
    id: item.id,
    dimension: item.dimension,
    topic: item.topic,
  }));
  const resumeExcerpt = extractResumeExcerptBySection(section, analysis.source?.resumeText || "");

  const baseContext = {
    targetRole: analysis.source?.targetRole || candidate.targetRole || "",
    userRequirement: extraPrompt || "",
    resumeExcerpt,
    candidateBrief: {
      name: candidate.name || "",
      summary: candidate.summary || "",
      highlights: topHighlights,
      risks: topRisks,
      metrics: topMetrics,
    },
    currentSectionValue: analysis[section],
  };

  if (section === "candidate") {
    return {
      ...baseContext,
      relevantFacts: {
        education: topEducation,
        experience: topExperience,
        skills: (candidate.skills || []).slice(0, 12),
        certificates: (candidate.certificates || []).slice(0, 8),
      },
    };
  }

  if (section === "dimensions") {
    return {
      ...baseContext,
      relevantFacts: {
        skills: (candidate.skills || []).slice(0, 10),
        topExperience,
        highlights: topHighlights,
        risks: topRisks,
      },
    };
  }

  if (section === "questions") {
    return {
      ...baseContext,
      relevantFacts: {
        dimensions,
        topExperience,
        topMetrics,
        risks: topRisks,
        existingQuestions,
      },
    };
  }

  return {
    ...baseContext,
    relevantFacts: {
      topExperience,
      topMetrics,
      risks: topRisks,
      existingQuestions,
    },
  };
}

function extractResumeExcerptBySection(section, resumeText) {
  if (!resumeText) return "";
  const lines = String(resumeText)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const keywordsBySection = {
    candidate: ["教育", "经历", "实习", "项目", "技能", "证书", "GPA", "summary"],
    dimensions: ["职责", "成果", "能力", "技能", "项目", "协作", "数据"],
    questions: ["经历", "项目", "成果", "提升", "%", "负责", "难点", "复盘"],
    interviewerTips: ["风险", "亮点", "成果", "数据", "离职", "动机", "匹配"],
  };

  const keywords = keywordsBySection[section] || [];
  const matched = lines.filter((line) => keywords.some((keyword) => line.includes(keyword)));
  const merged = (matched.length ? matched : lines.slice(0, 24)).join("\n");
  return merged.slice(0, 2200);
}

function parseJsonFromModel(content) {
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const startObject = cleaned.indexOf("{");
    const endObject = cleaned.lastIndexOf("}");
    if (startObject >= 0 && endObject > startObject) {
      return JSON.parse(cleaned.slice(startObject, endObject + 1));
    }
    throw new Error("大模型返回的内容不是合法 JSON");
  }
}

function normalizeAnalysis(raw, sourceFallback = {}) {
  const candidate = normalizeCandidate(raw?.candidate || {});
  const dimensions = normalizeDimensions(raw?.dimensions);
  const questions = normalizeQuestions(raw?.questions, dimensions);
  const interviewerTips = toStringArray(raw?.interviewerTips);
  const source = {
    fileName: sourceFallback.fileName || raw?.source?.fileName || "",
    targetRole: sourceFallback.targetRole || raw?.source?.targetRole || candidate.targetRole || "",
    resumeText: sourceFallback.resumeText || raw?.source?.resumeText || "",
    updatedAt: sourceFallback.updatedAt || raw?.source?.updatedAt || new Date().toISOString(),
  };
  candidate.targetRole = candidate.targetRole || source.targetRole;

  return {
    candidate,
    dimensions,
    questions,
    interviewerTips,
    source,
    meta: {
      parserVersion: raw?.meta?.parserVersion || "v1",
      model: sourceFallback.model || raw?.meta?.model || LLM_CONFIG.model,
      confidence: Number(raw?.meta?.confidence || 0),
    },
  };
}

function normalizeCandidate(candidate) {
  const metrics = Array.isArray(candidate.metrics)
    ? candidate.metrics.map((item) => ({
        label: String(item?.label || ""),
        value: String(item?.value || ""),
      }))
    : [];

  return {
    name: String(candidate.name || ""),
    targetRole: String(candidate.targetRole || ""),
    summary: String(candidate.summary || ""),
    education: toDisplayArray(candidate.education),
    experience: toDisplayArray(candidate.experience),
    otherExperience: toDisplayArray(candidate.otherExperience),
    skills: toDisplayArray(candidate.skills),
    certificates: toDisplayArray(candidate.certificates),
    highlights: toDisplayArray(candidate.highlights),
    risks: toDisplayArray(candidate.risks),
    metrics,
  };
}

function normalizeDimensions(dimensions) {
  const source = Array.isArray(dimensions) && dimensions.length ? dimensions : DEFAULT_DIMENSIONS;
  return source.map((dimension) => ({
    name: String(dimension.name || ""),
    note: String(dimension.note || ""),
  }));
}

function normalizeQuestions(questions, dimensions) {
  const validDimensions = new Set(dimensions.map((dimension) => dimension.name));
  return (Array.isArray(questions) ? questions : []).map((question, index) => {
    const dimension = String(question.dimension || dimensions[0]?.name || "综合能力");
    return {
      id: String(question.id || `q${index + 1}`),
      dimension: validDimensions.has(dimension) ? dimension : dimension,
      topic: String(question.topic || `定制问题 ${index + 1}`),
      background: String(question.background || ""),
      openEnded: String(question.openEnded || ""),
      situational: String(question.situational || ""),
      tips: toDisplayArray(question.tips),
    };
  });
}

function syncEditorText() {
  state.editorText = {
    candidate: toPrettyJson(state.analysisDraft.candidate),
    dimensions: toPrettyJson(state.analysisDraft.dimensions),
    questions: toPrettyJson(state.analysisDraft.questions),
    interviewerTips: toPrettyJson(state.analysisDraft.interviewerTips),
  };
}

function saveAnalysis(analysis) {
  localStorage.setItem(STORAGE_KEYS.current, JSON.stringify(analysis));
  const history = readHistory();
  history.unshift({
    savedAt: new Date().toISOString(),
    fileName: analysis.source.fileName,
    targetRole: analysis.source.targetRole,
    analysis,
  });
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history.slice(0, 10)));
}

function readSavedAnalysis() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.current);
    return raw ? normalizeAnalysis(JSON.parse(raw), JSON.parse(raw).source) : null;
  } catch {
    return null;
  }
}

function readHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || "[]");
  } catch {
    return [];
  }
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsText(file, "utf-8");
  });
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsDataURL(file);
  });
}

function inferMimeType(fileName) {
  const extension = fileName.split(".").pop().toLowerCase();
  const mimeMap = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    doc: "application/msword",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
  };
  return mimeMap[extension] || "application/octet-stream";
}

function ensureLLMConfigured() {
  if (LLM_CONFIG.useHardcodedResult) return;
  if (!LLM_CONFIG.apiKey || LLM_CONFIG.apiKey.includes("PASTE_YOUR")) {
    throw new Error("请先在 app.js 顶部的 LLM_CONFIG.apiKey 写入 OpenAI-compatible API Key。");
  }
}

function llmStatusText() {
  if (LLM_CONFIG.useHardcodedResult) {
    return "当前使用写死的大模型解析结果，不会发起真实模型请求。";
  }
  if (!LLM_CONFIG.apiKey || LLM_CONFIG.apiKey.includes("PASTE_YOUR")) {
    return "当前尚未填写大模型 API Key：请在 app.js 顶部 LLM_CONFIG.apiKey 中配置。";
  }
  return `当前模型：${LLM_CONFIG.model}，接口：${LLM_CONFIG.baseURL}`;
}

function toStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item || "")).filter(Boolean);
}

function toDisplayArray(value) {
  if (typeof value === "string") return value ? [value] : [];
  if (!Array.isArray(value)) return [];
  return value.map(formatDisplayItem).filter(Boolean);
}

function formatDisplayItem(item) {
  if (!item) return "";
  if (typeof item === "string") return item;
  if (typeof item !== "object") return String(item);

  const title = item.school || item.company || item.name || item.role || "";
  const role = item.role && item.role !== title ? item.role : "";
  const majorDegree = [item.degree, item.major].filter(Boolean).join(" ");
  const period = [item.startDate, item.endDate].filter(Boolean).join(" - ");
  const description = item.description || "";
  return [title, role, majorDegree, period, description].filter(Boolean).join("；");
}

function toPrettyJson(value) {
  return JSON.stringify(value, null, 2);
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function getTone(dimension) {
  if (dimension === "抗压性") return "red";
  if (dimension === "是否挑活") return "green";
  if (dimension === "AI工具应用") return "purple";
  if (dimension === "自驱动学习") return "gray";
  return "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

render();
