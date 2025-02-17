document.getElementById('deployForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const sessionId = document.getElementById('sessionId').value;
  const prefix = document.getElementById('prefix').value;

  const response = await fetch('/deploy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, prefix }),
  });

  const data = await response.json();
  document.getElementById('logs').innerText = JSON.stringify(data, null, 2);
});
