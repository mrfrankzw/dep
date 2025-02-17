// Handle form submission
document.getElementById('deployForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const sessionId = document.getElementById('sessionId').value;
  const prefix = document.getElementById('prefix').value;

  // Show loading state
  const deployButton = document.querySelector('button');
  deployButton.disabled = true;
  deployButton.innerText = 'Deploying...';

  try {
    // Send deployment request
    const response = await fetch('/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, prefix }),
    });

    const data = await response.json();

    // Display deployment result
    if (data.success) {
      alert(`Deployment successful! App Name: ${data.appName}`);
    } else {
      alert(`Deployment failed: ${data.error}`);
    }
  } catch (error) {
    alert(`Deployment failed: ${error.message}`);
  } finally {
    // Reset button
    deployButton.disabled = false;
    deployButton.innerText = 'Deploy';
  }

  // Fetch and display logs
  fetchLogs();
});

// Fetch and display logs
const fetchLogs = async () => {
  const logsDiv = document.getElementById('logs');
  logsDiv.innerHTML = 'Loading logs...';

  try {
    const response = await fetch('/logs');
    const data = await response.json();

    if (data.success) {
      logsDiv.innerHTML = data.logs
        .map(
          (log) => `
          <div class="log-entry">
            <strong>App Name:</strong> ${log.appName || 'N/A'}<br>
            <strong>Status:</strong> ${log.status}<br>
            <strong>Timestamp:</strong> ${new Date(log.timestamp).toLocaleString()}
          </div>
        `
        )
        .join('');
    } else {
      logsDiv.innerHTML = 'Failed to load logs.';
    }
  } catch (error) {
    logsDiv.innerHTML = 'Failed to load logs.';
  }
};

// Fetch logs on page load
fetchLogs();
