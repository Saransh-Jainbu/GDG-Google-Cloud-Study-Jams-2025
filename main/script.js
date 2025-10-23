const progress = document.querySelector(".progress-bar");
const progressLabelLeft = document.querySelector(".progress-label.left");
const progressLabelRight = document.querySelector(".progress-label.right");

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

const updateData = async (filter, flag, bustCache = false) => {
  try {
    // Add cache-busting parameter if needed
    const cacheBuster = bustCache ? `?t=${Date.now()}` : '';
    
    // Determine data source based on environment
    let dataUrl;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Local development - use local data.json
      dataUrl = `./data.json${cacheBuster}`;
    } else {
      // Production - use backend API
      dataUrl = 'https://gdg-tracker-backend.onrender.com/data';
    }
    
    console.log('Fetching data from:', dataUrl);
    const response = await fetch(dataUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    let data = await response.json();
    console.log('Data loaded successfully:', data.length, 'records');
    
    // Get last modified time from data.json
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
    } else if (lastUpdateEl) {
      // Fallback: show current time if Last-Modified header is not available
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

    function truncate(str, maxLen = 80) {
      if (!str) return "";
      return str.length > maxLen ? str.substring(0, maxLen) + "..." : str;
    }

    data.forEach((d, i) => {
      const userName = d["User Name"] || "";
      const profileUrl = d["Google Cloud Skills Boost Profile URL"] || "";
      const accessCode = d["Access Code Redemption Status"] === "Yes" ? "✅" : "❌";
      
      // Parse badges
      const badgesCount = d["# of Skill Badges Completed"] || "0";
      const badgesList = d["Names of Completed Skill Badges"] || "";
      
      // Parse arcade games
      const arcadeCount = d["# of Arcade Games Completed"] || "0";
      const arcadeList = d["Names of Completed Arcade Games"] || "";
      
      // Process badge names
      const badgeNames = badgesList.split(',').map(name => name.trim()).filter(name => name).join(', ');
      const arcadeNames = arcadeList.split(',').map(name => name.trim()).filter(name => name).join(', ');
      
      // Check completion criteria
      const skillBadges = parseInt(badgesCount, 10) || 0;
      const arcadeGames = parseInt(arcadeCount, 10) || 0;
      const isCompleted = skillBadges >= 19 && arcadeGames >= 1;
      
      if (isCompleted) {
        totalCompletionsYesCount++;
      }
      
      const completedSymbol = isCompleted ? "✅" : "❌";

      html += `<tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 text-center font-medium text-gray-600">${i + 1}</td>
                    <td class="px-4 py-3">
                      <a href="${profileUrl}" target="_blank" class="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                        ${userName}
                      </a>
                    </td>
                    <td class="px-4 py-3 text-center text-xl">${accessCode}</td>
                    <td class="px-4 py-3 text-center text-xl">${completedSymbol}</td>
                    <td class="px-4 py-3 text-center font-semibold text-blue-600">${badgesCount}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">${truncate(badgeNames)}</td>
                    <td class="px-4 py-3 text-center font-semibold text-purple-600">${arcadeCount}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">${truncate(arcadeNames)}</td>
                    <td class="px-4 py-3 text-center text-xl">${d["Gen AI Arcade Game Completion"] === "1" ? "💯" : "❌"}</td>
                    <td class="px-4 py-3 text-center font-bold text-lg text-gray-800">${(parseInt(badgesCount,10)||0) + (parseInt(arcadeCount,10)||0)}</td>
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
    
  } catch (error) {
    console.error('Error loading data:', error);
    const tbody = document.getElementById("gccp_body");
    const lastUpdateEl = document.getElementById('last-update-text');
    
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="px-4 py-8 text-center">
            <div class="text-red-600 font-semibold mb-2">
              ❌ Failed to load data
            </div>
            <div class="text-gray-600 text-sm">
              Error: ${error.message}<br>
              Please check browser console for details.
            </div>
          </td>
        </tr>
      `;
    }
    
    if (lastUpdateEl) {
      lastUpdateEl.innerHTML = `<span class="text-red-600">❌ Error loading data: ${error.message}</span>`;
    }
  }
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
    // Re-render data with new sort
    updateData(input.value, false);
  });
}

// Refresh functionality
const refreshBtn = document.getElementById('refresh-btn');
const refreshIcon = document.getElementById('refresh-icon');
const refreshText = document.getElementById('refresh-text');
const refreshStatus = document.getElementById('refresh-status');

if (refreshBtn) {
  refreshBtn.addEventListener('click', async () => {
    // Disable button during refresh
    refreshBtn.disabled = true;
    refreshIcon.classList.add('spinner');
    refreshText.textContent = 'Refreshing...';
    
    // Show loading status with animation
    refreshStatus.innerHTML = '<div class="slide-in pulse">🔄 Fetching latest data from Google Cloud Skills Boost...</div>';
    refreshStatus.style.color = '#4285f4';
    
    try {
      const backendUrl = window.CONFIG.getBackendUrl();
      const response = await fetch(`${backendUrl}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Show success message
        refreshStatus.innerHTML = '<div class="slide-in">✅ Data refreshed successfully! Updating leaderboard...</div>';
        refreshStatus.style.color = '#0f9d58';
        
        // Reload the data from data.json with cache-busting
        setTimeout(() => {
          updateData("", true, true);
          refreshStatus.innerHTML = '<div class="slide-in">🎉 Leaderboard updated with latest data!</div>';
        }, 1000);
        
      } else {
        refreshStatus.innerHTML = `<div class="slide-in">❌ Refresh failed: ${result.error}</div>`;
        refreshStatus.style.color = '#d93025';
      }
      
    } catch (error) {
      console.error('Refresh error:', error);
      refreshStatus.innerHTML = '<div class="slide-in">❌ Could not connect to refresh server. Make sure the backend service is running!</div>';
      refreshStatus.style.color = '#d93025';
    } finally {
      // Re-enable button
      refreshBtn.disabled = false;
      refreshIcon.classList.remove('spinner');
      refreshText.textContent = 'Refresh Data';
      
      // Clear status after 5 seconds
      setTimeout(() => {
        refreshStatus.innerHTML = '';
      }, 5000);
    }
  });
}