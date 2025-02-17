document.getElementById('deployBtn').addEventListener('click', async () => {
    const repoUrl = document.getElementById('repoUrl').value;
    const sessionId = document.getElementById('sessionId').value;
    const prefix = document.getElementById('prefix').value;

    if (!repoUrl || !sessionId || !prefix) {
        alert('Please fill all fields');
        return;
    }

    try {
        const response = await fetch('/deploy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                repoUrl,
                envVars: { SESSION_ID: sessionId, PREFIX: prefix },
            }),
        });

        const data = await response.json();
        alert(data.message);
        fetchLogs();
    } catch (error) {
        alert('Deployment failed');
        console.error(error);
    }
});

const fetchLogs = async () => {
    try {
        const response = await fetch('/logs');
        const logs = await response.json();
        const logsList = document.getElementById('logs');
        logsList.innerHTML = logs.map(log => `
            <li>
                <strong>Repo:</strong> ${log.repoUrl}<br>
                <strong>Status:</strong> ${log.status}<br>
                <strong>Time:</strong> ${new Date(log.timestamp).toLocaleString()}
            </li>
        `).join('');
    } catch (error) {
        console.error('Failed to fetch logs:', error);
    }
};

// Fetch logs on page load
fetchLogs();
