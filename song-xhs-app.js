// 宋宋的工作台 - 交互逻辑

// ===== 工具 =====
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

function getDateStr(daysAgo = 0) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
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
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
        });
    });
}

// ===== 今日任务 =====
function loadTasks() {
    const stored = localStorage.getItem('songxhs_tasks_' + getTodayKey());
    if (stored) { try { return JSON.parse(stored); } catch(e){} }
    return [
        { id: genId(), text: '背英语单词20个', done: false },
        { id: genId(), text: '公基练习20题', done: false },
        { id: genId(), text: '职测练习20题', done: false },
        { id: genId(), text: '申论学习30分钟', done: false },
        { id: genId(), text: '阅读小红书公考笔记15分钟', done: false },
        { id: genId(), text: '时政热点速览10分钟', done: false }
    ];
}

function saveTasks() { localStorage.setItem('songxhs_tasks_' + getTodayKey(), JSON.stringify(tasks)); }

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
            <span class="xhs-card-tag ${n.tagClass}">${n.tag}</span>
            <div class="xhs-card-title">${escapeHtml(n.title)}</div>
            <div class="xhs-card-author">${escapeHtml(n.author)}</div>
            <div class="xhs-card-content">${escapeHtml(n.content)}</div>
            <div class="xhs-card-points">${escapeHtml(n.points)}</div>
            <div class="xhs-card-stats">${n.stats}</div>
        </div>
    `).join('');
}

// ===== 做题复盘：模块表 =====
function renderModuleTable() {
    document.getElementById('moduleTableBody').innerHTML = MODULES.map(m => `
        <tr>
            <td>${m.name}</td>
            <td><input type="number" id="mod_total_${m.key}" placeholder="0" min="0"></td>
            <td><input type="number" id="mod_correct_${m.key}" placeholder="0" min="0"></td>
            <td class="rate-cell" id="mod_rate_${m.key}">—</td>
        </tr>
    `).join('');

    // 绑定输入实时计算正确率
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
            } else {
                rateCell.textContent = '—';
                rateCell.className = 'rate-cell';
            }
        };
        totalInput.addEventListener('input', calc);
        correctInput.addEventListener('input', calc);
    });

    // 加载已存数据
    const saved = localStorage.getItem('songxhs_modules_' + getTodayKey());
    if (saved) {
        const data = JSON.parse(saved);
        MODULES.forEach(m => {
            if (data[m.key]) {
                document.getElementById('mod_total_' + m.key).value = data[m.key].total || '';
                document.getElementById('mod_correct_' + m.key).value = data[m.key].correct || '';
                document.getElementById('mod_total_' + m.key).dispatchEvent(new Event('input'));
            }
        });
    }
}

// ===== 生成复盘分析 =====
function generateReview() {
    // 收集模块数据
    const moduleData = {};
    let totalAll = 0, correctAll = 0;
    MODULES.forEach(m => {
        const total = parseInt(document.getElementById('mod_total_' + m.key).value) || 0;
        const correct = parseInt(document.getElementById('mod_correct_' + m.key).value) || 0;
        moduleData[m.key] = { name: m.name, total, correct, rate: total > 0 ? Math.round(correct/total*100) : null, tips: m.tips };
        totalAll += total;
        correctAll += correct;
    });

    const hours = document.getElementById('reviewHours').value.trim();
    const errors = document.getElementById('reviewErrors').value.trim();
    const plan = document.getElementById('reviewPlan').value.trim();

    if (totalAll === 0 && !hours && !errors) {
        alert('请至少录入模块做题数据或填写学习情况');
        return;
    }

    // 保存
    localStorage.setItem('songxhs_modules_' + getTodayKey(), JSON.stringify(moduleData));
    localStorage.setItem('songxhs_review_' + getTodayKey(), JSON.stringify({ hours, errors, plan }));

    // 分析
    const overallRate = totalAll > 0 ? Math.round(correctAll / totalAll * 100) : 0;
    const weakModules = MODULES.map(m => moduleData[m.key]).filter(m => m.rate !== null && m.rate < 60);
    const midModules = MODULES.map(m => moduleData[m.key]).filter(m => m.rate !== null && m.rate >= 60 && m.rate < 80);
    const strongModules = MODULES.map(m => moduleData[m.key]).filter(m => m.rate !== null && m.rate >= 80);

    let html = '<div class="review-box">';
    html += '<div class="review-title">📊 今日复盘分析报告</div>';

    // 总体正确率
    if (totalAll > 0) {
        html += `<div class="review-section"><b>总体正确率：</b>${correctAll}/${totalAll} = <b style="color:${overallRate<60?'#e53935':overallRate<80?'#ef6c00':'#2e7d32'}">${overallRate}%</b>`;
        if (overallRate >= 80) html += ' 🎉 优秀，保持状态！';
        else if (overallRate >= 60) html += ' 📈 还有提升空间';
        else html += ' ⚠️ 需重点加强基础';
        html += '</div>';
    }

    // 薄弱模块
    if (weakModules.length > 0) {
        html += '<div class="review-section"><b>⚠️ 薄弱模块（正确率<60%）：</b><br>';
        weakModules.forEach(m => {
            html += `<span class="weak-module">${m.name} ${m.rate}%</span>`;
        });
        html += '<br><br><b>提升方法：</b><br>';
        weakModules.forEach(m => {
            html += `• <b>${m.name}</b>：${m.tips}<br>`;
        });
        html += '</div>';
    }

    // 中等模块
    if (midModules.length > 0) {
        html += '<div class="review-section"><b>📌 中等模块（60%-80%）：</b><br>';
        midModules.forEach(m => {
            html += `<span class="weak-module" style="background:#fff3e0;color:#ef6c00">${m.name} ${m.rate}%</span>`;
        });
        html += '<br><br>这些模块已具基础，通过专项训练可提升到80%+。建议每天投入额外30分钟针对性练习。</div>';
    }

    // 优势模块
    if (strongModules.length > 0) {
        html += '<div class="review-section"><b>✅ 优势模块（≥80%）：</b><br>';
        strongModules.forEach(m => {
            html += `<span class="strong-module">${m.name} ${m.rate}%</span>`;
        });
        html += '<br><br>保持手感，每周做1-2套维持水平，不必额外投入时间。</div>';
    }

    // 学习时长
    if (hours) {
        const h = parseFloat(hours);
        html += `<div class="review-section"><b>学习时长：</b>${escapeHtml(hours)}`;
        if (h >= 5) html += ' 👍 学习投入充足';
        else if (h >= 3) html += ' 📊 时长适中，可适当增加';
        else html += ' ⚠️ 时长偏少，建议每天3小时以上';
        html += '</div>';
    }

    // 错误原因
    if (errors) {
        html += `<div class="review-section"><b>错误原因分析：</b>${escapeHtml(errors)}<br><br>`;
        // 智能匹配建议
        const errLower = errors.toLowerCase();
        let suggestions = [];
        if (errLower.includes('审题')) suggestions.push('审题失误：养成先读题干关键词的习惯，"不属于/错误的是"先圈出来');
        if (errLower.includes('时间') || errLower.includes('慢') || errLower.includes('来不及')) suggestions.push('时间不够：加强限时训练，学会跳题，超过1分钟没思路立即跳过');
        if (errLower.includes('计算')) suggestions.push('计算错误：掌握速算技巧（截位直除、百化分），减少精确计算');
        if (errLower.includes('记忆') || errLower.includes('记不住') || errLower.includes('知识')) suggestions.push('知识盲区：建立错题本+知识点笔记，定期复盘');
        if (errLower.includes('粗心') || errLower.includes('马虎')) suggestions.push('粗心问题：做题时圈关键词，检查时重点看选项差异');
        if (suggestions.length === 0) suggestions.push('针对性改进：分析每道错题的具体原因，建立错题本分类管理');
        html += '<b>改进建议：</b><br>' + suggestions.map(s => '• ' + s).join('<br>');
        html += '</div>';
    }

    // 优化方向总结
    html += '<div class="review-section"><b>🎯 下一步优化方向：</b><br>';
    if (weakModules.length > 0) html += '• 重点突破薄弱模块，每天专项训练30-60分钟<br>';
    if (overallRate < 70 && overallRate > 0) html += '• 总体正确率偏低，回归基础知识点系统复习<br>';
    if (hours && parseFloat(hours) < 3) html += '• 增加学习时长，保证每天3小时以上有效学习<br>';
    html += '• 坚持错题复盘，同类错误不犯第二次<br>';
    html += '• 每周做1套完整真题，检验整体水平</div>';

    // 明日计划
    if (plan) {
        html += `<div class="review-section"><b>📝 明日计划：</b>${escapeHtml(plan)}</div>`;
    }

    html += '</div>';

    document.getElementById('reviewOutput').innerHTML = html;
    document.getElementById('reviewOutput').classList.add('show');
    document.getElementById('reviewOutput').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ===== 学习总结 =====
function loadSummary() {
    const stored = localStorage.getItem('songxhs_summary_' + getTodayKey());
    if (stored) {
        document.getElementById('summaryText').value = JSON.parse(stored).text || '';
    }
    // 加载历史
    const historyEl = document.getElementById('summaryHistory');
    let historyHtml = '<h3>📅 历史总结</h3>';
    let found = false;
    for (let i = 1; i <= 7; i++) {
        const dateKey = getDateStr(i);
        const s = localStorage.getItem('songxhs_summary_' + dateKey);
        if (s) {
            found = true;
            const data = JSON.parse(s);
            historyHtml += `<div class="summary-item"><div class="summary-item-date">${dateKey}</div>${escapeHtml(data.text || '')}</div>`;
        }
    }
    if (!found) historyHtml += '<div class="summary-item">暂无历史总结</div>';
    historyEl.innerHTML = historyHtml;
}

function saveSummary() {
    const text = document.getElementById('summaryText').value;
    localStorage.setItem('songxhs_summary_' + getTodayKey(), JSON.stringify({ text, savedAt: new Date().toISOString() }));
    alert('总结已保存 ✓');
    loadSummary();
}

// ===== 加载复盘数据 =====
function loadReviewData() {
    const stored = localStorage.getItem('songxhs_review_' + getTodayKey());
    if (stored) {
        const data = JSON.parse(stored);
        document.getElementById('reviewHours').value = data.hours || '';
        document.getElementById('reviewErrors').value = data.errors || '';
        document.getElementById('reviewPlan').value = data.plan || '';
    }
}

// ===== 初始化 =====
function init() {
    showDate();
    calcCountdown();
    initTabs();
    renderTasks();
    renderXhsNotes();
    renderModuleTable();
    loadReviewData();
    loadSummary();

    document.getElementById('taskInput').addEventListener('keypress', e => {
        if (e.key === 'Enter') addTask();
    });
}

document.addEventListener('DOMContentLoaded', init);
