// 宋宋工作台 - 最终版交互逻辑
// 整合：任务 + 小红书笔记 + 热点 + 复盘 + 公基/职测答题 + 申论

const DAILY_LIMIT = 20;

function getTodayKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}

function genId() { return Date.now().toString(36) + Math.random().toString(36).substr(2,5); }

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
}

// ===== 日期与倒计时 =====
function showDate() {
    document.getElementById('todayDate').textContent =
        new Date().toLocaleDateString('zh-CN', { year:'numeric', month:'long', day:'numeric', weekday:'long' });
}

function calcCountdown() {
    const target = new Date('2027-03-15');
    const days = Math.ceil((target - new Date()) / (1000*60*60*24));
    document.getElementById('countdown').textContent = days > 0 ? days : 0;
}

// ===== Tab切换 =====
function initTabs() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.dataset.tab;
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            item.classList.add('active');
            document.getElementById('content-' + tab).classList.add('active');

            // 渲染对应内容
            if (tab === 'exam') renderQuiz('gongji');
            if (tab === 'zhice') renderQuiz('zhice');
            if (tab === 'shenlun') renderShenlun();
        });
    });
}

// ===== 任务 =====
function loadTasks() {
    const stored = localStorage.getItem('songfinal_tasks_' + getTodayKey());
    if (stored) { try { return JSON.parse(stored); } catch(e){} }
    return [
        { id: genId(), text: '背英语单词20个', done: false },
        { id: genId(), text: '公基练习20题', done: false },
        { id: genId(), text: '职测练习20题', done: false },
        { id: genId(), text: '申论学习30分钟', done: false },
        { id: genId(), text: '时政热点阅读15分钟', done: false },
        { id: genId(), text: '小红书公考笔记15分钟', done: false }
    ];
}

function saveTasks() { localStorage.setItem('songfinal_tasks_' + getTodayKey(), JSON.stringify(tasks)); }

let tasks = loadTasks();

function renderTasks() {
    const list = document.getElementById('taskList');
    if (tasks.length === 0) {
        list.innerHTML = '<li style="justify-content:center;color:#999;padding:20px;">暂无任务</li>';
    } else {
        list.innerHTML = tasks.map(t => `
            <li class="${t.done ? 'done' : ''}">
                <div class="task-check ${t.done ? 'checked' : ''}" onclick="toggleTask('${t.id}')"></div>
                <span class="task-text">${escapeHtml(t.text)}</span>
                <button class="task-del" onclick="deleteTask('${t.id}')">×</button>
            </li>
        `).join('');
    }
    const done = tasks.filter(t => t.done).length;
    document.getElementById('taskProgress').textContent = `${done}/${tasks.length}`;
}

function addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    if (!text) return;
    tasks.push({ id: genId(), text, done: false });
    saveTasks(); input.value = ''; renderTasks();
}

function toggleTask(id) {
    const t = tasks.find(x => x.id === id);
    if (t) { t.done = !t.done; saveTasks(); renderTasks(); }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks(); renderTasks();
}

// ===== 小红书笔记 =====
function renderXhsNotes() {
    document.getElementById('xhsGrid').innerHTML = XHS_NOTES.map(n => `
        <div class="xhs-card">
            <span class="xhs-tag ${n.tagClass}">${n.tag}</span>
            <div class="xhs-title">${escapeHtml(n.title)}</div>
            <div class="xhs-author">${escapeHtml(n.author)}</div>
            <div class="xhs-content">${escapeHtml(n.content)}</div>
            <div class="xhs-points">${escapeHtml(n.points)}</div>
            <div class="xhs-stats">${n.stats}</div>
        </div>
    `).join('');
}

// ===== 热点 =====
function renderHotList() {
    document.getElementById('hotList').innerHTML = NATIONAL_HOT_TOPICS.map(h => `
        <div class="hot-item">
            <div class="hot-title">${escapeHtml(h.title)} <span style="font-size:12px;color:#999;font-weight:400">(${h.date})</span></div>
            <div class="hot-summary">${escapeHtml(h.summary)}</div>
            <div class="hot-points">${escapeHtml(h.points)}</div>
            <div class="hot-source">来源：${escapeHtml(h.source)}</div>
        </div>
    `).join('');
}

// ===== 申论 =====
function renderShenlun() {
    // 热点
    document.getElementById('hotTopicsList').innerHTML = SHENLUN_HOT_TOPICS.map((t, i) => `
        <div class="topic-card">
            <div class="topic-header">
                <span class="topic-num">${String(i + 1).padStart(2, '0')}</span>
                <div>
                    <div class="topic-title">${escapeHtml(t.title)}</div>
                    <div class="topic-keywords">${escapeHtml(t.keywords)}</div>
                </div>
            </div>
            <div class="topic-summary">${escapeHtml(t.summary)}</div>
            <div class="topic-points">${t.points.map(p => '• ' + escapeHtml(p)).join('<br>')}</div>
            <div class="topic-source">来源：${escapeHtml(t.source)}</div>
        </div>
    `).join('');

    // 博主
    document.getElementById('shenlunVideoGrid').innerHTML = SHENLUN_UPS.map(up => {
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

// ===== 复盘模块表 =====
function renderModuleTable() {
    document.getElementById('moduleTableBody').innerHTML = MODULES.map(m => `
        <tr>
            <td>${m.name}</td>
            <td><input type="number" id="mod_total_${m.key}" placeholder="0" min="0"></td>
            <td><input type="number" id="mod_correct_${m.key}" placeholder="0" min="0"></td>
            <td class="rate-cell" id="mod_rate_${m.key}">—</td>
        </tr>
    `).join('');

    MODULES.forEach(m => {
        const totalInput = document.getElementById('mod_total_' + m.key);
        const correctInput = document.getElementById('mod_correct_' + m.key);
        const rateCell = document.getElementById('mod_rate_' + m.key);
        const calc = () => {
            const total = parseInt(totalInput.value) || 0;
            const correct = parseInt(correctInput.value) || 0;
            if (total > 0) {
                const rate = Math.round(correct / total * 100);
                rateCell.textContent = rate + '%';
                rateCell.className = 'rate-cell ' + (rate < 60 ? 'rate-low' : rate < 80 ? 'rate-mid' : 'rate-high');
            } else { rateCell.textContent = '—'; rateCell.className = 'rate-cell'; }
        };
        totalInput.addEventListener('input', calc);
        correctInput.addEventListener('input', calc);
    });
}

function generateReview() {
    const moduleData = {};
    let totalAll = 0, correctAll = 0;
    MODULES.forEach(m => {
        const total = parseInt(document.getElementById('mod_total_' + m.key).value) || 0;
        const correct = parseInt(document.getElementById('mod_correct_' + m.key).value) || 0;
        moduleData[m.key] = { name: m.name, total, correct, rate: total > 0 ? Math.round(correct/total*100) : null, tips: m.tips };
        totalAll += total; correctAll += correct;
    });

    const hours = document.getElementById('reviewHours').value.trim();
    const errors = document.getElementById('reviewErrors').value.trim();
    const plan = document.getElementById('reviewPlan').value.trim();

    if (totalAll === 0 && !hours && !errors) { alert('请至少录入模块做题数据或填写学习情况'); return; }

    const overallRate = totalAll > 0 ? Math.round(correctAll / totalAll * 100) : 0;
    const weak = MODULES.map(m => moduleData[m.key]).filter(m => m.rate !== null && m.rate < 60);
    const mid = MODULES.map(m => moduleData[m.key]).filter(m => m.rate !== null && m.rate >= 60 && m.rate < 80);
    const strong = MODULES.map(m => moduleData[m.key]).filter(m => m.rate !== null && m.rate >= 80);

    let html = '<div class="review-box">';
    html += '<div class="review-title">📊 今日复盘分析报告</div>';

    if (totalAll > 0) {
        html += `<div class="review-section"><b>总体正确率：</b>${correctAll}/${totalAll} = <b style="color:${overallRate<60?'#e53935':overallRate<80?'#ef6c00':'#2e7d32'}">${overallRate}%</b>`;
        if (overallRate >= 80) html += ' 🎉 优秀！';
        else if (overallRate >= 60) html += ' 📈 还有提升空间';
        else html += ' ⚠️ 需重点加强基础';
        html += '</div>';
    }

    if (weak.length > 0) {
        html += '<div class="review-section"><b>⚠️ 薄弱模块（<60%）：</b><br>';
        weak.forEach(m => html += `<span class="weak-module">${m.name} ${m.rate}%</span>`);
        html += '<br><br><b>提升方法：</b><br>';
        weak.forEach(m => html += `• <b>${m.name}</b>：${m.tips}<br>`);
        html += '</div>';
    }

    if (mid.length > 0) {
        html += '<div class="review-section"><b>📌 中等模块（60%-80%）：</b><br>';
        mid.forEach(m => html += `<span class="weak-module" style="background:#fff3e0;color:#ef6c00">${m.name} ${m.rate}%</span>`);
        html += '<br><br>这些模块已具基础，通过专项训练可提升到80%+。建议每天投入额外30分钟针对性练习。</div>';
    }

    if (strong.length > 0) {
        html += '<div class="review-section"><b>✅ 优势模块（≥80%）：</b><br>';
        strong.forEach(m => html += `<span class="strong-module">${m.name} ${m.rate}%</span>`);
        html += '<br><br>保持手感，每周做1-2套维持水平，不必额外投入时间。</div>';
    }

    if (hours) {
        const h = parseFloat(hours);
        html += `<div class="review-section"><b>学习时长：</b>${escapeHtml(hours)}`;
        if (h >= 5) html += ' 👍 学习投入充足';
        else if (h >= 3) html += ' 📊 时长适中';
        else html += ' ⚠️ 时长偏少，建议每天3小时以上';
        html += '</div>';
    }

    if (errors) {
        html += `<div class="review-section"><b>错误原因：</b>${escapeHtml(errors)}<br><br>`;
        const errLower = errors.toLowerCase();
        let suggestions = [];
        if (errLower.includes('审题')) suggestions.push('审题失误：养成先读题干关键词的习惯，"不属于/错误的是"先圈出来');
        if (errLower.includes('时间') || errLower.includes('慢')) suggestions.push('时间不够：加强限时训练，学会跳题');
        if (errLower.includes('计算')) suggestions.push('计算错误：掌握速算技巧（截位直除、百化分）');
        if (errLower.includes('记忆') || errLower.includes('知识')) suggestions.push('知识盲区：建立错题本+知识点笔记，定期复盘');
        if (errLower.includes('粗心') || errLower.includes('马虎')) suggestions.push('粗心问题：做题时圈关键词，检查时重点看选项差异');
        if (suggestions.length === 0) suggestions.push('针对性改进：分析每道错题的具体原因，建立错题本分类管理');
        html += '<b>改进建议：</b><br>' + suggestions.map(s => '• ' + s).join('<br>');
        html += '</div>';
    }

    html += '<div class="review-section"><b>🎯 下一步优化方向：</b><br>';
    if (weak.length > 0) html += '• 重点突破薄弱模块，每天专项训练30-60分钟<br>';
    if (overallRate < 70 && overallRate > 0) html += '• 总体正确率偏低，回归基础知识点系统复习<br>';
    if (hours && parseFloat(hours) < 3) html += '• 增加学习时长，保证每天3小时以上有效学习<br>';
    html += '• 坚持错题复盘，同类错误不犯第二次<br>';
    html += '• 每周做1套完整真题，检验整体水平</div>';

    if (plan) html += `<div class="review-section"><b>📝 明日计划：</b>${escapeHtml(plan)}</div>`;
    html += '</div>';

    document.getElementById('reviewOutput').innerHTML = html;
    document.getElementById('reviewOutput').classList.add('show');
    document.getElementById('reviewOutput').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ===== 备忘录 =====
function loadMemo() {
    const stored = localStorage.getItem('songfinal_memo');
    if (stored) document.getElementById('memoText').value = stored;
}

function saveMemo() {
    localStorage.setItem('songfinal_memo', document.getElementById('memoText').value);
    alert('备忘录已保存 ✓');
}

// ===== 公基/职测答题系统 =====
function loadQuizData() {
    const stored = localStorage.getItem('workbench_quiz');
    if (stored) { try { return JSON.parse(stored); } catch(e){} }
    return {};
}

function saveQuizData() { localStorage.setItem('workbench_quiz', JSON.stringify(quizAnswers)); }

let quizAnswers = loadQuizData();

function loadCustomQuestions() {
    const stored = localStorage.getItem('workbench_custom_questions');
    if (stored) { try { return JSON.parse(stored); } catch(e){} }
    return { gongji: [], zhice: [] };
}

function saveCustomQuestions(data) { localStorage.setItem('workbench_custom_questions', JSON.stringify(data)); }

let customQuestions = loadCustomQuestions();

function getAllQuestions(section) {
    const builtin = QUESTION_BANK[section] || [];
    const custom = customQuestions[section] || [];
    return builtin.concat(custom);
}

function renderQuiz(section) {
    const listEl = document.getElementById(section + 'TaskList');
    const allQuestions = getAllQuestions(section);
    const answeredIds = allQuestions.filter(q => quizAnswers[q.id] !== undefined).map(q => q.id);
    const unanswered = allQuestions.filter(q => quizAnswers[q.id] === undefined);
    let questions;
    if (answeredIds.length >= DAILY_LIMIT) {
        questions = allQuestions.filter(q => answeredIds.includes(q.id)).slice(0, DAILY_LIMIT);
    } else {
        const need = DAILY_LIMIT - answeredIds.length;
        const answered = allQuestions.filter(q => answeredIds.includes(q.id));
        questions = answered.concat(unanswered.slice(0, need));
    }
    const todayAnswered = questions.filter(q => quizAnswers[q.id] !== undefined).length;

    const tipEl = document.getElementById(section + 'Tip');
    if (tipEl) {
        tipEl.innerHTML = `📅 今日练习：已答 <b>${todayAnswered}</b> / ${DAILY_LIMIT} 题（题库共 ${allQuestions.length} 题）${todayAnswered >= DAILY_LIMIT ? '<span style="color:#2e7d32;font-weight:600">· 今日任务已完成 🎉</span>' : ''}`;
    }

    if (allQuestions.length === 0) {
        listEl.innerHTML = '<li class="empty-state"><div style="text-align:center;padding:40px;color:#999">题库暂无题目，点击"录入题目"添加</div></li>';
    } else {
        listEl.innerHTML = questions.map((q, idx) => {
            const userAnswer = quizAnswers[q.id];
            const answered = userAnswer !== undefined;
            const correct = answered && userAnswer === q.answer;
            const isCustom = q.id && q.id.startsWith('custom_');
            const errorAnalysis = answered && !correct ? analyzeError(q, userAnswer) : null;
            return `
                <li class="quiz-item">
                    <div class="quiz-header">
                        <span class="quiz-num">第 ${idx + 1} 题${isCustom ? ' <span class="custom-tag">自定义</span>' : ''}</span>
                        <div class="quiz-header-right">
                            ${answered ? `<span class="quiz-result ${correct ? 'correct' : 'wrong'}">${correct ? '✓ 正确' : '✗ 错误'}</span>` : '<span class="quiz-result pending">未作答</span>'}
                            ${isCustom ? `<button class="btn-del-custom" onclick="deleteCustomQuestion('${section}','${q.id}')">×</button>` : ''}
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
                            return `<div class="${cls}" onclick="${answered ? '' : `selectAnswer('${section}','${q.id}',${i})`}">
                                <span class="option-label">${String.fromCharCode(65 + i)}</span>
                                <span class="option-text">${escapeHtml(opt)}</span>
                                ${checked ? '<span class="option-mark">✓</span>' : ''}
                            </div>`;
                        }).join('')}
                    </div>
                    ${answered ? `
                        <div class="quiz-explanation">
                            <div class="explanation-row"><span class="explanation-label">正确答案：</span><b>${String.fromCharCode(65 + q.answer)}. ${escapeHtml(q.options[q.answer])}</b></div>
                            <div class="explanation-row"><span class="explanation-label">你的答案：</span>${correct ? '<span class="ans-correct">正确 ✓</span>' : `<span class="ans-wrong">错误（选了 ${String.fromCharCode(65 + userAnswer)}）</span>`}</div>
                            <div class="explanation-row"><span class="explanation-label">解析：</span>${escapeHtml(q.explanation)}</div>
                            ${errorAnalysis ? `
                                <div class="error-analysis">
                                    <div class="analysis-title">🔍 错误分析与提升建议</div>
                                    <div class="analysis-grid">
                                        <div class="analysis-item"><span class="analysis-label">错误类型</span><span class="error-type-tag">${errorAnalysis.errorType}</span></div>
                                        <div class="analysis-item"><span class="analysis-label">知识点</span><span class="knowledge-tag">${errorAnalysis.knowledge}</span></div>
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
    const answeredAll = allQuestions.filter(q => quizAnswers[q.id] !== undefined).length;
    const correctAll = allQuestions.filter(q => quizAnswers[q.id] !== undefined && quizAnswers[q.id] === q.answer).length;
    const answered = Math.min(answeredAll, DAILY_LIMIT);
    const correct = Math.min(correctAll, DAILY_LIMIT);
    const rate = answered > 0 ? Math.round(correct / answered * 100) : 0;

    document.getElementById(section + 'Total').textContent = total;
    document.getElementById(section + 'Answered').textContent = answered;
    document.getElementById(section + 'Correct').textContent = correct;
    document.getElementById(section + 'Rate').textContent = rate + '%';
}

function resetQuiz(section) {
    const questions = getAllQuestions(section);
    if (!confirm(`确定重置${section === 'gongji' ? '公基' : '职测'}的答题进度？`)) return;
    questions.forEach(q => { delete quizAnswers[q.id]; });
    saveQuizData();
    renderQuiz(section);
}

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

    if (!question || opts.some(o => !o)) { alert('请填写题干和所有选项'); return; }

    if (!customQuestions[section]) customQuestions[section] = [];
    customQuestions[section].push({
        id: 'custom_' + genId(), question, options: opts, answer, explanation
    });
    saveCustomQuestions(customQuestions);

    qInput.value = ''; [aInput, bInput, cInput, dInput].forEach(i => i.value = '');
    ansSelect.value = '0'; expInput.value = '';
    document.getElementById(section + 'AddModal').style.display = 'none';
    renderQuiz(section);
}

function deleteCustomQuestion(section, questionId) {
    if (!confirm('确定删除这道自定义题目吗？')) return;
    customQuestions[section] = (customQuestions[section] || []).filter(q => q.id !== questionId);
    delete quizAnswers[questionId];
    saveCustomQuestions(customQuestions); saveQuizData();
    renderQuiz(section);
}

function openAddModal(section) { document.getElementById(section + 'AddModal').style.display = 'flex'; }
function closeAddModal(section) { document.getElementById(section + 'AddModal').style.display = 'none'; }

// 知识点推断
const KNOWLEDGE_MAP = [
    { keywords: ['宪法','根本制度','国体','政体','人大','公民','权利'], topic: '宪法学', improve: '系统复习宪法总纲、公民权利义务、国家机构章节，重点记忆根本制度、国体政体' },
    { keywords: ['哲学','矛盾','量变','质变','实践','真理','物质','意识','辩证','唯物'], topic: '马克思主义哲学', improve: '梳理唯物论、认识论、辩证法三大板块，重点掌握矛盾分析法、量变质变' },
    { keywords: ['经济','商品','价值','货币','通货膨胀','市场','GDP','宏观调控'], topic: '政治经济学', improve: '理解商品二因素、货币职能、宏观经济调控四大目标，结合时事掌握经济政策' },
    { keywords: ['行政','处罚','处分','决策','政府','职能'], topic: '行政管理', improve: '区分行政处罚/处分/刑罚，掌握行政决策系统、政府职能分类及手段' },
    { keywords: ['二十大','新质生产力','中国式现代化','新发展理念','共同富裕','乡村振兴'], topic: '时事政治', improve: '持续跟进二十大报告、政府工作报告、中央一号文件，建立时政笔记' },
    { keywords: ['言语','成语','词语','填入','片段','主旨'], topic: '言语理解与表达', improve: '积累高频成语含义，练习主旨概括题找主题句，注意关联词' },
    { keywords: ['数量','计算','速度','工程','利润','浓度','行程','概率','排列','数列'], topic: '数量关系', improve: '掌握常考题型公式（工程、行程、利润），训练速算技巧，学会放弃偏难题' },
    { keywords: ['判断','推理','三段论','图形','类比','定义','逻辑'], topic: '判断推理', improve: '牢记推理规则（逆否命题、三段论有效性），图形推理积累规律' },
    { keywords: ['资料','增长','比重','倍数','平均','百分','同比','环比'], topic: '资料分析', improve: '熟练增长率/比重/倍数公式，训练快速找数据和估算能力' },
    { keywords: ['常识','天文','地理','历史','文化','科技'], topic: '常识判断', improve: '广泛积累人文、科技、地理常识，结合初高中教材查漏补缺' }
];

function inferKnowledge(question) {
    const text = question.question || '';
    for (const item of KNOWLEDGE_MAP) {
        if (item.keywords.some(k => text.includes(k))) return item;
    }
    return { topic: '综合知识', improve: '回归基础教材，系统梳理该知识点体系，建立错题本定期复盘' };
}

function analyzeError(question, userAnswer) {
    const correctIdx = question.answer;
    const userOpt = question.options[userAnswer];
    const correctOpt = question.options[correctIdx];
    const knowledge = inferKnowledge(question);
    if (userAnswer === correctIdx) return null;

    const q = question.question || '';
    let errorType = '', errorReason = '';
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
    return { errorType, errorReason, knowledge: knowledge.topic, improve: knowledge.improve };
}

// ===== 初始化 =====
function init() {
    showDate();
    calcCountdown();
    initTabs();
    renderTasks();
    renderQuiz('gongji');
    renderQuiz('zhice');
    renderShenlun();

    document.getElementById('taskInput').addEventListener('keypress', e => {
        if (e.key === 'Enter') addTask();
    });
}

document.addEventListener('DOMContentLoaded', init);
