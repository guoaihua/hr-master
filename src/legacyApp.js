import { assertSupportedResumeFile } from "./lib/fileUtils.js";
import {
  readHistory as readHistoryFromStorage,
  readSavedAnalysis as readSavedAnalysisFromStorage,
  saveAnalysis as saveAnalysisToStorage,
} from "./lib/storage.js";
import { bindHeaderActions, bindPreviewActions, bindWorkbenchActions } from "./legacy/bindings.js";
import {
  createState,
  hydrateWorkbenchState as hydrateWorkbenchStateInStore,
  resetToUploadState,
  toggleEditingSection,
} from "./legacy/store.js";
import { renderUpload as renderUploadView, renderPreview as renderPreviewView, renderWorkbench as renderWorkbenchView } from "./legacy/views.js";
import {
  ensureLLMConfigured,
  llmStatusText,
  parseResumeWithServer,
  regenerateSectionWithServer,
} from "./lib/llm.js";

const LLM_CONFIG = {
  model: "mimo-v2.5-pro",
  useHardcodedResult: false,
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
    name: "候选人A",
    targetRole: "HR实习生-招聘方向",
    summary:
      "某重点高校数字媒体相关专业2028届本科在读。拥有游戏策划助理实习生、互联网运营实习生经验，掌握用户研究、数据分析、内容策划与用户运营技能。具备数据分析工具技能（Excel、SPSS、SQL）及游戏引擎使用经验（Cocos Creator），辅修经济学，逻辑分析能力较强。期望转向HR（招聘方向）领域，将技术背景与人际敏感度结合。",
    education: [
      {
        school: "某重点高校",
        major: "数字媒体技术",
        degree: "本科",
        startDate: "2024-09",
        endDate: "2028-06",
        description: "GPA：3.5/4.0（前15%）。辅修经济学。核心课程：游戏程序设计、用户研究与测试、多媒体技术。",
      },
    ],
    experience: [
      {
        company: "某头部互联网公司",
        role: "游戏策划助理实习生",
        startDate: "2025-07",
        endDate: "2025-10",
        description:
          "1. 参与2款移动端游戏的新手引导流程优化，通过用户行为数据埋点与AB测试，将新手次日留存率提升了8%。\n2. 协助资深策划进行竞品分析，完成3份详细的竞品体验报告，提出5项功能优化建议，其中2项被采纳并排期开发。\n3. 参与需求文档的撰写与维护，确保开发、美术团队对需求理解一致，减少沟通返工。",
      },
      {
        company: "某大型内容平台公司",
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
      openEnded: "你对招聘工作的理解是什么？它和你在过往用户研究、内容运营工作中积累的能力有哪些底层共通点？",
      situational: "假设你成功入职，在协助校招时，遇到一个专业对口但性格内向、表达不佳的候选人，你会如何向面试官推荐或评估他？",
      tips:
        "关注回答的逻辑性和深度，是否将“用户研究”思维迁移到“候选人评估”，将“内容运营”能力与“雇主品牌建设”联系起来。",
    },
    {
      id: 2,
      dimension: "用户/人际敏感度",
      topic: "从用户洞察到候选人洞察",
      background:
        "你在过往实习中通过用户行为数据优化流程，也通过调研整理过用户需求画像。请分享一个你通过观察或分析，深入理解某个用户（或同学/队友）真实需求或性格特点的实例。",
      openEnded: "如果让你用做用户研究的方法（如问卷、访谈）来评估一个岗位的候选人画像，你会关注哪些维度？",
      situational: "在一次模拟群面中，你观察到一位候选人很安静，但发言时逻辑特别清晰。另一位候选人很活跃，但观点有些发散。你会如何快速记录和评价这两位？",
      tips: "考察其是否具备将用户分析能力转化为识人能力的潜力。关注其描述是否具体，分析是否透彻。",
    },
    {
      id: 3,
      dimension: "沟通与协调能力",
      topic: "跨团队协作与文档能力",
      background: "你提到在过往实习中撰写需求文档并协同开发、设计等角色。请描述一个你遇到的沟通困难（例如理解偏差），你是如何解决的？",
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

const SAMPLE_RESUME_TEXT = `候选人B（HR实习生-招聘方向）
教育背景：某师范类高校硕士在读（公共管理学-社会保障方向），某综合院校本科（劳动与社会保障）。
核心经历：曾于某数字化企业和某工业软件企业担任人力实习生，具备全流程招聘支持经验，尤其在研发、销售、售前等岗位的社招和校招方面有具体成果，如成功招聘技术岗位5人，售前签约7人等。
其他经历：曾任某学院办公室助理、年级学生组织负责人，参与过基层政府办公室助理工作，具备文件管理、信息传达、会议准备、安全管理、评议工作、沟通协调等经验。
技能证书：大学生英语六级、全国计算机二级证书、高中教师资格证。`;

const SAMPLE_ANALYSIS = {
  candidate: {
    name: "候选人B",
    targetRole: "HR实习生-招聘方向",
    summary:
      "候选人具备科技公司 HR 实习经历，参与过研发、销售、售前等岗位招聘，并有较多量化成果。其公共管理与劳动保障背景、教师资格证和学生干部经历可作为沟通表达、流程意识和学习迁移能力的补充侧证。",
    education: [
      "某师范类高校硕士在读，公共管理学-社会保障方向",
      "某综合院校本科，劳动与社会保障",
    ],
    experience: [
      "某数字化企业，人力实习生，参与销售、售前、项目经理等岗位招聘支持",
      "某工业软件企业，人力实习生，参与 C++ 开发、测试、人力实习生等岗位招聘支持",
    ],
    otherExperience: [
      "某学院办公室助理",
      "年级学生会生活部部长",
      "基层政府办公室助理",
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
    fileName: "匿名候选人样例.md",
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

let app = null;

const state = createState(readSavedAnalysisFromStorage(STORAGE_KEYS, normalizeAnalysis));

if (state.savedAnalysis) {
  state.view = "workbench";
  hydrateWorkbenchState(state.savedAnalysis);
}

function getViewHelpers() {
  return {
    LLM_CONFIG,
    SECTION_META,
    llmStatusText,
    bindHeaderActions,
    bindPreviewActions,
    bindWorkbenchActions,
    processFile,
    applySectionEdit,
    regenerateSection,
    confirmAndSave,
    toggleEditingSection,
    renderPreview,
    renderWorkbench,
    render,
    openPreview,
    hydrateWorkbenchState,
    resetToUploadState,
    sampleAnalysis: SAMPLE_ANALYSIS,
    deepClone,
    toPrettyJson,
  };
}

function render() {
  if (state.view === "preview") {
    renderPreviewView(app, state, getViewHelpers());
    return;
  }
  if (state.view === "workbench") {
    renderWorkbenchView(app, state, getViewHelpers());
    return;
  }
  renderUploadView(app, state, getViewHelpers());
}

function renderUpload() {
  renderUploadView(app, state, getViewHelpers());
}

function renderPreview() {
  renderPreviewView(app, state, getViewHelpers());
}

function renderWorkbench() {
  renderWorkbenchView(app, state, getViewHelpers());
}

async function processFile(file, targetRole) {
  state.error = "";
  state.status = "正在读取简历文件";
  state.progress = 16;
  render();

  try {
    ensureLLMConfigured(LLM_CONFIG);
    assertSupportedResumeFile(file);

    state.status = "正在提交大模型解析简历";
    state.progress = 58;
    render();

    const rawAnalysis = await generateInitialAnalysis({
      file,
      targetRole,
    });

    const analysis = normalizeAnalysis(rawAnalysis, {
      fileName: file.name,
      targetRole,
      updatedAt: new Date().toISOString(),
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

async function generateInitialAnalysis({ file, targetRole }) {
  return parseResumeWithServer(file, targetRole, LLM_CONFIG, HARDCODED_MODEL_ANALYSIS, deepClone);
}

async function regenerateSection(section) {
  try {
    applySectionEdit(section, { silent: true });
    ensureLLMConfigured(LLM_CONFIG);
    state.error = "";
    state.status = `正在重新生成${SECTION_META[section].title}`;
    state.progress = 62;
    renderPreview();

    const extraPrompt = document.querySelector(`[data-extra="${section}"]`)?.value || "";
    const payload = await regenerateSectionWithServer({
      section,
      analysis: state.analysisDraft,
      extraPrompt,
      llmConfig: LLM_CONFIG,
      hardcodedAnalysis: HARDCODED_MODEL_ANALYSIS,
      deepClone,
    });
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
    saveAnalysisToStorage(STORAGE_KEYS, confirmed);
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
  hydrateWorkbenchStateInStore(state, analysis);
}

// LLM helpers moved to src/lib/llm.js

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

function readHistory() {
  return readHistoryFromStorage(STORAGE_KEYS);
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

export function mountLegacyApp(containerSelector = "#app") {
  app = document.querySelector(containerSelector);
  if (!app) {
    throw new Error(`Mount container not found: ${containerSelector}`);
  }

  render();
}

export function unmountLegacyApp() {
  if (app) {
    app.innerHTML = "";
  }
}
