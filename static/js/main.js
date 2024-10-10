let selectedFiles = [];

function updateFileList() {
    const input = document.getElementById('file-upload');
    const fileList = document.getElementById('file-list');
    const fileInfo = document.getElementById('file-info');
    const fileUploadContainer = document.getElementById('file-upload-container');
    const cancelButton = document.getElementById('cancel-button');
    
    fileList.innerHTML = '';
    selectedFiles = Array.from(input.files);
    
    if (selectedFiles.length > 0) {
        selectedFiles.forEach((file, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0';
            listItem.textContent = file.name;
            
            const removeIcon = document.createElement('i');
            removeIcon.className = 'fas fa-trash text-red-500 cursor-pointer ml-2 hover:text-red-600 transition duration-300';
            removeIcon.onclick = function () {
                removeFile(index);
            };
            
            listItem.appendChild(removeIcon);
            fileList.appendChild(listItem);
        });
        
        fileInfo.classList.remove('hidden');
        fileUploadContainer.classList.add('hidden');
        cancelButton.classList.remove('hidden');
    }
}

function removeFile(index) {
    selectedFiles.splice(index, 1);
    const input = document.getElementById('file-upload');
    const dataTransfer = new DataTransfer();
    
    selectedFiles.forEach(file => dataTransfer.items.add(file));
    input.files = dataTransfer.files;
    
    updateFileList();
    
    if (selectedFiles.length === 0) {
        document.getElementById('file-upload-container').classList.remove('hidden');
        document.getElementById('cancel-button').classList.add('hidden');
    }
}

function cancelSelection() {
    selectedFiles = [];
    document.getElementById('file-upload').value = '';
    document.getElementById('file-info').classList.add('hidden');
    document.getElementById('file-upload-container').classList.remove('hidden');
    document.getElementById('cancel-button').classList.add('hidden');
    document.getElementById('file-list').innerHTML = '';
}

function showLoader() {
    const removeIcons = document.querySelectorAll('.fa-trash');
    removeIcons.forEach(icon => {
        icon.style.display = 'none';
    });
    
    document.getElementById('cancel-button').classList.add('hidden'); 
    document.getElementById('classify-button').classList.add('hidden');
    document.getElementById('loader').classList.remove('hidden');
    return true;
}