// 宋宋的工作台 - 交互逻辑

// ===== 日期与倒计时 =====
function showDate() {
    const now = new Date();
    document.getElementById('todayDate').textContent =
        now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
}

function calcCountdown() {
    // 2027年广东省考预计3月，按2027-03-15估算
    const target = new Date('2027-03-15');
    const now = new Date();
    const days = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    document.getElementById('countdown').textContent = days > 0 ? days : 0;
}

// ===== 每日任务 =====
function getTodayKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function loadTasks() {
    const stored = localStorage.getItem('song_tasks_' + getTodayKey());
    if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
    }
    // 默认任务
    return [
        { id: genId(), text: '背英语单词20个', done: false },
        { id: genId(), text: '公基练习20题', done: false },
        { id: genId(), text: '职测练习20题', done: false },
        { id: genId(), text: '申论学习30分钟', done: false },
        { id: genId(), text: '时政热点阅读15分钟', done: false }
    ];
}

function saveTasks(tasks) {
    localStorage.setItem('song_tasks_' + getTodayKey(), JSON.stringify(tasks));
}

let tasks = loadTasks();

function genId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function renderTasks() {
    const list = document.getElementById('taskList');
    if (tasks.length === 0) {
        list.innerHTML = '<li style="justify-content:center;color:#999;padding:20px;">暂无任务，添加一个吧</li>';
    } else {
        list.innerHTML = tasks.map(t => `
            <li class="${t.done ? 'completed' : ''}">
                <div class="task-check ${t.done ? 'done' : ''}" onclick="toggleTask('${t.id}')"></div>
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
    saveTasks(tasks);
    input.value = '';
    renderTasks();
}

function toggleTask(id) {
    const t = tasks.find(x => x.id === id);
    if (t) { t.done = !t.done; saveTasks(tasks); renderTasks(); }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks(tasks);
    renderTasks();
}

// ===== 学习总结 =====
function loadSummary() {
    const stored = localStorage.getItem('song_summary_' + getTodayKey());
    if (stored) {
        const data = JSON.parse(stored);
        document.getElementById('summaryText').value = data.text || '';
        document.getElementById('summarySavedTime').textContent = '最后保存：' + data.time;
    }
}

function saveSummary() {
    const text = document.getElementById('summaryText').value;
    const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    localStorage.setItem('song_summary_' + getTodayKey(), JSON.stringify({ text, time }));
    document.getElementById('summarySavedTime').textContent = '最后保存：' + time + ' ✓';
}

// ===== 时政热点渲染 =====
function renderHotTopics() {
    document.getElementById('nationalHotList').innerHTML = NATIONAL_HOT_TOPICS.map(h => `
        <div class="hot-item">
            <div class="hot-title">${escapeHtml(h.title)} <span style="font-size:12px;color:#999;font-weight:400">(${h.date})</span></div>
            <div class="hot-summary">${escapeHtml(h.summary)}</div>
            <div class="hot-points">${escapeHtml(h.points)}</div>
            <div class="hot-source">来源：${escapeHtml(h.source)}</div>
        </div>
    `).join('');

    document.getElementById('gdHotList').innerHTML = GD_HOT_TOPICS.map(h => `
        <div class="hot-item gd">
            <div class="hot-title">${escapeHtml(h.title)} <span style="font-size:12px;color:#999;font-weight:400">(${h.date})</span></div>
            <div class="hot-summary">${escapeHtml(h.summary)}</div>
            <div class="hot-points">${escapeHtml(h.points)}</div>
            <div class="hot-source">来源：${escapeHtml(h.source)}</div>
        </div>
    `).join('');
}

// ===== 备考技巧渲染 =====
function renderTips() {
    document.getElementById('tipsList').innerHTML = EXAM_TIPS.map(t => `
        <div class="tip-item">
            <div class="tip-title">${escapeHtml(t.title)}</div>
            <div class="tip-content">${escapeHtml(t.content)}</div>
        </div>
    `).join('');
}

// ===== 每日复盘 =====
function loadReview() {
    const stored = localStorage.getItem('song_review_' + getTodayKey());
    if (stored) {
        const data = JSON.parse(stored);
        document.getElementById('reviewHours').value = data.hours || '';
        document.getElementById('reviewContent').value = data.content || '';
        document.getElementById('reviewWeak').value = data.weak || '';
        document.getElementById('reviewPlan').value = data.plan || '';
        if (data.analysis) {
            document.getElementById('reviewOutput').innerHTML = data.analysis;
            document.getElementById('reviewOutput').classList.add('show');
        }
    }
}

function generateReview() {
    const hours = document.getElementById('reviewHours').value.trim();
    const content = document.getElementById('reviewContent').value.trim();
    const weak = document.getElementById('reviewWeak').value.trim();
    const plan = document.getElementById('reviewPlan').value.trim();

    if (!hours && !content) {
        alert('请至少填写学习时长和学习内容');
        return;
    }

    // 分析学习方向并给出优化建议
    const taskDone = tasks.filter(t => t.done).length;
    const taskTotal = tasks.length;
    const completionRate = taskTotal > 0 ? Math.round(taskDone / taskTotal * 100) : 0;

    // 生成分析
    let analysis = '<div class="review-output-box">';
    analysis += '<div class="review-output-title">📊 今日复盘分析</div>';

    // 任务完成情况
    analysis += `<div class="review-output-section"><b>任务完成度：</b>今日完成 ${taskDone}/${taskTotal} 项任务（${completionRate}%）`;
    if (completionRate === 100) analysis += '，完成度优秀，执行力强 👍';
    else if (completionRate >= 60) analysis += '，完成度良好，继续努力';
    else analysis += '，完成度偏低，需提升执行力';
    analysis += '</div>';

    // 学习时长分析
    if (hours) {
        const h = parseFloat(hours);
        analysis += `<div class="review-output-section"><b>学习时长：</b>${escapeHtml(hours)}`;
        if (h >= 4) analysis += '，时长充足，注意效率';
        else if (h >= 2) analysis += '，时长适中，可适当增加';
        else analysis += '，时长偏少，建议每天保证3小时以上';
        analysis += '</div>';
    }

    // 学习内容分析
    if (content) {
        analysis += `<div class="review-output-section"><b>学习内容：</b>${escapeHtml(content)}</div>`;
    }

    // 薄弱环节 + 优化建议
    if (weak) {
        analysis += `<div class="review-output-section"><b>薄弱环节：</b>${escapeHtml(weak)}</div>`;

        // 智能给出优化建议
        let suggestions = [];
        const weakLower = weak.toLowerCase();
        if (weakLower.includes('数量') || weakLower.includes('数学') || weakLower.includes('计算')) {
            suggestions.push('数量关系：先掌握基础题型公式（工程、行程、利润），每天专项练5题，学会取舍');
        }
        if (weakLower.includes('言语') || weakLower.includes('成语') || weakLower.includes('阅读')) {
            suggestions.push('言语理解：每天积累5个高频成语，练习找主题句，关注转折/因果关联词');
        }
        if (weakLower.includes('判断') || weakLower.includes('逻辑') || weakLower.includes('推理')) {
            suggestions.push('判断推理：整理推理规则笔记，图形推理每天练10题积累规律');
        }
        if (weakLower.includes('资料') || weakLower.includes('计算')) {
            suggestions.push('资料分析：熟记增长率/比重/倍数公式，训练速算和估算，每天1篇资料分析');
        }
        if (weakLower.includes('申论') || weakLower.includes('写作') || weakLower.includes('作文')) {
            suggestions.push('申论：每天精读1篇人民日报评论，积累金句；每周写1篇大作文');
        }
        if (weakLower.includes('常识') || weakLower.includes('时政')) {
            suggestions.push('常识/时政：每日浏览时政热点15分钟，建立时政笔记本');
        }
        if (weakLower.includes('公基') || weakLower.includes('法律') || weakLower.includes('哲学')) {
            suggestions.push('公基：分模块系统复习（法律、哲学、经济），制作思维导图，错题归因');
        }
        if (suggestions.length === 0) {
            suggestions.push('针对薄弱环节制定专项训练计划，每天固定时间攻克，每周复盘进度');
        }
        analysis += `<div class="review-output-section"><b>优化建议：</b>${suggestions.map(s => '<br>• ' + s).join('')}</div>`;
    }

    // 优化方向总结
    analysis += '<div class="review-output-section"><b>下一步优化方向：</b><br>';
    if (completionRate < 80) analysis += '• 提高任务完成率，设定每日最低学习量<br>';
    if (hours && parseFloat(hours) < 3) analysis += '• 增加有效学习时长，保证每天3小时以上<br>';
    if (weak) analysis += '• 针对薄弱环节专项突破，建立错题本<br>';
    if (!content.includes('申论') && !content.includes('作文')) analysis += '• 增加申论练习频率，每周至少1篇大作文<br>';
    analysis += '• 坚持每日复盘，持续优化学习策略</div>';

    // 明日计划
    if (plan) {
        analysis += `<div class="review-output-section"><b>明日计划：</b>${escapeHtml(plan)}</div>`;
    }

    analysis += '</div>';

    document.getElementById('reviewOutput').innerHTML = analysis;
    document.getElementById('reviewOutput').classList.add('show');

    // 保存
    localStorage.setItem('song_review_' + getTodayKey(), JSON.stringify({
        hours, content, weak, plan, analysis
    }));

    // 滚动到复盘结果
    document.getElementById('reviewOutput').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ===== 工具 =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
}

// ===== 初始化 =====
function init() {
    showDate();
    calcCountdown();
    renderTasks();
    loadSummary();
    renderHotTopics();
    renderTips();
    loadReview();

    // 回车添加任务
    document.getElementById('taskInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
}

document.addEventListener('DOMContentLoaded', init);
