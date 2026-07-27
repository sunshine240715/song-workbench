// 每日计划工作台 - 交互逻辑
// daily / shenlun: 任务列表（勾选+增删）
// gongji / zhice: 答题练习（选项+判分+解析）

// 栏目配置
const SECTIONS = ['daily', 'gongji', 'zhice', 'shenlun'];
const QUIZ_SECTIONS = ['gongji', 'zhice'];   // 答题栏目
const TASK_SECTIONS = ['daily', 'shenlun'];  // 任务栏目

// 申论学习博主（B站）
const SHENLUN_UPS = [
    {
        name: 'Cocoweii',
        uid: '9039264',
        fans: '11.7万',
        videos: '21',
        desc: '申论学习方法分享',
        avatar: '🎓'
    },
    {
        name: 'Dudu快学习',
        uid: '3546601385626140',
        fans: '4.1万',
        videos: '20',
        desc: 'GZH：dudu学习社',
        avatar: '📖'
    },
    {
        name: '超好运小bud',
        uid: '10912283',
        fans: '4.8万',
        videos: '28',
        desc: '结构化面试 / 申论学习',
        avatar: '🍀'
    },
    {
        name: '啾啾看齐红领巾',
        uid: '39601292',
        fans: '4.1万',
        videos: '128',
        desc: '上岸忙飞选手',
        avatar: '🐤'
    },
    {
        name: '观乾公考',
        uid: '50027260',
        fans: '7420',
        videos: '7',
        desc: '彬途教育 / 更懂粤考',
        avatar: '🏛️'
    },
    {
        name: '粤政喵-公考喵喵师姐',
        uid: '123060634',
        fans: '5.5万',
        videos: '79',
        desc: '前公务员 / 深耕广东面试申论',
        avatar: '🐱'
    }
];

// 申论最新热点（2025公开资料整理）
const SHENLUN_HOT_TOPICS = [
    {
        title: '培育发展新质生产力',
        date: '2025年',
        keywords: '科技创新 / 产业升级 / 高质量发展',
        summary: '新质生产力以科技创新为核心驱动，摆脱传统增长方式，具有高科技、高效能、高质量特征。2025年政府工作报告将其列为高质量发展核心引擎。',
        points: [
            '以科技创新引领产业创新，打通"实验室到生产线"转化堵点',
            '传统产业智能化、绿色化改造，培育壮大新兴产业',
            '布局未来产业：商业航天、低空经济、具身智能等',
            '实现高水平科技自立自强，增强第一动力'
        ],
        source: '2025年政府工作报告'
    },
    {
        title: '因地制宜发展农业新质生产力',
        date: '2025年',
        keywords: '乡村振兴 / 农业现代化 / 粮食安全',
        summary: '2025年中央一号文件首次提出"因地制宜发展农业新质生产力"，以科技创新引领先进生产要素集聚，推动农业增效益、农村增活力、农民增收入。',
        points: [
            '智慧农业：建成34个国家级智慧农业平台，植保无人机年作业超4.1亿亩',
            '种业振兴：国产白羽肉鸡打破种源完全依赖进口，良种贡献率超45%',
            '人才振兴："新农人"引领业态创新，破解城乡人才困局',
            '绿色低碳：破解资源环境约束，实现高产高效高质量'
        ],
        source: '2025年中央一号文件'
    },
    {
        title: '推进乡村全面振兴',
        date: '2025年',
        keywords: '脱贫攻坚 / 城乡融合 / 共同富裕',
        summary: '2025年全国两会期间，乡村振兴成为政策焦点。从"输血式扶贫"向"造血式振兴"跃迁，建立"监测—帮扶—化解"动态机制，确保脱贫县农村居民人均可支配收入增速持续领跑全国。',
        points: [
            '巩固脱贫攻坚成果，建立动态监测帮扶机制',
            '科技赋能：AI视觉系统、智慧农场提升生产效率',
            '产业振兴：生物育种突破种源桎梏，良种覆盖率超96%',
            '城乡融合发展，破解人才、资源双向流动难题'
        ],
        source: '2025年全国两会'
    },
    {
        title: '中国式现代化',
        date: '2025年',
        keywords: '党的二十大 / 第二个百年 / 民族复兴',
        summary: '党的二十大明确，新时代新征程党的中心任务是团结带领全国各族人民全面建成社会主义现代化强国、实现第二个百年奋斗目标，以中国式现代化全面推进中华民族伟大复兴。',
        points: [
            '中国共产党领导的社会主义现代化',
            '人口规模巨大的现代化',
            '全体人民共同富裕的现代化',
            '物质文明和精神文明相协调、人与自然和谐共生的现代化'
        ],
        source: '党的二十大报告'
    }
];

// 默认任务
const DEFAULT_TASKS = {
    daily: [
        { id: 'd1', text: '每天背英语单词20个', completed: false },
        { id: 'd2', text: '练习公基题目20题', completed: false },
        { id: 'd3', text: '练习职测题目20题', completed: false },
        { id: 'd4', text: '申论学习30分钟', completed: false }
    ],
    shenlun: []
};

// ===== 工具函数 =====
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function getTodayKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
}

// ===== 任务数据（daily / shenlun）=====
function loadTaskData() {
    const todayKey = getTodayKey();
    const stored = localStorage.getItem('workbench_tasks_' + todayKey);
    if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
    }
    const data = {};
    TASK_SECTIONS.forEach(section => {
        data[section] = (DEFAULT_TASKS[section] || []).map(t => ({ ...t, id: generateId() }));
    });
    return data;
}

function saveTaskData(data) {
    localStorage.setItem('workbench_tasks_' + getTodayKey(), JSON.stringify(data));
}

let taskData = loadTaskData();

// ===== 答题数据（gongji / zhice）=====
// 结构：{ 题id: 用户选择索引 }
function loadQuizData() {
    const stored = localStorage.getItem('workbench_quiz');
    if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
    }
    return {};
}

function saveQuizData() {
    localStorage.setItem('workbench_quiz', JSON.stringify(quizAnswers));
}

let quizAnswers = loadQuizData();

// 自定义题库
let customQuestions = loadCustomQuestions();

// 每日练习题量上限
const DAILY_LIMIT = 20;

// 获取某栏目全部题目（内置+自定义）
function getAllQuestions(section) {
    const builtin = QUESTION_BANK[section] || [];
    const custom = customQuestions[section] || [];
    return builtin.concat(custom);
}

// 知识点推断表（根据题干关键词）
const KNOWLEDGE_MAP = [
    { keywords: ['宪法', '根本制度', '国体', '政体', '人大', '人民代表大会', '公民', '权利', '自由'], topic: '宪法学', improve: '系统复习宪法总纲、公民权利义务、国家机构章节，重点记忆根本制度、国体政体、人大制度等核心条款' },
    { keywords: ['哲学', '矛盾', '量变', '质变', '实践', '真理', '物质', '意识', '辩证', '唯物'], topic: '马克思主义哲学', improve: '梳理唯物论、认识论、辩证法三大板块，重点掌握矛盾分析法、量变质变、实践与认识关系' },
    { keywords: ['经济', '商品', '价值', '货币', '通货膨胀', '市场', 'GDP', '宏观调控', '消费'], topic: '政治经济学', improve: '理解商品二因素、货币职能、宏观经济调控四大目标，结合时事掌握经济政策' },
    { keywords: ['行政', '处罚', '处分', '决策', '政府', '职能', '机关'], topic: '行政管理', improve: '区分行政处罚/处分/刑罚，掌握行政决策系统、政府职能分类及手段' },
    { keywords: ['二十大', '新质生产力', '中国式现代化', '新发展理念', '共同富裕', '乡村振兴', '一号文件'], topic: '时事政治', improve: '持续跟进二十大报告、政府工作报告、中央一号文件，建立时政笔记并定期复习' },
    { keywords: ['言语', '成语', '词语', '填入', '片段', '主旨', '概括'], topic: '言语理解与表达', improve: '积累高频成语含义，练习主旨概括题找主题句，注意关联词（但是、因此、总之）后的核心观点' },
    { keywords: ['数量', '计算', '速度', '工程', '利润', '浓度', '行程', '概率', '排列', '数列'], topic: '数量关系', improve: '掌握常考题型公式（工程、行程、利润、排列组合），训练速算技巧，学会放弃偏难题' },
    { keywords: ['判断', '推理', '三段论', '图形', '类比', '定义', '逻辑', '假言', '命题'], topic: '判断推理', improve: '牢记推理规则（逆否命题、三段论有效性），图形推理积累位置/数量/属性规律，定义判断抓关键要件' },
    { keywords: ['资料', '增长', '比重', '倍数', '平均', '百分', '同比', '环比'], topic: '资料分析', improve: '熟练增长率/比重/倍数公式，训练快速找数据和估算能力，注意时间范围和单位陷阱' },
    { keywords: ['常识', '天文', '地理', '历史', '文化', '科技', '行星', '论语', '老子'], topic: '常识判断', improve: '广泛积累人文、科技、地理常识，结合初高中教材查漏补缺，关注科技新成果' }
];

// 根据题干推断知识点
function inferKnowledge(question) {
    const text = question.question || '';
    for (const item of KNOWLEDGE_MAP) {
        if (item.keywords.some(k => text.includes(k))) {
            return item;
        }
    }
    return { topic: '综合知识', improve: '回归基础教材，系统梳理该知识点体系，建立错题本定期复盘' };
}

// 生成错误分析
function analyzeError(question, userAnswer) {
    const correctIdx = question.answer;
    const userOpt = question.options[userAnswer];
    const correctOpt = question.options[correctIdx];
    const knowledge = inferKnowledge(question);

    // 分析错误类型
    let errorType = '';
    let errorReason = '';
    if (userAnswer === correctIdx) {
        return null; // 答对不分析
    }

    // 判断错误类型
    const q = question.question || '';
    if (q.includes('不属于') || q.includes('不包括') || q.includes('错误的是') || q.includes('不正确')) {
        errorType = '审题失误';
        errorReason = `本题考查"选非"题型（题干含"不属于/不包括/错误的是"），您可能按"选是"思路作答，把正确的选项当成了答案。`;
    } else if (q.includes('下列哪项') || q.includes('下列哪个')) {
        errorType = '知识盲区';
        errorReason = `本题属于纯记忆型考点，您对"${knowledge.topic}"的具体知识点掌握不够扎实，导致无法准确判断。`;
    } else {
        errorType = '理解偏差';
        errorReason = `您选择了"${userOpt}"，而正确答案是"${correctOpt}"，说明对该知识点的理解存在偏差，可能混淆了相似概念。`;
    }

    return {
        errorType,
        errorReason,
        knowledge: knowledge.topic,
        improve: knowledge.improve
    };
}

// ===== 任务渲染 =====
function renderTasks(section) {
    const listEl = document.getElementById(section + 'TaskList');
    const tasks = taskData[section] || [];

    if (tasks.length === 0) {
        listEl.innerHTML = `
            <li class="empty-state">
                <div class="empty-state-icon">🎯</div>
                <div class="empty-state-text">暂无任务，添加一个吧！</div>
            </li>
        `;
    } else {
        listEl.innerHTML = tasks.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask('${section}', '${task.id}')"></div>
                <span class="task-text">${escapeHtml(task.text)}</span>
                <button class="btn-delete" onclick="deleteTask('${section}', '${task.id}')" title="删除">×</button>
            </li>
        `).join('');
    }
    updateProgress(section);
}

function updateProgress(section) {
    const tasks = taskData[section] || [];
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percent = total > 0 ? (completed / total * 100) : 0;
    document.getElementById(section + 'Progress').textContent = `${completed}/${total}`;
    document.getElementById(section + 'ProgressBar').style.width = percent + '%';
}

function toggleTask(section, taskId) {
    const task = taskData[section].find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTaskData(taskData);
        renderTasks(section);
    }
}

function addTask(section) {
    const input = document.getElementById(section + 'Input');
    const text = input.value.trim();
    if (!text) return;
    taskData[section].push({ id: generateId(), text, completed: false });
    saveTaskData(taskData);
    input.value = '';
    renderTasks(section);
}

function deleteTask(section, taskId) {
    taskData[section] = taskData[section].filter(t => t.id !== taskId);
    saveTaskData(taskData);
    renderTasks(section);
}

// ===== 答题渲染 =====
function renderQuiz(section) {
    const listEl = document.getElementById(section + 'TaskList');
    const allQuestions = getAllQuestions(section);

    // 每日20题限制：取已答 + 未答的前若干题，凑满20题
    const answeredIds = allQuestions.filter(q => quizAnswers[q.id] !== undefined).map(q => q.id);
    const unanswered = allQuestions.filter(q => quizAnswers[q.id] === undefined);
    // 已答的全部展示 + 未答的补到20题
    let questions;
    if (answeredIds.length >= DAILY_LIMIT) {
        questions = allQuestions.filter(q => answeredIds.includes(q.id)).slice(0, DAILY_LIMIT);
    } else {
        const need = DAILY_LIMIT - answeredIds.length;
        const answered = allQuestions.filter(q => answeredIds.includes(q.id));
        questions = answered.concat(unanswered.slice(0, need));
    }

    // 统计今日已答
    const todayAnswered = questions.filter(q => quizAnswers[q.id] !== undefined).length;

    if (allQuestions.length === 0) {
        listEl.innerHTML = `
            <li class="empty-state">
                <div class="empty-state-icon">📝</div>
                <div class="empty-state-text">题库暂无题目，点击"录入题目"添加</div>
            </li>
        `;
    } else {
        listEl.innerHTML = `
            <li class="daily-limit-tip">
                📅 今日练习：已答 <b>${todayAnswered}</b> / ${DAILY_LIMIT} 题（题库共 ${allQuestions.length} 题）
                ${todayAnswered >= DAILY_LIMIT ? '<span class="limit-done">· 今日任务已完成 🎉</span>' : ''}
            </li>
        ` + questions.map((q, idx) => {
            const userAnswer = quizAnswers[q.id];
            const answered = userAnswer !== undefined;
            const correct = answered && userAnswer === q.answer;
            const isCustom = q.id && q.id.startsWith('custom_');
            const errorAnalysis = answered && !correct ? analyzeError(q, userAnswer) : null;
            return `
                <li class="quiz-item ${answered ? 'answered' : ''}" data-id="${q.id}">
                    <div class="quiz-header">
                        <span class="quiz-num">第 ${idx + 1} 题${isCustom ? ' <span class="custom-tag">自定义</span>' : ''}</span>
                        <div class="quiz-header-right">
                            ${answered ? `<span class="quiz-result ${correct ? 'correct' : 'wrong'}">${correct ? '✓ 回答正确' : '✗ 回答错误'}</span>` : '<span class="quiz-result pending">未作答</span>'}
                            ${isCustom ? `<button class="btn-del-custom" onclick="deleteCustomQuestion('${section}','${q.id}')" title="删除此题">×</button>` : ''}
                        </div>
                    </div>
                    <div class="quiz-question">${escapeHtml(q.question)}</div>
                    <div class="quiz-options">
                        ${q.options.map((opt, i) => {
                            let cls = 'quiz-option';
                            if (answered) {
                                if (i === q.answer) cls += ' option-correct';
                                else if (i === userAnswer) cls += ' option-wrong';
                            }
                            const checked = answered && i === userAnswer ? 'checked' : '';
                            return `
                                <div class="${cls}" onclick="${answered ? '' : `selectAnswer('${section}','${q.id}',${i})`}">
                                    <span class="option-label">${String.fromCharCode(65 + i)}</span>
                                    <span class="option-text">${escapeHtml(opt)}</span>
                                    ${checked ? '<span class="option-mark">✓</span>' : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                    ${answered ? `
                        <div class="quiz-explanation">
                            <div class="explanation-row"><span class="explanation-label">正确答案：</span><b>${String.fromCharCode(65 + q.answer)}. ${escapeHtml(q.options[q.answer])}</b></div>
                            <div class="explanation-row"><span class="explanation-label">你的答案：</span>${correct ? '<span class="ans-correct">正确 ✓</span>' : `<span class="ans-wrong">错误（选了 ${String.fromCharCode(65 + userAnswer)}）</span>`}</div>
                            <div class="explanation-row"><span class="explanation-label">解析：</span><span class="explanation-text">${escapeHtml(q.explanation)}</span></div>
                            ${errorAnalysis ? `
                                <div class="error-analysis">
                                    <div class="analysis-title">🔍 错误分析与提升建议</div>
                                    <div class="analysis-grid">
                                        <div class="analysis-item">
                                            <span class="analysis-label">错误类型</span>
                                            <span class="analysis-value error-type-tag">${errorAnalysis.errorType}</span>
                                        </div>
                                        <div class="analysis-item">
                                            <span class="analysis-label">知识点</span>
                                            <span class="analysis-value knowledge-tag">${errorAnalysis.knowledge}</span>
                                        </div>
                                    </div>
                                    <div class="analysis-detail"><b>错误原因：</b>${escapeHtml(errorAnalysis.errorReason)}</div>
                                    <div class="analysis-detail"><b>提升方向：</b>${escapeHtml(errorAnalysis.improve)}</div>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                </li>
            `;
        }).join('');
    }
    updateQuizStats(section);
}

function selectAnswer(section, questionId, optionIndex) {
    quizAnswers[questionId] = optionIndex;
    saveQuizData();
    renderQuiz(section);
}

function updateQuizStats(section) {
    const allQuestions = getAllQuestions(section);
    const total = Math.min(DAILY_LIMIT, allQuestions.length);
    // 今日已答 = 该栏目所有已答题数（但展示限制为20）
    const answeredAll = allQuestions.filter(q => quizAnswers[q.id] !== undefined).length;
    const correctAll = allQuestions.filter(q => quizAnswers[q.id] !== undefined && quizAnswers[q.id] === q.answer).length;
    const answered = Math.min(answeredAll, DAILY_LIMIT);
    const correct = Math.min(correctAll, DAILY_LIMIT);
    const rate = answered > 0 ? Math.round(correct / answered * 100) : 0;

    document.getElementById(section + 'Total').textContent = total;
    document.getElementById(section + 'Answered').textContent = answered;
    document.getElementById(section + 'Correct').textContent = correct;
    document.getElementById(section + 'Rate').textContent = rate + '%';

    // 顶部进度条（今日已答/20）
    document.getElementById(section + 'Progress').textContent = `${answered}/${total}`;
    document.getElementById(section + 'ProgressBar').style.width = (total > 0 ? answered / total * 100 : 0) + '%';
}

function resetQuiz(section) {
    const questions = getAllQuestions(section);
    if (!confirm(`确定要重置${section === 'gongji' ? '公基' : '职测'}的答题进度吗？所有作答记录将清除。`)) return;
    questions.forEach(q => { delete quizAnswers[q.id]; });
    saveQuizData();
    renderQuiz(section);
}

// ===== 申论博主卡片 =====
function renderShenlunVideos() {
    // 渲染热点
    const hotList = document.getElementById('hotTopicsList');
    if (hotList) {
        hotList.innerHTML = SHENLUN_HOT_TOPICS.map((t, i) => `
            <div class="topic-card">
                <div class="topic-header">
                    <span class="topic-num">${String(i + 1).padStart(2, '0')}</span>
                    <div class="topic-title-wrap">
                        <div class="topic-title">${escapeHtml(t.title)}</div>
                        <div class="topic-keywords">${escapeHtml(t.keywords)}</div>
                    </div>
                    <span class="topic-date">${escapeHtml(t.date)}</span>
                </div>
                <div class="topic-summary">${escapeHtml(t.summary)}</div>
                <div class="topic-points">
                    ${t.points.map(p => `<div class="topic-point">• ${escapeHtml(p)}</div>`).join('')}
                </div>
                <div class="topic-source">来源：${escapeHtml(t.source)}</div>
            </div>
        `).join('');
    }

    // 渲染博主卡片
    const grid = document.getElementById('shenlunVideoGrid');
    grid.innerHTML = SHENLUN_UPS.map(up => {
        const spaceUrl = `https://space.bilibili.com/${up.uid}`;
        const searchUrl = `https://search.bilibili.com/all?keyword=${encodeURIComponent(up.name + ' 申论')}`;
        return `
            <div class="up-card">
                <div class="up-avatar">${up.avatar}</div>
                <div class="up-info">
                    <div class="up-name">${escapeHtml(up.name)}</div>
                    <div class="up-desc">${escapeHtml(up.desc)}</div>
                    <div class="up-meta">
                        <span>👥 ${up.fans}粉丝</span>
                        <span>🎬 ${up.videos}视频</span>
                    </div>
                    <div class="up-actions">
                        <a href="${spaceUrl}" target="_blank" rel="noopener" class="btn-up btn-space">主页</a>
                        <a href="${searchUrl}" target="_blank" rel="noopener" class="btn-up btn-search">申论视频</a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ===== 录入自定义题目 =====
function addCustomQuestion(section) {
    const qInput = document.getElementById(section + 'NewQ');
    const aInput = document.getElementById(section + 'NewA');
    const bInput = document.getElementById(section + 'NewB');
    const cInput = document.getElementById(section + 'NewC');
    const dInput = document.getElementById(section + 'NewD');
    const ansSelect = document.getElementById(section + 'NewAns');
    const expInput = document.getElementById(section + 'NewExp');

    const question = qInput.value.trim();
    const opts = [aInput, bInput, cInput, dInput].map(i => i.value.trim());
    const answer = parseInt(ansSelect.value);
    const explanation = expInput.value.trim() || '暂无解析';

    if (!question || opts.some(o => !o)) {
        alert('请填写题干和所有选项');
        return;
    }

    if (!customQuestions[section]) customQuestions[section] = [];
    customQuestions[section].push({
        id: 'custom_' + generateId(),
        question: question,
        options: opts,
        answer: answer,
        explanation: explanation
    });
    saveCustomQuestions(customQuestions);

    // 清空输入
    qInput.value = '';
    [aInput, bInput, cInput, dInput].forEach(i => i.value = '');
    ansSelect.value = '0';
    expInput.value = '';

    // 关闭弹窗并刷新
    document.getElementById(section + 'AddModal').style.display = 'none';
    renderQuiz(section);
}

function deleteCustomQuestion(section, questionId) {
    if (!confirm('确定删除这道自定义题目吗？')) return;
    customQuestions[section] = (customQuestions[section] || []).filter(q => q.id !== questionId);
    delete quizAnswers[questionId];
    saveCustomQuestions(customQuestions);
    saveQuizData();
    renderQuiz(section);
}

function openAddModal(section) {
    document.getElementById(section + 'AddModal').style.display = 'flex';
}

function closeAddModal(section) {
    document.getElementById(section + 'AddModal').style.display = 'none';
}

// ===== 栏目切换 =====
function switchSection(section) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === section);
    });
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.toggle('active', sec.id === section);
    });

    if (QUIZ_SECTIONS.includes(section)) {
        renderQuiz(section);
    } else if (section === 'shenlun') {
        renderShenlunVideos();
        renderTasks(section);
    } else {
        renderTasks(section);
    }
}

function showDate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('zh-CN', options);
}

// ===== 初始化 =====
function init() {
    showDate();

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => switchSection(item.dataset.section));
    });

    // 任务栏目：绑定输入
    TASK_SECTIONS.forEach(section => {
        const btn = document.getElementById(section + 'AddBtn');
        const input = document.getElementById(section + 'Input');
        if (btn && input) {
            btn.addEventListener('click', () => addTask(section));
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') addTask(section);
            });
        }
        renderTasks(section);
    });

    // 答题栏目：初始渲染
    QUIZ_SECTIONS.forEach(section => renderQuiz(section));

    switchSection('daily');
}

document.addEventListener('DOMContentLoaded', init);
