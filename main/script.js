const progress = document.querySelector(
  ".progress-box .progress .progress-bar"
);
const progressLabelLeft = document.querySelector(
  ".progress-box .progress-bar-details .left"
);
const progressLabelRight = document.querySelector(
  ".progress-box .progress-bar-details .right"
);

// Milestones and current target selection
const MILESTONES = [50, 75, 100];
let activeMilestoneIndex = 0; // start with first milestone (50)
let totalCompletionsYesCount = 0;

function changeWidth() {
  const target = MILESTONES[activeMilestoneIndex];
  const pct = Math.min(100, Math.floor((totalCompletionsYesCount / target) * 100));
  progress.style.width = `${pct}%`;
  progressLabelLeft.innerHTML = `${pct}% completed`;
  progressLabelRight.innerHTML = `${totalCompletionsYesCount}/${target}`;
}

// Generic numeric comparator helper
function numericCompareFactory(keyFn) {
  return (a, b) => {
    const av = parseInt(keyFn(a) || 0, 10) || 0;
    const bv = parseInt(keyFn(b) || 0, 10) || 0;
    if (av > bv) return -1;
    if (av < bv) return 1;
    return 0;
  };
}

// Default comparator: total courses completed
// Default comparator: use computed total (skill badges + arcade games)
let currentComparator = numericCompareFactory((r) => {
  const s = parseInt(r['# of Skill Badges Completed'] || 0, 10) || 0;
  const a = parseInt(r['# of Arcade Games Completed'] || 0, 10) || 0;
  return s + a;
});

const updateData = async (filter, flag) => {
  let data = await (await fetch("./data.json")).json();
  
  // Get last modified time from data.json
  try {
    const response = await fetch("./data.json");
    const lastModified = response.headers.get('Last-Modified');
    const lastUpdateEl = document.getElementById('last-update-text');
    
    if (lastModified && lastUpdateEl) {
      const date = new Date(lastModified);
      const formattedDate = date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      lastUpdateEl.textContent = `📊 Last updated: ${formattedDate} • Click "Refresh Data" to update now!`;
    }
  } catch (e) {
    console.error('Could not fetch last modified time:', e);
  }
  
  if (filter !== "") {
    data = data.filter((el) => {
      return el["User Name"] && el["User Name"].toLowerCase().includes(filter.toLowerCase());
    });
  }

  data.sort(currentComparator);

  // Reset counter each time we render
  totalCompletionsYesCount = 0;

  // Reset milestone if previous was achieved
  if (activeMilestoneIndex < MILESTONES.length - 1 && totalCompletionsYesCount >= MILESTONES[activeMilestoneIndex]) {
    activeMilestoneIndex++;
  }

  let html = "";

  const truncate = (s, n = 60) => {
    if (!s) return '';
    return s.length > n ? `<span title="${s}">${s.slice(0,n)}...` + `</span>` : s;
  };

  data.forEach((d, i) => {
    // Safe reads for preserved columns
    const redemption = d['Access Code Redemption Status'] || d['Campaign Code Redemption Status'] || '';
    const allSkill = d['All Skill Badges & Games Completed'] || d['All 3 Pathways Completed - Yes or No'] || '';
    const badgesCount = d['# of Skill Badges Completed'] || 0;
    const badgesNames = d['Names of Completed Skill Badges'] || '';
    const arcadeCount = d['# of Arcade Games Completed'] || 0;
    const arcadeNames = d['Names of Completed Arcade Games'] || '';

    const rowBackgroundColor = allSkill === 'Yes' ? '#9CFF2E' : redemption === 'No' ? '#FF5D5D' : '';

    // Determine completion according to new rule: at least 19 skill badges and >=1 arcade game
    const badgesNumeric = parseInt(badgesCount, 10) || 0;
    const arcadeNumeric = parseInt(arcadeCount, 10) || 0;
    const completedByRule = badgesNumeric >= 19 && arcadeNumeric >= 1;

    if (completedByRule) {
      totalCompletionsYesCount++;
    }

    html += `<tr style="background-color: ${rowBackgroundColor};">
                  <th>${i + 1}</th>
                  <td><a href="${d["Google Cloud Skills Boost Profile URL"] || '#'}" target="_blank" style="color:black;">${d["User Name"] || ''}</a></td>
                  <td>${redemption}</td>
                  <td>${allSkill}</td>
                  <td>${badgesCount}</td>
                  <td>${truncate(badgesNames)}</td>
                  <td>${arcadeCount}</td>
                  <td>${truncate(arcadeNames)}</td>
                  <td>${d["Gen AI Arcade Game Completion"] === "1" ? "💯" : "❌"}</td>
                  <td>${(parseInt(badgesCount,10)||0) + (parseInt(arcadeCount,10)||0)}</td>
    </tr>`;
  });

  console.log("Completions (>=19 badges + >=1 arcade):", totalCompletionsYesCount);

  // After counting, auto-advance milestone while possible
  while (activeMilestoneIndex < MILESTONES.length - 1 && totalCompletionsYesCount >= MILESTONES[activeMilestoneIndex]) {
    activeMilestoneIndex++;
  }

  // Update milestone UI
  const milestoneLabelEl = document.getElementById('milestone-label');
  const milestoneStatusEl = document.getElementById('milestone-status');
  const activeTarget = MILESTONES[activeMilestoneIndex];
  if (milestoneLabelEl) milestoneLabelEl.textContent = `Active milestone: ${activeTarget}`;
  if (milestoneStatusEl) {
    if (totalCompletionsYesCount >= activeTarget) {
      milestoneStatusEl.textContent = `Reached ${activeTarget}!`;
    } else {
      milestoneStatusEl.textContent = `${totalCompletionsYesCount}/${activeTarget} completions`;
    }
  }

  if (flag) changeWidth();
  document.getElementById("gccp_body").innerHTML = html;
};

updateData("", true);
const input = document.getElementById("input");
input.addEventListener("input", () => {
  updateData(input.value, false);
});

// Wire the sort-select control
const sortSelect = document.getElementById('sort-select');
if (sortSelect) {
  sortSelect.addEventListener('change', () => {
    const val = sortSelect.value;
    if (val === 'courses') {
      currentComparator = numericCompareFactory((r) => r['# of Courses Completed']);
    } else if (val === 'totalBadges') {
      // sum of skill + arcade
      currentComparator = numericCompareFactory((r) => {
        const s = parseInt(r['# of Skill Badges Completed'] || 0, 10) || 0;
        const a = parseInt(r['# of Arcade Games Completed'] || 0, 10) || 0;
        return s + a;
      });
    } else if (val === 'skill') {
      currentComparator = numericCompareFactory((r) => r['# of Skill Badges Completed']);
    } else if (val === 'arcade') {
      currentComparator = numericCompareFactory((r) => r['# of Arcade Games Completed']);
    }
    // re-render with new sort
    updateData(input.value, false);
  });
}

// Refresh button handler
const refreshBtn = document.getElementById('refresh-btn');
const refreshStatus = document.getElementById('refresh-status');

if (refreshBtn && refreshStatus) {
  refreshBtn.addEventListener('click', async () => {
    refreshBtn.disabled = true;
    refreshStatus.textContent = '🔄 Refreshing data...';
    refreshStatus.style.color = '#4285f4';
    
    try {
      const response = await fetch('http://localhost:5001/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        refreshStatus.textContent = '✅ Data refreshed successfully!';
        refreshStatus.style.color = '#0f9d58';
        
        // Reload the data from data.json and update timestamp
        setTimeout(() => {
          updateData(input.value, true);
          
          // Update the last modified timestamp
          const lastUpdateEl = document.getElementById('last-update-text');
          if (lastUpdateEl) {
            const now = new Date();
            const formattedDate = now.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            });
            lastUpdateEl.textContent = `📊 Last updated: ${formattedDate} • Click "Refresh Data" to update now!`;
          }
          
          refreshStatus.textContent = '';
        }, 2000);
      } else {
        refreshStatus.textContent = '❌ Refresh failed: ' + (result.error || 'Unknown error');
        refreshStatus.style.color = '#db4437';
      }
    } catch (error) {
      refreshStatus.textContent = '❌ Could not connect to refresh server. Make sure it\'s running!';
      refreshStatus.style.color = '#db4437';
      console.error('Refresh error:', error);
    } finally {
      refreshBtn.disabled = false;
    }
  });
}
