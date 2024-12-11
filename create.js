const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');

dropZone.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', handleFiles);

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const files = e.dataTransfer.files;
  handleFiles(files);
});

function handleFiles(files) {
  if (!files) {
    files = fileInput.files;
  }
  fileList.innerHTML = '';
  Array.from(files).forEach((file) => {
    const listItem = document.createElement('p');
    listItem.textContent = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
    fileList.appendChild(listItem);
  });
}
