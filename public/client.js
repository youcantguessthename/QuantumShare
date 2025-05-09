const socket = io();
let username = '';

document.getElementById('login-btn').addEventListener('click', () => {
  username = document.getElementById('username').value.trim();
  if (!username) return alert('Enter a valid pseudonym');
  socket.emit('register', username);
});

socket.on('error', (message) => alert('Error: ' + message));

socket.on('registered', () => {
  document.querySelector('.login-section').classList.add('hidden');
  document.querySelector('.upload-section').classList.remove('hidden');
});

socket.on('user-connected', (name) => {
  if (name === username) return;
  const ul = document.getElementById('user-list');
  const li = document.createElement('li');
  li.textContent = name;
  li.setAttribute('data-username', name);
  ul.appendChild(li);

  const select = document.getElementById('recipient-select');
  const opt = document.createElement('option');
  opt.value = name;
  opt.textContent = name;
  select.appendChild(opt);
});

socket.on('user-disconnected', (name) => {
  const ul = document.getElementById('user-list');
  ul.querySelectorAll('li').forEach(li => {
    if (li.getAttribute('data-username') === name) li.remove();
  });

  const select = document.getElementById('recipient-select');
  [...select.options].forEach(opt => {
    if (opt.value === name) opt.remove();
  });
});

socket.on('receive-file', ({ from, filename, filedata }) => {
  const container = document.getElementById('notification');
  container.classList.remove('hidden');
  container.innerHTML = `
    <p><strong>${from}</strong> sent you a file: <em>${filename}</em></p>
    <button id="preview-btn">🔍 Preview</button>
    <button id="download-btn">💾 Download</button>
    <button id="ignore-btn">❌ Ignore</button>
    <div id="preview-area" style="margin-top:10px;"></div>
  `;

  const blob = new Blob([Uint8Array.from(atob(filedata), c => c.charCodeAt(0))]);
  const url = URL.createObjectURL(blob);

  document.getElementById('preview-btn').onclick = () => {
    const preview = document.getElementById('preview-area');
    preview.innerHTML = '';
    if (filename.match(/\.(jpg|jpeg|png|gif)$/i)) {
      const img = document.createElement('img');
      img.src = url;
      img.style.maxWidth = '100%';
      preview.appendChild(img);
    } else if (filename.match(/\.pdf$/i)) {
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.style.width = '100%';
      iframe.style.height = '400px';
      preview.appendChild(iframe);
    } else {
      const note = document.createElement('p');
      note.textContent = 'No preview available.';
      preview.appendChild(note);
    }
  };

  document.getElementById('download-btn').onclick = () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  document.getElementById('ignore-btn').onclick = () => {
    container.innerHTML = '';
    container.classList.add('hidden');
  };
});

document.getElementById('send-btn').addEventListener('click', () => {
  const fileInput = document.getElementById('file-input');
  const recipient = document.getElementById('recipient-select').value;
  if (!fileInput.files.length) return alert('No file selected');
  if (!recipient) return alert('Select a recipient first');

  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    const base64data = reader.result.split(',')[1];
    socket.emit('send-file', {
      to: recipient,
      filename: file.name,
      filedata: base64data
    });
    document.getElementById('progress-text').textContent = `Sent ${file.name} to ${recipient}`;
  };
  reader.readAsDataURL(file);
});

// Theme toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const icon = document.getElementById('theme-toggle');
  icon.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});

// Language toggle
document.getElementById('language-select').addEventListener('change', (e) => {
  const lang = e.target.value;
  document.querySelectorAll('[data-en]').forEach(el => {
    el.textContent = el.getAttribute('data-' + lang);
  });
});
