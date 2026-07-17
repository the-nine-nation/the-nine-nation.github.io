import type { ParticipantProfile } from "./profile";

export type ScoreKey =
  | "EI" | "NS" | "FT" | "PJ"
  | "O" | "C" | "E" | "A" | "N"
  | "SEC" | "ANX" | "AVD"
  | "RES" | "RUM" | "AVOID" | "REAPP" | "ACT"
  | "BOUND" | "FLEX" | "SELF"
  | "V_AUTO" | "V_CONN" | "V_GROW" | "V_SEC" | "V_ACH"
  | "ATTR_WARM" | "ATTR_VITAL" | "ATTR_CAPABLE" | "ATTR_AUTO"
  | "APPEAL_CARE" | "APPEAL_SPARK" | "APPEAL_STEADY" | "APPEAL_AUTO";

export type Choice = {
  title: string;
  note: string;
  emoji: string;
  scores: Partial<Record<ScoreKey, number>>;
};

export type Question = {
  id: string;
  round: 1 | 2 | 3;
  chapter: string;
  mode: string;
  scene: string;
  prompt: string;
  hint: string;
  focus: ScoreKey[];
  choices: Choice[];
};

export type AnswerRecord = { questionId: string; choice: number; secondaryChoice?: number };

type Seed = [string, string, string, Partial<Record<ScoreKey, number>>];
const q = (
  id: string,
  round: 1 | 2 | 3,
  chapter: string,
  mode: string,
  scene: string,
  prompt: string | ScoreKey[],
  focus: ScoreKey[] | Seed[],
  choices?: Seed[],
  hint = "别选“最正确”的。按最近三个月，主选最常发生或最先发生的一项；真的并列时再加一个次选。",
): Question => {
  const compact = Array.isArray(prompt);
  const finalPrompt = compact ? scene : prompt;
  const finalFocus = (compact ? prompt : focus) as ScoreKey[];
  const finalChoices = (compact ? focus : choices) as Seed[];
  return {
    id, round, chapter, mode,
    scene: compact ? "这道题不绕弯，直接看你最常启动的内在程序。" : scene,
    prompt: finalPrompt,
    focus: finalFocus,
    hint,
    choices: finalChoices.map(([title, note, emoji, scores]) => ({ title, note, emoji, scores })),
  };
};

const roundOne: Question[] = [
  q("r1_party", 1, "快速扫描 01", "社交电量预警", "你被拉进一个只有主办方认识你的饭局。空气里飘着礼貌和一点点绝望。", "如果没人主动带你，落座后的前十分钟你通常先做什么？", ["EI", "E"], [
    ["已经和隔壁桌聊到合伙创业", "人名还没记住，气氛先盘活", "🗣️", { EI: 3, E: 3 }],
    ["锁定一个顺眼的人深聊", "人可以少，话不能浅", "🎯", { EI: -2, E: -1, SEC: 1 }],
    ["认真研究菜单，假装这很重要", "给系统一点缓冲时间", "📖", { EI: -3, E: -2, AVD: 1 }],
    ["先观察谁和谁是什么关系", "社交前先读空气说明书", "🛰️", { EI: -1, N: 1, A: 1 }],
  ]),
  q("r1_idea", 1, "快速扫描 02", "脑洞泄漏测试", "同事说：‘我们要做一个更有未来感的东西。’这句话信息量约等于没有。", "遇到这种模糊要求，你的第一反应是？", ["NS", "O"], [
    ["先问用户、预算和截止日", "未来感也得先过现实安检", "📊", { NS: -3, C: 2 }],
    ["瞬间冒出六个跨界概念", "大脑已经把会开到火星", "🛸", { NS: 3, O: 3 }],
    ["找几个案例拼出方向", "先借别人的路灯照一照", "🧩", { NS: 1, O: 2, C: 1 }],
    ["做个粗糙原型再说", "嘴上未来，不如手上有东西", "🛠️", { NS: -1, ACT: 2, O: 1 }],
  ]),
  q("r1_conflict", 1, "快速扫描 03", "会议室逃生", "团队争论进入第 47 分钟，PPT 已经比人更有生命力。", "假设你有权推动下一步，你通常先用哪种办法破局？", ["FT", "A", "C"], [
    ["把判断标准写上白板", "先统一尺子，再量方案", "📐", { FT: -3, C: 2 }],
    ["先问大家真正担心什么", "争的是方案，卡的是情绪", "🫶", { FT: 3, A: 3 }],
    ["选最小版本跑个实验", "让现实替大家吵完", "🧪", { FT: -1, ACT: 3, O: 1 }],
    ["总结共识并分配下一步", "会议总得有个葬礼", "🧾", { FT: -1, C: 3, BOUND: 1 }],
  ]),
  q("r1_weekend", 1, "快速扫描 04", "周末操作系统", "周六醒来，全天空白，没人催你，连天气都不表态。", "不考虑必须完成的家务，你通常先怎么安排这一天？", ["PJ", "C", "FLEX"], [
    ["昨晚已经排好三个项目", "自由来自日程表没有爆炸", "🗓️", { PJ: -3, C: 3 }],
    ["先出门，路上再决定", "计划会妨碍偶遇", "🚲", { PJ: 3, FLEX: 2, O: 1 }],
    ["只定一件大事，其他随缘", "给生活留接口", "🧷", { PJ: 1, C: 1, FLEX: 2 }],
    ["刷半天攻略后决定不出门", "选项太多，系统暂停响应", "🛋️", { PJ: -1, RUM: 2, AVOID: 1 }],
  ]),
  q("r1_reply", 1, "快速扫描 05", "关系气象播报", "你给重要的人发了一段认真消息，对方六小时没回，却刚发了朋友圈。", "看到那条朋友圈的瞬间，最先冒出的念头是？", ["SEC", "ANX", "AVD", "N"], [
    ["他可能还没准备好回", "沉默不等于关系塌方", "🌤️", { SEC: 3, N: -2 }],
    ["好，开始逐字复盘我哪里不对", "聊天记录立刻进入刑侦模式", "🔍", { ANX: 3, RUM: 2, N: 3 }],
    ["行，那我也消失", "撤退键永远比求助键顺手", "🧊", { AVD: 3, A: -1 }],
    ["晚点直接问他现在方便聊吗", "不做读心术外包", "💬", { SEC: 2, BOUND: 2, ACT: 1 }],
  ]),
  q("r1_mistake", 1, "快速扫描 06", "翻车善后局", "你把一个重要文件发错了版本。群里安静了三秒，像在为你默哀。", "发现后的第一分钟，你通常先出现哪种反应？", ["N", "RES", "SELF", "ACT"], [
    ["先只顾补救，情绪晚点处理", "先止血，晚点再尴尬", "🧯", { ACT: 3, RES: 2, C: 2 }],
    ["脑内循环播放‘我怎么这么蠢’", "错误已修，内审仍在加班", "🌀", { RUM: 3, N: 3, SELF: -2 }],
    ["装作没看见，希望宇宙替我处理", "一种很人类的延迟战术", "🫥", { AVOID: 3, RES: -1 }],
    ["先承认翻车，用玩笑稳住自己", "尊严保住了，文件也保住了", "🪄", { REAPP: 3, RES: 3, SELF: 2 }],
  ]),
  q("r1_help", 1, "快速扫描 07", "求助按钮耐久度", "一个项目已经把你卡成了静态图片，但别人并不知道。", "按最近三个月的真实情况，你通常卡到什么程度才开口？", ["BOUND", "SEC", "AVD"], [
    ["刚发现卡点就同步", "求助是协作，不是认输", "📣", { SEC: 2, BOUND: 2, EI: 1 }],
    ["先自己试几轮，设个止损点", "独立，但不无限硬扛", "⏱️", { BOUND: 3, C: 2, RES: 1 }],
    ["直到截止前一晚才承认", "不是不求助，是铺垫比较长", "🌚", { AVD: 2, AVOID: 2, N: 1 }],
    ["别人主动问起才顺便说", "希望求助看起来像偶然", "🎭", { ANX: 1, AVD: 2, BOUND: -1 }],
  ]),
  q("r1_reward", 1, "快速扫描 08", "人生充值渠道", "你忙完一段很累的时期，突然多出三天空档。预算都够，但四种安排只能保留一种。", "你最舍不得放弃哪种奖励？", ["V_AUTO", "V_CONN", "V_GROW", "V_SEC"], [
    ["一个人去没去过的地方", "没人安排我，就是顶级服务", "🧭", { V_AUTO: 3, O: 2 }],
    ["和最亲近的人好好待几天", "恢复电量靠高质量连接", "🍲", { V_CONN: 3, SEC: 2 }],
    ["学一个一直想学的新东西", "休息方式是升级系统", "🧠", { V_GROW: 3, O: 2 }],
    ["彻底躺平，熟悉的床和熟悉的外卖", "安全感就是不用做新决定", "🛏️", { V_SEC: 3, N: -1 }],
  ]),
  q("r1_praise", 1, "快速扫描 09", "夸奖入账测试", "有人认真夸你做得很好，而且不像客套。", "听到后的前三秒，最先出现的反应是？", ["SELF", "ANX", "V_ACH"], [
    ["谢谢，我也挺满意这次", "夸奖正常入账，不退票", "😌", { SELF: 3, SEC: 1 }],
    ["立刻解释其实没那么好", "反手给赞美打八折", "🙈", { SELF: -2, ANX: 1, A: 1 }],
    ["开心三秒，然后想下一次能不能更好", "成就感刚坐下，目标感又站起来", "📈", { V_ACH: 3, C: 2 }],
    ["怀疑他是不是有事要拜托我", "好消息先过风控", "🕵️", { ANX: 2, N: 2 }],
  ]),
  q("r1_change", 1, "快速扫描 10", "临时改版通知", "期待已久的计划临时取消，理由合理，但你的心情并不讲理。", "取消后的前半小时，你通常先做什么？", ["FLEX", "RES", "REAPP", "N"], [
    ["马上找一个替代方案", "情绪还没到站，人先换乘", "🔀", { FLEX: 3, ACT: 3, RES: 2 }],
    ["先允许自己郁闷一阵", "不强行积极，也不永久居住", "🌧️", { SELF: 2, RES: 2, FT: 1 }],
    ["反复想象原计划本来会多好", "取消的是行程，脑内还在上映", "🎞️", { RUM: 3, N: 2 }],
    ["告诉自己这也许省下了麻烦", "给损失换一个叙事角度", "🔄", { REAPP: 3, FLEX: 2 }],
  ]),
];

const roundTwoBase: Question[] = [
  q("r2_credit", 2, "盲区校准", "功劳分配现场", "项目成功了，领导把大部分功劳算在你头上，但你知道队友也出了大力。", "领导话音刚落，你最可能先做什么？", ["FT", "A", "BOUND"], [
    ["当场补充每个人的贡献", "准确比独占掌声重要", "🎙️", { A: 3, SEC: 1, BOUND: 1 }],
    ["先接受，私下再感谢队友", "不拆台，也不忘人情", "🤝", { FT: 1, A: 2 }],
    ["功劳属于负责结果的人", "责任和荣誉最好配套", "🏆", { FT: -3, V_ACH: 2 }],
    ["太尴尬了，赶紧把话题带走", "赞美太亮，先关一盏灯", "💨", { SELF: -1, AVOID: 2 }],
  ]),
  q("r2_promise", 2, "盲区校准", "人情债压力测试", "朋友临时请你帮忙，但你今晚真的只想瘫着，而且现在必须答复。", "你脱口而出的回应最接近哪一种？", ["BOUND", "A"], [
    ["答应，然后一边帮一边怨", "嘴说可以，灵魂提起诉讼", "🙂", { A: 2, BOUND: -3, RUM: 1 }],
    ["说明状态，看看能否换时间", "关系不是靠透支续费", "🧾", { BOUND: 3, SEC: 2 }],
    ["直接拒绝，不解释太多", "边界清楚，售后简洁", "🚧", { BOUND: 3, FT: -1, V_AUTO: 1 }],
    ["先问事情有多急再决定", "同理心也需要优先级", "🚦", { FT: -1, A: 2, FLEX: 1 }],
  ]),
  q("r2_feedback", 2, "盲区校准", "差评读取方式", "你收到九句肯定和一条尖锐意见。第二天醒来，不许翻原文。", "脑中最先自动回放的是哪一部分？", ["N", "SELF", "V_GROW"], [
    ["那条尖锐意见，逐字高清", "九句好话被一句差评团灭", "📌", { N: 3, RUM: 3 }],
    ["整体评价和可执行建议", "情绪归情绪，信息归信息", "🧰", { REAPP: 2, V_GROW: 2, RES: 2 }],
    ["肯定的部分，先让自己开心", "优点也值得认真接收", "🌞", { SELF: 3, N: -1 }],
    ["谁写的、为什么这样写", "内容之外，先分析动机", "🧬", { NS: 2, ANX: 1 }],
  ]),
  q("r2_unknown", 2, "盲区校准", "信息不足警报", "你要做一个重要决定，可靠信息只有六成，但今天必须迈出一步。", "你通常先做哪一步？", ["PJ", "FLEX", "ACT"], [
    ["继续搜，直到接近确定", "未知太多，按钮按不下去", "📚", { PJ: -2, C: 2, RUM: 1 }],
    ["先做可逆的那一步", "不赌全部，先买一张试用券", "🪜", { ACT: 3, FLEX: 2, RES: 1 }],
    ["凭直觉直接选", "信息六成，气势十成", "🎲", { PJ: 3, O: 2 }],
    ["找一个懂行的人校准", "借脑子，不交出方向盘", "🧑‍🚀", { SEC: 1, C: 1, BOUND: 1 }],
  ]),
  q("r2_silence", 2, "盲区校准", "安静房间实验", "独处两小时，没有手机、书和待办。只剩你和你那位话很多的大脑。", "前半小时里，占比最大的体验是什么？", ["EI", "RUM", "SELF"], [
    ["终于安静了，电量上涨", "内心房间比外面宽敞", "🔋", { EI: -3, SELF: 2 }],
    ["很快开始想找点事做", "可以独处，但别无限续杯", "🪫", { E: 1 }],
    ["脑内旧案集中重审", "安静自动升级为思想法庭", "⚖️", { RUM: 3, N: 2 }],
    ["冒出很多想法，甚至有点兴奋", "无输入时，想象力开始营业", "💡", { NS: 2, O: 3 }],
  ]),
  q("r2_romantic_spark", 2, "盲区校准", "心动雷达校准", "聚会里有四个人，外形吸引力对你来说差不多。聊天十分钟后，你只能继续认识一位。", "哪种特质最让你想继续聊？", ["ATTR_WARM", "ATTR_VITAL", "ATTR_CAPABLE", "ATTR_AUTO"], [
    ["认真听，也记得你刚说的细节", "被理解，比台词漂亮更有效", "🫶", { ATTR_WARM: 3, V_CONN: 1 }],
    ["有趣鲜活，能把普通话题聊出新路", "空气突然有了隐藏关卡", "✨", { ATTR_VITAL: 3, O: 1 }],
    ["思路清楚，谈起想做的事很有行动力", "能力感自带微弱聚光灯", "🧭", { ATTR_CAPABLE: 3, V_ACH: 1 }],
    ["有自己的世界，不急着黏住或证明什么", "靠近，但不抢方向盘", "🌿", { ATTR_AUTO: 3, V_AUTO: 1 }],
  ]),
  q("r2_appeal_signal", 2, "盲区校准", "你的引力说明", "你刚认识一个有好感的人，还没确定对方是否也喜欢你。", "你最自然会释放哪种信号？", ["APPEAL_CARE", "APPEAL_SPARK", "APPEAL_STEADY", "APPEAL_AUTO"], [
    ["认真回应，让对方感到被看见", "关心不是套路，是默认程序", "🫂", { APPEAL_CARE: 3, A: 1 }],
    ["分享脑洞，把相处变得有趣", "先让聊天摆脱出厂设置", "🎈", { APPEAL_SPARK: 3, O: 1 }],
    ["说到做到，用可靠行动表达在意", "浪漫不飘，落地还有回执", "🧱", { APPEAL_STEADY: 3, C: 1 }],
    ["保持分寸，不催促关系立刻定型", "有兴趣，但不接管彼此人生", "🪁", { APPEAL_AUTO: 3, BOUND: 1 }],
  ]),
  q("r2_apology", 2, "盲区校准", "道歉质量检测", "你伤到了一个人，但你的本意并不坏。对方正在等你回应。", "你开口后的第一句话更接近哪一种？", ["SEC", "FT", "SELF"], [
    ["对不起，我理解这让你难受", "先承认影响，不拿动机挡箭", "🫂", { SEC: 3, A: 3, SELF: 1 }],
    ["我不是那个意思，你误会了", "先抢救动机，再处理现场", "🛡️", { AVD: 2, FT: -1 }],
    ["告诉我怎样补救会更有用", "道歉最好带修复方案", "🧰", { ACT: 2, FT: -2, SEC: 2 }],
    ["我……晚点再和你说", "愧疚很满，表达卡在加载页", "⌛", { ANX: 2, AVOID: 2, N: 1 }],
  ]),
  q("r2_future", 2, "盲区校准", "五年后随堂抽查", "五年后的四种生活不能同时实现，你只能先保住一种。", "哪一种最不能被交换掉？", ["V_AUTO", "V_SEC", "V_GROW", "V_ACH"], [
    ["职位、收入、作品都比较具体", "未来最好能做成表格", "📍", { V_ACH: 3, C: 2 }],
    ["有选择权，不被单一路径困住", "最贵的奢侈品叫可退出", "🗝️", { V_AUTO: 3, PJ: 2 }],
    ["和重要的人稳定地生活", "成功如果不能共享，会少一半", "🏠", { V_CONN: 3, V_SEC: 2 }],
    ["还在学习、变化、没有定型", "希望版本号继续更新", "🌱", { V_GROW: 3, O: 3 }],
  ]),
];

const roundTwoAdaptive: Question[] = [
  q("r2_rule", 2, "个性化校准", "说明书叛逆指数", "你第一次使用一个复杂新工具。旁边放着 80 页说明书。", "打开工具后的前五分钟，你先做什么？", ["NS", "PJ", "C"], [["从第一页认真看", "前人踩过的坑值得尊重", "📘", { NS: -2, PJ: -2, C: 3 }], ["先乱按，坏了再搜", "探索成本由未来的我承担", "🕹️", { NS: 1, PJ: 3, O: 2 }], ["只看快速开始和常见问题", "说明书也可以吃自助餐", "🔖", { C: 2, FLEX: 2 }], ["找一个会的人演示一次", "真人教程加载更快", "👀", { EI: 1, NS: -1, SEC: 1 }]]),
  q("r2_win", 2, "个性化校准", "成功后的五分钟", "你终于完成了一个追了很久的目标。先不考虑明天。", "完成后的五分钟，最先出现的反应是？", ["V_ACH", "SELF", "V_CONN"], [["好耶，然后立刻看下一个目标", "庆功宴还没上菜，KPI 已入场", "🏁", { V_ACH: 3, C: 2, SELF: -1 }], ["找重要的人一起庆祝", "喜悦需要见证人才完整", "🥂", { V_CONN: 3, EI: 1 }], ["自己安静回味整个过程", "把成就慢慢存进身体", "🫖", { SELF: 3, EI: -1 }], ["突然空虚：就这？", "目标退场后，意义还没补位", "🕳️", { N: 1, V_GROW: 1, RUM: 1 }]]),
  q("r2a_crowd", 2, "个性化校准", "社交返场测试", "一场活动很有趣，但你已经连续和人说了三小时。此刻没人挽留，你可以自由决定。", "你的第一选择是什么？", ["EI", "E"], [["再认识两个人", "来都来了，电量还能透支", "⚡", { EI: 3, E: 2 }], ["只找熟人待着", "不退场，但切到省电模式", "🫶", { EI: 1, SEC: 1 }], ["独自走十分钟再决定", "给大脑清个缓存", "🚶", { EI: -2 }], ["直接回家", "社交电池已出现鼓包", "🚪", { EI: -3, AVOID: 1 }]]),
  q("r2a_detail", 2, "个性化校准", "细节失踪案", "朋友讲旅行，只说‘氛围特别对’，然后停下来等你接话。", "如果只能追问一个问题，你先问哪句？", ["NS", "O"], [["具体哪里好？", "给我可验证的坐标", "📍", { NS: -3 }], ["它让你想到什么？", "比地点更想听意义", "💭", { NS: 3, O: 2 }], ["有照片吗？", "视觉证据先上桌", "📷", { NS: -2 }], ["下次什么时候一起去？", "信息不如行动", "🎒", { ACT: 2, EI: 1 }]]),
  q("r2a_mercy", 2, "个性化校准", "善意与标准", "一个很努力的同事连续两次交付不合格，下一次交付只剩两天。", "你和他坐下后的第一步是什么？", ["FT", "A"], [["先说清问题和后果", "尊重包括说真话", "📏", { FT: -3, BOUND: 2 }], ["先问他最近发生了什么", "表现背后可能有人生", "🌦️", { FT: 3, A: 3 }], ["先拆出两天内的小步骤", "同理心配一份执行方案", "🧱", { FT: 1, ACT: 2 }], ["先替他补上缺口", "现场救了，自己累了", "🩹", { A: 2, BOUND: -2 }]]),
  q("r2a_plan", 2, "个性化校准", "旅行控制权", "四个人旅行，行程到出发前一天还没定，群里依然没人拍板。", "今晚你最可能先做什么？", ["PJ", "C"], [["接管表格，今晚定完", "焦虑最终长成了项目经理", "📋", { PJ: -3, C: 3 }], ["只定住宿和交通", "固定骨架，放养细节", "🦴", { PJ: -1, FLEX: 2 }], ["不安排，到哪算哪", "意外本身就是景点", "🛵", { PJ: 3, O: 2 }], ["不接管，但心里扣分", "表面自由，内心审计", "🧮", { PJ: -2, RUM: 1 }]]),
  q("r2a_closeness", 2, "个性化校准", "突然靠近", "一个认识不到两周的新朋友每天主动找你，还很快分享了许多私事。", "接下来一周，你最自然的反应是什么？", ["SEC", "ANX", "AVD"], [["回应热情，但保持原节奏", "靠近可以，不必加速到失控", "🌿", { SEC: 3, BOUND: 2 }], ["同步加速，开始想象以后", "关系预告片直接播到大结局", "🎬", { ANX: 2, NS: 1 }], ["减少回应，拉开一点距离", "热情太快，风控自动上线", "🦔", { AVD: 3 }], ["先观察他是否对谁都这样", "亲密感也要做尽调", "🧐", { ANX: 1, C: 1 }]]),
  q("r2a_stress", 2, "个性化校准", "压力后台进程", "事情突然堆到平时的两倍，但还没彻底失控。", "压力刚升高的前十分钟，你最先做什么？", ["N", "RUM", "ACT"], [["先推演最坏情况", "灾难片自动连播", "🌪️", { N: 3, RUM: 2 }], ["先列清单并处理一项", "焦虑被拆成待办就老实了", "✅", { ACT: 3, C: 2 }], ["先刷点东西躲一下", "五分钟短视频，五十分钟后见", "📱", { AVOID: 3 }], ["先找人说我现在很乱", "把压力从密室搬到客厅", "🗣️", { SEC: 2, EI: 1 }]]),
  q("r2a_no", 2, "个性化校准", "拒绝后遗症", "你合理拒绝了别人，对方明显失望，但没有继续施压。", "回到家后，哪种反应最占用你？", ["BOUND", "ANX"], [["允许他失望，不撤回边界", "两件事可以同时成立", "⚖️", { BOUND: 3, SEC: 3 }], ["反复想自己是不是太自私", "边界立住了，内疚没下班", "🫠", { ANX: 3, RUM: 2 }], ["马上想办法补偿他", "拒绝后立刻发优惠券", "🎟️", { A: 2, BOUND: -2 }], ["认为他不该因此失望", "边界清楚，情绪售后不包", "🧊", { AVD: 2, FT: -1 }]]),
  q("r2a_learn", 2, "个性化校准", "新手羞耻度", "你在公开场合学新技能，第一次尝试就明显失误，还有人笑出了声。", "接下来的十分钟，哪种反应最像你？", ["O", "SELF", "V_GROW"], [["继续玩，顺便拿自己开涮", "尊严没丢，只是换了造型", "🤹", { O: 3, SELF: 3 }], ["继续练，把注意力放在进步", "成长税，刷卡支付", "📈", { V_GROW: 3, C: 2 }], ["先退出，准备私下练会再来", "新手期最好低调内测", "🫥", { SELF: -1, EI: -1 }], ["继续待着，但会反复想那声笑", "现场结束，回放继续", "📼", { N: 2, RUM: 3 }]]),
  q("r2a_security", 2, "个性化校准", "稳定与机会", "四份工作的基础收入相同：A 最稳定，B 学得最快，C 奖金上限最高，D 时间最自由。其他条件暂时看不出差别。", "必须今天签一份，你先选哪份？", ["V_SEC", "V_GROW", "V_ACH", "V_AUTO"], [["签 A，优先稳定", "生活不是每季都要改版", "🛋️", { V_SEC: 3, N: -1 }], ["签 B，优先成长", "不确定，但活着的感觉更强", "🚀", { V_GROW: 3, O: 2 }], ["签 C，优先回报上限", "冒险可以，赔率先说清楚", "🧮", { V_ACH: 3, FT: -1 }], ["签 D，优先时间自主", "日历归我，成年人终于有点人权", "🛠️", { V_AUTO: 3, FLEX: 2 }]]),
  q("r2a_focus", 2, "个性化校准", "深度工作事故", "你刚进入专注状态，消息开始连续弹出，但没有一条明确标着紧急。", "第一分钟里，你通常怎么处理？", ["C", "BOUND"], [["全部静音，晚点统一回", "世界可以先排队", "🔕", { C: 3, BOUND: 3 }], ["每条都扫一眼再继续", "专注被切成了刺身", "🍣", { C: -2, N: 1 }], ["只打开看起来最急的一条", "给干扰做现场分诊", "🚑", { C: 1, FLEX: 2 }], ["退出当前任务，统一处理消息", "计划打不过红点", "🔴", { PJ: 2, ACT: 1 }]]),
  q("r2a_complaint", 2, "个性化校准", "朋友吐槽协议", "朋友第三次抱怨同一个问题，却明确说暂时不想改变。", "他刚开口时，你最可能先说哪一类话？", ["FT", "A", "BOUND"], [["先接住情绪，继续听", "有些痛苦不是立项会", "🛋️", { FT: 3, A: 3 }], ["先问：想倾诉还是想解决？", "先确认服务套餐", "📋", { FT: -1, BOUND: 3 }], ["先给一条具体建议", "同一个坑至少配个梯子", "🪜", { FT: -3, ACT: 2 }], ["嘴上回应，心里开始不耐烦", "表面点头，内心退出群聊", "😶", { AVOID: 1, BOUND: -2 }]]),
  q("r2a_failure", 2, "个性化校准", "失败归因大会", "你认真准备的事情结果很差，现场没有人要求你马上复盘。", "知道结果后的第一分钟，哪句解释最先冒出来？", ["SELF", "RES", "N"], [["这次方法不行，不等于我不行", "把事故和身份分开存放", "🗂️", { SELF: 3, REAPP: 3, RES: 2 }], ["我果然不适合", "一次结果直接升级成人设", "🏷️", { SELF: -3, N: 3 }], ["外部条件确实很差", "先把锅从灵魂上拿下来", "🌧️", { REAPP: 1, SELF: 1 }], ["先不想，做点别的", "恢复还是逃避，过两天才知道", "🎮", { AVOID: 2, FLEX: 1 }]]),
];

const roundThreeBase: Question[] = [
  q("r3_identity", 3, "深水区", "身份拆箱", "假设一夜之间，职位、头衔和外界评价都消失，而且四种能力只能保留一种。", "哪一种最像“没有它，我就不像我了”？", ["V_AUTO", "V_CONN", "V_GROW", "SELF"], [["独立判断的能力", "没人鼓掌也知道自己在做什么", "🧭", { V_AUTO: 3, SELF: 2 }], ["建立真实连接的能力", "身份会掉，关系会留下", "🫂", { V_CONN: 3, A: 2 }], ["持续学习改变的能力", "版本号比标签重要", "🧬", { V_GROW: 3, O: 2 }], ["把事情做成的能力", "没了名片，还有结果", "🏗️", { V_ACH: 3, C: 2 }]]),
  q("r3_anger", 3, "深水区", "愤怒翻译器", "回想最近三次真正生气，不算单纯饿了或困了。", "最常重复出现的触发点是什么？", ["BOUND", "ANX", "AVD", "SELF"], [["别人越过我的边界", "不是脾气，是领土警报", "🚧", { BOUND: 3, V_AUTO: 1 }], ["我感到被忽视或可能失去", "愤怒穿着盔甲，里面是慌", "🫀", { ANX: 3, N: 2 }], ["我感到无力，说了也没用", "声音关小，距离拉大", "🧊", { AVD: 3, AVOID: 2 }], ["我对自己没做到很失望", "外部事故，内部问责", "🪞", { SELF: -1, V_ACH: 2, RUM: 1 }]]),
  q("r3_partner_support", 3, "深水区", "长期相处模拟器", "你连续忙乱了一周，伴侣只能先做一件事，而且四种都是真心的。", "哪一种最能让你恢复安全感？", ["ATTR_WARM", "ATTR_VITAL", "ATTR_CAPABLE", "ATTR_AUTO"], [["听懂我的感受，先陪我缓下来", "回应感是关系里的软着陆", "🫶", { ATTR_WARM: 3, SEC: 2 }], ["带我换个环境，让生活重新有气", "先把人从压力剧情里捞出来", "🎈", { ATTR_VITAL: 3, REAPP: 2 }], ["接手一件具体麻烦，和我并肩处理", "爱意有时候长得像已完成", "🧰", { ATTR_CAPABLE: 3, ACT: 2 }], ["给我空间，约好晚点再来确认", "不追问，也不失联", "🌿", { ATTR_AUTO: 3, BOUND: 2 }]]),
  q("r3_uncertainty", 3, "深水区", "失控耐受度", "你尽力了，但结果完全取决于别人，预计三天后才有消息。", "等待的第一天，你最常把精力用在哪里？", ["RES", "N", "V_SEC"], [["安排别的事，收回注意力", "控制不了结果，至少管理带宽", "🎛️", { RES: 3, ACT: 2 }], ["频繁刷新，寻找新信息", "每次刷新都像临时止痛片", "🔄", { ANX: 2, N: 3 }], ["预演各种结果和应对", "焦虑被做成了应急预案", "🧯", { C: 2, RUM: 1, V_SEC: 2 }], ["努力让自己表现得不在乎", "期待值藏起来就不会摔坏", "🫥", { AVD: 2, AVOID: 2 }]]),
  q("r3_truth", 3, "深水区", "诚实成本核算", "你有一句真话，今晚说可能让关系短期变糟，不说则会继续别扭。今晚必须决定是否开口。", "你最可能采用哪种方式？", ["BOUND", "SEC", "A"], [["约好时间，清楚但温和地说", "诚实不是把刀递得更快", "🕯️", { BOUND: 3, SEC: 3, A: 2 }], ["今晚先不说，希望事情过去", "和平先续费一个月", "🕊️", { A: 2, BOUND: -2, AVOID: 1 }], ["当场直说，不负责对方感受", "真话裸装发货", "📦", { BOUND: 2, FT: -2, A: -1 }], ["先暗示一点，观察对方反应", "先发一个情绪测试包", "🪁", { ANX: 2, NS: 1 }]]),
  q("r3_relationship_offer", 3, "深水区", "你在关系里的礼物", "进入一段稳定关系后，生活不再天天放烟花。你仍会自然带给对方什么？", "哪一种最像你的长期供给？", ["APPEAL_CARE", "APPEAL_SPARK", "APPEAL_STEADY", "APPEAL_AUTO"], [["理解、接纳，以及愿意认真听", "让人敢把真实版本带回家", "🫂", { APPEAL_CARE: 3, A: 2 }], ["新鲜想法，以及一起探索的兴致", "平淡日子里自带支线任务", "✨", { APPEAL_SPARK: 3, O: 2 }], ["承诺、执行，以及遇事不掉线", "关系服务器稳定在线", "🧱", { APPEAL_STEADY: 3, C: 2 }], ["尊重差异，以及不过度控制的空间", "亲密不是合并账号", "🪁", { APPEAL_AUTO: 3, BOUND: 2 }]]),
  q("r3_belong", 3, "深水区", "归属感来源", "你进入一个新群体，四种信号陆续出现，但只能选一个最关键的。", "哪一个最会让你真正觉得“我属于这里”？", ["V_CONN", "SEC", "EI"], [["有人主动记得我的细节", "被看见，比被欢迎更具体", "👁️", { V_CONN: 3, ANX: 1 }], ["我能自然表达不同意见", "不用缩小自己才算归属", "🪑", { SEC: 3, BOUND: 2 }], ["大家一起做成一件事", "共同战斗比团建有效", "🏗️", { V_ACH: 2, EI: 1 }], ["我安静待着也不尴尬", "不表演，也是成员", "☕", { EI: -2, SEC: 3 }]]),
  q("r3_choice", 3, "深水区", "后悔管理学", "两个选择都不错，也都意味着放弃另一种人生。你必须在 48 小时内决定。", "你最常用哪一种办法按下提交键？", ["PJ", "V_AUTO", "RUM"], [["列标准，选更符合长期目标的", "不求完美，求一致", "📐", { PJ: -2, C: 2, V_ACH: 1 }], ["选身体感觉更有活力的那个", "身体有时比表格先知道", "🫀", { PJ: 2, V_AUTO: 2 }], ["继续拖，直到一个选项消失", "宇宙替我按了提交键", "⌛", { AVOID: 3, RUM: 2 }], ["优先选以后更容易撤回的", "不给未来的自己锁死", "🔓", { FLEX: 3, V_AUTO: 2 }]]),
  q("r3_support", 3, "深水区", "被照顾耐受度", "你状态很差，一个可靠的人主动说愿意照顾你一天。", "真正接受这份照顾时，最卡你的是什么？", ["SEC", "AVD", "SELF"], [["不太卡，我能接住这份好意", "依靠不是欠债", "🫶", { SEC: 3, SELF: 2 }], ["总怕自己麻烦了对方", "需求一出现，歉意先到", "🙇", { ANX: 2, SELF: -1 }], ["担心失去自主和控制", "被照顾也像权限申请", "🔐", { AVD: 3, V_AUTO: 2 }], ["说不清自己具体需要什么", "求助页面没有输入框", "🫥", { BOUND: -1, AVOID: 2 }]]),
  q("r3_meaning", 3, "深水区", "意义断网时刻", "一件你曾长期投入的事突然失去意义，而且暂停一周不会造成现实损失。", "意识到这一点后的第一周，你先怎么处理？", ["V_GROW", "V_SEC", "RES"], [["允许结束，开始找新方向", "不是失败，是这季完结", "🍂", { FLEX: 3, V_GROW: 2, RES: 2 }], ["继续照做，因为已经投入很多", "沉没成本穿着责任感的衣服", "🧱", { C: 2, V_SEC: 2 }], ["先暂停，分辨疲惫还是不认同", "先诊断，不急着销号", "🔬", { SELF: 2, REAPP: 2 }], ["逼自己尽快重新热爱它", "感情也被列入绩效考核", "🔥", { V_ACH: 2, SELF: -2 }]]),
];

const roundThreeAdaptive: Question[] = [
  q("r3_envy", 3, "定向深挖", "嫉妒不删档", "你刷到同龄人获得了自己很想要的东西。先别装大度。", "看到后的十分钟，最先出现哪种反应？", ["V_ACH", "SELF"], [["辨认自己到底羡慕什么", "嫉妒也可以是导航", "🧭", { V_ACH: 2, REAPP: 3, SELF: 2 }], ["立刻挑对方的毛病", "自尊先派律师出场", "⚔️", { SELF: -2, AVD: 1 }], ["马上把它变成行动目标", "酸完了，开始建表", "📈", { V_ACH: 3, ACT: 3 }], ["告诉自己无所谓，却一直在想", "情绪退出界面，后台仍运行", "🫠", { RUM: 3, N: 2 }]]),
  q("r3_rest", 3, "定向深挖", "休息资格审查", "你身体没生病，却什么都没完成，一天就这样结束了。", "睡前关灯时，最真实的内心反应是什么？", ["SELF", "V_ACH", "RES"], [["平静接受，今天不用交作业", "存在本身不需要日报", "🛋️", { SELF: 3, RES: 2 }], ["有点内疚，但今晚能放下", "内审来过，没让它加班", "🌙", { SELF: 1, REAPP: 2 }], ["起身补做一件事才肯睡", "休息要先提交绩效证明", "📋", { V_ACH: 3, C: 2, SELF: -2 }], ["继续逃避，准备明天责怪自己", "今日逃避，明日追责", "🫣", { AVOID: 3, RUM: 2 }]]),
  q("r3a_power", 3, "定向深挖", "权力使用说明", "你突然拥有最终决定权，团队意见分成两派，都在等你今天拍板。", "压力升高时，你最容易滑向哪种处理方式？", ["FT", "A", "BOUND"], [["只讲标准，低估大家的感受", "逻辑很直，关系被刮蹭", "📏", { FT: -3, A: -1 }], ["继续照顾各方，迟迟不决定", "会议很温暖，项目没动", "🧸", { FT: 3, BOUND: -2 }], ["把决定交给最懂的人", "位置不是自尊保卫战", "🔑", { SELF: 2, FLEX: 2 }], ["自己决定并扛下全部责任", "负责慢慢变成控制", "🏋️", { AVD: 2, V_ACH: 2 }]]),
  q("r3a_spontaneous", 3, "定向深挖", "即兴事故现场", "计划严密的活动突然多出一小时空白，现场也没人提议。", "前五分钟里，你最可能先做什么？", ["PJ", "FLEX"], [["立刻补一个新安排", "空白看起来像系统报错", "🧩", { PJ: -3, C: 2 }], ["直接随便逛逛", "空白是隐藏关卡", "🚶", { PJ: 3, FLEX: 3 }], ["先问大家想做什么", "把不确定变成共创", "🗳️", { EI: 1, FLEX: 2 }], ["先不安排，但心里有点烦", "日程变了，表情管理没变", "😐", { N: 1, RUM: 1 }]]),
  q("r3a_attention", 3, "定向深挖", "信息摄入体检", "最近三个月，你多次打开手机只想查一件事，二十分钟后却刷到了别处。", "这些走神里，最常见的直接原因是什么？", ["O", "C", "AVOID"], [["被新内容勾起了好奇心", "世界太多入口，很难只走一个", "🕳️", { O: 3, C: -1 }], ["在躲一个不想开始的任务", "天气无罪，拖延有因", "🌦️", { AVOID: 3 }], ["这种情况很少，我通常及时关掉", "红点不拥有我的监护权", "🛑", { C: 3, BOUND: 2 }], ["顺着线索开始收集有用资料", "走神也能产出副产品", "🗃️", { NS: 2, O: 2 }]]),
  q("r3a_intimacy", 3, "定向深挖", "亲密冲突之后", "争吵刚停，对方张开手想立刻抱抱，但你心里还没处理完。", "看到这个动作时，你的第一反应是什么？", ["SEC", "AVD", "ANX"], [["说明需要时间，并约好再聊", "距离有期限，关系有着落", "⏳", { SEC: 3, BOUND: 3 }], ["先抱住，怕拒绝让关系更坏", "身体和边界暂时意见不合", "🫂", { ANX: 3, BOUND: -2 }], ["拒绝接触，也不给恢复时间", "系统过热，所有端口关闭", "🧊", { AVD: 3 }], ["立刻结束冲突，当场和好", "关系警报必须当天解除", "🌙", { ANX: 2, V_CONN: 2 }]]),
  q("r3a_ambition", 3, "定向深挖", "野心公开测试", "假设没人会觉得你自大，而且四种愿望只能优先实现一种。", "你最不愿意删掉哪一句？", ["V_ACH", "SELF"], [["成为某个领域很厉害的人", "不是凡尔赛，是确实想要", "🏔️", { V_ACH: 3, SELF: 2 }], ["有足够的钱买回选择权", "财富的单位是‘可以不’", "💳", { V_AUTO: 3, V_SEC: 1 }], ["被很多人看见和认可", "掌声不是全部，但确实好听", "🎤", { EI: 2, V_ACH: 2 }], ["不过度追求，只想活得自在", "低欲望也可能是清晰选择", "🌿", { V_AUTO: 2, V_SEC: 2 }]]),
  q("r3a_care", 3, "定向深挖", "照顾者疲劳", "大家习惯来找你倾诉，但很少有人问你怎么样。今晚又有人发来一句‘在吗？’。", "你最可能先怎么回应？", ["BOUND", "V_CONN", "SELF"], [["先说我今天也需要被听见", "需求不靠对方通灵", "📣", { BOUND: 3, SEC: 3 }], ["减少回应，等对方自己发现", "把提示做成静音版", "🔕", { AVD: 2, AVOID: 1 }], ["照常听，先不提自己的事", "体贴别人，缩小自己", "🫥", { A: 3, SELF: -3 }], ["说明今晚没余量，改天再聊", "不是绝交，是预算重做", "🧾", { BOUND: 3, V_CONN: 1 }]]),
  q("r3a_risk", 3, "定向深挖", "安全网厚度", "你有一个想做但可能失败的大计划，四个启动条件不能同时满足。", "只能先获得一个时，哪一个最能让你真正开始？", ["V_SEC", "V_GROW", "ACT"], [["一笔足够撑半年的安全垫", "勇气喜欢睡在现金流旁边", "🛟", { V_SEC: 3, C: 2 }], ["一个愿意共同承担的伙伴", "共同承担让风险有形状", "🤝", { V_CONN: 2, SEC: 2 }], ["一次成本很小的试验机会", "不跳悬崖，先伸一只脚", "🧪", { ACT: 3, FLEX: 2 }], ["确定不做会让我更后悔", "让未来的遗憾参加投票", "🔮", { V_GROW: 2, NS: 2 }]]),
  q("r3a_mask", 3, "定向深挖", "社交人格卸妆", "回想最近三个月，那些结束后让你明显想独处恢复的场合。", "哪一种场景出现得最频繁？", ["EI", "ANX", "SELF"], [["持续表现得热情外向", "脸在营业，电池在报警", "🎭", { EI: -3, SELF: -1 }], ["面对很强势的人", "观点自动调低音量", "🔉", { ANX: 2, BOUND: -2 }], ["持续表现得冷静专业", "情绪被临时寄存在前台", "🧊", { FT: 2, A: 1 }], ["在亲近的人面前故意嘴硬", "越重要，保护壳越厚", "🦀", { AVD: 2, V_CONN: 2 }]]),
  q("r3a_boredom", 3, "定向深挖", "无聊处理器", "一件长期重要的事进入重复、缓慢、没掌声的阶段，新鲜感已经消失一个月。", "你最常靠哪种方式维持，或者因此停下？", ["C", "V_ACH"], [["按固定习惯继续，不等状态", "激情下线，流程接班", "⚙️", { C: 3, V_ACH: 1 }], ["持续换方法，给过程加新鲜感", "目标不变，玩法更新", "🔄", { O: 3, FLEX: 2 }], ["找人一起做或互相监督", "意志力不够，关系来凑", "👥", { SEC: 2, EI: 1 }], ["转向更有趣的新项目", "不是放弃，是兴趣迁徙", "🦋", { PJ: 3, C: -2 }]]),
  q("r3a_memory", 3, "定向深挖", "旧事重播", "洗澡时，你突然想起三年前一件尴尬小事。现场的人大概率早忘了。", "闪回后的三十秒，你通常先怎么反应？", ["RUM", "REAPP", "SELF"], [["身体再次感到当年的尴尬", "记忆过期，羞耻没过期", "🏗️", { RUM: 3, N: 2 }], ["笑一下，告诉自己当时已尽力", "旧版本也值得兼容", "🙂", { REAPP: 3, SELF: 3 }], ["分析以后怎样避免再发生", "尴尬被转成操作规范", "📝", { C: 2, REAPP: 1 }], ["赶紧想别的把它压下去", "不是放下，是切后台", "🫣", { AVOID: 2 }]]),
  q("r3a_loyalty", 3, "定向深挖", "忠诚与成长", "一段关系很稳定，但你已经在里面停止成长，而且短期内无法同时保住稳定与成长。", "接下来一个月，你最可能先怎么做？", ["V_CONN", "V_GROW", "V_SEC"], [["提出讨论，看能否创造新空间", "稳定不是封印", "🌱", { V_CONN: 2, V_GROW: 2, SEC: 2 }], ["先选择稳定，接受暂时不成长", "人生不是持续升级赛", "🏡", { V_SEC: 3, V_CONN: 2 }], ["开始离开，去更有生命力的地方", "不把忠诚等同于停留", "🚪", { V_GROW: 3, V_AUTO: 2 }], ["先拖着，等待外部事件替我决定", "关系进入自动续费", "⌛", { AVOID: 3, AVD: 1 }]]),
  q("r3a_control", 3, "定向深挖", "控制感来源", "工作和生活同时变乱，而且今天无法彻底解决。", "混乱发生后的第一小时，你最先抓住什么恢复控制？", ["C", "AVOID"], [["整理空间并列清单", "外部变整齐，内部跟着排队", "🧹", { C: 3, ACT: 2 }], ["搜集更多相关信息", "知道得更多，心跳就慢一点", "🔍", { C: 1, RUM: 2 }], ["管住饮食、睡眠或一个小习惯", "至少这几个旋钮还在手里", "🎛️", { V_SEC: 2, C: 2 }], ["切断联系，暂时谁都不见", "先把世界拔掉电源", "🔌", { AVD: 3, AVOID: 2 }]]),
  q("r3a_kindness", 3, "定向深挖", "对己双标测试", "你犯了一个会原谅朋友、却很难原谅自己的错误。", "当晚最常用哪条内在规则对待自己？", ["SELF", "V_ACH"], [["必须严厉，人才会变好", "内在教练误装成了监工", "📣", { V_ACH: 2, SELF: -3 }], ["我对自己负责，标准就该更高", "同理心有，但没给自己授权", "📏", { C: 2, SELF: -1 }], ["也用对朋友的语气对自己说话", "制度改革已经开始", "🌱", { SELF: 3, REAPP: 2 }], ["先别谈感受，马上把错误修掉", "情绪先退场，问题先解决", "🔧", { FT: -3, ACT: 2 }]]),
  q("r3a_visibility", 3, "定向深挖", "被看见的风险", "你准备公开一件真正重要的作品，发布按钮就在眼前。", "按下前一分钟，哪个担心最可能让你停手？", ["ANX", "V_ACH", "SELF"], [["发出去却根本没人关心", "失败至少有声音，沉默更空", "🌫️", { ANX: 2, V_ACH: 2 }], ["别人发现我没有那么厉害", "作品上线，冒名顶替感也上线", "🎭", { SELF: -3, N: 2 }], ["作品被误解成另一个意思", "我交出作品，也交出解释权", "🪞", { NS: 2, ANX: 1 }], ["一旦成功，以后必须持续证明", "掌声后面站着续约通知", "📬", { V_ACH: 2, N: 2 }]]),
  q("r3a_home", 3, "定向深挖", "心理上的家", "假设收入、住所和健康状况都相近，四种安全感只能保留一种。", "哪一种对你最不可替代？", ["V_SEC", "SEC", "V_AUTO"], [["能依赖别人而不怕被嫌弃", "需求不会让我失去位置", "🫂", { SEC: 3, V_CONN: 2 }], ["有随时离开的能力", "出口存在，留下才是选择", "🚪", { V_AUTO: 3, V_SEC: 2 }], ["生活可预期，重要的人都在", "平静本身就是奢侈", "🏠", { V_SEC: 3, V_CONN: 2 }], ["相信无论发生什么自己都能处理", "最便携的安全屋在身体里", "🧭", { SELF: 3, RES: 3 }]]),
  q("r3a_finish", 3, "定向深挖", "完成主义 vs 完美主义", "作品已有 85 分且达到交付标准。截止只剩 30 分钟，再改可能到 92，也可能错过机会。", "你现在最可能按哪个按钮？", ["C", "V_ACH"], [["直接提交，保住机会", "让作品离开桌面", "📤", { ACT: 3, RES: 2 }], ["继续修改，接受迟交风险", "优秀和截止日正在决斗", "🧵", { V_ACH: 3, C: 2, RUM: 1 }], ["立刻找可信的人替我判断", "借一双没熬夜的眼睛", "👀", { SEC: 2, FLEX: 1 }], ["先核算迟交代价再决定", "完美不是原则，是预算", "🧮", { FT: -2, FLEX: 2 }]]),
  q("r3a_freedom", 3, "定向深挖", "自由的代价", "你获得一个月完全自由：没人规定方向、节奏或结果。", "最可能先卡住你的是什么？", ["V_AUTO", "PJ"], [["选择太多，反复怕选错", "菜单无限，食欲下线", "📚", { RUM: 2, N: 2 }], ["没有外部节奏，很快散掉", "自由给了，操作手册没给", "🫠", { C: -2, PJ: 2 }], ["想到结果都由自己负责", "方向盘很爽，事故也实名", "🚘", { V_AUTO: 2, SELF: -1 }], ["不太会卡，边走边定方向", "不确定是空间，不是漏洞", "🌊", { V_AUTO: 3, FLEX: 3 }]]),
  q("r3a_forgive", 3, "定向深挖", "原谅的条件", "有人真诚道歉，但同样的伤害已经发生过两次。你不需要今天原谅。", "接下来只能先观察一个信号，你会选哪一个？", ["BOUND", "A", "SEC"], [["之后是否出现持续改变", "道歉看语言，信任看版本记录", "🧾", { BOUND: 3, FT: -2 }], ["他当时的处境与真实动机", "理解不会自动取消后果", "🫶", { A: 3, FT: 2 }], ["我的身体能否再次感到安全", "关系不是法庭，但身体会投票", "🫀", { SEC: 2, V_SEC: 2 }], ["先拉开距离，暂时不做判断", "原谅不是限时抢购", "⏸️", { BOUND: 2, AVD: 1 }]]),
  q("r3a_success", 3, "定向深挖", "成功私人定义", "如果一辈子没人能在社交媒体上看到，而且四种成功只能保留一种。", "你最舍不得删掉哪一种？", ["V_ACH", "V_CONN", "V_AUTO", "V_GROW"], [["做出真正有质量的东西", "掌声会停，作品会留下", "🧱", { V_ACH: 3, C: 2 }], ["有时间和喜欢的人生活", "日常不是成功的边角料", "🍲", { V_CONN: 3, V_SEC: 1 }], ["能决定把时间花在哪里", "日历主权，就是自由", "🗓️", { V_AUTO: 3 }], ["一直对世界保持好奇", "不被自己过早定型", "🔭", { V_GROW: 3, O: 3 }]]),
  q("r3a_body", 3, "定向深挖", "身体先知道", "回想最近三次你嘴上说‘没事’、其实压力很大的时候。", "哪种身体或行为信号最早、最常出现？", ["N", "SELF", "RES"], [["睡眠或食欲先变化", "身体先取消正常营业", "🌙", { N: 3, RES: -1 }], ["肩颈、胃或头先不舒服", "情绪没发言，肌肉代会", "🪨", { RUM: 2, N: 2 }], ["语气先变急，耐心先下降", "系统过载，提示音变大", "⚡", { N: 2, BOUND: -1 }], ["通常能在明显反应前察觉并调整", "报警器和处理器是联网的", "🌡️", { SELF: 3, RES: 3 }]]),
  q("r3a_unknownself", 3, "定向深挖", "自我认知漏洞", "假设一位了解你三年以上的人必须指出一个你不太愿意承认的盲点。", "他最可能选哪一句？", ["SELF", "A"], [["你其实比自认的更有野心", "欲望穿了件低调外套", "🔥", { V_ACH: 3, SELF: -1 }], ["你照顾别人时常忘了自己", "温柔偶尔变成自我隐身", "🫥", { A: 3, BOUND: -2 }], ["你看似随和，其实很需要控制", "随便都行，但最好按我的随便", "🎛️", { C: 2, N: 1 }], ["你看似理性，其实感受很深", "情绪被压缩，不等于不存在", "🌊", { FT: 2, N: 1 }]]),
];

export const allQuestions = [...roundOne, ...roundTwoBase, ...roundTwoAdaptive, ...roundThreeBase, ...roundThreeAdaptive];
const questionMap = new Map(allQuestions.map((question) => [question.id, question]));

export const rounds = [
  { number: 1 as const, count: 10, title: "快速扫描", subtitle: "先看看你的系统默认设置", duration: "约 4 分钟" },
  { number: 2 as const, count: 15, title: "盲区校准", subtitle: "专打模糊信号，不给人格混过去", duration: "约 6 分钟" },
  { number: 3 as const, count: 20, title: "深水区", subtitle: "价值、关系、防御与人生张力一起上桌", duration: "约 9 分钟" },
];

export function scoreAnswers(answers: AnswerRecord[]) {
  const scores = {} as Record<ScoreKey, number>;
  const evidence = {} as Record<ScoreKey, number>;
  for (const answer of answers) {
    const question = questionMap.get(answer.questionId);
    if (!question) continue;
    const weightedChoices = [
      { choice: question.choices[answer.choice], weight: 1 },
      { choice: answer.secondaryChoice === undefined ? undefined : question.choices[answer.secondaryChoice], weight: .45 },
    ];
    for (const { choice, weight } of weightedChoices) {
      if (!choice) continue;
      for (const [key, value] of Object.entries(choice.scores) as [ScoreKey, number][]) {
        scores[key] = (scores[key] ?? 0) + value * weight;
        evidence[key] = (evidence[key] ?? 0) + weight;
      }
    }
  }
  return { scores, evidence };
}

function adaptivePick(pool: Question[], count: number, answers: AnswerRecord[], mode: "clarify" | "deepen") {
  const { scores, evidence } = scoreAnswers(answers);
  return pool
    .map((question, index) => {
      const signals = question.focus.map((key) => ({ value: Math.abs(scores[key] ?? 0), seen: evidence[key] ?? 0 }));
      const priority = mode === "clarify"
        ? signals.reduce((sum, signal) => sum + Math.max(0, 8 - signal.value * 1.5) + Math.max(0, 2 - signal.seen) * 2, 0)
        : signals.reduce((sum, signal) => sum + signal.value * 1.4 + signal.seen * .4, 0);
      return { question, priority, index };
    })
    .sort((a, b) => b.priority - a.priority || a.index - b.index)
    .slice(0, count)
    .map((item) => item.question);
}

export function getRoundQuestions(round: 1 | 2 | 3, previousAnswers: AnswerRecord[]) {
  if (round === 1) return roundOne;
  if (round === 2) return [...roundTwoBase, ...adaptivePick(roundTwoAdaptive, 6, previousAnswers, "clarify")];
  return [...roundThreeBase, ...adaptivePick(roundThreeAdaptive, 10, previousAnswers, "deepen")];
}

export function validateAnswers(answers: AnswerRecord[]) {
  return answers.every((answer) => {
    const question = questionMap.get(answer.questionId);
    if (!question || !Number.isInteger(answer.choice) || answer.choice < 0 || answer.choice >= question.choices.length) return false;
    if (answer.secondaryChoice === undefined) return true;
    return Number.isInteger(answer.secondaryChoice)
      && answer.secondaryChoice >= 0
      && answer.secondaryChoice < question.choices.length
      && answer.secondaryChoice !== answer.choice;
  });
}

export function validateProgress(answers: AnswerRecord[], completedRound: 1 | 2 | 3) {
  if (!validateAnswers(answers)) return false;
  let offset = 0;
  const previous: AnswerRecord[] = [];
  for (let round = 1; round <= completedRound; round += 1) {
    const expected = getRoundQuestions(round as 1 | 2 | 3, previous);
    const received = answers.slice(offset, offset + expected.length);
    if (received.length !== expected.length) return false;
    if (expected.some((question, index) => received[index]?.questionId !== question.id)) return false;
    previous.push(...received);
    offset += expected.length;
  }
  return offset === answers.length;
}

const typeNames: Record<string, string> = {
  INTJ: "幕后总架构师", INTP: "脑洞质检员", ENTJ: "人形推进器", ENTP: "规则拆迁队",
  INFJ: "情绪深海译员", INFP: "意义收藏癖", ENFJ: "人际气氛总监", ENFP: "灵感多线程用户",
  ISTJ: "靠谱到有点可疑", ISFJ: "温柔后勤部长", ESTJ: "现实项目经理", ESFJ: "关系运营总监",
  ISTP: "冷静修复工程师", ISFP: "低调感受派", ESTP: "现场反应冠军", ESFP: "活人感供应商",
};

export type AttractionSignal = {
  key: "warm" | "vital" | "capable" | "autonomy";
  label: string;
  note: string;
};

export type AttractionReport = {
  evidenceLevel: "preview" | "calibrated" | "deep";
  confidence: number;
  drawnTo: { headline: string; summary: string; signals: AttractionSignal[] };
  drawsIn: { headline: string; summary: string; signals: AttractionSignal[] };
  spark: string;
  lasting: string;
  watchout: string;
  evidenceNote: string;
};

export type AssessmentReport = {
  version: 2 | 3;
  participant?: ParticipantProfile;
  completedRound: number;
  answeredCount: number;
  depthLabel: string;
  confidence: number;
  mbti: string;
  archetype: string;
  tagline: string;
  axes: { code: string; left: string; right: string; value: number }[];
  bigFive: { label: string; value: number; note: string }[];
  attachment: { label: string; value: number; note: string };
  values: { label: string; value: number; note: string }[];
  regulation: { label: string; value: number; note: string }[];
  resilience: { value: number; label: string; note: string };
  boundaries: { value: number; label: string; note: string };
  attraction?: AttractionReport;
  tensions: string[];
  nextFocus: string[];
  strengths: string[];
  experiments: string[];
  scores: Record<string, number>;
};

export function buildReport(answers: AnswerRecord[], completedRound = 1, participant?: ParticipantProfile): AssessmentReport {
  const { scores, evidence } = scoreAnswers(answers);
  const normalized = (key: ScoreKey, floor = 8) => {
    const seen = Math.max(evidence[key] ?? 0, 1);
    return Math.max(floor, Math.min(96, Math.round(50 + ((scores[key] ?? 0) / (seen * 3)) * 46)));
  };
  const axis = (key: ScoreKey) => normalized(key);
  const mbti = `${(scores.EI ?? 0) >= 0 ? "E" : "I"}${(scores.NS ?? 0) >= 0 ? "N" : "S"}${(scores.FT ?? 0) >= 0 ? "F" : "T"}${(scores.PJ ?? 0) >= 0 ? "P" : "J"}`;
  const bigFive = [
    { key: "O" as const, label: "开放性", note: "对新经验、复杂性与想象的欢迎程度" },
    { key: "C" as const, label: "尽责性", note: "把意图稳定变成行动的倾向" },
    { key: "E" as const, label: "外向性", note: "从互动与外部刺激中获得能量的程度" },
    { key: "A" as const, label: "宜人性", note: "合作、体谅与维持关系的倾向" },
    { key: "N" as const, label: "情绪敏感度", note: "对风险、压力与情绪变化的感知强度" },
  ].map((trait) => ({ label: trait.label, note: trait.note, value: normalized(trait.key, 10) }));
  const attachmentOptions = [
    { key: "SEC" as const, label: "安全连接", note: "能靠近，也允许彼此有边界" },
    { key: "ANX" as const, label: "关系高灵敏", note: "很快捕捉距离变化，容易启动确认程序" },
    { key: "AVD" as const, label: "独立保护", note: "压力下优先撤回自己的空间与控制" },
  ].sort((a, b) => (scores[b.key] ?? 0) - (scores[a.key] ?? 0));
  const valueDefs = [
    { key: "V_AUTO" as const, label: "自主", note: "选择权与不被单一路径锁定" },
    { key: "V_CONN" as const, label: "连接", note: "被理解、陪伴与共同生活" },
    { key: "V_GROW" as const, label: "成长", note: "学习、更新与拓展可能性" },
    { key: "V_SEC" as const, label: "安稳", note: "可预期、可依靠与生活底盘" },
    { key: "V_ACH" as const, label: "成就", note: "做成重要之事并看见影响" },
  ];
  const values = valueDefs.map((value) => ({ label: value.label, note: value.note, value: normalized(value.key, 18) })).sort((a, b) => b.value - a.value);
  const regulationDefs = [
    { key: "REAPP" as const, label: "重新解释", note: "通过换角度恢复心理空间" },
    { key: "ACT" as const, label: "行动复位", note: "通过可执行步骤重新获得控制" },
    { key: "RUM" as const, label: "反刍循环", note: "大脑会反复重播、分析与预演" },
    { key: "AVOID" as const, label: "暂时回避", note: "先远离刺激，晚点再处理" },
  ];
  const regulation = regulationDefs.map((item) => ({ label: item.label, note: item.note, value: normalized(item.key, 12) })).sort((a, b) => b.value - a.value);
  const resilienceValue = Math.round((normalized("RES", 18) + normalized("FLEX", 18) + normalized("SELF", 18)) / 3);
  const boundaryValue = normalized("BOUND", 18);
  const topTraits = [...bigFive].sort((a, b) => b.value - a.value);
  const mean = (...keys: ScoreKey[]) => Math.round(keys.reduce((sum, key) => sum + normalized(key, 18), 0) / keys.length);
  const preferenceWeight = completedRound === 1 ? 0 : completedRound === 2 ? .55 : .65;
  const directCeiling = completedRound >= 3 ? 6 : 3;
  const directScore = (key: ScoreKey) => Math.min(96, Math.round(50 + (Math.max(0, scores[key] ?? 0) / directCeiling) * 46));
  const blend = (direct: ScoreKey, proxy: number) => Math.round(directScore(direct) * preferenceWeight + proxy * (1 - preferenceWeight));
  const attractionDefs = [
    {
      key: "warm" as const,
      label: "温暖可信",
      desired: "愿意理解你、回应你，也把承诺当回事的人",
      audience: "重视被理解、希望关系里可以安心做自己的人",
      preference: blend("ATTR_WARM", mean("V_CONN", "SEC", "A", "BOUND")),
      appeal: blend("APPEAL_CARE", mean("A", "SEC", "V_CONN", "BOUND")),
    },
    {
      key: "vital" as const,
      label: "活力探索",
      desired: "有好奇心、能带来新鲜视角与共同体验的人",
      audience: "喜欢脑洞、生命力和相处中持续有新入口的人",
      preference: blend("ATTR_VITAL", mean("O", "V_GROW", "FLEX", "E")),
      appeal: blend("APPEAL_SPARK", mean("O", "E", "FLEX", "REAPP")),
    },
    {
      key: "capable" as const,
      label: "能力稳定",
      desired: "说到做到、遇事能一起处理现实问题的人",
      audience: "欣赏可靠行动、清晰方向和长期兑现能力的人",
      preference: blend("ATTR_CAPABLE", mean("V_ACH", "C", "ACT", "RES")),
      appeal: blend("APPEAL_STEADY", mean("C", "ACT", "RES", "SELF")),
    },
    {
      key: "autonomy" as const,
      label: "自主空间",
      desired: "有自己的世界，同时尊重彼此节奏与边界的人",
      audience: "不喜欢被控制、也愿意给彼此独立空间的人",
      preference: blend("ATTR_AUTO", mean("V_AUTO", "BOUND", "SELF", "FLEX")),
      appeal: blend("APPEAL_AUTO", mean("V_AUTO", "BOUND", "SELF", "FLEX")),
    },
  ];
  const desiredRank = [...attractionDefs].sort((a, b) => b.preference - a.preference);
  const appealRank = [...attractionDefs].sort((a, b) => b.appeal - a.appeal);
  const desiredSignals = desiredRank.slice(0, 2).map((item) => ({ key: item.key, label: item.label, note: item.desired }));
  const appealSignals = appealRank.slice(0, 2).map((item) => ({ key: item.key, label: item.label, note: item.audience }));
  const anxious = normalized("ANX", 18);
  const avoidant = normalized("AVD", 18);
  const secure = normalized("SEC", 18);
  const attractionWatchout = anxious > Math.max(avoidant, secure)
    ? "强烈回应很容易点亮你，但“马上很热”不等于“长期稳定”。比起频率，更值得观察对方是否持续、清楚、说到做到。"
    : avoidant > Math.max(anxious, secure)
      ? "有距离感的人可能让你觉得轻松，但“尊重空间”不等于“情感缺席”。真正适合的自主，会在拉开距离时仍给出明确回应。"
      : boundaryValue < 52
        ? "被需要会让你很有价值感，但关系不能长期靠你单方面理解和兜底。留意对方是否也愿意接住你的需要。"
        : normalized("V_ACH", 18) > 70 && normalized("C", 18) > 68
          ? "能力感可能同时带来欣赏和压力。别只看对方是否优秀，也看你们能否在不完美时仍然放松相处。"
          : "心动负责打开门，回应、边界与修复能力才决定能不能久处。不要只验证报告，也要观察真实互动。";
  const attraction: AttractionReport = {
    evidenceLevel: completedRound === 1 ? "preview" : completedRound === 2 ? "calibrated" : "deep",
    confidence: completedRound === 1 ? 30 : completedRound === 2 ? 62 : 82,
    drawnTo: {
      headline: `${desiredSignals[0].label} × ${desiredSignals[1].label}`,
      summary: `你更容易被${desiredSignals[0].note.replace(/的人$/, "")}的人点亮，同时也会在意${desiredSignals[1].label}带来的感觉。`,
      signals: desiredSignals,
    },
    drawsIn: {
      headline: `${appealSignals[0].label} × ${appealSignals[1].label}`,
      summary: `你更容易吸引${appealSignals[0].note.replace(/的人$/, "")}的人；${appealSignals[1].label}是另一条明显的关系信号。`,
      signals: appealSignals,
    },
    spark: `最先点火的通常是“${desiredSignals[0].label}”：${desiredSignals[0].note}`,
    lasting: `更适合久处的伴侣需要稳定回应你的真实需要，并能同时尊重“${values[0].label}”与“${values[1].label}”这两项核心价值。`,
    watchout: attractionWatchout,
    evidenceNote: completedRound === 1
      ? "目前主要来自人格、价值与关系模式，是低置信度预览；第二轮会加入直接的心动与吸引信号题。"
      : completedRound === 2
        ? "已加入直接关系情境题，但真实吸引仍高度依赖具体对象与互动，不是固定配对公式。"
        : "已综合直接关系题、人格、依恋、价值与边界；它描述倾向，不预测某个具体的人一定会喜欢你。",
  };
  const tensions: string[] = [];
  if (normalized("A") > 66 && boundaryValue < 48) tensions.push("你很会照顾关系，但偶尔会把自己的需求伪装成‘没关系’。温柔若没有边界，最后容易变成欠自己的账。");
  if (normalized("V_ACH") > 68 && normalized("SELF") < 48) tensions.push("你的目标感很强，但自我认可可能总要等下一次成绩到账。你需要的也许不是更拼，而是让已完成的事真正入账。");
  if (normalized("O") > 68 && normalized("C") < 48) tensions.push("你擅长打开新入口，较难的是陪一个入口走过无聊中段。灵感不是问题，容器才是。");
  if (normalized("C") > 70 && normalized("FLEX") < 48) tensions.push("结构让你可靠，也可能让临时变化显得像人格冒犯。给计划预留一块‘允许失控区’，反而更稳。");
  if (normalized("ANX") > 64 && normalized("V_CONN") > 62) tensions.push("你很重视连接，因此更容易对距离变化过敏。关系雷达灵敏是天赋，但不是每个信号都需要立刻出警。");
  if (!tensions.length) tensions.push("你目前最明显的特点不是单边倾向，而是会随情境切换策略。灵活是优势，也值得继续观察：哪些切换出于选择，哪些出于讨好或防御。");
  const nextFocus = completedRound === 1
    ? ["校准 MBTI 边界较模糊的坐标", "继续辨认关系中的靠近与保护", "加入价值排序与自我评价"]
    : completedRound === 2
      ? ["深挖真正驱动你的核心价值", "观察压力下的自动防御", "寻找优势彼此打架的地方"]
      : ["把洞察带回真实生活", "用小实验验证，而不是把报告当判决", "隔一段时间回来比较变化"];
  const sensitive = normalized("N");
  return {
    version: 3,
    ...(participant ? { participant: { ...participant } } : {}),
    completedRound,
    answeredCount: answers.length,
    depthLabel: completedRound === 1 ? "初步扫描" : completedRound === 2 ? "多维校准" : "完整探索",
    confidence: completedRound === 1 ? 46 : completedRound === 2 ? 73 : 92,
    mbti,
    archetype: typeNames[mbti] ?? "人类多线程用户",
    tagline: `${mbti.startsWith("I") ? "你习惯先在内部完成校准" : "你常在互动中生成方向"}；${values[0].label}是目前最亮的价值信号，但它不会单独解释你。`,
    axes: [
      { code: "E / I", left: "独处充电", right: "互动充电", value: axis("EI") },
      { code: "S / N", left: "具体经验", right: "模式联想", value: axis("NS") },
      { code: "T / F", left: "逻辑权衡", right: "价值共情", value: axis("FT") },
      { code: "J / P", left: "结构确定", right: "开放探索", value: axis("PJ") },
    ],
    bigFive,
    attachment: { ...attachmentOptions[0], value: normalized(attachmentOptions[0].key, 28) },
    values,
    regulation,
    resilience: {
      value: resilienceValue,
      label: resilienceValue >= 68 ? "恢复路径较成熟" : resilienceValue >= 48 ? "恢复方式正在成形" : "恢复容易被占用",
      note: resilienceValue >= 68 ? "你通常能从压力中重新拿回选择权。" : "你需要的不是永远冷静，而是更早发现自己正在过载。",
    },
    boundaries: {
      value: boundaryValue,
      label: boundaryValue >= 68 ? "边界表达清晰" : boundaryValue >= 48 ? "会看情境调节" : "容易先照顾别人",
      note: boundaryValue >= 60 ? "你较能同时容纳关系与自己的需要。" : "你可能知道界线在哪里，但说出口仍会有成本。",
    },
    attraction,
    tensions: tensions.slice(0, 3),
    nextFocus,
    strengths: [
      `你的${topTraits[0].label}是当前最稳定的特质信号，善用时会成为判断与行动的底盘。`,
      `${values[0].label}与${values[1].label}构成目前最强的价值组合；重要选择若同时满足两者，你通常更有持续动力。`,
      sensitive > 66 ? "你对风险与氛围的雷达灵敏。它会增加耗电，也能转化成预判、共情与细节洞察。" : "你在波动中通常能保留一定行动空间，不容易被短暂情绪完全接管。",
    ],
    experiments: [
      boundaryValue < 52 ? "下一次想说‘都可以’时，补一句你真实的偏好。" : "下一次拒绝别人时，不追加超过一句的过度解释。",
      regulation[0].label === "反刍循环" ? "卡住时写三栏：已知事实 / 脑内剧情 / 24 小时内可做的一步。" : "压力升高时，记录你最先使用的恢复动作，以及它 30 分钟后的真实效果。",
      `安排一个同时满足“${values[0].label}”与“${values[1].label}”的小选择，用真实体验验证这份报告。`,
    ],
    scores,
  };
}
